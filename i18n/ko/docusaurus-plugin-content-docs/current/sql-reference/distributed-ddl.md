---
'description': 'Distributed Ddl에 대한 문서'
'sidebar_label': 'Distributed DDL'
'sidebar_position': 3
'slug': '/sql-reference/distributed-ddl'
'title': '분산 DDL 쿼리 (ON CLUSTER 절)'
'doc_type': 'reference'
---

기본적으로 `CREATE`, `DROP`, `ALTER`, 및 `RENAME` 쿼리는 실행되는 현재 서버에만 영향을 미칩니다. 클러스터 설정에서는 `ON CLUSTER` 절을 사용하여 이러한 쿼리를 분산 방식으로 실행할 수 있습니다.

예를 들어, 다음 쿼리는 `cluster`의 각 호스트에서 `all_hits` `Distributed` 테이블을 생성합니다:

```sql
CREATE TABLE IF NOT EXISTS all_hits ON CLUSTER cluster (p Date, i Int32) ENGINE = Distributed(cluster, default, hits)
```

이러한 쿼리를 올바르게 실행하기 위해서는 각 호스트가 동일한 클러스터 정의를 가져야 합니다 (구성 파일 동기화를 단순화하려면 ZooKeeper의 치환을 사용할 수 있습니다). 또한 ZooKeeper 서버에 연결해야 합니다.

로컬 쿼리의 버전은 클러스터의 각 호스트에서 결국 실행되며, 일부 호스트가 현재 사용할 수 없더라도 실행됩니다.

:::important    
단일 호스트 내에서 쿼리를 실행하는 순서는 보장됩니다.
:::
