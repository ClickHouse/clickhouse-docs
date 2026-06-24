---
slug: /use-cases/observability/clickstack/mcp
title: 'ClickStack MCP server'
sidebar_label: 'MCP Server'
pagination_prev: null
pagination_next: null
description: 'Connect AI assistants to ClickStack using the Model Context Protocol (MCP) server'
doc_type: 'guide'
keywords: ['ClickStack', 'MCP', 'Model Context Protocol', 'AI', 'observability', 'HyperDX', 'Claude', 'Cursor', 'ClickHouse Cloud', 'OAuth']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import api_key from '@site/static/images/clickstack/api-key-personal.png';

ClickStack includes a built-in [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that lets AI assistants interact with your observability data. Once connected, an AI assistant can query logs, traces, and metrics; manage dashboards and alerts; explore data sources; and work with saved searches — all through natural language.

This allows you to use tools like [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://www.cursor.com/), or any MCP-compatible client to investigate incidents, build dashboards, and manage your observability setup without leaving your development environment.

## Availability {#availability}

The MCP server is available in the following ClickStack deployment types:

| Deployment | Status |
|---|---|
| **Open Source ClickStack** | Available |
| **BYOC (Bring Your Own Cloud)** | Available |
| **ClickStack on ClickHouse Cloud** | Available |
| **HyperDX v1** ([hyperdx.io](https://hyperdx.io)) | Not supported |

:::note[Different setup for ClickHouse Cloud vs OSS/BYOC]
ClickStack on ClickHouse Cloud uses a different endpoint and authentication method than Open Source and BYOC deployments. See the [ClickStack on ClickHouse Cloud](#managed-clickstack) section below for Cloud-specific setup.
:::

## ClickStack on ClickHouse Cloud {#managed-clickstack}

ClickStack on ClickHouse Cloud connects through the Cloud MCP endpoint at `https://mcp.clickhouse.cloud/clickstack` and authenticates with OAuth 2.0. API key authentication is not supported for this endpoint.

### Prerequisites {#managed-prerequisites}

- A running ClickHouse Cloud service with [ClickStack enabled](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)
- [MCP enabled](/use-cases/AI/MCP/remote_mcp#enable-remote-mcp-server) on the service — open the Cloud console, click **Connect**, select **Connect with MCP**, and toggle it on

### Endpoint {#managed-endpoint}

```text
https://mcp.clickhouse.cloud/clickstack
```

Authentication uses OAuth 2.0. When your MCP client connects for the first time, it opens a browser window for you to sign in with your ClickHouse Cloud credentials. No API key is needed.

### Connecting an MCP client {#managed-connecting-a-client}

Each client handles the OAuth flow automatically on first connection.

<Tabs groupId="mcp-client">
<TabItem value="claude-code" label="Claude Code" default>

```shell
claude mcp add --transport http clickstack https://mcp.clickhouse.cloud/clickstack
```

Launch Claude Code and run `/mcp`, then select `clickstack` to complete the OAuth flow.

</TabItem>
<TabItem value="cursor" label="Cursor">

Add the following to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "clickstack": {
      "url": "https://mcp.clickhouse.cloud/clickstack"
    }
  }
}
```

</TabItem>
<TabItem value="vscode" label="VS Code">

Add the following to `.vscode/mcp.json`:

```json
{
  "servers": {
    "clickstack": {
      "type": "http",
      "url": "https://mcp.clickhouse.cloud/clickstack"
    }
  }
}
```

</TabItem>
<TabItem value="opencode" label="OpenCode">

Add the following to `opencode.json`:

```json
{
  "mcp": {
    "clickstack": {
      "type": "remote",
      "url": "https://mcp.clickhouse.cloud/clickstack"
    }
  }
}
```

</TabItem>
<TabItem value="other" label="Other">

Any MCP client that supports **Streamable HTTP** with OAuth can connect. Configure it with:

- **URL:** `https://mcp.clickhouse.cloud/clickstack`

</TabItem>
</Tabs>

### Targeting a specific service {#managed-service-override}

Without the `x-service-id` header, requests default to the first ClickStack service provisioned and used by your account. To target a different service, pass `x-service-id: <YOUR_SERVICE_ID>` as a header in your MCP client configuration.

## Open Source and BYOC {#oss-byoc}

Open Source and BYOC deployments use your ClickStack instance's built-in MCP endpoint with Bearer token authentication.

### Prerequisites {#oss-prerequisites}

- A running ClickStack instance (see [Deployment](/use-cases/observability/clickstack/deployment) for setup options)
- A **Personal API Access Key** — find yours in HyperDX under **Team Settings → API Keys → Personal API Access Key**

<Image img={api_key} alt="Personal API Access Key in Team Settings" size="md" border/>

:::note
The Personal API Access Key is different from the **Ingestion API Key** found in Team Settings, which is used to authenticate telemetry data sent to the OpenTelemetry collector.
:::

### Endpoint {#oss-endpoint}

The MCP server is available at the `/api/mcp` path on your ClickStack frontend URL. For example, with a default local deployment, the URL is `http://localhost:8080/api/mcp`. Replace `localhost:8080` with your instance's host and port if you've customized the defaults.

:::note
The examples on this page use the frontend app URL (port `8080` by default). You can also reach the MCP server directly via the backend at `<BACKEND_URL>/mcp`, but not all deployments expose the backend, so these docs use the frontend path.
:::

The MCP server uses the **Streamable HTTP** transport with **Bearer token** authentication.

### Connecting an MCP client {#oss-connecting-a-client}

Replace `<YOUR_CLICKSTACK_URL>` with your instance URL (for example, `http://localhost:8080`) and `<YOUR_API_KEY>` with your Personal API Access Key.

<Tabs groupId="mcp-client">
<TabItem value="claude-code" label="Claude Code" default>

```shell
claude mcp add --transport http hyperdx <YOUR_CLICKSTACK_URL>/api/mcp \
  --header "Authorization: Bearer <YOUR_API_KEY>"
```

</TabItem>
<TabItem value="cursor" label="Cursor">

Add the following to `.cursor/mcp.json`:

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

</TabItem>
<TabItem value="vscode" label="VS Code">

Add the following to `.vscode/mcp.json`:

```json
{
  "servers": {
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

</TabItem>
<TabItem value="opencode" label="OpenCode">

Add the following to `opencode.json`:

```json
{
  "mcp": {
    "hyperdx": {
      "type": "remote",
      "url": "<YOUR_CLICKSTACK_URL>/api/mcp",
      "oauth": false,
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}
```

</TabItem>
<TabItem value="other" label="Other">

Any MCP client that supports **Streamable HTTP** can connect. Configure it with:

- **URL:** `<YOUR_CLICKSTACK_URL>/api/mcp`
- **Header:** `Authorization: Bearer <YOUR_API_KEY>`

</TabItem>
</Tabs>

## What can you do with MCP? {#capabilities}

Once connected, your AI assistant has access to a range of tools spanning the core areas of ClickStack. These include:

- **Querying data** — Search and aggregate logs, traces, and metrics using ClickStack's query builder, search syntax, or raw SQL.
- **Data sources** — List available data sources, database connections, column schemas, and attribute keys.
- **Dashboards** — Create, update, delete, and inspect dashboards along with their tiles.
- **Alerts** — Create, update, and inspect alerts along with their evaluation history.
- **Saved searches** — Create, update, and inspect reusable saved search definitions.
- **Webhooks** — List available webhook destinations for alert notifications.
- **Teams** — List teams the current user belongs to and identify the active team.

The specific set of tools may expand over time. Your MCP client will automatically discover the available tools when it connects.

## Multi-team usage (OSS/BYOC) {#multi-team}

This applies to Open Source and BYOC deployments only. For ClickStack on ClickHouse Cloud, see [Targeting a specific service](#managed-service-override).

By default, MCP requests operate in the context of your primary team. If you belong to multiple teams, pass the `x-hdx-team` header set to the team's ID alongside your `Authorization` header. If the header is omitted, your primary team is used. If you specify a team you don't belong to, the request is rejected with a `401` error.

Use the team listing tool from your MCP client to discover which teams you have access to and which one is active.

## Troubleshooting {#troubleshooting}

### ClickStack on ClickHouse Cloud {#troubleshooting-managed}

<details>
<summary>OAuth flow doesn't complete</summary>

- Confirm your MCP client supports OAuth 2.0. Clients that only support Bearer token or stdio transport can't authenticate with the Cloud endpoint.
- Check that your browser isn't blocking the OAuth popup or redirect.
- Verify your ClickHouse Cloud account has access to the organization and service.

</details>

<details>
<summary>MCP is enabled but the client can't connect</summary>

- Confirm you're using the ClickStack endpoint (`https://mcp.clickhouse.cloud/clickstack`), not the general Cloud MCP endpoint (`https://mcp.clickhouse.cloud/mcp`).
- Verify that [MCP is enabled](/use-cases/AI/MCP/remote_mcp#enable-remote-mcp-server) on the service in the Cloud console.

</details>

<details>
<summary>Requests go to the wrong service</summary>

Without the `x-service-id` header, requests default to the first ClickStack service provisioned and used by your account. Pass the header to target a specific service. See [Targeting a specific service](#managed-service-override).

</details>

### Open Source and BYOC {#troubleshooting-oss}

<details>
<summary>I'm getting a 403 authentication error</summary>

- Verify that you're using the **Personal API Access Key** (not the Ingestion API Key).
- Confirm the key is included as a `Bearer` token in the `Authorization` header.
- Check that your ClickStack instance is running and reachable at the URL you configured.

</details>

<details>
<summary>I'm being rate limited</summary>

The MCP server enforces a rate limit of **600 requests per minute** per user. If you exceed this limit, requests are temporarily rejected. Reduce the frequency of requests or wait before retrying.

</details>

<details>
<summary>I'm getting a 401 error with the x-hdx-team header</summary>

Verify that the team ID is correct and that your user account is a member of that team.

</details>

<details>
<summary>I can't connect to the MCP server</summary>

- Ensure your MCP client supports the **Streamable HTTP** transport. Older clients that only support the stdio transport won't work.
- If you're running ClickStack locally, confirm the app is accessible at the configured URL (the default is `http://localhost:8080`).
- For BYOC deployments behind a load balancer or reverse proxy, ensure the `/api/mcp` path isn't being blocked or rewritten.

</details>
