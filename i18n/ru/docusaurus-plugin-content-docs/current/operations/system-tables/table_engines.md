---
description: 'Системная таблица, содержащая описания движков таблиц, поддерживаемых сервером, и информацию об их возможностях.'
keywords: ['системная таблица', 'table_engines']
slug: /operations/system-tables/table_engines
title: 'system.table_engine'
---


# system.table_engine

Содержит описание движков таблиц, поддерживаемых сервером, и информацию о поддерживаемых ими возможностях.

Эта таблица содержит следующие колонки (тип колонки показан в скобках):

- `name` (String) — Имя движка таблицы.
- `supports_settings` (UInt8) — Флаг, указывающий, поддерживает ли движок таблицы клаузу `SETTINGS`.
- `supports_skipping_indices` (UInt8) — Флаг, указывающий, поддерживает ли движок таблицы [индексы пропуска](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes).
- `supports_ttl` (UInt8) — Флаг, указывающий, поддерживает ли движок таблицы [TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl).
- `supports_sort_order` (UInt8) — Флаг, указывающий, поддерживает ли движок таблицы клаузу `PARTITION_BY`, `PRIMARY_KEY`, `ORDER_BY` и `SAMPLE_BY`.
- `supports_replication` (UInt8) — Флаг, указывающий, поддерживает ли движок таблицы [репликацию данных](../../engines/table-engines/mergetree-family/replication.md).
- `supports_deduplication` (UInt8) — Флаг, указывающий, поддерживает ли движок таблицы дедупликацию данных.
- `supports_parallel_insert` (UInt8) — Флаг, указывающий, поддерживает ли движок таблицы параллельную вставку (см. настройку [`max_insert_threads`](/operations/settings/settings#max_insert_threads)).

Пример:

```sql
SELECT *
FROM system.table_engines
WHERE name in ('Kafka', 'MergeTree', 'ReplicatedCollapsingMergeTree')
```

```text
┌─name──────────────────────────┬─supports_settings─┬─supports_skipping_indices─┬─supports_sort_order─┬─supports_ttl─┬─supports_replication─┬─supports_deduplication─┬─supports_parallel_insert─┐
│ MergeTree                     │                 1 │                         1 │                   1 │            1 │                    0 │                      0 │                        1 │
│ Kafka                         │                 1 │                         0 │                   0 │            0 │                    0 │                      0 │                        0 │
│ ReplicatedCollapsingMergeTree │                 1 │                         1 │                   1 │            1 │                    1 │                      1 │                        1 │
└───────────────────────────────┴───────────────────┴───────────────────────────┴─────────────────────┴──────────────┴──────────────────────┴────────────────────────┴──────────────────────────┘
```

**Смотрите также**

- Семейство MergeTree [клауз запросов](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-query-clauses)
- [Настройки](../../engines/table-engines/integrations/kafka#creating-a-table) Kafka
- [Настройки](../../engines/table-engines/special/join.md#join-limitations-and-settings) для Join
