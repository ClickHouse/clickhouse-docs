---
description: 'SummingMergeTree наследуется от движка MergeTree. Его ключевая особенность — возможность автоматически суммировать числовые данные при слиянии частей.'
sidebar_label: 'SummingMergeTree'
sidebar_position: 50
slug: /engines/table-engines/mergetree-family/summingmergetree
title: 'Табличный движок SummingMergeTree'
doc_type: 'reference'
---



# Движок таблиц SummingMergeTree

Движок наследуется от [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree). Разница заключается в том, что при слиянии частей данных для таблиц `SummingMergeTree` ClickHouse заменяет все строки с одинаковым первичным ключом (или, точнее, с одинаковым [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) одной строкой, которая содержит суммы значений в столбцах с числовыми типами данных. Если ключ сортировки составлен так, что одному значению ключа соответствует большое количество строк, это значительно сокращает объём хранимых данных и ускоряет выборку.

Мы рекомендуем использовать этот движок совместно с `MergeTree`. Храните полные данные в таблице `MergeTree`, а `SummingMergeTree` используйте для хранения агрегированных данных, например, при подготовке отчётности. Такой подход позволит избежать потери ценных данных из-за неправильно составленного первичного ключа.



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

Описание параметров запроса см. в разделе [описание запроса](../../../sql-reference/statements/create/table.md).

### Параметры SummingMergeTree {#parameters-of-summingmergetree}

#### Столбцы {#columns}

`columns` — кортеж с именами столбцов, значения в которых будут суммироваться. Необязательный параметр.
Столбцы должны иметь числовой тип и не должны входить в ключ партиционирования или ключ сортировки.

Если параметр `columns` не указан, ClickHouse суммирует значения во всех столбцах с числовым типом данных, которые не входят в ключ сортировки.

### Секции запроса {#query-clauses}

При создании таблицы `SummingMergeTree` требуются те же [секции](../../../engines/table-engines/mergetree-family/mergetree.md), что и при создании таблицы `MergeTree`.

<details markdown="1">

<summary>Устаревший способ создания таблицы</summary>

:::note
Не используйте этот способ в новых проектах и, по возможности, переведите старые проекты на способ, описанный выше.
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

- `columns` — кортеж с именами столбцов, значения в которых будут суммироваться. Необязательный параметр. Описание см. в тексте выше.

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

Вставим в неё данные:

```sql
INSERT INTO summtt VALUES(1,1),(1,2),(2,1)
```

ClickHouse может суммировать все строки не полностью ([см. ниже](#data-processing)), поэтому в запросе мы используем агрегатную функцию `sum` и конструкцию `GROUP BY`.

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

При вставке данных в таблицу они сохраняются как есть. ClickHouse периодически объединяет вставленные части данных, и именно в этот момент строки с одинаковым первичным ключом суммируются и заменяются одной строкой для каждой результирующей части данных.

ClickHouse может объединять части данных таким образом, что различные результирующие части данных могут содержать строки с одинаковым первичным ключом, то есть суммирование будет неполным. Поэтому в запросе (`SELECT`) следует использовать агрегатную функцию [sum()](/sql-reference/aggregate-functions/reference/sum) и предложение `GROUP BY`, как описано в примере выше.

### Общие правила суммирования {#common-rules-for-summation}

Суммируются значения в столбцах с числовым типом данных. Набор столбцов определяется параметром `columns`.

Если значения во всех столбцах для суммирования равны 0, строка удаляется.

Если столбец не входит в первичный ключ и не суммируется, выбирается произвольное значение из существующих.

Значения в столбцах первичного ключа не суммируются.

### Суммирование в столбцах AggregateFunction {#the-summation-in-the-aggregatefunction-columns}

Для столбцов типа [AggregateFunction](../../../sql-reference/data-types/aggregatefunction.md) ClickHouse ведет себя как движок [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md), выполняя агрегацию в соответствии с функцией.

### Вложенные структуры {#nested-structures}

Таблица может содержать вложенные структуры данных, которые обрабатываются особым образом.

Если имя вложенной таблицы заканчивается на `Map` и она содержит как минимум два столбца, удовлетворяющих следующим критериям:

- первый столбец является числовым `(*Int*, Date, DateTime)` или строковым `(String, FixedString)`, назовем его `key`,
- остальные столбцы являются арифметическими `(*Int*, Float32/64)`, назовем их `(values...)`,

то эта вложенная таблица интерпретируется как отображение `key => (values...)`, и при объединении её строк элементы двух наборов данных объединяются по `key` с суммированием соответствующих `(values...)`.

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

OPTIMIZE TABLE nested_sum FINAL; -- эмуляция слияния

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


При запросе данных используйте функцию [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md) для агрегации данных типа `Map`.

Для вложенной структуры данных не нужно указывать её столбцы в кортеже столбцов для суммирования.



## Связанный контент {#related-content}

- Блог: [Использование комбинаторов агрегатных функций в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
