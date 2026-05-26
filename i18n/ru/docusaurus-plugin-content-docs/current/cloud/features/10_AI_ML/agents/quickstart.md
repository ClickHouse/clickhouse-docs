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

<BetaBadge />

Создайте собственный агент в консоли Cloud и выполните запрос к своему сервису на естественном языке.

## Необходимые условия \{#prerequisites\}

* Сервис ClickHouse Cloud, к которому можно выполнять запросы.
* Опция **Create agent** в Agent Builder. Если она отсутствует, попросите администратора организации выдать право на создание агентов через Admin Settings, как описано в разделе [совместное использование и доступ](/cloud/features/ai-ml/agents/sharing-and-access).

## Создайте агента \{#create-the-agent\}

В консоли Cloud откройте раздел Agents и на боковой панели Agent Builder нажмите **Create agent**. Заполните основные поля:

* **Name** — короткий идентификатор.
* **Description** — одна строка, чтобы коллеги понимали, для чего нужен агент.
* **Instructions** — системный промпт. Опишите роль агента, вопросы, на которые он должен отвечать, и бизнес-правила, которым он должен следовать.
* **Model** — выберите модель из раскрывающегося списка. Настройте temperature и другие параметры генерации в разделе [параметры модели](/cloud/features/ai-ml/agents/builder/model-parameters).

## Подключите инструменты \{#attach-tools\}

Определите, какие возможности нужны агенту. В Builder можно добавить:

* [Интерпретатор кода](/cloud/features/ai-ml/agents/builder/code-interpreter) — изолированное выполнение кода для вычислений и преобразования данных.
* [Веб-поиск](/cloud/features/ai-ml/agents/builder/web-search) — поиск в общедоступном интернете.
* [Генерация изображений](/cloud/features/ai-ml/agents/builder/image-generation) и [компьютерное зрение](/cloud/features/ai-ml/agents/builder/vision) — визуальный вывод и ввод.
* [MCP-серверы](/cloud/features/ai-ml/agents/builder/mcp-servers) — сторонние инструменты по протоколу Model Context Protocol.
* [Навыки](/cloud/features/ai-ml/agents/builder/skills) и [субагенты](/cloud/features/ai-ml/agents/builder/subagents) — повторно используемые наборы инструкций и делегирование задач.

Подключенные инструменты можно изменить в любое время.

## Выполните запрос \{#run-a-query\}

Сохраните агента, откройте новый диалог и выберите своего агента в списке агентов. Введите вопрос — например, *&quot;Какие 10 моих таблиц имеют наибольшее число строк на этой неделе?&quot;* — и агент составит план, при необходимости вызовет инструменты и вернет ответ.

## Следующие шаги \{#next-steps\}

* [Поделитесь агентом](/cloud/features/ai-ml/agents/sharing-and-access) с коллегами.
* Опубликуйте его в [маркетплейсе](/cloud/features/ai-ml/agents/marketplace), как только агент станет стабильным.