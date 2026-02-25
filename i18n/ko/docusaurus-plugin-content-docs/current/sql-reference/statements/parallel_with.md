---
description: 'PARALLEL WITH 절에 대한 문서'
sidebar_label: 'PARALLEL WITH'
sidebar_position: 53
slug: /sql-reference/statements/parallel_with
title: 'PARALLEL WITH 절'
doc_type: 'reference'
---



# PARALLEL WITH 절 \{#parallel-with-clause\}

여러 SQL 문을 병렬로 실행할 수 있도록 합니다.



## 구문 \{#syntax\}

```sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

SQL 문인 `statement1`, `statement2`, `statement3`, ... 를 서로 병렬로 실행합니다. 이들 SQL 문의 출력 결과는 버려집니다.

SQL 문을 병렬로 실행하면 같은 SQL 문을 순차적으로 실행하는 것보다 더 빠른 경우가 많습니다. 예를 들어, `statement1 PARALLEL WITH statement2 PARALLEL WITH statement3`는 `statement1; statement2; statement3`보다 더 빠를 가능성이 높습니다.


## 예제 \{#examples\}

두 개의 테이블을 병렬로 생성합니다.

```sql
CREATE TABLE table1(x Int32) ENGINE = MergeTree ORDER BY tuple()
PARALLEL WITH
CREATE TABLE table2(y String) ENGINE = MergeTree ORDER BY tuple();
```

두 개의 테이블을 병렬로 삭제합니다:

```sql
DROP TABLE table1
PARALLEL WITH
DROP TABLE table2;
```


## 설정 \{#settings\}

[max_threads](../../operations/settings/settings.md#max_threads) 설정은 생성되는 스레드 수를 제어합니다.



## UNION과의 비교 \{#comparison-with-union\}

`PARALLEL WITH` 절은 피연산자를 병렬로 실행한다는 점에서 [UNION](select/union.md)과 약간 유사합니다. 그러나 다음과 같은 차이가 있습니다.
- `PARALLEL WITH`는 피연산자를 실행한 결과를 반환하지 않으며, 예외가 발생한 경우 해당 예외를 다시 발생시킬 수만 있습니다.
- `PARALLEL WITH`는 피연산자들이 동일한 결과 컬럼 집합을 가질 필요가 없습니다.
- `PARALLEL WITH`는 `SELECT`만이 아니라 임의의 SQL 문을 실행할 수 있습니다.
