---
'alias': []
'description': 'Parquet 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'Parquet'
'output_format': true
'slug': '/interfaces/formats/Parquet'
'title': 'Parquet'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

[Apache Parquet](https://parquet.apache.org/)는 Hadoop 생태계에서 널리 사용되는 컬럼형 저장 형식입니다. ClickHouse는 이 형식에 대한 읽기 및 쓰기 작업을 지원합니다.

## Data types matching {#data-types-matching-parquet}

아래 표는 Parquet 데이터 타입이 ClickHouse [데이터 타입](/sql-reference/data-types/index.md)에 어떻게 일치되는지 보여줍니다.

| Parquet type (logical, converted, or physical) | ClickHouse data type |
|------------------------------------------------|----------------------|
| `BOOLEAN` | [Bool](/sql-reference/data-types/boolean.md) |
| `UINT_8` | [UInt8](/sql-reference/data-types/int-uint.md) |
| `INT_8` | [Int8](/sql-reference/data-types/int-uint.md) |
| `UINT_16` | [UInt16](/sql-reference/data-types/int-uint.md) |
| `INT_16` | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) |
| `UINT_32` | [UInt32](/sql-reference/data-types/int-uint.md) |
| `INT_32` | [Int32](/sql-reference/data-types/int-uint.md) |
| `UINT_64` | [UInt64](/sql-reference/data-types/int-uint.md) |
| `INT_64` | [Int64](/sql-reference/data-types/int-uint.md) |
| `DATE` | [Date32](/sql-reference/data-types/date.md) |
| `TIMESTAMP`, `TIME` | [DateTime64](/sql-reference/data-types/datetime64.md) |
| `FLOAT` | [Float32](/sql-reference/data-types/float.md) |
| `DOUBLE` | [Float64](/sql-reference/data-types/float.md) |
| `INT96` | [DateTime64(9, 'UTC')](/sql-reference/data-types/datetime64.md) |
| `BYTE_ARRAY`, `UTF8`, `ENUM`, `BSON` | [String](/sql-reference/data-types/string.md) |
| `JSON` | [JSON](/sql-reference/data-types/newjson.md) |
| `FIXED_LEN_BYTE_ARRAY` | [FixedString](/sql-reference/data-types/fixedstring.md) |
| `DECIMAL` | [Decimal](/sql-reference/data-types/decimal.md) |
| `LIST` | [Array](/sql-reference/data-types/array.md) |
| `MAP` | [Map](/sql-reference/data-types/map.md) |
| struct | [Tuple](/sql-reference/data-types/tuple.md) |
| `FLOAT16` | [Float32](/sql-reference/data-types/float.md) |
| `UUID` | [FixedString(16)](/sql-reference/data-types/fixedstring.md) |
| `INTERVAL` | [FixedString(12)](/sql-reference/data-types/fixedstring.md) |

Parquet 파일을 작성할 때, 일치하는 Parquet 타입이 없는 데이터 타입은 가장 가까운 가용 타입으로 변환됩니다:

| ClickHouse data type | Parquet type |
|----------------------|--------------|
| [IPv4](/sql-reference/data-types/ipv4.md) | `UINT_32` |
| [IPv6](/sql-reference/data-types/ipv6.md) | `FIXED_LEN_BYTE_ARRAY` (16 bytes) |
| [Date](/sql-reference/data-types/date.md) (16 bits) | `DATE` (32 bits) |
| [DateTime](/sql-reference/data-types/datetime.md) (32 bits, seconds) | `TIMESTAMP` (64 bits, milliseconds) |
| [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md) | `FIXED_LEN_BYTE_ARRAY` (16/32 bytes, little-endian) |

배열은 중첩될 수 있으며 `Nullable` 타입의 값을 인자로 가질 수 있습니다. `Tuple` 및 `Map` 타입도 중첩될 수 있습니다.

ClickHouse 테이블 컬럼의 데이터 타입은 삽입된 Parquet 데이터의 해당 필드와 다를 수 있습니다. 데이터를 삽입할 때 ClickHouse는 위 표에 따라 데이터 타입을 해석하고, 그런 다음 [cast](/sql-reference/functions/type-conversion-functions#cast)하여 ClickHouse 테이블 컬럼에 설정된 데이터 타입으로 변환합니다. 예를 들어, `UINT_32` Parquet 컬럼은 [IPv4](/sql-reference/data-types/ipv4.md) ClickHouse 컬럼으로 읽을 수 있습니다.

일부 Parquet 타입은 Closely matching ClickHouse 타입이 없습니다. 다음과 같이 읽습니다:
* `TIME` (하루의 시간)은 타임스탬프로 읽습니다. 예: `10:23:13.000`는 `1970-01-01 10:23:13.000`이 됩니다.
* `TIMESTAMP`/`TIME`이 `isAdjustedToUTC=false`인 경우, 이는 로컬 벽시계 시간입니다 (연도, 월, 일, 시, 분, 초 및 서브초 필드가 특정 시간대에 관계없이 지역 시간대에서 사용됨), SQL의 `TIMESTAMP WITHOUT TIME ZONE`과 동일합니다. ClickHouse는 이것을 UTC 타임스탬프로 읽습니다. 예: `2025-09-29 18:42:13.000` (로컬 벽시계 읽기를 나타냄)은 `2025-09-29 18:42:13.000` (`DateTime64(3, 'UTC')`가 시간을 나타냄)으로 변환됩니다. 문자열로 변환되면 정확한 연도, 월, 일, 시, 분, 초 및 서브초를 표시하며, 이는 이후에 특정 로컬 시간대에서 해석될 수 있습니다. 직관적이지 않게도, 타입을 `DateTime64(3, 'UTC')`에서 `DateTime64(3)`으로 변경하는 것이 도움이 되지 않으며, 두 타입 모두 시점이 아닌 시계 판독을 나타냅니다. 그러나 `DateTime64(3)`은 잘못하여 로컬 시간대가 사용되게 됩니다.
* `INTERVAL`은 현재 `FixedString(12)`로 읽히며, Parquet 파일에 인코딩된 시간 간격의 원시 바이너리 표현이 포함되어 있습니다.

## Example usage {#example-usage}

### Inserting data {#inserting-data}

다음 데이터가 포함된 Parquet 파일을 사용합니다, 이름은 `football.parquet`:

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
INSERT INTO football FROM INFILE 'football.parquet' FORMAT Parquet;
```

### Reading data {#reading-data}

`Parquet` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
INTO OUTFILE 'football.parquet'
FORMAT Parquet
```

:::tip
Parquet는 터미널에서 사람이 읽을 수 없는 이진 형식입니다. Parquet 파일을 출력하려면 `INTO OUTFILE`을 사용하세요.
:::

Hadoop과 데이터 교환하려면 [`HDFS 테이블 엔진`](/engines/table-engines/integrations/hdfs.md)을 사용할 수 있습니다.

## Format settings {#format-settings}

| Setting                                                                        | Description                                                                                                                                                                                                                       | Default     |
|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `input_format_parquet_case_insensitive_column_matching`                        | ClickHouse 열과 일치할 때 Parquet 열의 대소문자를 무시합니다.                                                                                                                                                                          | `0`         |
| `input_format_parquet_preserve_order`                                          | Parquet 파일에서 읽을 때 행의 순서를 재배열하지 않습니다. 일반적으로 속도가 느려집니다.                                                                                                                                              | `0`         |
| `input_format_parquet_filter_push_down`                                        | Parquet 파일을 읽을 때 WHERE/PREWHERE 식과 Parquet 메타데이터의 최소/최대 통계에 따라 전체 행 그룹을 건너뜁니다.                                                                                          | `1`         |
| `input_format_parquet_bloom_filter_push_down`                                  | Parquet 파일을 읽을 때 WHERE 식과 Parquet 메타데이터의 블룸 필터에 따라 전체 행 그룹을 건너뜁니다.                                                                                                          | `0`         |
| `input_format_parquet_use_native_reader`                                       | Parquet 파일을 읽을 때 화살표 리더 대신 기본 리더를 사용합니다.                                                                                                                                                          | `0`         |
| `input_format_parquet_allow_missing_columns`                                   | Parquet 입력 형식을 읽을 때 누락된 열을 허용합니다.                                                                                                                                                                          | `1`         |
| `input_format_parquet_local_file_min_bytes_for_seek`                           | Parquet 입력 형식에서 읽기 시 건너뛰기를 수행하기 위해 로컬 읽기(파일)에 필요한 최소 바이트입니다.                                                                                                                          | `8192`      |
| `input_format_parquet_enable_row_group_prefetch`                               | Parquet 파싱 중 행 그룹 사전 가져오기를 활성화합니다. 현재 단일 스레드 파싱만 사전 가져올 수 있습니다.                                                                                                                          | `1`         |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference` | 스키마 추론에서 지원되지 않는 유형의 열을 생략합니다.                                                                                                                                                      | `0`         |
| `input_format_parquet_max_block_size`                                          | Parquet 리더의 최대 블록 크기입니다.                                                                                                                                                                                                | `65409`     |
| `input_format_parquet_prefer_block_bytes`                                      | Parquet 리더가 출력하는 평균 블록 바이트의 크기입니다.                                                                                                                                                                                      | `16744704`  |
| `input_format_parquet_enable_json_parsing`                                      | Parquet 파일을 읽을 때 ClickHouse JSON 컬럼으로 JSON 열을 파싱합니다.                                                                                                                                                                                      | `1`  |
| `output_format_parquet_row_group_size`                                         | 행 단위의 대상 행 그룹 크기입니다.                                                                                                                                                                                                      | `1000000`   |
| `output_format_parquet_row_group_size_bytes`                                   | 압축 전 바이트 단위의 대상 행 그룹 크기입니다.                                                                                                                                                                                  | `536870912` |
| `output_format_parquet_string_as_string`                                       | 문자열 열에 대해 Parquet String 타입을 사용합니다.                                                                                                                                                                      | `1`         |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                       | FixedString 열에 대해 Parquet FIXED_LEN_BYTE_ARRAY 타입을 사용합니다.                                                                                                                                                  | `1`         |
| `output_format_parquet_version`                                                | 출력 형식에 대한 Parquet 형식 버전입니다. 지원되는 버전: 1.0, 2.4, 2.6 및 2.latest (기본값)                                                                                                                                  | `2.latest`  |
| `output_format_parquet_compression_method`                                     | Parquet 출력 형식에 대한 압축 방법입니다. 지원되는 코덱: snappy, lz4, brotli, zstd, gzip, none (압축되지 않음)                                                                                                              | `zstd`      |
| `output_format_parquet_compliant_nested_types`                                 | Parquet 파일 스키마에서 리스트 요소에 대해 'item' 대신 'element'라는 이름을 사용합니다. 이는 Arrow 라이브러리 구현의 역사적 유물입니다. 일반적으로 호환성을 증가시킵니다. | `1`         |
| `output_format_parquet_use_custom_encoder`                                     | 더 빠른 Parquet 인코더 구현을 사용합니다.                                                                                                                                                                                      | `1`         |
| `output_format_parquet_parallel_encoding`                                      | 여러 스레드에서 Parquet 인코딩을 수행합니다. `output_format_parquet_use_custom_encoder`가 필요합니다.                                                                                                                                          | `1`         |
| `output_format_parquet_data_page_size`                                         | 압축 전 바이트 단위의 대상 페이지 크기입니다.                                                                                                                                                                                      | `1048576`   |
| `output_format_parquet_batch_size`                                             | 이 많은 행마다 페이지 크기를 확인합니다. 평균 값 크기가 수 KB를 초과하는 열이 있는 경우 줄이는 것을 고려하세요.                                                                                                              | `1024`      |
| `output_format_parquet_write_page_index`                                       | Parquet 파일에 페이지 인덱스를 기록하는 가능성을 추가합니다.                                                                                                                                                                          | `1`         |
| `input_format_parquet_import_nested`                                           | 사용 중단된 설정으로 아무런 작동을 하지 않습니다.                                                                                                                                                                                                   | `0`         |
| `input_format_parquet_local_time_as_utc` | true | isAdjustedToUTC=false인 Parquet 타임스탬프에 대한 스키마 추정을 위해 사용되는 데이터 타입을 결정합니다. true일 경우: DateTime64(..., 'UTC'), false일 경우: DateTime64(...). ClickHouse는 로컬 벽시계 시간을 위한 데이터 타입이 없으므로 어떤 동작도 완전하게 올바르지 않습니다. 직관적으로 'true'가 아마도 덜 잘못된 옵션일 것입니다. 왜냐하면 'UTC' 타임스탬프를 문자열로 포맷할 경우 올바른 로컬 시간을 나타내는 표현을 생산하기 때문입니다. |
