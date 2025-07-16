---
slug: /use-cases/AI/MCP/remote_mcp
sidebar_label: 'ClickHouse Cloud Remote MCP'
title: 'Enabling the ClickHouse Cloud Remote MCP Server'
pagination_prev: null
pagination_next: null
description: 'This guide explains how to enable and use the ClickHouse Cloud Remote MCP'
keywords: ['AI', 'ClickHouse Cloud', 'MCP']
show_related_blogs: true
sidebar_position: 1
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

# Enabling the ClickHouse Cloud Remote MCP Server

> This guide explains how to enable and use the ClickHouse Cloud Remote MCP Server. We will use Claude Code as an MCP Client for this example.

:::note 
The remote server capability is currently available in private preview only.
Join the waitlist by filling out the form at [clickhouse.ai](https://www.clickhouse.ai)
:::

<VerticalStepper headerLevel="h2">

## Enable the remote MCP server for your ClickHouse Cloud service {#enable-remote-mcp-server}

1. Connect to your ClickHouse Cloud Service, click on the `Connect` button, and enable the Remote MCP Server for your Service

<Image img={img1} alt="Select MCP in the Connect Modal" size="md"/>

<Image img={img2} alt="Enable MCP Server" size="md"/>

2. Copy the URL of the ClickHouse Cloud MCP Server from the `Connect` view or below

```bash 
https://mcp.clickhouse.com/mcp
```

## Add the ClickHouse MCP Server in Claude Code {#add-clickhouse-mcp-server-claude-code}

1. In your working directory, run the following command to add the ClickHouse Cloud MCP Server configuration to Claude Code. In this example, we named the MCP server in the Claude Code config `clickhouse_cloud`

```bash
claude mcp add --transport http clickhouse_cloud https://mcp.clickhouse.com/mcp
```

1b. Depending on the MCP Client used, you can also edit the JSON config directly

```json
{
  "mcpServers": {
    "clickhouse-remote": {
      "url": "https://mcp.clickhouse.com/mcp"
    }
  }
}
```

2. Launch Claude Code in your working directory

```bash
[user@host ~/Documents/repos/mcp_test] $ claude
```

## Authenticate to ClickHouse Cloud via OAuth {#authenticate-via-oauth}

1. Claude Code will open a browser window on the firgst session. Otherwise, you can also trigger a connection by running the `/mcp` command in Claude Code and selecting the `clickhouse_cloud` MCP server

2. Authenticate using your ClickHouse Cloud credentials

<Image img={img3} alt="OAuth Connect flow" size="sm"/>

<Image img={img4} alt="OAuth Connect flow success" size="sm"/>

## Use the ClickHouse Cloud Remote MCP Server from Claude Code {#use-rempte-mcp-from-claude-code}

1. Verify in Claude Code that the remote MCP server is connected

<Image img={img5} alt="Claude Code MCP success" size="md"/>

<Image img={img6} alt="Claude Code MCP Details" size="md"/>

2. Congratulations! You can now use the ClickHouse Cloud Remote MCP Server from Claude Code

<Image img={img7} alt="Claude Code MCP Usage" size="md"/>


</VerticalStepper>
