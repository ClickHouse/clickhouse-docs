---
'alias': []
'description': 'ORC 형식에 대한 문서'
'input_format': true
'keywords':
- 'ORC'
'output_format': true
'slug': '/interfaces/formats/ORC'
'title': 'ORC'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

[Apache ORC](https://orc.apache.org/)는 [Hadoop](https://hadoop.apache.org/) 생태계에서 널리 사용되는 컬럼형 저장 포맷입니다.

## 데이터 타입 매칭 {#data-types-matching-orc}

아래 테이블은 지원되는 ORC 데이터 타입과 해당 ClickHouse [데이터 타입](/sql-reference/data-types/index.md)을 `INSERT` 및 `SELECT` 쿼리에서 비교합니다.

| ORC 데이터 타입 (`INSERT`)              | ClickHouse 데이터 타입                                                                                              | ORC 데이터 타입 (`SELECT`) |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------|--------------------------|
| `Boolean`                             | [UInt8](/sql-reference/data-types/int-uint.md)                                                            | `Boolean`                |
| `Tinyint`                             | [Int8/UInt8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)    | `Tinyint`                |
| `Smallint`                            | [Int16/UInt16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `Smallint`               |
| `Int`                                 | [Int32/UInt32](/sql-reference/data-types/int-uint.md)                                                     | `Int`                    |
| `Bigint`                              | [Int64/UInt32](/sql-reference/data-types/int-uint.md)                                                     | `Bigint`                 |
| `Float`                               | [Float32](/sql-reference/data-types/float.md)                                                             | `Float`                  |
| `Double`                              | [Float64](/sql-reference/data-types/float.md)                                                             | `Double`                 |
| `Decimal`                             | [Decimal](/sql-reference/data-types/decimal.md)                                                           | `Decimal`                |
| `Date`                                | [Date32](/sql-reference/data-types/date32.md)                                                             | `Date`                   |
| `Timestamp`                           | [DateTime64](/sql-reference/data-types/datetime64.md)                                                     | `Timestamp`              |
| `String`, `Char`, `Varchar`, `Binary` | [String](/sql-reference/data-types/string.md)                                                             | `Binary`                 |
| `List`                                | [Array](/sql-reference/data-types/array.md)                                                               | `List`                   |
| `Struct`                              | [Tuple](/sql-reference/data-types/tuple.md)                                                               | `Struct`                 |
| `Map`                                 | [Map](/sql-reference/data-types/map.md)                                                                   | `Map`                    |
| `Int`                                 | [IPv4](/sql-reference/data-types/int-uint.md)                                                             | `Int`                    |
| `Binary`                              | [IPv6](/sql-reference/data-types/ipv6.md)                                                                 | `Binary`                 |
| `Binary`                              | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                    | `Binary`                 |
| `Binary`                              | [Decimal256](/sql-reference/data-types/decimal.md)                                                        | `Binary`                 |

- 지원되지 않는 다른 타입은 없습니다.
- 배열은 중첩될 수 있으며, `Nullable` 타입의 값을 인수로 가질 수 있습니다. `Tuple` 및 `Map` 타입도 중첩될 수 있습니다.
- ClickHouse 테이블 컬럼의 데이터 타입은 해당 ORC 데이터 필드와 일치할 필요가 없습니다. 데이터를 삽입할 때 ClickHouse는 위의 테이블에 따라 데이터 타입을 해석한 후 [캐스트](/sql-reference/functions/type-conversion-functions#cast)하여 ClickHouse 테이블 컬럼에 설정된 데이터 타입으로 변환합니다.

## 예제 사용법 {#example-usage}

### 데이터 삽입 {#inserting-data}

다음 데이터를 포함한 ORC 파일 `football.orc` 를 사용합니다:

```text
    ┌───────date─┬─season─┬─home_team─────────────┬─away_team───────────┬─home_team_goals─┬─away_team_goals─┐
 1. │ 2022-04-30 │   2021 │ Sutton United         │ Bradford City       │               1 │               4 │
 2. │ 2022-04-30 │   2021 │ Swindon Town          │ Barrow              │               2 │               1 │
 3. │ 2022-04-30 │   2021 │ Tranmere Rovers       │ Oldham Athletic     │               2 │               0 │
 4. │ 2022-05-02 │   2021 │ Port Vale             │ Newport County      │               1 │               2 │
 5. │ 2022-05-02 │   2021 │ Salford City          │ Mansfield Town      │               2 │               2 │
 6. │ 2022-05-07 │   2021 │ Barrow                │ Northampton Town    │               1 │               3 │
 7. │ 2022-05-07 │   2021 │ Bradford City         │ Carlisle United     │               2 │               0 │
 8. │ 2022-05-07 │   2021 │ Bristol Rovers        │ Scunthorpe United   │               7 │               0 │
 9. │ 2022-05-07 │   2021 │ Exeter City           │ Port Vale           │               0 │               1 │
10. │ 2022-05-07 │   2021 │ Harrogate Town A.F.C. │ Sutton United       │               0 │               2 │
11. │ 2022-05-07 │   2021 │ Hartlepool United     │ Colchester United   │               0 │               2 │
12. │ 2022-05-07 │   2021 │ Leyton Orient         │ Tranmere Rovers     │               0 │               1 │
13. │ 2022-05-07 │   2021 │ Mansfield Town        │ Forest Green Rovers │               2 │               2 │
14. │ 2022-05-07 │   2021 │ Newport County        │ Rochdale            │               0 │               2 │
15. │ 2022-05-07 │   2021 │ Oldham Athletic       │ Crawley Town        │               3 │               3 │
16. │ 2022-05-07 │   2021 │ Stevenage Borough     │ Salford City        │               4 │               2 │
17. │ 2022-05-07 │   2021 │ Walsall               │ Swindon Town        │               0 │               3 │
    └────────────┴────────┴───────────────────────┴─────────────────────┴─────────────────┴─────────────────┘
```

데이터를 삽입합니다:

```sql
INSERT INTO football FROM INFILE 'football.orc' FORMAT ORC;
```

### 데이터 읽기 {#reading-data}

`ORC` 포맷을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
INTO OUTFILE 'football.orc'
FORMAT ORC
```

:::tip
ORC는 터미널에서 사람이 읽을 수 있는 형식으로 표시되지 않는 이진 포맷입니다. ORC 파일을 출력하려면 `INTO OUTFILE`을 사용하십시오.
:::

## 형식 설정 {#format-settings}

| 설정                                                                                                                                                                                                      | 설명                                                                            | 기본값 |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|---------|
| [`output_format_arrow_string_as_string`](/operations/settings/settings-formats.md/#output_format_arrow_string_as_string)                                                                             | 문자열 열에 대해 이진 대신 Arrow 문자열 형식을 사용합니다.                            | `false` |
| [`output_format_orc_compression_method`](/operations/settings/settings-formats.md/#output_format_orc_compression_method)                                                                             | 출력 ORC 형식에서 사용되는 압축 방법입니다. 기본값                            | `none`  |
| [`input_format_arrow_case_insensitive_column_matching`](/operations/settings/settings-formats.md/#input_format_arrow_case_insensitive_column_matching)                                               | ClickHouse 열과 Arrow 열 일치 시 대소문자를 무시합니다.                       | `false` |
| [`input_format_arrow_allow_missing_columns`](/operations/settings/settings-formats.md/#input_format_arrow_allow_missing_columns)                                                                     | Arrow 데이터를 읽을 때 누락된 열을 허용합니다.                                        | `false` |
| [`input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference) | Arrow 형식의 스키마 추론 중 지원되지 않는 타입의 열을 건너뛰도록 허용합니다. | `false` |

Hadoop과 데이터 교환을 위해 [HDFS 테이블 엔진](/engines/table-engines/integrations/hdfs.md)을 사용할 수 있습니다.
