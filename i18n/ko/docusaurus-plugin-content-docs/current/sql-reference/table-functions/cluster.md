---
description: '`remote_servers` 섹션에 설정된 클러스터의 모든 세그먼트에 분산 테이블을 생성하지 않고도 액세스할 수 있게 합니다.'
sidebar_label: 'cluster'
sidebar_position: 30
slug: /sql-reference/table-functions/cluster
title: 'clusterAllReplicas'
doc_type: 'reference'
---



# clusterAllReplicas Table Function \{#clusterallreplicas-table-function\}

[Distributed](../../engines/table-engines/special/distributed.md) 테이블을 생성하지 않고도 `remote_servers` 섹션에 설정된 클러스터의 모든 세그먼트에 액세스할 수 있습니다. 각 세그먼트에서는 하나의 레플리카만 쿼리합니다.

`clusterAllReplicas` 함수는 `cluster`와 동일하지만, 모든 레플리카를 쿼리합니다. 클러스터의 각 레플리카는 별도의 세그먼트/연결로 사용됩니다.

:::note
사용 가능한 모든 클러스터는 [system.clusters](../../operations/system-tables/clusters.md) 테이블에 나열되어 있습니다.
:::



## 구문 \{#syntax\}



```sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```

## Arguments \{#arguments\}

| Arguments                   | Type                                                                              |
| --------------------------- | --------------------------------------------------------------------------------- |
| `cluster_name`              | 원격 및 로컬 서버에 대한 주소와 연결 매개변수 집합을 구성하는 데 사용되는 클러스터 이름입니다. 지정하지 않으면 `default`로 설정됩니다. |
| `db.table` or `db`, `table` | 데이터베이스와 테이블 이름입니다.                                                                |
| `sharding_key`              | 샤딩 키입니다. 선택적입니다. 클러스터에 세그먼트가 2개 이상 있는 경우 지정해야 합니다.                                |


## 반환 값 \{#returned_value\}

클러스터에서 반환되는 데이터 세트입니다.



## 매크로 사용 \{#using_macros\}

`cluster_name`에는 중괄호로 둘러싸인 매크로(치환)를 포함할 수 있습니다. 치환 값은 서버 구성 파일의 [macros](../../operations/server-configuration-parameters/settings.md#macros) 섹션에서 가져옵니다.

예시:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```


## 사용 및 권장 사항 \{#usage_recommendations\}

`cluster` 및 `clusterAllReplicas` 테이블 함수는 각 요청마다 서버 연결이 재설정되므로 `Distributed` 테이블을 생성하는 것보다 효율성이 떨어집니다. 대량의 쿼리를 처리하는 경우에는 항상 미리 `Distributed` 테이블을 생성하고, `cluster` 및 `clusterAllReplicas` 테이블 함수를 사용하지 않도록 합니다.

`cluster` 및 `clusterAllReplicas` 테이블 함수는 다음과 같은 경우에 유용하게 사용할 수 있습니다.

- 데이터 비교, 디버깅, 테스트를 위해 특정 클러스터에 액세스하는 경우
- 연구 목적의 다양한 ClickHouse 클러스터 및 레플리카에 대한 쿼리
- 수동으로 수행되는, 드문 분산 요청

`host`, `port`, `user`, `password`, `compression`, `secure`와 같은 연결 설정은 `<remote_servers>` 구성 섹션에서 가져옵니다. 자세한 내용은 [Distributed 엔진](../../engines/table-engines/special/distributed.md)을 참조하십시오.



## 관련 항목 \{#related\}

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
