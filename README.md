# XB OJ

一个**零成本、纯静态**的在线评测（Online Judge）站点。托管在 GitHub Pages 上，不需要自己的服务器，判题通过公共编译接口完成。

- 支持 C++（GCC 13.2，`-std=c++17`）
- 提交后自动跑完所有测试点，给出 AC / WA / TLE / RE / CE 判定
- **邮箱注册 / 登录**，每个账号的做题记录和代码草稿相互隔离
- 自带「自测运行」，可以用自己的输入先跑一遍

---

## 目录结构

```
XB OJ/
├── index.html        页面结构
├── problems.js       题库配置（加题只改这个文件）
├── assets/
│   ├── style.css     样式
│   ├── auth.js       账号系统（注册 / 登录 / 会话）
│   └── app.js        页面与判题逻辑
└── README.md         本文件
```

---

## 一、本地预览

页面用了 `fetch` 请求判题接口，直接双击打开 `index.html`（`file://`）在部分浏览器下会被跨域策略拦住，建议用本地服务器打开。

在本目录执行：

```bash
python -m http.server 8123
```

然后浏览器访问 <http://localhost:8123>。

没有 Python 也可以用 Node：

```bash
npx serve .
```

---

## 二、部署到 GitHub Pages（免费）

### 方式一：网页上传（不需要 Git 基础）

1. 登录 GitHub，点右上角 `+` → `New repository`
2. 仓库名填 `xb-oj`，选 **Public**，勾上 `Add a README file`，点 Create
3. 进入仓库，点 `Add file` → `Upload files`
4. 把本目录下的 `index.html`、`problems.js` 两个文件和 `assets` 整个文件夹拖进去
   （网页上传不支持空文件夹，但 `assets` 里有文件，可以直接拖）
5. 点 `Commit changes`
6. 仓库页面 → `Settings` → 左侧 `Pages` → `Source` 选 `Deploy from a branch`
   → `Branch` 选 `main`、目录选 `/ (root)` → `Save`
7. 等 1~2 分钟，访问 `https://你的用户名.github.io/xb-oj/` 就能看到你的 OJ 了

### 方式二：用 Git 命令

```bash
cd "XB OJ"
git init
git add .
git commit -m "init XB OJ"
git branch -M main
git remote add origin https://github.com/你的用户名/xb-oj.git
git push -u origin main
```

然后同样去 Settings → Pages 打开开关。

> 想让地址变成 `https://你的用户名.github.io`（不带 `/xb-oj` 后缀），
> 把仓库名改成 `你的用户名.github.io` 即可。

---

## 三、怎么加题

只改 `problems.js`，在数组里复制一份现有题目改字段就行，改完推到 GitHub 自动生效。

```js
{
  id: 'P006',                    // 编号，必须唯一
  title: '阶乘求和',
  difficulty: '简单',
  tags: ['循环', 'long long'],
  timeLimit: 1000,
  memoryLimit: 128,
  description: '<p>题面正文，可以直接写 HTML</p>',
  input: '输入格式说明',
  output: '输出格式说明',
  samples: [ { input: '3', output: '9' } ],
  tests: [
    { input: '1', output: '1' },
    { input: '3', output: '9' },
    { input: '20', output: '2561327494111820313' }   // 记得放极端数据
  ],
  hint: '提示文字，可以不写'
}
```

**造数据的三条铁律：**

1. 一定要有极端数据（n 取上界）。没有的话你的 OJ 会变成「本地能过，交上去 TLE」。
2. 判题时会自动忽略行末空格和末尾空行，所以输出结尾有没有换行都无所谓。
3. 有多解的题目（比如「输出任意一种方案」）需要 Special Judge，本版本不支持，出题时请避开。
4. 加题前自己写个正确程序把所有测试点跑一遍，确认期望输出是对的——写错答案会让所有人都 WA。

---

## 四、账号系统（Supabase）

点页面右上角就能注册、登录。注册需要填**邮箱**，密码至少 6 位。

账号、密码全部由 Supabase 服务端保管，**前端根本碰不到密码原文**。
注册后要先去邮箱点开验证邮件才能登录。跨设备可用。

连接信息写在 `assets/config.js` 里，改那里的 `supabaseUrl` 和 `supabaseKey` 就能换项目。
（Supabase 的 publishable key 是设计成公开的，数据安全靠数据库 RLS 策略保护。）

### 初始化数据库（新项目必做一次）

用户角色存在 `profiles` 表里。**不执行这个脚本，后台管理用不了。**

1. Supabase 后台 → 左侧 **SQL Editor** → 新建查询
2. 把仓库里的 `supabase-setup.sql` 整段复制进去 → 点 **Run**
3. 脚本最后会列出所有用户，确认你自己的 `role` 是 `owner`

脚本做了这些事：建 `profiles` 表、配好 RLS 策略、新用户自动建档、
给老用户补档案、把指定邮箱设为主理人。

⚠️ 脚本第 7 行要把邮箱改成你注册用的真实邮箱。

### 角色与管理员后台

| 角色 | 权限 |
|------|------|
| `owner` 主理人 | 最高权限。看用户列表、改任何人的角色、停用/启用账号 |
| `admin` 管理员 | 只能看用户列表，不能改 |
| `user` 普通用户 | 只能管自己 |

管理员登录后，页面顶部会出现「用户管理」面板，可以直接改角色和停用账号。
改完即时生效。被停用的用户下次登录会被强制登出。

> 不能改自己的角色，防止不小心把自己降权。
> 角色判定在服务端（RLS 策略），前端改不了别人的数据。

### 改密码 / 忘记密码

- **已登录想改密码**：设置 → 修改密码
- **忘了密码**：登录框填邮箱 → 点「忘记密码」→ 去邮箱点链接重设
- **帮别人改密码**：Supabase 后台 → `Authentication` → `Users` → 点用户 → 发送重置邮件

### 注册失败怎么排查

点「设置」里的**测试连接**，它会列出：地址、key、SDK 从哪个 CDN 加载、
连通耗时、项目返回什么、**profiles 表建好没**。常见问题：

| 提示 | 原因和办法 |
|------|-----------|
| 当前是 file:// 打开的 | 双击打开 html 会失败。改用 `python -m http.server 8123` 后访问 localhost |
| SDK 加载失败（已试 3 个 CDN） | 连不上 jsdelivr / unpkg，换网络 |
| 连不上项目：fetch failed | `*.supabase.co` 在你网络下不通 |
| HTTP 401 Invalid API key | key 复制错了 |
| profiles 表还没建 | 去执行 `supabase-setup.sql` |
| 邮箱还没验证 | 去邮箱点开验证邮件再登录 |

### 关于安全性

密码由 Supabase 用 bcrypt 保管，服务端处理，前端接触不到。
`profiles` 表开了 RLS：普通用户只能读写自己的档案，
只有 owner 能改别人的角色——**就算有人改前端代码也越不过服务端这道墙**。

---

## 五、关于判题后端

默认使用 **Wandbox** 公共接口（<https://wandbox.org>），免费、无需注册、CORS 开放，支持 C++ 编译运行。

> ⚠️ **注意**：网上很多教程推荐的 Piston 公共接口（`emkc.org`）已于 **2026 年 2 月 15 日改为白名单制**，不再对公众开放。如果你照着旧教程做，会得到 "Public Piston API is now whitelist only" 的报错。

如果你想换成自己搭的判题机（比如本机 Docker 跑一个 Piston，判题更快、不限流）：

1. 点页面右上角「判题设置」
2. 后端选「自建 Piston」
3. 地址填 `http://localhost:2000/api/v2/piston/execute`

注意：GitHub Pages 是 HTTPS 页面，浏览器会拦截它请求 HTTP 地址。自建后端请在本地用 `localhost` 打开页面使用。

---

## 六、已知限制

- 公共接口有调用频率限制，测试点之间是串行执行并有间隔，题目测试点太多（比如 20 个以上）会比较慢
- 默认的本地账号模式没有服务端，通过记录存在浏览器本地（换浏览器或清缓存会丢）。想要跨设备就切到 Supabase 模式
- 测试数据明文写在 `problems.js` 里，公共仓库意味着答案是公开的。适合自用和学习，不适合办正式比赛
- 运行超时是前端计时兜底（默认 10 秒），不是严格的 CPU 时间限制

---

## 七、想更进一步？

等题目攒够、确定要长期用，可以考虑：

- 用 Docker 在本机跑 `hdu-judge-mini` 或 HydroOJ，获得真正的账号系统、榜单和比赛功能
- 申请 Oracle Cloud 永久免费 ARM 主机（注意：2026 年 6 月起额度已砍半为 2 核 12G），部署一个真正的 OJ

详细方案见 `XB-OJ-建设方案.md`。
