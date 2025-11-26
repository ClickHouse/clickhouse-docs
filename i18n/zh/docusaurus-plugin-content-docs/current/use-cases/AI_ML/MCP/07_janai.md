---
slug: /use-cases/AI/MCP/janai
sidebar_label: '集成 Jan.ai'
title: '使用 Jan.ai 设置 ClickHouse MCP 服务器'
pagination_prev: null
pagination_next: null
description: '本指南介绍如何将 Jan.ai 与 ClickHouse MCP 服务器进行设置。'
keywords: ['AI', 'Jan.ai', 'MCP']
show_related_blogs: true
doc_type: 'guide'
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
import ToolsCalled from '@site/static/images/use-cases/AI_ML/MCP/8_janai_tools_called.png';  
import ToolsCalledExpanded from '@site/static/images/use-cases/AI_ML/MCP/9_janai_tools_called_expanded.png';  
import Result from '@site/static/images/use-cases/AI_ML/MCP/10_janai_result.png';


# 在 Jan.ai 中使用 ClickHouse MCP 服务器

> 本指南介绍如何在 [Jan.ai](https://jan.ai/docs) 中使用 ClickHouse MCP 服务器。

<VerticalStepper headerLevel="h2">


## 安装 Jan.ai {#install-janai}

Jan.ai 是一个开源的 ChatGPT 替代品，可以100% 离线运行。
可以为 [Mac](https://jan.ai/docs/desktop/mac)、[Windows](https://jan.ai/docs/desktop/windows) 或 [Linux](https://jan.ai/docs/desktop/linux) 下载 Jan.ai。

这是一个原生应用，下载完成后即可启动使用。



## 将 LLM 添加到 Jan.ai {#add-llm-to-janai}

我们可以在设置菜单中启用模型。

要启用 OpenAI，我们需要提供一个 API 密钥，如下所示：

<Image img={OpenAIModels} alt="启用 OpenAI 模型" size="md"/>



## 启用 MCP 服务器 {#enable-mcp-servers}

在撰写本文时，MCP 服务器仍然是 Jan.ai 中的一项实验性功能。
我们可以通过打开实验性功能开关来启用它们：

<Image img={MCPServers} alt="Enable MCP servers" size="md"/>

启用该开关后，我们会在左侧菜单中看到 `MCP Servers`。



## 配置 ClickHouse MCP Server {#configure-clickhouse-mcp-server}

点击 `MCP Servers` 菜单后，我们会看到可连接的 MCP 服务器列表：

<Image img={MCPServersList} alt="MCP 服务器列表" size="md"/>

这些服务器默认都是禁用状态，但我们可以通过点击开关来启用它们。

要安装 ClickHouse MCP Server，我们需要点击 `+` 图标，然后按如下方式填写表单：

<Image img={MCPForm} alt="添加 MCP 服务器" size="md"/>

完成上述操作后，如果 ClickHouse MCP Server 还未启用，我们需要将其开关切换为启用：

<Image img={MCPEnabled} alt="启用 MCP 服务器" size="md"/>

现在 ClickHouse MCP Server 的工具会出现在聊天对话框中：

<Image img={MCPTool} alt="ClickHouse MCP Server 工具" size="md"/>



## 使用 Jan.ai 与 ClickHouse MCP 服务器对话 {#chat-to-clickhouse-mcp-server}

现在可以开始查询存储在 ClickHouse 中的数据了!
让我们提出一个问题:

<Image img={Question} alt='问题' size='md' />

Jan.ai 在调用工具之前会请求确认:

<Image img={MCPToolConfirm} alt='工具确认' size='md' />

然后它会显示已执行的工具调用列表:

<Image img={ToolsCalled} alt='已调用的工具' size='md' />

如果点击工具调用,可以查看调用的详细信息:

<Image img={ToolsCalledExpanded} alt='已调用工具的展开视图' size='md' />

然后在下方,我们可以看到结果:

<Image img={Result} alt='结果' size='md' />

</VerticalStepper>
