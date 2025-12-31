---
sidebar_label: 'Remote MCP server'
slug: /cloud/features/ai-ml/remote-mcp
title: 'Remote MCP in Cloud'
description: 'Description of the remote MCP functionality in ClickHouse Cloud'
doc_type: 'reference'
---

# Remote MCP server in Cloud

Not all users interact with ClickHouse through the Cloud console.
For example, many developers work directly from their preferred code editors, CLI agents, or connect to the database via custom setups, while others rely on general-purpose AI assistants such as Anthropic Claude for most of their explorations.
These users, and the agentic workloads acting on their behalf, need a way to securely access and query ClickHouse Cloud without complex setups or custom infrastructure.

The remote MCP server capability in ClickHouse Cloud addresses this by exposing a standard interface that external agents can use to retrieve analytical context.
MCP, or Model Context Protocol, is a standard for structured data access by AI applications powered by LLMs.
With this integration, external agents can list databases and tables, inspect schemas, and run scoped, read-only SELECT queries.
Authentication is handled via OAuth, and the server is fully managed on ClickHouse Cloud, so no setup or maintenance is required.

This makes it easier for agentic tools to plug into ClickHouse and retrieve the data they need, whether for analysis, summarization, code generation, or exploration.

See the [guides](/use-cases/AI/MCP/remote_mcp) section for more details.