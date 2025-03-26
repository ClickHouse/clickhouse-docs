---
description: 'Системная таблица, содержащая информацию о состоянии узлов планирования, находящихся на локальном сервере.'
keywords: ['системная таблица', 'планировщик']
slug: /operations/system-tables/scheduler
title: 'system.scheduler'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.scheduler

<SystemTableCloud/>

Содержит информацию о состоянии [узлов планирования](/operations/workload-scheduling.md/#hierarchy), находящихся на локальном сервере. Эта таблица может быть использована для мониторинга. Таблица содержит строку для каждого узла планирования.

Пример:

```sql
SELECT *
FROM system.scheduler
WHERE resource = 'network_read' AND path = '/prio/fair/prod'
FORMAT Vertical
```

```text
Row 1:
──────
resource:          network_read
path:              /prio/fair/prod
type:              fifo
weight:            5
priority:          0
is_active:         0
active_children:   0
dequeued_requests: 67
canceled_requests: 0
dequeued_cost:     4692272
canceled_cost:     0
busy_periods:      63
vruntime:          938454.1999999989
system_vruntime:   ᴺᵁᴸᴸ
queue_length:      0
queue_cost:        0
budget:            -60524
is_satisfied:      ᴺᵁᴸᴸ
inflight_requests: ᴺᵁᴸᴸ
inflight_cost:     ᴺᵁᴸᴸ
max_requests:      ᴺᵁᴸᴸ
max_cost:          ᴺᵁᴸᴸ
max_speed:         ᴺᵁᴸᴸ
max_burst:         ᴺᵁᴸᴸ
throttling_us:     ᴺᵁᴸᴸ
tokens:            ᴺᵁᴸᴸ
```

Столбцы:

- `resource` (`String`) - Имя ресурса
- `path` (`String`) - Путь к узлу планирования внутри иерархии планирования этого ресурса
- `type` (`String`) - Тип узла планирования.
- `weight` (`Float64`) - Важность узла, используемая родительским узлом типа `fair`.
- `priority` (`Int64`) - Приоритет узла, используемый родительским узлом типа 'priority' (меньшее значение - более высокий приоритет).
- `is_active` (`UInt8`) - Является ли этот узел в настоящее время активным - имеет ли запросы ресурсов, готовые к обезвреживанию, и удовлетворены ли ограничения.
- `active_children` (`UInt64`) - Количество дочерних узлов в активном состоянии.
- `dequeued_requests` (`UInt64`) - Общее количество запросов ресурсов, обезвреженных из этого узла.
- `canceled_requests` (`UInt64`) - Общее количество запросов ресурсов, отмененных из этого узла.
- `dequeued_cost` (`UInt64`) - Сумма затрат (например, размер в байтах) всех запросов, обезвреженных из этого узла.
- `canceled_cost` (`UInt64`) - Сумма затрат (например, размер в байтах) всех запросов, отмененных из этого узла.
- `busy_periods` (`UInt64`) - Общее количество деактиваций этого узла.
- `vruntime` (`Nullable(Float64)`) - Только для дочерних узлов `fair`. Виртуальное время выполнения узла, используемое алгоритмом SFQ для выбора следующего дочернего узла для обработки справедливо.
- `system_vruntime` (`Nullable(Float64)`) - Только для узлов `fair`. Виртуальное время выполнения, показывающее `vruntime` последнего обработанного запроса ресурса. Используется во время активации дочернего узла как новое значение `vruntime`.
- `queue_length` (`Nullable(UInt64)`) - Только для узлов `fifo`. Текущее количество запросов ресурсов, находящихся в очереди.
- `queue_cost` (`Nullable(UInt64)`) - Только для узлов `fifo`. Сумма затрат (например, размер в байтах) всех запросов, находящихся в очереди.
- `budget` (`Nullable(Int64)`) - Только для узлов `fifo`. Количество доступных "единиц затрат" для новых запросов ресурсов. Может появиться в случае несоответствия оценочных и реальных затрат запросов ресурсов (например, после сбоя при чтении/записи).
- `is_satisfied` (`Nullable(UInt8)`) - Только для узлов с ограничениями (например, `inflight_limit`). Равно `1`, если все ограничения этого узла удовлетворены.
- `inflight_requests` (`Nullable(Int64)`) - Только для узлов `inflight_limit`. Количество запросов ресурсов, обезвреженных из этого узла, которые в настоящее время находятся в состоянии потребления.
- `inflight_cost` (`Nullable(Int64)`) - Только для узлов `inflight_limit`. Сумма затрат (например, байты) всех запросов ресурсов, обезвреженных из этого узла, которые в настоящее время находятся в состоянии потребления.
- `max_requests` (`Nullable(Int64)`) - Только для узлов `inflight_limit`. Верхний предел для `inflight_requests`, приводящий к нарушению ограничения.
- `max_cost` (`Nullable(Int64)`) - Только для узлов `inflight_limit`. Верхний предел для `inflight_cost`, приводящий к нарушению ограничения.
- `max_speed` (`Nullable(Float64)`) - Только для узлов `bandwidth_limit`. Верхний предел пропускной способности в токенах в секунду.
- `max_burst` (`Nullable(Float64)`) - Только для узлов `bandwidth_limit`. Верхний предел для `tokens`, доступных в ограничителе трафика (token-bucket throttler).
- `throttling_us` (`Nullable(Int64)`) - Только для узлов `bandwidth_limit`. Общее количество микросекунд, в течение которых этот узел находился в режиме ограничения.
- `tokens` (`Nullable(Float64)`) - Только для узлов `bandwidth_limit`. Количество токенов, которые в настоящее время доступны в ограничителе трафика (token-bucket throttler).
