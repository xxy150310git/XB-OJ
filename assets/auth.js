/*
 * XB OJ 账号系统（Supabase 版）
 * ------------------------------------------------------------
 * 账号、密码全部由 Supabase 服务端保管，前端碰不到密码原文。
 * 注册后需要点开邮箱里的验证邮件才能登录。
 *
 * 角色分三级：
 *   owner  主理人 —— 最高权限，能改任何人的角色、封禁任何人
 *   admin  管理员 —— 能看用户列表，但不能改角色
 *   user   普通用户 —— 只能管自己
 *
 * 角色存在数据库的 profiles 表里，由 RLS 策略保护，
 * 前端改不了别人——因为服务端会拒绝。
 */

const AUTH = (function () {

  const K_CFG = 'xboj.authcfg';
  const SDK_CDNS = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
    'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
  ];

  let cfg = loadCfg();
  let sb = null;
  let sdkHost = '';
  let session = null;
  const listeners = [];

  /* ---------- 基础工具 ---------- */
  function load(k, fb) {
    try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; }
    catch (e) { return fb; }
  }
  function save(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  function validEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());
  }
  function emit() { listeners.forEach(f => { try { f(current()); } catch (e) {} }); }
  function current() { return session; }
  function isOwner() { return !!session && session.role === 'owner'; }
  function isAdmin() { return !!session && (session.role === 'owner' || session.role === 'admin'); }
  function scope() { return session && session.id ? session.id : 'guest'; }

  function loadCfg() {
    const saved = load(K_CFG, {});
    return {
      url: saved.url || SITE_CONFIG.supabaseUrl,
      key: saved.key || SITE_CONFIG.supabaseKey
    };
  }
  function getCfg() { return { driver: 'supabase', supabaseUrl: cfg.url, supabaseKey: cfg.key }; }
  function setCfg(next) {
    cfg = {
      url: (next && (next.supabaseUrl || next.url)) || cfg.url,
      key: (next && (next.supabaseKey || next.key)) || cfg.key
    };
    save(K_CFG, cfg);
    sb = null;
    init();
  }
  function isSupabase() { return !!cfg.url && !!cfg.key; }

  /* ---------- 加载 SDK ---------- */
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
        sb = window.supabase.createClient(cfg.url, cfg.key);
        return true;
      };
      if (make()) return resolve(sb);
      let i = 0;
      const tried = [];
      const next = () => {
        if (i >= SDK_CDNS.length) {
          return reject(new Error('SDK 加载失败（已试 ' + SDK_CDNS.length + ' 个 CDN）：' + tried.join(' | ')));
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

  /* ---------- 读取用户资料（角色、封禁状态） ---------- */
  async function fetchProfile(user) {
    const fallback = {
      id: user.id,
      email: user.email,
      nick: (user.user_metadata && user.user_metadata.nick) || String(user.email).split('@')[0],
      role: 'user',
      banned: false,
      profileMissing: true
    };
    try {
      const r = await sb.from('profiles')
        .select('id,email,nick,role,banned,created_at')
        .eq('id', user.id).single();
      if (r.error || !r.data) return fallback;
      return Object.assign({}, r.data, { email: r.data.email || user.email, profileMissing: false });
    } catch (e) {
      return fallback;
    }
  }

  /* 被封禁的人直接踢下线 */
  async function kickIfBanned(p) {
    if (p && p.banned) {
      try { await sb.auth.signOut(); } catch (e) {}
      session = null;
      return true;
    }
    return false;
  }

  /* ---------- 注册 ---------- */
  async function register(email, password, nick) {
    email = String(email || '').trim();
    if (!validEmail(email)) return { ok: false, msg: '邮箱格式不正确，请检查' };
    if (!password || password.length < 6) return { ok: false, msg: '密码至少 6 位' };
    try {
      const c = await loadSupabase();
      const opts = { data: { nick: nick || email.split('@')[0] } };
      if (/^https?:$/.test(location.protocol)) opts.emailRedirectTo = location.href;
      const r = await c.auth.signUp({ email, password, options: opts });
      if (r.error) return { ok: false, msg: r.error.message };
      if (r.data && r.data.user && r.data.user.identities && r.data.user.identities.length === 0) {
        return { ok: false, msg: '这个邮箱已经注册过了，请直接登录' };
      }
      if (r.data && r.data.session && r.data.session.user) {
        const p = await fetchProfile(r.data.session.user);
        if (await kickIfBanned(p)) return { ok: false, msg: '这个账号已被停用' };
        session = p;
        emit();
        return { ok: true, user: session };
      }
      return { ok: true, needVerify: true, msg: '注册成功！请先到邮箱点开验证邮件，然后回来登录。' };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  /* ---------- 登录 ---------- */
  async function login(email, password) {
    email = String(email || '').trim();
    if (!validEmail(email)) return { ok: false, msg: '邮箱格式不正确，请检查' };
    if (!password) return { ok: false, msg: '请输入密码' };
    try {
      const c = await loadSupabase();
      const r = await c.auth.signInWithPassword({ email, password });
      if (r.error) {
        if (/not confirmed|confirm/i.test(r.error.message)) {
          return { ok: false, msg: '邮箱还没验证，请先去邮箱点开验证邮件' };
        }
        if (/invalid login/i.test(r.error.message)) {
          return { ok: false, msg: '邮箱或密码不正确' };
        }
        return { ok: false, msg: r.error.message };
      }
      const p = await fetchProfile(r.data.user);
      if (await kickIfBanned(p)) return { ok: false, msg: '这个账号已被主理人停用' };
      session = p;
      emit();
      return { ok: true, user: session };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  /* ---------- 登出 ---------- */
  async function logout() {
    try { if (sb) await sb.auth.signOut(); } catch (e) {}
    session = null;
    emit();
  }

  /* ---------- 修改密码（需已登录） ---------- */
  async function updatePassword(newPwd) {
    if (!session) return { ok: false, msg: '请先登录' };
    if (!newPwd || newPwd.length < 6) return { ok: false, msg: '新密码至少 6 位' };
    try {
      const c = await loadSupabase();
      const r = await c.auth.updateUser({ password: newPwd });
      if (r.error) return { ok: false, msg: r.error.message };
      return { ok: true, msg: '密码已更新，下次登录用新密码' };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  /* ---------- 忘记密码（发邮件） ---------- */
  async function sendResetEmail(email) {
    email = String(email || '').trim();
    if (!validEmail(email)) return { ok: false, msg: '邮箱格式不正确' };
    try {
      const c = await loadSupabase();
      const opts = {};
      if (/^https?:$/.test(location.protocol)) opts.redirectTo = location.href;
      const r = await c.auth.resetPasswordForEmail(email, opts);
      if (r.error) return { ok: false, msg: r.error.message };
      return { ok: true, msg: '重置邮件已发送，去邮箱点开链接设置新密码' };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  /* ---------- 管理员功能 ---------- */
  async function listUsers() {
    try {
      const c = await loadSupabase();
      const r = await c.from('profiles')
        .select('id,email,nick,role,banned,created_at')
        .order('created_at', { ascending: true });
      if (r.error) return { ok: false, msg: r.error.message };
      return { ok: true, users: r.data || [] };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }
  async function setRole(userId, role) {
    try {
      const c = await loadSupabase();
      const r = await c.from('profiles').update({ role }).eq('id', userId);
      if (r.error) return { ok: false, msg: r.error.message };
      return { ok: true };
    } catch (e) { return { ok: false, msg: e.message }; }
  }
  async function setBanned(userId, banned) {
    try {
      const c = await loadSupabase();
      const r = await c.from('profiles').update({ banned: !!banned }).eq('id', userId);
      if (r.error) return { ok: false, msg: r.error.message };
      return { ok: true };
    } catch (e) { return { ok: false, msg: e.message }; }
  }

  /* ---------- 初始化：恢复登录态 ---------- */
  async function init() {
    if (!isSupabase()) return;
    try {
      const c = await loadSupabase();
      const r = await c.auth.getSession();
      const s = r.data && r.data.session;
      if (s && s.user) {
        const p = await fetchProfile(s.user);
        if (await kickIfBanned(p)) { emit(); return; }
        session = p;
      } else {
        session = null;
      }
    } catch (e) {
      session = null;
    }
    emit();
  }

  /* ---------- 一键诊断 ---------- */
  async function diagnose() {
    const out = { mode: 'supabase', url: cfg.url, hasKey: !!cfg.key, sdk: '未加载', sdkHost: sdkHost || '-', ping: '-', detail: '' };
    if (!/^https:\/\/.+\.supabase\.co\/?$/.test(cfg.url.trim())) {
      out.detail = 'Project URL 格式不对，应该是 https://abcdefgh.supabase.co';
      return out;
    }
    if (location.protocol === 'file:') {
      out.detail = '页面是用 file:// 打开的，Supabase 会拒绝。请改用本地服务器：python -m http.server 8123';
      return out;
    }
    try { await loadSupabase(); out.sdk = '已加载'; }
    catch (e) { out.detail = 'SDK 问题：' + e.message; return out; }
    try {
      const t0 = Date.now();
      const res = await fetch(cfg.url.replace(/\/$/, '') + '/auth/v1/settings', { headers: { apikey: cfg.key } });
      out.ping = (Date.now() - t0) + ' ms / HTTP ' + res.status;
      if (res.ok) {
        const j = await res.json();
        out.detail = '项目连通。邮箱登录 ' + (j.external && j.external.email ? '已开启' : '未开启') +
                     '，允许注册 ' + (j.disable_signup ? '否' : '是');
      } else {
        out.detail = '项目返回 HTTP ' + res.status + '：' + (await res.text()).slice(0, 200);
      }
    } catch (e) { out.detail = '连不上项目：' + e.message; }

    /* 顺便看看 profiles 表建好没 */
    try {
      const r = await sb.from('profiles').select('id').limit(1);
      out.detail += r.error
        ? '　⚠️ profiles 表还没建（' + r.error.message + '），请执行 supabase-setup.sql'
        : '　profiles 表正常';
    } catch (e) {
      out.detail += '　⚠️ 读不到 profiles 表，请执行 supabase-setup.sql';
    }
    return out;
  }

  /* 给 api.js 用：拿到 supabase 客户端 */
  async function getClient() { return await loadSupabase(); }

  return {
    init, current, register, login, logout, diagnose, updatePassword, sendResetEmail,
    listUsers, setRole, setBanned, getClient,
    getCfg, setCfg, isSupabase, scope, validEmail, isOwner, isAdmin,
    onChange(f) { listeners.push(f); }
  };
})();
