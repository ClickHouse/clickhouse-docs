---
description: 'ClickHouse의 널 허용 데이터 타입 수정자에 대한 문서'
sidebar_label: 'Nullable(T)'
sidebar_position: 44
slug: /sql-reference/data-types/nullable
title: 'Nullable(T)'
doc_type: 'reference'
---

# Nullable(T) \{#nullablet\}

`T`에서 허용되는 일반 값들과 함께 「누락된 값」을 나타내는 특수 마커([NULL](../../sql-reference/syntax.md))를 저장할 수 있게 합니다. 예를 들어 `Nullable(Int8)` 타입 컬럼은 `Int8` 타입 값을 저장할 수 있으며, 값이 없는 행은 `NULL`을 저장합니다.

`T`는 다음과 같은 복합 데이터 타입이 될 수 없습니다:

- [Array](../../sql-reference/data-types/array.md) — 지원되지 않음
- [Map](../../sql-reference/data-types/map.md) — 지원되지 않음
- [Tuple](../../sql-reference/data-types/tuple.md) — 실험적으로 지원됨*

그러나 복합 데이터 타입에는 `Nullable` 타입 값을 **포함할 수** 있습니다. 예를 들어 `Array(Nullable(Int8))` 또는 `Tuple(Nullable(String), Nullable(Int64))`와 같이 사용할 수 있습니다.

:::note 실험적 기능: Nullable Tuple

* `allow_experimental_nullable_tuple_type = 1`이 활성화된 경우 [Nullable(Tuple(...))](../../sql-reference/data-types/tuple.md#nullable-tuple)가 지원됩니다.
:::

`Nullable` 타입 필드는 테이블 인덱스에 포함될 수 없습니다.

ClickHouse 서버 설정에서 별도로 지정하지 않으면, 모든 `Nullable` 타입의 기본값은 `NULL`입니다.

## 저장 기능 특성 \{#storage-features\}

테이블 컬럼에 `Nullable` 타입 값을 저장하기 위해 ClickHouse는 값이 저장된 일반 파일 외에 `NULL` 마스크를 위한 별도 파일을 사용합니다. 마스크 파일의 엔트리를 통해 ClickHouse는 각 테이블 행에 대해 `NULL`과 해당 데이터 타입의 기본값을 구분합니다. 이 추가 파일 때문에 `Nullable` 컬럼은 유사한 일반 컬럼에 비해 더 많은 저장 공간을 사용합니다.

:::note
`Nullable` 사용은 거의 항상 성능에 부정적인 영향을 미치므로, 데이터베이스를 설계할 때 이를 유념해야 합니다.
:::

## NULL 찾기 \{#finding-null\}

전체 컬럼을 읽을 필요 없이 `null` 서브컬럼을 사용하여 컬럼에서 `NULL` 값을 찾을 수 있습니다. 해당 값이 `NULL`이면 `1`을, 그렇지 않으면 `0`을 반환합니다.

**예시**

쿼리:

```sql
CREATE TABLE nullable (`n` Nullable(UInt32)) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO nullable VALUES (1) (NULL) (2) (NULL);

SELECT n.null FROM nullable;
```

실행 결과:

```text
┌─n.null─┐
│      0 │
│      1 │
│      0 │
│      1 │
└────────┘
```


## 사용 예제 \{#usage-example\}

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
