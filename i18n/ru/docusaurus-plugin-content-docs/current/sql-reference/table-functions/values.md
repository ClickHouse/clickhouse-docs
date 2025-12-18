---
description: 'создает временное хранилище данных, заполняющее столбцы значениями.'
keywords: ['значения', 'табличная функция']
sidebar_label: 'values'
sidebar_position: 210
slug: /sql-reference/table-functions/values
title: 'values'
doc_type: 'reference'
---

# Табличная функция Values {#values-table-function}

Табличная функция `Values` позволяет создать временное хранилище и заполнить 
столбцы значениями. Она полезна для быстрого тестирования или генерации образцов данных.

:::note
Values — регистронезависимая функция. То есть `VALUES` и `values` одинаково допустимы.
:::

## Синтаксис {#syntax}

Базовый синтаксис табличной функции `VALUES` выглядит следующим образом:

```sql
VALUES([structure,] values...)
```

Чаще всего используется как:

```sql
VALUES(
    ['column1_name Type1, column2_name Type2, ...'],
    (value1_row1, value2_row1, ...),
    (value1_row2, value2_row2, ...),
    ...
)
```

## Аргументы {#arguments}

- `column1_name Type1, ...` (необязательный аргумент). [String](/sql-reference/data-types/string),
  задающая имена и типы столбцов. Если этот аргумент опущен, столбцы будут
  названы `c1`, `c2` и т. д.
- `(value1_row1, value2_row1)`. [Tuples](/sql-reference/data-types/tuple),
   содержащие значения любого типа.

:::note
Кортежи, разделённые запятыми, можно также заменить одиночными значениями. В этом случае
каждое значение воспринимается как новая строка. См. раздел [Примеры](#examples)
для подробностей.
:::

## Возвращаемое значение {#returned-value}

- Возвращает временную таблицу, содержащую указанные значения.

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

`VALUES` также может использоваться с отдельными значениями, а не с кортежами. Например:

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

Или без указания спецификации столбцов (`'column1_name Type1, column2_name Type2, ...'`
в [синтаксисе](#syntax)), в этом случае столбцам автоматически присваиваются имена.

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
