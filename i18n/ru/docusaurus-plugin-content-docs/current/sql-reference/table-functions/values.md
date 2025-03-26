---
description: 'создает временное хранилище, которое заполняет столбцы значениями.'
keywords: ['значения', 'табличная функция']
sidebar_label: 'значения'
sidebar_position: 210
slug: /sql-reference/table-functions/values
title: 'значения'
---


# Табличная функция значений {#values-table-function}

Табличная функция `Values` позволяет вам создать временное хранилище, которое заполняет 
столбцы значениями. Это полезно для быстрой отладки или генерации тестовых данных.

:::note
Функция значений не чувствительна к регистру. То есть `VALUES` и `values` оба действительны.
:::

## Синтаксис {#syntax}

Базовый синтаксис табличной функции `VALUES`:

```sql
VALUES([структура,] значения...)
```

Чаще всего используется так:

```sql
VALUES(
    ['имя_столбца Тип1, имя_столбца Тип2, ...'],
    (значение1_строка1, значение2_строка1, ...),
    (значение1_строка2, значение2_строка2, ...),
    ...
)
```

## Аргументы {#arguments}

- `имя_столбца Тип1, ...` (опционально). [Строка](/sql-reference/data-types/string) 
  указывающая имена и типы столбцов. Если этот аргумент опущен, столбцы будут
  названы как `c1`, `c2` и т. д.
- `(значение1_строка1, значение2_строка1)`. [Кортежи](/sql-reference/data-types/tuple) 
   содержащие значения любого типа.

:::note
Кортежи, разделенные запятыми, также можно заменить одиночными значениями. В этом случае
каждое значение принимается за новую строку. См. раздел [примеры](#examples) для подробностей.
:::

## Возвращаемое значение {#returned-value}

- Возвращает временную таблицу, содержащую предоставленные значения.

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

`VALUES` также можно использовать с одиночными значениями, а не кортежами. Например:

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

Или без указания спецификации строки (`'имя_столбца Тип1, имя_столбца Тип2, ...'`
в [синтаксисе](#syntax)), в этом случае столбцы получат автоматические названия.

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

- [Формат значений](/interfaces/formats/Values)
