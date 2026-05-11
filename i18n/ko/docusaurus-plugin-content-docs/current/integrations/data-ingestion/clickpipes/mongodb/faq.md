---
sidebar_label: 'FAQ'
description: 'MongoDB용 ClickPipes에 대한 자주 묻는 질문.'
slug: /integrations/clickpipes/mongodb/faq
sidebar_position: 2
title: 'MongoDB용 ClickPipes FAQ'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# MongoDB용 ClickPipes 자주 묻는 질문(FAQ) \{#clickpipes-for-mongodb-faq\}

### JSON 데이터 타입에서 개별 필드를 쿼리할 수 있습니까? \{#can-i-query-for-individual-fields-in-the-json-datatype\}

`{"user_id": 123}`와 같은 JSON 객체의 개별 필드에 직접 접근하려면 **dot notation(점 표기법)**을 사용하면 됩니다:

```sql
SELECT doc.user_id as user_id FROM your_table;
```

`{"address": { "city": "San Francisco", "state": "CA" }}`와 같은 중첩 객체의 필드에 직접 접근하려면 `^` 연산자를 사용합니다:

```sql
SELECT doc.^address.city AS city FROM your_table;
```

집계를 수행할 때는 `CAST` 함수 또는 `::` 구문을 사용하여 필드를 적절한 타입으로 변환합니다:

```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```

JSON을 다루는 방법에 대해 더 자세히 알아보려면 [JSON 작업 가이드](./quickstart)를 참조하십시오.


### ClickHouse에서 중첩된 MongoDB 도큐먼트를 평탄화하려면 어떻게 해야 합니까? \{#how-do-i-flatten-the-nested-mongodb-documents-in-clickhouse\}

MongoDB 도큐먼트는 기본적으로 ClickHouse에서 JSON 유형으로 복제되며, 중첩 구조가 그대로 유지됩니다. 이 데이터를 평탄화하는 방법은 여러 가지가 있습니다. 데이터를 컬럼으로 평탄화하려면 일반 뷰, materialized view, 또는 쿼리 시점 접근 방식을 사용할 수 있습니다.

1. **일반 뷰(Normal Views)**: 일반 뷰를 사용하여 평탄화 로직을 캡슐화합니다.
2. **Materialized Views**: 작은 데이터셋의 경우, [`FINAL` 수정자](/sql-reference/statements/select/from#final-modifier)를 사용하는 갱신 가능한 materialized view를 사용하여 주기적으로 데이터를 평탄화하고 중복을 제거할 수 있습니다. 큰 데이터셋의 경우, `FINAL` 없이 증분형 materialized view를 사용하여 데이터를 실시간으로 평탄화한 뒤, 쿼리 시점에 데이터를 중복 제거할 것을 권장합니다.
3. **쿼리 시점 접근(Query-time Access)**: 평탄화 대신, 쿼리에서 점 표기법(dot notation)을 사용하여 중첩 필드에 직접 접근합니다.

자세한 예시는 [JSON 사용 가이드](./quickstart)를 참고하십시오.

### 공인 IP가 없거나 사설 네트워크에 있는 MongoDB 데이터베이스에 연결할 수 있습니까? \{#can-i-connect-mongodb-databases-that-dont-have-a-public-ip-or-are-in-private-networks\}

공인 IP가 없거나 사설 네트워크에 있는 MongoDB 데이터베이스에 연결하기 위해 AWS PrivateLink를 통한 연결을 지원합니다. Azure Private Link와 GCP Private Service Connect는 현재 지원되지 않습니다.

### MongoDB 데이터베이스에서 데이터베이스/테이블을 삭제하면 어떻게 됩니까? \{#what-happens-if-i-delete-a-database-table-from-my-mongodb-database\}

MongoDB에서 데이터베이스/테이블을 삭제하면 ClickPipes는 계속 실행되지만, 삭제된 데이터베이스/테이블의 변경 내용 복제는 중지됩니다. ClickHouse의 해당 테이블은 보존됩니다.

### MongoDB CDC Connector는 트랜잭션을 어떻게 처리합니까? \{#how-does-mongodb-cdc-connector-handle-transactions\}

트랜잭션 내 각 문서의 변경은 ClickHouse에서 개별적으로 처리됩니다. 변경 사항은 oplog에 나타나는 순서대로 적용되며, 커밋된 변경 사항만 ClickHouse로 복제됩니다. MongoDB 트랜잭션이 롤백되면 해당 변경 사항은 change stream에 나타나지 않습니다.

자세한 예시는 [JSON 활용 가이드](./quickstart)를 참고하십시오.

### `resume of change stream was not possible, as the resume point may no longer be in the oplog.` 오류는 어떻게 처리해야 합니까? \{#resume-point-may-no-longer-be-in-the-oplog-error\}

이 오류는 일반적으로 oplog가 잘려 ClickPipe가 예상 지점에서 change stream을 재개하지 못할 때 발생합니다. 이 문제를 해결하려면 [ClickPipe를 다시 동기화](./resync.md)하십시오. 이 문제가 다시 발생하지 않도록 oplog 보존 기간을 늘릴 것을 권장합니다. 자세한 내용은 [MongoDB Atlas](./source/atlas#enable-oplog-retention), [자가 관리형 MongoDB](./source/generic#enable-oplog-retention), 또는 [Amazon DocumentDB](./source/documentdb#configure-change-stream-log-retention) 관련 문서를 참고하십시오.

### 복제는 어떻게 관리되나요? \{#how-is-replication-managed\}

MongoDB의 네이티브 Change Streams API를 사용하여 데이터베이스 변경 사항을 추적합니다. Change Streams API는 MongoDB의 oplog(operations log)를 활용하여 재개 가능한 데이터베이스 변경 스트림을 제공합니다. ClickPipe는 MongoDB의 resume token을 사용해 oplog 내 위치를 추적하고, 모든 변경 사항이 ClickHouse로 복제되도록 보장합니다.

### 어떤 read preference를 사용해야 합니까? \{#which-read-preference-should-i-use\}

어떤 read preference를 사용할지는 구체적인 사용 시나리오에 따라 달라집니다. 기본(primary) 노드의 부하를 최소화하려면 `secondaryPreferred` read preference 사용을 권장합니다. 데이터 수집 지연 시간을 최적화하려면 `primaryPreferred` read preference 사용을 권장합니다. 자세한 내용은 [MongoDB 문서](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1)를 참고하십시오.

### MongoDB ClickPipe는 Sharded Cluster를 지원합니까? \{#does-the-mongodb-clickpipe-support-sharded-cluster\}

예 MongoDB ClickPipe는 Replica Set과 Sharded Cluster를 모두 지원합니다.

### MongoDB ClickPipe는 Amazon DocumentDB를 지원합니까? \{#documentdb-support\}

예. MongoDB ClickPipe는 Amazon DocumentDB 5.0을 지원합니다. 자세한 내용은 [Amazon DocumentDB 소스 설정 가이드](./source/documentdb.md)를 참고하십시오.

### MongoDB ClickPipe에서 PrivateLink를 지원하나요? \{#privatelink-support\}

MongoDB(및 DocumentDB) 클러스터에 대해서는 AWS에서만 PrivateLink를 지원합니다. 

단일 노드 관계형 데이터베이스와 달리 MongoDB 클라이언트는 설정된 `ReadPreference`를 올바르게 적용하기 위해 레플리카 셋(replica set) 디스커버리가 성공해야 합니다. 이를 위해서는 클러스터의 모든 노드에 대해 PrivateLink를 설정하여 MongoDB 클라이언트가 레플리카 셋 연결을 정상적으로 수립하고, 연결된 노드에 장애가 발생했을 때 다른 노드로 연결을 전환할 수 있도록 해야 합니다.

클러스터 내 단일 노드에만 연결하기를 원하는 경우, ClickPipes 설정 시 연결 문자열에 `/?directConnection=true` 를 지정하여 레플리카 셋 디스커버리를 건너뛸 수 있습니다. 이 경우 PrivateLink 설정은 단일 노드 관계형 데이터베이스와 유사하며, PrivateLink를 지원하는 가장 단순한 옵션입니다.

레플리카 셋 연결을 사용하는 경우, MongoDB에 대해 VPC Resource 또는 VPC Endpoint Service를 사용하여 PrivateLink를 설정할 수 있습니다. VPC Resource를 선택하면 `GROUP` 리소스 구성 하나와 클러스터 내 각 노드에 대한 `CHILD` 리소스 구성이 필요합니다. VPC Endpoint Service를 선택하면 클러스터 내 각 노드마다 별도의 Endpoint Service(및 별도의 NLB)를 생성해야 합니다. 

자세한 내용은 [AWS PrivateLink for ClickPipes](../aws-privatelink.md) 문서를 참고하십시오. 도움이 필요하면 ClickHouse 지원팀에 문의하십시오.