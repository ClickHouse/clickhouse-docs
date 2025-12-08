---
slug: '/examples/aggregate-function-combinators/countIf'
title: 'countIf'
description: 'Example of using the countIf combinator'
keywords: ['count', 'if', 'combinator', 'examples', 'countIf']
sidebar_label: 'countIf'
doc_type: 'reference'
---

# Countif {#countif}

## Description {#description}

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`count`](/sql-reference/aggregate-functions/reference/count)
function to count the number of rows where the condition is true,
using the `countIf` aggregate combinator function.

## Example usage {#example-usage}

In this example, we'll create a table that stores user login attempts,
and we'll use `countIf` to count the number of successful logins.

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

The `countIf` function will count only the rows where `is_successful = 1` for each user.

```response title="Response"
   ┌─user_id─┬─successful_logins─┐
1. │       1 │                 2 │
2. │       2 │                 2 │
   └─────────┴───────────────────┘
```

## See also {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
