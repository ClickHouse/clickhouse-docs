---
slug: /use-cases/AI/MCP/janai
sidebar_label: 'Интеграция с Jan.ai'
title: 'Настройка сервера ClickHouse MCP для Jan.ai'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве объясняется, как настроить Jan.ai для работы с сервером ClickHouse MCP.'
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

# Использование MCP-сервера ClickHouse с Jan.ai \\{#using-clickhouse-mcp-server-with-janai\\}

> В этом руководстве описывается использование MCP-сервера ClickHouse с [Jan.ai](https://jan.ai/docs).

<VerticalStepper headerLevel="h2">

## Установка Jan.ai \\{#install-janai\\}

Jan.ai — это открытое приложение, являющееся альтернативой ChatGPT и работающее на 100 % офлайн.
Вы можете скачать Jan.ai для [Mac](https://jan.ai/docs/desktop/mac), [Windows](https://jan.ai/docs/desktop/windows) или [Linux](https://jan.ai/docs/desktop/linux).

Это нативное приложение, поэтому после загрузки вы можете просто запустить его.

## Добавить LLM в Jan.ai \\{#add-llm-to-janai\\}

Мы можем включить модели через меню настроек. 

Чтобы включить поддержку OpenAI, нужно указать API-ключ, как показано ниже:

<Image img={OpenAIModels} alt="Включение моделей OpenAI" size="md"/>

## Включение MCP Servers \\{#enable-mcp-servers\\}

На момент написания этой инструкции MCP Servers являются экспериментальной функцией в Jan.ai.
Их можно включить, переключив экспериментальные функции:

<Image img={MCPServers} alt="Enable MCP servers" size="md"/>

После переключения этого переключателя в левом меню появится пункт `MCP Servers`.

## Настройка ClickHouse MCP Server \\{#configure-clickhouse-mcp-server\\}

Если нажать на меню `MCP Servers`, откроется список MCP-серверов, к которым можно подключиться:

<Image img={MCPServersList} alt="Список MCP-серверов" size="md"/>

Все эти серверы по умолчанию отключены, но их можно включить с помощью переключателя.

Чтобы установить ClickHouse MCP Server, нажмите на значок `+`, а затем заполните форму следующими данными:

<Image img={MCPForm} alt="Добавление MCP-сервера" size="md"/>

После этого нужно будет включить ClickHouse Server, если он ещё не включён:

<Image img={MCPEnabled} alt="Включение MCP-сервера" size="md"/>

Инструменты ClickHouse MCP Server теперь будут отображаться в окне чата:

<Image img={MCPTool} alt="Инструменты ClickHouse MCP Server" size="md"/>

## Общение с ClickHouse MCP Server через Jan.ai \\{#chat-to-clickhouse-mcp-server\\}

Пришло время обсудить данные, хранящиеся в ClickHouse!
Задайте вопрос:

<Image img={Question} alt='Вопрос' size='md' />

Jan.ai запросит подтверждение перед вызовом инструмента:

<Image img={MCPToolConfirm} alt='Подтверждение инструмента' size='md' />

Затем отобразится список выполненных вызовов инструментов:

<Image img={ToolsCalled} alt='Вызванные инструменты' size='md' />

При нажатии на вызов инструмента можно просмотреть детали вызова:

<Image img={ToolsCalledExpanded} alt='Развернутый список вызванных инструментов' size='md' />

Ниже представлен результат:

<Image img={Result} alt='Результат' size='md' />

</VerticalStepper>
