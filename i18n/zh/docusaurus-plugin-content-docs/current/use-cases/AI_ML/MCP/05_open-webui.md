---
'slug': '/use-cases/AI/MCP/open-webui'
'sidebar_label': '集成 Open WebUI'
'title': '使用 Open WebUI 和 ClickHouse Cloud 设置 ClickHouse MCP 服务器'
'pagination_prev': null
'pagination_next': null
'description': '本指南解释了如何使用 Docker 设置 Open WebUI 和 ClickHouse MCP 服务器。'
'keywords':
- 'AI'
- 'Open WebUI'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
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


# 使用 ClickHouse MCP 服务器与 Open WebUI

> 本指南解释了如何设置 [Open WebUI](https://github.com/open-webui/open-webui) 与 ClickHouse MCP 服务器，并将其连接到 ClickHouse 示例数据集。

<VerticalStepper headerLevel="h2">

## 安装 uv {#install-uv}

您需要安装 [uv](https://docs.astral.sh/uv/) 来按照本指南中的说明进行操作。如果您不想使用 uv，则需要更新 MCP Server 配置以使用替代的包管理器。

## 启动 Open WebUI {#launch-open-webui}

要启动 Open WebUI，您可以运行以下命令：

```bash
uv run --with open-webui open-webui serve
```

导航到 http://localhost:8080/ 以查看 UI。

## 配置 ClickHouse MCP 服务器 {#configure-clickhouse-mcp-server}

要设置 ClickHouse MCP 服务器，我们需要将 MCP 服务器转换为 Open API 端点。首先，让我们设置环境变量，以便我们可以连接到 ClickHouse SQL Playground：

```bash
export CLICKHOUSE_HOST="sql-clickhouse.clickhouse.com"
export CLICKHOUSE_USER="demo"
export CLICKHOUSE_PASSWORD=""
```

然后，我们可以运行 `mcpo` 以创建 Open API 端点：

```bash
uvx mcpo --port 8000 -- uv run --with mcp-clickhouse --python 3.10 mcp-clickhouse
```

您可以通过导航到 http://localhost:8000/docs 查看创建的端点列表。

<Image img={Endpoints} alt="Open API endpoints" size="md"/>

要在 Open WebUI 中使用这些端点，我们需要导航到设置：

<Image img={Settings} alt="Open WebUI settings" size="md"/>

点击 `Tools`：

<Image img={ToolsPage} alt="Open WebUI tools" size="md"/>

添加 http://localhost:8000 作为工具 URL：

<Image img={AddTool} alt="Open WebUI tool" size="md"/>

完成此操作后，我们应该在聊天栏的工具图标旁边看到 `1`：

<Image img={ToolsAvailable} alt="Open WebUI tools available" size="md"/>

如果我们点击工具图标，就可以列出可用的工具：

<Image img={ListOfTools} alt="Open WebUI tool listing" size="md"/>

## 配置 OpenAI {#configure-openai}

默认情况下，Open WebUI 与 Ollama 模型一起工作，但我们也可以添加与 OpenAI 兼容的端点。这些通过设置菜单进行配置，但这次我们需要点击 `Connections` 选项卡：

<Image img={Connections} alt="Open WebUI connections" size="md"/>

让我们添加端点和我们的 OpenAI 密钥：

<Image img={AddConnection} alt="Open WebUI - Add OpenAI as a connection" size="md"/>

然后，OpenAI 模型将在顶部菜单中可用：

<Image img={OpenAIModels} alt="Open WebUI - Models" size="md"/>

## 与 ClickHouse MCP 服务器进行聊天 {#chat-to-clickhouse-mcp-server}

然后，我们可以进行对话，Open WebUI 在必要时将调用 MCP 服务器：

<Image img={Conversation} alt="Open WebUI - Chat with ClickHouse MCP Server" size="md"/>

</VerticalStepper>
