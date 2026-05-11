---
sidebar_label: 'SQL 변환 참조'
slug: /migrations/redshift/sql-translation-reference
description: 'Amazon Redshift에서 ClickHouse로의 SQL 변환 참조'
keywords: ['Redshift']
title: 'Amazon Redshift SQL 변환 가이드'
doc_type: 'reference'
---

# Amazon Redshift SQL 변환 가이드 \{#amazon-redshift-sql-translation-guide\}

## Data types \{#data-types\}

ClickHouse와 Redshift 간에 데이터를 이동하는 사용자는
ClickHouse가 더 다양한 데이터 타입을, 그것도 훨씬 덜 제한적인 형태로
제공한다는 점을 바로 알 수 있습니다. Redshift에서는 가변 길이인 경우에도
가능한 문자열 길이를 지정해야 하지만, ClickHouse는 문자열을 인코딩 없이
바이트로 저장함으로써 이러한 제약과 부담을 사용자로부터 제거합니다.
따라서 ClickHouse의 `String` 타입은 길이 제한이나 길이 지정 요구 사항이
없습니다.

또한 Redshift에는 1급 객체로 존재하지 않는 Arrays, Tuples, Enums
(비록 Arrays/Structs는 `SUPER`로 모방할 수 있지만) 타입을
적극적으로 활용할 수 있으며, 이는 사용자에게 흔한 불만 사항 중 하나입니다.
추가로 ClickHouse는 집계 상태를 쿼리 시점은 물론 테이블에까지
영속적으로 저장할 수 있습니다. 이를 통해 데이터를 사전 집계할 수 있으며,
이는 일반적으로 구체화된 뷰(Materialized View)를 사용해 수행되며,
자주 실행되는 쿼리의 성능을 극적으로 향상시킬 수 있습니다.

아래에서는 각 Redshift 타입에 대응하는 ClickHouse 타입을 정리합니다.

| Redshift                                                                                                                             | ClickHouse                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`SMALLINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                | [`Int8`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                   |
| [`INTEGER`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                 | [`Int32`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                  |
| [`BIGINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                  | [`Int64`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                  |
| [`DECIMAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-decimal-or-numeric-type)       | [`UInt128`, `UInt256`, `Int128`, `Int256`](/sql-reference/data-types/int-uint), [`Decimal(P, S)`, `Decimal32(S)`, `Decimal64(S)`, `Decimal128(S)`, `Decimal256(S)`](/sql-reference/data-types/decimal) - (높은 정밀도와 넓은 값 범위를 지원함)                  |
| [`REAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types)             | [`Float32`](/sql-reference/data-types/float)                                                                                                                                                                                                     |
| [`DOUBLE PRECISION`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types) | [`Float64`](/sql-reference/data-types/float)                                                                                                                                                                                                     |
| [`BOOLEAN`](https://docs.aws.amazon.com/redshift/latest/dg/r_Boolean_type.html)                                                      | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                                                                                                      |
| [`CHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-char-or-character)                  | [`String`](/sql-reference/data-types/string), [`FixedString`](/sql-reference/data-types/fixedstring)                                                                                                                                             |
| [`VARCHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-varchar-or-character-varying) ** | [`String`](/sql-reference/data-types/string)                                                                                                                                                                                                     |
| [`DATE`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-date)                                 | [`Date32`](/sql-reference/data-types/date32)                                                                                                                                                                                                     |
| [`TIMESTAMP`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamp)                       | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`TIMESTAMPTZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamptz)                   | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`GEOMETRY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                                | [지리 공간 데이터 타입](/sql-reference/data-types/geo)                                                                                                                                                                                                    |
| [`GEOGRAPHY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                               | [Geo 데이터 타입](/sql-reference/data-types/geo) (기능이 덜 개발되어 있음. 예: 좌표계 미지원 - [함수](/sql-reference/functions/geo/)로 에뮬레이션 가능)                                                                                                                          |
| [`HLLSKETCH`](https://docs.aws.amazon.com/redshift/latest/dg/r_HLLSKTECH_type.html)                                                  | [`AggregateFunction(uniqHLL12, X)`](/sql-reference/data-types/aggregatefunction)                                                                                                                                                                 |
| [`SUPER`](https://docs.aws.amazon.com/redshift/latest/dg/r_SUPER_type.html)                                                          | [`Tuple`](/sql-reference/data-types/tuple), [`Nested`](/sql-reference/data-types/nested-data-structures/nested), [`Array`](/sql-reference/data-types/array), [`JSON`](/sql-reference/data-types/newjson), [`Map`](/sql-reference/data-types/map) |
| [`TIME`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-time)                                 | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`TIMETZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timetz)                             | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`VARBYTE`](https://docs.aws.amazon.com/redshift/latest/dg/r_VARBYTE_type.html) **                                                   | [`String`](/sql-reference/data-types/string)을 [`Bit`](/sql-reference/functions/bit-functions) 및 [인코딩](/sql-reference/functions/encoding-functions/#hex) 함수와 조합하여 사용                                                                              |

<sub><span>*</span> ClickHouse는 추가로 더 넓은 범위의 부호 없는 정수형, 즉 <a href='http://clickhouse.com/docs/sql-reference/data-types/int-uint'>`UInt8`, `UInt32`, `UInt32`, `UInt64`</a>를 지원합니다.</sub><br />
<sub><span>**</span>ClickHouse의 String 타입은 기본적으로 길이에 제한이 없지만, <a href='http://clickhouse.com/docs/sql-reference/statements/create/table#constraints'>제약 조건(Constraints)</a>을 사용하여 특정 길이로 제한할 수 있습니다.</sub>

## DDL 구문 \{#compression\}

### 정렬 키 \{#sorting-keys\}

ClickHouse와 Redshift 모두 데이터가 저장될 때 어떻게 정렬되는지를 정의하는 「정렬 키」 개념이 있습니다. Redshift는 `SORTKEY` 절을 사용하여 정렬 키를 정의합니다:

```sql
CREATE TABLE some_table(...) SORTKEY (column1, column2)
```

이에 비해 ClickHouse는 정렬 순서를 지정하기 위해 `ORDER BY` 절을 사용합니다.

```sql
CREATE TABLE some_table(...) ENGINE = MergeTree ORDER BY (column1, column2)
```

대부분의 경우, 기본 `COMPOUND` 타입을 사용한다고 가정하면 ClickHouse에서
Redshift와 동일한 정렬 키 컬럼과 순서를 사용할 수 있습니다. Redshift에
데이터가 추가되면, 새로 추가된 데이터를 다시 정렬하고 쿼리 플래너를 위한
통계를 갱신하기 위해 `VACUUM` 및 `ANALYZE` 명령을 실행해야 합니다. 그렇지 않으면
정렬되지 않은 공간이 증가합니다. ClickHouse에서는 이러한 과정이 필요하지 않습니다.

Redshift는 정렬 키를 위한 몇 가지 편의 기능을 지원합니다. 첫 번째는
자동 정렬 키(`SORTKEY AUTO` 사용)입니다. 초기 도입 단계에서는 적절할 수 있지만,
정렬 키가 최적으로 설계된 경우 명시적인 정렬 키를 사용하는 것이
최상의 성능과 저장 효율성을 보장합니다. 두 번째는 `INTERLEAVED` 정렬 키로,
정렬 키에 포함된 일부 컬럼에 동일한 가중치를 부여하여,
쿼리가 하나 이상의 보조 정렬 컬럼을 사용할 때 성능을 향상합니다. ClickHouse는
동일한 결과를 약간 다른 설정 방식으로 달성하는
명시적인 [프로젝션](/data-modeling/projections)을 지원합니다.

「기본 키(primary key)」 개념이 ClickHouse와 Redshift에서 서로 다른 의미를 가진다는
점에 유의해야 합니다. Redshift에서 기본 키는 제약 조건을 강제하기 위한 전통적인
RDBMS 개념과 유사합니다. 하지만 Redshift에서는 엄격하게 강제되지 않으며,
대신 쿼리 플래너와 노드 간 데이터 분배를 위한 힌트 역할을 합니다. ClickHouse에서
기본 키는 희소 기본 인덱스(sparse primary index)를 구성하는 데 사용되는 컬럼을
나타내며, 이는 디스크에서 데이터가 정렬되도록 보장하여 압축률을 극대화하는
동시에 기본 인덱스의 오염을 방지하고 메모리 낭비를 줄이는 역할을 합니다.
