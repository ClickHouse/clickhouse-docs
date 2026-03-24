---
slug: /use-cases/AI/MCP/remote_mcp
sidebar_label: '启用远程 MCP 服务器'
title: '启用并连接到 ClickHouse Cloud 远程 MCP 服务器'
pagination_prev: null
pagination_next: null
description: '本指南介绍如何启用和使用 ClickHouse Cloud 远程 MCP 服务器'
keywords: ['AI', 'ClickHouse Cloud', 'MCP']
show_related_blogs: true
sidebar_position: 1
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import img1 from '@site/static/images/use-cases/AI_ML/MCP/1connectmcpmodal.png';
import img2 from '@site/static/images/use-cases/AI_ML/MCP/2enable_mcp.png';
import img3 from '@site/static/images/use-cases/AI_ML/MCP/3oauth.png';
import img4 from '@site/static/images/use-cases/AI_ML/MCP/4oauth_success.png';
import img5 from '@site/static/images/use-cases/AI_ML/MCP/5connected_mcp_claude.png';
import img6 from '@site/static/images/use-cases/AI_ML/MCP/6slash_mcp_claude.png';
import img7 from '@site/static/images/use-cases/AI_ML/MCP/7usage_mcp.png';

本指南介绍如何启用 ClickHouse Cloud 远程 MCP 服务器，并将其配置为可与常见的开发者工具配合使用。

**前提条件**

* 一个正在运行的 [ClickHouse Cloud 服务](/getting-started/quick-start/cloud)
* 您选择的 IDE 或 agentic 开发工具


## 为 Cloud 启用远程 MCP 服务器 \{#enable-remote-mcp-server\}

连接到要启用远程 MCP 服务器的 ClickHouse Cloud 服务后，点击左侧菜单中的 `Connect` 按钮。
随后会打开一个显示连接详情的对话框。

选择 &quot;Connect with MCP&quot;：

<Image img={img1} alt="在 Connect 对话框中选择 MCP" size="md" />

打开开关，为该服务启用 MCP：

<Image img={img2} alt="启用 MCP 服务器" size="md" />

复制显示的 URL，它与下面的 URL 相同：

```bash
https://mcp.clickhouse.cloud/mcp
```


## 为开发环境配置远程 MCP \{#setup-clickhouse-cloud-remote-mcp-server\}

请选择下面的 IDE 或工具，并按照相应的配置说明进行操作。

### Claude Code \{#claude-code\}

在工作目录中运行以下命令，将 ClickHouse Cloud MCP 服务器配置添加到 Claude Code：

```bash
claude mcp add --transport http clickhouse-cloud https://mcp.clickhouse.cloud/mcp
```

然后启动 Claude Code：

```bash
claude
```

运行以下命令，列出 MCP 服务器：

```bash
/mcp
```

选择 `clickhouse-cloud`，然后使用你的 ClickHouse Cloud 凭据通过 OAuth 进行身份验证。

### Claude 网页界面 \{#claude-web\}

1. 导航到 **Customize** &gt; **Connectors**
2. 点击 “+” 图标，然后选择 **Add custom connector**
3. 为该自定义连接器指定一个名称，例如 `clickhouse-cloud`，然后将其添加
4. 点击新添加的 `clickhouse-cloud` 连接器，然后点击 **Connect**
5. 通过 OAuth 使用你的 ClickHouse Cloud 凭据进行身份验证

### Cursor \{#cursor\}

1. 在 [Cursor Marketplace](https://cursor.com/marketplace) 中浏览并安装 MCP 服务器。
2. 搜索 ClickHouse，然后在任意服务器上点击“Add to Cursor”进行安装
3. 通过 OAuth 进行身份验证。

### Visual Studio Code \{#visual-studio-code\}

将以下配置添加到 `.vscode/mcp.json` 中：

```json
{
  "servers": {
    "clickhouse-cloud": {
      "type": "http",
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

更多详情，请参阅 [Visual Studio Code 文档](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)


### Windsurf \{#windsurf\}

使用以下配置编辑 `mcp_config.json` 文件：

```json
{
  "mcpServers": {
    "clickhouse-cloud": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.clickhouse.cloud/mcp"]
    }
  }
}
```

更多详情，请参阅 [Windsurf 文档](https://docs.windsurf.com/windsurf/cascade/mcp#adding-a-new-mcp)


### Zed \{#zed\}

将 ClickHouse 添加为自定义服务器。
在 Zed 的 **context&#95;servers** 设置下添加以下内容：

```json
{
  "context_servers": {
    "clickhouse-cloud": {
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

当 Zed 首次连接到服务器时，应会提示你通过 OAuth 进行身份验证。
更多详情请参阅 [Zed 文档](https://zed.dev/docs/ai/mcp#as-custom-servers)


### Codex \{#codex\}

运行以下命令，使用 CLI 添加 ClickHouse Cloud MCP 服务器：

```bash
codex mcp add clickhouse-cloud --url https://mcp.clickhouse.cloud/mcp
```


## 相关内容 \{#related-content\}

* [ClickHouse agent 技能集](https://github.com/ClickHouse/agent-skills)