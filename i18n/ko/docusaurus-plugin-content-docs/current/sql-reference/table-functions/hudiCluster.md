---
description: 'hudi 테이블 함수의 확장입니다. 지정된 클러스터의 여러 노드에서 Amazon S3에 있는 Apache Hudi 테이블의 파일을 병렬로 처리할 수 있습니다.'
sidebar_label: 'hudiCluster'
sidebar_position: 86
slug: /sql-reference/table-functions/hudiCluster
title: 'hudiCluster 테이블 함수'
doc_type: 'reference'
---



# hudiCluster Table Function \{#hudicluster-table-function\}

이 함수는 [hudi](sql-reference/table-functions/hudi.md) 테이블 함수의 확장입니다.

지정된 클러스터의 여러 노드를 사용하여 Amazon S3에 있는 Apache [Hudi](https://hudi.apache.org/) 테이블의 파일을 병렬로 처리합니다. 이니시에이터 노드에서는 클러스터의 모든 노드에 대한 연결을 맺고 각 파일을 동적으로 분산합니다. 워커 노드에서는 이니시에이터 노드에 다음에 처리할 작업을 요청하고 해당 작업을 처리합니다. 모든 작업이 완료될 때까지 이 과정이 반복됩니다.



## 구문 \{#syntax\}

```sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```


## Arguments \{#arguments\}

| Argument                                     | Description                                                                                                                                                                                                                                                                                                                                                                            |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                               | 원격 및 로컬 서버에 대한 주소와 연결 매개변수 집합을 구성하는 데 사용되는 클러스터 이름입니다.                                                                                                                                                                                                                                                                                       |
| `url`                                        | S3에 있는 기존 Hudi 테이블의 경로를 포함한 버킷 URL입니다.                                                                                                                                                                                                                                                                                                                             |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) 계정 사용자에 대한 장기 자격 증명입니다. 이 값을 사용하여 요청을 인증할 수 있습니다. 이 매개변수는 선택 사항입니다. 자격 증명을 지정하지 않으면 ClickHouse 설정에 구성된 값이 사용됩니다. 자세한 내용은 [Using S3 for Data Storage](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)를 참조하십시오.  |
| `format`                                     | 파일의 [format](/interfaces/formats)입니다.                                                                                                                                                                                                                                                                                                                                            |
| `structure`                                  | 테이블 구조입니다. 형식은 `'column1_name column1_type, column2_name column2_type, ...'`입니다.                                                                                                                                                                                                                                                                                        |
| `compression`                                | 선택적인 매개변수입니다. 지원하는 값: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. 기본적으로 압축 방식은 파일 확장자를 기준으로 자동 감지됩니다.                                                                                                                                                                                                                           |



## 반환 값 \{#returned_value\}

S3에 있는 지정된 Hudi 테이블에서 클러스터의 데이터를 읽는 데 사용되는, 지정된 구조를 가진 테이블입니다.



## 가상 컬럼 \{#virtual-columns\}

- `_path` — 파일 경로. 타입: `LowCardinality(String)`.
- `_file` — 파일 이름. 타입: `LowCardinality(String)`.
- `_size` — 바이트 단위의 파일 크기. 타입: `Nullable(UInt64)`. 파일 크기를 알 수 없는 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시각. 타입: `Nullable(DateTime)`. 시각을 알 수 없는 경우 값은 `NULL`입니다.
- `_etag` — 파일의 ETag. 타입: `LowCardinality(String)`. ETag를 알 수 없는 경우 값은 `NULL`입니다.



## 관련 항목 \{#related\}

- [Hudi 엔진](engines/table-engines/integrations/hudi.md)
- [Hudi 테이블 함수](sql-reference/table-functions/hudi.md)
