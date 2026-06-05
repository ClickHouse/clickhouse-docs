---
slug: /use-cases/observability/clickstack/example-datasets/chrome-extension
title: 'Chrome 扩展'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: '使用 HyperDX Chrome 扩展为任意网站启用 ClickStack 会话回放和 RUM'
doc_type: 'guide'
keywords: ['ClickStack', 'Chrome 扩展', '会话回放', '浏览器 SDK', 'RUM', '可观测性', 'HyperDX']
---

import Image from '@theme/IdealImage';
import extension_config from '@site/static/images/clickstack/chrome-extension/extension-config.png';

:::note[TL;DR]
本指南介绍如何使用 [HyperDX Chrome 扩展](https://github.com/kyreddie/hyperdx-chrome-extension) 将 ClickStack Browser SDK 注入任意网站。无需修改目标应用的源代码——只需配置一次扩展程序，访问该网站，即可在 ClickStack 中查看会话回放。

所需时间：10–15 分钟
:::

## 概述 \{#overview\}

[HyperDX Chrome 扩展](https://github.com/kyreddie/hyperdx-chrome-extension)会将 [@hyperdx/browser](https://github.com/hyperdxio/hyperdx-js) SDK 注入到你访问的页面中。当你想在不修改站点代码库的情况下调试会话回放、RUM 或 trace 传播时，它非常有用——例如第三方应用、生产环境构建，或启用了严格内容安全策略 (CSP) 的本地开发服务器。

该 SDK 已打包在扩展程序内部 (约 480 KB) ，因此页面在运行时无需再从 CDN 加载脚本。该扩展程序会先尝试通过外部 `chrome-extension://` 脚本进行注入；如果 CSP 阻止来自扩展源的脚本，则会回退为内联注入。

与 [会话回放演示](session-replay.md) 不同，后者是在你可控的演示应用中植入埋点，而这种方式适用于你在 Chrome 中打开的**任何** URL。你只需像普通用户一样与站点交互，即可生成会话数据。

如需了解会话回放的背景及其在 ClickStack 中的作用，请参阅 [Session Replay](/use-cases/observability/clickstack/session-replay) 功能页面。

## 前置条件 \{#prerequisites\}

* Google Chrome 或基于 Chromium 的浏览器 (如 Edge、Brave 等)
* 如果在本地运行 ClickStack，则需安装 [Docker](https://docs.docker.com/get-docker/)
* 4317、4318 和 8080 端口必须可用 (适用于本地 ClickStack)

## 运行演示 \{#running-the-demo\}

<VerticalStepper headerLevel="h3">
  ### 克隆扩展仓库 \{#clone-extension\}

  ```shell
  git clone https://github.com/kyreddie/hyperdx-chrome-extension
  cd hyperdx-chrome-extension
  ```

  ### 安装扩展 \{#install-extension\}

  1. 打开 Chrome，访问 `chrome://extensions`。
  2. 启用 **开发者模式** (右上角) 。
  3. 点击 **加载已解压的扩展程序**。
  4. 选择你刚才克隆的 `hyperdx-chrome-extension` 目录。

  扩展安装后会以 **HyperDX Browser Extension** 的名称显示在工具栏中。

  ### 启动 ClickStack \{#start-clickstack\}

  如果你已经有 ClickStack 或 HyperDX 的摄取端点，请直接跳到[配置扩展](#configure-extension)。

  如果使用本地 ClickStack，请启动 OpenTelemetry Collector。将 `{{CLICKHOUSE_ENDPOINT}}` 和 `{{CLICKHOUSE_PASSWORD}}` 替换为你的 ClickHouse 连接信息：

  ```shell
  export CLICKHOUSE_ENDPOINT={{CLICKHOUSE_ENDPOINT}}
  export CLICKHOUSE_PASSWORD={{CLICKHOUSE_PASSWORD}}

  docker run \
    -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
    -e CLICKHOUSE_USER=default \
    -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
    -p 8080:8080 \
    -p 4317:4317 \
    -p 4318:4318 \
    clickhouse/clickstack-otel-collector:latest
  ```

  打开 [http://localhost:8080](http://localhost:8080) 中的 HyperDX，确认 UI 已正常运行。

  如需包含 ClickHouse 和 HyperDX UI 的完整本地部署，请参阅 [ClickStack 入门指南](/use-cases/observability/clickstack/getting-started/oss)。

  ### 获取你的 API key \{#get-api-key\}

  对于本地 ClickStack，可能不需要 API key——如果是将遥测数据发送到 `http://localhost:4318` 上的自托管 collector，请将扩展中的该字段留空。

  对于 ClickStack Cloud 或 HyperDX Cloud 摄取，请打开 HyperDX，前往 **Team Settings → API Keys**，然后复制你的 **摄取 API key**。

  ### 配置扩展 \{#configure-extension\}

  点击 Chrome 工具栏中的 **HyperDX Browser Extension** 图标，然后填写以下设置：

  | 字段                               | 本地 ClickStack 示例                      | 说明                                                   |
  | -------------------------------- | ------------------------------------- | ---------------------------------------------------- |
  | **Enable HyperDX Monitoring**    | 开                                     | 用于注入的总开关                                             |
  | **Service Name**                 | `my-frontend-app`                     | 必填——用于在 ClickStack 中标识服务                             |
  | **API Key**                      | *(空)*                                 | Cloud 摄取时必填；某些自托管场景下可选                               |
  | **Collector URL**                | `http://localhost:4318`               | OTLP HTTP 端点；Cloud 默认值为 `https://in-otel.hyperdx.io` |
  | **Environment**                  | `development`                         | 可选——设置 `deployment.environment` 资源 attribute         |
  | **Trace Propagation Targets**    | `/api\.myapp\.domain/i, /localhost/i` | 可选——用逗号分隔的 JavaScript 正则表达式模式，用于传播 trace 请求头         |
  | **Only inject on matching URLs** | 关                                     | 启用后仅会对匹配的网站进行插桩                                      |
  | **Capture console logs**         | 关                                     | 启用后会转发浏览器控制台输出                                       |
  | **Advanced network capture**     | 关                                     | 启用后可捕获更详细的网络请求信息                                     |

  点击 **Save Configuration**，然后重新加载你想插桩的任意标签页。

  <Image img={extension_config} alt="配置了本地 ClickStack 设置的 HyperDX Chrome 扩展弹窗" size="sm" />

  上图展示了一个典型的本地配置：已启用监控、已设置服务名称、collector 指向 `http://localhost:4318`，并且 trace 传播仅限于 API 和 localhost URL。

  ### 浏览网站并生成会话 \{#browse-site\}

  在 Chrome 中打开任意网站或本地应用，例如前端开发服务器 [http://localhost:3000](http://localhost:3000)。

  像平常一样与页面交互：点击链接、提交表单、触发错误，以及在不同视图之间切换。只要配置正确，扩展就会在每次页面加载时自动注入 Browser SDK。

  ### 查看会话回放 \{#view-session-replay\}

  返回 [http://localhost:8080](http://localhost:8080) 中的 HyperDX，然后从左侧边栏进入 **Client Sessions**。

  你应该能看到自己的会话记录，其中会显示耗时和事件数量。点击 ▶️ 按钮即可回放。

  在 **Highlighted** 和 **All Events** 模式之间切换，以调整时间线上的细节层级。
</VerticalStepper>

## URL 过滤 \{#url-filtering\}

默认情况下，启用监控后，扩展程序会在你访问的每个页面中注入 SDK。要将注入限制在特定站点，请开启 **仅在匹配的 URL 上注入**，并按每行一个模式添加 (或用逗号分隔) ：

| 模式                         | 匹配对象                               |
| -------------------------- | ---------------------------------- |
| `http://homedepot.com/*`   | 仅匹配 `homedepot.com` 上的 HTTP        |
| `*://homedepot.com/*`      | 匹配 `homedepot.com` 上的 HTTP 和 HTTPS |
| `*://*.homedepot.com/*`    | 匹配 `www.homedepot.com` 等子域名        |
| `https://localhost:3000/*` | 匹配端口 3000 上的本地开发服务器                |

保存 URL 模式后，请重新加载该标签页。

## 验证注入 \{#verify-injection\}

在受监控的页面上打开开发者工具 (**控制台**标签页) ，重新加载页面，然后查看是否有以下内容：

```text
[HyperDX Extension] Configuration valid, injecting HyperDX
[HyperDX Extension] Injected via extension scripts
[HyperDX Extension] HyperDX initialized
```

如果扩展来源的脚本被 CSP 拦截，扩展会记录一条回退消息，并改用内联注入方式重试。

## 故障排查 \{#troubleshooting\}

<details>
  <summary>会话未出现在 HyperDX 中</summary>

  1. 检查浏览器控制台中是否有 `[HyperDX Extension]` 日志消息或错误
  2. 确认 **Enable HyperDX Monitoring** 已开启，并且已设置 **Service Name**
  3. 确认 ClickStack 正在运行，且 collector URL 正确 (例如 `http://localhost:4318`)
  4. 调整“Client Sessions”视图中的时间范围 (尝试 **Last 15 minutes**)
  5. 强制刷新浏览器：`Cmd+Shift+R` (Mac) 或 `Ctrl+Shift+R` (Windows/Linux)
</details>

<details>
  <summary>`chrome-extension://invalid/` 错误 </summary>

  在 `chrome://extensions` 中重新加载扩展，然后强制刷新该标签页。通常这是因为扩展更新或重新加载时，相关标签页仍处于打开状态。
</details>

<details>
  <summary>某个站点上未发生注入</summary>

  1. 检查监控是否已启用，并且已配置服务名称
  2. 如果 **Only inject on matching URLs** 已开启，请确认当前页面 URL 与你的某个模式匹配
  3. 某些站点会通过 CSP 同时阻止扩展来源注入和内联脚本注入 —— 在这些页面上可能无法注入
  4.
</details>

<details>
  <summary>控制台中出现 `HyperDX: Missing apiKey` </summary>

  如果 API key 字段为空，这是预期行为。对于 Cloud 端点，请添加来自 HyperDX 的摄取 API key；如果你的自托管 collector 接受未经身份验证的本地流量，也可以忽略。
</details>

## 隐私 \{#privacy\}

该扩展会将可观测性相关代码注入你访问的页面。请仅在获准调试的网站上使用它。不要共享 API 密钥，也不要将其提交到版本控制系统中。

## 了解更多 \{#learn-more\}

* [会话回放](/use-cases/observability/clickstack/session-replay) — 功能概览、SDK 选项和隐私控制
* [浏览器 SDK 参考](/use-cases/observability/clickstack/sdks/browser) — 完整的 SDK 选项和高级配置
* [会话回放演示](session-replay.md) — 从源码为演示应用添加埋点
* [ClickStack 入门](/use-cases/observability/clickstack/getting-started) — 部署 ClickStack 并摄取第一批数据
* [GitHub 上的 HyperDX Chrome 扩展](https://github.com/kyreddie/hyperdx-chrome-extension) — 源代码和问题跟踪