---
slug: /use-cases/observability/clickstack/example-datasets/session-replay-demo
title: '会话回放演示'
sidebar_position: 4
pagination_prev: null
pagination_next: null
description: '交互式演示应用，展示如何对 Web 应用进行 ClickStack 会话回放埋点'
doc_type: 'guide'
keywords: ['clickstack', 'session replay', 'browser sdk', 'demo', 'observability', 'instrumentation']
---

import Image from '@theme/IdealImage';
import api_key from '@site/static/images/clickstack/api-key.png';
import demo_app from '@site/static/images/clickstack/session-replay/demo-app.png';
import session_replay from '@site/static/images/clickstack/session-replay/session-replay.png';
import replay_search from '@site/static/images/clickstack/session-replay/replay-search-view.png';

:::note[要点速览]
本指南将演示如何使用 ClickStack Browser SDK 为 Web 应用接入会话回放功能。与其他加载预生成数据的示例数据集不同，本示例提供了一个交互式应用，你可以通过自己的操作生成会话数据。

预计耗时：10–15 分钟
:::


## 概览 \{#overview\}

[会话回放示例应用](https://github.com/ClickHouse/clickstack-session-replay-demo) 是一个使用原生 JavaScript 构建的文档浏览器。它演示了会话回放埋点如何做到极简——只需一个 script 标签和一次初始化调用，即可自动捕获所有用户交互。

该代码仓库包含两个分支：

- **`main`** —— 已完整埋点，可立即使用
- **`pre-instrumented`** —— 未包含埋点代码的干净版本，代码注释中标明了需要添加埋点的位置

本指南将首先使用 `main` 分支直观展示会话回放的实际效果，然后逐步讲解埋点代码，便于在自己的应用中采用相同的模式。

关于会话回放的背景介绍以及它在 ClickStack 中所扮演的角色，请参阅 [Session Replay](/use-cases/observability/clickstack/session-replay) 功能页面。

## 先决条件 \{#prerequisites\}

- 已安装 Docker 和 Docker Compose
- 端口 3000、4317、4318 和 8080 可用

## 运行示例 \{#running-the-demo\}

<VerticalStepper headerLevel="h3">

### 克隆代码仓库 \{#clone-repository\}

```shell
git clone https://github.com/ClickHouse/clickstack-session-replay-demo
cd clickstack-session-replay-demo
```

### 启动 ClickStack \{#start-clickstack\}

```shell
docker-compose up -d clickstack
```

### 获取你的 API key \{#get-api-key\}

1. 在浏览器中打开 HyperDX，地址为 [http://localhost:8080](http://localhost:8080)
2. 创建一个账户，或在需要时登录
3. 进入 **Team Settings → API Keys**
4. 复制你的 **摄取 API key**

<Image img={api_key} alt="ClickStack API Key"/>

5. 将其设置为环境变量：

```shell
export CLICKSTACK_API_KEY='your-api-key-here'
```

### 启动示例应用 \{#start-demo-app\}

```shell
docker-compose --profile demo up demo-app
```

:::note
请确保在导出 `CLICKSTACK_API_KEY` 变量的同一个终端中运行此命令。
:::

在浏览器中打开 [http://localhost:3000](http://localhost:3000)，与该应用进行交互——搜索主题、按类别过滤、查看代码示例以及收藏条目。

<Image img={demo_app} alt="Session replay demo app"/>

所有交互都会由 ClickStack Browser SDK 自动捕获。

### 查看你的会话回放 \{#view-session-replay\}

返回 [http://localhost:8080](http://localhost:8080) 中的 HyperDX，在左侧边栏中进入 **Client Sessions**。

<Image img={replay_search} alt="Session replay search"/>

你应该会看到你的会话列表，以及对应的持续时间和事件数量。点击 ▶️ 按钮即可回放。

<Image img={session_replay} alt="Session replay"/>

在 **Highlighted** 和 **All Events** 模式之间切换，以调整时间线上的细节级别。

</VerticalStepper>

## 埋点与监测 \{#instrumentation\}

该演示应用展示了启用 Session Replay 只需极少量代码。只需要对应用做两处改动即可：

**1. 引入 SDK（`app/public/index.html`）：**

```html
<script src="https://unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
```

**2. 在 `app/public/js/app.js` 中初始化 ClickStack：**

```javascript
window.HyperDX.init({
  url: 'http://localhost:4318',
  apiKey: window.CLICKSTACK_API_KEY,
  service: 'clickhouse-session-replay-demo',
  consoleCapture: true,
  advancedNetworkCapture: true,
});
```

其余部分都是标准应用程序代码。SDK 会自动捕获所有用户交互、控制台日志、网络请求和错误——无需任何额外的手动埋点或插桩。


### 自己动手实践 \{#try-it-yourself\}

要从零开始为应用添加埋点，请切换到 `pre-instrumented` 分支：

```shell
git checkout pre-instrumented
```

此分支包含未添加任何 ClickStack 插桩的同一应用程序版本。`app/public/index.html` 和 `app/public/js/app.js` 中的代码注释精确标明了需要添加上述两个代码片段的具体位置。添加完成后，重启演示应用，你的交互行为就会开始出现在 ClickStack 中。


## 故障排查 \{#troubleshooting\}

### 会话未在 HyperDX 中显示 \{#sessions-not-appearing\}

1. 检查浏览器控制台中是否存在错误
2. 确认 ClickStack 正在运行：`docker-compose ps`
3. 确认已设置 API 密钥：`echo $CLICKSTACK_API_KEY`
4. 在 Client Sessions 视图中调整时间范围（尝试选择 **Last 15 minutes**）
5. 强制刷新浏览器页面：`Cmd+Shift+R`（Mac）或 `Ctrl+Shift+R`（Windows/Linux）

### 401 未授权错误 \{#401-errors\}

API 密钥未正确设置。请确保：

1. 已在终端中导出它：`export CLICKSTACK_API_KEY='your-key'`
2. 在**同一个终端**中启动了演示应用（即你导出该变量的终端）
3. 从 HyperDX UI 获取了该密钥（而不是一个随机生成的字符串）

## 清理 \{#cleanup\}

停止服务：

```bash
docker-compose down
```

删除所有数据：

```bash
docker-compose down -v
```


## 了解更多 \{#learn-more\}

- [Session Replay](/use-cases/observability/clickstack/session-replay) — 功能概览、SDK 选项和隐私控制
- [Browser SDK Reference](/use-cases/observability/clickstack/sdks/browser) — 完整 SDK 选项和高级配置
- [ClickStack 入门](/use-cases/observability/clickstack/getting-started) — 部署 ClickStack 并摄取首批数据
- [所有示例数据集](/use-cases/observability/clickstack/sample-datasets) — 其他示例数据集和指南