---
'description': 'Apache Paimon의 파일을 지정된 클러스터의 많은 노드에서 병렬로 처리할 수 있게 해주는 paimon 테이블 함수의
  확장.'
'sidebar_label': 'paimonCluster'
'sidebar_position': 91
'slug': '/sql-reference/table-functions/paimonCluster'
'title': 'paimonCluster'
'doc_type': 'reference'
---


# paimonCluster 테이블 함수

이는 [paimon](/sql-reference/table-functions/paimon.md) 테이블 함수의 확장입니다.

지정된 클러스터의 여러 노드에서 Apache [Paimon](https://paimon.apache.org/)의 파일을 병렬로 처리할 수 있습니다. 이니시에이터에서 클러스터의 모든 노드에 대한 연결을 생성하고 각 파일을 동적으로 배포합니다. 작업 노드에서는 이니시에이터에 다음 처리할 작업을 요청하고 이를 처리합니다. 이 과정은 모든 작업이 완료될 때까지 반복됩니다.

## 구문 {#syntax}

```sql
paimonS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

paimonAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

paimonHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
```

## 인수 {#arguments}

- `cluster_name` — 원격 및 로컬 서버에 대한 주소 집합과 연결 매개변수를 구축하는 데 사용되는 클러스터의 이름.
- 모든 다른 인수에 대한 설명은 해당 [paimon](/sql-reference/table-functions/paimon.md) 테이블 함수의 인수 설명과 일치합니다.

**반환값**

지정된 Paimon 테이블에서 클러스터의 데이터를 읽기 위한 지정된 구조를 가진 테이블.

## 가상 컬럼 {#virtual-columns}

- `_path` — 파일의 경로. 타입: `LowCardinality(String)`.
- `_file` — 파일의 이름. 타입: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트 단위). 타입: `Nullable(UInt64)`. 파일 크기가 알려져 있지 않은 경우, 값은 `NULL`.
- `_time` — 파일의 마지막 수정 시간. 타입: `Nullable(DateTime)`. 시간이 알려져 있지 않은 경우, 값은 `NULL`.
- `_etag` — 파일의 etag. 타입: `LowCardinality(String)`. etag가 알려져 있지 않은 경우, 값은 `NULL`.

**참고**

- [Paimon 테이블 함수](sql-reference/table-functions/paimon.md)
