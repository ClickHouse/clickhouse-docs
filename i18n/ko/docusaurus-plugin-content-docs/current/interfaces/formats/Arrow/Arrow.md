---
'alias': []
'description': 'Arrow 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'Arrow'
'output_format': true
'slug': '/interfaces/formats/Arrow'
'title': 'Arrow'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

[Apache Arrow](https://arrow.apache.org/)는 두 가지 기본 제공 컬럼형 저장 형식을 제공합니다. ClickHouse는 이러한 형식의 읽기 및 쓰기 작업을 지원합니다.
`Arrow`는 Apache Arrow의 "파일 모드" 형식입니다. 이 형식은 인메모리 랜덤 액세스를 위해 설계되었습니다.

## 데이터 유형 일치 {#data-types-matching}

아래 표는 지원되는 데이터 유형과 이들이 ClickHouse [데이터 유형](/sql-reference/data-types/index.md)와 `INSERT` 및 `SELECT` 쿼리에서 어떻게 일치하는지 보여줍니다.

| Arrow 데이터 유형 (`INSERT`)                | ClickHouse 데이터 유형                                                                                                | Arrow 데이터 유형 (`SELECT`) |
|-----------------------------------------|------------------------------------------------------------------------------------------------------------------|----------------------------|
| `BOOL`                                  | [Bool](/sql-reference/data-types/boolean.md)                                                       | `BOOL`                     |
| `UINT8`, `BOOL`                         | [UInt8](/sql-reference/data-types/int-uint.md)                                                     | `UINT8`                    |
| `INT8`                                  | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)   | `INT8`                     |
| `UINT16`                                | [UInt16](/sql-reference/data-types/int-uint.md)                                                    | `UINT16`                   |
| `INT16`                                 | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `INT16`                    |
| `UINT32`                                | [UInt32](/sql-reference/data-types/int-uint.md)                                                    | `UINT32`                   |
| `INT32`                                 | [Int32](/sql-reference/data-types/int-uint.md)                                                     | `INT32`                    |
| `UINT64`                                | [UInt64](/sql-reference/data-types/int-uint.md)                                                    | `UINT64`                   |
| `INT64`                                 | [Int64](/sql-reference/data-types/int-uint.md)                                                     | `INT64`                    |
| `FLOAT`, `HALF_FLOAT`                   | [Float32](/sql-reference/data-types/float.md)                                                      | `FLOAT32`                  |
| `DOUBLE`                                | [Float64](/sql-reference/data-types/float.md)                                                      | `FLOAT64`                  |
| `DATE32`                                | [Date32](/sql-reference/data-types/date32.md)                                                      | `UINT16`                   |
| `DATE64`                                | [DateTime](/sql-reference/data-types/datetime.md)                                                  | `UINT32`                   |
| `TIMESTAMP`, `TIME32`, `TIME64`         | [DateTime64](/sql-reference/data-types/datetime64.md)                                              | `TIMESTAMP`                |
| `STRING`, `BINARY`                      | [String](/sql-reference/data-types/string.md)                                                      | `BINARY`                   |
| `STRING`, `BINARY`, `FIXED_SIZE_BINARY` | [FixedString](/sql-reference/data-types/fixedstring.md)                                            | `FIXED_SIZE_BINARY`        |
| `DECIMAL`                               | [Decimal](/sql-reference/data-types/decimal.md)                                                    | `DECIMAL`                  |
| `DECIMAL256`                            | [Decimal256](/sql-reference/data-types/decimal.md)                                                 | `DECIMAL256`               |
| `LIST`                                  | [Array](/sql-reference/data-types/array.md)                                                        | `LIST`                     |
| `STRUCT`                                | [Tuple](/sql-reference/data-types/tuple.md)                                                        | `STRUCT`                   |
| `MAP`                                   | [Map](/sql-reference/data-types/map.md)                                                            | `MAP`                      |
| `UINT32`                                | [IPv4](/sql-reference/data-types/ipv4.md)                                                          | `UINT32`                   |
| `FIXED_SIZE_BINARY`, `BINARY`           | [IPv6](/sql-reference/data-types/ipv6.md)                                                          | `FIXED_SIZE_BINARY`        |
| `FIXED_SIZE_BINARY`, `BINARY`           | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                             | `FIXED_SIZE_BINARY`        |

배열은 중첩될 수 있으며, 인수로 `Nullable` 유형의 값을 가질 수 있습니다. `Tuple` 및 `Map` 유형 또한 중첩될 수 있습니다.

`DICTIONARY` 유형은 `INSERT` 쿼리에 대해 지원되며, `SELECT` 쿼리에는 [LowCardinality](/sql-reference/data-types/lowcardinality.md) 유형을 `DICTIONARY` 유형으로 출력할 수 있는 [`output_format_arrow_low_cardinality_as_dictionary`](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary) 설정이 있습니다.

지원되지 않는 Arrow 데이터 유형:
- `FIXED_SIZE_BINARY`
- `JSON`
- `UUID`
- `ENUM`.

ClickHouse 테이블 컬럼의 데이터 유형은 해당 Arrow 데이터 필드와 일치할 필요가 없습니다. 데이터를 삽입할 때 ClickHouse는 위의 표에 따라 데이터 유형을 해석하고, 다음에 [캐스트](/sql-reference/functions/type-conversion-functions#cast)하여 ClickHouse 테이블 컬럼에 설정된 데이터 유형으로 데이터를 변환합니다.

## 예제 사용 {#example-usage}

### 데이터 삽입 {#inserting-data}

다음 명령어를 사용하여 파일에서 ClickHouse 테이블로 Arrow 데이터를 삽입할 수 있습니다:

```bash
$ cat filename.arrow | clickhouse-client --query="INSERT INTO some_table FORMAT Arrow"
```

### 데이터 선택 {#selecting-data}

다음 명령어를 사용하여 ClickHouse 테이블에서 데이터를 선택하고 Arrow 형식으로 파일에 저장할 수 있습니다:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Arrow" > {filename.arrow}
```

## 형식 설정 {#format-settings}

| 설정                                                                                                                    | 설명                                                                                                  | 기본값       |
|--------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|--------------|
| `input_format_arrow_allow_missing_columns`                                                                               | Arrow 입력 형식을 읽을 때 누락된 컬럼을 허용합니다                                                     | `1`          |
| `input_format_arrow_case_insensitive_column_matching`                                                                    | Arrow 컬럼과 CH 컬럼이 일치할 때 대소문자를 무시합니다.                                              | `0`          |
| `input_format_arrow_import_nested`                                                                                       | 더 이상 사용되지 않는 설정이며 아무 작업도 수행하지 않습니다.                                          | `0`          |
| `input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`                                             | 형식 Arrow에 대한 스키마 추론 중에 지원되지 않는 유형을 가진 컬럼을 건너뜁니다                       | `0`          |
| `output_format_arrow_compression_method`                                                                                 | Arrow 출력 형식에 대한 압축 방법입니다. 지원되는 코덱: lz4_frame, zstd, none (비압축)                 | `lz4_frame`  |
| `output_format_arrow_fixed_string_as_fixed_byte_array`                                                                   | FixedString 컬럼에 대해 Binary 대신 Arrow FIXED_SIZE_BINARY 유형을 사용합니다.                       | `1`          |
| `output_format_arrow_low_cardinality_as_dictionary`                                                                      | LowCardinality 유형을 Dictionary Arrow 유형으로 출력하도록 설정합니다.                                 | `0`          |
| `output_format_arrow_string_as_string`                                                                                   | String 컬럼에 대해 Binary 대신 Arrow String 유형을 사용합니다.                                        | `1`          |
| `output_format_arrow_use_64_bit_indexes_for_dictionary`                                                                  | Arrow 형식의 딕셔너리 인덱스에 대해 항상 64비트 정수를 사용합니다.                                   | `0`          |
| `output_format_arrow_use_signed_indexes_for_dictionary`                                                                  | Arrow 형식의 딕셔너리 인덱스에 대해 부호 있는 정수를 사용합니다.                                      | `1`          |
