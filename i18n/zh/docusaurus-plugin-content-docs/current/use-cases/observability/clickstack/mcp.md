---
slug: /use-cases/observability/clickstack/mcp
title: 'ClickStack MCP 服务器'
sidebar_label: 'MCP 服务器'
pagination_prev: null
pagination_next: null
description: '通过 Model Context Protocol (MCP) 服务器将 AI 助手接入 ClickStack'
doc_type: 'guide'
keywords: ['ClickStack', 'MCP', 'Model Context Protocol', 'AI', '可观测性', 'HyperDX', 'Claude', 'Cursor']
---

import Image from '@theme/IdealImage';
import api_key from '@site/static/images/clickstack/api-key-personal.png';

ClickStack 内置 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 服务器，使 AI 助手能够与你的可观测性数据交互。连接后，AI 助手可以查询日志、链路追踪和指标；管理仪表板和告警；浏览数据源；以及使用已保存的搜索——这一切都可通过自然语言完成。

这样一来，你就可以使用 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)、[Cursor](https://www.cursor.com/) 或任何兼容 MCP 的客户端，在不离开开发环境的情况下排查事件、构建仪表板并管理你的可观测性环境。

## 可用性 \{#availability\}

MCP 服务器 适用于以下 ClickStack 部署类型：

| 部署                                                | 状态   |
| ------------------------------------------------- | ---- |
| **开源 ClickStack**                                 | 可用   |
| **BYOC (Bring Your Own Cloud)&#x20;**&#x20;            | 可用   |
| **托管 ClickStack**                                 | 即将推出 |
| **HyperDX v1** ([hyperdx.io](https://hyperdx.io)) | 不支持  |

:::note[托管 ClickStack]
面向托管 ClickStack 的 MCP 服务器 支持正在积极开发中，很快即可使用。本页中的说明适用于开源和 BYOC 部署。
:::

## 前置条件 \{#prerequisites\}

在连接 MCP 客户端之前，您需要具备以下条件：

* 一个正在运行的 ClickStack 实例 (有关设置选项，请参阅[部署](/use-cases/observability/clickstack/deployment))
* 一个 **Personal API Access Key**——可在 HyperDX 的 **Team Settings → API Keys → Personal API Access Key** 中找到

<Image img={api_key} alt="Team Settings 中的 Personal API Access Key" size="md" border />

:::note
Personal API Access Key 不同于 **摄取 API key**。后者可在 Team Settings 中找到，用于对发送到 OpenTelemetry collector 的遥测数据进行身份验证。
:::

## 端点 \{#endpoint\}

MCP 服务器可通过 ClickStack 前端 URL 上的 `/api/mcp` 路径访问：

例如，使用默认的本地部署时：

如果你自定义了默认配置，请将 `localhost:8080` 替换为你的实例主机和端口。

:::note
本页中的示例使用前端应用 URL (默认端口为 `8080`) 。你也可以通过后端的 `<BACKEND_URL>/mcp` 直接访问 MCP 服务器，但并非所有部署都会暴露后端，因此本文档使用前端路径。
:::

MCP 服务器使用 **Streamable HTTP** 传输和 **Bearer token** 身份验证。

## 连接 MCP 客户端 \{#connecting-a-client\}

下面的示例说明了如何配置常用的 MCP 客户端。将 `<YOUR_CLICKSTACK_URL>` 替换为您的实例 URL (例如 `http://localhost:8080`) ，并将 `<YOUR_API_KEY>` 替换为您的个人 API 访问密钥。

### Claude Code \{#claude-code\}

```shell
claude mcp add --transport http hyperdx <YOUR_CLICKSTACK_URL>/api/mcp \
  --header "Authorization: Bearer <YOUR_API_KEY>"
```

### Cursor \{#cursor\}

将以下内容添加到项目的 `.cursor/mcp.json` 文件或全局 Cursor 设置中：

```json
{
  "mcpServers": {
    "hyperdx": {
      "url": "<YOUR_CLICKSTACK_URL>/api/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}
```

### OpenCode \{#opencode\}

将以下内容添加到 `opencode.json` 配置中：

```json
{
  "mcp": {
    "hyperdx": {
      "type": "http",
      "url": "<YOUR_CLICKSTACK_URL>/api/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}
```

### 其他客户端 \{#other-clients\}

任何支持 **Streamable HTTP** 传输方式的 MCP 客户端都可以连接。请按如下方式进行配置：

* **URL：** `<YOUR_CLICKSTACK_URL>/api/mcp`
* **请求头：** `Authorization: Bearer <YOUR_API_KEY>`

## 你可以使用 MCP 做什么？ \{#capabilities\}

连接成功后，你的 AI 助手即可访问一系列覆盖 ClickStack 核心功能的工具。其中包括：

* **查询数据** — 使用 ClickStack 的查询构建器、搜索语法或原始 SQL，对日志、链路追踪和指标进行搜索与聚合。
* **数据源** — 列出可用的数据源、数据库连接、列 schema 和 attribute 键名。
* **仪表板** — 创建、更新、删除和查看仪表板及其图块。
* **告警** — 创建、更新和查看告警及其评估历史记录。
* **已保存的搜索** — 创建、更新和查看可复用的已保存搜索定义。
* **Webhooks** — 列出可用于发送告警通知的 webhook 目标端。
* **团队** — 列出当前用户所属的团队，并识别当前活跃团队。

具体工具集可能会随着时间推移而扩展。你的 MCP 客户端在连接时会自动发现可用工具。

## 多团队使用 \{#multi-team\}

默认情况下，MCP 请求会在你的主团队上下文中执行。如果你属于多个团队，可以在传递 `Authorization` 请求头的同时，添加一个值为团队 ID 的 `x-hdx-team` 请求头，以指定目标团队。如果省略该请求头，则使用你的主团队。如果你指定了一个自己不属于的团队，请求会被拒绝，并返回 `401` 错误。

使用 MCP 客户端中的团队列表工具，查看你可以访问哪些团队，以及当前激活的是哪个团队。

## 故障排查 \{#troubleshooting\}

<details>
  <summary>我遇到了 403 身份验证错误</summary>

  * 请确认你使用的是 **Personal API Access Key** (而不是 摄取 API key) 。
  * 确认该 key 已作为 `Bearer` 令牌包含在 `Authorization` 请求头中。
  * 检查你的 ClickStack 实例是否正在运行，并且可通过你配置的 URL 访问。
</details>

<details>
  <summary>我遇到了限流</summary>

  MCP 服务器 对每位用户实施 **每分钟 600 次请求** 的速率限制。如果超过该限制，请求会被暂时拒绝。请降低请求频率，或等待一段时间后再重试。
</details>

<details>
  <summary>我在使用 x-hdx-team 请求头时遇到了 401 错误</summary>

  请确认团队 ID 正确，并且你的用户账户属于该团队。
</details>

<details>
  <summary>我无法连接到 MCP 服务器</summary>

  * 确保你的 MCP 客户端支持 **Streamable HTTP** 传输。仅支持 stdio 传输的旧客户端将无法使用。
  * 如果你在本地运行 ClickStack，请确认应用可通过已配置的 URL 访问 (默认为 `http://localhost:8080`) 。
  * 对于位于负载均衡器或反向代理之后的 BYOC 部署，请确保 `/api/mcp` 路径未被拦截或重写。
</details>