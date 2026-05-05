---
sidebar_label: 'SQL 변환 참고 자료'
slug: /migrations/snowflake-translation-reference
description: 'SQL 변환 참고 자료'
keywords: ['Snowflake']
title: 'Snowflake에서 ClickHouse로 마이그레이션하기'
show_related_blogs: true
doc_type: 'guide'
---

# Snowflake SQL 변환 가이드 \{#snowflake-sql-translation-guide\}

## 데이터 형식 \{#data-types\}

### Numerics \{#numerics\}

ClickHouse와 Snowflake 사이에서 데이터를 이동하는 사용자는 숫자형을 선언하는 방식에서 
ClickHouse가 더 세밀한 정밀도 제어를 제공한다는 점을 바로 인지하게 됩니다. 예를 들어,
Snowflake는 숫자형에 대해 `Number` 타입을 제공합니다. 이는 사용자가 전체 자릿수(precision)와 
소수점 이하 자릿수(scale)를 합해 최대 38자리까지 지정하도록 요구합니다. 정수형 선언은 `Number`와 
동일하게 취급되며, 범위가 같은 고정 precision 및 scale을 정의할 뿐입니다. 이러한 편의성은 Snowflake에서 
precision을 변경해도(정수의 경우 scale은 0) 디스크 상 데이터 크기에 영향을 주지 않기 때문에 가능합니다. 
필요한 최소 바이트 수가 마이크로 파티션 수준에서, 기록 시점의 숫자 범위에 따라 사용됩니다. 
다만 scale은 저장 공간에 영향을 주며, 압축을 통해 그 영향이 상쇄됩니다. `Float64` 타입은 정밀도를 일부 
희생하는 대신 더 넓은 값 범위를 제공합니다.

이에 비해 ClickHouse는 부동소수점과 정수에 대해 여러 크기의 부호 있는(signed) 및 부호 없는(unsigned) 
타입을 제공합니다. 이를 통해 정수에 필요한 정밀도를 명시적으로 지정하여 저장소 및 메모리 
오버헤드를 최적화할 수 있습니다. Snowflake의 `Number` 타입과 동등한 Decimal 타입은 최대 76자리까지 
Snowflake보다 두 배의 precision과 scale을 제공합니다. 이와 더불어 유사한 `Float64` 타입 외에도, 
ClickHouse는 정밀도가 그리 중요하지 않고 압축이 더 중요한 경우를 위해 `Float32` 타입도 제공합니다.

### Strings \{#strings\}

ClickHouse와 Snowflake는 문자열 데이터 저장 방식에 대해 상반된 접근 방식을 취합니다. Snowflake의 `VARCHAR`는 UTF-8 유니코드 문자를 저장하며, 사용자가 최대 길이를 지정할 수 있습니다. 이 길이는 저장 공간이나 성능에는 영향을 주지 않으며, 문자열 저장 시 항상 최소 바이트 수만 사용되고, 주로 이후에 사용하는 도구들에 유용한 제약 조건만을 제공합니다. `Text` 및 `NChar`와 같은 다른 타입은 이 타입의 단순한 별칭입니다. 반대로 ClickHouse는 모든 [문자열 데이터를 원시 바이트(raw bytes)로](/sql-reference/data-types/string) `String` 타입(길이 지정 불필요)에 저장하며, 인코딩은 사용자에게 위임합니다. 서로 다른 인코딩에 대해서는 [쿼리 시점에 사용할 수 있는 함수](/sql-reference/functions/string-functions#lengthUTF8)를 제공합니다. 이에 대한 동기는 ["Opaque data argument"](https://utf8everywhere.org/#cookie)를 참고하십시오. 따라서 ClickHouse의 `String`은 구현 관점에서 Snowflake의 Binary 타입에 더 가깝습니다. [Snowflake](https://docs.snowflake.com/en/sql-reference/collation)와 [ClickHouse](/sql-reference/statements/select/order-by#collation-support)는 모두 사용자가 문자열의 정렬 및 비교 방식을 재정의할 수 있도록 하는 「collation」을 지원합니다.

### 반정형 타입 \{#semi-structured-data\}

Snowflake는 반정형 데이터를 위해 `VARIANT`, `OBJECT`, `ARRAY` 타입을 지원합니다.

ClickHouse는 이에 상응하는 [`Variant`](/sql-reference/data-types/variant),
네이티브 `JSON` 타입으로 대체되어 현재는 사용이 중단(deprecated)된 `Object` 및 [`Array`](/sql-reference/data-types/array)
타입을 제공합니다. 추가로 ClickHouse에는 이제 사용이 중단된 `Object('json')` 타입을 대체하며,
[다른 네이티브 JSON 타입과 비교했을 때](https://jsonbench.com/) 특히 성능과 저장 효율이 뛰어난
[`JSON`](/sql-reference/data-types/newjson) 타입이 있습니다.

ClickHouse는 또한 명명된 [`Tuple`](/sql-reference/data-types/tuple) 및
[`Nested`](/sql-reference/data-types/nested-data-structures/nested) 타입을 통한 Tuple 배열을
지원하여, 사용자가 중첩 구조를 명시적으로 매핑할 수 있도록 합니다. 이를 통해 Snowflake와 달리
계층 전체에 코덱과 타입 최적화를 적용할 수 있습니다. Snowflake에서는 최상위 객체에 대해
`OBJECT`, `VARIANT`, `ARRAY` 타입을 사용해야 하며
[명시적인 내부 타입 지정](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#characteristics-of-an-object)을
허용하지 않습니다. 이러한 내부 타입 지정 덕분에 ClickHouse에서는 중첩된 숫자형에 대한 쿼리가
단순해지며, 캐스팅이 필요 없고 인덱스 정의에도 그대로 사용할 수 있습니다.

ClickHouse에서는 하위 구조에도 코덱과 최적화된 타입을 적용할 수 있습니다.
이로 인해 중첩 구조에서도 압축 효율이 평탄화된(flattened) 데이터에 필적할 정도로 우수하게
유지된다는 추가적인 이점이 있습니다. 반면, 하위 구조에 특정 타입을 적용할 수 없기 때문에
Snowflake는 [최적의 압축을 위해 중첩 구조를 평탄화할 것](https://docs.snowflake.com/en/user-guide/semistructured-considerations#storing-semi-structured-data-in-a-variant-column-vs-flattening-the-nested-structure)을
권장합니다. Snowflake는 또한 이러한 데이터 타입에 대해
[크기 제한을 부과](https://docs.snowflake.com/en/user-guide/semistructured-considerations#data-size-limitations)
합니다.

### 데이터 타입 참조 \{#type-reference\}

| Snowflake                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ClickHouse                                                                                                                                 | 비고                                                                                                                                                                                                                                                               |   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | - |
| [`NUMBER`](https://docs.snowflake.com/en/sql-reference/data-types-numeric)                                                                                                                                                                                                                                                                                                                                                                                                      | [`Decimal`](/sql-reference/data-types/decimal)                                                                                             | ClickHouse는 Snowflake보다 두 배 더 높은 정밀도와 스케일을 제공합니다. 즉, 38자리가 아니라 최대 76자리까지 가능합니다.                                                                                                                                                                                  |   |
| [`FLOAT`, `FLOAT4`, `FLOAT8`](https://docs.snowflake.com/en/sql-reference/data-types-numeric#data-types-for-floating-point-numbers)                                                                                                                                                                                                                                                                                                                                             | [`Float32`, `Float64`](/sql-reference/data-types/float)                                                                                    | Snowflake의 모든 부동 소수점 숫자는 64비트입니다.                                                                                                                                                                                                                                |   |
| [`VARCHAR`](https://docs.snowflake.com/en/sql-reference/data-types-text#varchar)                                                                                                                                                                                                                                                                                                                                                                                                | [`String`](/sql-reference/data-types/string)                                                                                               |                                                                                                                                                                                                                                                                  |   |
| [`BINARY`](https://docs.snowflake.com/en/sql-reference/data-types-text#binary)                                                                                                                                                                                                                                                                                                                                                                                                  | [`String`](/sql-reference/data-types/string)                                                                                               |                                                                                                                                                                                                                                                                  |   |
| [`BOOLEAN`](https://docs.snowflake.com/en/sql-reference/data-types-logical)                                                                                                                                                                                                                                                                                                                                                                                                     | [`Bool`](/sql-reference/data-types/boolean)                                                                                                |                                                                                                                                                                                                                                                                  |   |
| [`DATE`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#date)                                                                                                                                                                                                                                                                                                                                                                                                  | [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32)                                                     | Snowflake의 `DATE`는 ClickHouse보다 더 큰 날짜 범위를 지원합니다. 예를 들어 ClickHouse에서 `Date32`의 최소값은 `1900-01-01`이고 `Date`는 `1970-01-01`입니다. ClickHouse의 `Date`는 더 비용 효율적인 2바이트 저장 공간을 사용합니다.                                                                                     |   |
| [`TIME(N)`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#time)                                                                                                                                                                                                                                                                                                                                                                                               | 직접적으로 대응되는 타입은 없지만 [`DateTime`](/sql-reference/data-types/datetime) 및 [`DateTime64(N)`](/sql-reference/data-types/datetime64)로 표현할 수 있습니다. | `DateTime64`의 정밀도 개념은 동일합니다.                                                                                                                                                                                                                                     |   |
| [`TIMESTAMP`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp) - [`TIMESTAMP_LTZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz), [`TIMESTAMP_NTZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz), [`TIMESTAMP_TZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz) | [`DateTime`](/sql-reference/data-types/datetime) 및 [`DateTime64`](/sql-reference/data-types/datetime64)                                    | `DateTime` 및 `DateTime64`에는 선택적으로 컬럼에 대해 TZ 매개변수를 정의할 수 있습니다. 정의되지 않은 경우 서버의 시간대가 사용됩니다. 또한 클라이언트에서는 `--use_client_time_zone` 매개변수를 사용할 수 있습니다.                                                                                                                  |   |
| [`VARIANT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#variant)                                                                                                                                                                                                                                                                                                                                                                                      | [`JSON`, `Tuple`, `Nested`](/interfaces/formats)                                                                                           | `JSON` 타입은 ClickHouse에서 실험적인 타입입니다. 이 타입은 데이터 삽입 시점에 컬럼 타입을 추론합니다. 대안으로 `Tuple`, `Nested`, `Array`를 사용해 명시적으로 타입이 정의된 구조를 구성할 수도 있습니다.                                                                                                                           |   |
| [`OBJECT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#object)                                                                                                                                                                                                                                                                                                                                                                                        | [`Tuple`, `Map`, `JSON`](/interfaces/formats)                                                                                              | `OBJECT`와 `Map` 모두 키 타입이 `String`인 경우 ClickHouse의 `JSON` 타입과 유사합니다. ClickHouse에서는 값이 일관되고 강하게 타입이 지정되어야 하지만 Snowflake는 `VARIANT`를 사용합니다. 이는 서로 다른 키의 값이 서로 다른 타입이 될 수 있음을 의미합니다. ClickHouse에서 이와 같은 동작이 필요하다면 `Tuple`을 사용해 계층 구조를 명시적으로 정의하거나 `JSON` 타입에 의존하십시오. |   |
| [`ARRAY`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#array)                                                                                                                                                                                                                                                                                                                                                                                          | [`Array`](/sql-reference/data-types/array), [`Nested`](/sql-reference/data-types/nested-data-structures/nested)                            | Snowflake의 `ARRAY`는 요소에 상위 타입인 `VARIANT`를 사용합니다. 반면 ClickHouse에서는 요소의 타입이 엄격하게 지정됩니다.                                                                                                                                                                            |   |
| [`GEOGRAPHY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geography-data-type)                                                                                                                                                                                                                                                                                                                                                                            | [`Point`, `Ring`, `Polygon`, `MultiPolygon`](/sql-reference/data-types/geo)                                                                | Snowflake는 좌표계(WGS 84)를 미리 지정하지만, ClickHouse는 쿼리 시점에 지정합니다.                                                                                                                                                                                                      |   |
| [`GEOMETRY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geometry-data-type)                                                                                                                                                                                                                                                                                                                                                                              | [`Point`, `Ring`, `Polygon`, `MultiPolygon`](/sql-reference/data-types/geo)                                                                |                                                                                                                                                                                                                                                                  |   |

| ClickHouse Type   | Description                                                                                         |
|-------------------|-----------------------------------------------------------------------------------------------------|
| `IPv4` and `IPv6` | IP 주소 전용 타입으로, Snowflake보다 더 효율적인 저장이 가능할 수 있습니다.                           |
| `FixedString`     | 고정 길이의 바이트를 사용할 수 있어, 해시 값 저장에 유용합니다.                                       |
| `LowCardinality`  | 모든 타입을 딕셔너리 인코딩할 수 있습니다. 카디널리티가 10만 미만으로 예상될 때 유용합니다.           |
| `Enum`            | 이름이 있는 값들을 8비트 또는 16비트 범위로 효율적으로 인코딩할 수 있습니다.                          |
| `UUID`            | UUID를 효율적으로 저장하기 위한 타입입니다.                                                          |
| `Array(Float32)`  | 벡터를 `Float32`의 `Array`로 표현할 수 있으며, 거리 함수도 지원합니다.                               |

마지막으로, ClickHouse는 집계 함수의 중간
[상태](/sql-reference/data-types/aggregatefunction)를 저장할 수 있는 고유한 기능을 제공합니다. 이
상태는 구현에 따라 다르지만, 집계 결과를 저장해 두었다가 이후에 이에 대응하는 merge 함수를 사용해
조회할 수 있도록 합니다. 일반적으로 이 기능은 구체화된 뷰(Materialized View)를 통해 사용되며, 아래 예시와 같이 삽입된
데이터에 대한 쿼리의 증가분 결과를 저장함으로써 최소한의 저장 비용으로 특정 쿼리의 성능을 향상시키는
기능을 제공합니다(자세한 내용은 여기에서 확인할 수 있습니다).