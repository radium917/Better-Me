/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 高级浅色（编辑部质感）：暖象牙纸底 + 墨炭文字 + 静谧鼠尾草绿点缀
        // 注：token 名沿用原语义，ink-* 由浅到较深的中性阶梯（浅色主题）
        ink: {
          950: '#e9e4d9', // 最外层/手机框外围（较深的中性）
          900: '#f3efe6', // 页面底、输入框
          850: '#ffffff', // 卡片（纯净纸面）
          800: '#f0ece2', // chip、头像、次级面板
          700: '#e2dccd', // 描边、开关关闭
          600: '#d0c8b6', // hover / active
          500: '#b5ac98',
        },
        paper: '#26251f', // 主文字（墨炭）
        muted: '#6a675c', // 次级文字
        faint: '#9c988a', // 更弱文字
        accent: {
          DEFAULT: '#4c5a3e', // 静谧鼠尾草绿（深）
          soft: '#79876a',
          dim: '#e8ece1', // 绿色浅色底
        },
        warn: '#b0813f', // 赭黄
        danger: '#b25239', // 陶土红
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        // 衬线：标题与点缀（编辑部质感）
        serif: ['Georgia', '"Times New Roman"', '"Songti SC"', 'STSong', 'serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        // 极轻的环境投影，营造纸面上悬浮的从容感
        soft: '0 1px 2px rgba(38,37,31,0.02), 0 10px 30px -20px rgba(38,37,31,0.16)',
        lift: '0 2px 6px rgba(38,37,31,0.04), 0 20px 48px -24px rgba(38,37,31,0.24)',
        glow: '0 1px 2px rgba(76,90,62,0.10), 0 16px 34px -16px rgba(76,90,62,0.45)',
      },
      letterSpacing: {
        tightish: '-0.01em',
      },
    },
  },
  plugins: [],
}
