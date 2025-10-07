---
slug: '/sql-reference/table-functions/mergeTreeProjection'
sidebar_label: mergeTreeProjection
sidebar_position: 77
description: 'Представляет содержание некоторой проекции в таблицах MergeTree. Она'
title: mergeTreeProjection
doc_type: reference
---
# mergeTreeProjection Табличная Функция

Представляет содержимое некоторой проекции в таблицах MergeTree. Она может быть использована для инспекции.

## Синтаксис {#syntax}

```sql
mergeTreeProjection(database, table, projection)
```

## Аргументы {#arguments}

| Аргумент     | Описание                                    |
|--------------|---------------------------------------------|
| `database`   | Имя базы данных, из которой нужно читать проекцию. |
| `table`      | Имя таблицы, из которой нужно читать проекцию.    |
| `projection` | Проекция, из которой нужно читать.         |

## Возвращаемое значение {#returned_value}

Объект таблицы с колонками, предоставляемыми данной проекцией.

## Пример использования {#usage-example}

```sql
CREATE TABLE test
(
    `user_id` UInt64,
    `item_id` UInt64,
    PROJECTION order_by_item_id
    (
        SELECT _part_offset
        ORDER BY item_id
    )
)
ENGINE = MergeTree
ORDER BY user_id;

INSERT INTO test SELECT number, 100 - number FROM numbers(5);
```

```sql
SELECT *, _part_offset FROM mergeTreeProjection(currentDatabase(), test, order_by_item_id);
```

```text
   ┌─item_id─┬─_parent_part_offset─┬─_part_offset─┐
1. │      96 │                   4 │            0 │
2. │      97 │                   3 │            1 │
3. │      98 │                   2 │            2 │
4. │      99 │                   1 │            3 │
5. │     100 │                   0 │            4 │
   └─────────┴─────────────────────┴──────────────┘
```

```sql
DESCRIBE mergeTreeProjection(currentDatabase(), test, order_by_item_id) SETTINGS describe_compact_output = 1;
```

```text
   ┌─name────────────────┬─type───┐
1. │ item_id             │ UInt64 │
2. │ _parent_part_offset │ UInt64 │
   └─────────────────────┴────────┘
```