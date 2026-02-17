---
description: 'Amazon S3에 저장된 Apache Hudi 테이블에 대해 읽기 전용 테이블형 인터페이스를 제공합니다.'
sidebar_label: 'hudi'
sidebar_position: 85
slug: /sql-reference/table-functions/hudi
title: 'hudi'
doc_type: 'reference'
---



# hudi 테이블 함수 \{#hudi-table-function\}

Amazon S3에 있는 Apache [Hudi](https://hudi.apache.org/) 테이블에 대해 읽기 전용 테이블 형태의 인터페이스를 제공합니다.



## 구문 \{#syntax\}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```


## Arguments \{#arguments\}

| Argument                                     | Description                                                                                                                                                                                                                                                                                                                                                                           |
|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                                        | S3에 있는 기존 Hudi 테이블 경로를 포함한 버킷 URL입니다.                                                                                                                                                                                                                                                                                                                              |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) 계정 사용자를 위한 장기 자격 증명입니다. 이 값을 사용하여 요청을 인증할 수 있습니다. 이 매개변수는 선택 사항입니다. 자격 증명을 지정하지 않으면 ClickHouse 구성에서 가져와 사용합니다. 자세한 내용은 [Using S3 for Data Storage](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)를 참고하십시오. |
| `format`                                     | 파일의 [format](/interfaces/formats)입니다.                                                                                                                                                                                                                                                                                                                                           |
| `structure`                                  | 테이블 구조입니다. 형식: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                                                                                               |
| `compression`                                | 선택적 매개변수입니다. 지원되는 값: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. 기본적으로 압축 방식은 파일 확장자를 기준으로 자동 감지됩니다.                                                                                                                                                                                                                                |



## 반환 값 \{#returned_value\}

S3에 있는 지정된 Hudi 테이블에서 데이터를 읽기 위해 지정된 구조를 가진 테이블을 반환합니다.



## 가상 컬럼 \{#virtual-columns\}

- `_path` — 파일 경로. 타입: `LowCardinality(String)`.
- `_file` — 파일 이름. 타입: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트 단위). 타입: `Nullable(UInt64)`. 파일 크기를 알 수 없는 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시각. 타입: `Nullable(DateTime)`. 시각을 알 수 없는 경우 값은 `NULL`입니다.
- `_etag` — 파일의 etag. 타입: `LowCardinality(String)`. etag를 알 수 없는 경우 값은 `NULL`입니다.



## 관련 문서 \{#related\}

- [Hudi 엔진](/engines/table-engines/integrations/hudi.md)
- [Hudi 클러스터 테이블 함수](/sql-reference/table-functions/hudiCluster.md)
