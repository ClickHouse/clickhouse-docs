---
slug: /use-cases/observability/clickstack/faq
title: 'Частые вопросы о ClickStack'
sidebar_label: 'FAQ'
pagination_prev: null
pagination_next: null
description: 'Часто задаваемые вопросы о системе оповещений, дашбордах, детализации (drill-down) и исследовании метрик в ClickStack.'
doc_type: 'guide'
keywords: ['ClickStack', 'FAQ', 'оповещения', 'дашборды', 'детализация (drill-down)', 'исследование метрик']
---

На этой странице приведены ответы на часто задаваемые вопросы о возможностях ClickStack, включая систему оповещений, дашборды и детализацию (drill-down), а также исследование метрик.

## Оповещения \{#alerting\}

<details>
<summary><strong>Какие типы оповещений поддерживает ClickStack?</strong></summary>

ClickStack поддерживает два типа оповещений:

- [Поисковые оповещения](/use-cases/observability/clickstack/alerts#search-alerts) — отправляют уведомления, когда количество подходящих результатов логов или трейсов в пределах временного окна превышает или становится ниже порогового значения.
- [Оповещения по графикам дашборда](/use-cases/observability/clickstack/alerts#dashboard-alerts) — отправляют уведомления, когда метрика, отображаемая на тайле дашборда, пересекает заданный порог.

Оба типа оповещений используют условия со статическими порогами. Подробности см. в разделе [Alerts](/use-cases/observability/clickstack/alerts).

</details>

<details>
<summary><strong>Могу ли я настраивать оповещения по сложным условиям для метрик, таким как отношения, p95/p99 или формулы с несколькими метриками?</strong></summary>

Отношения двух метрик, а также значения p95 и p99 можно отобразить на тайле дашборда с помощью интерфейса [chart builder](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer). Затем вы можете создать пороговые оповещения для этих тайлов.

Однако ClickStack в настоящее время не поддерживает:

- Оповещения по пользовательским SQL-запросам для метрик.
- Правила оповещений с несколькими условиями или несколькими метриками, объединёнными в одно оповещение.
- Динамические условия оповещений или условия, основанные на обнаружении аномалий (обнаружение аномалий запланировано).

Если вам нужно настроить оповещение по сложной метрике, рекомендуемый подход — сначала создать визуализацию в виде графика на дашборде, а затем привязать к этому графику пороговое оповещение.

</details>

<details>
<summary><strong>Могу ли я использовать materialized views для сценариев оповещений?</strong></summary>

Materialized views автоматически используются ClickStack для оповещений, когда это применимо. Однако materialized views в настоящее время не поддерживаются для источников данных по метрикам OpenTelemetry. Для метрик ClickStack лучше всего работает со стандартной [ClickHouse OpenTelemetry metrics schema](/use-cases/observability/clickstack/ingesting-data/schemas). Дополнительную информацию о materialized views см. в разделе [Materialized views](/use-cases/observability/clickstack/materialized_views).

</details>

## Дашборды и drill-down-переходы \{#dashboards-and-drill-downs\}

<details>
<summary><strong>Поддерживает ли ClickStack параметризованные дашборды или переменные дашбордов?</strong></summary>

ClickStack поддерживает настраиваемые выпадающие фильтры на дашбордах, заполняемые данными, запрошенными из ClickHouse. Эти фильтры позволяют динамически ограничивать все тайлы на дашборде определённым значением (например, именем сервиса, окружением или хостом).

В настоящее время ClickStack не поддерживает переиспользуемые переменные дашбордов в стиле template‑переменных Grafana. Поскольку ClickStack работает исключительно с ClickHouse как источником данных, возможности drill-down и фильтрации могут предоставляться нативно без необходимости в дополнительном слое абстракции для переменных.

Подробности по созданию дашбордов и применению фильтров см. в разделе [Dashboards](/use-cases/observability/clickstack/dashboards).

</details>

<details>
<summary><strong>Какие возможности drill-down доступны?</strong></summary>

ClickStack поддерживает следующие сценарии drill-down‑переходов:

- [Фильтрация на уровне дашборда](/use-cases/observability/clickstack/dashboards#filter-dashboards) — фильтры Lucene или SQL и настройки диапазона времени, применённые на уровне дашборда, распространяются на все тайлы.
- Настраиваемые фильтры дашборда — настраиваемые дашборды поддерживают явные элементы управления фильтрами, которые заполняются значениями из ваших данных, позволяя пользователям ограничивать все тайлы без ручного написания запросов.
- Переход к событиям по клику — нажатие на данные в тайле дашборда и выбор **View Events** приводит к переходу на страницу [Search](/use-cases/observability/clickstack/search) с релевантными фильтрами для данных логов и трейсинга.
- [Преднастроенные drill-down‑переходы дашбордов](/use-cases/observability/clickstack/dashboards#presets) — дашборды [Services](/use-cases/observability/clickstack/dashboards#services-dashboard), [ClickHouse](/use-cases/observability/clickstack/dashboards#clickhouse-dashboard) и [Kubernetes](/use-cases/observability/clickstack/dashboards#kubernetes-dashboard) включают более развитую встроенную drill-down‑навигацию между вкладками.

Многоуровневые drill-down‑переходы с одного настраиваемого дашборда на другой (дашборд → дашборд → детализированный просмотр) в настоящее время не поддерживаются.

:::note
Механизм drill-down **View Events** лучше всего работает с данными логов и трейсинга. Поскольку данные метрик не могут просматриваться на странице [Search](/use-cases/observability/clickstack/search), при drill-down с тайла метрик будет выполняться переход к логам за период, близкий к выбранному интервалу.
:::

</details>

## Обнаружение метрик \{#metrics-discovery\}

<details>
<summary><strong>Есть ли UI для просмотра и поиска метрик?</strong></summary>

![Metric Attribute Explorer](/images/clickstack/faq/metrics-explorer.png)

Имена метрик можно обнаружить с помощью выпадающего списка с именами метрик в [конструкторе графиков](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer). Когда метрика выбрана, панель Metric Attribute Explorer отображает её описание, единицы измерения и доступные атрибуты вместе с их значениями. Это позволяет просматривать атрибуты и добавлять их как фильтры или поля группировки (group-by) непосредственно из панели.

В настоящее время нет отдельной страницы для поиска по метрикам, аналогичной интерфейсу поиска логов. Улучшение обнаружения метрик является активной областью разработки.

</details>

<details>
<summary><strong>Является ли обнаружение метрик на основе SQL планируемым долгосрочным подходом?</strong></summary>

Нет. Хотя SQL-запросы сегодня можно использовать для обнаружения метрик, это не планируемый долгосрочный подход. Улучшенные инструменты для обнаружения метрик находятся в активной разработке.

</details>

## Дополнительные материалы \{#further-reading\}

- [Alerts](/use-cases/observability/clickstack/alerts) — поисковые алерты, алерты по графикам на дашбордах и интеграции с вебхуками.
- [Dashboards](/use-cases/observability/clickstack/dashboards) — создание визуализаций, построение дашбордов и применение фильтров.
- [Search](/use-cases/observability/clickstack/search) — выполнение запросов по логам и трейсам с помощью синтаксиса Lucene и SQL.
- [Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) — схемы данных OpenTelemetry для логов, трейсов и метрик.
- [Architecture](/use-cases/observability/clickstack/architecture) — компоненты ClickStack и их взаимодействие.