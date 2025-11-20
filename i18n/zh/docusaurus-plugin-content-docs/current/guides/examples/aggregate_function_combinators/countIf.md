---
slug: '/examples/aggregate-function-combinators/countIf'
title: 'countIf'
description: '使用 countIf 组合器的示例'
keywords: ['count', 'if', 'combinator', 'examples', 'countIf']
sidebar_label: 'countIf'
doc_type: 'reference'
---



# countIf {#countif}


## Description {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可应用于 [`count`](/sql-reference/aggregate-functions/reference/count) 函数,通过 `countIf` 聚合组合器函数来统计满足条件的行数。


## 使用示例 {#example-usage}

在此示例中,我们将创建一个存储用户登录尝试记录的表,
并使用 `countIf` 统计成功登录的次数。

```sql title="查询"
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

`countIf` 函数将仅统计每个用户 `is_successful = 1` 的行数。

```response title="响应"
   ┌─user_id─┬─successful_logins─┐
1. │       1 │                 2 │
2. │       2 │                 2 │
   └─────────┴───────────────────┘
```


## 另请参阅 {#see-also}

- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
