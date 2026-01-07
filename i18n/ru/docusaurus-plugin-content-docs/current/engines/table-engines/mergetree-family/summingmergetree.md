---
description: 'SummingMergeTree наследуется от движка MergeTree. Его ключевая особенность — возможность автоматически суммировать числовые данные при слиянии частей.'
sidebar_label: 'SummingMergeTree'
sidebar_position: 50
slug: /engines/table-engines/mergetree-family/summingmergetree
title: 'Табличный движок SummingMergeTree'
doc_type: 'reference'
---

# Движок таблиц SummingMergeTree {#summingmergetree-table-engine}

Этот движок наследуется от [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree). Разница в том, что при слиянии частей данных для таблиц `SummingMergeTree` ClickHouse заменяет все строки с одинаковым первичным ключом (или, точнее, с одинаковым [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) одной строкой, которая содержит суммы значений для столбцов с числовым типом данных. Если ключ сортировки построен таким образом, что одному значению ключа соответствует большое количество строк, это существенно уменьшает объем хранимых данных и ускоряет выборку.

Мы рекомендуем использовать этот движок совместно с `MergeTree`. Храните полные данные в таблице `MergeTree`, а `SummingMergeTree` используйте для хранения агрегированных данных, например при подготовке отчетов. Такой подход поможет избежать потери ценных данных из-за некорректно составленного первичного ключа.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = SummingMergeTree([columns])
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

Описание параметров запроса см. в [описании запроса](../../../sql-reference/statements/create/table.md).


### Параметры SummingMergeTree {#parameters-of-summingmergetree}

#### Столбцы {#columns}

`columns` — кортеж с именами столбцов, значения в которых будут суммироваться. Необязательный параметр.
Столбцы должны иметь числовой тип и не должны входить в ключ партиционирования или сортировки.

Если `columns` не указан, ClickHouse суммирует значения во всех столбцах с числовым типом данных, которые не входят в ключ сортировки.

### Части запроса {#query-clauses}

При создании таблицы `SummingMergeTree` требуются те же [части запроса](../../../engines/table-engines/mergetree-family/mergetree.md), что и при создании таблицы `MergeTree`.

<details markdown="1">

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах и, по возможности, переведите старые проекты на метод, описанный выше.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

Все параметры, кроме `columns`, имеют то же значение, что и в `MergeTree`.

- `columns` — кортеж с именами столбцов, значения в которых будут суммироваться. Необязательный параметр. Для описания см. текст выше.

</details>

## Пример использования {#usage-example}

Рассмотрим следующую таблицу:

```sql
CREATE TABLE summtt
(
    key UInt32,
    value UInt32
)
ENGINE = SummingMergeTree()
ORDER BY key
```

Запишите в неё данные:

```sql
INSERT INTO summtt VALUES(1,1),(1,2),(2,1)
```

ClickHouse может суммировать строки не полностью ([см. ниже](#data-processing)), поэтому в запросе мы используем агрегатную функцию `sum` и предложение `GROUP BY`.

```sql
SELECT key, sum(value) FROM summtt GROUP BY key
```

```text
┌─key─┬─sum(value)─┐
│   2 │          1 │
│   1 │          3 │
└─────┴────────────┘
```


## Обработка данных {#data-processing}

Когда данные вставляются в таблицу, они сохраняются как есть. ClickHouse периодически сливает вставленные части данных, и именно в этот момент строки с одинаковым первичным ключом суммируются и заменяются одной строкой для каждой получившейся части данных.

ClickHouse может сливать части данных таким образом, что разные получившиеся части данных могут содержать строки с одинаковым первичным ключом, т. е. суммирование будет неполным. Поэтому при выполнении запроса (`SELECT`) следует использовать агрегатную функцию [sum()](/sql-reference/aggregate-functions/reference/sum) и предложение `GROUP BY`, как описано в примере выше.

### Общие правила суммирования {#common-rules-for-summation}

Значения в столбцах с числовым типом данных суммируются. Набор столбцов определяется параметром `columns`.

Если значения были равны 0 во всех столбцах для суммирования, строка удаляется.

Если столбец не входит в первичный ключ и не суммируется, из существующих значений выбирается произвольное.

Значения не суммируются для столбцов, входящих в первичный ключ.

### Суммирование в столбцах AggregateFunction {#the-summation-in-the-aggregatefunction-columns}

Для столбцов типа [AggregateFunction](../../../sql-reference/data-types/aggregatefunction.md) ClickHouse ведёт себя как движок [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md), агрегируя в соответствии с функцией.

### Вложенные структуры {#nested-structures}

Таблица может содержать вложенные структуры данных, которые обрабатываются особым образом.

Если имя вложенной таблицы оканчивается на `Map` и она содержит как минимум два столбца, удовлетворяющих следующим критериям:

* первый столбец — числовой `(*Int*, Date, DateTime)` или строковый `(String, FixedString)`, назовём его `key`,
* остальные столбцы — арифметические `(*Int*, Float32/64)`, назовём их `(values...)`,

то такая вложенная таблица интерпретируется как отображение `key => (values...)`, и при слиянии её строк элементы двух наборов данных объединяются по `key` с суммированием соответствующих `(values...)`.

Примеры:

```text
DROP TABLE IF EXISTS nested_sum;
CREATE TABLE nested_sum
(
    date Date,
    site UInt32,
    hitsMap Nested(
        browser String,
        imps UInt32,
        clicks UInt32
    )
) ENGINE = SummingMergeTree
PRIMARY KEY (date, site);

INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['Firefox', 'Opera'], [10, 5], [2, 1]);
INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['Chrome', 'Firefox'], [20, 1], [1, 1]);
INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['IE'], [22], [0]);
INSERT INTO nested_sum VALUES ('2020-01-01', 10, ['Chrome'], [4], [3]);

OPTIMIZE TABLE nested_sum FINAL; -- emulate merge 

SELECT * FROM nested_sum;
┌───────date─┬─site─┬─hitsMap.browser───────────────────┬─hitsMap.imps─┬─hitsMap.clicks─┐
│ 2020-01-01 │   10 │ ['Chrome']                        │ [4]          │ [3]            │
│ 2020-01-01 │   12 │ ['Chrome','Firefox','IE','Opera'] │ [20,11,22,5] │ [1,3,0,1]      │
└────────────┴──────┴───────────────────────────────────┴──────────────┴────────────────┘

SELECT
    site,
    browser,
    impressions,
    clicks
FROM
(
    SELECT
        site,
        sumMap(hitsMap.browser, hitsMap.imps, hitsMap.clicks) AS imps_map
    FROM nested_sum
    GROUP BY site
)
ARRAY JOIN
    imps_map.1 AS browser,
    imps_map.2 AS impressions,
    imps_map.3 AS clicks;

┌─site─┬─browser─┬─impressions─┬─clicks─┐
│   12 │ Chrome  │          20 │      1 │
│   12 │ Firefox │          11 │      3 │
│   12 │ IE      │          22 │      0 │
│   12 │ Opera   │           5 │      1 │
│   10 │ Chrome  │           4 │      3 │
└──────┴─────────┴─────────────┴────────┘
```

При запросе данных используйте функцию [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/sumMap.md) для агрегации `Map`.

Для вложенной структуры данных не нужно указывать её столбцы в кортеже столбцов, по которым выполняется суммирование.


## Связанные материалы {#related-content}

- Блог: [Использование агрегатных комбинаторов в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)