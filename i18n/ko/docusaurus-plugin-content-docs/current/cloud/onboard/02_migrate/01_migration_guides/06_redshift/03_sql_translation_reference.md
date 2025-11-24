---
'sidebar_label': 'SQL 번역 참조'
'slug': '/migrations/redshift/sql-translation-reference'
'description': '아마존 레드시프트에서 ClickHouse로의 SQL 번역 참조'
'keywords':
- 'Redshift'
'title': '아마존 레드시프트 SQL 번역 가이드'
'doc_type': 'reference'
---


# Amazon Redshift SQL 번역 가이드

## 데이터 유형 {#data-types}

ClickHouse와 Redshift 간에 데이터를 이동하는 사용자는 즉시 ClickHouse가 제공하는 더 포괄적인 유형 범위가 있으며, 이는 또한 덜 제한적이라는 것을 알게 됩니다. Redshift는 사용자에게 문자열 길이를 지정할 것을 요구하지만, ClickHouse는 문자열을 바이트로 인코딩하지 않고 저장함으로써 이러한 제한과 부담을 사용자에게서 제거합니다. 따라서 ClickHouse 문자열 유형은 제한이나 길이 지정 요건이 없습니다.

게다가 사용자는 Redshift에서 첫 번째 클래스 시민으로 제공되지 않는 배열, 튜플 및 열거형을 활용할 수 있습니다(배열/구조체는 `SUPER`로 모방할 수 있음) 이는 사용자에게 일반적인 불만 사항입니다. ClickHouse는 또한 쿼리 시간이나 심지어 테이블 내에서 집계 상태의 지속성을 허용합니다. 이를 통해 데이터는 물리화된 뷰를 사용하여 미리 집계될 수 있으며, 일반적인 쿼리의 쿼리 성능을 크게 향상시킬 수 있습니다.

아래는 각 Redshift 유형에 대한 ClickHouse의 동등한 유형을 나열합니다:

| Redshift                                                                                                                           | ClickHouse                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`SMALLINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                | [`Int8`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                                                                                                                                                                                       |
| [`INTEGER`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                 | [`Int32`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                                                                                                                                                                                      |
| [`BIGINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                  | [`Int64`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                                                                                                                                                                                      |
| [`DECIMAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-decimal-or-numeric-type)       | [`UInt128`, `UInt256`, `Int128`, `Int256`](/sql-reference/data-types/int-uint), [`Decimal(P, S)`, `Decimal32(S)`, `Decimal64(S)`, `Decimal128(S)`, `Decimal256(S)`](/sql-reference/data-types/decimal) - (높은 정밀도 및 가능한 범위)                                                                                                                                                           |
| [`REAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types)             | [`Float32`](/sql-reference/data-types/float)                                                                                                                                                                                                                                                                                                                                                                         |
| [`DOUBLE PRECISION`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types) | [`Float64`](/sql-reference/data-types/float)                                                                                                                                                                                                                                                                                                                                                                         |
| [`BOOLEAN`](https://docs.aws.amazon.com/redshift/latest/dg/r_Boolean_type.html)                                                      | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                                                                                                                                                                                                                                                                          |
| [`CHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-char-or-character)                  | [`String`](/sql-reference/data-types/string), [`FixedString`](/sql-reference/data-types/fixedstring)                                                                                                                                                                                                                                                                                     |
| [`VARCHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-varchar-or-character-varying) ** | [`String`](/sql-reference/data-types/string)                                                                                                                                                                                                                                                                                                                                                                         |
| [`DATE`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-date)                                 | [`Date32`](/sql-reference/data-types/date32)                                                                                                                                                                                                                                                                                                                                                                         |
| [`TIMESTAMP`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamp)                       | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                                                                                                                                                   |
| [`TIMESTAMPTZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamptz)                   | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                                                                                                                                                   |
| [`GEOMETRY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                                | [Geo 데이터 유형](/sql-reference/data-types/geo)                                                                                                                                                                                                                                                                                                                                                                    |
| [`GEOGRAPHY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                               | [Geo 데이터 유형](/sql-reference/data-types/geo) (덜 개발됨, 예: 좌표계 없음 - [함수와 함께](/sql-reference/functions/geo/) 에뮬레이션 가능)                                                                                                                                                                                                                          |
| [`HLLSKETCH`](https://docs.aws.amazon.com/redshift/latest/dg/r_HLLSKTECH_type.html)                                                  | [`AggregateFunction(uniqHLL12, X)`](/sql-reference/data-types/aggregatefunction)                                                                                                                                                                                                                                                                                                                                     |
| [`SUPER`](https://docs.aws.amazon.com/redshift/latest/dg/r_SUPER_type.html)                                                          | [`Tuple`](/sql-reference/data-types/tuple), [`Nested`](/sql-reference/data-types/nested-data-structures/nested), [`Array`](/sql-reference/data-types/array), [`JSON`](/sql-reference/data-types/newjson), [`Map`](/sql-reference/data-types/map) |
| [`TIME`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-time)                                 | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                                                                                                                                                   |
| [`TIMETZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timetz)                             | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                                                                                                                                                   |
| [`VARBYTE`](https://docs.aws.amazon.com/redshift/latest/dg/r_VARBYTE_type.html) **                                                   | [`String`](/sql-reference/data-types/string)과 [`Bit`](/sql-reference/functions/bit-functions) 및 [인코딩](/sql-reference/functions/encoding-functions/#hex) 함수의 조합                                                                                                                                                                      |

<sub><span>*</span> ClickHouse는 추가로 확장된 범위를 가진 부호 없는 정수도 지원합니다. 즉, <a href='http://clickhouse.com/docs/sql-reference/data-types/int-uint'>`UInt8`, `UInt32`, `UInt32` 및 `UInt64`</a>입니다.</sub><br />
<sub><span>**</span>ClickHouse의 문자열 유형은 기본적으로 무제한이지만 <a href='http://clickhouse.com/docs/sql-reference/statements/create/table#constraints'>제약조건</a>을 사용하여 특정 길이로 제약할 수 있습니다.</sub>

## DDL 구문 {#compression}

### 정렬 키 {#sorting-keys}

ClickHouse와 Redshift 모두 "정렬 키" 개념을 가지고 있으며, 이는 데이터가 저장될 때 어떻게 정렬되는지를 정의합니다. Redshift는 `SORTKEY` 절을 사용하여 정렬 키를 정의합니다:

```sql
CREATE TABLE some_table(...) SORTKEY (column1, column2)
```

비교적으로, ClickHouse는 `ORDER BY` 절을 사용하여 정렬 순서를 지정합니다:

```sql
CREATE TABLE some_table(...) ENGINE = MergeTree ORDER BY (column1, column2)
```

대부분의 경우, 디폴트 `COMPOUND` 유형을 사용하는 경우 ClickHouse에서 같은 정렬 키 컬럼과 순서를 사용할 수 있습니다. Redshift에 데이터가 추가되면 `VACUUM` 및 `ANALYZE` 명령을 실행하여 새로 추가된 데이터를 재정렬하고 쿼리 플래너의 통계를 업데이트해야 합니다 - 그렇지 않으면 정렬되지 않은 공간이 증가합니다. ClickHouse는 이러한 과정이 필요하지 않습니다.

Redshift는 정렬 키에 대한 몇 가지 편리한 기능을 지원합니다. 첫 번째는 자동 정렬 키(`SORTKEY AUTO`)입니다. 이것은 시작하는 데 적합할 수 있지만, 명시적인 정렬 키는 최적의 정렬 키를 사용할 때 최고의 성능과 저장 효율성을 보장합니다. 두 번째는 `INTERLEAVED` 정렬 키로, 쿼리가 하나 이상의 보조 정렬 컬럼을 사용할 때 성능을 향상시키기 위해 정렬 키의 서브셋에 동일한 가중치를 부여합니다. ClickHouse는 [프로젝션](/data-modeling/projections)을 지원하며, 이는 약간 다른 설정으로 동일한 결과를 달성합니다.

사용자는 "기본 키" 개념이 ClickHouse와 Redshift에서 다르게 나타난다는 것을 인식해야 합니다. Redshift에서 기본 키는 제약 조건을 시행하기 위해 의도된 전통적인 RDMS 개념을 닮고 있지만, Redshift에서는 엄격하게 시행되지 않고 쿼리 플래너와 데이터 분배에 대한 힌트 역할을 합니다. ClickHouse에서 기본 키는 행이 디스크에서 정렬되도록 사용되는 열을 나타내며, 압축을 극대화하면서 기본 인덱스의 오염을 방지하고 메모리 낭비를 줄입니다.
