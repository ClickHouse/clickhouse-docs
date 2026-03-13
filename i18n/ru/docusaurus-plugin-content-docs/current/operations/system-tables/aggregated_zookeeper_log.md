---
description: 'Системная таблица, содержащая агрегированную статистику по операциям ZooKeeper,
  сгруппированную по сессии, пути, типу операции, компоненту и флагу подзапроса.'
keywords: ['системная таблица', 'aggregated_zookeeper_log']
slug: /operations/system-tables/aggregated_zookeeper_log
title: 'system.aggregated_zookeeper_log'
doc_type: 'reference'
---

# system.aggregated_zookeeper_log \{#systemaggregated_zookeeper_log\}

Эта таблица содержит агрегированную статистику операций ZooKeeper (например, количество операций, среднюю задержку, ошибки), сгруппированную по `(session_id, parent_path, operation, component, is_subrequest)` и периодически записываемую на диск.

В отличие от [system.zookeeper&#95;log](zookeeper_log.md), которая журналирует каждый отдельный запрос и ответ, эта таблица агрегирует операции в группы, что делает её значительно более лёгковесной и, следовательно, более подходящей для нагрузок в промышленной эксплуатации.

Операции, входящие в пакет `Multi` или `MultiRead`, отслеживаются отдельно с помощью столбца `is_subrequest`. Подзапросы имеют нулевую задержку, поскольку суммарная задержка относится к внешней операции `Multi`/`MultiRead`.

Столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата записи группы на диск.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время записи группы на диск.
* `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — Идентификатор сессии.
* `parent_path` ([String](../../sql-reference/data-types/string.md)) — Префикс пути.
* `operation` ([Enum](../../sql-reference/data-types/enum.md)) — Тип операции ZooKeeper.
* `is_subrequest` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Указывает, была ли эта операция подзапросом внутри операции `Multi` или `MultiRead`.
* `count` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Количество операций в группе.
* `errors` ([Map(Enum, UInt32)](../../sql-reference/data-types/map.md)) — Ошибки в группе: сопоставление кода ошибки с количеством.
* `average_latency` ([Float64](../../sql-reference/data-types/float.md)) — Средняя задержка по всем операциям в группе, в микросекундах. Подзапросы имеют нулевую задержку, поскольку задержка относится к внешней операции `Multi` или `MultiRead`.
* `component` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Компонент, вызвавший событие.

**См. также**

* [system.zookeeper&#95;log](zookeeper_log.md) — Подробный журнал ZooKeeper для каждого запроса.
* [ZooKeeper](../../operations/tips.md#zookeeper)