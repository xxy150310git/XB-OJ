/*
 * XB OJ 云端题库读写
 * ------------------------------------------------------------
 * 题目和测试点都存在 Supabase 的 problems 表里，不再放在本地 problems.js。
 * problems.js 只作为「初始题库」，第一次部署时点一下「从本地题库导入」把它灌进云端。
 *
 * 权限由数据库的 RLS 策略控制：
 *   读取 —— 所有人可读上架的题，管理员可读全部
 *   写入 —— 只有管理员 / 主理人能改
 * 所以就算有人改前端代码，也改不动你云端的题库。
 */

const API = (function () {

  /* 数据库字段（下划线）←→ 前端字段（驼峰）互转 */
  function toDb(p) {
    return {
      id: p.id,
      title: p.title,
      difficulty: p.difficulty || '入门',
      tags: p.tags || [],
      time_limit: p.timeLimit == null ? 1000 : p.timeLimit,
      memory_limit: p.memoryLimit == null ? 128 : p.memoryLimit,
      description: p.description || '',
      input_format: p.input || '',
      output_format: p.output || '',
      samples: p.samples || [],
      tests: p.tests || [],
      hint: p.hint || '',
      sort_order: p.sortOrder == null ? 0 : p.sortOrder,
      visible: p.visible !== false
    };
  }

  function fromDb(r) {
    return {
      id: r.id,
      title: r.title,
      difficulty: r.difficulty,
      tags: r.tags || [],
      timeLimit: r.time_limit,
      memoryLimit: r.memory_limit,
      description: r.description || '',
      input: r.input_format || '',
      output: r.output_format || '',
      samples: r.samples || [],
      tests: r.tests || [],
      hint: r.hint || '',
      sortOrder: r.sort_order,
      visible: r.visible,
      updatedAt: r.updated_at
    };
  }

  async function client() { return await AUTH.getClient(); }

  /* 拉取题目列表。管理员能看到下架的题，普通用户只看得到上架的 */
  async function listProblems() {
    try {
      const c = await client();
      const r = await c.from('problems')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });
      if (r.error) return { ok: false, msg: r.error.message };
      return { ok: true, problems: (r.data || []).map(fromDb) };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  /* 新增或更新一道题 */
  async function saveProblem(p) {
    if (!p.id || !String(p.id).trim()) return { ok: false, msg: '题号不能为空' };
    if (!p.title || !String(p.title).trim()) return { ok: false, msg: '标题不能为空' };
    if (!p.tests || !p.tests.length) return { ok: false, msg: '至少要有一个测试点，否则判题跑不起来' };
    try {
      const c = await client();
      const r = await c.from('problems').upsert(toDb(p));
      if (r.error) return { ok: false, msg: r.error.message };
      return { ok: true };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  /* 删除一道题 */
  async function deleteProblem(id) {
    try {
      const c = await client();
      const r = await c.from('problems').delete().eq('id', id);
      if (r.error) return { ok: false, msg: r.error.message };
      return { ok: true };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  /* 批量导入（用于把本地 problems.js 的题库灌进云端） */
  async function importProblems(list) {
    try {
      const c = await client();
      const rows = list.map(toDb);
      const r = await c.from('problems').upsert(rows);
      if (r.error) return { ok: false, msg: r.error.message };
      return { ok: true, count: rows.length };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  /* 检查 problems 表建好没 */
  async function checkTable() {
    try {
      const c = await client();
      const r = await c.from('problems').select('id').limit(1);
      if (r.error) return { ok: false, msg: r.error.message };
      return { ok: true };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  return { listProblems, saveProblem, deleteProblem, importProblems, checkTable };
})();
