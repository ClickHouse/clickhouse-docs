---
'slug': '/examples/aggregate-function-combinators/countIf'
'title': 'countIf'
'description': '使用 countIf 组合器的示例'
'keywords':
- 'count'
- 'if'
- 'combinator'
- 'examples'
- 'countIf'
'sidebar_label': 'countIf'
---




# countIf {#countif}

## Description {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`count`](/sql-reference/aggregate-functions/reference/count) 函数，以计算条件为真时的行数，使用 `countIf` 聚合组合函数。

## Example Usage {#example-usage}

在这个示例中，我们将创建一个表来存储用户登录尝试，并将使用 `countIf` 来计算成功登录的次数。

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
    countIf(is_successful = 1) as successful_logins
FROM login_attempts
GROUP BY user_id;
```

`countIf` 函数将仅计算每个用户中 `is_successful = 1` 的行数。

```response title="Response"
   ┌─user_id─┬─successful_logins─┐
1. │       1 │                 2 │
2. │       2 │                 2 │
   └─────────┴───────────────────┘
```

## See also {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
