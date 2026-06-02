---
sidebar_label: 'Notion'
slug: /integrations/notion
keywords: ['clickhouse', 'notion', 'mcp', 'custom agents', 'ai', 'integrate', 'connect']
description: 'Connect ClickHouse Cloud to a Notion Custom Agent via the ClickHouse Remote MCP server.'
title: 'Connecting Notion to ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_integration'
---

import PartnerBadge from '@theme/badges/PartnerBadge';

<PartnerBadge/>

[Notion](https://www.notion.com/) is a connected workspace for notes, docs, projects, and AI-powered Custom Agents.

You can connect ClickHouse Cloud to a Notion [Custom Agent](https://www.notion.com/help/mcp-connections-for-custom-agents) as a custom MCP server. Once connected, the agent can explore your data, run read-only analytical queries, and surface service and cost information from ClickHouse Cloud without leaving Notion.

## Prerequisites {#prerequisites}

- A running [ClickHouse Cloud service](/getting-started/quick-start/cloud) with the [Remote MCP server enabled](/use-cases/AI/MCP/remote_mcp#enable-remote-mcp-server)
- A Notion workspace on the **Business** or **Enterprise** plan
- A workspace admin has enabled **Custom MCP servers** under **Settings** > **Notion AI** > **AI connectors**

## Connect ClickHouse to a Notion Custom Agent {#connect-clickhouse-to-notion}

1. In Notion, open the Custom Agent you want to extend and click **Settings**.
2. Under **Tools & Access**, click **Add connection** and choose **Custom MCP server**.

{/* TODO(screenshot): the "Add connection" menu inside the agent's Tools & Access, showing the "Custom MCP server" option */}

3. Enter the ClickHouse Cloud Remote MCP server URL and give the connection a display name like `ClickHouse`:

   ```text
   https://mcp.clickhouse.cloud/mcp
   ```

{/* TODO(screenshot): the Custom MCP server modal with the server URL and display name filled in */}

4. Click **Save**, then complete the OAuth flow to authenticate with your ClickHouse Cloud credentials. Access is scoped to the organizations and services your account can already reach.

{/* TODO(screenshot): the OAuth consent / "Connected" confirmation state */}

5. Expand the new connection to review the [available ClickHouse tools](/cloud/features/ai-ml/remote-mcp#available-tools) and toggle on the ones you want this agent to use. All ClickHouse Remote MCP tools are read-only.

{/* TODO(screenshot): the expanded ClickHouse connection showing the list of tool toggles */}

:::note
Each Custom Agent requires its own ClickHouse connection, and only the person who authenticated a connection can change its tool settings. See Notion's [security best practices for Agent connections](https://www.notion.com/help/security-best-practices-for-agent-connections) for more details.
:::

## Example prompts {#example-prompts}

Once connected, you can ask the Custom Agent questions in natural language. Some examples:

| Prompt | Tool invoked |
|--------|--------------|
| "What databases are available on my ClickHouse service?" | `list_databases` |
| "Show me the top 10 rows from the `hits` table" | `run_select_query` |
| "What was my organization's ClickHouse cost last week?" | `get_organization_cost` |
| "List recent backups for this service" | `list_service_backups` |

For the full set of natural-language patterns and tools, see the [Remote MCP example usage](/use-cases/AI/MCP/remote_mcp#example-usage) section.

{/* TODO(screenshot): a Notion Custom Agent conversation showing a ClickHouse query result rendered in the Notion UI */}

## Related content {#related-content}

- [Enable and connect ClickHouse Cloud remote MCP server](/use-cases/AI/MCP/remote_mcp)
- [Remote MCP in Cloud — tool reference](/cloud/features/ai-ml/remote-mcp)
- Notion: [MCP connections for Custom Agents](https://www.notion.com/help/mcp-connections-for-custom-agents)
- Notion: [Connect Custom Agents to your tool stack with MCP integrations](https://www.notion.com/help/guides/connect-custom-agents-to-mcp-integrations)
