---
'description': 'ClickHouse에서의 열거형 데이터 타입에 대한 문서로, 명명된 상수 값의 집합을 나타냅니다.'
'sidebar_label': '열거형'
'sidebar_position': 20
'slug': '/sql-reference/data-types/enum'
'title': '열거형'
'doc_type': 'reference'
---


# Enum

이름이 지정된 값으로 구성된 열거형입니다.

이름이 지정된 값은 `'string' = integer` 쌍 또는 `'string'` 이름으로 선언할 수 있습니다. ClickHouse는 숫자만 저장하지만, 값에 대한 이름을 통해 연산을 지원합니다.

ClickHouse는 다음을 지원합니다:

- 8비트 `Enum`. `[-128, 127]` 범위에서 최대 256개의 값을 열거할 수 있습니다.
- 16비트 `Enum`. `[-32768, 32767]` 범위에서 최대 65536개의 값을 열거할 수 있습니다.

ClickHouse는 데이터가 삽입될 때 자동으로 `Enum`의 유형을 선택합니다. 저장 크기를 확신하기 위해 `Enum8` 또는 `Enum16` 유형을 사용할 수도 있습니다.

## Usage Examples {#usage-examples}

여기에서 `Enum8('hello' = 1, 'world' = 2)` 유형의 컬럼을 가진 테이블을 생성합니다:

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

유사하게, 숫자를 생략할 수도 있습니다. ClickHouse는 연속적인 숫자를 자동으로 할당합니다. 기본적으로 숫자는 1부터 할당됩니다.

```sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

첫 번째 이름에 대해 합법적인 시작 번호를 지정할 수도 있습니다.

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

컬럼 `x`는 유형 정의에 나열된 값만 저장할 수 있습니다: `'hello'` 또는 `'world'`. 다른 값을 저장하려고 하면 ClickHouse는 예외를 발생시킵니다. 이 `Enum`의 8비트 크기는 자동으로 선택됩니다.

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

테이블에서 데이터를 쿼리할 때 ClickHouse는 `Enum`의 문자열 값을 출력합니다.

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

행의 숫자 값을 보려면 `Enum` 값을 정수 유형으로 변환해야 합니다.

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

쿼리에서 Enum 값을 생성하려면 `CAST`를 사용해야 합니다.

```sql
SELECT toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))
```

```text
┌─toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))─┐
│ Enum8('a' = 1, 'b' = 2)                             │
└─────────────────────────────────────────────────────┘
```

## General Rules and Usage {#general-rules-and-usage}

각 값은 `Enum8`의 경우 `-128 ... 127` 범위 또는 `Enum16`의 경우 `-32768 ... 32767` 범위 내의 숫자가 할당됩니다. 모든 문자열과 숫자는 달라야 합니다. 빈 문자열은 허용됩니다. 이 유형이 지정된 경우(테이블 정의에서), 숫자는 임의의 순서일 수 있습니다. 그러나 순서는 중요하지 않습니다.

`Enum`의 문자열이나 숫자 값은 [NULL](../../sql-reference/syntax.md)이 될 수 없습니다.

`Enum`은 [Nullable](../../sql-reference/data-types/nullable.md) 유형에 포함될 수 있습니다. 따라서 다음 쿼리를 사용하여 테이블을 만들면

```sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

`'hello'`와 `'world'`뿐만 아니라 `NULL`까지 저장할 수 있습니다.

```sql
INSERT INTO t_enum_nullable VALUES('hello'),('world'),(NULL)
```

RAM에서는 `Enum` 컬럼이 해당 숫자 값의 `Int8` 또는 `Int16`과 같은 방식으로 저장됩니다.

텍스트 형식으로 읽을 때 ClickHouse는 값을 문자열로 구문 분석하고 Enum 값 집합에서 해당 문자열을 검색합니다. 찾을 수 없는 경우 예외가 발생합니다. 텍스트 형식으로 읽을 때 문자열이 읽히고 해당 숫자 값이 조회됩니다. 찾을 수 없으면 예외가 발생합니다.
텍스트 형식으로 쓸 때는 해당 문자열로 값을 씁니다. 컬럼 데이터에 유효하지 않은 집합에서 유래하지 않은 garbage(숫자)가 포함된 경우 예외가 발생합니다. 이진 형식으로 읽고 쓸 때는 Int8 및 Int16 데이터 유형에 대해 작동하는 방식과 동일합니다.
암묵적 기본값은 가장 낮은 숫자를 가진 값입니다.

`ORDER BY`, `GROUP BY`, `IN`, `DISTINCT` 등이 있는 경우 `Enum`은 해당 숫자와 동일하게 작동합니다. 예를 들어, `ORDER BY`는 숫자적으로 정렬합니다. 동등성 및 비교 연산자는 `Enum`에서 기본 숫자 값과 동일하게 작동합니다.

Enum 값은 숫자와 비교할 수 없습니다. Enum은 상수 문자열과 비교할 수 있습니다. 비교되는 문자열이 Enum의 유효한 값이 아닌 경우 예외가 발생합니다. IN 연산자는 왼쪽에 Enum이 있고 오른쪽에 문자열 집합이 있는 경우 지원됩니다. 문자열은 해당 Enum의 값입니다.

대부분의 숫자 및 문자열 연산은 Enum 값에 대해 정의되어 있지 않습니다. 예를 들어, Enum에 숫자를 더하거나 Enum에 문자열을 연결하는 것입니다.
그러나 Enum에는 문자열 값을 반환하는 자연스러운 `toString` 함수가 있습니다.

Enum 값은 `toT` 함수를 사용하여 숫자 유형으로 변환할 수 있으며, 여기서 T는 숫자 유형입니다. T가 Enum의 기본 숫자 유형에 해당하면 이 변환은 제로 비용으로 이루어집니다.
Enum 유형은 ALTER를 사용하여 비용 없이 변경할 수 있으며, 이 경우 값 집합만 변경하면 됩니다. ALTER를 사용하여 Enum의 구성원을 추가하거나 제거할 수 있습니다(제거는 제거된 값이 테이블에서 사용된 적이 없는 경우에만 안전합니다). 기존에 정의된 Enum 구성원의 숫자 값을 변경하면 예외가 발생합니다.

ALTER를 사용하여 Enum8을 Enum16으로 또는 그 반대로 변경할 수 있으며, Int8을 Int16으로 변경하는 것과 같습니다.
