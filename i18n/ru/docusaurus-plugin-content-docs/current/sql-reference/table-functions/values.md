---
description: 'Создает временное хранилище, заполняющее столбцы значениями.'
keywords: ['values', 'табличная функция']
sidebar_label: 'values'
sidebar_position: 210
slug: /sql-reference/table-functions/values
title: 'values'
doc_type: 'reference'
---



# Табличная функция Values {#values-table-function}

Табличная функция `Values` позволяет создать временное хранилище, которое заполняет
столбцы значениями. Она полезна для быстрого тестирования или генерации тестовых данных.

:::note
Values — это функция, нечувствительная к регистру. То есть `VALUES` и `values` являются допустимыми вариантами.
:::


## Синтаксис {#syntax}

Базовый синтаксис табличной функции `VALUES`:

```sql
VALUES([structure,] values...)
```

Типичное использование:

```sql
VALUES(
    ['column1_name Type1, column2_name Type2, ...'],
    (value1_row1, value2_row1, ...),
    (value1_row2, value2_row2, ...),
    ...
)
```


## Аргументы {#arguments}

- `column1_name Type1, ...` (необязательный). [String](/sql-reference/data-types/string),
  указывающий имена и типы столбцов. Если этот аргумент не указан, столбцы будут
  именоваться как `c1`, `c2` и т. д.
- `(value1_row1, value2_row1)`. [Tuples](/sql-reference/data-types/tuple),
  содержащие значения любого типа.

:::note
Кортежи, разделённые запятыми, также могут быть заменены отдельными значениями. В этом случае
каждое значение интерпретируется как новая строка. Подробности см. в разделе [примеры](#examples).
:::


## Возвращаемое значение {#returned-value}

- Возвращает временную таблицу, содержащую указанные значения.


## Примеры {#examples}

```sql title="Запрос"
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

```response title="Ответ"
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

`VALUES` также можно использовать с одиночными значениями вместо кортежей. Например:

```sql title="Запрос"
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

```response title="Ответ"
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

Или без указания спецификации строк (`'column1_name Type1, column2_name Type2, ...'`
в [синтаксисе](#syntax)), в этом случае столбцы именуются автоматически.

Например:

```sql title="Запрос"
-- кортежи в качестве значений
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

```response title="Ответ"
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
-- одиночные значения
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

```response title="Ответ"
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
