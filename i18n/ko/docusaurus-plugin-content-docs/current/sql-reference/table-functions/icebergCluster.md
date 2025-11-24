---
'description': '지정된 클러스터의 여러 노드에서 Apache Iceberg의 파일을 병렬로 처리할 수 있도록 하는 iceberg 테이블
  기능의 확장입니다.'
'sidebar_label': 'icebergCluster'
'sidebar_position': 91
'slug': '/sql-reference/table-functions/icebergCluster'
'title': 'icebergCluster'
'doc_type': 'reference'
---


# icebergCluster 테이블 함수

이는 [iceberg](/sql-reference/table-functions/iceberg.md) 테이블 함수에 대한 확장입니다.

지정된 클러스터의 여러 노드에서 Apache [Iceberg](https://iceberg.apache.org/) 파일을 병렬로 처리할 수 있게 해줍니다. 초기화자는 클러스터 내의 모든 노드에 대한 연결을 생성하고 각 파일을 동적으로 배포합니다. 워커 노드는 초기화자에게 다음에 처리할 작업에 대해 문의하고 이를 처리합니다. 모든 작업이 완료될 때까지 이 과정이 반복됩니다.

## 구문 {#syntax}

```sql
icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3Cluster(cluster_name, named_collection[, option=value [,..]])

icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzureCluster(cluster_name, named_collection[, option=value [,..]])

icebergHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
icebergHDFSCluster(cluster_name, named_collection[, option=value [,..]])
```

## 인수 {#arguments}

- `cluster_name` — 원격 및 로컬 서버에 대한 주소 및 연결 매개변수를 구축하는 데 사용되는 클러스터의 이름입니다.
- 다른 모든 인수에 대한 설명은 동등한 [iceberg](/sql-reference/table-functions/iceberg.md) 테이블 함수의 인수 설명과 일치합니다.

**반환 값**

지정된 Iceberg 테이블에서 클러스터의 데이터를 읽기 위한 구조를 가진 테이블입니다.

**예제**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

## 가상 컬럼 {#virtual-columns}

- `_path` — 파일 경로. 타입: `LowCardinality(String)`.
- `_file` — 파일 이름. 타입: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트 단위). 타입: `Nullable(UInt64)`. 파일 크기가 알려지지 않은 경우, 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시간. 타입: `Nullable(DateTime)`. 시간이 알려지지 않은 경우, 값은 `NULL`입니다.
- `_etag` — 파일의 etag. 타입: `LowCardinality(String)`. etag가 알려지지 않은 경우, 값은 `NULL`입니다.

**참고 사항**

- [Iceberg 엔진](/engines/table-engines/integrations/iceberg.md)
- [Iceberg 테이블 함수](sql-reference/table-functions/iceberg.md)
