---
'description': '숫자의 합계를 계산하고 동시에 행의 수를 셉니다. 이 기능은 ClickHouse 쿼리 최적화 프로그램에 의해 사용됩니다:
  쿼리에 여러 개의 `sum`, `count` 또는 `avg` 함수가 있는 경우, 이들은 계산을 재사용하기 위해 단일 `sumCount` 함수로
  대체될 수 있습니다. 이 기능은 명시적으로 사용할 필요가 드뭅니다.'
'sidebar_position': 196
'slug': '/sql-reference/aggregate-functions/reference/sumcount'
'title': 'sumCount'
'doc_type': 'reference'
---

숫자의 합을 계산하고 동시에 행의 수를 계산합니다. 이 함수는 ClickHouse 쿼리 최적화기에 의해 사용됩니다: 쿼리에 여러 개의 `sum`, `count` 또는 `avg` 함수가 있을 경우, 계산을 재사용하기 위해 단일 `sumCount` 함수로 대체할 수 있습니다. 이 함수는 명시적으로 사용할 일이 드뭅니다.

**구문**

```sql
sumCount(x)
```

**인수**

- `x` — 입력 값, [정수](../../../sql-reference/data-types/int-uint.md), [부동 소수점](../../../sql-reference/data-types/float.md) 또는 [십진수](../../../sql-reference/data-types/decimal.md) 여야 합니다.

**반환 값**

- 튜플 `(sum, count)`, 여기서 `sum`은 숫자의 합이고 `count`는 NULL이 아닌 값이 있는 행의 수입니다.

유형: [튜플](../../../sql-reference/data-types/tuple.md).

**예시**

쿼리:

```sql
CREATE TABLE s_table (x Int8) ENGINE = Log;
INSERT INTO s_table SELECT number FROM numbers(0, 20);
INSERT INTO s_table VALUES (NULL);
SELECT sumCount(x) FROM s_table;
```

결과:

```text
┌─sumCount(x)─┐
│ (190,20)    │
└─────────────┘
```

**참조**

- [optimize_syntax_fuse_functions](../../../operations/settings/settings.md#optimize_syntax_fuse_functions) 설정.
