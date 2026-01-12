---
slug: /use-cases/AI/MCP/remote_mcp
sidebar_label: '启用远程 MCP 服务器'
title: '启用 ClickHouse Cloud 远程 MCP 服务器'
pagination_prev: null
pagination_next: null
description: '本指南介绍如何启用和使用 ClickHouse Cloud 远程 MCP'
keywords: ['AI', 'ClickHouse Cloud', 'MCP']
show_related_blogs: true
sidebar_position: 1
doc_type: '指南'
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

# 启用 ClickHouse Cloud 远程 MCP 服务器 {#enabling-the-clickhouse-cloud-remote-mcp-server}

> 本指南介绍如何启用并使用 ClickHouse Cloud 远程 MCP 服务器。我们将以 Claude Code 作为本示例中的 MCP 客户端，但任何支持 MCP 的 LLM 客户端都可以使用。

<VerticalStepper headerLevel="h2">

## 为您的 ClickHouse Cloud 服务启用远程 MCP 服务器 {#enable-remote-mcp-server}

1. 连接到您的 ClickHouse Cloud 服务，点击 `Connect` 按钮，并为您的服务启用远程 MCP 服务器。

<Image img={img1} alt="在 Connect 弹窗中选择 MCP" size="md"/>

<Image img={img2} alt="启用 MCP 服务器" size="md"/>

2. 从 `Connect` 视图或下方复制 ClickHouse Cloud MCP 服务器的 URL

```bash
https://mcp.clickhouse.cloud/mcp
```

## 在 Claude Code 中添加 ClickHouse MCP Server {#add-clickhouse-mcp-server-claude-code}

1. 在工作目录下运行以下命令，将 ClickHouse Cloud MCP Server 的配置添加到 Claude Code 中。本示例中，我们在 Claude Code 配置中将该 MCP 服务器命名为 `clickhouse_cloud`。

```bash
claude mcp add --transport http clickhouse_cloud https://mcp.clickhouse.cloud/mcp
```

1b. 取决于你使用的 MCP 客户端，你也可以直接编辑 JSON 配置

```json
{
  "mcpServers": {
    "clickhouse-remote": {
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

2. 在当前工作目录下启动 Claude Code

```bash
[user@host ~/Documents/repos/mcp_test] $ claude
```

## 通过 OAuth 认证到 ClickHouse Cloud {#authenticate-via-oauth}

1. 在首次会话中，Claude Code 会自动打开一个浏览器窗口。如果没有自动打开，你也可以在 Claude Code 中运行 `/mcp` 命令并选择 `clickhouse_cloud` MCP 服务器来发起连接

2. 使用你的 ClickHouse Cloud 凭证完成身份验证

<Image img={img3} alt="OAuth 连接流程" size="sm"/>

<Image img={img4} alt="OAuth 连接流程成功" size="sm"/>

## 在 Claude Code 中使用 ClickHouse Cloud 远程 MCP 服务器 {#use-rempte-mcp-from-claude-code}

1. 在 Claude Code 中确认远程 MCP 服务器已成功连接

<Image img={img5} alt="Claude Code MCP 成功连接" size="md"/>

<Image img={img6} alt="Claude Code MCP 详情" size="md"/>

2. 恭喜！你现在可以在 Claude Code 中使用 ClickHouse Cloud 远程 MCP 服务器了

<Image img={img7} alt="Claude Code MCP 使用示例" size="md"/>

尽管此示例使用的是 Claude Code，你也可以按照类似步骤，在任何支持 MCP 的 LLM 客户端中使用。

</VerticalStepper>
