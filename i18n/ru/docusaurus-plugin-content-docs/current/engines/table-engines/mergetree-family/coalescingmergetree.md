---
'description': 'CoalescingMergeTree наследуется от движка MergeTree. Его ключевая
  особенность заключается в способности автоматически хранить последнее ненулевое
  значение каждой колонки во время слияния частей.'
'sidebar_label': 'CoalescingMergeTree'
'sidebar_position': 50
'slug': '/engines/table-engines/mergetree-family/coalescingmergetree'
'title': 'CoalescingMergeTree'
'keywords':
- 'CoalescingMergeTree'
'show_related_blogs': true
'doc_type': 'reference'
---
# CoalescingMergeTree

:::note Доступно с версии 25.6
Этот движок таблиц доступен с версии 25.6 и выше как в OSS, так и в Cloud.
:::

Этот движок наследуется от [MergeTree](/engines/table-engines/mergetree-family/mergetree). Ключевое отличие заключается в том, как сливаются части данных: для таблиц `CoalescingMergeTree` ClickHouse заменяет все строки с одинаковым первичным ключом (или, скорее, с одинаковым [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) на одну строку, содержащую последние ненулевые значения для каждого столбца.

Это позволяет выполнять обновления на уровне столбцов, что означает, что вы можете обновлять только определенные столбцы, а не целые строки.

`CoalescingMergeTree` предназначен для использования с Nullable типами в неключевых столбцах. Если столбцы не являются Nullable, поведение будет таким же, как у [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree).

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

Для описания параметров запроса см. [описание запроса](../../../sql-reference/statements/create/table.md).

### Параметры CoalescingMergeTree {#parameters-of-coalescingmergetree}

#### Столбцы {#columns}

`columns` - кортеж с именами столбцов, значения которых будут объединены. Необязательный параметр.
    Столбцы должны быть числового типа и не должны входить в ключ партиционирования или сортировки.

Если `columns` не указан, ClickHouse объединяет значения во всех столбцах, которые не находятся в ключе сортировки.

### Операторные части запроса {#query-clauses}

При создании таблицы `CoalescingMergeTree` требуются те же [операторные части](../../../engines/table-engines/mergetree-family/mergetree.md), что и при создании таблицы `MergeTree`.

<details markdown="1">

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах и, если возможно, переключите старые проекты на описанный выше метод.
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

- `columns` — кортеж с именами столбцов, значения которых будут суммироваться. Необязательный параметр. Для описания см. текст выше.

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

Вставим в нее данные:

```sql
INSERT INTO test_table VALUES(1, NULL, NULL, '2025-01-01'), (2, 10, 'test', NULL);
INSERT INTO test_table VALUES(1, 42, 'win', '2025-02-01');
INSERT INTO test_table(key, value_date) VALUES(2, '2025-02-01');
```

Результат будет выглядеть так:

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

Рекомендуемый запрос для получения правильного и окончательного результата:

```sql
SELECT * FROM test_table FINAL ORDER BY key;
```

```text
┌─key─┬─value_int─┬─value_string─┬─value_date─┐
│   1 │        42 │ win          │ 2025-02-01 │
│   2 │        10 │ test         │ 2025-02-01 │
└─────┴───────────┴──────────────┴────────────┘
```

Использование модификатора `FINAL` заставляет ClickHouse применять логику слияния во время выполнения запроса, гарантируя, что вы получите правильное, объединенное "последнее" значение для каждого столбца. Это самый безопасный и точный метод при запросах из таблицы CoalescingMergeTree.

:::note

Подход с `GROUP BY` может возвращать некорректные результаты, если основные части еще не были полностью объединены.

```sql
SELECT key, last_value(value_int), last_value(value_string), last_value(value_date)  FROM test_table GROUP BY key; -- Not recommended.
```

:::