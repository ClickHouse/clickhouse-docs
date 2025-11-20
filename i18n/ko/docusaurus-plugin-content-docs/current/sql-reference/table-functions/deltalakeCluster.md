---
'description': '이것은 deltaLake 테이블 함수에 대한 확장입니다.'
'sidebar_label': 'deltaLakeCluster'
'sidebar_position': 46
'slug': '/sql-reference/table-functions/deltalakeCluster'
'title': 'deltaLakeCluster'
'doc_type': 'reference'
---


# deltaLakeCluster 테이블 함수

이것은 [deltaLake](sql-reference/table-functions/deltalake.md) 테이블 함수에 대한 확장입니다.

지정된 클러스터의 여러 노드에서 Amazon S3의 [Delta Lake](https://github.com/delta-io/delta) 테이블의 파일을 병렬로 처리할 수 있습니다. 이니시에이터에서 클러스터의 모든 노드에 대한 연결을 생성하고 각 파일을 동적으로 분배합니다. 작업 노드에서는 이니시에이터에게 처리할 다음 작업에 대해 요청하고 이를 처리합니다. 모든 작업이 완료될 때까지 이 과정이 반복됩니다.

## 구문 {#syntax}

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeCluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeS3Cluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
deltaLakeAzureCluster(cluster_name, named_collection[, option=value [,..]])
```
`deltaLakeS3Cluster`는 `deltaLakeCluster`의 별칭으로, 둘 다 S3 용입니다.

## 인수 {#arguments}

- `cluster_name` — 원격 및 로컬 서버에 대한 주소 및 연결 매개변수 집합을 구축하는 데 사용되는 클러스터의 이름입니다.

- 나머지 모든 인수에 대한 설명은 동등한 [deltaLake](sql-reference/table-functions/deltalake.md) 테이블 함수의 인수 설명과 일치합니다.

## 반환 값 {#returned_value}

지정된 Delta Lake 테이블에서 클러스터의 데이터를 읽기 위한 지정된 구조의 테이블입니다.

## 가상 컬럼 {#virtual-columns}

- `_path` — 파일의 경로입니다. 유형: `LowCardinality(String)`.
- `_file` — 파일의 이름입니다. 유형: `LowCardinality(String)`.
- `_size` — 파일의 크기(바이트)입니다. 유형: `Nullable(UInt64)`. 파일 크기가 알려지지 않은 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시간입니다. 유형: `Nullable(DateTime)`. 시간이 알려지지 않은 경우 값은 `NULL`입니다.
- `_etag` — 파일의 etag입니다. 유형: `LowCardinality(String)`. etag가 알려지지 않은 경우 값은 `NULL`입니다.

## 관련 {#related}

- [deltaLake 엔진](engines/table-engines/integrations/deltalake.md)
- [deltaLake 테이블 함수](sql-reference/table-functions/deltalake.md)
