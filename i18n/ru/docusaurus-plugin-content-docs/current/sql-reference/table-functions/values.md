---
slug: '/sql-reference/table-functions/values'
sidebar_label: values
sidebar_position: 210
description: 'создает временное хранилище, которое заполняет колонки значениями.'
title: values
keywords: ['values', 'табличная функция']
doc_type: reference
---
# Функция Таблицы Values {#values-table-function}

Функция `Values` позволяет создать временное хранилище, которое заполняет 
колонки значениями. Это полезно для быстрого тестирования или генерации тестовых данных.

:::note
Values — функция, не чувствительная к регистру. То есть `VALUES` и `values` оба являются корректными.
:::

## Синтаксис {#syntax}

Основной синтаксис функции `VALUES`:

```sql
VALUES([structure,] values...)
```

Чаще всего используется в виде:

```sql
VALUES(
    ['column1_name Type1, column2_name Type2, ...'],
    (value1_row1, value2_row1, ...),
    (value1_row2, value2_row2, ...),
    ...
)
```

## Аргументы {#arguments}

- `column1_name Type1, ...` (необязательно). [String](/sql-reference/data-types/string) 
  указывающий имена и типы колонок. Если этот аргумент опущен, колонки будут
  называться как `c1`, `c2` и так далее.
- `(value1_row1, value2_row1)`. [Tuples](/sql-reference/data-types/tuple) 
   содержащие значения любого типа.

:::note
Кортежи, разделенные запятыми, могут быть заменены одиночными значениями. В этом случае
каждое значение рассматривается как новая строка. См. раздел [примеры](#examples) для подробностей.
:::

## Возвращаемое значение {#returned-value}

- Возвращает временную таблицу, содержащую предоставленные значения.

## Примеры {#examples}

```sql title="Query"
SELECT *
FROM VALUES(
    'person String, place String',
    ('Noah', 'Paris'),
    ('Emma', 'Tokyo'),
    ('Liam', 'Sydney'),
    ('Olivia', 'Berlin'),
    ('Ilya', 'London'),
    ('Sophia', 'London'),
    ('Jackson', 'Madrid'),
    ('Alexey', 'Amsterdam'),
    ('Mason', 'Venice'),
    ('Isabella', 'Prague')
)
```

```response title="Response"
    ┌─person───┬─place─────┐
 1. │ Noah     │ Paris     │
 2. │ Emma     │ Tokyo     │
 3. │ Liam     │ Sydney    │
 4. │ Olivia   │ Berlin    │
 5. │ Ilya     │ London    │
 6. │ Sophia   │ London    │
 7. │ Jackson  │ Madrid    │
 8. │ Alexey   │ Amsterdam │
 9. │ Mason    │ Venice    │
10. │ Isabella │ Prague    │
    └──────────┴───────────┘
```

`VALUES` также может быть использован с одиночными значениями, а не кортежами. Например:

```sql title="Query"
SELECT *
FROM VALUES(
    'person String',
    'Noah',
    'Emma',
    'Liam',
    'Olivia',
    'Ilya',
    'Sophia',
    'Jackson',
    'Alexey',
    'Mason',
    'Isabella'
)
```

```response title="Response"
    ┌─person───┐
 1. │ Noah     │
 2. │ Emma     │
 3. │ Liam     │
 4. │ Olivia   │
 5. │ Ilya     │
 6. │ Sophia   │
 7. │ Jackson  │
 8. │ Alexey   │
 9. │ Mason    │
10. │ Isabella │
    └──────────┘
```

Или без предоставления спецификации строки (`'column1_name Type1, column2_name Type2, ...'`
в [синтаксисе](#syntax)), в этом случае колонки автоматически получают имена. 

Например:

```sql title="Query"
-- tuples as values
SELECT *
FROM VALUES(
    ('Noah', 'Paris'),
    ('Emma', 'Tokyo'),
    ('Liam', 'Sydney'),
    ('Olivia', 'Berlin'),
    ('Ilya', 'London'),
    ('Sophia', 'London'),
    ('Jackson', 'Madrid'),
    ('Alexey', 'Amsterdam'),
    ('Mason', 'Venice'),
    ('Isabella', 'Prague')
)
```

```response title="Response"
    ┌─c1───────┬─c2────────┐
 1. │ Noah     │ Paris     │
 2. │ Emma     │ Tokyo     │
 3. │ Liam     │ Sydney    │
 4. │ Olivia   │ Berlin    │
 5. │ Ilya     │ London    │
 6. │ Sophia   │ London    │
 7. │ Jackson  │ Madrid    │
 8. │ Alexey   │ Amsterdam │
 9. │ Mason    │ Venice    │
10. │ Isabella │ Prague    │
    └──────────┴───────────┘
```

```sql
-- single values
SELECT *
FROM VALUES(
    'Noah',
    'Emma',
    'Liam',
    'Olivia',
    'Ilya',
    'Sophia',
    'Jackson',
    'Alexey',
    'Mason',
    'Isabella'
)
```

```response title="Response"
    ┌─c1───────┐
 1. │ Noah     │
 2. │ Emma     │
 3. │ Liam     │
 4. │ Olivia   │
 5. │ Ilya     │
 6. │ Sophia   │
 7. │ Jackson  │
 8. │ Alexey   │
 9. │ Mason    │
10. │ Isabella │
    └──────────┘
```

## См. также {#see-also}

- [Формат Values](/interfaces/formats/Values)