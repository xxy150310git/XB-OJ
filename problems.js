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
  }
];
