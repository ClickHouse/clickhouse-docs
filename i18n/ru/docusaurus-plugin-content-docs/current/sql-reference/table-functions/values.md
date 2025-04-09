---
description: 'создает временное хранилище, которое заполняет колонки значениями.'
keywords: ['values', 'табличная функция']
sidebar_label: 'values'
sidebar_position: 210
slug: /sql-reference/table-functions/values
title: 'values'
---


# Табличная функция Values {#values-table-function}

Табличная функция `Values` позволяет создавать временное хранилище, которое заполняет 
колонки значениями. Она полезна для быстрого тестирования или генерации выборочных данных.

:::note
Values — регистронезависимая функция. То есть, `VALUES` и `values` оба допустимы.
:::

## Синтаксис {#syntax}

Основной синтаксис табличной функции `VALUES`:

```sql
VALUES([структура,] значения...)
```

Часто используется так:

```sql
VALUES(
    ['имя_колонки1 Тип1, имя_колонки2 Тип2, ...'],
    (значение1_строка1, значение2_строка1, ...),
    (значение1_строка2, значение2_строка2, ...),
    ...
)
```

## Аргументы {#arguments}

- `имя_колонки1 Тип1, ...` (необязательный). [Строка](/sql-reference/data-types/string) 
  указывающая имена и типы колонок. Если этот аргумент опустить, колонки будут
  названы как `c1`, `c2` и так далее.
- `(значение1_строка1, значение2_строка1)`. [Кортежи](/sql-reference/data-types/tuple) 
   содержащие значения любого типа.

:::note
Разделенные запятыми кортежи могут быть также заменены на одиночные значения. В этом случае
каждое значение принимается за новую строку. Смотрите раздел [примеры](#examples) для
подробностей.
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

`VALUES` также может использоваться с одиночными значениями вместо кортежей. Например:

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

Или без указания спецификации строки (`'имя_колонки1 Тип1, имя_колонки2 Тип2, ...'`
в [синтаксисе](#syntax)), в этом случае колонки получают автоматические названия.

Например:

```sql title="Запрос"
-- кортежи как значения
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
