---
description: 'LIMIT BY 절에 대한 문서'
sidebar_label: 'LIMIT BY'
slug: /sql-reference/statements/select/limit-by
title: 'LIMIT BY 절'
doc_type: 'reference'
---

# LIMIT BY 절 \{#limit-by-clause\}

`LIMIT n BY expressions` 절이 있는 쿼리는 `expressions`의 각 고유 값마다 처음 `n`개의 행을 선택합니다. `LIMIT BY`의 키에는 [표현식](/sql-reference/syntax#expressions)을 임의의 개수만큼 포함할 수 있습니다.

ClickHouse는 다음과 같은 구문 형태를 지원합니다:

* `LIMIT [offset_value, ]n BY expressions`
* `LIMIT n OFFSET offset_value BY expressions`

쿼리를 처리할 때 ClickHouse는 정렬 키에 따라 정렬된 데이터를 선택합니다. 정렬 키는 [ORDER BY](/sql-reference/statements/select/order-by) 절을 사용해 명시적으로 설정하거나, 테이블 엔진의 속성으로 암묵적으로 설정됩니다(행 순서는 [ORDER BY](/sql-reference/statements/select/order-by)를 사용할 때만 보장되며, 그렇지 않으면 멀티 스레딩으로 인해 행 블록이 정렬되지 않을 수 있습니다). 그런 다음 ClickHouse는 `LIMIT n BY expressions`를 적용하고 `expressions`의 각 고유 조합에 대해 처음 `n`개의 행을 반환합니다. `OFFSET`이 지정된 경우, `expressions`의 각 고유 조합에 속하는 데이터 블록마다 블록의 시작에서 `offset_value`개 만큼 행을 건너뛰고 결과로 최대 `n`개의 행을 반환합니다. `offset_value`가 데이터 블록의 행 수보다 크면 ClickHouse는 해당 블록에서 행을 하나도 반환하지 않습니다.

:::note\
`LIMIT BY`는 [LIMIT](../../../sql-reference/statements/select/limit.md)과 관련이 없습니다. 둘 다 같은 쿼리에서 함께 사용할 수 있습니다.
:::

`LIMIT BY` 절에서 컬럼 이름 대신 컬럼 번호를 사용하려면 [enable&#95;positional&#95;arguments](/operations/settings/settings#enable_positional_arguments) 설정을 활성화하십시오.

## 예제 \{#examples\}

예제 테이블:

```sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

쿼리:

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

`SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` 쿼리는 같은 결과를 반환합니다.

다음 쿼리는 각 `domain, device_type` 조합마다 상위 5개의 referrer를 반환하며, 전체 행 수를 최대 100개로 제한합니다 (`LIMIT n BY + LIMIT`).

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

## LIMIT BY ALL \{#limit-by-all\}

`LIMIT BY ALL`은 집계 함수가 아닌, `SELECT` 절의 모든 표현식을 나열하는 것과 동일하게 동작합니다.

예를 들면 다음과 같습니다:

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY ALL
```

와 동일합니다

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY col1, col2, col3
```

집계 함수와 다른 필드를 동시에 인수로 사용하는 FUNCTION이 있는 특수한 경우에는, 해당 FUNCTION에서 추출할 수 있는 비집계 필드를 가능한 한 많이 `LIMIT BY` 키에 포함합니다.

예를 들어, 다음과 같습니다:

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY ALL
```

와 같습니다

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY substring(a, 4, 2), substring(a, 1, 2)
```

## 예시 \{#examples-limit-by-all\}

예제 테이블:

```sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

쿼리:

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

`SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` 쿼리도 동일한 결과를 반환합니다.

`LIMIT BY ALL` 사용 예:

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY ALL
```

이는 다음과 동일합니다:

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY id, val
```

다음 쿼리는 각 `domain, device_type` 쌍에 대해 상위 5개의 referrer를 반환하며, 전체 결과는 최대 100행으로 제한됩니다 (`LIMIT n BY + LIMIT`).

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
