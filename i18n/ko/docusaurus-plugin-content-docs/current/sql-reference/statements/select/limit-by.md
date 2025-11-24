---
'description': 'LIMIT BY 절에 대한 문서'
'sidebar_label': 'LIMIT BY'
'slug': '/sql-reference/statements/select/limit-by'
'title': 'LIMIT BY 절'
'doc_type': 'reference'
---


# LIMIT BY 절

`LIMIT n BY expressions` 절이 포함된 쿼리는 각 고유한 `expressions` 값에 대해 첫 `n` 행을 선택합니다. `LIMIT BY`의 키는 임의의 수의 [expressions](/sql-reference/syntax#expressions)를 포함할 수 있습니다.

ClickHouse는 다음과 같은 구문 변형을 지원합니다:

- `LIMIT [offset_value, ]n BY expressions`
- `LIMIT n OFFSET offset_value BY expressions`

쿼리 처리는 ClickHouse가 정렬 키에 따라 데이터를 선택합니다. 정렬 키는 [ORDER BY](/sql-reference/statements/select/order-by) 절을 사용하여 명시적으로 설정되거나 테이블 엔진의 속성으로 암묵적으로 설정됩니다(정렬은 [ORDER BY](/sql-reference/statements/select/order-by)를 사용할 때만 보장되며, 그렇지 않으면 행 블록이 멀티 스레딩으로 인해 정렬되지 않습니다). 그런 다음 ClickHouse는 `LIMIT n BY expressions`를 적용하고 각 고유한 `expressions` 조합에 대한 첫 `n` 행을 반환합니다. `OFFSET`이 지정되면, 고유한 `expressions` 조합에 속하는 각 데이터 블록에 대해 ClickHouse는 블록의 시작 부분에서 `offset_value` 수의 행을 건너뛰고 최대 `n` 행을 결과로 반환합니다. 만약 `offset_value`가 데이터 블록의 행 수보다 크면 ClickHouse는 블록에서 0개의 행을 반환합니다.

:::note    
`LIMIT BY`는 [LIMIT](../../../sql-reference/statements/select/limit.md)와 관련이 없습니다. 두 절은 동일한 쿼리에서 모두 사용할 수 있습니다.
:::

`LIMIT BY` 절에서 열 이름 대신 열 번호를 사용하려면 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) 설정을 활성화하십시오.    

## 예제 {#examples}

샘플 테이블:

```sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

쿼리들:

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 2 BY id
```

```text
┌─id─┬─val─┐
│  1 │  10 │
│  1 │  11 │
│  2 │  20 │
│  2 │  21 │
└────┴─────┘
```

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 1, 2 BY id
```

```text
┌─id─┬─val─┐
│  1 │  11 │
│  1 │  12 │
│  2 │  21 │
└────┴─────┘
```

`SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` 쿼리는 동일한 결과를 반환합니다.

다음 쿼리는 각 `domain, device_type` 쌍에 대해 최대 100 행의 상위 5개의 추천인을 반환합니다 (`LIMIT n BY + LIMIT`).

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    domainWithoutWWW(REFERRER_URL) AS referrer,
    device_type,
    count() cnt
FROM hits
GROUP BY domain, referrer, device_type
ORDER BY cnt DESC
LIMIT 5 BY domain, device_type
LIMIT 100
```

## LIMIT BY ALL {#limit-by-all}

`LIMIT BY ALL`은 집계 함수가 아닌 모든 SELECT-ed expressions를 나열하는 것과 동일합니다.

예를 들어:

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY ALL
```

이는 다음과 같습니다:

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY col1, col2, col3
```

특별한 경우로, 인수로 집계 함수와 다른 필드를 모두 포함하는 함수가 있는 경우, `LIMIT BY` 키는 그로부터 추출할 수 있는 최대 비집계 필드를 포함합니다.

예를 들어:

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY ALL
```

이는 다음과 같습니다:

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY substring(a, 4, 2), substring(a, 1, 2)
```

## 예제 {#examples-limit-by-all}

샘플 테이블:

```sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

쿼리들:

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 2 BY id
```

```text
┌─id─┬─val─┐
│  1 │  10 │
│  1 │  11 │
│  2 │  20 │
│  2 │  21 │
└────┴─────┘
```

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 1, 2 BY id
```

```text
┌─id─┬─val─┐
│  1 │  11 │
│  1 │  12 │
│  2 │  21 │
└────┴─────┘
```

`SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` 쿼리는 동일한 결과를 반환합니다.

`LIMIT BY ALL` 사용:

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY ALL
```

이는 다음과 같습니다:

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY id, val
```

다음 쿼리는 각 `domain, device_type` 쌍에 대해 최대 100 행의 상위 5개의 추천인을 반환합니다 (`LIMIT n BY + LIMIT`).

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    domainWithoutWWW(REFERRER_URL) AS referrer,
    device_type,
    count() cnt
FROM hits
GROUP BY domain, referrer, device_type
ORDER BY cnt DESC
LIMIT 5 BY domain, device_type
LIMIT 100
```
