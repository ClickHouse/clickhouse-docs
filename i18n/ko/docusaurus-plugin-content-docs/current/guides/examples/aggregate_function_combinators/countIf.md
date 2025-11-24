---
'slug': '/examples/aggregate-function-combinators/countIf'
'title': 'countIf'
'description': 'countIf 조합기의 사용 예'
'keywords':
- 'count'
- 'if'
- 'combinator'
- 'examples'
- 'countIf'
'sidebar_label': 'countIf'
'doc_type': 'reference'
---


# countIf {#countif}

## Description {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 조합자는 [`count`](/sql-reference/aggregate-functions/reference/count) 함수에 적용되어 조건이 참인 행의 수를 셀 수 있습니다. 이때 `countIf` 집계 조합자 함수를 사용합니다.

## Example usage {#example-usage}

이번 예제에서는 사용자 로그인 시도를 저장하는 테이블을 생성하고, `countIf`를 사용하여 성공적인 로그인 수를 셀 것입니다.

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

`countIf` 함수는 각 사용자의 `is_successful = 1`인 행만 세게 됩니다.

```response title="Response"
   ┌─user_id─┬─successful_logins─┐
1. │       1 │                 2 │
2. │       2 │                 2 │
   └─────────┴───────────────────┘
```

## See also {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
