---
slug: /use-cases/AI/MCP/open-webui
sidebar_label: '集成 Open WebUI'
title: '使用 Open WebUI 和 ClickHouse Cloud 设置 ClickHouse MCP 服务器'
pagination_prev: null
pagination_next: null
description: '本指南介绍如何使用 Docker 将 Open WebUI 与 ClickHouse MCP 服务器集成。'
keywords: ['AI', 'Open WebUI', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';

import Endpoints from '@site/static/images/use-cases/AI_ML/MCP/0_endpoints.png';
import Settings from '@site/static/images/use-cases/AI_ML/MCP/1_settings.png';
import ToolsPage from '@site/static/images/use-cases/AI_ML/MCP/2_tools_page.png';
import AddTool from '@site/static/images/use-cases/AI_ML/MCP/3_add_tool.png';
import ToolsAvailable from '@site/static/images/use-cases/AI_ML/MCP/4_tools_available.png';
import ListOfTools from '@site/static/images/use-cases/AI_ML/MCP/5_list_of_tools.png';
import Connections from '@site/static/images/use-cases/AI_ML/MCP/6_connections.png';
import AddConnection from '@site/static/images/use-cases/AI_ML/MCP/7_add_connection.png';
import OpenAIModels from '@site/static/images/use-cases/AI_ML/MCP/8_openai_models_more.png';
import Conversation from '@site/static/images/use-cases/AI_ML/MCP/9_conversation.png';

# 使用 ClickHouse MCP 服务器 与 Open WebUI \{#using-clickhouse-mcp-server-with-open-webui\}

> 本指南介绍如何将 [Open WebUI](https://github.com/open-webui/open-webui) 与 ClickHouse MCP 服务器 配置在一起，
> 并将其连接到 ClickHouse 示例数据集。

<VerticalStepper headerLevel="h2">
  ## 安装 uv \{#install-uv\}

  要按照本指南中的说明操作，你需要安装 [uv](https://docs.astral.sh/uv/)。
  如果你不想使用 uv，则需要更新 MCP 服务器 配置以改用其他包管理器。

  ## 启动 Open WebUI \{#launch-open-webui\}

  要启动 Open WebUI，你可以运行以下命令：

  ```bash
  uv run --with open-webui open-webui serve
  ```

  访问 http://localhost:8080/ 以查看 UI。

  ## 配置 ClickHouse MCP Server \{#configure-clickhouse-mcp-server\}

  要配置 ClickHouse MCP Server，我们需要将 MCP Server 暴露为一组 OpenAPI 端点。
  首先，先设置环境变量，以便连接到 ClickHouse SQL Playground：

  ```bash
  export CLICKHOUSE_HOST="sql-clickhouse.clickhouse.com"
  export CLICKHOUSE_USER="demo"
  export CLICKHOUSE_PASSWORD=""
  ```

  然后我们可以运行 `mcpo` 来创建 OpenAPI 端点：

  ```bash
  uvx mcpo --port 8000 -- uv run --with mcp-clickhouse --python 3.10 mcp-clickhouse
  ```

  你可以通过访问 [http://localhost:8000/docs](http://localhost:8000/docs) 查看已创建的端点列表。

  <Image img={Endpoints} alt="Open API 端点" size="md" />

  要在 Open WebUI 中使用这些端点，我们需要先进入设置：

  <Image img={Settings} alt="Open WebUI 设置" size="md" />

  点击 `Tools`：

  <Image img={ToolsPage} alt="Open WebUI 工具" size="md" />

  将 [http://localhost:8000](http://localhost:8000) 添加为工具的 URL：

  <Image img={AddTool} alt="Open WebUI 工具" size="md" />

  完成上述操作后，你应该会在聊天栏的工具图标旁看到一个数字 `1`：

  <Image img={ToolsAvailable} alt="可用的 Open WebUI 工具" size="md" />

  点击工具图标后，就可以看到可用工具列表：

  <Image img={ListOfTools} alt="Open WebUI 工具列表" size="md" />

  ## 配置 OpenAI \{#configure-openai\}

  默认情况下，Open WebUI 使用 Ollama 模型，但我们也可以添加与 OpenAI 兼容的端点。
  这些内容通过设置菜单进行配置，不过这次需要点击 `创建` 选项卡：

  <Image img={Connections} alt="Open WebUI 创建" size="md" />

  接下来添加端点和你的 OpenAI 密钥：

  <Image img={AddConnection} alt="Open WebUI - 添加 OpenAI 作为创建" size="md" />

  随后，OpenAI 模型将在顶部菜单中可用：

  <Image img={OpenAIModels} alt="Open WebUI - 模型" size="md" />

  ## 使用 Open WebUI 与 ClickHouse MCP 服务器 对话 \{#chat-to-clickhouse-mcp-server\}

  然后，你就可以开始对话，Open WebUI 会在需要时调用 MCP 服务器：

  <Image img={Conversation} alt="Open WebUI - 与 ClickHouse MCP 服务器 对话" size="md" />
</VerticalStepper>