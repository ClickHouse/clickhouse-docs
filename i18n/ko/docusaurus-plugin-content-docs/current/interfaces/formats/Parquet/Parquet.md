---
alias: []
description: 'Parquet 형식에 대한 문서'
input_format: true
keywords: ['Parquet']
output_format: true
slug: /interfaces/formats/Parquet
title: 'Parquet'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 \{#description\}

[Apache Parquet](https://parquet.apache.org/)은 Hadoop 생태계 전반에서 널리 사용되는 열 지향 스토리지 포맷입니다. ClickHouse는 이 포맷에 대한 읽기 및 쓰기 작업을 지원합니다.

## 데이터 타입 매칭 \{#data-types-matching-parquet\}

아래 표는 Parquet 데이터 타입이 ClickHouse [데이터 타입](/sql-reference/data-types/index.md)과 어떻게 매칭되는지 보여줍니다.

| Parquet 타입 (logical, converted, 또는 physical) | ClickHouse 데이터 타입 |
|--------------------------------------------------|------------------------|
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

Parquet 파일을 작성할 때, 매칭되는 Parquet 타입이 없는 데이터 타입은 사용 가능한 가장 가까운 타입으로 변환됩니다:

| ClickHouse 데이터 타입 | Parquet 타입 |
|------------------------|--------------|
| [IPv4](/sql-reference/data-types/ipv4.md) | `UINT_32` |
| [IPv6](/sql-reference/data-types/ipv6.md) | `FIXED_LEN_BYTE_ARRAY` (16 바이트) |
| [Date](/sql-reference/data-types/date.md) (16비트) | `DATE` (32비트) |
| [DateTime](/sql-reference/data-types/datetime.md) (32비트, 초 단위) | `TIMESTAMP` (64비트, 밀리초 단위) |
| [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md) | `FIXED_LEN_BYTE_ARRAY` (16/32 바이트, 리틀 엔디언) |

Array 타입은 중첩될 수 있으며, 인자로 `Nullable` 타입 값을 가질 수 있습니다. `Tuple` 및 `Map` 타입도 중첩될 수 있습니다.

ClickHouse 테이블 컬럼의 데이터 타입은 삽입되는 Parquet 데이터의 해당 필드 데이터 타입과 다를 수 있습니다. 데이터를 삽입할 때 ClickHouse는 위 표에 따라 데이터 타입을 해석한 다음, ClickHouse 테이블 컬럼에 설정된 데이터 타입으로 데이터를 [캐스팅](/sql-reference/functions/type-conversion-functions#CAST)합니다. 예를 들어 `UINT_32` Parquet 컬럼은 [IPv4](/sql-reference/data-types/ipv4.md) ClickHouse 컬럼으로 읽을 수 있습니다.

일부 Parquet 타입에는 근접하게 매칭되는 ClickHouse 타입이 없습니다. 이러한 타입은 다음과 같이 읽습니다:

* `TIME` (하루 중 시간)은 타임스탬프로 읽힙니다. 예: `10:23:13.000`은 `1970-01-01 10:23:13.000`이 됩니다.
* `isAdjustedToUTC=false`인 `TIMESTAMP`/`TIME`은 로컬 시계 시각(어떤 특정 시간대를 로컬로 간주하는지와 무관하게, 로컬 시간대에서의 연, 월, 일, 시, 분, 초 및 소수 초 필드)으로, SQL `TIMESTAMP WITHOUT TIME ZONE`과 같습니다. ClickHouse는 이를 마치 UTC 타임스탬프인 것처럼 읽습니다. 예: 로컬 시계에서 읽은 값을 나타내는 `2025-09-29 18:42:13.000`은 시점을 나타내는 `2025-09-29 18:42:13.000` (`DateTime64(3, 'UTC')`)이 됩니다. `String`으로 변환하면 연, 월, 일, 시, 분, 초 및 소수 초가 올바르게 표시되며, 이후 이를 UTC가 아닌 어떤 로컬 시간대에 속한 값으로 해석할 수 있습니다. 직관과 달리, 타입을 `DateTime64(3, 'UTC')`에서 `DateTime64(3)`으로 변경해도 도움이 되지 않습니다. 두 타입 모두 시점(point in time)을 표현할 뿐 시계 읽기(clock reading)를 표현하는 것이 아니며, `DateTime64(3)`은 로컬 시간대를 사용해 잘못된 형식으로 출력되기 때문입니다.
* `INTERVAL`은 현재 Parquet 파일에 인코딩된 시간 간격의 원시 이진 표현을 그대로 사용하여 `FixedString(12)`로 읽힙니다.

## 사용 예 \{#example-usage\}

### 데이터 삽입 \{#inserting-data\}

다음과 같은 데이터가 들어 있는 Parquet 파일 `football.parquet`를 사용합니다.

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

데이터 삽입:

```sql
INSERT INTO football FROM INFILE 'football.parquet' FORMAT Parquet;
```


### 데이터 읽기 \{#reading-data\}

`Parquet` 형식으로 데이터를 읽습니다:

```sql
SELECT *
FROM football
INTO OUTFILE 'football.parquet'
FORMAT Parquet
```

:::tip
Parquet는 바이너리 형식이므로 터미널에서 사람이 읽을 수 있는 텍스트 형태로 표시되지 않습니다. Parquet 파일을 출력하려면 `INTO OUTFILE`을(를) 사용하십시오.
:::

Hadoop과 데이터를 교환하려면 [`HDFS table engine`](/engines/table-engines/integrations/hdfs.md)을(를) 사용할 수 있습니다.


## 형식 설정 \{#format-settings\}

| 설정                                                                             | 설명                                                                                                                                              | 기본값                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input_format_parquet_case_insensitive_column_matching`                        | Parquet 컬럼을 ClickHouse 컬럼과 매칭할 때 대소문자를 구분하지 않습니다.                                                                                               | `0`                                                                                                                                                                                                                                                                                                                              |
| `input_format_parquet_preserve_order`                                          | Parquet 파일에서 읽을 때 행의 재정렬을 피합니다. 일반적으로 성능이 크게 저하됩니다.                                                                                             | `0`                                                                                                                                                                                                                                                                                                                              |
| `input_format_parquet_filter_push_down`                                        | Parquet 파일을 읽을 때 Parquet 메타데이터의 min/max 통계와 WHERE/PREWHERE 식을 기반으로 전체 row group을 건너뜁니다.                                                         | `1`                                                                                                                                                                                                                                                                                                                              |
| `input_format_parquet_bloom_filter_push_down`                                  | Parquet 파일을 읽을 때 Parquet 메타데이터의 블룸 필터와 WHERE 식을 기반으로 전체 row group을 건너뜁니다.                                                                       | `0`                                                                                                                                                                                                                                                                                                                              |
| `input_format_parquet_allow_missing_columns`                                   | Parquet 입력 포맷을 읽는 동안 일부 컬럼이 없어도 허용합니다.                                                                                                          | `1`                                                                                                                                                                                                                                                                                                                              |
| `input_format_parquet_local_file_min_bytes_for_seek`                           | Parquet 입력 포맷에서 로컬 파일을 읽을 때, 데이터를 건너뛰며 읽는 대신 seek을 수행하기 위해 필요한 최소 바이트 수입니다.                                                                     | `8192`                                                                                                                                                                                                                                                                                                                           |
| `input_format_parquet_enable_row_group_prefetch`                               | Parquet 파싱 중 row group 프리페치를 활성화합니다. 현재는 단일 스레드 파싱에서만 프리페치를 수행할 수 있습니다.                                                                         | `1`                                                                                                                                                                                                                                                                                                                              |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference` | Parquet 포맷에 대해 스키마 추론을 수행할 때, 지원되지 않는 타입의 컬럼은 건너뜁니다.                                                                                            | `0`                                                                                                                                                                                                                                                                                                                              |
| `input_format_parquet_max_block_size`                                          | Parquet 리더에 대한 최대 블록 크기입니다.                                                                                                                     | `65409`                                                                                                                                                                                                                                                                                                                          |
| `input_format_parquet_prefer_block_bytes`                                      | Parquet 리더가 출력하는 평균 블록 크기(바이트)입니다.                                                                                                              | `16744704`                                                                                                                                                                                                                                                                                                                       |
| `input_format_parquet_enable_json_parsing`                                     | Parquet 파일을 읽을 때 JSON 컬럼을 ClickHouse JSON 컬럼으로 파싱합니다.                                                                                           | `1`                                                                                                                                                                                                                                                                                                                              |
| `output_format_parquet_row_group_size`                                         | 목표 row group 크기(행 수 기준)입니다.                                                                                                                     | `1000000`                                                                                                                                                                                                                                                                                                                        |
| `output_format_parquet_row_group_size_bytes`                                   | 압축 전에 목표 row group 크기(바이트 기준)입니다.                                                                                                               | `536870912`                                                                                                                                                                                                                                                                                                                      |
| `output_format_parquet_string_as_string`                                       | String 컬럼에 대해 Binary 대신 Parquet String 타입을 사용합니다.                                                                                               | `1`                                                                                                                                                                                                                                                                                                                              |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                       | FixedString 컬럼에 대해 Binary 대신 Parquet FIXED&#95;LEN&#95;BYTE&#95;ARRAY 타입을 사용합니다.                                                                | `1`                                                                                                                                                                                                                                                                                                                              |
| `output_format_parquet_version`                                                | 출력 포맷에 사용할 Parquet 포맷 버전입니다. 지원되는 버전: 1.0, 2.4, 2.6, 2.latest(기본값).                                                                             | `2.latest`                                                                                                                                                                                                                                                                                                                       |
| `output_format_parquet_compression_method`                                     | Parquet 출력 포맷의 압축 방식입니다. 지원되는 코덱: snappy, lz4, brotli, zstd, gzip, none(비압축).                                                                   | `zstd`                                                                                                                                                                                                                                                                                                                           |
| `output_format_parquet_compliant_nested_types`                                 | Parquet 파일 스키마에서 리스트 요소에 대해 이름 「item」 대신 「element」를 사용합니다. 이는 Arrow 라이브러리 구현의 역사적인 유산입니다. 일반적으로 호환성이 향상되지만, 일부 오래된 버전의 Arrow와는 호환성이 떨어질 수 있습니다. | `1`                                                                                                                                                                                                                                                                                                                              |
| `output_format_parquet_use_custom_encoder`                                     | 더 빠른 Parquet 인코더 구현을 사용합니다.                                                                                                                     | `1`                                                                                                                                                                                                                                                                                                                              |
| `output_format_parquet_parallel_encoding`                                      | 여러 스레드에서 Parquet 인코딩을 수행합니다. `output_format_parquet_use_custom_encoder` 설정이 필요합니다.                                                              | `1`                                                                                                                                                                                                                                                                                                                              |
| `output_format_parquet_data_page_size`                                         | 압축 전에 목표 페이지 크기(바이트 기준)입니다.                                                                                                                     | `1048576`                                                                                                                                                                                                                                                                                                                        |
| `output_format_parquet_batch_size`                                             | 이 행 수마다 페이지 크기를 점검합니다. 컬럼의 평균 값 크기가 수 KB를 초과하는 경우 이 값을 더 작게 설정하는 것이 좋습니다.                                                                       | `1024`                                                                                                                                                                                                                                                                                                                           |
| `output_format_parquet_write_page_index`                                       | Parquet 파일에 페이지 인덱스를 기록하는 기능을 활성화합니다.                                                                                                           | `1`                                                                                                                                                                                                                                                                                                                              |
| `input_format_parquet_import_nested`                                           | 사용되지 않는 설정으로, 현재는 아무 작업도 수행하지 않습니다.                                                                                                             | `0`                                                                                                                                                                                                                                                                                                                              |
| `input_format_parquet_local_time_as_utc`                                       | true                                                                                                                                            | isAdjustedToUTC=false인 Parquet 타임스탬프에 대해, 스키마 추론 시 사용할 데이터 타입을 결정합니다. true이면 DateTime64(..., &#39;UTC&#39;), false이면 DateTime64(...)를 사용합니다. ClickHouse에는 로컬 시계 시간(local wall-clock time)을 위한 데이터 타입이 없으므로, 둘 중 어느 동작도 완전히 올바르지는 않습니다. 직관과는 달리 true가 그나마 덜 잘못된 선택일 수 있는데, UTC 타임스탬프를 String으로 포맷하면 로컬 시간에 대한 올바른 표현이 생성되기 때문입니다. |