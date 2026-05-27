---
sidebar_label: 'Обзор'
slug: /cloud/features/ai-ml/agents/builder
title: 'Конструктор агентов'
description: 'Создавайте и настраивайте агентов ClickHouse в Конструкторе агентов'
keywords: ['AI', 'ClickHouse Cloud', 'агенты', 'конструктор агентов', 'инструменты', 'инструкции']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

Agent Builder — здесь вы создаёте и настраиваете агентов. Он открывается как боковая панель в консоли Cloud.

Панель состоит из трёх разделов:

* **Identity** вверху — имя, описание, аватар и поле инструкций (системный промпт).
* **Конфигурация модели** посередине — провайдер, модель и параметры генерации.
* **Возможности** внизу — инструменты, MCP-серверы, навыки и субагенты, которые вы подключаете.

Сохраните изменения кнопкой в нижнем колонтитуле. Изменения вступят в силу в следующем разговоре; уже выполняющиеся запуски не будут прерваны.

## Identity \{#identity\}

Поле инструкций — это системный промпт агента. Опишите роль агента, на какие вопросы он должен отвечать и каким правилам следовать. Если агент будет выполнять запросы к вашему сервису ClickHouse, подробно укажите соглашения по схеме, вычисляемые метрики и терминологию — модель не сможет самостоятельно понять принятые у вас бизнес-определения.

## Основная конфигурация \{#core-configuration\}

* [Параметры модели](/cloud/features/ai-ml/agents/builder/model-parameters) — Выберите модель и настройте параметры генерации. Сохраните конфигурацию как именованный пресет, чтобы использовать её повторно.

## Встроенные инструменты \{#built-in-tools\}

* [Code interpreter](/cloud/features/ai-ml/agents/builder/code-interpreter) — Выполнение кода в изолированной среде.
* [Web search](/cloud/features/ai-ml/agents/builder/web-search) — Поиск в открытом интернете.
* [Image generation](/cloud/features/ai-ml/agents/builder/image-generation) — Генерация изображений по тексту.
* [Vision](/cloud/features/ai-ml/agents/builder/vision) — Поддержка входных изображений.

## Расширяемость \{#extensibility\}

* [MCP-серверы](/cloud/features/ai-ml/agents/builder/mcp-servers) — Подключайте к агенту сторонние MCP-серверы.
* [Навыки](/cloud/features/ai-ml/agents/builder/skills) — Переиспользуемые наборы инструкций.
* [Субагенты](/cloud/features/ai-ml/agents/builder/subagents) — Делегируйте задачи дочерним агентам.