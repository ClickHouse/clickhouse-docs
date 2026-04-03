---
slug: /use-cases/AI/MCP/claude-desktop
sidebar_label: '集成 Claude Desktop'
title: '为 Claude Desktop 设置 ClickHouse MCP 服务器'
pagination_prev: null
pagination_next: null
description: '本指南说明如何为 Claude Desktop 设置 ClickHouse MCP 服务器。'
keywords: ['AI', 'Librechat', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import ClaudeDesktopConfig from '@site/static/images/use-cases/AI_ML/MCP/claude-desktop-config.png';
import FindMCPServers from '@site/static/images/use-cases/AI_ML/MCP/find-mcp-servers.gif';
import MCPPermission from '@site/static/images/use-cases/AI_ML/MCP/mcp-permission.png';
import ClaudeConversation from '@site/static/images/use-cases/AI_ML/MCP/claude-conversation.png';

# 在 Claude Desktop 中使用 ClickHouse MCP 服务器 \{#using-clickhouse-mcp-server-with-claude-desktop\}

> 本指南说明如何使用 uv 为 Claude Desktop 设置 ClickHouse MCP 服务器，
> 并将其连接到 ClickHouse 示例数据集。

<iframe width="768" height="432" src="https://www.youtube.com/embed/y9biAm_Fkqw?si=9PP3-1Y1fvX8xy7q" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

<VerticalStepper headerLevel="h2">
  ## 安装 uv \{#install-uv\}

  要按照本指南中的说明操作，你需要安装 [uv](https://docs.astral.sh/uv/)。
  如果你不想使用 uv，则需要更新 MCP 服务器配置，改用其他包管理器。

  ## 下载 Claude Desktop \{#download-claude-desktop\}

  你还需要安装 Claude Desktop 应用，可以从 [Claude Desktop 网站](https://claude.ai/desktop) 下载。

  ## 配置 ClickHouse MCP 服务器 \{#configure-clickhouse-mcp-server\}

  在你安装好 Claude Desktop 之后，就可以开始配置 [ClickHouse MCP 服务器](https://github.com/ClickHouse/mcp-clickhouse) 了。
  我们可以通过 [Claude Desktop 配置文件](https://claude.ai/docs/configuration) 来完成配置。

  要找到这个文件，先进入设置页面 (在 Mac 上按 `Cmd+,`) ，然后点击左侧菜单中的 `Developer` 选项卡。
  接着你会看到如下界面，此时需要点击 `Edit config` 按钮：

  <Image img={ClaudeDesktopConfig} alt="Claude Desktop 配置" size="md" />

  这会打开一个包含配置文件 (`claude_desktop_config.json`) 的目录。
  你第一次打开该文件时，其中很可能包含以下内容：

  ```json
  {
    "mcpServers": {}
  }
  ```

  `mcpServers` 字典以 MCP 服务器的名称作为键，以配置选项的字典作为值。
  例如，连接到 ClickHouse Playground 的 ClickHouse MCP 服务器配置如下：

  ```json
  {
    "mcpServers": {
      "mcp-clickhouse": {
        "command": "uv",
        "args": [
          "run",
          "--with",
          "mcp-clickhouse",
          "--python",
          "3.10",
          "mcp-clickhouse"
        ],
        "env": {
          "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
          "CLICKHOUSE_PORT": "8443",
          "CLICKHOUSE_USER": "demo",
          "CLICKHOUSE_PASSWORD": "",
          "CLICKHOUSE_SECURE": "true",
          "CLICKHOUSE_VERIFY": "true",
          "CLICKHOUSE_CONNECT_TIMEOUT": "30",
          "CLICKHOUSE_SEND_RECEIVE_TIMEOUT": "30"
        }
      }
    }
  }
  ```

  更新配置后，你需要重新启动 Claude Desktop 才能使更改生效。

  :::warning
  具体取决于你安装 `uv` 的方式，在重新启动 Claude Desktop 时你可能会遇到如下错误：

  ```text
  MCP mcp-clickhouse: spawn uv ENOENT
  ```

  如果发生这种情况，你需要更新 `command`，将 `uv` 的完整路径填入其中。比如，如果你是通过 Cargo 安装的，路径会是 `/Users/<username>/.cargo/bin/uv`
  :::

  ## 使用 ClickHouse MCP 服务器 \{#using-clickhouse-mcp-server\}

  重新启动 Claude Desktop 后，你可以点击 `Search and tools` 图标找到 ClickHouse MCP 服务器：

  <Image img={FindMCPServers} alt="查找 MCP 服务器" size="md" />

  <br />

  然后，你可以选择禁用全部工具，或只禁用其中一部分。

  现在我们已经准备好向 Claude 提出一些问题，这会促使它使用 ClickHouse MCP 服务器。
  例如，我们可以问它 `What's the most interesting dataset in the SQL playground?`。

  Claude 在首次调用 MCP 服务器中的各个工具时，会要求我们确认是否允许使用：

  <Image img={MCPPermission} alt="授予使用 list_databases 工具的权限" size="md" />

  下面你可以看到一段对话的部分内容，其中包含一些对 ClickHouse MCP 服务器的工具调用：

  <Image img={ClaudeConversation} alt="Claude 对话" size="md" />
</VerticalStepper>