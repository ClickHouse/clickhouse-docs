---
slug: /use-cases/AI/MCP/remote_mcp
sidebar_label: 'Enable remote MCP server'
title: 'Enable and connect ClickHouse Cloud remote MCP server'
pagination_prev: null
pagination_next: null
description: 'This guide explains how to enable and use the ClickHouse Cloud Remote MCP'
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

This guide shows you how to enable the ClickHouse Cloud Remote MCP Server and set it up for use with common developer tools.

**Prerequisites**
- A running [ClickHouse Cloud service](/getting-started/quick-start/cloud)
- Your IDE or agentic development tool of choice

## Enable remote MCP server for Cloud {#enable-remote-mcp-server}

Connect to the ClickHouse Cloud service for which you want to enable remote MCP server, click on the `Connect` button in the left hand menu.
A box with connection details will open.

Select "Connect with MCP":

<Image img={img1} alt="Select MCP in the Connect Modal" size="md"/>

Toggle the button on to enable MCP for the service:

<Image img={img2} alt="Enable MCP Server" size="md"/>

Copy the displayed URL, which is the same as the one below:

```bash 
https://mcp.clickhouse.cloud/mcp
```

## Setup remote MCP for development {#setup-clickhouse-cloud-remote-mcp-server}

Choose your IDE or tool below and follow the corresponding setup instructions.

### Claude Code {#claude-code}

From your working directory, run the following command to add the ClickHouse Cloud MCP Server configuration to Claude Code:

```bash
claude mcp add --transport http clickhouse-cloud https://mcp.clickhouse.cloud/mcp
```

Then launch Claude Code:

```bash
claude
```

Run the following command to list MCP servers:

```bash
/mcp
```

Select `clickhouse-cloud` and authenticate via OAuth using your credentials for ClickHouse Cloud.

### Claude web UI {#claude-web}

1. Navigate to **Customize** > **Connectors**
2. Click the "+" icon and **Add custom connector**
3. Give the custom connector a name like `clickhouse-cloud` and add it
4. Click the newly added `clickhouse-cloud` connector and click **Connect**
5. Authenticate using your ClickHouse Cloud credentials via OAuth

### Cursor {#cursor}

1. Browse and install MCP servers from the [Cursor Marketplace](https://cursor.com/marketplace).
2. Search for ClickHouse and click "Add to Cursor" on any server to install it
3. Authenticate with OAuth.

### Visual Studio Code {#visual-studio-code}

Add the following configuration to your `.vscode/mcp.json`:

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

For more details refer to the [Visual Studio Code docs](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)

### Windsurf {#windsurf}

Edit your `mcp_config.json` file with the following config:

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

For more details refer to the [Windsurf docs](https://docs.windsurf.com/windsurf/cascade/mcp#adding-a-new-mcp)

### Zed {#zed}

Add ClickHouse as a custom server.
Add the following to your Zed settings under **context_servers**:

```json
{
  "context_servers": {
    "clickhouse-cloud": {
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

Zed should then prompt you to authenticate via OAuth when it first connects to the server.
For more details refer to the [Zed docs](https://zed.dev/docs/ai/mcp#as-custom-servers)

### Codex {#codex}

Run the following command to add the ClickHouse Cloud MCP server via the CLI:

```bash
codex mcp add clickhouse-cloud --url https://mcp.clickhouse.cloud/mcp
```

## Related content {#related-content}
- [ClickHouse agent skills](https://github.com/ClickHouse/agent-skills)
