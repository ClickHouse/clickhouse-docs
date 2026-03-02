---
description: 'ClickHouse에서 이름이 지정된 상수 값들의 집합을 나타내는 Enum 데이터 타입에 대한 문서입니다.'
sidebar_label: 'Enum'
sidebar_position: 20
slug: /sql-reference/data-types/enum
title: 'Enum'
doc_type: 'reference'
---

# Enum \{#enum\}

여러 개의 이름이 지정된 값으로 구성된 열거형 타입입니다.

이름이 지정된 값은 `'string' = integer` 쌍 또는 `'string'` 이름으로 선언할 수 있습니다. ClickHouse는 숫자만 저장하지만, 이름을 통해 해당 값으로 연산을 수행할 수 있습니다.

ClickHouse는 다음을 지원합니다:

* 8비트 `Enum`. `[-128, 127]` 범위에서 최대 256개의 값을 포함할 수 있습니다.
* 16비트 `Enum`. `[-32768, 32767]` 범위에서 최대 65536개의 값을 포함할 수 있습니다.

데이터가 삽입될 때 ClickHouse는 `Enum` 타입을 자동으로 선택합니다. 또한 저장 공간 크기를 명확히 하기 위해 `Enum8` 또는 `Enum16` 타입을 사용할 수 있습니다.

## 사용 예시 \{#usage-examples\}

다음은 `Enum8('hello' = 1, 'world' = 2)` 타입 컬럼이 있는 테이블을 생성하는 예시입니다.

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

마찬가지로 숫자를 생략해도 됩니다. 그러면 ClickHouse가 연속된 번호를 자동으로 부여합니다. 기본적으로 번호는 1부터 할당됩니다.

```sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

첫 번째 이름에 사용할 수 있는 유효한 시작 번호를 지정할 수도 있습니다.

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world')
)
ENGINE = TinyLog
```

```sql
CREATE TABLE t_enum
(
    x Enum8('hello' = -129, 'world')
)
ENGINE = TinyLog
```

```text
Exception on server:
Code: 69. DB::Exception: Value -129 for element 'hello' exceeds range of Enum8.
```

컬럼 `x`에는 타입 정의에 나열된 값인 `'hello'`와 `'world'`만 저장할 수 있습니다. 다른 값을 저장하려고 하면 ClickHouse에서 예외를 발생시킵니다. 이 `Enum` 타입에는 8비트 크기가 자동으로 선택됩니다.

```sql
INSERT INTO t_enum VALUES ('hello'), ('world'), ('hello')
```

```text
Ok.
```

```sql
INSERT INTO t_enum VALUES('a')
```

```text
Exception on client:
Code: 49. DB::Exception: Unknown element 'a' for type Enum('hello' = 1, 'world' = 2)
```

테이블에서 데이터를 쿼리할 때 ClickHouse는 `Enum`의 문자열 값을 반환합니다.

```sql
SELECT * FROM t_enum
```

```text
┌─x─────┐
│ hello │
│ world │
│ hello │
└───────┘
```

각 행에 대한 숫자 값을 확인해야 하는 경우 `Enum` 값을 정수형으로 캐스팅해야 합니다.

```sql
SELECT CAST(x, 'Int8') FROM t_enum
```

```text
┌─CAST(x, 'Int8')─┐
│               1 │
│               2 │
│               1 │
└─────────────────┘
```

쿼리에서 Enum 값을 생성하려면 `CAST`를 함께 사용해야 합니다.

```sql
SELECT toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))
```

```text
┌─toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))─┐
│ Enum8('a' = 1, 'b' = 2)                             │
└─────────────────────────────────────────────────────┘
```

## 일반 규칙 및 사용법 \{#general-rules-and-usage\}

각 값에는 `Enum8`의 경우 `-128 ... 127`, `Enum16`의 경우 `-32768 ... 32767` 범위의 숫자가 하나씩 할당됩니다. 모든 문자열과 숫자는 서로 달라야 합니다. 빈 문자열도 허용됩니다. 이 타입이 테이블 정의에서 지정된 경우 숫자는 임의의 순서로 나열할 수 있습니다. 그러나 순서는 중요하지 않습니다.

`Enum`의 문자열 값도 숫자 값도 [NULL](../../sql-reference/syntax.md)이 될 수 없습니다.

`Enum`은 [널 허용(Nullable)](../../sql-reference/data-types/nullable.md) 타입에 포함될 수 있습니다. 따라서 다음과 같이 쿼리를 사용해 테이블을 생성하면

```sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

`'hello'`와 `'world'`뿐만 아니라 `NULL`도 저장할 수 있습니다.

```sql
INSERT INTO t_enum_nullable VALUES('hello'),('world'),(NULL)
```

RAM에서는 `Enum` 컬럼이 해당 숫자 값에 대응하는 `Int8` 또는 `Int16`과 동일한 방식으로 저장됩니다.

텍스트 형식으로 읽을 때 ClickHouse는 값을 문자열로 파싱한 후 Enum 값 집합에서 해당하는 문자열을 검색합니다. 찾지 못하면 예외가 발생합니다. 텍스트 형식으로 읽을 때는 문자열을 읽은 다음, 해당하는 숫자 값을 조회합니다. 찾지 못하면 예외가 발생합니다.
텍스트 형식으로 쓸 때는 값을 해당하는 문자열로 기록합니다. 컬럼 데이터에 잘못된 값(유효한 집합에 포함되지 않는 숫자)이 있으면 예외가 발생합니다. 바이너리 형식으로 읽고 쓸 때는 `Int8` 및 `Int16` 데이터 타입과 동일한 방식으로 동작합니다.
암시적 기본값은 가장 작은 숫자 값을 가진 값입니다.

`ORDER BY`, `GROUP BY`, `IN`, `DISTINCT` 등에서 Enum은 해당 숫자 값과 동일한 방식으로 동작합니다. 예를 들어, `ORDER BY`는 이를 숫자 기준으로 정렬합니다. 동등성 및 비교 연산자는 기본 숫자 값에 대해 동작하는 것과 동일한 방식으로 Enum에 대해 동작합니다.

Enum 값은 숫자와 비교할 수 없습니다. Enum은 상수 문자열과 비교할 수 있습니다. 비교 대상 문자열이 Enum의 유효한 값이 아니면 예외가 발생합니다. `IN` 연산자는 왼쪽에 Enum, 오른쪽에 문자열 집합을 두는 경우를 지원합니다. 이 문자열들은 해당 Enum의 값입니다.

대부분의 숫자 및 문자열 연산은 Enum 값에 대해 정의되어 있지 않습니다. 예를 들어, Enum에 숫자를 더하거나 문자열을 이어 붙이는 연산 등입니다.
그러나 Enum에는 자신의 문자열 값을 반환하는 자연스러운 `toString` 함수가 있습니다.

Enum 값은 `toT` 함수를 사용하여 숫자 타입으로도 변환할 수 있으며, 여기서 T는 숫자 타입입니다. T가 Enum의 기본 숫자 타입과 일치하는 경우 이 변환에는 추가 비용이 발생하지 않습니다.
Enum 타입은 값 집합만 변경되는 경우 ALTER를 사용하여 비용 없이 변경할 수 있습니다. ALTER를 사용해 Enum의 멤버를 추가하거나 제거하는 것이 모두 가능합니다(제거는 해당 값이 테이블에서 한 번도 사용된 적이 없는 경우에만 안전합니다). 보호 장치로서, 이미 정의된 Enum 멤버의 숫자 값을 변경하려 하면 예외가 발생합니다.

ALTER를 사용하면 `Int8`을 `Int16`으로 변경하는 것과 마찬가지로 `Enum8`을 `Enum16`으로, 혹은 그 반대로 변경할 수 있습니다.
