---
sidebar_label: 'Быстрый старт'
sidebar_position: 1
slug: /cloud/features/ai-ml/agents/quickstart
title: 'Быстрый старт'
description: 'Создайте и запустите свой первый ClickHouse Agent для сервиса ClickHouse Cloud'
keywords: ['AI', 'ClickHouse Cloud', 'агенты', 'быстрый старт', 'конструктор агентов']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import agentBuilder from '@site/static/images/cloud/agent-builder/agent-builder.png';
import capabilities from '@site/static/images/cloud/agent-builder/capabilities.png';
import toolsButton from '@site/static/images/cloud/agent-builder/tools-button.png';
import toolsModal from '@site/static/images/cloud/agent-builder/tools-modal.png';
import chatQuery from '@site/static/images/cloud/agent-builder/chat-query.png';
import launchAgents from '@site/static/images/cloud/agent-builder/launch-ch-agents.png';

<BetaBadge />

Создайте собственный агент в консоли Cloud и выполните запрос к своему сервису на естественном языке.

## Необходимые условия \{#prerequisites\}

* Сервис ClickHouse Cloud, к которому можно выполнять запросы.
* Опция **Create agent** в Agent Builder. Если она отсутствует, попросите администратора организации выдать право на создание агентов через Admin Settings, как описано в разделе [совместное использование и доступ](/cloud/features/ai-ml/agents/sharing-and-access).

## Создайте агента \{#build-the-agent\}

<VerticalStepper headerLevel="h3">
  ### Запустите ClickHouse agents \{#launch-agents\}

  В сервисе ClickHouse Cloud нажмите **ClickHouse agents** на левой боковой панели, чтобы открыть страницу запуска агентов. Затем нажмите **Launch ClickHouse agents**, чтобы открыть Конструктор агентов.

  <Image img={launchAgents} alt="Навигация сервиса ClickHouse Cloud с выбранным пунктом ClickHouse agents (бета), показывающая страницу запуска с кнопкой Launch ClickHouse agents" size="lg" />

  ### Создайте агента \{#create-the-agent\}

  В Конструкторе агентов нажмите **Create New Agent** в верхней части левой панели. Заполните основные поля:

  * **Name** - короткий идентификатор агента.
  * **Description** - описание назначения агента, которое будет видно коллегам.
  * **Category** - категория агента. Можно оставить `General`, если в вашей организации не используются пользовательские категории.
  * **Instructions** - системный промпт, который описывает роль агента, вопросы, на которые он должен отвечать, и бизнес-правила, которым он должен следовать.
  * **Model** - выберите модель из выпадающего списка.

  <Image img={agentBuilder} alt="Панель Конструктора агентов с раскрывающимся списком Create New Agent, полями формы (Name, Description, Category, Instructions, Model) и разделом Capabilities" size="lg" />

  ### Подключите возможности и инструменты \{#attach-tools\}

  Возможности и инструменты агента находятся в двух местах.

  **Capabilities** на основной панели — встроенные возможности, такие как [Run Code](/cloud/features/ai-ml/agents/builder/code-interpreter), [Веб-поиск](/cloud/features/ai-ml/agents/builder/web-search), File Context, Artifacts, [MCP-серверы](/cloud/features/ai-ml/agents/builder/mcp-servers) и [навыки](/cloud/features/ai-ml/agents/builder/skills). Включите те, которые нужны агенту.

  <Image img={capabilities} alt="Раздел Capabilities в панели Конструктора агентов с переключателями Run Code, Web Search, File Context, Artifacts, MCP Servers и навыки" size="sm" />

  **Tools** за кнопкой **Add Tools** внизу панели — сторонние интеграции, такие как [генерация изображений](/cloud/features/ai-ml/agents/builder/image-generation), [Vision](/cloud/features/ai-ml/agents/builder/vision), поисковые API и внешние сервисы.

  <Image img={toolsButton} alt="Нижняя часть панели Конструктора агентов с выделенной кнопкой Add Tools" size="sm" />

  Нажмите **Add Tools**, чтобы открыть каталог:

  <Image img={toolsModal} alt="Модальное окно Agent Tools, показывающее сетку сторонних интеграций, включая Google, OpenAI Image Tools, Wolfram, DALL-E-3, Tavily Search, Calculator и Stable Diffusion" size="lg" />

  [Subagents](/cloud/features/ai-ml/agents/builder/subagents) настраиваются в разделе **Advanced settings** — подробности см. на странице о субагентах.

  Подключенные возможности и инструменты можно изменить в любое время.

  ### Выполните запрос \{#run-a-query\}

  Сохраните агента, откройте новый диалог и выберите его в списке агентов. Введите вопрос — например, *&quot;Какие 10 таблиц имеют наибольшее число строк за эту неделю?&quot;* — и агент составит план, при необходимости вызовет инструменты и вернет ответ.

  <Image img={chatQuery} alt="Диалог в чате с вопросом 'Какие 10 таблиц имеют наибольшее число строк за эту неделю?' и ответом агента — таблицей Markdown с рейтингом 10 лучших таблиц по сервисам по числу строк, а ниже разделом Key Observations" size="lg" />
</VerticalStepper>

## Следующие шаги \{#next-steps\}

* [Поделитесь агентом](/cloud/features/ai-ml/agents/sharing-and-access) с коллегами.
* Опубликуйте его в [маркетплейсе](/cloud/features/ai-ml/agents/marketplace), как только агент станет стабильным.