---
description: '분산 DDL에 대한 문서'
sidebar_label: 'Distributed DDL'
sidebar_position: 3
slug: /sql-reference/distributed-ddl
title: '분산 DDL 쿼리(ON CLUSTER 절)'
doc_type: 'reference'
---

기본적으로 `CREATE`, `DROP`, `ALTER`, `RENAME` 쿼리는 실행되는 현재 서버에만 영향을 줍니다. 클러스터 환경에서는 이러한 쿼리를 `ON CLUSTER` 절과 함께 사용하여 분산 방식으로 실행할 수 있습니다.

예를 들어, 다음 쿼리는 `cluster` 내 각 호스트에 `all_hits` `Distributed` 테이블을 생성합니다:

```sql
CREATE TABLE IF NOT EXISTS all_hits ON CLUSTER cluster (p Date, i Int32) ENGINE = Distributed(cluster, default, hits)
```

이러한 쿼리를 올바르게 실행하려면 각 호스트가 동일한 클러스터 정의를 가지고 있어야 합니다(구성 동기화를 단순화하기 위해 ZooKeeper의 substitution 기능을 사용할 수 있습니다). 또한 ZooKeeper 서버에 연결되어 있어야 합니다.

쿼리의 로컬 버전은 일부 호스트를 현재 사용할 수 없더라도 클러스터 내 각 호스트에서 결국 실행됩니다.

:::important
단일 호스트 내에서 쿼리가 실행되는 순서는 보장됩니다.
:::
