---
'slug': '/use-cases/AI/MCP/janai'
'sidebar_label': '集成 Jan.ai'
'title': '设置 ClickHouse MCP 服务器与 Jan.ai'
'pagination_prev': null
'pagination_next': null
'description': '本指南解释了如何与 ClickHouse MCP 服务器设置 Jan.ai。'
'keywords':
- 'AI'
- 'Jan.ai'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import OpenAIModels from '@site/static/images/use-cases/AI_ML/MCP/0_janai_openai.png';
import MCPServers from '@site/static/images/use-cases/AI_ML/MCP/1_janai_mcp_servers.png';
import MCPServersList from '@site/static/images/use-cases/AI_ML/MCP/2_janai_mcp_servers_list.png';
import MCPForm from '@site/static/images/use-cases/AI_ML/MCP/3_janai_add_mcp_server.png';
import MCPEnabled from '@site/static/images/use-cases/AI_ML/MCP/4_janai_toggle.png';
import MCPTool from '@site/static/images/use-cases/AI_ML/MCP/5_jani_tools.png';
import Question from '@site/static/images/use-cases/AI_ML/MCP/6_janai_question.png';
import MCPToolConfirm from '@site/static/images/use-cases/AI_ML/MCP/7_janai_tool_confirmation.png';

```jsx
import ToolsCalled from '@site/static/images/use-cases/AI_ML/MCP/8_janai_tools_called.png';  
import ToolsCalledExpanded from '@site/static/images/use-cases/AI_ML/MCP/9_janai_tools_called_expanded.png';  
import Result from '@site/static/images/use-cases/AI_ML/MCP/10_janai_result.png';  


# 使用 ClickHouse MCP 服务器与 Jan.ai

> 本指南解释了如何将 ClickHouse MCP 服务器与 [Jan.ai](https://jan.ai/docs) 一起使用。

<VerticalStepper headerLevel="h2">

## 安装 Jan.ai {#install-janai}

Jan.ai 是一个开源的 ChatGPT 替代品，支持 100% 离线运行。
您可以为 [Mac](https://jan.ai/docs/desktop/mac)、[Windows](https://jan.ai/docs/desktop/windows) 或 [Linux](https://jan.ai/docs/desktop/linux) 下载 Jan.ai。

它是一个原生应用，因此下载后可以直接启动。

## 将 LLM 添加到 Jan.ai {#add-llm-to-janai}

我们可以通过设置菜单启用模型。

要启用 OpenAI，我们需要提供一个 API 密钥，如下所示：

<Image img={OpenAIModels} alt="启用 OpenAI 模型" size="md"/>

## 启用 MCP 服务器 {#enable-mcp-servers}

在撰写本文时，MCP 服务器是 Jan.ai 中的一项实验性功能。
我们可以通过切换实验性功能来启用它们：

<Image img={MCPServers} alt="启用 MCP 服务器" size="md"/>

一旦按下该切换开关，我们将在左侧菜单上看到 `MCP Servers`。

## 配置 ClickHouse MCP 服务器 {#configure-clickhouse-mcp-server}

如果我们点击 `MCP Servers` 菜单，我们将看到可以连接到的 MCP 服务器列表：

<Image img={MCPServersList} alt="MCP 服务器列表" size="md"/>

这些服务器默认都是禁用的，但我们可以通过点击切换开关来启用它们。

要安装 ClickHouse MCP 服务器，我们需要点击 `+` 图标，然后用以下信息填充表单：

<Image img={MCPForm} alt="添加 MCP 服务器" size="md"/>

完成后，如果 ClickHouse 服务器尚未切换开启，我们需要切换它：

<Image img={MCPEnabled} alt="启用 MCP 服务器" size="md"/>

ClickHouse MCP 服务器的工具现在将会在聊天对话框中可见：

<Image img={MCPTool} alt="ClickHouse MCP 服务器工具" size="md"/>

## 使用 Jan.ai 与 ClickHouse MCP 服务器聊天 {#chat-to-clickhouse-mcp-server}

现在是时候讨论存储在 ClickHouse 中的一些数据了！
让我们提一个问题：

<Image img={Question} alt="问题" size="md"/>

Jan.ai将在调用工具之前要求确认：

<Image img={MCPToolConfirm} alt="工具确认" size="md"/>

然后它将向我们显示已进行的工具调用列表：

<Image img={ToolsCalled} alt="调用的工具" size="md"/>

如果我们点击工具调用，我们可以查看调用的详细信息：

<Image img={ToolsCalledExpanded} alt="扩展的工具调用" size="md"/>    

然后在下面，我们会看到我们的结果：

<Image img={Result} alt="结果" size="md"/>    

</VerticalStepper>
