---
description: 'iceberg 테이블 함수의 확장으로, 지정된 클러스터의 여러 노드에서 Apache Iceberg 파일을 병렬로 처리할 수 있도록 합니다.'
sidebar_label: 'icebergCluster'
sidebar_position: 91
slug: /sql-reference/table-functions/icebergCluster
title: 'icebergCluster'
doc_type: 'reference'
---

# icebergCluster 테이블 함수 \{#icebergcluster-table-function\}

이 함수는 [iceberg](/sql-reference/table-functions/iceberg.md) 테이블 함수의 확장입니다.

지정된 클러스터의 여러 노드에서 Apache [Iceberg](https://iceberg.apache.org/) 파일을 병렬로 처리할 수 있도록 합니다. 이니시에이터에서는 클러스터의 모든 노드에 대한 연결을 생성하고 각 파일을 동적으로 분배합니다. 워커 노드에서는 처리할 다음 작업에 대해 이니시에이터에 요청한 뒤 이를 처리합니다. 이 과정은 모든 작업이 완료될 때까지 반복됩니다.

## 구문 \{#syntax\}

```sql
icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method] [,extra_credentials])
icebergS3Cluster(cluster_name, named_collection[, option=value [,..]])

icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzureCluster(cluster_name, named_collection[, option=value [,..]])

icebergHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
icebergHDFSCluster(cluster_name, named_collection[, option=value [,..]])
```

## Arguments \{#arguments\}

* `cluster_name` — 원격 및 로컬 서버에 대한 주소와 연결 매개변수 집합을 구성하는 데 사용되는 클러스터 이름입니다.
* 그 외 모든 인수에 대한 설명은 동등한 [iceberg](/sql-reference/table-functions/iceberg.md) 테이블 함수의 인수 설명과 동일합니다.
* 선택 사항인 `extra_credentials` 매개변수는 ClickHouse Cloud에서 역할 기반 액세스에 사용할 `role_arn`을 전달하는 데 사용할 수 있습니다. 구성 단계는 [Secure S3](/cloud/data-sources/secure-s3)를 참조하십시오.

**반환 값**

지정된 Iceberg 테이블에서 클러스터의 데이터를 읽기 위한, 지정된 구조를 가진 테이블입니다.

**예시**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

## 가상 컬럼 \{#virtual-columns\}

* `_path` — 파일 경로입니다. 형식: `LowCardinality(String)`.
* `_file` — 파일 이름입니다. 형식: `LowCardinality(String)`.
* `_size` — 파일 크기(바이트)입니다. 형식: `Nullable(UInt64)`. 파일 크기를 알 수 없는 경우 값은 `NULL`입니다.
* `_time` — 파일의 마지막 수정 시각입니다. 형식: `Nullable(DateTime)`. 시각을 알 수 없는 경우 값은 `NULL`입니다.
* `_etag` — 파일의 ETag입니다. 형식: `LowCardinality(String)`. ETag를 알 수 없는 경우 값은 `NULL`입니다.

**함께 보기**

* [Iceberg 엔진](/engines/table-engines/integrations/iceberg.md)
* [Iceberg 테이블 함수](sql-reference/table-functions/iceberg.md)