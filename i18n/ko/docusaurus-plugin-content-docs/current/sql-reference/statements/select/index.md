---
'description': 'SELECT 쿼리에 대한 문서'
'sidebar_label': 'SELECT'
'sidebar_position': 32
'slug': '/sql-reference/statements/select/'
'title': 'SELECT 쿼리'
'doc_type': 'reference'
---


# SELECT 쿼리

`SELECT` 쿼리는 데이터 검색을 수행합니다. 기본적으로 요청된 데이터는 클라이언트에 반환되며, [INSERT INTO](../../../sql-reference/statements/insert-into.md)와 함께 사용되면 다른 테이블로 전달될 수 있습니다.

## 문법 {#syntax}

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
[INTO OUTFILE filename [COMPRESSION type [LEVEL level]] ]
[FORMAT format]
```

모든 절은 선택 사항이며, `SELECT` 바로 뒤에 오는 필수 표현식 목록은 [아래](#select-clause)에서 더 자세히 다루어집니다.

각 선택적 절의 세부 사항은 실행되는 순서대로 나열된 별도의 섹션에서 다룹니다:

- [WITH 절](../../../sql-reference/statements/select/with.md)
- [SELECT 절](#select-clause)
- [DISTINCT 절](../../../sql-reference/statements/select/distinct.md)
- [FROM 절](../../../sql-reference/statements/select/from.md)
- [SAMPLE 절](../../../sql-reference/statements/select/sample.md)
- [JOIN 절](../../../sql-reference/statements/select/join.md)
- [PREWHERE 절](../../../sql-reference/statements/select/prewhere.md)
- [WHERE 절](../../../sql-reference/statements/select/where.md)
- [WINDOW 절](../../../sql-reference/window-functions/index.md)
- [GROUP BY 절](/sql-reference/statements/select/group-by)
- [LIMIT BY 절](../../../sql-reference/statements/select/limit-by.md)
- [HAVING 절](../../../sql-reference/statements/select/having.md)
- [QUALIFY 절](../../../sql-reference/statements/select/qualify.md)
- [LIMIT 절](../../../sql-reference/statements/select/limit.md)
- [OFFSET 절](../../../sql-reference/statements/select/offset.md)
- [UNION 절](../../../sql-reference/statements/select/union.md)
- [INTERSECT 절](../../../sql-reference/statements/select/intersect.md)
- [EXCEPT 절](../../../sql-reference/statements/select/except.md)
- [INTO OUTFILE 절](../../../sql-reference/statements/select/into-outfile.md)
- [FORMAT 절](../../../sql-reference/statements/select/format.md)

## SELECT 절 {#select-clause}

`SELECT` 절에 지정된 [표현식](/sql-reference/syntax#expressions)은 위에서 설명한 절의 모든 작업이 완료된 후에 계산됩니다. 이러한 표현식은 결과의 별도의 행에 적용되는 것처럼 작동합니다. `SELECT` 절의 표현식에 집계 함수가 포함되어 있는 경우, ClickHouse는 [GROUP BY](/sql-reference/statements/select/group-by) 집계 동안 집계 함수와 해당 인수로 사용되는 표현식을 처리합니다.

결과에 모든 컬럼을 포함하려면 별표(`*`) 기호를 사용하세요. 예: `SELECT * FROM ...`.

### 동적 컬럼 선택 {#dynamic-column-selection}

동적 컬럼 선택(또는 COLUMNS 표현식이라고도 함)은 결과에서 일부 컬럼을 [re2](https://en.wikipedia.org/wiki/RE2_(software)) 정규 표현식과 일치시킬 수 있습니다.

```sql
COLUMNS('regexp')
```

예를 들어, 다음과 같은 테이블을 고려해 보세요:

```sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

다음 쿼리는 이름에 `a` 기호가 포함된 모든 컬럼에서 데이터를 선택합니다.

```sql
SELECT COLUMNS('a') FROM col_names
```

```text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

선택된 컬럼은 알파벳 순서로 반환되지 않습니다.

쿼리에서 여러 개의 `COLUMNS` 표현식을 사용할 수 있으며, 이들에 함수를 적용할 수 있습니다.

예를 들어:

```sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

```text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

`COLUMNS` 표현식에 의해 반환된 각 컬럼은 개별 인수로 함수에 전달됩니다. 또한 함수가 지원하는 경우 다른 인수를 함수에 전달할 수 있습니다. 함수를 사용할 때 주의하세요. 함수가 전달된 인수의 수를 지원하지 않는 경우, ClickHouse는 예외를 발생시킵니다.

예를 들어:

```sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

```text
Received exception from server (version 19.14.1):
Code: 42. DB::Exception: Received from localhost:9000. DB::Exception: Number of arguments for function plus does not match: passed 3, should be 2.
```

이 예에서 `COLUMNS('a')`는 두 개의 컬럼인 `aa`와 `ab`를 반환합니다. `COLUMNS('c')`는 `bc` 컬럼을 반환합니다. `+` 연산자는 3개의 인수에 적용될 수 없으므로 ClickHouse는 관련 메시지와 함께 예외를 던집니다.

`COLUMNS` 표현식과 일치하는 컬럼은 다양한 데이터 유형을 가질 수 있습니다. `COLUMNS`가 어떤 컬럼도 일치하지 않으며 `SELECT`에서 유일한 표현식인 경우 ClickHouse는 예외를 발생시킵니다.

### 별표 {#asterisk}

쿼리의 어떤 부분에서도 표현식 대신 별표를 사용할 수 있습니다. 쿼리가 분석될 때, 별표는 모든 테이블 컬럼의 목록( `MATERIALIZED` 및 `ALIAS` 컬럼 제외)으로 확장됩니다. 별표를 사용하는 것은 다음과 같은 몇 가지 경우에만 정당화됩니다:

- 테이블 덤프를 생성할 때.
- 시스템 테이블과 같이 컬럼 수가 적은 테이블의 경우.
- 테이블에 어떤 컬럼이 있는지 정보를 얻을 때. 이 경우 `LIMIT 1`로 설정하세요. 그러나 `DESC TABLE` 쿼리를 사용하는 것이 더 좋습니다.
- `PREWHERE`를 사용하여 소수의 컬럼에 대한 강력한 필터링을 수행할 때.
- 서브쿼리에서 (외부 쿼리에 필요하지 않은 컬럼은 서브쿼리에서 제외됨).

기타 모든 경우에는 별표를 사용하는 것을 권장하지 않습니다. 이는 오히려 컬럼형 DBMS의 단점만 가져오기 때문입니다. 즉, 별표 사용은 권장되지 않습니다.

### 극단 값 {#extreme-values}

결과 외에도 결과 컬럼의 최소값과 최대값을 가져올 수도 있습니다. 이를 위해 **extremes** 설정을 1로 설정하세요. 최소값과 최대값은 숫자 유형, 날짜 및 시간 포함 날짜에 대해 계산됩니다. 다른 컬럼의 경우 기본값이 출력됩니다.

추가로 두 행이 계산됩니다 - 각각 최소값과 최대값입니다. 이 추가 행 두 개는 `XML`, `JSON*`, `TabSeparated*`, `CSV*`, `Vertical`, `Template` 및 `Pretty*` [형식](../../../interfaces/formats.md)에서 다른 행과 분리되어 출력됩니다. 다른 형식에서는 출력되지 않습니다.

`JSON*` 및 `XML` 형식에서는 극단 값이 별도의 'extremes' 필드에 출력됩니다. `TabSeparated*`, `CSV*` 및 `Vertical` 형식에서는 그 행이 주요 결과 뒤에 오며, 'totals'가 존재할 경우 그 뒤에 옵니다. 이 행은 (다른 데이터 뒤에) 빈 행으로 앞서 옵니다. `Pretty*` 형식에서는 행이 주요 결과 뒤에 별도의 테이블로 출력되며, 'totals'가 존재할 경우 그 뒤에 옵니다. `Template` 형식에서는 극단 값이 지정된 템플릿에 따라 출력됩니다.

극단 값은 `LIMIT` 이전에 행을 계산하지만 `LIMIT BY` 이후에 계산됩니다. 그러나 `LIMIT offset, size`를 사용할 때는 `offset` 이전의 행이 `extremes`에 포함됩니다. 스트리밍 요청에서는 결과에 `LIMIT`을 통과한 소수의 행이 포함될 수도 있습니다.

### 노트 {#notes}

쿼리의 어떤 부분에서도 동의어(`AS` 별칭)를 사용할 수 있습니다.

`GROUP BY`, `ORDER BY`, 및 `LIMIT BY` 절은 위치 인수를 지원할 수 있습니다. 이를 활성화하려면 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) 설정을 켜세요. 그러면 예를 들어 `ORDER BY 1,2`는 테이블의 첫 번째 및 두 번째 컬럼을 기준으로 행을 정렬합니다.

## 구현 세부 사항 {#implementation-details}

쿼리가 `DISTINCT`, `GROUP BY` 및 `ORDER BY` 절을 생략하고 `IN` 및 `JOIN` 서브쿼리를 생략하면 쿼리는 O(1) 양의 RAM을 사용하여 완전히 스트림 처리됩니다. 그렇지 않으면 적절한 제한이 설정되지 않으면 쿼리가 많은 RAM을 사용할 수 있습니다:

- `max_memory_usage`
- `max_rows_to_group_by`
- `max_rows_to_sort`
- `max_rows_in_distinct`
- `max_bytes_in_distinct`
- `max_rows_in_set`
- `max_bytes_in_set`
- `max_rows_in_join`
- `max_bytes_in_join`
- `max_bytes_before_external_sort`
- `max_bytes_ratio_before_external_sort`
- `max_bytes_before_external_group_by`
- `max_bytes_ratio_before_external_group_by`

자세한 내용은 "설정" 섹션을 참조하세요. 외부 정렬(임시 테이블을 디스크에 저장)과 외부 집계를 사용할 수도 있습니다.

## SELECT 수정자 {#select-modifiers}

`SELECT` 쿼리에서 다음 수정자를 사용할 수 있습니다.

| 수정자                              | 설명                                                                                                                                                                                                                                                                                                                                                       |
|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`APPLY`](./apply_modifier.md)     | 쿼리의 외부 테이블 표현식으로 반환된 각 행에 대해 일부 함수를 호출할 수 있게 합니다.                                                                                                                                                                                                                                                                  |
| [`EXCEPT`](./except_modifier.md)   | 결과에서 제외할 하나 이상의 컬럼 이름을 지정합니다. 모든 일치하는 컬럼 이름이 출력에서 생략됩니다.                                                                                                                                                                                                                                                   |
| [`REPLACE`](./replace_modifier.md) | 하나 이상의 [표현식 별칭](/sql-reference/syntax#expression-aliases)을 지정합니다. 각 별칭은 `SELECT *` 문에서 컬럼 이름과 일치해야 합니다. 출력 컬럼 목록에서, 별칭과 일치하는 컬럼은 해당 `REPLACE`의 표현식으로 대체됩니다. 이 수정자는 컬럼의 이름이나 순서를 변경하지 않습니다. 그러나 값과 값 유형은 변경할 수 있습니다. |

### 수정자 조합 {#modifier-combinations}

각 수정자를 개별적으로 사용하거나 조합하여 사용할 수 있습니다.

**예시:**

같은 수정자를 여러 번 사용하는 경우.

```sql
SELECT COLUMNS('[jk]') APPLY(toString) APPLY(length) APPLY(max) FROM columns_transformers;
```

```response
┌─max(length(toString(j)))─┬─max(length(toString(k)))─┐
│                        2 │                        3 │
└──────────────────────────┴──────────────────────────┘
```

단일 쿼리에서 여러 수정자를 사용하는 경우.

```sql
SELECT * REPLACE(i + 1 AS i) EXCEPT (j) APPLY(sum) from columns_transformers;
```

```response
┌─sum(plus(i, 1))─┬─sum(k)─┐
│             222 │    347 │
└─────────────────┴────────┘
```

## SELECT 쿼리의 SETTINGS {#settings-in-select-query}

필요한 설정을 `SELECT` 쿼리 내에서 직접 지정할 수 있습니다. 설정 값은 이 쿼리에만 적용되며, 쿼리 실행 후 기본값 또는 이전 값으로 재설정됩니다.

설정하는 다른 방법은 [여기](operations/settings/overview)를 참조하세요.

부울 설정을 true로 설정할 때는 값 할당을 생략하여 약식 구문을 사용할 수 있습니다. 설정 이름만 지정할 경우 자동으로 `1`(true)로 설정됩니다.

**예시**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
