/*
 * XB OJ 站点配置
 * ------------------------------------------------------------
 * Supabase 的 publishable key 是设计成公开的（数据安全靠数据库的 RLS 策略保护），
 * 所以直接写在这里是官方推荐做法，不用担心泄露。
 *
 * 想换项目就改这两个值。
 */

const SITE_CONFIG = {
  supabaseUrl: 'https://cfbcjjjvmwoboeyyjjxv.supabase.co',
  supabaseKey: 'sb_publishable_1Hr_FVmBZNZKY8SFKZHv4g_MGjZRO-k'
};

/* 角色中文名，界面上显示用 */
const ROLE_LABEL = {
  owner: '主理人',
  admin: '管理员',
  user: '普通用户'
};
