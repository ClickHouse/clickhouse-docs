---
slug: '/examples/aggregate-function-combinators/countIf'
title: 'countIf'
description: 'Пример использования комбинатора countIf'
keywords: ['count', 'if', 'combinator', 'examples', 'countIf']
sidebar_label: 'countIf'
doc_type: 'reference'
---

# countIf \{#countif\}

## Описание \{#description\}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может быть применён к функции [`count`](/sql-reference/aggregate-functions/reference/count)
для подсчёта числа строк, удовлетворяющих условию,
с помощью агрегатной функции-комбинатора `countIf`.

## Пример использования \{#example-usage\}

В этом примере мы создадим таблицу, которая хранит попытки входа пользователей в систему,
и используем `countIf`, чтобы посчитать количество успешных входов.

```sql title="Query"
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
    countIf(is_successful = 1) AS successful_logins
FROM login_attempts
GROUP BY user_id;
```

Функция `countIf` для каждого пользователя будет подсчитывать только те строки, в которых `is_successful = 1`.

```response title="Response"
   ┌─user_id─┬─successful_logins─┐
1. │       1 │                 2 │
2. │       2 │                 2 │
   └─────────┴───────────────────┘
```

## См. также \{#see-also\}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Комбинатор If`](/sql-reference/aggregate-functions/combinators#-if)
