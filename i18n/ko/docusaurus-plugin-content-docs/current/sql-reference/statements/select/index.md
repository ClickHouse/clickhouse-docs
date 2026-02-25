---
description: 'SELECT 쿼리 문서'
sidebar_label: 'SELECT'
sidebar_position: 32
slug: /sql-reference/statements/select/
title: 'SELECT 쿼리'
doc_type: 'reference'
---

# SELECT Query \{#select-query\}

`SELECT` 쿼리는 데이터를 조회합니다. 기본적으로 요청된 데이터는 클라이언트로 반환되지만, [INSERT INTO](../../../sql-reference/statements/insert-into.md)와 함께 사용하면 다른 테이블로 전달할 수도 있습니다.

## 구문 \{#syntax\}

```sql
[WITH expr_list(subquery)]
SELECT [DISTINCT [ON (column1, column2, ...)]] expr_list
[FROM [db.]table | (subquery) | table_function] [FINAL]
[SAMPLE sample_coeff]
[ARRAY JOIN ...]
[GLOBAL] [ANY|ALL|ASOF] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI] JOIN (subquery)|table [(alias1 [, alias2 ...])] (ON <expr_list>)|(USING <column_list>)
[PREWHERE expr]
[WHERE expr]
[GROUP BY expr_list] [WITH ROLLUP|WITH CUBE] [WITH TOTALS]
[HAVING expr]
[WINDOW window_expr_list]
[QUALIFY expr]
[ORDER BY expr_list] [WITH FILL] [FROM expr] [TO expr] [STEP expr] [INTERPOLATE [(expr_list)]]
[LIMIT [offset_value, ]n BY columns]
[LIMIT [n, ]m] [WITH TIES]
[SETTINGS ...]
[UNION  ...]
[INTO OUTFILE filename [TRUNCATE] [COMPRESSION type [LEVEL level]] ]
[FORMAT format]
```

`SELECT` 뒤에 즉시 오는 표현식 목록을 제외하면 다른 모든 절은 선택 사항이며, 이 필수 표현식 목록에 대해서는 [아래](#select-clause)에서 더 자세히 설명합니다.

각 선택적 절의 세부 내용은 별도의 섹션에서 설명하며, 실제 실행 순서와 동일한 순서로 나열되어 있습니다:

* [WITH 절](../../../sql-reference/statements/select/with.md)
* [SELECT 절](#select-clause)
* [DISTINCT 절](../../../sql-reference/statements/select/distinct.md)
* [FROM 절](../../../sql-reference/statements/select/from.md)
* [SAMPLE 절](../../../sql-reference/statements/select/sample.md)
* [JOIN 절](../../../sql-reference/statements/select/join.md)
* [PREWHERE 절](../../../sql-reference/statements/select/prewhere.md)
* [WHERE 절](../../../sql-reference/statements/select/where.md)
* [WINDOW 절](../../../sql-reference/window-functions/index.md)
* [GROUP BY 절](/sql-reference/statements/select/group-by)
* [LIMIT BY 절](../../../sql-reference/statements/select/limit-by.md)
* [HAVING 절](../../../sql-reference/statements/select/having.md)
* [QUALIFY 절](../../../sql-reference/statements/select/qualify.md)
* [LIMIT 절](../../../sql-reference/statements/select/limit.md)
* [OFFSET 절](../../../sql-reference/statements/select/offset.md)
* [UNION 절](../../../sql-reference/statements/select/union.md)
* [INTERSECT 절](../../../sql-reference/statements/select/intersect.md)
* [EXCEPT 절](../../../sql-reference/statements/select/except.md)
* [INTO OUTFILE 절](../../../sql-reference/statements/select/into-outfile.md)
* [FORMAT 절](../../../sql-reference/statements/select/format.md)

## SELECT 절 \{#select-clause\}

`SELECT` 절에 지정된 [표현식](/sql-reference/syntax#expressions)은 위에서 설명한 절들의 모든 연산이 끝난 후에 계산됩니다. 이러한 표현식은 결과의 각 행에 개별적으로 적용되는 것처럼 동작합니다. `SELECT` 절의 표현식에 집계 함수가 포함되어 있으면 ClickHouse는 [GROUP BY](/sql-reference/statements/select/group-by) 집계 동안 집계 함수와 그 인수로 사용된 표현식을 처리합니다.

결과에 모든 컬럼을 포함하려면 별표(`*`) 기호를 사용하면 됩니다. 예를 들어 `SELECT * FROM ...`와 같습니다.

### 동적 컬럼 선택 \{#dynamic-column-selection\}

동적 컬럼 선택(또는 COLUMNS 식이라고 함)을 사용하면 결과의 일부 컬럼을 [re2](https://en.wikipedia.org/wiki/RE2_\(software\)) 정규 표현식과 일치하도록 선택할 수 있습니다.

```sql
COLUMNS('regexp')
```

예를 들어, 다음과 같은 테이블이 있다고 가정합니다.

```sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

다음 쿼리는 이름에 문자 `a`가 포함된 모든 컬럼의 데이터를 조회합니다.

```sql
SELECT COLUMNS('a') FROM col_names
```

```text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

선택된 컬럼은 알파벳 순으로 정렬되어 반환되지 않습니다.

쿼리에서 여러 개의 `COLUMNS` 표현식을 사용할 수 있으며, 각 표현식에 함수를 적용할 수 있습니다.

예를 들어 다음과 같습니다:

```sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

```text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

`COLUMNS` 표현식으로 반환된 각 컬럼은 함수에 별도의 인수로 전달됩니다. 또한 함수가 이를 지원하는 경우 다른 인수들도 함께 전달할 수 있습니다. 함수를 사용할 때는 주의하십시오. 함수가 전달된 인수 개수를 지원하지 않으면 ClickHouse는 예외를 발생시킵니다.

예를 들어:

```sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

```text
Received exception from server (version 19.14.1):
Code: 42. DB::Exception: Received from localhost:9000. DB::Exception: Number of arguments for function plus does not match: passed 3, should be 2.
```

이 예에서 `COLUMNS('a')`는 두 개의 컬럼인 `aa`와 `ab`를 반환합니다. `COLUMNS('c')`는 `bc` 컬럼을 반환합니다. `+` 연산자는 3개의 인수에는 사용할 수 없으므로 ClickHouse는 해당 메시지와 함께 예외를 발생시킵니다.

`COLUMNS` 표현식과 일치하는 컬럼들은 서로 다른 데이터 타입을 가질 수 있습니다. `COLUMNS`가 어떤 컬럼과도 일치하지 않고 `SELECT`에서 유일한 표현식인 경우 ClickHouse는 예외를 발생시킵니다.

### 별표 \{#asterisk\}

쿼리의 어느 부분에서든 표현식 대신 별표를 사용할 수 있습니다. 쿼리가 분석될 때 별표는 모든 테이블 컬럼 목록으로 확장됩니다 (`MATERIALIZED` 및 `ALIAS` 컬럼은 제외). 별표 사용이 적절한 경우는 다음과 같이 몇 가지뿐입니다:

* 테이블 덤프를 생성할 때.
* 시스템 테이블과 같이 컬럼 수가 매우 적은 테이블의 경우.
* 테이블에 어떤 컬럼이 있는지 정보를 확인할 때. 이 경우 `LIMIT 1`을 설정합니다. 하지만 `DESC TABLE` 쿼리를 사용하는 것이 더 좋습니다.
* `PREWHERE`를 사용하여 소수의 컬럼에 대해 강한 필터링을 수행하는 경우.
* 서브쿼리에서 (외부 쿼리에 필요하지 않은 컬럼은 서브쿼리에서 제외되기 때문).

그 외 모든 경우에는 별표 사용을 권장하지 않습니다. 별표를 사용하면 열 지향 DBMS의 장점은 살리지 못하고 단점만 얻게 되기 때문입니다. 달리 말해, 별표 사용은 가급적 피하는 것이 좋습니다.

### Extreme Values \{#extreme-values\}

결과와 함께 결과 컬럼에 대한 최소값과 최대값도 얻을 수 있습니다. 이를 위해 **extremes** 설정을 1로 지정합니다. 최소값과 최대값은 숫자 타입, 날짜, 날짜-시간 타입에 대해 계산됩니다. 다른 컬럼에 대해서는 기본값이 출력됩니다.

추가로 두 개의 행이 계산되며, 각각 최소값과 최대값을 나타냅니다. 이 추가 두 행은 다른 행들과 구분되어 `XML`, `JSON*`, `TabSeparated*`, `CSV*`, `Vertical`, `Template`, `Pretty*` [포맷](../../../interfaces/formats.md)에서 출력됩니다. 다른 포맷에서는 출력되지 않습니다.

`JSON*` 및 `XML` 포맷에서는 극값이 별도의 &#39;extremes&#39; 필드에 출력됩니다. `TabSeparated*`, `CSV*`, `Vertical` 포맷에서는 이 행이 기본 결과 뒤에, 그리고 &#39;totals&#39;가 존재하는 경우에는 그 뒤에 출력됩니다. 이때 다른 데이터 다음에 빈 행이 하나 출력된 후 극값 행이 이어집니다. `Pretty*` 포맷에서는 이 행이 기본 결과 뒤에, 그리고 `totals`가 있는 경우 그 뒤에 별도의 테이블로 출력됩니다. `Template` 포맷에서는 지정된 템플릿에 따라 극값이 출력됩니다.

극값은 `LIMIT BY` 적용 이후, `LIMIT` 적용 이전의 행들에 대해 계산됩니다. 그러나 `LIMIT offset, size`를 사용하는 경우에는 `offset` 이전의 행들도 `extremes`에 포함됩니다. 스트리밍 방식의 요청에서는 결과에 `LIMIT`을 통과한 소량의 행이 추가로 포함될 수도 있습니다.

### 참고 사항 \{#notes\}

쿼리의 어느 부분에서든 동의어(`AS` 별칭)를 사용할 수 있습니다.

`GROUP BY`, `ORDER BY`, `LIMIT BY` 절은 위치 인수를 지원합니다. 이를 활성화하려면 [enable&#95;positional&#95;arguments](/operations/settings/settings#enable_positional_arguments) 설정을 켭니다. 그러면 예를 들어 `ORDER BY 1,2`는 테이블의 첫 번째 컬럼과 두 번째 컬럼 순서로 행을 정렬합니다.

## 구현 세부사항 \{#implementation-details\}

쿼리에 `DISTINCT`, `GROUP BY`, `ORDER BY` 절과 `IN`, `JOIN` 서브쿼리가 없으면, 쿼리는 O(1) 크기의 RAM만 사용하여 전적으로 스트리밍 방식으로 처리됩니다. 그렇지 않은 경우, 적절한 제한을 지정하지 않으면 쿼리가 대량의 RAM을 사용할 수 있습니다:

* `max_memory_usage`
* `max_rows_to_group_by`
* `max_rows_to_sort`
* `max_rows_in_distinct`
* `max_bytes_in_distinct`
* `max_rows_in_set`
* `max_bytes_in_set`
* `max_rows_in_join`
* `max_bytes_in_join`
* `max_bytes_before_external_sort`
* `max_bytes_ratio_before_external_sort`
* `max_bytes_before_external_group_by`
* `max_bytes_ratio_before_external_group_by`

자세한 내용은 「Settings」 섹션을 참조하십시오. 외부 정렬(임시 테이블을 디스크에 저장) 및 외부 집계를 사용할 수 있습니다.

## SELECT 수정자 \{#select-modifiers\}

`SELECT` 쿼리에서 다음 수정자를 사용할 수 있습니다.

| Modifier                            | Description                                                                                                                                                                                                                                                                                                                                                                              |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`APPLY`](./apply_modifier.md)     | 쿼리의 외부 테이블 표현식에서 반환되는 각 행에 대해 임의의 함수를 호출할 수 있도록 합니다.                                                                                                                                                                                                                                                                                               |
| [`EXCEPT`](./except_modifier.md)   | 결과에서 제외할 하나 이상의 컬럼 이름을 지정합니다. 일치하는 모든 컬럼 이름은 출력에서 제외됩니다.                                                                                                                                                                                                                                                                                        |
| [`REPLACE`](./replace_modifier.md) | 하나 이상의 [expression aliases](/sql-reference/syntax#expression-aliases)을(를) 지정합니다. 각 별칭은 `SELECT *` 구문의 컬럼 이름과 일치해야 합니다. 출력 컬럼 목록에서, 해당 별칭과 일치하는 컬럼은 해당 `REPLACE`에 지정된 식으로 대체됩니다. 이 수정자는 컬럼의 이름이나 순서는 변경하지 않습니다. 그러나 값과 값의 타입은 변경될 수 있습니다. |

### 수정자 조합 \{#modifier-combinations\}

각 수정자는 개별적으로 사용하거나 서로 조합해서 사용할 수 있습니다.

**예시:**

동일한 수정자를 여러 번 사용하는 예입니다.

```sql
SELECT COLUMNS('[jk]') APPLY(toString) APPLY(length) APPLY(max) FROM columns_transformers;
```

```response
┌─max(length(toString(j)))─┬─max(length(toString(k)))─┐
│                        2 │                        3 │
└──────────────────────────┴──────────────────────────┘
```

단일 쿼리에서 여러 수정자를 함께 사용하기

```sql
SELECT * REPLACE(i + 1 AS i) EXCEPT (j) APPLY(sum) from columns_transformers;
```

```response
┌─sum(plus(i, 1))─┬─sum(k)─┐
│             222 │    347 │
└─────────────────┴────────┘
```

## SELECT 쿼리에서 SETTINGS 사용 \{#settings-in-select-query\}

`SELECT` 쿼리 안에서 필요한 설정을 바로 지정할 수 있습니다. 설정값은 해당 쿼리에만 적용되며, 쿼리 실행 후 기본값 또는 이전 값으로 되돌아갑니다.

설정을 변경하는 다른 방법은 [여기](/operations/settings/overview)를 참조하십시오.

불리언 설정을 true로 지정할 때는 값 할당을 생략하는 축약된 문법을 사용할 수 있습니다. 설정 이름만 지정하면 자동으로 `1`(true)로 설정됩니다.

**예시**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
