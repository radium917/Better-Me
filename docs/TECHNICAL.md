# Better Me 技术实现说明

更新时间：2026-09-21

## 1. 架构概览

Better Me 是一个无后端的单页应用：

```text
React 页面与组件
        |
React Router 路由与访问守卫
        |
Zustand 全局状态与业务 action
        |
localStorage 持久化
```

Vite 负责开发和构建，Tailwind CSS 负责样式。应用没有环境变量、服务端接口或数据库依赖。

## 2. 目录说明

```text
src/
├── App.tsx                  # 手机框架、路由、登录与引导守卫
├── main.tsx                 # React 入口
├── index.css                # 全局样式和复用组件类
├── types.ts                 # 领域模型
├── components/
│   ├── BottomNav.tsx        # 一级导航及同行刷新
│   ├── CheckInCard.tsx      # 动态/历史打卡卡片
│   ├── GoalCard.tsx         # 个人目标摘要
│   ├── TopBar.tsx           # 二级页面顶部栏
│   └── icons.tsx            # 轻量 UI 图标
├── lib/
│   ├── date.ts              # 日期、连续记录和完成率
│   ├── feed.ts              # 同行动态排序
│   ├── seed.ts              # 模板、同行者和 mock 内容
│   ├── selectors.ts         # 模板、用户和心情查询
│   └── store.ts             # Zustand 状态、业务 action 和迁移
└── pages/                   # 路由页面
```

## 3. 路由与状态守卫

`App.tsx` 中包含两级守卫：

- `RequireAuth`：要求 `authed === true`，用于目标选择和目标设置。
- `RequireOnboarded`：同时要求登录并完成引导，用于发布和个人功能。

公开路由：

- `/` 自动跳转到 `/community`。
- `/community`、`/community/:templateId` 和 `/checkin/:id` 允许访客浏览。
- `/me` 对访客展示注册引导，注册后才展示个人资料与目标。

个人目标详情、发布、通知、资料编辑和设置仍由守卫保护。公开页面中的点赞、评论、举报和拉黑等写操作会先检查登录状态。

这两个状态不能互相替代：

- `authed` 表示当前会话已登录。
- `onboarded` 表示账号曾完成首个目标创建。

退出登录只清除 `authed`，因此再次登录后可以跳过首次引导；注销账号会同时重置两者及个人数据。

## 4. 全局状态

核心状态位于 `src/lib/store.ts`：

- `user`：当前用户资料、积分、黑名单和佩戴勋章。
- `peers`：mock 同行者。
- `goals`：个人目标和 mock 同行者目标。
- `checkIns`：个人与 mock 打卡。
- `comments`：评论。
- `badges`：已获得勋章。
- `notifications`：通知记录。
- `prefs`：通知偏好。
- `unlockedExtraSlot`：第 4 个目标名额状态。
- `authed` / `onboarded`：登录与引导状态。

主要 action：

- 注册登录、退出、注销和资料更新
- 创建目标与修改目标状态
- 发布、删除和点赞打卡
- 新增与删除评论
- 佩戴勋章和积分兑换
- 举报、拉黑与解除拉黑
- 通知读取和偏好修改

## 5. 持久化与迁移

Zustand `persist` 使用键名：

```text
better-me-store
```

当前 schema 版本为 `3`。

v3 迁移行为：

- 移除旧的 `seed_` 打卡并加载当前真实图片 mock。
- 保留用户自己的目标、打卡、资料和设置。
- 清理旧版本用户打卡中的 emoji 图片占位。

修改持久化数据结构时必须递增版本并提供兼容迁移，避免用户浏览器中的旧状态覆盖新种子或导致页面异常。

## 6. 图片链路

### mock 图片

`src/lib/seed.ts` 使用项目指定的文本生成图片服务，按跑步、日出、阅读和早睡场景加载横向真实图片。

### 用户图片

`Publish.tsx` 提供两个文件输入：

- 相册：`accept="image/*"`
- 拍照：`accept="image/*" capture="environment"`

选择后执行：

1. `FileReader` 读取本地图片。
2. `Image` 解码。
3. Canvas 将最长边限制在 `1600px`。
4. 使用 JPEG `0.82` 质量压缩。
5. 结果以 data URL 写入打卡并持久化。

当前实现适合 Demo 和少量图片。生产环境应改为对象存储，只在业务数据中保存 URL；否则多张图片可能达到浏览器 localStorage 容量上限。

## 7. 打卡与统计

`date.ts` 统一使用本地自然日，并以周一作为自然周起点。

每日目标：

- 有效性按自然日去重。
- 当前连续允许今天尚未完成时从昨天开始统计。
- 历史最长按相邻自然日计算。

每周目标：

- 每周有效次数不超过目标次数。
- 过去自然周达到目标才进入连续累计。
- 当前周不提前判定失败。
- 连续值与历史最长值累计达标周期内的实际打卡次数。

近 30 天完成率：

- 每日目标分母为 30。
- 每周目标按 `30 / 7 × 每周次数` 估算期望次数。
- 结果最高为 100%。

## 8. 动态流

`feed.ts` 使用确定性评分排序：

- 指定 `pinnedId`：`+100000`
- 用户拥有相同模板目标：`+500`
- 正文不少于 10 字或包含图片：`+100`
- 同分时按发布时间倒序

发布成功后跳转：

```text
/community?pin=<checkInId>
```

因此新内容不会被旧的高质量内容压到下方。用户再次点击“同行”Tab 时会滚动到顶部，并用刷新参数清理置顶状态。

## 9. 样式系统

设计 token 位于 `tailwind.config.js`，复用组件类位于 `src/index.css`：

- `.card`
- `.card-press`
- `.chip`
- `.btn-primary`
- `.btn-ghost`
- `.input`
- `.label`
- `.app-header`
- `.page-title`
- `.section-title`

`App.tsx` 的桌面容器使用：

```text
aspect-[390/844]
max-h-[844px]
h-[92vh]
```

手机宽度下使用全屏布局。内容滚动容器固定为 `#app-scroll`，底部导航位于滚动区外。

## 10. 构建与部署

开发：

```bash
npm install
npm run dev
```

检查生产构建：

```bash
npm run build
```

构建过程依次执行 TypeScript project build 和 Vite build。产物位于 `dist/`，该目录不进入 Git。

Vercel 通过 `vercel.json` 将所有路径 rewrite 到 `index.html`，保证 React Router 子路由刷新时不出现 404。

## 11. 已知生产化缺口

- 接入真实账号、短信验证码和服务端会话。
- 将 localStorage 数据迁移到数据库。
- 将 data URL 图片迁移到对象存储并增加上传进度、失败重试和删除。
- 增加内容审核、风控和举报处理后台。
- 增加单元测试、路由测试和端到端测试。
- 增加错误监控、性能监控和可访问性自动检查。
