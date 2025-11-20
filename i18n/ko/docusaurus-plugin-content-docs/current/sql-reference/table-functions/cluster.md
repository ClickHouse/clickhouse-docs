---
'description': 'Distributed 테이블을 생성하지 않고 클러스터의 모든 샤드( `remote_servers` 섹션에 구성됨)에 접근할
  수 있게 해줍니다.'
'sidebar_label': '클러스터'
'sidebar_position': 30
'slug': '/sql-reference/table-functions/cluster'
'title': 'clusterAllReplicas'
'doc_type': 'reference'
---


# clusterAllReplicas 테이블 함수

클러스터의 모든 샤드를 액세스할 수 있도록 해주며(`remote_servers` 섹션에 구성됨) [Distributed](../../engines/table-engines/special/distributed.md) 테이블을 생성할 필요가 없습니다. 각 샤드의 복제본 중 하나만 쿼리됩니다.

`clusterAllReplicas` 함수는 `cluster`와 동일하지만 모든 복제본이 조회됩니다. 클러스터의 각 복제본은 별도의 샤드/연결로 사용됩니다.

:::note
사용 가능한 모든 클러스터는 [system.clusters](../../operations/system-tables/clusters.md) 테이블에 나열됩니다.
:::

## 문법 {#syntax}

```sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```
## 인수 {#arguments}

| 인수                       | 유형                                                                                                                                             |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`            | 원격 및 로컬 서버에 대한 주소와 연결 매개변수를 구축하는 데 사용되는 클러스터의 이름. 지정하지 않으면 `default`로 설정됩니다.                  |
| `db.table` 또는 `db`, `table` | 데이터베이스 및 테이블의 이름.                                                                                                                 |
| `sharding_key`            | 샤딩 키. 선택 사항. 클러스터에 하나 이상의 샤드가 있는 경우 지정해야 합니다.                                                                |

## 반환 값 {#returned_value}

클러스터에서 가져온 데이터 집합입니다.

## 매크로 사용 {#using_macros}

`cluster_name`은 매크로(중괄호로 감싼 대체 값)를 포함할 수 있습니다. 대체된 값은 서버 구성 파일의 [macros](../../operations/server-configuration-parameters/settings.md#macros) 섹션에서 가져옵니다.

예시:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

## 사용법 및 권장 사항 {#usage_recommendations}

`cluster`와 `clusterAllReplicas` 테이블 함수는 `Distributed` 테이블을 생성하는 것보다 효율성이 떨어집니다. 이 경우, 모든 요청에 대해 서버 연결이 재설정되기 때문입니다. 많은 수의 쿼리를 처리할 때는 항상 미리 `Distributed` 테이블을 생성하고, `cluster`와 `clusterAllReplicas` 테이블 함수를 사용하지 마십시오.

`cluster`와 `clusterAllReplicas` 테이블 함수는 다음과 같은 경우에 유용할 수 있습니다:

- 데이터 비교, 디버깅 및 테스트를 위한 특정 클러스터에 액세스할 때.
- 연구 목적을 위한 다양한 ClickHouse 클러스터 및 복제본에 대한 쿼리.
- 수동으로 수행되는 드문 분산 요청.

`host`, `port`, `user`, `password`, `compression`, `secure`와 같은 연결 설정은 `<remote_servers>` 구성 섹션에서 가져옵니다. 자세한 내용은 [Distributed engine](../../engines/table-engines/special/distributed.md)을 참조하십시오.

## 관련 항목 {#related}

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
