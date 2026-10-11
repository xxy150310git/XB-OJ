/*
 * XB OJ 题库配置文件
 * ------------------------------------------------------------
 * 想加新题，照着下面任意一题复制一份改就行，不用动别的代码。
 *
 * 字段说明：
 *   id          题目编号，必须唯一，如 "P001"
 *   title       题目标题
 *   difficulty  难度标签，随便写，如 入门 / 简单 / 中等
 *   tags        知识点标签数组
 *   timeLimit   时间限制（毫秒）
 *   memoryLimit 内存限制（MB），目前仅展示用
 *   description 题面正文，可以直接写 HTML（<p> <code> <ul> 等）
 *   input       输入格式说明
 *   output      输出格式说明
 *   samples     样例数组，会展示给用户，也会在判题时先跑一遍
 *   tests       隐藏测试点数组，判题真正比对用的数据
 *   hint        提示，答对或答错都可以看
 *
 * 造测试数据三条铁律：
 *   1. 必须有极端数据（n 取上界）
 *   2. 输出结尾换行无所谓，判题时会自动忽略行末空格和末尾空行
 *   3. 有多解的题目要写 Special Judge，本版本暂不支持，请避免出多解题
 */

const PROBLEMS = [
  {
    id: 'P001',
    title: 'A + B Problem',
    difficulty: '入门',
    tags: ['顺序结构', '基础输入输出'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入两个整数 <code>a</code> 和 <code>b</code>，输出它们的和。</p>
      <p>这是每一本 C++ 教材的第一道题，也是你 OJ 之旅的起点。</p>
    `,
    input: '一行，两个用空格分隔的整数 a、b。',
    output: '一行，一个整数，表示 a + b 的结果。',
    samples: [
      { input: '1 2', output: '3' },
      { input: '10 20', output: '30' }
    ],
    tests: [
      { input: '1 2', output: '3' },
      { input: '0 0', output: '0' },
      { input: '-5 3', output: '-2' },
      { input: '-100 -250', output: '-350' },
      { input: '123456 654321', output: '777777' },
      { input: '1000000000 1000000000', output: '2000000000' },
      { input: '-1000000000 999999999', output: '-1' }
    ],
    hint: '注意 a、b 可能是负数，结果可能超过 10 位，int 的范围是 -2147483648 ~ 2147483647，本题保证不溢出。'
  },

  {
    id: 'P002',
    title: '累加求和',
    difficulty: '入门',
    tags: ['循环结构', 'for 语句'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个非负整数 <code>n</code>，计算并输出 <code>1 + 2 + 3 + ... + n</code> 的值。</p>
      <p>请<strong>用循环</strong>完成，直接打印公式结果不算通过本题的练习目的。</p>
    `,
    input: '一行，一个非负整数 n（0 ≤ n ≤ 10000）。',
    output: '一行，一个整数，表示累加的结果。',
    samples: [
      { input: '5', output: '15' },
      { input: '100', output: '5050' }
    ],
    tests: [
      { input: '0', output: '0' },
      { input: '1', output: '1' },
      { input: '5', output: '15' },
      { input: '100', output: '5050' },
      { input: '9999', output: '49995000' },
      { input: '10000', output: '50005000' }
    ],
    hint: 'n = 0 是很多人会漏掉的边界情况，循环一次都不执行时，和应该是 0。记得给累加变量初始化为 0。'
  },

  {
    id: 'P003',
    title: '数组最大值',
    difficulty: '简单',
    tags: ['数组', '打擂台'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个整数 <code>n</code>，接着输入 <code>n</code> 个整数，找出并输出其中的最大值。</p>
      <p>要求使用<strong>静态数组</strong>存储，数组大小开 105 即可。</p>
    `,
    input: '第一行一个整数 n（1 ≤ n ≤ 100）。第二行 n 个用空格分隔的整数，每个数的绝对值不超过 100000。',
    output: '一行，一个整数，表示这 n 个数中的最大值。',
    samples: [
      { input: '5\n3 9 2 7 5', output: '9' },
      { input: '3\n-1 -5 -3', output: '-1' }
    ],
    tests: [
      { input: '1\n42', output: '42' },
      { input: '5\n3 9 2 7 5', output: '9' },
      { input: '3\n-1 -5 -3', output: '-1' },
      { input: '6\n0 0 0 0 0 0', output: '0' },
      { input: '10\n-100000 -99999 1 2 3 4 5 6 7 8', output: '8' },
      { input: '4\n100000 -100000 99999 -99999', output: '100000' }
    ],
    hint: '打擂台法：先把最大值设成数组第一个元素，再从第二个开始逐个比较。不要习惯性地初始化成 0，那样在全是负数的情况下会出错。'
  },

  {
    id: 'P004',
    title: '素数判断',
    difficulty: '简单',
    tags: ['循环', '数学', '边界处理'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个整数 <code>n</code>，判断它是不是素数（质数）。</p>
      <p>素数定义：大于 1，且除了 1 和它本身之外没有其他正因数。</p>
      <p>如果是素数输出 <code>Yes</code>，否则输出 <code>No</code>。注意大小写。</p>
    `,
    input: '一行，一个整数 n（0 ≤ n ≤ 1000000）。',
    output: '一行，输出 Yes 或 No。',
    samples: [
      { input: '7', output: 'Yes' },
      { input: '8', output: 'No' }
    ],
    tests: [
      { input: '0', output: 'No' },
      { input: '1', output: 'No' },
      { input: '2', output: 'Yes' },
      { input: '3', output: 'Yes' },
      { input: '4', output: 'No' },
      { input: '9', output: 'No' },
      { input: '97', output: 'Yes' },
      { input: '100', output: 'No' },
      { input: '999983', output: 'Yes' },
      { input: '1000000', output: 'No' }
    ],
    hint: 'n ≤ 1 直接判 No，这是最容易漏的边界。判断时循环到 sqrt(n) 就够了，i * i <= n 的写法可以避免浮点误差。'
  },

  {
    id: 'P005',
    title: '数字反转',
    difficulty: '简单',
    tags: ['取位运算', 'while 循环'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个非负整数 <code>n</code>，把它各位数字倒过来输出。</p>
      <p>反转后<strong>高位多余的 0 要去掉</strong>。例如 120 反转后是 21，不是 021。</p>
    `,
    input: '一行，一个非负整数 n（0 ≤ n ≤ 1000000000）。',
    output: '一行，一个整数，表示反转后的结果。',
    samples: [
      { input: '123', output: '321' },
      { input: '120', output: '21' }
    ],
    tests: [
      { input: '0', output: '0' },
      { input: '7', output: '7' },
      { input: '10', output: '1' },
      { input: '120', output: '21' },
      { input: '1000', output: '1' },
      { input: '123456789', output: '987654321' },
      { input: '1000000000', output: '1' }
    ],
    hint: '每次用 n % 10 取出最后一位，累加到结果里：ans = ans * 10 + n % 10，然后 n /= 10。这个写法天然就去掉了前导零，不需要额外处理。'
  },

  /* ========================================================================
   * 以下为新题目（P006 ~ P040）
   * ======================================================================== */

  {
    id: 'P006',
    title: '鸡兔同笼',
    difficulty: '入门',
    tags: ['循环', '枚举', '方程组'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>一个笼子里关着若干只鸡和兔。鸡有 2 条腿，兔有 4 条腿。已知头的总数为 <code>n</code>，腿的总数为 <code>m</code>。</p>
      <p>求鸡和兔各有多少只。如果无解，输出 <code>No answer</code>。</p>
    `,
    input: '一行，两个整数 n 和 m（0 ≤ n, m ≤ 1000），分别表示头和腿的数量。',
    output: '一行，先输出鸡的数量再输出兔的数量，用空格分隔；无解输出 No answer。',
    samples: [
      { input: '35 94', output: '23 12' },
      { input: '1 3', output: 'No answer' }
    ],
    tests: [
      { input: '35 94', output: '23 12' },
      { input: '1 3', output: 'No answer' },
      { input: '0 0', output: '0 0' },
      { input: '10 20', output: '10 0' },
      { input: '10 40', output: '0 10' },
      { input: '3 14', output: 'No answer' },
      { input: '100 300', output: '50 50' }
    ],
    hint: '列方程：鸡 + 兔 = n，2×鸡 + 4×兔 = m。也可以直接枚举鸡的数量判断。注意非整数或无非负解都算无解。'
  },

  {
    id: 'P007',
    title: '斐波那契数列',
    difficulty: '入门',
    tags: ['递推', '循环', '数列'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>斐波那契数列的定义为：<code>F(1) = 1</code>，<code>F(2) = 1</code>，<code>F(n) = F(n-1) + F(n-2)</code>（n ≥ 3）。</p>
      <p>输入 <code>n</code>，输出第 <code>n</code> 项的值。</p>
    `,
    input: '一行，一个正整数 n（1 ≤ n ≤ 45）。',
    output: '一行，一个整数，表示第 n 项的值。',
    samples: [
      { input: '1', output: '1' },
      { input: '10', output: '55' }
    ],
    tests: [
      { input: '1', output: '1' },
      { input: '2', output: '1' },
      { input: '3', output: '2' },
      { input: '6', output: '8' },
      { input: '10', output: '55' },
      { input: '20', output: '6765' },
      { input: '45', output: '1134903170' }
    ],
    hint: '用两个变量滚动更新即可，不需要数组。注意第 45 项已经接近 int 上限，建议用 long long。'
  },

  {
    id: 'P008',
    title: '闰年判断',
    difficulty: '入门',
    tags: ['条件判断', '数学'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个年份 <code>y</code>，判断它是不是闰年。</p>
      <p>闰年规则：能被 400 整除，或者能被 4 整除但不能被 100 整除。</p>
      <p>是闰年输出 <code>leap year</code>，否则输出 <code>common year</code>。</p>
    `,
    input: '一行，一个正整数 y（1 ≤ y ≤ 10000）。',
    output: '一行，输出 leap year 或 common year。',
    samples: [
      { input: '2000', output: 'leap year' },
      { input: '1900', output: 'common year' },
      { input: '2024', output: 'leap year' }
    ],
    tests: [
      { input: '2000', output: 'leap year' },
      { input: '1900', output: 'common year' },
      { input: '2024', output: 'leap year' },
      { input: '1', output: 'common year' },
      { input: '4', output: 'leap year' },
      { input: '100', output: 'common year' },
      { input: '400', output: 'leap year' },
      { input: '2023', output: 'common year' }
    ],
    hint: '条件可以写成 (y % 400 == 0) || (y % 4 == 0 && y % 100 != 0)，注意运算符优先级，建议加括号。'
  },

  {
    id: 'P009',
    title: '字符统计',
    difficulty: '简单',
    tags: ['字符处理', 'ASCII', '桶计数'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个仅由小写字母组成的字符串 <code>s</code>，统计其中每个字母出现的次数，按字母顺序输出出现过的字母及其次数。</p>
    `,
    input: '一行，一个字符串 s，长度不超过 1000。',
    output: '若干行，每行一个字母和对应的出现次数，用空格分隔。只输出出现过的字母。',
    samples: [
      { input: 'abracadabra', output: 'a 5\nb 2\nc 1\nd 1\nr 2' }
    ],
    tests: [
      { input: 'abracadabra', output: 'a 5\nb 2\nc 1\nd 1\nr 2' },
      { input: 'aaaa', output: 'a 4' },
      { input: 'abcdefghij', output: 'a 1\nb 1\nc 1\nd 1\ne 1\nf 1\ng 1\nh 1\ni 1\nj 1' },
      { input: 'zzzzzz', output: 'z 6' },
      { input: 'mississippi', output: 'i 4\ns 4\nm 1\np 2' }
    ],
    hint: '开一个大小为 26 的数组当桶，下标用 s[i] - \'a\' 来定位。'
  },

  {
    id: 'P010',
    title: '冒泡排序',
    difficulty: '简单',
    tags: ['排序', '数组', '双重循环'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入 <code>n</code> 个整数，用<strong>冒泡排序</strong>将它们从小到大排序后输出。</p>
      <p>两个数之间用空格分隔，行末不要有多余空格。</p>
    `,
    input: '第一行一个整数 n（1 ≤ n ≤ 100）。第二行 n 个用空格分隔的整数。',
    output: '一行，排序后的 n 个整数，用空格分隔。',
    samples: [
      { input: '5\n3 1 4 1 5', output: '1 1 3 4 5' }
    ],
    tests: [
      { input: '5\n3 1 4 1 5', output: '1 1 3 4 5' },
      { input: '1\n42', output: '42' },
      { input: '6\n9 8 7 6 5 4', output: '4 5 6 7 8 9' },
      { input: '4\n2 2 2 2', output: '2 2 2 2' },
      { input: '5\n-5 0 5 -3 2', output: '-5 -3 0 2 5' },
      { input: '10\n5 4 3 2 1 1 2 3 4 5', output: '1 1 2 2 3 3 4 4 5 5' }
    ],
    hint: '冒泡排序的要点是两层循环：外层控制轮数，内层做相邻比较交换。注意控制内层循环的边界可以每轮减一。'
  },

  {
    id: 'P011',
    title: '最大公约数',
    difficulty: '简单',
    tags: ['数学', '辗转相除', '递归'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入两个正整数 <code>a</code> 和 <code>b</code>，求它们的最大公约数（GCD）。</p>
    `,
    input: '一行，两个正整数 a 和 b（1 ≤ a, b ≤ 1000000000）。',
    output: '一行，一个整数，表示最大公约数。',
    samples: [
      { input: '12 18', output: '6' },
      { input: '7 13', output: '1' }
    ],
    tests: [
      { input: '12 18', output: '6' },
      { input: '7 13', output: '1' },
      { input: '1 100', output: '1' },
      { input: '100 100', output: '100' },
      { input: '1000000000 500000000', output: '500000000' },
      { input: '123456 789012', output: '12' },
      { input: '999999937 999999937', output: '999999937' }
    ],
    hint: '用辗转相除法（欧几里得算法）：gcd(a, b) = gcd(b, a % b)，直到 b 为 0。注意数据范围，a、b 可能很大，要用 long long。'
  },

  {
    id: 'P012',
    title: '最小公倍数',
    difficulty: '简单',
    tags: ['数学', 'gcd', '公式'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入两个正整数 <code>a</code> 和 <code>b</code>，求它们的最小公倍数（LCM）。</p>
    `,
    input: '一行，两个正整数 a 和 b（1 ≤ a, b ≤ 1000000000）。',
    output: '一行，一个整数，表示最小公倍数。',
    samples: [
      { input: '4 6', output: '12' },
      { input: '7 13', output: '91' }
    ],
    tests: [
      { input: '4 6', output: '12' },
      { input: '7 13', output: '91' },
      { input: '1 5', output: '5' },
      { input: '100 100', output: '100' },
      { input: '12 18', output: '36' },
      { input: '1000000000 999999999', output: '999999999000000000' }
    ],
    hint: '公式：LCM(a, b) = a / GCD(a, b) * b。先做除法再做乘法可以避免中间结果溢出 long long。'
  },

  {
    id: 'P013',
    title: '完数判断',
    difficulty: '简单',
    tags: ['因子', '数学', '枚举'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>一个数如果恰好等于它的真因子（即除了自身以外的正因子）之和，就称为"完数"。例如 6 = 1 + 2 + 3，所以 6 是完数。</p>
      <p>输入一个整数 <code>n</code>，判断它是不是完数。是输出 <code>Yes</code>，否则输出 <code>No</code>。</p>
    `,
    input: '一行，一个正整数 n（1 ≤ n ≤ 100000）。',
    output: '一行，输出 Yes 或 No。',
    samples: [
      { input: '6', output: 'Yes' },
      { input: '28', output: 'Yes' },
      { input: '10', output: 'No' }
    ],
    tests: [
      { input: '6', output: 'Yes' },
      { input: '28', output: 'Yes' },
      { input: '10', output: 'No' },
      { input: '1', output: 'No' },
      { input: '496', output: 'Yes' },
      { input: '100', output: 'No' },
      { input: '8128', output: 'Yes' }
    ],
    hint: '枚举因子时循环到 sqrt(n) 即可，成对的因子一起累加。1 要算进去，n 本身不算。'
  },

  {
    id: 'P014',
    title: '数字金字塔',
    difficulty: '简单',
    tags: ['循环', '打印图形', '格式化输出'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个整数 <code>n</code>，输出一个 n 层的数字金字塔，第 i 层打印 i 个数字 i，居中对齐（右对齐亦可，以实际空格为准）。</p>
      <p>每行前导空格数为 <code>n - i</code>（每层数字用一个空格分隔）。</p>
    `,
    input: '一行，一个正整数 n（1 ≤ n ≤ 20）。',
    output: '共 n 行，构成数字金字塔。',
    samples: [
      { input: '5', output: '    1\n   2 2\n  3 3 3\n 4 4 4 4\n5 5 5 5 5' }
    ],
    tests: [
      { input: '1', output: '1' },
      { input: '2', output: ' 1\n2 2' },
      { input: '3', output: '  1\n 2 2\n3 3 3' },
      { input: '5', output: '    1\n   2 2\n  3 3 3\n 4 4 4 4\n5 5 5 5 5' },
      { input: '10', output: '         1\n        2 2\n       3 3 3\n      4 4 4 4\n     5 5 5 5 5\n    6 6 6 6 6 6\n   7 7 7 7 7 7 7\n  8 8 8 8 8 8 8 8\n 9 9 9 9 9 9 9 9 9\n10 10 10 10 10 10 10 10 10 10' }
    ],
    hint: '两层循环：外层控制行，内层先输出空格再输出数字。注意两位数时要整体当作一个"元素"。'
  },

  {
    id: 'P015',
    title: '二进制中 1 的个数',
    difficulty: '简单',
    tags: ['位运算', 'lowbit'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个非负整数 <code>n</code>，输出它的二进制表示中 1 的个数。</p>
    `,
    input: '一行，一个非负整数 n（0 ≤ n ≤ 2^31 - 1）。',
    output: '一行，一个整数，表示二进制中 1 的个数。',
    samples: [
      { input: '7', output: '3' },
      { input: '0', output: '0' }
    ],
    tests: [
      { input: '0', output: '0' },
      { input: '1', output: '1' },
      { input: '7', output: '3' },
      { input: '8', output: '1' },
      { input: '15', output: '4' },
      { input: '1023', output: '10' },
      { input: '2147483647', output: '31' }
    ],
    hint: '经典写法：while (n) { cnt++; n &= (n - 1); }。这个循环次数正好等于 1 的个数。'
  },

  {
    id: 'P016',
    title: '日期差值',
    difficulty: '中等',
    tags: ['日期处理', '模拟', '闰年'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入两个日期，格式为 <code>YYYY-MM-DD</code>，计算它们之间相差的天数（不含起始日，含结束日，即相邻日期相差 1 天）。</p>
    `,
    input: '两行，每行一个日期，格式为 YYYY-MM-DD，保证合法。两个日期不会是同一天。',
    output: '一行，一个整数，表示相差的天数。',
    samples: [
      { input: '2024-01-01\n2024-01-10', output: '9' },
      { input: '2023-12-31\n2024-01-01', output: '1' }
    ],
    tests: [
      { input: '2024-01-01\n2024-01-10', output: '9' },
      { input: '2023-12-31\n2024-01-01', output: '1' },
      { input: '2020-02-28\n2020-03-01', output: '2' },
      { input: '2021-02-28\n2021-03-01', output: '1' },
      { input: '2000-01-01\n2000-12-31', output: '365' },
      { input: '1900-01-01\n1901-01-01', output: '365' },
      { input: '2000-01-01\n2001-01-01', output: '366' }
    ],
    hint: '可以把每个日期转换成一个"从某个基准日起过了多少天"的整数，两个相减取绝对值即可。闰年 2 月有 29 天。'
  },

  {
    id: 'P017',
    title: '进制转换（十转十六）',
    difficulty: '简单',
    tags: ['进制转换', '栈', '取余'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个非负整数 <code>n</code>，把它转换成十六进制并输出，字母用大写。</p>
    `,
    input: '一行，一个非负整数 n（0 ≤ n ≤ 2^31 - 1）。',
    output: '一行，n 的十六进制表示（大写，不含前导零，0 输出 0）。',
    samples: [
      { input: '255', output: 'FF' },
      { input: '0', output: '0' }
    ],
    tests: [
      { input: '0', output: '0' },
      { input: '10', output: 'A' },
      { input: '255', output: 'FF' },
      { input: '4096', output: '1000' },
      { input: '65535', output: 'FFFF' },
      { input: '2147483647', output: '7FFFFFFF' }
    ],
    hint: '不断 n % 16 取余得到每一位的数字，用栈或字符串倒序拼起来。余数 10~15 对应 A~F。'
  },

  {
    id: 'P018',
    title: '字符串反转',
    difficulty: '入门',
    tags: ['字符串', '双指针'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个字符串 <code>s</code>，将其反转后输出。</p>
    `,
    input: '一行，一个字符串 s，长度不超过 1000，不含空格。',
    output: '一行，反转后的字符串。',
    samples: [
      { input: 'hello', output: 'olleh' },
      { input: 'abc', output: 'cba' }
    ],
    tests: [
      { input: 'hello', output: 'olleh' },
      { input: 'a', output: 'a' },
      { input: 'ab', output: 'ba' },
      { input: 'racecar', output: 'racecar' },
      { input: 'xbonline', output: 'enilnobx' },
      { input: 'aA1!b', output: 'b!1Aa' }
    ],
    hint: '用两个指针从两端向中间交换，或者直接用字符串倒序输出。'
  },

  {
    id: 'P019',
    title: 'N 的阶乘',
    difficulty: '中等',
    tags: ['高精度', '大整数', '模拟'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个整数 <code>n</code>，计算并输出 <code>n!</code>（n 的阶乘）的精确值。</p>
    `,
    input: '一行，一个非负整数 n（0 ≤ n ≤ 1000）。',
    output: '一行，n! 的精确值。',
    samples: [
      { input: '5', output: '120' },
      { input: '0', output: '1' }
    ],
    tests: [
      { input: '0', output: '1' },
      { input: '1', output: '1' },
      { input: '5', output: '120' },
      { input: '10', output: '3628800' },
      { input: '20', output: '2432902008176640000' },
      { input: '50', output: '30414093201713378043612608166064768844377641568960512000000000000' },
      { input: '100', output: '93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000' }
    ],
    hint: 'n 稍大就会超过 long long，需要用数组（或 vector）按位存大整数，模拟手算乘法。'
  },

  {
    id: 'P020',
    title: '多项式求和',
    difficulty: '简单',
    tags: ['级数', '精度', '循环'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入 <code>x</code> 和 <code>n</code>，计算并输出 <code>1 + x + x²/2! + x³/3! + ... + xⁿ/n!</code> 的值，保留 4 位小数。</p>
    `,
    input: '一行，两个实数 x（0 ≤ x ≤ 10）和整数 n（1 ≤ n ≤ 20），用空格分隔。',
    output: '一行，一个实数，保留 4 位小数。',
    samples: [
      { input: '1.0 5', output: '2.7167' },
      { input: '2.0 10', output: '7.3891' }
    ],
    tests: [
      { input: '1.0 5', output: '2.7167' },
      { input: '2.0 10', output: '7.3891' },
      { input: '0.0 5', output: '1.0000' },
      { input: '3.0 20', output: '20.0855' },
      { input: '10.0 20', output: '22026.4648' }
    ],
    hint: '每一项可以由前一项推出：term = term * x / i。这样避免了重复算阶乘和幂，精度也更好。'
  },

  {
    id: 'P021',
    title: '二维数组行列互换',
    difficulty: '简单',
    tags: ['二维数组', '矩阵转置'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个 <code>n × m</code> 的矩阵，输出它的<strong>转置矩阵</strong>（行列互换）。</p>
    `,
    input: '第一行两个整数 n、m（1 ≤ n, m ≤ 100）。接下来 n 行，每行 m 个整数。',
    output: 'm 行，每行 n 个整数，为转置后的矩阵，数之间用空格分隔。',
    samples: [
      { input: '2 3\n1 2 3\n4 5 6', output: '1 4\n2 5\n3 6' }
    ],
    tests: [
      { input: '2 3\n1 2 3\n4 5 6', output: '1 4\n2 5\n3 6' },
      { input: '1 5\n1 2 3 4 5', output: '1\n2\n3\n4\n5' },
      { input: '3 3\n1 2 3\n4 5 6\n7 8 9', output: '1 4 7\n2 5 8\n3 6 9' },
      { input: '4 2\n1 2\n3 4\n5 6\n7 8', output: '1 3 5 7\n2 4 6 8' }
    ],
    hint: '原来的 a[i][j] 变成 b[j][i]，注意输入输出时行列数反过来了。'
  },

  {
    id: 'P022',
    title: '蛇形矩阵',
    difficulty: '中等',
    tags: ['模拟', '矩阵', '思维'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个整数 <code>n</code>，输出一个 <code>n × n</code> 的蛇形矩阵：从右上角开始，按斜线方向来回填充 1 到 n²。</p>
      <p>即先沿副对角线方向填，到边界后折返，形似蛇行。</p>
    `,
    input: '一行，一个正整数 n（1 ≤ n ≤ 20）。',
    output: 'n 行，每行 n 个整数，用空格分隔。',
    samples: [
      { input: '3', output: '7 6 5\n8 1 4\n9 2 3' }
    ],
    tests: [
      { input: '1', output: '1' },
      { input: '2', output: '4 3\n1 2' },
      { input: '3', output: '7 6 5\n8 1 4\n9 2 3' },
      { input: '4', output: '16 15 14 13\n9 10 11 12\n8 7 6 5\n1 2 3 4' },
      { input: '5', output: '21 20 19 18 17\n22 13 12 11 16\n23 14 7 10 15\n24 5 6 9 4\n25 2 3 8 1' }
    ],
    hint: '按"对角线"分组，每条对角线上横纵坐标之和是固定的。注意方向的来回交替。'
  },

  {
    id: 'P023',
    title: '简单计算器',
    difficulty: '入门',
    tags: ['字符处理', 'switch', '分支'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个表达式，格式为 <code>a op b</code>，其中 op 是 <code>+</code>、<code>-</code>、<code>*</code>、<code>/</code> 之一。</p>
      <p>输出运算结果。除法为整数除法（向零取整）。</p>
    `,
    input: '一行，a、op、b 用空格分隔。a、b 为整数（-1000 ≤ a, b ≤ 1000）。',
    output: '一行，运算结果。若除数为 0，输出 Error。',
    samples: [
      { input: '3 + 5', output: '8' },
      { input: '10 / 3', output: '3' },
      { input: '5 / 0', output: 'Error' }
    ],
    tests: [
      { input: '3 + 5', output: '8' },
      { input: '3 - 5', output: '-2' },
      { input: '3 * 5', output: '15' },
      { input: '10 / 3', output: '3' },
      { input: '-10 / 3', output: '-3' },
      { input: '5 / 0', output: 'Error' },
      { input: '0 / 1', output: '0' }
    ],
    hint: '用 switch 或 if-else 判断运算符。C++ 里整数除法是向零截断的，正好是题目要的效果。注意判除零。'
  },

  {
    id: 'P024',
    title: '统计单词个数',
    difficulty: '简单',
    tags: ['字符串', '空格处理', '状态机'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一行字符串（可能包含多个连续空格），统计其中单词的个数。单词由连续的非空格字符组成。</p>
    `,
    input: '一行字符串，长度不超过 1000，可能包含前导或尾随空格。',
    output: '一行，一个整数，表示单词个数。',
    samples: [
      { input: '  hello   world  ', output: '2' }
    ],
    tests: [
      { input: '  hello   world  ', output: '2' },
      { input: 'a b c d e', output: '5' },
      { input: 'single', output: '1' },
      { input: '   ', output: '0' },
      { input: '', output: '0' },
      { input: 'one  two   three    four', output: '4' }
    ],
    hint: '记录上一次遇到的是不是空格，当遇到"从空格变成非空格"的那一刻，单词数加一。'
  },

  {
    id: 'P025',
    title: '01 背包问题',
    difficulty: '中等',
    tags: ['动态规划', '背包'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>有 <code>n</code> 件物品，每件物品有重量 <code>w[i]</code> 和价值 <code>v[i]</code>。背包容量为 <code>C</code>。</p>
      <p>每件物品只能选一次，求能装入背包的物品的最大总价值。</p>
    `,
    input: '第一行两个整数 n、C（1 ≤ n ≤ 100，1 ≤ C ≤ 1000）。接下来 n 行每行两个整数 w[i]、v[i]。',
    output: '一行，一个整数，表示最大总价值。',
    samples: [
      { input: '3 10\n3 4\n4 5\n5 6', output: '11' }
    ],
    tests: [
      { input: '3 10\n3 4\n4 5\n5 6', output: '11' },
      { input: '1 5\n6 10', output: '0' },
      { input: '5 10\n2 6\n2 3\n6 5\n5 4\n4 6', output: '15' },
      { input: '4 8\n5 3\n4 5\n3 2\n2 4', output: '9' },
      { input: '10 100\n10 20\n20 30\n30 40\n40 50\n50 60\n10 15\n20 25\n30 35\n40 45\n50 55', output: '165' }
    ],
    hint: '一维 dp 数组从后往前更新：dp[j] = max(dp[j], dp[j - w[i]] + v[i])。注意内层循环 j 要从 C 递减到 w[i]。'
  },

  {
    id: 'P026',
    title: '最长上升子序列',
    difficulty: '中等',
    tags: ['动态规划', 'LIS', '二分'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个序列 <code>a</code>，求它的最长严格上升子序列的长度。</p>
      <p>子序列不要求连续，但要求严格递增。</p>
    `,
    input: '第一行一个整数 n（1 ≤ n ≤ 1000）。第二行 n 个整数。',
    output: '一行，一个整数，表示最长严格上升子序列的长度。',
    samples: [
      { input: '6\n1 3 5 2 4 6', output: '4' }
    ],
    tests: [
      { input: '6\n1 3 5 2 4 6', output: '4' },
      { input: '1\n5', output: '1' },
      { input: '5\n5 4 3 2 1', output: '1' },
      { input: '5\n1 2 3 4 5', output: '5' },
      { input: '8\n10 9 2 5 3 7 101 18', output: '4' },
      { input: '10\n1 1 1 1 1 1 1 1 1 1', output: '1' }
    ],
    hint: 'dp[i] 表示以 a[i] 结尾的 LIS 长度，状态转移：dp[i] = max(dp[j]) + 1，其中 j < i 且 a[j] < a[i]。n ≤ 1000 的 O(n²) 做法足够。'
  },

  {
    id: 'P027',
    title: '杨辉三角',
    difficulty: '简单',
    tags: ['二维数组', '递推', '组合数'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个整数 <code>n</code>，输出杨辉三角的前 <code>n</code> 行。</p>
      <p>杨辉三角的第 i 行第 j 个数等于它上方和左上方两个数之和。</p>
    `,
    input: '一行，一个正整数 n（1 ≤ n ≤ 20）。',
    output: '共 n 行，每行若干整数用空格分隔，行末不要有多余空格。',
    samples: [
      { input: '5', output: '1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1' }
    ],
    tests: [
      { input: '1', output: '1' },
      { input: '3', output: '1\n1 1\n1 2 1' },
      { input: '5', output: '1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1' },
      { input: '10', output: '1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1\n1 5 10 10 5 1\n1 6 15 20 15 6 1\n1 7 21 35 35 21 7 1\n1 8 28 56 70 56 28 8 1\n1 9 36 84 126 126 84 36 9 1' }
    ],
    hint: '每行首尾都是 1，中间元素 a[i][j] = a[i-1][j-1] + a[i-1][j]。可以只用一个一维数组滚动更新。'
  },

  {
    id: 'P028',
    title: '水仙花数',
    difficulty: '入门',
    tags: ['取位', '数学', '枚举'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>水仙花数（阿姆斯特朗数）是指一个 n 位数，它的每个位上的数字的 n 次幂之和等于它本身。例如 153 = 1³ + 5³ + 3³。</p>
      <p>输入两个整数 <code>a</code>、<code>b</code>，输出 <code>[a, b]</code> 范围内的所有水仙花数，每行一个。如果不存在，输出 <code>None</code>。</p>
    `,
    input: '一行，两个整数 a、b（1 ≤ a ≤ b ≤ 1000000）。',
    output: '若干行，每行一个水仙花数；没有则输出 None。',
    samples: [
      { input: '100 400', output: '153\n370\n371' }
    ],
    tests: [
      { input: '100 400', output: '153\n370\n371' },
      { input: '1 10', output: '1\n2\n3\n4\n5\n6\n7\n8\n9' },
      { input: '400 999', output: '407' },
      { input: '1000 10000', output: '1634\n8208\n9474' },
      { input: '999 1000', output: 'None' }
    ],
    hint: '先算位数，再逐位取数字求幂求和。可以把 0~9 的若干次幂预处理出来，避免重复计算。'
  },

  {
    id: 'P029',
    title: '括号匹配',
    difficulty: '中等',
    tags: ['栈', '字符串'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个仅由 <code>(</code> 和 <code>)</code> 组成的字符串 <code>s</code>，判断括号是否匹配。</p>
      <p>匹配输出 <code>YES</code>，否则输出 <code>NO</code>。</p>
    `,
    input: '一行，一个字符串 s，长度不超过 100000。',
    output: '一行，输出 YES 或 NO。',
    samples: [
      { input: '(())', output: 'YES' },
      { input: '(()', output: 'NO' }
    ],
    tests: [
      { input: '(())', output: 'YES' },
      { input: '(()', output: 'NO' },
      { input: '()()()', output: 'YES' },
      { input: '((()))', output: 'YES' },
      { input: ')(', output: 'NO' },
      { input: '', output: 'YES' },
      { input: '(((())))()((()))', output: 'YES' }
    ],
    hint: '用栈：遇到左括号入栈，遇到右括号看栈顶是否匹配且栈非空。遍历完后栈必须为空才合法。'
  },

  {
    id: 'P030',
    title: '最大子段和',
    difficulty: '中等',
    tags: ['动态规划', '贪心', '前缀和'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个整数序列 <code>a</code>，求它的最大连续子段和。</p>
      <p>如果全为负数，输出最大的那个负数。</p>
    `,
    input: '第一行一个整数 n（1 ≤ n ≤ 100000）。第二行 n 个整数，每个数的绝对值不超过 10000。',
    output: '一行，一个整数，表示最大连续子段和。',
    samples: [
      { input: '6\n-2 11 -4 13 -5 -2', output: '20' }
    ],
    tests: [
      { input: '6\n-2 11 -4 13 -5 -2', output: '20' },
      { input: '1\n-5', output: '-5' },
      { input: '5\n-1 -2 -3 -4 -5', output: '-1' },
      { input: '5\n1 2 3 4 5', output: '15' },
      { input: '8\n4 -3 5 -2 -1 2 6 -2', output: '11' },
      { input: '10\n-5 6 -2 4 -8 3 2 -1 5 -3', output: '9' }
    ],
    hint: 'dp[i] 表示以 a[i] 结尾的最大子段和，转移：dp[i] = max(a[i], dp[i-1] + a[i])。或者直接维护前缀和最小值。'
  },

  {
    id: 'P031',
    title: '绝对值排序',
    difficulty: '简单',
    tags: ['排序', '自定义比较'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入 <code>n</code> 个整数，按<strong>绝对值</strong>从小到大排序后输出。若绝对值相同，则按原值从小到大排序。</p>
    `,
    input: '第一行一个整数 n（1 ≤ n ≤ 1000）。第二行 n 个整数。',
    output: '一行，排序后的 n 个整数，用空格分隔。',
    samples: [
      { input: '5\n-3 2 -2 3 1', output: '1 2 -2 3 -3' }
    ],
    tests: [
      { input: '5\n-3 2 -2 3 1', output: '1 2 -2 3 -3' },
      { input: '1\n0', output: '0' },
      { input: '4\n5 -5 3 -3', output: '3 -3 5 -5' },
      { input: '6\n0 -1 1 -2 2 3', output: '0 -1 1 -2 2 3' }
    ],
    hint: '用 sort 加自定义比较函数：return abs(a) != abs(b) ? abs(a) < abs(b) : a < b;'
  },

  {
    id: 'P032',
    title: '矩阵乘法',
    difficulty: '中等',
    tags: ['二维数组', '矩阵', '模拟'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入两个矩阵 <code>A</code>（n × m）和 <code>B</code>（m × k），计算并输出它们的乘积 <code>C = A × B</code>。</p>
    `,
    input: '第一行三个整数 n、m、k（1 ≤ n, m, k ≤ 100）。接着是 A 矩阵（n 行 m 列），然后是 B 矩阵（m 行 k 列）。',
    output: 'n 行，每行 k 个整数，用空格分隔。',
    samples: [
      { input: '2 3 2\n1 2 3\n4 5 6\n1 2\n3 4\n5 6', output: '22 28\n49 64' }
    ],
    tests: [
      { input: '2 3 2\n1 2 3\n4 5 6\n1 2\n3 4\n5 6', output: '22 28\n49 64' },
      { input: '1 3 1\n1 2 3\n4\n5\n6', output: '32' },
      { input: '2 2 2\n1 0\n0 1\n1 2\n3 4', output: '1 2\n3 4' },
      { input: '3 3 3\n1 2 3\n4 5 6\n7 8 9\n9 8 7\n6 5 4\n3 2 1', output: '30 24 18\n84 69 54\n138 114 90' }
    ],
    hint: 'C[i][j] = Σ A[i][t] * B[t][j]。注意输入量较大，用 scanf 读取更快。'
  },

  {
    id: 'P033',
    title: '汉诺塔步数',
    difficulty: '简单',
    tags: ['递归', '数学', '分治'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>汉诺塔问题中，将 <code>n</code> 个盘子从一根柱子移到另一根柱子，最少需要移动 <code>2ⁿ - 1</code> 步。</p>
      <p>输入 <code>n</code>，输出最少步数。</p>
    `,
    input: '一行，一个正整数 n（1 ≤ n ≤ 31）。',
    output: '一行，一个整数，表示最少步数。',
    samples: [
      { input: '3', output: '7' },
      { input: '1', output: '1' }
    ],
    tests: [
      { input: '1', output: '1' },
      { input: '2', output: '3' },
      { input: '3', output: '7' },
      { input: '10', output: '1023' },
      { input: '20', output: '1048575' },
      { input: '31', output: '2147483647' }
    ],
    hint: '答案是 2^n - 1。n 最大为 31，结果正好在 int 范围内；用 1LL << n 避免位移时的溢出。'
  },

  {
    id: 'P034',
    title: '链表去重',
    difficulty: '中等',
    tags: ['链表', '指针', '结构体'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个整数序列，用<strong>单链表</strong>存储，删除其中<strong>值重复</strong>的结点（只保留第一次出现的），输出去重后的链表。</p>
    `,
    input: '第一行一个整数 n（1 ≤ n ≤ 100000）。第二行 n 个整数。',
    output: '一行，去重后的链表元素，用空格分隔。',
    samples: [
      { input: '7\n1 2 2 3 3 3 4', output: '1 2 3 4' }
    ],
    tests: [
      { input: '7\n1 2 2 3 3 3 4', output: '1 2 3 4' },
      { input: '1\n5', output: '5' },
      { input: '5\n1 1 1 1 1', output: '1' },
      { input: '6\n2 1 2 1 3 2', output: '2 1 3' },
      { input: '8\n5 4 3 2 1 1 2 3', output: '5 4 3 2 1' }
    ],
    hint: '用哈希表或数组记录某个值是否已经出现过。遍历链表，遇到重复的就跳过（前驱 next 指向后继）。'
  },

  {
    id: 'P035',
    title: '质数筛',
    difficulty: '中等',
    tags: ['筛法', '素数', '预处理'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个整数 <code>n</code>，用<strong>埃拉托斯特尼筛法</strong>求出并输出 1 到 n 之间所有的素数，每行输出 10 个，用空格分隔。</p>
    `,
    input: '一行，一个整数 n（1 ≤ n ≤ 1000000）。',
    output: '每行 10 个素数，空格分隔。',
    samples: [
      { input: '20', output: '2 3 5 7 11 13 17 19' }
    ],
    tests: [
      { input: '10', output: '2 3 5 7' },
      { input: '20', output: '2 3 5 7 11 13 17 19' },
      { input: '30', output: '2 3 5 7 11 13 17 19 23 29' },
      { input: '2', output: '2' },
      { input: '1', output: '' }
    ],
    hint: '筛法：从 2 开始，把每个素数的倍数都标记为非素数。外层循环到 sqrt(n) 即可。用 bool 数组标记，注意内存。'
  },

  {
    id: 'P036',
    title: '简易加密',
    difficulty: '简单',
    tags: ['字符串', '字符变换', '凯撒密码'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个只含小写字母的字符串 <code>s</code> 和一个整数 <code>k</code>，将每个字母替换为字母表中其后第 k 个字母（循环，z 之后回到 a）。</p>
      <p>输出加密后的字符串。</p>
    `,
    input: '第一行一个字符串 s（长度不超过 1000）。第二行一个整数 k（0 ≤ k ≤ 1000）。',
    output: '一行，加密后的字符串。',
    samples: [
      { input: 'abc\n1', output: 'bcd' },
      { input: 'xyz\n2', output: 'zab' }
    ],
    tests: [
      { input: 'abc\n1', output: 'bcd' },
      { input: 'xyz\n2', output: 'zab' },
      { input: 'a\n26', output: 'a' },
      { input: 'hello\n5', output: 'mjqqt' },
      { input: 'z\n1', output: 'a' }
    ],
    hint: '先把 k 对 26 取模，然后 c = (c - \'a\' + k) % 26 + \'a\'。'
  },

  {
    id: 'P037',
    title: '成绩等级',
    difficulty: '入门',
    tags: ['条件判断', '分支'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入一个 0 到 100 的整数分数，按以下规则输出等级：</p>
      <ul>
        <li>90 分及以上：A</li>
        <li>80~89：B</li>
        <li>70~79：C</li>
        <li>60~69：D</li>
        <li>60 以下：E</li>
      </ul>
    `,
    input: '一行，一个整数 s（0 ≤ s ≤ 100）。',
    output: '一行，一个字母，表示等级。',
    samples: [
      { input: '85', output: 'B' },
      { input: '59', output: 'E' }
    ],
    tests: [
      { input: '100', output: 'A' },
      { input: '90', output: 'A' },
      { input: '85', output: 'B' },
      { input: '80', output: 'B' },
      { input: '75', output: 'C' },
      { input: '70', output: 'C' },
      { input: '65', output: 'D' },
      { input: '60', output: 'D' },
      { input: '59', output: 'E' },
      { input: '0', output: 'E' }
    ],
    hint: '可以用 if-else 链，也可以用 s / 10 的方式做映射。注意边界值。'
  },

  {
    id: 'P038',
    title: '求 π 的近似值',
    difficulty: '简单',
    tags: ['级数', '精度', '浮点'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>利用莱布尼茨公式 <code>π/4 = 1 - 1/3 + 1/5 - 1/7 + 1/9 - ...</code> 计算 π 的近似值，直到最后一项的绝对值小于 1e-6 为止。</p>
      <p>输出结果，保留 6 位小数。</p>
    `,
    input: '无输入。',
    output: '一行，π 的近似值，保留 6 位小数。',
    samples: [
      { input: '', output: '3.141594' }
    ],
    tests: [
      { input: '', output: '3.141594' }
    ],
    hint: '用 while 循环累加各项，符号交替用 flag = -flag 实现。最后结果乘 4。'
  },

  {
    id: 'P039',
    title: '字符串中查找子串',
    difficulty: '中等',
    tags: ['字符串', 'KMP', '模式匹配'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入两个字符串 <code>s</code> 和 <code>p</code>，输出 <code>p</code> 在 <code>s</code> 中<strong>第一次出现的位置</strong>（下标从 0 开始）。若未出现，输出 <code>-1</code>。</p>
    `,
    input: '两行，第一行主串 s，第二行模式串 p。长度均不超过 1000000。',
    output: '一行，一个整数，表示第一次出现的位置（下标从 0 开始），未找到输出 -1。',
    samples: [
      { input: 'ababcabcacbab\nabcac', output: '5' }
    ],
    tests: [
      { input: 'ababcabcacbab\nabcac', output: '5' },
      { input: 'hello\nll', output: '2' },
      { input: 'aaaaa\nbb', output: '-1' },
      { input: 'aaa\naaa', output: '0' },
      { input: 'abcdefgh\ncde', output: '2' },
      { input: 'a\n', output: '-1' }
    ],
    hint: '可以用 KMP，也可以直接调用 string::find。注意空串和没找到的情况。'
  },

  {
    id: 'P040',
    title: '大整数加法',
    difficulty: '中等',
    tags: ['高精度', '大整数', '模拟'],
    timeLimit: 1000,
    memoryLimit: 128,
    description: `
      <p>输入两个非负整数 <code>a</code> 和 <code>b</code>（长度可达 1000 位），计算并输出它们的和。</p>
    `,
    input: '两行，每行一个大整数，不含前导零（0 本身除外）。',
    output: '一行，两数之和。',
    samples: [
      { input: '123456789\n987654321', output: '1111111110' }
    ],
    tests: [
      { input: '123456789\n987654321', output: '1111111110' },
      { input: '0\n0', output: '0' },
      { input: '999\n1', output: '1000' },
      { input: '1\n999', output: '1000' },
      { input: '123\n456', output: '579' },
      { input: '99999999999999999999\n1', output: '100000000000000000000' }
    ],
    hint: '用字符串读入，倒序存进数组，按位相加并处理进位。注意最高位可能产生的进位。'
  }
];

module.exports = PROBLEMS;
