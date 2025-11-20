---
'description': 'PARALLEL WITH 절에 대한 문서'
'sidebar_label': 'PARALLEL WITH'
'sidebar_position': 53
'slug': '/sql-reference/statements/parallel_with'
'title': 'PARALLEL WITH 절'
'doc_type': 'reference'
---


# PARALLEL WITH 절

여러 개의 문장을 병렬로 실행할 수 있습니다.

## 구문 {#syntax}

```sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

문장 `statement1`, `statement2`, `statement3`, ... 를 서로 병렬로 실행합니다. 이 문장들의 출력은 버려집니다.

병렬로 문장을 실행하는 것은 동일한 문장을 순차적으로 실행하는 것보다 많은 경우에 더 빠를 수 있습니다. 예를 들어, `statement1 PARALLEL WITH statement2 PARALLEL WITH statement3`는 `statement1; statement2; statement3`보다 더 빠를 가능성이 높습니다.

## 예제 {#examples}

두 개의 테이블을 병렬로 생성합니다:

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

## 설정 {#settings}

설정 [max_threads](../../operations/settings/settings.md#max_threads)는 얼마나 많은 스레드가 생성되는지를 제어합니다.

## UNION과의 비교 {#comparison-with-union}

`PARALLEL WITH` 절은 [UNION](select/union.md)과 약간 유사하며, UNION 또한 그 피연산자를 병렬로 실행합니다. 하지만 몇 가지 차이점이 있습니다:
- `PARALLEL WITH`는 피연산자를 실행한 결과를 반환하지 않으므로, 예외가 발생할 경우에만 이를 다시 던질 수 있습니다;
- `PARALLEL WITH`는 피연산자가 동일한 결과 컬럼 집합을 가질 필요가 없습니다;
- `PARALLEL WITH`는 모든 문장을 실행할 수 있습니다 (단순히 `SELECT`만이 아님).
