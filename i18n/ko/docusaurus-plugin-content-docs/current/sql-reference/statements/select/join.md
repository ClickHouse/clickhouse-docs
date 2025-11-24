---
'description': 'JOIN 절에 대한 문서'
'sidebar_label': 'JOIN'
'slug': '/sql-reference/statements/select/join'
'title': 'JOIN 절'
'keywords':
- 'INNER JOIN'
- 'LEFT JOIN'
- 'LEFT OUTER JOIN'
- 'RIGHT JOIN'
- 'RIGHT OUTER JOIN'
- 'FULL OUTER JOIN'
- 'CROSS JOIN'
- 'LEFT SEMI JOIN'
- 'RIGHT SEMI JOIN'
- 'LEFT ANTI JOIN'
- 'RIGHT ANTI JOIN'
- 'LEFT ANY JOIN'
- 'RIGHT ANY JOIN'
- 'INNER ANY JOIN'
- 'ASOF JOIN'
- 'LEFT ASOF JOIN'
- 'PASTE JOIN'
'doc_type': 'reference'
---


# JOIN 절

`JOIN` 절은 하나 이상의 테이블의 컬럼을 공통된 값을 사용하여 결합하여 새로운 테이블을 생성합니다. 이는 SQL을 지원하는 데이터베이스에서 일반적인 작업으로, [관계 대수](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators) 조인에 해당합니다. 하나의 테이블 조인의 특수 경우는 종종 "self-join"이라고 불립니다.

**구문**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON` 절의 표현식과 `USING` 절의 컬럼은 "조인 키"라고 합니다. 별도의 명시가 없는 한, `JOIN`은 일치하는 "조인 키"를 가진 행으로부터 [카르테시안 곱](https://en.wikipedia.org/wiki/Cartesian_product)을 생성하며, 이는 소스 테이블보다 훨씬 더 많은 행을 포함할 수 있습니다.

## 지원되는 JOIN 유형 {#supported-types-of-join}

모든 표준 [SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL)) 유형이 지원됩니다:

| 유형                 | 설명                                                                         |
|----------------------|-----------------------------------------------------------------------------|
| `INNER JOIN`         | 일치하는 행만 반환됩니다.                                                  |
| `LEFT OUTER JOIN`    | 왼쪽 테이블의 비일치 행이 일치하는 행과 함께 반환됩니다.                    |
| `RIGHT OUTER JOIN`   | 오른쪽 테이블의 비일치 행이 일치하는 행과 함께 반환됩니다.                 |
| `FULL OUTER JOIN`    | 두 테이블의 비일치 행이 일치하는 행과 함께 반환됩니다.                     |
| `CROSS JOIN`         | 전체 테이블의 카르테시안 곱을 생성하며, "조인 키"가 **지정되지 않습니다**.|

- 타입이 지정되지 않은 `JOIN`은 `INNER`로 간주됩니다.
- `OUTER` 키워드는 안전하게 생략할 수 있습니다.
- `CROSS JOIN`의 대체 구문은 [`FROM` 절](../../../sql-reference/statements/select/from.md)에서 다수의 테이블을 쉼표로 구분하여 지정하는 것입니다.

ClickHouse에서 사용할 수 있는 추가 조인 유형은 다음과 같습니다:

| 유형                                           | 설명                                                                                               |
|------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `LEFT SEMI JOIN`, `RIGHT SEMI JOIN`           | 카르테시안 곱을 생성하지 않고 "조인 키"에 대한 허용 목록.                                         |
| `LEFT ANTI JOIN`, `RIGHT ANTI JOIN`           | 카르테시안 곱을 생성하지 않고 "조인 키"에 대한 금지 목록.                                        |
| `LEFT ANY JOIN`, `RIGHT ANY JOIN`, `INNER ANY JOIN` | 표준 `JOIN` 유형에 대해 카르테시안 곱을 부분적으로 (왼쪽 및 오른쪽의 반대편에 대해) 또는 완전히(내부 및 전체) 비활성화합니다. |
| `ASOF JOIN`, `LEFT ASOF JOIN`                  | 정확한 일치가 없는 시퀀스 조인. `ASOF JOIN` 사용법은 아래에 설명되어 있습니다.                        |
| `PASTE JOIN`                                   | 두 테이블의 수평 연결을 수행합니다.                                                                  |

:::note
[join_algorithm](../../../operations/settings/settings.md#join_algorithm)가 `partial_merge`로 설정되면 `RIGHT JOIN` 및 `FULL JOIN`은 `ALL` 엄격함으로만 지원됩니다 (`SEMI`, `ANTI`, `ANY`, `ASOF`는 지원되지 않습니다).
:::

## 설정 {#settings}

기본 조인 유형은 [`join_default_strictness`](../../../operations/settings/settings.md#join_default_strictness) 설정을 사용하여 덮어쓸 수 있습니다.

`ANY JOIN` 작업에 대한 ClickHouse 서버의 동작은 [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys) 설정에 따라 달라집니다.

**참조**

- [`join_algorithm`](../../../operations/settings/settings.md#join_algorithm)
- [`join_any_take_last_row`](../../../operations/settings/settings.md#join_any_take_last_row)
- [`join_use_nulls`](../../../operations/settings/settings.md#join_use_nulls)
- [`partial_merge_join_rows_in_right_blocks`](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [`join_on_disk_max_files_to_merge`](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

`cross_to_inner_join_rewrite` 설정을 사용하여 ClickHouse가 `CROSS JOIN`을 `INNER JOIN`으로 재작성할 수 없을 때의 동작을 정의합니다. 기본값은 `1`로, 이는 조인이 계속되도록 허용하지만 느려질 것입니다. 오류가 발생하도록 하려면 `cross_to_inner_join_rewrite`를 `0`으로 설정하고, 모든 쉼표/교차 조인의 재작성을 강제하려면 `2`로 설정합니다. 값이 `2`일 때 재작성이 실패하면 "Please, try to simplify `WHERE` section"이라는 오류 메시지가 표시됩니다.

## ON 절 조건 {#on-section-conditions}

`ON` 절에는 `AND` 및 `OR` 연산자를 사용하여 결합된 여러 조건이 포함될 수 있습니다. 조인 키를 지정하는 조건은 다음과 같아야 합니다:
- 왼쪽 및 오른쪽 테이블을 모두 참조
- 같음 연산자 사용

다른 조건은 다른 논리 연산자를 사용할 수 있지만 쿼리의 왼쪽 또는 오른쪽 테이블 중 하나를 참조해야 합니다.

전체 복합 조건이 충족되면 행이 조인됩니다. 조건이 충족되지 않으면 `JOIN` 유형에 따라 여전히 결과에 포함될 수 있습니다. 동일한 조건이 `WHERE` 절에 위치하고 충족되지 않으면 행은 항상 결과에서 필터링됩니다.

`ON` 절의 `OR` 연산자는 해시 조인 알고리즘을 사용하여 작동합니다. `JOIN`을 위한 조인 키가 있는 각 `OR` 인수에 대해 별도의 해시 테이블이 생성되므로, 메모리 소비와 쿼리 실행 시간은 `ON` 절의 `OR` 수식의 수가 증가함에 따라 선형적으로 증가합니다.

:::note
다른 테이블의 컬럼을 참조하는 조건이 있는 경우, 현재로서는 같음 연산자(`=`)만 지원됩니다.
:::

**예시**

`table_1` 및 `table_2`를 고려하십시오:

```response
┌─Id─┬─name─┐     ┌─Id─┬─text───────────┬─scores─┐
│  1 │ A    │     │  1 │ Text A         │     10 │
│  2 │ B    │     │  1 │ Another text A │     12 │
│  3 │ C    │     │  2 │ Text B         │     15 │
└────┴──────┘     └────┴────────────────┴────────┘
```

하나의 조인 키 조건과 `table_2`에 대한 추가 조건이 있는 쿼리:

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

결과에 이름이 `C`인 행과 텍스트 열이 비어 있는 행이 포함되어 있습니다. 이는 `OUTER` 유형의 조인이 사용되었기 때문입니다.

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

여러 조건과 `INNER` 유형의 조인이 있는 쿼리:

```sql
SELECT name, text, scores FROM table_1 INNER JOIN table_2
    ON table_1.Id = table_2.Id AND table_2.scores > 10 AND startsWith(table_2.text, 'Text');
```

결과:

```sql
┌─name─┬─text───┬─scores─┐
│ B    │ Text B │     15 │
└──────┴────────┴────────┘
```
`INNER` 유형의 조인과 `OR` 조건이 있는 쿼리:

```sql
CREATE TABLE t1 (`a` Int64, `b` Int64) ENGINE = MergeTree() ORDER BY a;

CREATE TABLE t2 (`key` Int32, `val` Int64) ENGINE = MergeTree() ORDER BY key;

INSERT INTO t1 SELECT number as a, -a as b from numbers(5);

INSERT INTO t2 SELECT if(number % 2 == 0, toInt64(number), -number) as key, number as val from numbers(5);

SELECT a, b, val FROM t1 INNER JOIN t2 ON t1.a = t2.key OR t1.b = t2.key;
```

결과:

```response
┌─a─┬──b─┬─val─┐
│ 0 │  0 │   0 │
│ 1 │ -1 │   1 │
│ 2 │ -2 │   2 │
│ 3 │ -3 │   3 │
│ 4 │ -4 │   4 │
└───┴────┴─────┘
```

`INNER` 유형의 조인과 `OR` 및 `AND` 조건이 있는 쿼리:

:::note

기본적으로, 비일치 조건은 동일한 테이블의 컬럼만 사용할 수 있습니다.
예를 들어, `t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`는 `t1.b > 0`가 `t1`의 컬럼만 사용하고, `t2.b > t2.c`가 `t2`의 컬럼만 사용하기 때문에 가능합니다.
그러나 `t1.a = t2.key AND t1.b > t2.key`와 같은 조건에 대한 실험적 지원을 시도할 수 있습니다. 더 자세한 정보는 아래 섹션을 확인하십시오.

:::

```sql
SELECT a, b, val FROM t1 INNER JOIN t2 ON t1.a = t2.key OR t1.b = t2.key AND t2.val > 3;
```

결과:

```response
┌─a─┬──b─┬─val─┐
│ 0 │  0 │   0 │
│ 2 │ -2 │   2 │
│ 4 │ -4 │   4 │
└───┴────┴─────┘
```

## 서로 다른 테이블의 컬럼에 대한 불일치 조건을 가진 JOIN {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouse는 현재 불일치 조건을 추가하여 `ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN`을 지원합니다. 불일치 조건은 `hash` 및 `grace_hash` 조인 알고리즘에서만 지원됩니다. 불일치 조건은 `join_use_nulls`와 함께 지원되지 않습니다.

**예시**

테이블 `t1`:

```response
┌─key──┬─attr─┬─a─┬─b─┬─c─┐
│ key1 │ a    │ 1 │ 1 │ 2 │
│ key1 │ b    │ 2 │ 3 │ 2 │
│ key1 │ c    │ 3 │ 2 │ 1 │
│ key1 │ d    │ 4 │ 7 │ 2 │
│ key1 │ e    │ 5 │ 5 │ 5 │
│ key2 │ a2   │ 1 │ 1 │ 1 │
│ key4 │ f    │ 2 │ 3 │ 4 │
└──────┴──────┴───┴───┴───┘
```

테이블 `t2`

```response
┌─key──┬─attr─┬─a─┬─b─┬─c─┐
│ key1 │ A    │ 1 │ 2 │ 1 │
│ key1 │ B    │ 2 │ 1 │ 2 │
│ key1 │ C    │ 3 │ 4 │ 5 │
│ key1 │ D    │ 4 │ 1 │ 6 │
│ key3 │ a3   │ 1 │ 1 │ 1 │
│ key4 │ F    │ 1 │ 1 │ 1 │
└──────┴──────┴───┴───┴───┘
```

```sql
SELECT t1.*, t2.* FROM t1 LEFT JOIN t2 ON t1.key = t2.key AND (t1.a < t2.a) ORDER BY (t1.key, t1.attr, t2.key, t2.attr);
```

```response
key1    a    1    1    2    key1    B    2    1    2
key1    a    1    1    2    key1    C    3    4    5
key1    a    1    1    2    key1    D    4    1    6
key1    b    2    3    2    key1    C    3    4    5
key1    b    2    3    2    key1    D    4    1    6
key1    c    3    2    1    key1    D    4    1    6
key1    d    4    7    2            0    0    \N
key1    e    5    5    5            0    0    \N
key2    a2    1    1    1            0    0    \N
key4    f    2    3    4            0    0    \N
```

## JOIN 키의 NULL 값 {#null-values-in-join-keys}

`NULL`은 어떤 값과도 같지 않으며, 자신을 포함합니다. 이는 한 테이블의 `JOIN` 키가 `NULL` 값을 가지면, 다른 테이블의 `NULL` 값과도 일치하지 않는다는 것을 의미합니다.

**예시**

테이블 `A`:

```response
┌───id─┬─name────┐
│    1 │ Alice   │
│    2 │ Bob     │
│ ᴺᵁᴸᴸ │ Charlie │
└──────┴─────────┘
```

테이블 `B`:

```response
┌───id─┬─score─┐
│    1 │    90 │
│    3 │    85 │
│ ᴺᵁᴸᴸ │    88 │
└──────┴───────┘
```

```sql
SELECT A.name, B.score FROM A LEFT JOIN B ON A.id = B.id
```

```response
┌─name────┬─score─┐
│ Alice   │    90 │
│ Bob     │     0 │
│ Charlie │     0 │
└─────────┴───────┘
```

테이블 `A`의 `Charlie`와 테이블 `B`의 점수 88이 결과에 포함되지 않음을 주목하십시오. 이는 `JOIN` 키의 `NULL` 값 때문입니다.

`NULL` 값을 일치시키려면, `JOIN` 키를 비교하기 위해 `isNotDistinctFrom` 함수를 사용하십시오.

```sql
SELECT A.name, B.score FROM A LEFT JOIN B ON isNotDistinctFrom(A.id, B.id)
```

```markdown
┌─name────┬─score─┐
│ Alice   │    90 │
│ Bob     │     0 │
│ Charlie │    88 │
└─────────┴───────┘
```

## ASOF JOIN 사용법 {#asof-join-usage}

`ASOF JOIN`은 정확한 일치가 없는 레코드를 조인해야 할 때 유용합니다.

이 JOIN 알고리즘은 테이블에 특별한 컬럼을 요구합니다. 이 컬럼은:

- 정렬된 시퀀스를 포함해야 합니다.
- 다음 중 하나의 유형일 수 있습니다: [Int, UInt](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md), [Date](../../../sql-reference/data-types/date.md), [DateTime](../../../sql-reference/data-types/datetime.md), [Decimal](../../../sql-reference/data-types/decimal.md).
- `hash` 조인 알고리즘의 경우, `JOIN` 절에 유일한 컬럼일 수 없습니다.

구문 `ASOF JOIN ... ON`:

```sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

여러 개의 같음 조건과 정확히 하나의 가장 가까운 일치 조건을 사용할 수 있습니다. 예를 들어, `SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`.

가장 가까운 일치를 지원하는 조건: `>`, `>=`, `<`, `<=`.

구문 `ASOF JOIN ... USING`:

```sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN`은 등가로 조인하기 위해 `equi_columnX`를 사용하고, 가장 가까운 일치로 조인하기 위해 `asof_column`을 사용하여 `table_1.asof_column >= table_2.asof_column` 조건을 설정합니다. `asof_column`은 항상 `USING` 절의 마지막 컬럼입니다.

예를 들어 다음 테이블을 고려하십시오:

```text
     table_1                           table_2
  event   | ev_time | user_id       event   | ev_time | user_id
----------|---------|----------   ----------|---------|----------
              ...                               ...
event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
              ...                 event_2_2 |  12:30  |   42
event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
              ...                               ...
```

`ASOF JOIN`은 `table_1`에서 사용자 이벤트의 타임스탬프를 가져와 `table_2`에서 `table_1`의 이벤트 타임스탬프에 가장 가까운 이벤트를 찾을 수 있습니다. 같은 타임스탬프 값이 있을 경우, 가장 가까운 것으로 간주됩니다. 여기서 `user_id` 컬럼은 등가로 조인하는 데 사용될 수 있고, `ev_time` 컬럼은 가장 가까운 일치로 조인하는 데 사용될 수 있습니다. 우리 예에서 `event_1_1`은 `event_2_1`과 조인될 수 있고, `event_1_2`는 `event_2_3`와 조인될 수 있지만, `event_2_2`는 조인될 수 없습니다.

:::note
`ASOF JOIN`은 `hash` 및 `full_sorting_merge` 조인 알고리즘에서만 지원됩니다.
[Join](../../../engines/table-engines/special/join.md) 테이블 엔진에서는 **지원되지 않습니다**.
:::

## PASTE JOIN 사용법 {#paste-join-usage}

`PASTE JOIN`의 결과는 왼쪽 서브쿼리의 모든 컬럼 다음에 오른쪽 서브쿼리의 모든 컬럼이 포함된 테이블입니다. 행은 원본 테이블의 위치에 따라 일치합니다 (행의 순서가 정의되어 있어야 함). 서브쿼리가 다른 수의 행을 반환하는 경우, 추가 행은 잘립니다.

예시:
```sql
SELECT *
FROM
(
    SELECT number AS a
    FROM numbers(2)
) AS t1
PASTE JOIN
(
    SELECT number AS a
    FROM numbers(2)
    ORDER BY a DESC
) AS t2

┌─a─┬─t2.a─┐
│ 0 │    1 │
│ 1 │    0 │
└───┴──────┘
```

참고: 이 경우 결과는 읽기가 병렬일 경우 비결정적일 수 있습니다. 예를 들어:

```sql
SELECT *
FROM
(
    SELECT number AS a
    FROM numbers_mt(5)
) AS t1
PASTE JOIN
(
    SELECT number AS a
    FROM numbers(10)
    ORDER BY a DESC
) AS t2
SETTINGS max_block_size = 2;

┌─a─┬─t2.a─┐
│ 2 │    9 │
│ 3 │    8 │
└───┴──────┘
┌─a─┬─t2.a─┐
│ 0 │    7 │
│ 1 │    6 │
└───┴──────┘
┌─a─┬─t2.a─┐
│ 4 │    5 │
└───┴──────┘
```

## 분산 JOIN {#distributed-join}

분산 테이블을 포함하는 JOIN을 실행하는 두 가지 방법이 있습니다:

- 일반 `JOIN`을 사용하는 경우, 쿼리는 원격 서버로 전송됩니다. 서브쿼리는 각 서버에서 실행되어 오른쪽 테이블을 생성하고, 이 테이블과 조인이 수행됩니다. 즉, 오른쪽 테이블은 각 서버에서 별도로 형성됩니다.
- `GLOBAL ... JOIN`을 사용하는 경우, 요청 서버가 오른쪽 테이블을 계산하기 위한 서브쿼리를 먼저 실행합니다. 이 임시 테이블은 각 원격 서버에 전달되며, 전송된 임시 데이터를 사용하여 쿼리가 실행됩니다.

`GLOBAL`을 사용할 때 주의하십시오. 자세한 내용은 [분산 서브쿼리](/sql-reference/operators/in#distributed-subqueries) 섹션을 참조하세요.

## 암시적 타입 변환 {#implicit-type-conversion}

`INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, 및 `FULL JOIN` 쿼리는 "조인 키"에 대한 암시적 타입 변환을 지원합니다. 그러나 왼쪽 및 오른쪽 테이블의 조인 키가 단일 타입으로 변환될 수 없는 경우 (예: `UInt64`와 `Int64` 또는 `String`과 `Int32`의 모든 값을 수용할 수 있는 데이터 타입이 없을 경우) 쿼리를 실행할 수 없습니다.

**예시**

테이블 `t_1`을 고려하십시오:
```response
┌─a─┬─b─┬─toTypeName(a)─┬─toTypeName(b)─┐
│ 1 │ 1 │ UInt16        │ UInt8         │
│ 2 │ 2 │ UInt16        │ UInt8         │
└───┴───┴───────────────┴───────────────┘
```
그리고 테이블 `t_2`:
```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│ -1 │    1 │ Int16         │ Nullable(Int64) │
│  1 │   -1 │ Int16         │ Nullable(Int64) │
│  1 │    1 │ Int16         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

쿼리
```sql
SELECT a, b, toTypeName(a), toTypeName(b) FROM t_1 FULL JOIN t_2 USING (a, b);
```
는 다음 세트를 반환합니다:
```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│  1 │    1 │ Int32         │ Nullable(Int64) │
│  2 │    2 │ Int32         │ Nullable(Int64) │
│ -1 │    1 │ Int32         │ Nullable(Int64) │
│  1 │   -1 │ Int32         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

## 사용 권장 사항 {#usage-recommendations}

### 비어 있거나 NULL 셀 처리 {#processing-of-empty-or-null-cells}

테이블을 조인할 때 비어 있는 셀이 나타날 수 있습니다. 설정 [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)는 ClickHouse가 이러한 셀을 채우는 방법을 정의합니다.

`JOIN` 키가 [Nullable](../../../sql-reference/data-types/nullable.md) 필드인 경우, 키 중 적어도 하나가 [NULL](/sql-reference/syntax#null) 값을 가진 행은 조인되지 않습니다.

### 구문 {#syntax}

`USING`에 지정된 컬럼은 두 서브쿼리 모두에서 동일한 이름을 가져야 하며, 다른 컬럼은 다르게 명명되어야 합니다. 서브쿼리의 컬럼 이름을 바꾸기 위해 별칭을 사용할 수 있습니다.

`USING` 절은 조인할 하나 이상의 컬럼을 지정하며, 이는 이러한 컬럼의 같음을 확인합니다. 컬럼 목록은 괄호 없이 설정됩니다. 더 복잡한 조인 조건은 지원되지 않습니다.

### 구문 제한 {#syntax-limitations}

단일 `SELECT` 쿼리에서 여러 `JOIN` 절을 사용하는 경우:

- `*`를 통해 모든 컬럼을 가져오는 것은 테이블이 조인된 경우에만 가능하며, 서브쿼리에는 적용되지 않습니다.
- `PREWHERE` 절은 사용할 수 없습니다.
- `USING` 절은 사용할 수 없습니다.

`ON`, `WHERE`, 및 `GROUP BY` 절의 경우:

- `ON`, `WHERE`, 및 `GROUP BY` 절에서 임의의 표현식을 사용할 수 없지만, `SELECT` 절에서 표현식을 정의한 다음 별칭을 통해 이러한 절에서 사용할 수 있습니다.

### 성능 {#performance}

`JOIN`을 실행할 때, 쿼리의 다른 단계와 관련된 실행 순서 최적화가 없습니다. 조인 (오른쪽 테이블에서의 검색)은 `WHERE`에서의 필터링 및 집계 전에 실행됩니다.

동일한 `JOIN`으로 쿼리가 실행될 때마다 서브쿼리가 다시 실행되며 결과는 캐싱되지 않습니다. 이를 피하려면 항상 RAM에 있는 조인을 위한 준비된 배열인 [Join](../../../engines/table-engines/special/join.md) 테이블 엔진을 사용하세요.

일부 경우에, `JOIN` 대신 [IN](../../../sql-reference/operators/in.md)을 사용하는 것이 더 효율적입니다.

차원 테이블 (상황에 따라 광고 캠페인 이름과 같은 차원 속성을 포함하는 상대적으로 작은 테이블)과 조인하기 위한 `JOIN`이 필요한 경우, 오른쪽 테이블이 모든 쿼리에 대해 재접속되기 때문에 `JOIN`이 그리 편리하지 않을 수 있습니다. 이러한 경우에는 `JOIN` 대신 사용해야 할 "딕셔너리" 기능이 있습니다. 자세한 내용은 [딕셔너리](../../../sql-reference/dictionaries/index.md) 섹션을 참조하십시오.

### 메모리 제한 {#memory-limitations}

기본적으로 ClickHouse는 [해시 조인](https://en.wikipedia.org/wiki/Hash_join) 알고리즘을 사용합니다. ClickHouse는 `right_table`을 가져와서 RAM에 대해 해시 테이블을 생성합니다. `join_algorithm = 'auto'`가 활성화된 경우, 메모리 소비의 특정 임계값을 초과하면 ClickHouse는 [병합](https://en.wikipedia.org/wiki/Sort-merge_join) 조인 알고리즘으로 전환됩니다. `JOIN` 알고리즘에 대한 설명은 [join_algorithm](../../../operations/settings/settings.md#join_algorithm) 설정을 참조하십시오.

`JOIN` 작업의 메모리 소비를 제한하려면 다음 설정을 사용하세요:

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — 해시 테이블의 행 수를 제한합니다.
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — 해시 테이블의 크기를 제한합니다.

이러한 제한 중 하나에 도달하면 ClickHouse는 [join_overflow_mode](/operations/settings/settings.md#join_overflow_mode) 설정이 지시하는대로 작동합니다.

## 예시 {#examples}

예시:

```sql
SELECT
    CounterID,
    hits,
    visits
FROM
(
    SELECT
        CounterID,
        count() AS hits
    FROM test.hits
    GROUP BY CounterID
) ANY LEFT JOIN
(
    SELECT
        CounterID,
        sum(Sign) AS visits
    FROM test.visits
    GROUP BY CounterID
) USING CounterID
ORDER BY hits DESC
LIMIT 10
```

```text
┌─CounterID─┬───hits─┬─visits─┐
│   1143050 │ 523264 │  13665 │
│    731962 │ 475698 │ 102716 │
│    722545 │ 337212 │ 108187 │
│    722889 │ 252197 │  10547 │
│   2237260 │ 196036 │   9522 │
│  23057320 │ 147211 │   7689 │
│    722818 │  90109 │  17847 │
│     48221 │  85379 │   4652 │
│  19762435 │  77807 │   7026 │
│    722884 │  77492 │  11056 │
└───────────┴────────┴────────┘
```

## 관련 콘텐츠 {#related-content}

- 블로그: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Part 1](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- 블로그: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 2](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- 블로그: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 3](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- 블로그: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 4](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)
