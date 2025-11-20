---
'description': 'ClickHouse에서 Nullable 데이터 유형 수정자에 대한 문서'
'sidebar_label': 'Nullable(T)'
'sidebar_position': 44
'slug': '/sql-reference/data-types/nullable'
'title': 'Nullable(T)'
'doc_type': 'reference'
---


# Nullable(T)

`T`와 함께 정상 값을 허용하면서 "누락된 값"을 나타내는 특수 마커 ([NULL](../../sql-reference/syntax.md))를 저장할 수 있습니다. 예를 들어, `Nullable(Int8)` 타입 컬럼은 `Int8` 타입 값을 저장할 수 있으며, 값이 없는 행은 `NULL`을 저장합니다.

`T`는 [Array](../../sql-reference/data-types/array.md), [Map](../../sql-reference/data-types/map.md) 및 [Tuple](../../sql-reference/data-types/tuple.md)와 같은 복합 데이터 타입이 될 수 없지만, 복합 데이터 타입은 `Nullable` 타입 값을 포함할 수 있습니다. 예: `Array(Nullable(Int8))`.

`Nullable` 타입 필드는 테이블 인덱스에 포함될 수 없습니다.

`NULL`은 ClickHouse 서버 설정에서 달리 지정되지 않는 한 모든 `Nullable` 타입의 기본값입니다.

## Storage Features {#storage-features}

테이블 컬럼에 `Nullable` 타입 값을 저장하기 위해 ClickHouse는 값이 있는 일반 파일 외에 `NULL` 마스크가 있는 별도의 파일을 사용합니다. 마스크 파일의 항목은 ClickHouse가 각 테이블 행에 대해 `NULL`과 해당 데이터 타입의 기본값을 구별할 수 있게 해줍니다. 추가 파일이 있기 때문에 `Nullable` 컬럼은 유사한 일반 컬럼에 비해 추가 저장 공간을 사용합니다.

:::note    
`Nullable`을 사용하면 성능에 부정적인 영향을 미치는 경우가 거의 항상 발생하므로, 데이터베이스 설계 시 이 점을 기억하시기 바랍니다.
:::

## Finding NULL {#finding-null}

전체 컬럼을 읽지 않고도 `NULL` 값을 찾기 위해 `null` 서브 컬럼을 사용할 수 있습니다. 해당 값이 `NULL`인 경우 `1`을 반환하고 그렇지 않은 경우 `0`을 반환합니다.

**예제**

쿼리:

```sql
CREATE TABLE nullable (`n` Nullable(UInt32)) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO nullable VALUES (1) (NULL) (2) (NULL);

SELECT n.null FROM nullable;
```

결과:

```text
┌─n.null─┐
│      0 │
│      1 │
│      0 │
│      1 │
└────────┘
```

## Usage Example {#usage-example}

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE TinyLog
```

```sql
INSERT INTO t_null VALUES (1, NULL), (2, 3)
```

```sql
SELECT x + y FROM t_null
```

```text
┌─plus(x, y)─┐
│       ᴺᵁᴸᴸ │
│          5 │
└────────────┘
```
