---
'description': 'ORDER BY 절에 대한 문서'
'sidebar_label': 'ORDER BY'
'slug': '/sql-reference/statements/select/order-by'
'title': 'ORDER BY 절'
'doc_type': 'reference'
---



# ORDER BY 절

`ORDER BY` 절은 다음을 포함합니다.

- 표현식 목록, 예: `ORDER BY visits, search_phrase`,
- `SELECT` 절의 컬럼을 참조하는 숫자 목록, 예: `ORDER BY 2, 1`, 또는
- `ALL`, 이는 `SELECT` 절의 모든 컬럼을 의미합니다, 예: `ORDER BY ALL`.

컬럼 번호에 의한 정렬을 비활성화하려면 설정 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) = 0을 설정하십시오. `ALL`에 의한 정렬을 비활성화하려면 설정 [enable_order_by_all](/operations/settings/settings#enable_order_by_all) = 0을 설정하십시오.

`ORDER BY` 절은 정렬 방향을 결정하는 `DESC` (내림차순) 또는 `ASC` (오름차순) 수식어로 특성화될 수 있습니다. 명시적인 정렬 순서가 지정되지 않은 경우 기본적으로 `ASC`가 사용됩니다. 정렬 방향은 단일 표현식에 적용되며 전체 목록에는 적용되지 않습니다, 예: `ORDER BY Visits DESC, SearchPhrase`. 또한, 정렬은 대소문자를 구분합니다.

정렬 표현식에 대해 동일한 값이 있을 경우 결과는 임의적이고 비결정적인 순서로 반환됩니다. `SELECT` 문에서 `ORDER BY` 절이 생략되면 행 순서도 임의적이고 비결정적입니다.

## 특수 값의 정렬 {#sorting-of-special-values}

`NaN` 및 `NULL` 정렬 순서에는 두 가지 접근 방식이 있습니다:

- 기본적으로 또는 `NULLS LAST` 수식어와 함께: 먼저 값이 온 다음 `NaN`, 그 다음 `NULL`.
- `NULLS FIRST` 수식어를 사용할 경우: 먼저 `NULL`, 그 다음 `NaN`, 그 다음 다른 값들.

### 예제 {#example}

테이블

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    2 │
│ 1 │  nan │
│ 2 │    2 │
│ 3 │    4 │
│ 5 │    6 │
│ 6 │  nan │
│ 7 │ ᴺᵁᴸᴸ │
│ 6 │    7 │
│ 8 │    9 │
└───┴──────┘
```

쿼리 `SELECT * FROM t_null_nan ORDER BY y NULLS FIRST`를 실행하여 다음과 같은 결과를 얻습니다:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 7 │ ᴺᵁᴸᴸ │
│ 1 │  nan │
│ 6 │  nan │
│ 2 │    2 │
│ 2 │    2 │
│ 3 │    4 │
│ 5 │    6 │
│ 6 │    7 │
│ 8 │    9 │
└───┴──────┘
```

부동 소수점 숫자가 정렬될 때, NaNs는 다른 값들과 분리됩니다. 정렬 순서와 관계없이 NaN은 항상 마지막에 옵니다. 다시 말해 오름차순 정렬의 경우 모든 다른 숫자보다 큰 것으로 간주되어 배치되며, 내림차순 정렬의 경우 나머지보다 작은 것으로 간주되어 배치됩니다.

## 정렬 지원 {#collation-support}

[string](../../../sql-reference/data-types/string.md) 값으로 정렬할 때, 정렬(비교)을 지정할 수 있습니다. 예: `ORDER BY SearchPhrase COLLATE 'tr'` - 터키어 알파벳을 사용하여 대소문자를 구분하지 않고 키워드로 오름차순 정렬하기 위한 것입니다. 각 표현식의 `ORDER BY`에서 독립적으로 `COLLATE`을 지정하거나 지정하지 않을 수 있습니다. `ASC` 또는 `DESC`가 지정되면 `COLLATE`가 그 뒤에 지정됩니다. `COLLATE`를 사용할 경우, 정렬은 항상 대소문자를 구분하지 않습니다.

COLLATE는 [LowCardinality](../../../sql-reference/data-types/lowcardinality.md), [Nullable](../../../sql-reference/data-types/nullable.md), [Array](../../../sql-reference/data-types/array.md) 및 [Tuple](../../../sql-reference/data-types/tuple.md)에서 지원됩니다.

우리는 작고 최종 행 정렬을 위한 `COLLATE` 사용을 권장합니다, 왜냐하면 `COLLATE`로 정렬하는 것이 일반적인 바이트 정렬보다 비효율적이기 때문입니다.

## 정렬 예제 {#collation-examples}

[STRING](../../../sql-reference/data-types/string.md) 값만으로 예를 들어보겠습니다:

입력 테이블:

```text
┌─x─┬─s────┐
│ 1 │ bca  │
│ 2 │ ABC  │
│ 3 │ 123a │
│ 4 │ abc  │
│ 5 │ BCA  │
└───┴──────┘
```

쿼리:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

결과:

```text
┌─x─┬─s────┐
│ 3 │ 123a │
│ 4 │ abc  │
│ 2 │ ABC  │
│ 1 │ bca  │
│ 5 │ BCA  │
└───┴──────┘
```

[Nullable](../../../sql-reference/data-types/nullable.md) 예제:

입력 테이블:

```text
┌─x─┬─s────┐
│ 1 │ bca  │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │ ABC  │
│ 4 │ 123a │
│ 5 │ abc  │
│ 6 │ ᴺᵁᴸᴸ │
│ 7 │ BCA  │
└───┴──────┘
```

쿼리:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

결과:

```text
┌─x─┬─s────┐
│ 4 │ 123a │
│ 5 │ abc  │
│ 3 │ ABC  │
│ 1 │ bca  │
│ 7 │ BCA  │
│ 6 │ ᴺᵁᴸᴸ │
│ 2 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

[Array](../../../sql-reference/data-types/array.md) 예제:

입력 테이블:

```text
┌─x─┬─s─────────────┐
│ 1 │ ['Z']         │
│ 2 │ ['z']         │
│ 3 │ ['a']         │
│ 4 │ ['A']         │
│ 5 │ ['z','a']     │
│ 6 │ ['z','a','a'] │
│ 7 │ ['']          │
└───┴───────────────┘
```

쿼리:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

결과:

```text
┌─x─┬─s─────────────┐
│ 7 │ ['']          │
│ 3 │ ['a']         │
│ 4 │ ['A']         │
│ 2 │ ['z']         │
│ 5 │ ['z','a']     │
│ 6 │ ['z','a','a'] │
│ 1 │ ['Z']         │
└───┴───────────────┘
```

[LowCardinality](../../../sql-reference/data-types/lowcardinality.md) 문자열 예제:

입력 테이블:

```response
┌─x─┬─s───┐
│ 1 │ Z   │
│ 2 │ z   │
│ 3 │ a   │
│ 4 │ A   │
│ 5 │ za  │
│ 6 │ zaa │
│ 7 │     │
└───┴─────┘
```

쿼리:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

결과:

```response
┌─x─┬─s───┐
│ 7 │     │
│ 3 │ a   │
│ 4 │ A   │
│ 2 │ z   │
│ 1 │ Z   │
│ 5 │ za  │
│ 6 │ zaa │
└───┴─────┘
```

[Tuple](../../../sql-reference/data-types/tuple.md) 예제:

```response
┌─x─┬─s───────┐
│ 1 │ (1,'Z') │
│ 2 │ (1,'z') │
│ 3 │ (1,'a') │
│ 4 │ (2,'z') │
│ 5 │ (1,'A') │
│ 6 │ (2,'Z') │
│ 7 │ (2,'A') │
└───┴─────────┘
```

쿼리:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

결과:

```response
┌─x─┬─s───────┐
│ 3 │ (1,'a') │
│ 5 │ (1,'A') │
│ 2 │ (1,'z') │
│ 1 │ (1,'Z') │
│ 7 │ (2,'A') │
│ 4 │ (2,'z') │
│ 6 │ (2,'Z') │
└───┴─────────┘
```

## 구현 세부정보 {#implementation-details}

`ORDER BY` 외에 작은 [LIMIT](../../../sql-reference/statements/select/limit.md)를 지정하면 사용되는 RAM이 줄어듭니다. 그렇지 않으면 메모리 사용량은 정렬할 데이터 양에 비례합니다. 분산 쿼리 처리의 경우, [GROUP BY](/sql-reference/statements/select/group-by)가 생략되면 정렬이 원격 서버에서 부분적으로 수행되며, 결과는 요청자 서버에서 병합됩니다. 이는 분산 정렬의 경우 정렬할 데이터 양이 단일 서버의 메모리 양보다 클 수 있음을 의미합니다.

RAM이 충분치 않으면 외부 메모리에서 정렬을 수행할 수 있습니다 (디스크에 임시 파일 생성). 이를 위해 설정 `max_bytes_before_external_sort`를 사용하십시오. 0으로 설정하면(기본값) 외부 정렬이 비활성화됩니다. 활성화되면 정렬할 데이터 양이 지정된 바이트 수에 도달하면 수집된 데이터가 정렬되고 임시 파일에 덤프됩니다. 모든 데이터가 읽히면 모든 정렬된 파일이 병합되고 결과가 출력됩니다. 파일은 기본적으로 구성의 `/var/lib/clickhouse/tmp/` 디렉터리에 작성되며, `tmp_path` 매개변수를 사용하여 이 설정을 변경할 수 있습니다. 쿼리가 메모리 한도를 초과하는 경우에만 디스크로 쏟는 것도 가능합니다, 즉 `max_bytes_ratio_before_external_sort=0.6`는 쿼리가 `60%` 메모리 한도에 도달할 때만 디스크로 쏟는 것을 활성화합니다 (사용자/서버).

쿼리를 실행하는 데 `max_bytes_before_external_sort`보다 더 많은 메모리를 사용할 수 있습니다. 이러한 이유로 설정 값은 `max_memory_usage`보다 훨씬 작아야 합니다. 예를 들어, 서버에 128GB의 RAM이 있고 단일 쿼리를 실행해야 하는 경우 `max_memory_usage`를 100GB로, `max_bytes_before_external_sort`를 80GB로 설정하십시오.

외부 정렬은 RAM에서 정렬하는 것보다 훨씬 덜 효율적입니다.

## 데이터 읽기 최적화 {#optimization-of-data-reading}

`ORDER BY` 표현식이 테이블 정렬 키와 일치하는 접두사를 가진다면 [optimize_read_in_order](../../../operations/settings/settings.md#optimize_read_in_order) 설정을 사용하여 쿼리를 최적화할 수 있습니다.

`optimize_read_in_order` 설정이 활성화되면 ClickHouse 서버는 테이블 인덱스를 사용하여 `ORDER BY` 키의 순서로 데이터를 읽습니다. 이는 지정된 [LIMIT](../../../sql-reference/statements/select/limit.md) 경우 모든 데이터를 읽는 것을 피할 수 있게 합니다. 따라서 큰 데이터에 대한 작은 한도를 가진 쿼리는 더 빠르게 처리됩니다.

최적화는 `ASC`와 `DESC` 모두에서 작동하며 [GROUP BY](/sql-reference/statements/select/group-by) 절 및 [FINAL](/sql-reference/statements/select/from#final-modifier) 수식자와 함께 작동하지 않습니다.

`optimize_read_in_order` 설정이 비활성화되면 ClickHouse 서버는 `SELECT` 쿼리 처리 중에 테이블 인덱스를 사용하지 않습니다.

쿼리를 실행할 때 `ORDER BY` 절, 큰 `LIMIT` 및 쿼리된 데이터가 발견되기 전에 대량의 레코드를 읽어야 하는 [WHERE](../../../sql-reference/statements/select/where.md) 조건이 있는 경우, `optimize_read_in_order`를 수동으로 비활성화하는 것을 고려하십시오.

최적화는 다음 테이블 엔진에서 지원됩니다:

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) (물리화된 뷰를 포함하여),
- [Merge](../../../engines/table-engines/special/merge.md),
- [Buffer](../../../engines/table-engines/special/buffer.md)

`MaterializedView`-엔진 테이블에서는 `SELECT ... FROM merge_tree_table ORDER BY pk`와 같은 뷰에 대해 최적화가 작동합니다. 그러나 뷰 쿼리에 `ORDER BY` 절이 없으면 `SELECT ... FROM view ORDER BY pk`와 같은 쿼리는 지원되지 않습니다.

## ORDER BY 표현식 WITH FILL 수식자 {#order-by-expr-with-fill-modifier}

이 수식자는 [LIMIT ... WITH TIES 수식자](/sql-reference/statements/select/limit#limit--with-ties-modifier)와 결합될 수 있습니다.

`WITH FILL` 수식자는 `ORDER BY expr` 뒤에 선택적 `FROM expr`, `TO expr` 및 `STEP expr` 매개변수를 사용하여 설정할 수 있습니다. `expr` 컬럼의 모든 누락된 값은 순차적으로 채워지며 다른 컬럼은 기본값으로 채워집니다.

여러 컬럼을 채우려면 `ORDER BY` 섹션의 각 필드 이름 뒤에 선택적 매개변수와 함께 `WITH FILL` 수식자를 추가하십시오.

```sql
ORDER BY expr [WITH FILL] [FROM const_expr] [TO const_expr] [STEP const_numeric_expr] [STALENESS const_numeric_expr], ... exprN [WITH FILL] [FROM expr] [TO expr] [STEP numeric_expr] [STALENESS numeric_expr]
[INTERPOLATE [(col [AS expr], ... colN [AS exprN])]]
```

`WITH FILL`은 숫자(모든 종류의 float, decimal, int) 또는 날짜/날짜 시간 유형의 필드에 적용할 수 있습니다. `String` 필드에 적용할 경우 누락된 값은 빈 문자열로 채워집니다. `FROM const_expr`가 정의되지 않으면 채우기 순서는 `ORDER BY`에서 최소 `expr` 필드 값을 사용합니다. `TO const_expr`가 정의되지 않으면 채우기 순서는 `ORDER BY`에서 최대 `expr` 필드 값을 사용합니다. `STEP const_numeric_expr`이 정의되면 `const_numeric_expr`는 숫자 유형의 경우 `as is`, 날짜 유형의 경우 `days`, 날짜시간 유형의 경우 `seconds`로 해석됩니다. 또한 시간 및 날짜 간격을 나타내는 [INTERVAL](/sql-reference/data-types/special-data-types/interval/) 데이터 유형도 지원합니다. `STEP const_numeric_expr`이 생략되면 채우기 순서는 숫자 유형의 경우 `1.0`, 날짜 유형의 경우 `1 day`, 날짜시간 유형의 경우 `1 second`가 사용됩니다. `STALENESS const_numeric_expr`가 정의되면 쿼리는 원본 데이터의 이전 행과의 차이가 `const_numeric_expr`를 초과할 때까지 행을 생성합니다. `INTERPOLATE`는 `ORDER BY WITH FILL`에 참여하지 않는 컬럼에 적용될 수 있습니다. 이러한 컬럼은 이전 필드 값을 기반으로 `expr`을 적용하여 채워집니다. `expr`이 존재하지 않으면 이전 값을 반복합니다. 생략된 목록은 모든 허용된 컬럼을 포함하게 됩니다.

`WITH FILL`이 없는 쿼리 예:

```sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n;
```

결과:

```text
┌─n─┬─source───┐
│ 1 │ original │
│ 4 │ original │
│ 7 │ original │
└───┴──────────┘
```

`WITH FILL` 수식자를 적용한 동일한 쿼리:

```sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

결과:

```text
┌───n─┬─source───┐
│   0 │          │
│ 0.5 │          │
│   1 │ original │
│ 1.5 │          │
│   2 │          │
│ 2.5 │          │
│   3 │          │
│ 3.5 │          │
│   4 │ original │
│ 4.5 │          │
│   5 │          │
│ 5.5 │          │
│   7 │ original │
└─────┴──────────┘
```

여러 필드의 경우 `ORDER BY field2 WITH FILL, field1 WITH FILL`에서 채우기 순서는 `ORDER BY` 절의 필드 순서를 따릅니다.

예제:

```sql
SELECT
    toDate((number * 10) * 86400) AS d1,
    toDate(number * 86400) AS d2,
    'original' AS source
FROM numbers(10)
WHERE (number % 3) = 1
ORDER BY
    d2 WITH FILL,
    d1 WITH FILL STEP 5;
```

결과:

```text
┌───d1───────┬───d2───────┬─source───┐
│ 1970-01-11 │ 1970-01-02 │ original │
│ 1970-01-01 │ 1970-01-03 │          │
│ 1970-01-01 │ 1970-01-04 │          │
│ 1970-02-10 │ 1970-01-05 │ original │
│ 1970-01-01 │ 1970-01-06 │          │
│ 1970-01-01 │ 1970-01-07 │          │
│ 1970-03-12 │ 1970-01-08 │ original │
└────────────┴────────────┴──────────┘
```

필드 `d1`은 빈 값으로 채워지지 않으며 기본값을 사용합니다. 이는 `d2` 값에 대한 반복 값이 없기 때문에 `d1`의 순서가 제대로 계산되지 않기 때문입니다.

`ORDER BY`에서 필드가 변경된 다음 쿼리:

```sql
SELECT
    toDate((number * 10) * 86400) AS d1,
    toDate(number * 86400) AS d2,
    'original' AS source
FROM numbers(10)
WHERE (number % 3) = 1
ORDER BY
    d1 WITH FILL STEP 5,
    d2 WITH FILL;
```

결과:

```text
┌───d1───────┬───d2───────┬─source───┐
│ 1970-01-11 │ 1970-01-02 │ original │
│ 1970-01-16 │ 1970-01-01 │          │
│ 1970-01-21 │ 1970-01-01 │          │
│ 1970-01-26 │ 1970-01-01 │          │
│ 1970-01-31 │ 1970-01-01 │          │
│ 1970-02-05 │ 1970-01-01 │          │
│ 1970-02-10 │ 1970-01-05 │ original │
│ 1970-02-15 │ 1970-01-01 │          │
│ 1970-02-20 │ 1970-01-01 │          │
│ 1970-02-25 │ 1970-01-01 │          │
│ 1970-03-02 │ 1970-01-01 │          │
│ 1970-03-07 │ 1970-01-01 │          │
│ 1970-03-12 │ 1970-01-08 │ original │
└────────────┴────────────┴──────────┘
```

다음 쿼리는 `d1` 컬럼의 각 데이터에 대해 1일의 `INTERVAL` 데이터 유형을 사용합니다:

```sql
SELECT
    toDate((number * 10) * 86400) AS d1,
    toDate(number * 86400) AS d2,
    'original' AS source
FROM numbers(10)
WHERE (number % 3) = 1
ORDER BY
    d1 WITH FILL STEP INTERVAL 1 DAY,
    d2 WITH FILL;
```

결과:
```response
┌─────────d1─┬─────────d2─┬─source───┐
│ 1970-01-11 │ 1970-01-02 │ original │
│ 1970-01-12 │ 1970-01-01 │          │
│ 1970-01-13 │ 1970-01-01 │          │
│ 1970-01-14 │ 1970-01-01 │          │
│ 1970-01-15 │ 1970-01-01 │          │
│ 1970-01-16 │ 1970-01-01 │          │
│ 1970-01-17 │ 1970-01-01 │          │
│ 1970-01-18 │ 1970-01-01 │          │
│ 1970-01-19 │ 1970-01-01 │          │
│ 1970-01-20 │ 1970-01-01 │          │
│ 1970-01-21 │ 1970-01-01 │          │
│ 1970-01-22 │ 1970-01-01 │          │
│ 1970-01-23 │ 1970-01-01 │          │
│ 1970-01-24 │ 1970-01-01 │          │
│ 1970-01-25 │ 1970-01-01 │          │
│ 1970-01-26 │ 1970-01-01 │          │
│ 1970-01-27 │ 1970-01-01 │          │
│ 1970-01-28 │ 1970-01-01 │          │
│ 1970-01-29 │ 1970-01-01 │          │
│ 1970-01-30 │ 1970-01-01 │          │
│ 1970-01-31 │ 1970-01-01 │          │
│ 1970-02-01 │ 1970-01-01 │          │
│ 1970-02-02 │ 1970-01-01 │          │
│ 1970-02-03 │ 1970-01-01 │          │
│ 1970-02-04 │ 1970-01-01 │          │
│ 1970-02-05 │ 1970-01-01 │          │
│ 1970-02-06 │ 1970-01-01 │          │
│ 1970-02-07 │ 1970-01-01 │          │
│ 1970-02-08 │ 1970-01-01 │          │
│ 1970-02-09 │ 1970-01-01 │          │
│ 1970-02-10 │ 1970-01-05 │ original │
│ 1970-02-11 │ 1970-01-01 │          │
│ 1970-02-12 │ 1970-01-01 │          │
│ 1970-02-13 │ 1970-01-01 │          │
│ 1970-02-14 │ 1970-01-01 │          │
│ 1970-02-15 │ 1970-01-01 │          │
│ 1970-02-16 │ 1970-01-01 │          │
│ 1970-02-17 │ 1970-01-01 │          │
│ 1970-02-18 │ 1970-01-01 │          │
│ 1970-02-19 │ 1970-01-01 │          │
│ 1970-02-20 │ 1970-01-01 │          │
│ 1970-02-21 │ 1970-01-01 │          │
│ 1970-02-22 │ 1970-01-01 │          │
│ 1970-02-23 │ 1970-01-01 │          │
│ 1970-02-24 │ 1970-01-01 │          │
│ 1970-02-25 │ 1970-01-01 │          │
│ 1970-02-26 │ 1970-01-01 │          │
│ 1970-02-27 │ 1970-01-01 │          │
│ 1970-02-28 │ 1970-01-01 │          │
│ 1970-03-01 │ 1970-01-01 │          │
│ 1970-03-02 │ 1970-01-01 │          │
│ 1970-03-03 │ 1970-01-01 │          │
│ 1970-03-04 │ 1970-01-01 │          │
│ 1970-03-05 │ 1970-01-01 │          │
│ 1970-03-06 │ 1970-01-01 │          │
│ 1970-03-07 │ 1970-01-01 │          │
│ 1970-03-08 │ 1970-01-01 │          │
│ 1970-03-09 │ 1970-01-01 │          │
│ 1970-03-10 │ 1970-01-01 │          │
│ 1970-03-11 │ 1970-01-01 │          │
│ 1970-03-12 │ 1970-01-08 │ original │
└────────────┴────────────┴──────────┘
```

`STALENESS`가 없는 쿼리 예:

```sql
SELECT number AS key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL;
```

결과:

```text
    ┌─key─┬─value─┬─source───┐
 1. │   0 │     0 │ original │
 2. │   1 │     0 │          │
 3. │   2 │     0 │          │
 4. │   3 │     0 │          │
 5. │   4 │     0 │          │
 6. │   5 │    25 │ original │
 7. │   6 │     0 │          │
 8. │   7 │     0 │          │
 9. │   8 │     0 │          │
10. │   9 │     0 │          │
11. │  10 │    50 │ original │
12. │  11 │     0 │          │
13. │  12 │     0 │          │
14. │  13 │     0 │          │
15. │  14 │     0 │          │
16. │  15 │    75 │ original │
    └─────┴───────┴──────────┘
```

`STALENESS 3`을 적용한 동일한 쿼리:

```sql
SELECT number AS key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL STALENESS 3;
```

결과:

```text
    ┌─key─┬─value─┬─source───┐
 1. │   0 │     0 │ original │
 2. │   1 │     0 │          │
 3. │   2 │     0 │          │
 4. │   5 │    25 │ original │
 5. │   6 │     0 │          │
 6. │   7 │     0 │          │
 7. │  10 │    50 │ original │
 8. │  11 │     0 │          │
 9. │  12 │     0 │          │
10. │  15 │    75 │ original │
11. │  16 │     0 │          │
12. │  17 │     0 │          │
    └─────┴───────┴──────────┘
```

`INTERPOLATE`가 없는 쿼리 예:

```sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number AS inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

결과:

```text
┌───n─┬─source───┬─inter─┐
│   0 │          │     0 │
│ 0.5 │          │     0 │
│   1 │ original │     1 │
│ 1.5 │          │     0 │
│   2 │          │     0 │
│ 2.5 │          │     0 │
│   3 │          │     0 │
│ 3.5 │          │     0 │
│   4 │ original │     4 │
│ 4.5 │          │     0 │
│   5 │          │     0 │
│ 5.5 │          │     0 │
│   7 │ original │     7 │
└─────┴──────────┴───────┘
```

`INTERPOLATE`를 적용한 동일한 쿼리:

```sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number AS inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5 INTERPOLATE (inter AS inter + 1);
```

결과:

```text
┌───n─┬─source───┬─inter─┐
│   0 │          │     0 │
│ 0.5 │          │     0 │
│   1 │ original │     1 │
│ 1.5 │          │     2 │
│   2 │          │     3 │
│ 2.5 │          │     4 │
│   3 │          │     5 │
│ 3.5 │          │     6 │
│   4 │ original │     4 │
│ 4.5 │          │     5 │
│   5 │          │     6 │
│ 5.5 │          │     7 │
│   7 │ original │     7 │
└─────┴──────────┴───────┘
```

## 정렬 접두사로 그룹화된 채우기 {#filling-grouped-by-sorting-prefix}

특정 컬럼에서 동일한 값을 가진 행을 독립적으로 채우는 것이 유용할 수 있습니다 - 좋은 예는 시간 시리즈에서 누락된 값을 채우는 것입니다. 다음과 같은 시간 시리즈 테이블이 있다고 가정해 보겠습니다:
```sql
CREATE TABLE timeseries
(
    `sensor_id` UInt64,
    `timestamp` DateTime64(3, 'UTC'),
    `value` Float64
)
ENGINE = Memory;

SELECT * FROM timeseries;

┌─sensor_id─┬───────────────timestamp─┬─value─┐
│       234 │ 2021-12-01 00:00:03.000 │     3 │
│       432 │ 2021-12-01 00:00:01.000 │     1 │
│       234 │ 2021-12-01 00:00:07.000 │     7 │
│       432 │ 2021-12-01 00:00:05.000 │     5 │
└───────────┴─────────────────────────┴───────┘
```
각 센서에 대해 1초 간격으로 누락된 값을 독립적으로 채우고 싶습니다. 이를 달성하는 방법은 `sensor_id` 컬럼을 정렬 접두사로 사용하여 `timestamp` 컬럼을 채우는 것입니다:
```sql
SELECT *
FROM timeseries
ORDER BY
    sensor_id,
    timestamp WITH FILL
INTERPOLATE ( value AS 9999 )

┌─sensor_id─┬───────────────timestamp─┬─value─┐
│       234 │ 2021-12-01 00:00:03.000 │     3 │
│       234 │ 2021-12-01 00:00:04.000 │  9999 │
│       234 │ 2021-12-01 00:00:05.000 │  9999 │
│       234 │ 2021-12-01 00:00:06.000 │  9999 │
│       234 │ 2021-12-01 00:00:07.000 │     7 │
│       432 │ 2021-12-01 00:00:01.000 │     1 │
│       432 │ 2021-12-01 00:00:02.000 │  9999 │
│       432 │ 2021-12-01 00:00:03.000 │  9999 │
│       432 │ 2021-12-01 00:00:04.000 │  9999 │
│       432 │ 2021-12-01 00:00:05.000 │     5 │
└───────────┴─────────────────────────┴───────┘
```
여기서 `value` 컬럼은 채워진 행을 보다 두드러지게 하기 위해 `9999`로 보간되었습니다. 이 동작은 기본적으로 설정 `use_with_fill_by_sorting_prefix`로 제어됩니다 (기본적으로 활성화됨).

## 관련 콘텐츠 {#related-content}

- 블로그: [ClickHouse에서 시간 시리즈 데이터 작업](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
