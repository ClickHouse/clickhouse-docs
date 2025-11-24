---
'description': 'ParquetMetadata 형식에 대한 문서'
'keywords':
- 'ParquetMetadata'
'slug': '/interfaces/formats/ParquetMetadata'
'title': 'ParquetMetadata'
'doc_type': 'reference'
---

## 설명 {#description}

Parquet 파일 메타데이터를 읽기 위한 특별한 형식입니다 (https://parquet.apache.org/docs/file-format/metadata/). 항상 다음 구조/내용으로 한 행을 출력합니다:
- `num_columns` - 컬럼 수
- `num_rows` - 총 행 수
- `num_row_groups` - 총 행 그룹 수
- `format_version` - parquet 형식 버전, 항상 1.0 또는 2.6
- `total_uncompressed_size` - 데이터의 총 압축 해제 바이트 크기, 모든 행 그룹의 total_byte_size의 합계로 계산
- `total_compressed_size` - 데이터의 총 압축 바이트 크기, 모든 행 그룹의 total_compressed_size의 합계로 계산
- `columns` - 다음 구조를 가진 컬럼 메타데이터 목록:
  - `name` - 컬럼 이름
  - `path` - 컬럼 경로 (중첩 컬럼의 경우 이름과 다름)
  - `max_definition_level` - 최대 정의 수준
  - `max_repetition_level` - 최대 반복 수준
  - `physical_type` - 컬럼 물리적 유형
  - `logical_type` - 컬럼 논리적 유형
  - `compression` - 이 컬럼에 사용된 압축
  - `total_uncompressed_size` - 컬럼의 총 압축 해제 바이트 크기, 모든 행 그룹에서 컬럼의 total_uncompressed_size의 합계로 계산
  - `total_compressed_size` - 컬럼의 총 압축 바이트 크기, 모든 행 그룹에서 컬럼의 total_compressed_size의 합계로 계산
  - `space_saved` - 압축으로 절약된 공간 비율, (1 - total_compressed_size/total_uncompressed_size)로 계산
  - `encodings` - 이 컬럼에 사용된 인코딩 목록
- `row_groups` - 다음 구조를 가진 행 그룹 메타데이터 목록:
  - `num_columns` - 행 그룹 내 컬럼 수
  - `num_rows` - 행 그룹 내 행 수
  - `total_uncompressed_size` - 행 그룹의 총 압축 해제 바이트 크기
  - `total_compressed_size` - 행 그룹의 총 압축 바이트 크기
  - `columns` - 다음 구조를 가진 컬럼 청크 메타데이터 목록:
    - `name` - 컬럼 이름
    - `path` - 컬럼 경로
    - `total_compressed_size` - 컬럼의 총 압축 바이트 크기
    - `total_uncompressed_size` - 행 그룹의 총 압축 해제 바이트 크기
    - `have_statistics` - 컬럼 청크 메타데이터가 컬럼 통계를 포함하는지 여부를 나타내는 boolean 플래그
    - `statistics` - 컬럼 청크 통계 (have_statistics = false인 경우 모든 필드는 NULL) 다음 구조로:
      - `num_values` - 컬럼 청크 내의 비 NULL 값 수
      - `null_count` - 컬럼 청크 내의 NULL 값 수
      - `distinct_count` - 컬럼 청크 내의 고유 값 수
      - `min` - 컬럼 청크의 최소 값
      - `max` - 컬럼 청크의 최대 값

## 사용 예시 {#example-usage}

예시:

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
