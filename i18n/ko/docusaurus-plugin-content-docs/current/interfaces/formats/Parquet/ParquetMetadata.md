---
description: 'ParquetMetadata 형식에 대한 문서'
keywords: ['ParquetMetadata']
slug: /interfaces/formats/ParquetMetadata
title: 'ParquetMetadata'
doc_type: 'reference'
---



## Description \{#description\}

Parquet 파일 메타데이터(https://parquet.apache.org/docs/file-format/metadata/)를 읽기 위한 특수 포맷입니다. 항상 다음과 같은 구조와 내용을 갖는 행을 하나만 출력합니다.
- `num_columns` - 컬럼 개수
- `num_rows` - 전체 행 개수
- `num_row_groups` - 전체 row group 개수
- `format_version` - Parquet 포맷 버전, 항상 1.0 또는 2.6
- `total_uncompressed_size` - 모든 row group의 total_byte_size 합으로 계산된 데이터의 전체 비압축 바이트 크기
- `total_compressed_size` - 모든 row group의 total_compressed_size 합으로 계산된 데이터의 전체 압축 바이트 크기
- `columns` - 다음 구조를 갖는 컬럼 메타데이터 목록:
  - `name` - 컬럼 이름
  - `path` - 컬럼 경로(중첩 컬럼의 경우 이름과 다름)
  - `max_definition_level` - 최대 definition level
  - `max_repetition_level` - 최대 repetition level
  - `physical_type` - 컬럼 물리 타입
  - `logical_type` - 컬럼 논리 타입
  - `compression` - 이 컬럼에 사용된 압축 방식
  - `total_uncompressed_size` - 모든 row group에서 해당 컬럼의 total_uncompressed_size 합으로 계산된 컬럼의 전체 비압축 바이트 크기
  - `total_compressed_size` - 모든 row group에서 해당 컬럼의 total_compressed_size 합으로 계산된 컬럼의 전체 압축 바이트 크기
  - `space_saved` - 압축으로 절약된 공간 비율(퍼센트). (1 - total_compressed_size/total_uncompressed_size)로 계산됩니다.
  - `encodings` - 이 컬럼에 사용된 인코딩 목록
- `row_groups` - 다음 구조를 갖는 row group 메타데이터 목록:
  - `num_columns` - row group 내 컬럼 개수
  - `num_rows` - row group 내 행 개수
  - `total_uncompressed_size` - row group의 전체 비압축 바이트 크기
  - `total_compressed_size` - row group의 전체 압축 바이트 크기
  - `columns` - 다음 구조를 갖는 컬럼 청크 메타데이터 목록:
    - `name` - 컬럼 이름
    - `path` - 컬럼 경로
    - `total_compressed_size` - 컬럼의 전체 압축 바이트 크기
    - `total_uncompressed_size` - row group의 전체 비압축 바이트 크기
    - `have_statistics` - 컬럼 청크 메타데이터가 컬럼 통계를 포함하는지 여부를 나타내는 boolean 플래그
    - `statistics` - 다음 구조를 갖는 컬럼 청크 통계(have_statistics = false이면 모든 필드는 NULL):
      - `num_values` - 컬럼 청크에서 NULL이 아닌 값의 개수
      - `null_count` - 컬럼 청크에서 NULL 값의 개수
      - `distinct_count` - 컬럼 청크에서 서로 다른 값의 개수
      - `min` - 컬럼 청크의 최소값
      - `max` - 컬럼 청크의 최대값



## 사용 예시 \{#example-usage\}

예:

```sql
SELECT * 
FROM file(data.parquet, ParquetMetadata) 
FORMAT PrettyJSONEachRow
```

```json
{
    "num_columns": "2",
    "num_rows": "100000",
    "num_row_groups": "2",
    "format_version": "2.6",
    "metadata_size": "577",
    "total_uncompressed_size": "282436",
    "total_compressed_size": "26633",
    "columns": [
        {
            "name": "number",
            "path": "number",
            "max_definition_level": "0",
            "max_repetition_level": "0",
            "physical_type": "INT32",
            "logical_type": "Int(bitWidth=16, isSigned=false)",
            "compression": "LZ4",
            "total_uncompressed_size": "133321",
            "total_compressed_size": "13293",
            "space_saved": "90.03%",
            "encodings": [
                "RLE_DICTIONARY",
                "PLAIN",
                "RLE"
            ]
        },
        {
            "name": "concat('Hello', toString(modulo(number, 1000)))",
            "path": "concat('Hello', toString(modulo(number, 1000)))",
            "max_definition_level": "0",
            "max_repetition_level": "0",
            "physical_type": "BYTE_ARRAY",
            "logical_type": "None",
            "compression": "LZ4",
            "total_uncompressed_size": "149115",
            "total_compressed_size": "13340",
            "space_saved": "91.05%",
            "encodings": [
                "RLE_DICTIONARY",
                "PLAIN",
                "RLE"
            ]
        }
    ],
    "row_groups": [
        {
            "num_columns": "2",
            "num_rows": "65409",
            "total_uncompressed_size": "179809",
            "total_compressed_size": "14163",
            "columns": [
                {
                    "name": "number",
                    "path": "number",
                    "total_compressed_size": "7070",
                    "total_uncompressed_size": "85956",
                    "have_statistics": true,
                    "statistics": {
                        "num_values": "65409",
                        "null_count": "0",
                        "distinct_count": null,
                        "min": "0",
                        "max": "999"
                    }
                },
                {
                    "name": "concat('Hello', toString(modulo(number, 1000)))",
                    "path": "concat('Hello', toString(modulo(number, 1000)))",
                    "total_compressed_size": "7093",
                    "total_uncompressed_size": "93853",
                    "have_statistics": true,
                    "statistics": {
                        "num_values": "65409",
                        "null_count": "0",
                        "distinct_count": null,
                        "min": "Hello0",
                        "max": "Hello999"
                    }
                }
            ]
        },
        ...
    ]
}
```
