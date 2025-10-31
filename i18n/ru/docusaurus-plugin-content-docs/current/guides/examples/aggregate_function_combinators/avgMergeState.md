---
slug: '/examples/aggregate-function-combinators/avgMergeState'
sidebar_label: avgMergeState
description: 'Пример использования комбиниатора avgMergeState'
title: avgMergeState
keywords: ['avg', 'MergeState', 'комбинатор', 'примеры', 'avgMergeState']
doc_type: reference
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# avgMergeState {#avgMergeState}

## Описание {#description}

Комбинатор [`MergeState`](/sql-reference/aggregate-functions/combinators#-state) может быть применён к функции [`avg`](/sql-reference/aggregate-functions/reference/avg) для объединения частичных агрегатных состояний типа `AverageFunction(avg, T)` и возврата нового промежуточного состояния агрегации.

## Пример использования {#example-usage}

Комбинатор `MergeState` особенно полезен в сценариях агрегации с несколькими уровнями, где вы хотите объединить предагрегированные состояния и сохранить их как состояния (вместо их финализации) для дальнейшей обработки. Чтобы проиллюстрировать это, рассмотрим пример, в котором мы преобразуем показания производительности отдельных серверов в иерархические агрегации на нескольких уровнях: уровень сервера → уровень региона → уровень дата-центра.

Сначала создадим таблицу для хранения необработанных данных:

```sql
CREATE TABLE raw_server_metrics
(
    timestamp DateTime DEFAULT now(),
    server_id UInt32,
    region String,
    datacenter String,
    response_time_ms UInt32
)
ENGINE = MergeTree()
ORDER BY (region, server_id, timestamp);
```

Создадим целевую таблицу агрегации на уровне сервера и определим инкрементное материализованное представление, которое будет действовать как триггер вставки для неё:

```sql
CREATE TABLE server_performance
(
    server_id UInt32,
    region String,
    datacenter String,
    avg_response_time AggregateFunction(avg, UInt32)
)
ENGINE = AggregatingMergeTree()
ORDER BY (region, server_id);

CREATE MATERIALIZED VIEW server_performance_mv
TO server_performance
AS SELECT
    server_id,
    region,
    datacenter,
    avgState(response_time_ms) AS avg_response_time
FROM raw_server_metrics
GROUP BY server_id, region, datacenter;
```

То же самое мы сделаем для уровня региона и уровня дата-центра:

```sql
CREATE TABLE region_performance
(
    region String,
    datacenter String,
    avg_response_time AggregateFunction(avg, UInt32)
)
ENGINE = AggregatingMergeTree()
ORDER BY (datacenter, region);

CREATE MATERIALIZED VIEW region_performance_mv
TO region_performance
AS SELECT
    region,
    datacenter,
    avgMergeState(avg_response_time) AS avg_response_time
FROM server_performance
GROUP BY region, datacenter;

-- datacenter level table and materialized view

CREATE TABLE datacenter_performance
(
    datacenter String,
    avg_response_time AggregateFunction(avg, UInt32)
)
ENGINE = AggregatingMergeTree()
ORDER BY datacenter;

CREATE MATERIALIZED VIEW datacenter_performance_mv
TO datacenter_performance
AS SELECT
      datacenter,
      avgMergeState(avg_response_time) AS avg_response_time
FROM region_performance
GROUP BY datacenter;
```

Затем вставим образцы необработанных данных в исходную таблицу:

```sql
INSERT INTO raw_server_metrics (timestamp, server_id, region, datacenter, response_time_ms) VALUES
    (now(), 101, 'us-east', 'dc1', 120),
    (now(), 101, 'us-east', 'dc1', 130),
    (now(), 102, 'us-east', 'dc1', 115),
    (now(), 201, 'us-west', 'dc1', 95),
    (now(), 202, 'us-west', 'dc1', 105),
    (now(), 301, 'eu-central', 'dc2', 145),
    (now(), 302, 'eu-central', 'dc2', 155);
```

Напишем три запроса для каждого из уровней:

<Tabs>
  <TabItem value="Уровень сервиса" label="Уровень сервиса" default>
```sql
SELECT
    server_id,
    region,
    avgMerge(avg_response_time) AS avg_response_ms
FROM server_performance
GROUP BY server_id, region
ORDER BY region, server_id;
```
```response
┌─server_id─┬─region─────┬─avg_response_ms─┐
│       301 │ eu-central │             145 │
│       302 │ eu-central │             155 │
│       101 │ us-east    │             125 │
│       102 │ us-east    │             115 │
│       201 │ us-west    │              95 │
│       202 │ us-west    │             105 │
└───────────┴────────────┴─────────────────┘
```
  </TabItem>
  <TabItem value="Региональный уровень" label="Региональный уровень">
```sql
SELECT
    region,
    datacenter,
    avgMerge(avg_response_time) AS avg_response_ms
FROM region_performance
GROUP BY region, datacenter
ORDER BY datacenter, region;
```
```response
┌─region─────┬─datacenter─┬────avg_response_ms─┐
│ us-east    │ dc1        │ 121.66666666666667 │
│ us-west    │ dc1        │                100 │
│ eu-central │ dc2        │                150 │
└────────────┴────────────┴────────────────────┘
```
  </TabItem>
  <TabItem value="Уровень дата-центра" label="Уровень дата-центра">
```sql
SELECT
    datacenter,
    avgMerge(avg_response_time) AS avg_response_ms
FROM datacenter_performance
GROUP BY datacenter
ORDER BY datacenter;
```
```response
┌─datacenter─┬─avg_response_ms─┐
│ dc1        │             113 │
│ dc2        │             150 │
└────────────┴─────────────────┘
```
  </TabItem>
</Tabs>

Мы можем вставить больше данных:

```sql
INSERT INTO raw_server_metrics (timestamp, server_id, region, datacenter, response_time_ms) VALUES
    (now(), 101, 'us-east', 'dc1', 140),
    (now(), 201, 'us-west', 'dc1', 85),
    (now(), 301, 'eu-central', 'dc2', 135);
```

Давайте проверим производительность на уровне дата-центра снова. Обратите внимание, как вся цепочка агрегации обновилась автоматически:

```sql
SELECT
    datacenter,
    avgMerge(avg_response_time) AS avg_response_ms
FROM datacenter_performance
GROUP BY datacenter
ORDER BY datacenter;
```

```response
┌─datacenter─┬────avg_response_ms─┐
│ dc1        │ 112.85714285714286 │
│ dc2        │                145 │
└────────────┴────────────────────┘
```

## См. также {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)