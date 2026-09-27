/*
 * XB OJ 账号系统
 * ------------------------------------------------------------
 * 两种模式，页面会自动选择：
 *
 *   1) local 模式（默认，零配置，开箱即用）
 *      账号存在浏览器 localStorage 里，注册时校验邮箱格式，
 *      密码用「随机盐 + SHA-256」哈希后存储（不明文保存）。
 *      优点：不用注册任何第三方服务，立刻可用。
 *      缺点：换浏览器 / 换设备账号就没了；邮箱不验证真实性。
 *
 *   2) supabase 模式（可选，需要你自己申请一个免费项目）
 *      真正的服务端账号：跨设备同步、Supabase 自动发送验证邮件、
 *      密码由服务端 bcrypt 处理，前端根本碰不到密码原文。
 *      申请地址 https://supabase.com ，免费额度足够个人使用。
 *      注意：国内访问 *.supabase.co 网络情况不稳定，连不上时
 *      页面会自动退回 local 模式，不会让你卡在登录界面。
 */

const AUTH = (function () {

  const K_USERS = 'xboj.users';
  const K_SESSION = 'xboj.session';
  const K_CFG = 'xboj.authcfg';

  const DEFAULT_CFG = {
    driver: 'local',
    supabaseUrl: '',
    supabaseKey: ''
  };

  let cfg = loadCfg();
  let session = load(K_SESSION, null);
  let sb = null;
  let sdkHost = '';
  const listeners = [];

  /* ---------- 基础工具 ---------- */
  function load(k, fb) {
    try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; }
    catch (e) { return fb; }
  }
  function save(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  function uid() {
    return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function randHex(n) {
    const a = new Uint8Array(n);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
    else for (let i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
    return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  function validEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());
  }

  /* ---------- 密码哈希 ---------- */
  function weakHash(str) {
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 ^= c; h1 = Math.imul(h1, 16777619) >>> 0;
      h2 = (Math.imul(h2, 31) + c) >>> 0;
    }
    return ('00000000' + h1.toString(16)).slice(-8) +
           ('00000000' + h2.toString(16)).slice(-8);
  }
  async function hashPassword(pw, salt) {
    const raw = salt + '::' + pw;
    if (window.crypto && crypto.subtle && window.isSecureContext) {
      try {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) { /* 落到弱哈希 */ }
    }
    return weakHash(raw);
  }

  /* ---------- 会话 ---------- */
  function emit() { listeners.forEach(f => { try { f(current()); } catch (e) {} }); }
  function current() { return session; }
  function isSupabase() {
    return !!(cfg.driver === 'supabase' && cfg.supabaseUrl && cfg.supabaseKey);
  }

  /* ---------- 动态加载 Supabase SDK ---------- */
  /* 多个 CDN 依次尝试，任一成功即可 */
  const SDK_CDNS = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
    'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
  ];

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = url;
      s.onload = () => resolve(url);
      s.onerror = () => reject(new Error('加载失败'));
      document.head.appendChild(s);
    });
  }

  function loadSupabase() {
    return new Promise((resolve, reject) => {
      if (sb) return resolve(sb);
      const make = () => {
        if (!window.supabase || !window.supabase.createClient) return false;
        sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
        return true;
      };
      if (make()) return resolve(sb);

      let i = 0;
      const tried = [];
      const next = () => {
        if (i >= SDK_CDNS.length) {
          return reject(new Error('SDK 加载失败（已尝试 ' + SDK_CDNS.length + ' 个 CDN）：' + tried.join(' | ')));
        }
        const url = SDK_CDNS[i++];
        const host = url.split('/')[2];
        loadScript(url).then(() => {
          if (make()) { sdkHost = host; resolve(sb); }
          else { tried.push(host + ' 内容异常'); next(); }
        }).catch(() => { tried.push(host + ' 连不上'); next(); });
      };
      next();
    });
  }

  /* 一键诊断：把每一步的结果都摆出来，方便定位问题 */
  async function diagnose() {
    const out = {
      mode: cfg.driver,
      url: cfg.supabaseUrl || '(未填)',
      hasKey: !!cfg.supabaseKey,
      sdk: '未加载',
      sdkHost: sdkHost || '-',
      ping: '-',
      detail: ''
    };
    if (!isSupabase()) {
      out.detail = '当前是本地账号模式，不会去连 Supabase。要在上面的「账号模式」里选 Supabase 并填好地址和 key。';
      return out;
    }
    if (!/^https:\/\/.+\.supabase\.co\/?$/.test(cfg.supabaseUrl.trim())) {
      out.detail = 'Project URL 格式看起来不对，应该长这样：https://abcdefgh.supabase.co';
      return out;
    }
    if (location.protocol === 'file:') {
      out.detail = '当前页面是用 file:// 直接打开的，Supabase 会拒绝这种来源，注册一定会失败。' +
                   '请改用本地服务器：在本目录执行 python -m http.server 8123，然后访问 http://localhost:8123';
      return out;
    }
    try {
      const c = await loadSupabase();
      out.sdk = '已加载';
      out.detail = 'SDK 正常。';
    } catch (e) {
      out.detail = 'SDK 问题：' + e.message;
      return out;
    }
    try {
      const t0 = Date.now();
      const res = await fetch(cfg.supabaseUrl.replace(/\/$/, '') + '/auth/v1/settings', {
        headers: { apikey: cfg.supabaseKey }
      });
      out.ping = (Date.now() - t0) + ' ms / HTTP ' + res.status;
      if (res.ok) {
        const j = await res.json();
        const emailOn = j.external && j.external.email;
        const signupOn = !j.disable_signup;
        out.detail = '项目连通。邮箱登录 ' + (emailOn ? '已开启' : '未开启') +
                     '，允许注册 ' + (signupOn ? '是' : '否') +
                     '，需要邮件验证 ' + (j.mailer_autoconfirm ? '否' : '是');
        if (!emailOn) out.detail += ' —— 请去 Supabase 后台 Authentication → Providers → Email 打开';
        if (!signupOn) out.detail += ' —— 项目当前禁止新用户注册';
      } else {
        const t = await res.text();
        out.detail = '项目返回 HTTP ' + res.status + '：' + t.slice(0, 200);
      }
    } catch (e) {
      out.detail = '连不上项目：' + e.message;
    }
    return out;
  }

  /* ---------- 注册 ---------- */
  async function register(email, password, nick) {
    email = String(email || '').trim();
    if (!validEmail(email)) return { ok: false, msg: '邮箱格式不正确，请检查' };
    if (!password || password.length < 6) return { ok: false, msg: '密码至少 6 位' };

    if (isSupabase()) {
      try {
        const c = await loadSupabase();
        const opts = { data: { nick: nick || email.split('@')[0] } };
        /* 用 file:// 打开页面时 location.href 不是合法的跳转地址，
           传给它会被 Supabase 直接拒绝，所以只在 http/https 下才设置 */
        if (/^https?:$/.test(location.protocol)) opts.emailRedirectTo = location.href;
        const r = await c.auth.signUp({ email, password, options: opts });
        if (r.error) return { ok: false, msg: r.error.message };
        if (r.data && r.data.user && r.data.user.identities && r.data.user.identities.length === 0) {
          return { ok: false, msg: '这个邮箱已经注册过了，请直接登录' };
        }
        return { ok: true, needVerify: true, msg: '注册成功！请到邮箱点开验证邮件完成激活。' };
      } catch (e) {
        return { ok: false, msg: e.message + '（可改用本地账号模式）' };
      }
    }

    /* local 模式 */
    const users = load(K_USERS, []);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, msg: '这个邮箱已经注册过了，请直接登录' };
    }
    const salt = randHex(16);
    const hash = await hashPassword(password, salt);
    const user = {
      id: uid(),
      email,
      nick: nick || email.split('@')[0],
      salt,
      hash,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    save(K_USERS, users);
    session = { id: user.id, email: user.email, nick: user.nick, mode: 'local' };
    save(K_SESSION, session);
    emit();
    return { ok: true, user: session };
  }

  /* ---------- 登录 ---------- */
  async function login(email, password) {
    email = String(email || '').trim();
    if (!validEmail(email)) return { ok: false, msg: '邮箱格式不正确，请检查' };
    if (!password) return { ok: false, msg: '请输入密码' };

    if (isSupabase()) {
      try {
        const c = await loadSupabase();
        const r = await c.auth.signInWithPassword({ email, password });
        if (r.error) {
          if (/not confirmed|confirm/i.test(r.error.message)) {
            return { ok: false, msg: '邮箱还没验证，请先去邮箱点开验证邮件' };
          }
          return { ok: false, msg: '邮箱或密码不正确' };
        }
        const u = r.data.user;
        session = {
          id: u.id,
          email: u.email,
          nick: (u.user_metadata && u.user_metadata.nick) || u.email.split('@')[0],
          mode: 'supabase'
        };
        save(K_SESSION, session);
        emit();
        return { ok: true, user: session };
      } catch (e) {
        return { ok: false, msg: e.message };
      }
    }

    /* local 模式 */
    const users = load(K_USERS, []);
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return { ok: false, msg: '这个邮箱还没注册' };
    const hash = await hashPassword(password, u.salt);
    if (hash !== u.hash) return { ok: false, msg: '邮箱或密码不正确' };
    session = { id: u.id, email: u.email, nick: u.nick, mode: 'local' };
    save(K_SESSION, session);
    emit();
    return { ok: true, user: session };
  }

  /* ---------- 登出 ---------- */
  async function logout() {
    if (isSupabase() && sb) { try { await sb.auth.signOut(); } catch (e) {} }
    session = null;
    try { localStorage.removeItem(K_SESSION); } catch (e) {}
    emit();
  }

  /* ---------- 初始化：Supabase 模式下恢复会话 ---------- */
  async function init() {
    if (!isSupabase()) return;
    try {
      const c = await loadSupabase();
      const r = await c.auth.getSession();
      const s = r.data && r.data.session;
      if (s && s.user) {
        session = {
          id: s.user.id,
          email: s.user.email,
          nick: (s.user.user_metadata && s.user.user_metadata.nick) || s.user.email.split('@')[0],
          mode: 'supabase'
        };
        save(K_SESSION, session);
      } else if (session && session.mode === 'supabase') {
        session = null;
      }
    } catch (e) {
      /* 连不上就退回本地模式，让页面照样能用 */
      if (session && session.mode === 'supabase') session = null;
    }
    emit();
  }

  /* ---------- 配置 ---------- */
  function loadCfg() { return Object.assign({}, DEFAULT_CFG, load(K_CFG, {})); }
  function getCfg() { return Object.assign({}, cfg); }
  function setCfg(next) {
    cfg = Object.assign({}, DEFAULT_CFG, next);
    save(K_CFG, cfg);
    sb = null;
    init();
  }

  /* ---------- 数据分区：不同账号的做题记录互不干扰 ---------- */
  function scope() { return session && session.id ? session.id : 'guest'; }

  return {
    init, current, register, login, logout, diagnose,
    getCfg, setCfg, isSupabase, scope, validEmail,
    onChange(f) { listeners.push(f); }
  };
})();
