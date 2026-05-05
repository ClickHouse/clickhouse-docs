---
description: '지정된 클러스터의 여러 노드에서 Apache Paimon의 파일을 병렬로 처리할 수 있도록 하는 paimon 테이블 함수의 확장입니다.'
sidebar_label: 'paimonCluster'
sidebar_position: 91
slug: /sql-reference/table-functions/paimonCluster
title: 'paimonCluster'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# paimonCluster 테이블 함수 \{#paimoncluster-table-function\}

<ExperimentalBadge />

이 함수는 [paimon](/sql-reference/table-functions/paimon.md) 테이블 함수의 확장입니다.

지정된 클러스터의 여러 노드에서 Apache [Paimon](https://paimon.apache.org/) 파일을 병렬로 처리할 수 있도록 합니다. 이니시에이터 노드는 클러스터의 모든 노드에 대한 연결을 설정하고 각 파일을 동적으로 분배합니다. 워커 노드는 처리할 다음 작업을 이니시에이터에 요청한 다음, 해당 작업을 처리합니다. 이 과정은 모든 작업이 완료될 때까지 반복됩니다.

## 구문 \{#syntax\}

```sql
paimonS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression] [,extra_credentials])

paimonAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

paimonHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
```


## 인수 \{#arguments\}

- `cluster_name` — 원격 및 로컬 서버의 주소 집합과 연결 매개변수를 구성하는 데 사용되는 클러스터의 이름입니다.
- 그 밖의 모든 인수에 대한 설명은 동등한 [paimon](/sql-reference/table-functions/paimon.md) 테이블 함수의 인수 설명과 같습니다.
- 선택적 `extra_credentials` 매개변수를 사용하여 ClickHouse Cloud에서 역할 기반 액세스를 위한 `role_arn`을 전달할 수 있습니다. 구성 단계는 [Secure S3](/cloud/data-sources/secure-s3)를 참조하세요.

**반환 값**

지정된 Paimon 테이블에서 지정된 클러스터의 데이터를 읽기 위한, 지정된 구조의 테이블입니다.

## 가상 컬럼 \{#virtual-columns\}

* `_path` — 파일 경로입니다. 타입: `LowCardinality(String)`.
* `_file` — 파일 이름입니다. 타입: `LowCardinality(String)`.
* `_size` — 파일 크기(바이트 단위)입니다. 타입: `Nullable(UInt64)`. 파일 크기를 알 수 없는 경우 값은 `NULL`입니다.
* `_time` — 파일의 마지막 수정 시각입니다. 타입: `Nullable(DateTime)`. 시각을 알 수 없는 경우 값은 `NULL`입니다.
* `_etag` — 파일의 ETag입니다. 타입: `LowCardinality(String)`. ETag를 알 수 없는 경우 값은 `NULL`입니다.

**관련 문서**

* [Paimon 테이블 함수](sql-reference/table-functions/paimon.md)