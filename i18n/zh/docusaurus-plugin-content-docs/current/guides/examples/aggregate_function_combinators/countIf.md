---
slug: '/examples/aggregate-function-combinators/countIf'
title: 'countIf'
description: 'countIf 聚合函数组合器的使用示例'
keywords: ['count', 'if', '组合器', '示例', 'countIf']
sidebar_label: 'countIf'
doc_type: 'reference'
---

# countIf \\{#countif\\}

## 描述 \\{#description\\}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`count`](/sql-reference/aggregate-functions/reference/count)
函数，从而通过 `countIf` 聚合函数组合器统计条件为 `true`
的行数。

## 用法示例 \\{#example-usage\\}

在这个示例中，我们将创建一个用于存储用户登录尝试记录的表，
并使用 `countIf` 来统计成功登录的次数。

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

`countIf` 函数只会统计每个用户中满足 `is_successful = 1` 的行数。

```response title="Response"
   ┌─user_id─┬─successful_logins─┐
1. │       1 │                 2 │
2. │       2 │                 2 │
   └─────────┴───────────────────┘
```

## 另请参阅 \\{#see-also\\}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`If 组合器`](/sql-reference/aggregate-functions/combinators#-if)
