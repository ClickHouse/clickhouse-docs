---
slug: /sql-reference/table-functions/values
sidebar_position: 210
sidebar_label: values
title: 'values'
description: 'создает временное хранилище, которое заполняет колонки значениями.'
keywords: ['values', 'table function']
---


# Функция таблицы Values {#values-table-function}

Функция таблицы `Values` позволяет вам создать временное хранилище, которое заполняет 
колонки значениями. Это полезно для быстрого тестирования или генерации образцов данных.

:::note
Values — функция не чувствительна к регистру. То есть, `VALUES` или `values` — оба варианта действительны.
:::

## Синтаксис {#syntax}

Основной синтаксис функции таблицы `VALUES` следующий:

```sql
VALUES([структура,] значения...)
```

Чаще всего она используется так:

```sql
VALUES(
    ['имя_колонки1 Тип1, имя_колонки2 Тип2, ...'],
    (значение1_строка1, значение2_строка1, ...),
    (значение1_строка2, значение2_строка2, ...),
    ...
)
```

## Аргументы {#arguments}

- `имя_колонки1 Тип1, ...` (необязательно). [Строка](/sql-reference/data-types/string) 
  указывающая на имена и типы колонок. Если этот аргумент опущен, колонки будут
  названы как `c1`, `c2` и так далее.
- `(значение1_строка1, значение2_строка1)`. [Кортежи](/sql-reference/data-types/tuple) 
  содержащие значения любого типа.

:::note
Запятые разделенные кортежи могут быть заменены на одиночные значения. В этом случае
каждое значение принимается за новую строку. См. раздел [примеры](#examples) для деталей.
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

`VALUES` также можно использовать с одиночными значениями, а не с кортежами. Например:

```sql title="Запрос"
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
в разделе [синтаксис](#syntax)), в этом случае колонки будут автоматически названы.

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

-- одиночные значения
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

## Смотрите также {#see-also}

- [Формат Values](/interfaces/formats/Values)
