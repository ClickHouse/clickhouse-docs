---
description: 'CoalescingMergeTree наследуется от движка MergeTree. Его ключевая особенность — возможность автоматически сохранять последнее ненулевое (не NULL) значение каждого столбца при слиянии частей.'
sidebar_label: 'CoalescingMergeTree'
sidebar_position: 50
slug: /engines/table-engines/mergetree-family/coalescingmergetree
title: 'Движок таблицы CoalescingMergeTree'
keywords: ['CoalescingMergeTree']
show_related_blogs: true
doc_type: 'reference'
---



# Движок таблицы CoalescingMergeTree

:::note Available from version 25.6
Этот движок таблицы доступен начиная с версии 25.6 как в OSS, так и в Cloud.
:::

Этот движок наследуется от [MergeTree](/engines/table-engines/mergetree-family/mergetree). Ключевое отличие заключается в том, как объединяются части данных: для таблиц `CoalescingMergeTree` ClickHouse заменяет все строки с одинаковым первичным ключом (или, точнее, с одинаковым [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) одной строкой, которая содержит последние значения, отличные от NULL, для каждого столбца.

Это позволяет выполнять операции upsert на уровне столбцов, то есть можно обновлять только отдельные столбцы, а не целые строки.

`CoalescingMergeTree` предназначен для использования с типами Nullable в неключевых столбцах. Если столбцы не являются Nullable, поведение будет таким же, как у [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree).



## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = CoalescingMergeTree([columns])
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

Описание параметров запроса см. в разделе [описание запроса](../../../sql-reference/statements/create/table.md).

### Параметры CoalescingMergeTree {#parameters-of-coalescingmergetree}

#### Столбцы {#columns}

`columns` — кортеж с именами столбцов, значения которых будут объединены. Необязательный параметр.
Столбцы должны иметь числовой тип и не должны входить в ключ партиционирования или ключ сортировки.

Если `columns` не указан, ClickHouse объединяет значения во всех столбцах, которые не входят в ключ сортировки.

### Секции запроса {#query-clauses}

При создании таблицы `CoalescingMergeTree` требуются те же [секции](../../../engines/table-engines/mergetree-family/mergetree.md), что и при создании таблицы `MergeTree`.

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
) ENGINE [=] CoalescingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

Все параметры, кроме `columns`, имеют то же значение, что и в `MergeTree`.

- `columns` — кортеж с именами столбцов, значения которых будут суммированы. Необязательный параметр. Описание см. в тексте выше.

</details>


## Пример использования {#usage-example}

Рассмотрим следующую таблицу:

```sql
CREATE TABLE test_table
(
    key UInt64,
    value_int Nullable(UInt32),
    value_string Nullable(String),
    value_date Nullable(Date)
)
ENGINE = CoalescingMergeTree()
ORDER BY key
```

Вставим в неё данные:

```sql
INSERT INTO test_table VALUES(1, NULL, NULL, '2025-01-01'), (2, 10, 'test', NULL);
INSERT INTO test_table VALUES(1, 42, 'win', '2025-02-01');
INSERT INTO test_table(key, value_date) VALUES(2, '2025-02-01');
```

Результат будет выглядеть следующим образом:

```sql
SELECT * FROM test_table ORDER BY key;
```

```text
┌─key─┬─value_int─┬─value_string─┬─value_date─┐
│   1 │        42 │ win          │ 2025-02-01 │
│   1 │      ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │ 2025-01-01 │
│   2 │      ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │ 2025-02-01 │
│   2 │        10 │ test         │       ᴺᵁᴸᴸ │
└─────┴───────────┴──────────────┴────────────┘
```

Рекомендуемый запрос для получения корректного итогового результата:

```sql
SELECT * FROM test_table FINAL ORDER BY key;
```

```text
┌─key─┬─value_int─┬─value_string─┬─value_date─┐
│   1 │        42 │ win          │ 2025-02-01 │
│   2 │        10 │ test         │ 2025-02-01 │
└─────┴───────────┴──────────────┴────────────┘
```

Использование модификатора `FINAL` заставляет ClickHouse применять логику слияния во время выполнения запроса, гарантируя получение корректного объединённого «последнего» значения для каждого столбца. Это наиболее безопасный и точный метод при запросах к таблице CoalescingMergeTree.

:::note

Подход с использованием `GROUP BY` может вернуть некорректные результаты, если базовые части данных не были полностью слиты.

```sql
SELECT key, last_value(value_int), last_value(value_string), last_value(value_date)  FROM test_table GROUP BY key; -- Не рекомендуется.
```

:::
