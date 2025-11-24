---
'description': 'Amazon S3에서 Apache Hudi 테이블에 대한 읽기 전용 테이블과 같은 인터페이스를 제공합니다.'
'sidebar_label': 'hudi'
'sidebar_position': 85
'slug': '/sql-reference/table-functions/hudi'
'title': 'hudi'
'doc_type': 'reference'
---


# hudi 테이블 함수

Amazon S3에서 Apache [Hudi](https://hudi.apache.org/) 테이블에 대한 읽기 전용 테이블과 유사한 인터페이스를 제공합니다.

## 구문 {#syntax}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 인수 {#arguments}

| 인수                                        | 설명                                                                                                                                                                                                                                                                                                                                                                           |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                                     | S3에 있는 기존 Hudi 테이블의 경로가 포함된 버킷 URL입니다.                                                                                                                                                                                                                                                                                                                             |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) 계정 사용자에 대한 장기 자격 증명입니다. 이 자격 증명을 사용하여 요청을 인증할 수 있습니다. 이러한 매개변수는 선택 사항입니다. 자격 증명이 지정되지 않은 경우 ClickHouse 구성에서 사용됩니다. 자세한 내용은 [S3를 데이터 저장소로 사용하기](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)를 참조하십시오. |
| `format`                                  | 파일의 [형식](/interfaces/formats)입니다.                                                                                                                                                                                                                                                                                                                                        |
| `structure`                               | 테이블의 구조입니다. 형식: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                                                                                         |
| `compression`                             | 매개변수는 선택 사항입니다. 지원되는 값: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. 기본적으로 압축은 파일 확장자에 의해 자동 감지됩니다.                                                                                                                                                                                                                   |

## 반환 값 {#returned_value}

S3의 지정된 Hudi 테이블에서 데이터를 읽기 위한 지정된 구조를 가진 테이블입니다.

## 가상 열 {#virtual-columns}

- `_path` — 파일 경로. 유형: `LowCardinality(String)`.
- `_file` — 파일 이름. 유형: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트). 유형: `Nullable(UInt64)`. 파일 크기가 알려지지 않으면 값은 `NULL`입니다.
- `_time` — 파일의 최종 수정 시간. 유형: `Nullable(DateTime)`. 시간이 알려지지 않으면 값은 `NULL`입니다.
- `_etag` — 파일의 etag. 유형: `LowCardinality(String)`. etag가 알려지지 않으면 값은 `NULL`입니다.

## 관련 {#related}

- [Hudi 엔진](/engines/table-engines/integrations/hudi.md)
- [Hudi 클러스터 테이블 함수](/sql-reference/table-functions/hudiCluster.md)
