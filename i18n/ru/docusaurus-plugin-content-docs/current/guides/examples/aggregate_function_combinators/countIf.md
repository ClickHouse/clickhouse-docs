---
slug: '/examples/aggregate-function-combinators/countIf'
title: 'countIf'
description: 'Пример использования комбинированной функции countIf'
keywords: ['count', 'if', 'combinator', 'examples', 'countIf']
sidebar_label: 'countIf'
---


# countIf {#countif}

## Описание {#description}

Комбинированная функция [`If`](/sql-reference/aggregate-functions/combinators#-if) может быть применена к функции [`count`](/sql-reference/aggregate-functions/reference/count) для подсчета количества строк, где условие истинно, с использованием агрегатной комбинированной функции `countIf`.

## Пример использования {#example-usage}

В этом примере мы создадим таблицу, которая хранит попытки входа пользователей, и мы используем `countIf` для подсчета количества успешных входов.

```sql title="Запрос"
CREATE TABLE login_attempts(
    user_id UInt32,
    timestamp DateTime,
    is_successful UInt8
) ENGINE = Log;

INSERT INTO login_attempts VALUES
    (1, '2024-01-01 10:00:00', 1),
    (1, '2024-01-01 10:05:00', 0),
    (1, '2024-01-01 10:10:00', 1),
    (2, '2024-01-01 11:00:00', 1),
    (2, '2024-01-01 11:05:00', 1),
    (2, '2024-01-01 11:10:00', 0);

SELECT
    user_id,
    countIf(is_successful = 1) as successful_logins
FROM login_attempts
GROUP BY user_id;
```

Функция `countIf` будет подсчитывать только строки, где `is_successful = 1` для каждого пользователя.

```response title="Ответ"
   ┌─user_id─┬─successful_logins─┐
1. │       1 │                 2 │
2. │       2 │                 2 │
   └─────────┴───────────────────┘
```

## См. также {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
