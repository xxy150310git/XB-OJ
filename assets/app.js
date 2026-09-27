/*
 * XB OJ 前端逻辑
 * ------------------------------------------------------------
 * 纯静态站点，判题通过调用公共编译接口完成，不需要任何自己的服务器。
 *
 * 默认后端：Wandbox（免费、无需注册、CORS 开放）
 *   注意：另一个常见的公共判题接口 Piston 已于 2026-02-15 改为白名单制，
 *   不再对公众开放，所以这里默认不用它。如果你自己用 Docker 搭了一个
 *   Piston，可以在设置里切换成自建模式并填写地址。
 */

const DEFAULT_CPP = `#include <cstdio>

int main() {

    return 0;
}
`;

const LS = {
  solved: 'xboj.solved',
  code: 'xboj.code',
  cfg: 'xboj.cfg'
};

const DEFAULT_CFG = {
  driver: 'wandbox',
  wandboxUrl: 'https://wandbox.org/api/compile.json',
  pistonUrl: 'http://localhost:2000/api/v2/piston/execute',
  timeout: 10000,
  interval: 350
};

let cfg = loadCfg();
let solved = {};
let codeStore = {};
let current = null;
let judging = false;

/* 题库：优先用云端的，云端连不上就退回本地 problems.js，保证站点永远打得开 */
let catalog = [];
let catalogSource = 'local';

/* 做题记录和代码草稿都按账号分区，不同账号互不干扰 */
function solvedKey() { return 'xboj.solved.' + AUTH.scope(); }
function codeKey() { return 'xboj.code.' + AUTH.scope(); }

function reloadUserData() {
  solved = load(solvedKey(), {});
  codeStore = load(codeKey(), {});
  if (AUTH.current()) {
    /* 刚登录时，把未登录状态下做出的题目并入这个账号 */
    solved = Object.assign({}, load('xboj.solved.guest', {}), solved);
    codeStore = Object.assign({}, load('xboj.code.guest', {}), codeStore);
    save(solvedKey(), solved);
    save(codeKey(), codeStore);
  }
}

/* ============ 工具函数 ============ */

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}
function loadCfg() {
  return Object.assign({}, DEFAULT_CFG, load(LS.cfg, {}));
}
function $(sel) { return document.querySelector(sel); }
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
/* 比对前做标准化：统一换行、忽略每行行末空格、忽略首尾空行 */
function normalize(s) {
  return String(s == null ? '' : s)
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .split('\n').map(l => l.replace(/[ \t]+$/, '')).join('\n')
    .replace(/\n+$/, '').replace(/^\n+/, '');
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ============ 判题后端驱动 ============ */

async function postJSON(url, body, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch (e) { data = null; }
    if (!res.ok) {
      return { netError: '接口返回 ' + res.status + (data && data.message ? '：' + data.message : '') };
    }
    return { data: data };
  } catch (e) {
    if (e.name === 'AbortError') return { timeout: true };
    return { netError: '网络请求失败：' + e.message };
  } finally {
    clearTimeout(timer);
  }
}

/* Wandbox：返回 {ce, output, re, timeout, netError} */
async function runWandbox(code, stdin) {
  const r = await postJSON(cfg.wandboxUrl, {
    code: code,
    compiler: 'gcc-13.2.0',
    stdin: stdin || '',
    'compiler-option-raw': '-std=c++17\n-O2',
    options: ''
  }, cfg.timeout);
  if (r.timeout) return { timeout: true };
  if (r.netError) return { netError: r.netError };
  const d = r.data;
  if (d == null) return { netError: '接口返回了非 JSON 内容' };
  const compileMsg = (d.compiler_output || '') + (d.compiler_message || '');
  if (d.status != null && d.status !== '0' && compileMsg.trim() !== '') {
    return { ce: compileMsg.trim() };
  }
  if (d.status != null && d.status !== '0') {
    return { re: (d.program_error || d.signal || ('程序异常退出，状态码 ' + d.status)).trim() };
  }
  return { output: d.program_output == null ? '' : d.program_output };
}

/* 自建 Piston：返回同样的结构 */
async function runPiston(code, stdin) {
  const r = await postJSON(cfg.pistonUrl, {
    language: 'c++',
    version: '*',
    files: [{ name: 'main.cpp', content: code }],
    stdin: stdin || '',
    run_timeout: Math.floor(cfg.timeout / 1000) * 1000,
    compile_timeout: 10000
  }, cfg.timeout);
  if (r.timeout) return { timeout: true };
  if (r.netError) return { netError: r.netError };
  const d = r.data;
  if (d == null) return { netError: '接口返回了非 JSON 内容' };
  if (d.message) return { netError: d.message };
  if (d.compile && d.compile.code !== 0) {
    return { ce: (d.compile.output || '编译失败').trim() };
  }
  if (!d.run) return { netError: '接口没有返回运行结果' };
  if (d.run.code !== 0 && d.run.signal) {
    return { re: (d.run.signal + (d.run.output ? '\n' + d.run.output : '')).trim() };
  }
  return { output: d.run.output == null ? '' : d.run.output };
}

function runCode(code, stdin) {
  return cfg.driver === 'piston' ? runPiston(code, stdin) : runWandbox(code, stdin);
}

/* ============ 界面渲染 ============ */

function renderList() {
  const ul = $('#plist');
  ul.innerHTML = '';
  if (!catalog.length) {
    ul.innerHTML = '<li><div style="padding:14px; color:var(--ink-3); font-size:13px">' +
      '题库还是空的。管理员可以到「管理 → 题目管理」添加题目。</div></li>';
  }
  catalog.forEach(p => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.dataset.id = p.id;
    if (current && current.id === p.id) btn.className = 'active';
    btn.innerHTML =
      '<span class="dot' + (solved[p.id] ? ' done' : '') + '"></span>' +
      '<span class="pid">' + esc(p.id) + '</span>' +
      '<span>' + esc(p.title) + '</span>' +
      (p.visible === false ? '<span class="tag gray" style="margin-left:auto">已下架</span>' : '');
    btn.onclick = () => selectProblem(p.id);
    li.appendChild(btn);
    ul.appendChild(li);
  });
  const total = catalog.length;
  const done = catalog.filter(p => solved[p.id]).length;
  $('#stat').textContent = '已通过 ' + done + ' / ' + total + ' 题';
  $('#listHint').textContent = catalogSource === 'cloud' ? '云端' : '本地';
}

function renderProblem() {
  const p = current;
  if (!p) {
    $('#ptitle').textContent = '还没有题目';
    $('#pmeta').innerHTML = '';
    $('#pbody').innerHTML = '<div class="note">题库是空的。管理员可以到右上角「管理 → 题目管理」' +
      '添加题目，或者点「从本地题库导入」把内置的 5 道题灌进云端。</div>';
    $('#code').value = DEFAULT_CPP;
    resetResult();
    return;
  }
  $('#ptitle').textContent = p.id + '  ' + p.title;
  $('#pmeta').innerHTML =
    '<span class="tag">' + esc(p.difficulty) + '</span>' +
    (p.tags || []).map(t => '<span class="tag gray">' + esc(t) + '</span>').join('') +
    '<span class="tag gray">时间 ' + p.timeLimit + ' ms</span>' +
    '<span class="tag gray">内存 ' + p.memoryLimit + ' MB</span>' +
    (p.visible === false ? '<span class="tag gray">已下架</span>' : '');

  let html = '';
  html += '<div class="sec-hd">题目描述</div><div class="prose">' + p.description + '</div>';
  html += '<div class="sec-hd">输入格式</div><div class="io-block">' + esc(p.input) + '</div>';
  html += '<div class="sec-hd">输出格式</div><div class="io-block">' + esc(p.output) + '</div>';
  html += '<div class="sec-hd">样例</div>';
  (p.samples || []).forEach((s, i) => {
    html += '<div class="sample-grid" style="margin-bottom:10px">' +
      '<div class="sample-box"><div class="sb-hd">输入 ' + (i + 1) + '</div><pre>' + esc(s.input) + '</pre></div>' +
      '<div class="sample-box"><div class="sb-hd">输出 ' + (i + 1) + '</div><pre>' + esc(s.output) + '</pre></div>' +
      '</div>';
  });
  if (!p.samples || !p.samples.length) html += '<div class="note">（这道题还没写样例）</div>';
  if (p.hint) {
    html += '<div class="sec-hd">提示</div><div class="hint-box">' + esc(p.hint) + '</div>';
  }
  $('#pbody').innerHTML = html;

  $('#code').value = codeStore[p.id] || DEFAULT_CPP;
  resetResult();
}

function selectProblem(id) {
  const p = catalog.find(x => x.id === id);
  if (!p) return;
  flushCode();
  current = p;
  renderList();
  renderProblem();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function flushCode() {
  if (current) {
    codeStore[current.id] = $('#code').value;
    save(codeKey(), codeStore);
  }
}

function resetResult() {
  $('#result').innerHTML = '';
}

/* ============ 判题流程 ============ */

function setVerdict(cls, text, sub) {
  $('#result').innerHTML =
    '<div class="verdict ' + cls + '">' + esc(text) +
    (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>' + $('#result').innerHTML;
}

async function judge() {
  if (judging || !current) return;
  const p = current;
  const code = $('#code').value;
  flushCode();

  judging = true;
  $('#btnSubmit').disabled = true;
  $('#btnRun').disabled = true;

  const rows = [];
  let verdict = 'AC';
  let firstFail = null;
  const t0 = performance.now();
  const all = p.tests;

  for (let i = 0; i < all.length; i++) {
    $('#result').innerHTML =
      '<div class="verdict run">判题中…<small>正在测试第 ' + (i + 1) + ' / ' + all.length + ' 个数据点</small></div>';

    const t1 = performance.now();
    const r = await runCode(code, all[i].input);
    const cost = Math.round(performance.now() - t1);

    if (r.netError) {
      verdict = 'ERR';
      setVerdict('err', '判题服务连接失败', r.netError + '（可能是网络不通或接口限流，稍等几秒再试）');
      finish();
      return;
    }
    if (r.ce) {
      verdict = 'CE';
      showCompileError(r.ce);
      finish();
      return;
    }
    if (r.timeout) {
      rows.push({ i: i + 1, status: 'TLE', cost: cfg.timeout });
      verdict = 'TLE';
      firstFail = firstFail || { input: all[i].input, expected: all[i].output, actual: '(运行超时)' };
      break;
    }
    if (r.re) {
      rows.push({ i: i + 1, status: 'RE', cost: cost });
      verdict = 'RE';
      firstFail = firstFail || { input: all[i].input, expected: all[i].output, actual: r.re };
      break;
    }

    const ok = normalize(r.output) === normalize(all[i].output);
    rows.push({ i: i + 1, status: ok ? 'AC' : 'WA', cost: cost });
    if (!ok) {
      verdict = 'WA';
      firstFail = { input: all[i].input, expected: all[i].output, actual: r.output };
      break;
    }
    await sleep(cfg.interval);
  }

  const total = Math.round(performance.now() - t0);
  const passed = rows.filter(r => r.status === 'AC').length;

  if (verdict === 'AC') {
    solved[p.id] = true;
    save(solvedKey(), solved);
    renderList();
  }

  let html = '';
  if (verdict === 'AC') {
    html += '<div class="verdict ac">Accepted<small>通过 ' + passed + ' / ' + all.length +
      ' 个数据点，总耗时 ' + total + ' ms</small></div>';
  } else {
    const names = { WA: 'Wrong Answer', TLE: 'Time Limit Exceeded', RE: 'Runtime Error' };
    html += '<div class="verdict wa">' + names[verdict] +
      '<small>通过 ' + passed + ' / ' + all.length + ' 个数据点</small></div>';
  }

  html += '<table class="rtable"><thead><tr><th>数据点</th><th>结果</th><th>耗时</th></tr></thead><tbody>';
  rows.forEach(r => {
    const cls = r.status === 'AC' ? 's-ac' : (r.status === 'WA' ? 's-wa' : 's-err');
    html += '<tr><td>#' + r.i + '</td><td class="' + cls + '">' + r.status + '</td><td class="mono">' + r.cost + ' ms</td></tr>';
  });
  html += '</tbody></table>';

  if (firstFail) {
    html += '<div class="sec-hd">失败的数据点对比</div><div class="diff">' +
      '<div><div class="sb-hd">输入</div><pre>' + esc(firstFail.input) + '</pre></div>' +
      '<div><div class="sb-hd">期望输出</div><pre>' + esc(firstFail.expected) + '</pre></div>' +
      '</div>' +
      '<div style="margin-top:10px"><div class="sb-hd">你的程序输出</div><pre>' + esc(firstFail.actual || '(空)') + '</pre></div>';
  }

  $('#result').innerHTML = html;
  finish();
}

function showCompileError(msg) {
  $('#result').innerHTML =
    '<div class="verdict err">Compile Error<small>代码没有通过编译</small></div>' +
    '<div class="sec-hd">编译器输出</div><pre style="margin:0;padding:12px;background:#f8fafb;border:1px solid var(--line);border-radius:8px;font-family:var(--mono);font-size:12.5px;white-space:pre-wrap;max-height:260px;overflow:auto">' +
    esc(msg) + '</pre>';
}

function finish() {
  judging = false;
  $('#btnSubmit').disabled = false;
  $('#btnRun').disabled = false;
}

/* 自测运行：用自己的输入跑一次，不判分 */
async function selfTest() {
  if (judging || !current) return;
  const code = $('#code').value;
  const stdin = $('#stdin').value;
  flushCode();
  judging = true;
  $('#btnSubmit').disabled = true;
  $('#btnRun').disabled = true;
  $('#result').innerHTML = '<div class="verdict run">运行中…</div>';

  const t0 = performance.now();
  const r = await runCode(code, stdin);
  const cost = Math.round(performance.now() - t0);

  if (r.netError) {
    setVerdict('err', '判题服务连接失败', r.netError);
  } else if (r.ce) {
    showCompileError(r.ce);
  } else if (r.timeout) {
    setVerdict('err', 'Time Limit Exceeded', '运行超过 ' + cfg.timeout + ' ms，检查是不是有死循环');
  } else {
    let head = r.re ? 'Runtime Error' : '运行完成';
    let cls = r.re ? 'err' : 'run';
    $('#result').innerHTML =
      '<div class="verdict ' + cls + '">' + head + '<small>耗时 ' + cost + ' ms</small></div>' +
      '<div class="sec-hd">程序输出</div><pre style="margin:0;padding:12px;background:#f8fafb;border:1px solid var(--line);border-radius:8px;font-family:var(--mono);font-size:13px;white-space:pre-wrap;min-height:60px">' +
      esc(r.output || '(无输出)') + '</pre>' +
      (r.re ? '<div class="sec-hd">错误信息</div><pre style="margin:0;padding:12px;background:#fdf5e3;border:1px solid #f0e0bd;border-radius:8px;font-family:var(--mono);font-size:12.5px;white-space:pre-wrap">' + esc(r.re) + '</pre>' : '');
  }
  finish();
}

/* ============ 设置弹窗 ============ */

function openSettings() {
  $('#cfgDriver').value = cfg.driver;
  $('#cfgWandbox').value = cfg.wandboxUrl;
  $('#cfgPiston').value = cfg.pistonUrl;
  $('#cfgTimeout').value = cfg.timeout;
  const ac = AUTH.getCfg();
  $('#authSbUrl').value = ac.supabaseUrl;
  $('#authSbKey').value = ac.supabaseKey;
  $('#cfgNewPwd').value = '';
  showTip('pwdTip', '');
  $('#diagOut').innerHTML = '';

  const u = AUTH.current();
  $('#cfgAccount').innerHTML = u
    ? '已登录 <strong>' + esc(u.nick) + '</strong>　' + esc(u.email) +
      '　角色：<strong>' + esc(ROLE_LABEL[u.role] || u.role) + '</strong>' +
      (u.profileMissing ? '　<span class="s-err">profiles 表未初始化，请执行 supabase-setup.sql</span>' : '')
    : '当前未登录，修改密码和后台管理需要先登录。';

  $('#modal').classList.add('show');
}
function closeSettings() {
  $('#modal').classList.remove('show');
}
function saveSettings() {
  cfg.driver = $('#cfgDriver').value;
  cfg.wandboxUrl = $('#cfgWandbox').value.trim() || DEFAULT_CFG.wandboxUrl;
  cfg.pistonUrl = $('#cfgPiston').value.trim() || DEFAULT_CFG.pistonUrl;
  cfg.timeout = parseInt($('#cfgTimeout').value, 10) || DEFAULT_CFG.timeout;
  save(LS.cfg, cfg);
  AUTH.setCfg({
    supabaseUrl: $('#authSbUrl').value.trim(),
    supabaseKey: $('#authSbKey').value.trim()
  });
  closeSettings();
}

/* ============ 账号界面 ============ */

function renderUserArea() {
  const u = AUTH.current();
  const el = $('#userArea');
  if (!u) {
    el.innerHTML = '<button class="btn" id="btnAuth">登录 / 注册</button>';
    $('#btnAuth').onclick = () => openAuth('login');
  } else {
    const initial = String(u.nick || u.email || '?').trim().charAt(0).toUpperCase();
    const role = ROLE_LABEL[u.role] || '普通用户';
    const roleCls = u.role === 'owner' ? 'role-owner' : (u.role === 'admin' ? 'role-admin' : '');
    const adminBtn = AUTH.isAdmin()
      ? '<button class="btn" id="btnAdmin" style="margin-left:8px">管理</button>'
      : '';
    el.innerHTML =
      '<span class="user-chip" title="' + esc(u.email) + '">' +
        '<span class="avatar">' + esc(initial) + '</span>' +
        '<span class="unick">' + esc(u.nick) + '</span>' +
        '<span class="role-badge ' + roleCls + '">' + esc(role) + '</span>' +
      '</span>' +
      adminBtn +
      '<button class="btn" id="btnLogout" style="margin-left:8px">退出</button>';
    if (AUTH.isAdmin()) $('#btnAdmin').onclick = openAdmin;
    $('#btnLogout').onclick = () => { flushCode(); AUTH.logout(); };
  }
}

function switchTab(t) {
  document.querySelectorAll('#authModal .tabbtn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === t);
  });
  $('#tab-login').style.display = t === 'login' ? '' : 'none';
  $('#tab-reg').style.display = t === 'reg' ? '' : 'none';
}

function showTip(id, msg, ok) {
  const el = $('#' + id);
  el.textContent = msg || '';
  el.className = 'tip' + (msg ? (ok ? ' ok' : ' err') : '');
}

function openAuth(tab) {
  switchTab(tab || 'login');
  showTip('lgTip', '');
  showTip('rgTip', '');
  $('#authNote').innerHTML =
    '账号由 Supabase 服务端保管，一台设备注册、换设备也能登录。<br>' +
    '新用户注册后要先去邮箱点开验证邮件，才能登录进来。';
  $('#authModal').classList.add('show');
}
function closeAuth() { $('#authModal').classList.remove('show'); }

async function doLogin() {
  showTip('lgTip', '正在登录…');
  $('#btnLogin').disabled = true;
  flushCode();
  const r = await AUTH.login($('#lgEmail').value, $('#lgPwd').value);
  $('#btnLogin').disabled = false;
  if (r.ok) {
    showTip('lgTip', '登录成功', true);
    setTimeout(closeAuth, 450);
  } else {
    showTip('lgTip', r.msg);
  }
}

async function doRegister() {
  const p1 = $('#rgPwd').value, p2 = $('#rgPwd2').value;
  if (p1 !== p2) return showTip('rgTip', '两次输入的密码不一致');
  showTip('rgTip', '正在注册…');
  $('#btnReg').disabled = true;
  flushCode();
  const r = await AUTH.register($('#rgEmail').value, p1, $('#rgNick').value);
  $('#btnReg').disabled = false;
  if (!r.ok) return showTip('rgTip', r.msg);
  if (r.needVerify) {
    showTip('rgTip', r.msg, true);
    setTimeout(() => switchTab('login'), 2600);
  } else {
    showTip('rgTip', '注册成功', true);
    setTimeout(closeAuth, 450);
  }
}

/* ============ 管理面板：用户管理 + 题目管理 ============ */

let adminUsers = [];
let adminProblems = [];

function openAdmin() {
  if (!AUTH.isAdmin()) return;
  const u = AUTH.current();
  $('#adminWhoami').textContent =
    '当前身份：' + (ROLE_LABEL[u.role] || u.role) + '（' + (u.nick || u.email) + '）';
  $('#adminModal').classList.add('show');
  switchAdminTab('users');
}
function closeAdmin() { $('#adminModal').classList.remove('show'); }

function switchAdminTab(t) {
  document.querySelectorAll('#adminModal .tabbtn').forEach(b => {
    b.classList.toggle('active', b.dataset.atab === t);
  });
  $('#atab-users').style.display = t === 'users' ? '' : 'none';
  $('#atab-problems').style.display = t === 'problems' ? '' : 'none';
  if (t === 'users') renderAdminUsers(); else renderAdminProblems();
}

/* ---------- 用户管理 ---------- */

async function renderAdminUsers() {
  const box = $('#atab-users');
  box.innerHTML = '<div class="note">加载中…</div>';
  const r = await AUTH.listUsers();
  if (!r.ok) {
    box.innerHTML =
      '<div class="tip err">读取用户列表失败：' + esc(r.msg) + '</div>' +
      '<div class="note" style="margin-top:8px">多半是 profiles 表还没建好，' +
      '去 Supabase 后台的 SQL Editor 执行 <code>supabase-setup.sql</code>。</div>';
    return;
  }
  adminUsers = r.users;
  const me = AUTH.current();

  let html = '<div class="note" style="margin-bottom:10px">' +
    (AUTH.isOwner()
      ? '你是主理人，可以调整任何人的角色、停用任何账号。'
      : '你是管理员，只能查看用户列表。改角色和停用需要主理人操作。') +
    '</div>';

  html += '<table class="rtable"><thead><tr>' +
    '<th>用户</th><th>角色</th><th>状态</th><th>注册时间</th><th>操作</th>' +
    '</tr></thead><tbody>';

  adminUsers.forEach(p => {
    const isMe = p.id === me.id;
    const canEdit = AUTH.isOwner() && !isMe;   /* 不能改自己的角色，防止手滑把自己降权 */
    const roleCls = p.role === 'owner' ? 'role-owner' : (p.role === 'admin' ? 'role-admin' : '');
    html += '<tr>' +
      '<td>' + esc(p.nick || '(无昵称)') +
        '<div class="mono" style="font-size:12px;color:var(--ink-3)">' + esc(p.email) + '</div></td>' +
      '<td><span class="role-badge ' + roleCls + '">' + esc(ROLE_LABEL[p.role] || p.role) + '</span></td>' +
      '<td>' + (p.banned ? '<span class="s-wa">已停用</span>' : '正常') + '</td>' +
      '<td class="mono">' + esc(String(p.created_at || '').slice(0, 10)) + '</td>' +
      '<td>' + (canEdit
        ? '<button class="btn btn-sm" data-act="admin" data-id="' + p.id + '">设为管理员</button> ' +
          '<button class="btn btn-sm" data-act="user" data-id="' + p.id + '">设为普通</button> ' +
          '<button class="btn btn-sm" data-act="ban" data-id="' + p.id + '">' +
            (p.banned ? '解除停用' : '停用') + '</button>'
        : '<span style="color:var(--ink-3);font-size:12px">' +
          (isMe ? '（这是你自己）' : '无权限') + '</span>') +
      '</td>' +
    '</tr>';
  });
  html += '</tbody></table>';
  html += '<div class="note" style="margin-top:10px">共 ' + adminUsers.length + ' 个用户。' +
          '停用后该用户下次登录会被强制登出；角色改动即时生效。</div>';

  box.innerHTML = html;

  box.querySelectorAll('button[data-act]').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id, act = b.dataset.act;
      b.disabled = true;
      let res;
      if (act === 'ban') {
        const p = adminUsers.find(x => x.id === id);
        res = await AUTH.setBanned(id, !(p && p.banned));
      } else {
        res = await AUTH.setRole(id, act);
      }
      b.disabled = false;
      if (!res.ok) { alert('操作失败：' + res.msg); return; }
      renderAdminUsers();
    };
  });
}

/* ---------- 题目管理 ---------- */

async function renderAdminProblems() {
  const box = $('#atab-problems');
  box.innerHTML = '<div class="note">加载中…</div>';
  const r = await API.listProblems();
  if (!r.ok) {
    box.innerHTML =
      '<div class="tip err">读取题库失败：' + esc(r.msg) + '</div>' +
      '<div class="note" style="margin-top:8px">如果提示找不到 problems 表，' +
      '去 Supabase 后台的 SQL Editor 执行 <code>supabase-setup.sql</code>。</div>';
    return;
  }
  adminProblems = r.problems;

  let html = '<div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap">' +
    '<button class="btn btn-primary btn-sm" id="btnNewProblem">新建题目</button>' +
    '<button class="btn btn-sm" id="btnImportLocal">从本地题库导入（' + PROBLEMS.length + ' 题）</button>' +
    '<button class="btn btn-sm" id="btnReloadProblems">刷新</button>' +
    '</div>';

  html += '<div class="note" style="margin-bottom:10px">共 <strong>' + adminProblems.length +
    '</strong> 道题。题库存在云端，所有人看到的是同一份，改完即时生效。</div>';

  if (adminProblems.length) {
    html += '<table class="rtable"><thead><tr>' +
      '<th>题号</th><th>标题</th><th>难度</th><th>测试点</th><th>状态</th><th>操作</th>' +
      '</tr></thead><tbody>';
    adminProblems.forEach(p => {
      html += '<tr>' +
        '<td class="mono">' + esc(p.id) + '</td>' +
        '<td>' + esc(p.title) + '</td>' +
        '<td>' + esc(p.difficulty) + '</td>' +
        '<td class="mono">' + (p.tests || []).length + ' 个</td>' +
        '<td>' + (p.visible === false ? '<span class="s-wa">已下架</span>' : '上架') + '</td>' +
        '<td>' +
          '<button class="btn btn-sm" data-pact="edit" data-id="' + esc(p.id) + '">编辑</button> ' +
          '<button class="btn btn-sm" data-pact="toggle" data-id="' + esc(p.id) + '">' +
            (p.visible === false ? '上架' : '下架') + '</button> ' +
          '<button class="btn btn-sm" data-pact="del" data-id="' + esc(p.id) + '">删除</button>' +
        '</td>' +
      '</tr>';
    });
    html += '</tbody></table>';
  } else {
    html += '<div class="note">云端题库还是空的。点上面「从本地题库导入」，' +
      '把内置的 ' + PROBLEMS.length + ' 道题一次性灌进云端。</div>';
  }

  box.innerHTML = html;

  $('#btnNewProblem').onclick = () => openProblemEditor(null);
  $('#btnImportLocal').onclick = doImportLocal;
  $('#btnReloadProblems').onclick = renderAdminProblems;

  box.querySelectorAll('button[data-pact]').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id, act = b.dataset.pact;
      const p = adminProblems.find(x => x.id === id);
      if (!p) return;
      if (act === 'edit') return openProblemEditor(p);
      if (act === 'toggle') {
        b.disabled = true;
        const r2 = await API.saveProblem(Object.assign({}, p, { visible: p.visible === false }));
        b.disabled = false;
        if (!r2.ok) return alert('操作失败：' + r2.msg);
        await loadCatalog();
        return renderAdminProblems();
      }
      if (act === 'del') {
        if (!confirm('确定删除题目 ' + p.id + ' ' + p.title + ' 吗？测试数据会一起删掉，无法恢复。')) return;
        b.disabled = true;
        const r3 = await API.deleteProblem(id);
        b.disabled = false;
        if (!r3.ok) return alert('删除失败：' + r3.msg);
        await loadCatalog();
        return renderAdminProblems();
      }
    };
  });
}

async function doImportLocal() {
  if (!confirm('把内置的 ' + PROBLEMS.length + ' 道题导入/覆盖到云端题库？\n' +
               '题号相同的会被覆盖，题号不同的会新增。')) return;
  const btn = $('#btnImportLocal');
  btn.disabled = true;
  btn.textContent = '导入中…';
  const r = await API.importProblems(PROBLEMS);
  btn.disabled = false;
  btn.textContent = '从本地题库导入（' + PROBLEMS.length + ' 题）';
  if (!r.ok) return alert('导入失败：' + r.msg);
  alert('成功导入 ' + r.count + ' 道题');
  await loadCatalog();
  renderAdminProblems();
}

/* ---------- 题目编辑器 ---------- */

function pairRowHtml(kind, i, s) {
  const label = (kind === 'sample' ? '样例 ' : '测试点 ') + (i + 1);
  return '<div class="row-pair" data-kind="' + kind + '">' +
    '<div class="rp-hd"><span>' + label + '</span>' +
      '<button class="btn btn-sm" data-rm="' + kind + '" data-i="' + i + '">删除</button></div>' +
    '<div class="diff">' +
      '<textarea data-f="input" placeholder="输入">' + esc(s.input || '') + '</textarea>' +
      '<textarea data-f="output" placeholder="输出">' + esc(s.output || '') + '</textarea>' +
    '</div>' +
  '</div>';
}

function renderPairs(kind) {
  const box = $(kind === 'sample' ? '#pfSamples' : '#pfTests');
  const list = collectPairs(kind);
  if (!list.length) {
    box.innerHTML = '<div class="note">（还没有' + (kind === 'sample' ? '样例' : '测试点') +
      (kind === 'sample' ? '，可以不加）' : '，至少要有一个，否则没法判题）') + '</div>';
    return;
  }
  box.innerHTML = list.map((s, i) => pairRowHtml(kind, i, s)).join('');
  bindPairButtons(kind);
}

function collectPairs(kind) {
  const out = [];
  document.querySelectorAll('#pf' + (kind === 'sample' ? 'Samples' : 'Tests') + ' .row-pair').forEach(el => {
    out.push({
      input: el.querySelector('textarea[data-f="input"]').value,
      output: el.querySelector('textarea[data-f="output"]').value
    });
  });
  return out;
}

function bindPairButtons(kind) {
  const box = $(kind === 'sample' ? '#pfSamples' : '#pfTests');
  box.querySelectorAll('button[data-rm]').forEach(b => {
    b.onclick = () => {
      const list = collectPairs(kind);
      list.splice(Number(b.dataset.i), 1);
      box.innerHTML = list.length
        ? list.map((s, i) => pairRowHtml(kind, i, s)).join('')
        : '';
      bindPairButtons(kind);
      if (!list.length) renderPairs(kind);
    };
  });
}

function openProblemEditor(p) {
  if (!AUTH.isAdmin()) return;
  $('#probModalTitle').textContent = p ? ('编辑题目 ' + p.id) : '新建题目';
  $('#pfId').value = p ? p.id : '';
  $('#pfId').disabled = !!p;              /* 题号是主键，编辑时不让改，避免改成重复的 */
  $('#pfTitle').value = p ? p.title : '';
  $('#pfDiff').value = p ? p.difficulty : '入门';
  $('#pfOrder').value = p ? (p.sortOrder == null ? 0 : p.sortOrder) : 0;
  $('#pfTime').value = p ? p.timeLimit : 1000;
  $('#pfMem').value = p ? p.memoryLimit : 128;
  $('#pfTags').value = p ? (p.tags || []).join(', ') : '';
  $('#pfDesc').value = p ? p.description : '';
  $('#pfIn').value = p ? p.input : '';
  $('#pfOut').value = p ? p.output : '';
  $('#pfHint').value = p ? p.hint : '';
  $('#pfVisible').checked = p ? p.visible !== false : true;
  showTip('pfTip', '');

  const samples = (p && p.samples) ? p.samples : [];
  const tests = (p && p.tests) ? p.tests : [];
  $('#pfSamples').innerHTML = samples.map((s, i) => pairRowHtml('sample', i, s)).join('');
  $('#pfTests').innerHTML = tests.map((s, i) => pairRowHtml('test', i, s)).join('');
  bindPairButtons('sample');
  bindPairButtons('test');

  $('#probModal').classList.add('show');
}
function closeProblemEditor() { $('#probModal').classList.remove('show'); }

async function saveProblemForm() {
  const p = {
    id: $('#pfId').value.trim(),
    title: $('#pfTitle').value.trim(),
    difficulty: $('#pfDiff').value.trim() || '入门',
    sortOrder: parseInt($('#pfOrder').value, 10) || 0,
    timeLimit: parseInt($('#pfTime').value, 10) || 1000,
    memoryLimit: parseInt($('#pfMem').value, 10) || 128,
    tags: $('#pfTags').value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
    description: $('#pfDesc').value,
    input: $('#pfIn').value,
    output: $('#pfOut').value,
    hint: $('#pfHint').value,
    samples: collectPairs('sample'),
    tests: collectPairs('test'),
    visible: $('#pfVisible').checked
  };
  if (!p.id) return showTip('pfTip', '题号不能为空');
  if (!p.title) return showTip('pfTip', '标题不能为空');
  if (!p.tests.length) return showTip('pfTip', '至少要有一个测试点，否则判题跑不起来');

  $('#btnProbSave').disabled = true;
  showTip('pfTip', '保存中…');
  const r = await API.saveProblem(p);
  $('#btnProbSave').disabled = false;
  if (!r.ok) return showTip('pfTip', '保存失败：' + r.msg);

  showTip('pfTip', '已保存到云端', true);
  await loadCatalog();
  setTimeout(() => { closeProblemEditor(); renderAdminProblems(); }, 500);
}

/* ---------- 从云端加载题库 ---------- */

async function loadCatalog() {
  const r = await API.listProblems();
  if (r.ok) {
    catalog = r.problems;
    catalogSource = 'cloud';
  } else {
    /* 云端连不上：退回本地 problems.js，保证站点照样能用 */
    catalog = PROBLEMS.slice();
    catalogSource = 'local';
  }
  /* 管理员看得到下架的题，普通用户只留有上架的 */
  if (!AUTH.isAdmin()) {
    catalog = catalog.filter(p => p.visible !== false);
  }
  /* 当前题被删了就切到第一题 */
  if (current) {
    const still = catalog.find(x => x.id === current.id);
    current = still || catalog[0] || null;
  } else {
    current = catalog[0] || null;
  }
  renderList();
  renderProblem();
  return r;
}

/* 修改密码（已登录状态下直接改） */
async function doChangePwd() {
  const pwd = $('#cfgNewPwd').value;
  if (!pwd) return showTip('pwdTip', '请先填新密码');
  if (!AUTH.current()) return showTip('pwdTip', '要先登录才能改密码');
  $('#btnChangePwd').disabled = true;
  showTip('pwdTip', '提交中…');
  const r = await AUTH.updatePassword(pwd);
  $('#btnChangePwd').disabled = false;
  if (r.ok) {
    $('#cfgNewPwd').value = '';
    showTip('pwdTip', r.msg, true);
  } else {
    showTip('pwdTip', r.msg);
  }
}

/* 忘记密码：让 Supabase 发一封重置邮件 */
async function doForgot() {
  const email = $('#lgEmail').value.trim();
  if (!email) return showTip('lgTip', '先在上面的邮箱框里填你的邮箱，再点忘记密码');
  $('#btnForgot').style.pointerEvents = 'none';
  showTip('lgTip', '正在发送重置邮件…');
  const r = await AUTH.sendResetEmail(email);
  $('#btnForgot').style.pointerEvents = '';
  showTip('lgTip', r.msg, r.ok);
}

/* 登录状态变化时：重新加载做题记录、刷新界面、重拉题库
   （身份变了能看到的题目范围也变了：管理员能看到已下架的题） */
AUTH.onChange(async () => {
  reloadUserData();
  renderUserArea();
  await loadCatalog();
  if (AUTH.isAdmin() && $('#adminModal').classList.contains('show')) {
    renderAdminUsers();
  }
});

/* ============ 初始化 ============ */

function init() {
  $('#btnSubmit').onclick = judge;
  $('#btnRun').onclick = selfTest;
  $('#btnReset').onclick = () => { if (current) { $('#code').value = DEFAULT_CPP; flushCode(); } };
  $('#btnSettings').onclick = openSettings;
  $('#btnCfgCancel').onclick = closeSettings;
  $('#btnCfgSave').onclick = saveSettings;
  $('#modal').onclick = e => { if (e.target.id === 'modal') closeSettings(); };

  /* Tab 键缩进 */
  $('#code').addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = this.selectionStart, t = this.selectionEnd;
      this.value = this.value.substring(0, s) + '    ' + this.value.substring(t);
      this.selectionStart = this.selectionEnd = s + 4;
      flushCode();
    }
  });
  $('#code').addEventListener('input', function () {
    clearTimeout(window.__ct);
    window.__ct = setTimeout(flushCode, 400);
  });

  /* 账号相关 */
  $('#btnDiag').onclick = async () => {
    const el = $('#diagOut');
    el.innerHTML = '<div class="tip">正在诊断…</div>';
    /* 先把表单里填的内容应用上，免得用户改了却没保存 */
    AUTH.setCfg({
      supabaseUrl: $('#authSbUrl').value.trim(),
      supabaseKey: $('#authSbKey').value.trim()
    });
    const d = await AUTH.diagnose();
    el.innerHTML =
      '<div class="tip">' +
        '<div>项目地址　' + esc(d.url) + '</div>' +
        '<div>Key 已填　' + (d.hasKey ? '是' : '否') + '</div>' +
        '<div>SDK 状态　' + esc(d.sdk) + '（来源 ' + esc(d.sdkHost) + '）</div>' +
        '<div>连通耗时　' + esc(d.ping) + '</div>' +
        '<div style="margin-top:8px">' + esc(d.detail) + '</div>' +
      '</div>';
  };
  $('#btnChangePwd').onclick = doChangePwd;
  $('#btnForgot').onclick = doForgot;
  $('#btnLogin').onclick = doLogin;
  $('#btnReg').onclick = doRegister;
  document.querySelectorAll('#authModal .tabbtn').forEach(b => {
    b.onclick = () => switchTab(b.dataset.tab);
  });
  $('#authModal').onclick = e => { if (e.target.id === 'authModal') closeAuth(); };
  ['#lgEmail', '#lgPwd'].forEach(s => {
    $(s).addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });
  ['#rgEmail', '#rgNick', '#rgPwd', '#rgPwd2'].forEach(s => {
    $(s).addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
  });

  /* 管理面板 */
  $('#btnAdminClose').onclick = closeAdmin;
  $('#adminModal').onclick = e => { if (e.target.id === 'adminModal') closeAdmin(); };
  document.querySelectorAll('#adminModal .tabbtn').forEach(b => {
    b.onclick = () => switchAdminTab(b.dataset.atab);
  });

  /* 题目编辑器 */
  $('#btnProbCancel').onclick = closeProblemEditor;
  $('#btnProbSave').onclick = saveProblemForm;
  $('#probModal').onclick = e => { if (e.target.id === 'probModal') closeProblemEditor(); };
  $('#btnAddSample').onclick = () => {
    const list = collectPairs('sample');
    list.push({ input: '', output: '' });
    $('#pfSamples').innerHTML = list.map((s, i) => pairRowHtml('sample', i, s)).join('');
    bindPairButtons('sample');
  };
  $('#btnAddTest').onclick = () => {
    const list = collectPairs('test');
    list.push({ input: '', output: '' });
    $('#pfTests').innerHTML = list.map((s, i) => pairRowHtml('test', i, s)).join('');
    bindPairButtons('test');
  };

  reloadUserData();
  renderUserArea();
  /* 先用本地题库把页面撑起来，云端题库拉到后会覆盖 */
  catalog = PROBLEMS.slice();
  current = catalog[0] || null;
  renderList();
  renderProblem();
  /* AUTH.init() 完成后会触发 onChange，里面会去云端拉题库 */
  AUTH.init();
}

document.addEventListener('DOMContentLoaded', init);
