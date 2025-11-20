---
slug: /use-cases/AI/MCP/remote_mcp
sidebar_label: 'ClickHouse Cloud 远程 MCP'
title: '启用 ClickHouse Cloud 远程 MCP 服务器'
pagination_prev: null
pagination_next: null
description: '本指南介绍如何启用和使用 ClickHouse Cloud 远程 MCP'
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


# 启用 ClickHouse Cloud 远程 MCP 服务器

> 本指南介绍如何启用和使用 ClickHouse Cloud 远程 MCP 服务器。本示例中我们将使用 Claude Code 作为 MCP 客户端,但您也可以使用任何支持 MCP 的 LLM 客户端。

<VerticalStepper headerLevel="h2">


## 为您的 ClickHouse Cloud 服务启用远程 MCP 服务器 {#enable-remote-mcp-server}

1. 连接到您的 ClickHouse Cloud 服务,点击 `Connect` 按钮,为您的服务启用远程 MCP 服务器

<Image img={img1} alt='在连接对话框中选择 MCP' size='md' />

<Image img={img2} alt='启用 MCP 服务器' size='md' />

2. 从 `Connect` 视图或下方复制 ClickHouse Cloud MCP 服务器的 URL

```bash
https://mcp.clickhouse.cloud/mcp
```


## 在 Claude Code 中添加 ClickHouse MCP 服务器 {#add-clickhouse-mcp-server-claude-code}

1. 在工作目录中运行以下命令,将 ClickHouse Cloud MCP 服务器配置添加到 Claude Code。在本示例中,我们将 Claude Code 配置中的 MCP 服务器命名为 `clickhouse_cloud`

```bash
claude mcp add --transport http clickhouse_cloud https://mcp.clickhouse.cloud/mcp
```

1b. 根据使用的 MCP 客户端,您也可以直接编辑 JSON 配置文件

```json
{
  "mcpServers": {
    "clickhouse-remote": {
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

2. 在工作目录中启动 Claude Code

```bash
[user@host ~/Documents/repos/mcp_test] $ claude
```


## 通过 OAuth 认证 ClickHouse Cloud {#authenticate-via-oauth}

1. Claude Code 在首次会话时会自动打开浏览器窗口。您也可以在 Claude Code 中运行 `/mcp` 命令并选择 `clickhouse_cloud` MCP 服务器来手动触发连接

2. 使用您的 ClickHouse Cloud 凭据进行身份验证

<Image img={img3} alt='OAuth 连接流程' size='sm' />

<Image img={img4} alt='OAuth 连接成功' size='sm' />


## 从 Claude Code 使用 ClickHouse Cloud 远程 MCP 服务器 {#use-rempte-mcp-from-claude-code}

1. 在 Claude Code 中验证远程 MCP 服务器是否已连接

<Image img={img5} alt='Claude Code MCP success' size='md' />

<Image img={img6} alt='Claude Code MCP Details' size='md' />

2. 恭喜!现在您可以从 Claude Code 使用 ClickHouse Cloud 远程 MCP 服务器

<Image img={img7} alt='Claude Code MCP Usage' size='md' />

虽然本示例使用的是 Claude Code,但您可以按照类似步骤使用任何支持 MCP 的 LLM 客户端。

</VerticalStepper>
