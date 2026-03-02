---
slug: '/examples/aggregate-function-combinators/countIf'
title: 'countIf'
description: 'countIf 조합자(combinator) 사용 예'
keywords: ['count', 'if', 'combinator', 'examples', 'countIf']
sidebar_label: 'countIf'
doc_type: 'reference'
---



# countIf \{#countif\}



## 설명 \{#description\}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 조합자는 [`count`](/sql-reference/aggregate-functions/reference/count)
함수에 적용하여, `countIf` 집계 조합자 함수를 사용해
조건이 참인 행의 개수를 셀 수 있습니다.



## 사용 예시 \{#example-usage\}

이 예제에서는 사용자 로그인 시도 내역을 저장하는 테이블을 생성하고,
`countIf`를 사용하여 성공한 로그인 건수를 집계합니다.

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

`countIf` 함수는 각 사용자별로 `is_successful = 1`인 행만을 셉니다.

```response title="Response"
   ┌─user_id─┬─successful_logins─┐
1. │       1 │                 2 │
2. │       2 │                 2 │
   └─────────┴───────────────────┘
```


## 함께 보기 \{#see-also\}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
