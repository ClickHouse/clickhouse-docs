---
'description': 'hudi 테이블 함수에 대한 확장입니다. 지정된 클러스터의 여러 노드와 함께 Amazon S3의 Apache Hudi
  테이블에서 파일을 병렬로 처리할 수 있습니다.'
'sidebar_label': 'hudiCluster'
'sidebar_position': 86
'slug': '/sql-reference/table-functions/hudiCluster'
'title': 'hudiCluster 테이블 함수'
'doc_type': 'reference'
---


# hudiCluster 테이블 함수

이것은 [hudi](sql-reference/table-functions/hudi.md) 테이블 함수에 대한 확장입니다.

지정된 클러스터의 여러 노드와 함께 Amazon S3의 Apache [Hudi](https://hudi.apache.org/) 테이블에서 파일을 병렬로 처리할 수 있도록 합니다. 발신자는 클러스터의 모든 노드에 연결을 생성하고 각 파일을 동적으로 배포합니다. 작업 노드에서는 발신자에게 처리할 다음 작업을 요청하고 이를 처리합니다. 모든 작업이 완료될 때까지 이 과정이 반복됩니다.

## 구문 {#syntax}

```sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 인수 {#arguments}

| 인수                                         | 설명                                                                                                                                                                                                                                                                                                                                                                                  |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                               | 원격 및 로컬 서버에 대한 주소 및 연결 매개변수 집합을 구축하는 데 사용되는 클러스터의 이름입니다.                                                                                                                                                                                                                                                                                   |
| `url`                                        | S3에 있는 기존 Hudi 테이블에 대한 경로가 포함된 버킷 URL입니다.                                                                                                                                                                                                                                                                                                                             |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) 계정 사용자에 대한 장기 자격 증명입니다. 이를 사용하여 요청을 인증할 수 있습니다. 이러한 매개변수는 선택 사항입니다. 자격 증명이 지정되지 않으면 ClickHouse 구성에서 사용됩니다. 자세한 내용은 [Using S3 for Data Storage](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)를 참조하십시오.  |
| `format`                                     | 파일의 [형식](/interfaces/formats)입니다.                                                                                                                                                                                                                                                                                                                                         |
| `structure`                                  | 테이블의 구조입니다. 형식 `'column1_name column1_type, column2_name column2_type, ...'`입니다.                                                                                                                                                                                                                                                                                     |
| `compression`                                | 선택적 매개변수입니다. 지원되는 값: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. 기본적으로 압축은 파일 확장자로 자동 감지됩니다.                                                                                                                                                                                                                                                 |

## 반환 값 {#returned_value}

지정된 Hudi 테이블에서 클러스터의 데이터를 읽기 위한 지정된 구조의 테이블입니다.

## 가상 컬럼 {#virtual-columns}

- `_path` — 파일 경로입니다. 형식: `LowCardinality(String)`입니다.
- `_file` — 파일 이름입니다. 형식: `LowCardinality(String)`입니다.
- `_size` — 파일 크기(바이트)입니다. 형식: `Nullable(UInt64)`입니다. 파일 크기가 알려져 있지 않으면 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시간입니다. 형식: `Nullable(DateTime)`입니다. 시간이 알려져 있지 않으면 값은 `NULL`입니다.
- `_etag` — 파일의 etag입니다. 형식: `LowCardinality(String)`입니다. etag가 알려져 있지 않으면 값은 `NULL`입니다.

## 관련 항목 {#related}

- [Hudi 엔진](engines/table-engines/integrations/hudi.md)
- [Hudi 테이블 함수](sql-reference/table-functions/hudi.md)
