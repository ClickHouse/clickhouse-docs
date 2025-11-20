---
'sidebar_label': '자주 묻는 질문'
'description': 'MongoDB에 대한 ClickPipes에 대한 자주 묻는 질문.'
'slug': '/integrations/clickpipes/mongodb/faq'
'sidebar_position': 2
'title': 'ClickPipes for MongoDB 자주 묻는 질문'
'doc_type': 'reference'
'keywords':
- 'clickpipes'
- 'mongodb'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---


# ClickPipes for MongoDB FAQ

### JSON 데이터 유형의 개별 필드를 쿼리할 수 있나요? {#can-i-query-for-individual-fields-in-the-json-datatype}

직접 필드 접근을 위해, 예를 들어 `{"user_id": 123}`와 같은 경우에는 **점 표기법**을 사용할 수 있습니다:
```sql
SELECT doc.user_id as user_id FROM your_table;
```
중첩된 객체 필드의 직접 필드 접근, 예를 들어 `{"address": { "city": "San Francisco", "state": "CA" }}`와 같은 경우에는 `^` 연산자를 사용하세요:
```sql
SELECT doc.^address.city AS city FROM your_table;
```
집계를 위해서는 필드를 적절한 타입으로 변환하기 위해 `CAST` 함수 또는 `::` 문법을 사용하세요:
```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```
JSON 작업에 대한 더 자세한 정보는 [JSON 작업 가이드](./quickstart)를 참조하세요.

### ClickHouse에서 중첩된 MongoDB 문서를 어떻게 평탄화하나요? {#how-do-i-flatten-the-nested-mongodb-documents-in-clickhouse}

MongoDB 문서는 기본적으로 JSON 유형으로 ClickHouse에 복제되며, 중첩 구조를 유지합니다. 이 데이터를 평탄화하기 위한 여러 가지 방법이 있습니다. 데이터를 컬럼으로 평탄화하려면 일반 뷰, 물리화된 뷰 또는 쿼리 시간 접근을 사용할 수 있습니다.

1. **일반 뷰**: 일반 뷰를 사용하여 평탄화 로직을 캡슐화합니다.
2. **물리화된 뷰**: 작은 데이터셋의 경우, 주기적으로 데이터를 평탄화하고 중복을 제거하기 위해 [`FINAL` 수정자](/sql-reference/statements/select/from#final-modifier)가 있는 새로 고침 가능한 물리화된 뷰를 사용할 수 있습니다. 큰 데이터셋의 경우, `FINAL` 없이 증분 물리화된 뷰를 사용하여 실시간으로 데이터를 평탄화한 다음, 쿼리 시간에 데이터를 중복 제거하는 것을 권장합니다.
3. **쿼리 시간 접근**: 평탄화 대신 점 표기법을 사용하여 쿼리에서 중첩 필드에 직접 접근하세요.

자세한 예시는 [JSON 작업 가이드](./quickstart)를 참조하세요.

### 공인 IP가 없거나 개인 네트워크에 있는 MongoDB 데이터베이스에 연결할 수 있나요? {#can-i-connect-mongodb-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

공인 IP가 없거나 개인 네트워크에 있는 MongoDB 데이터베이스에 연결하기 위해 AWS PrivateLink를 지원합니다. 현재 Azure Private Link 및 GCP Private Service Connect는 지원하지 않습니다.

### MongoDB 데이터베이스에서 데이터베이스/테이블을 삭제하면 무엇이 발생하나요? {#what-happens-if-i-delete-a-database-table-from-my-mongodb-database}

MongoDB에서 데이터베이스/테이블을 삭제하면 ClickPipes는 계속 실행되지만, 삭제된 데이터베이스/테이블은 변경 사항 복제를 중지합니다. ClickHouse의 해당 테이블은 유지됩니다.

### MongoDB CDC 커넥터는 트랜잭션을 어떻게 처리하나요? {#how-does-mongodb-cdc-connector-handle-transactions}

트랜잭션 내의 각 문서 변경 사항은 ClickHouse로 개별적으로 처리됩니다. 변경 사항은 oplog에 나타나는 순서대로 적용되며, 커밋된 변경 사항만 ClickHouse에 복제됩니다. MongoDB 트랜잭션이 롤백되면, 해당 변경 사항은 변경 스트림에 나타나지 않습니다.

더 많은 예시는 [JSON 작업 가이드](./quickstart)를 참조하세요.

### `resume of change stream was not possible, as the resume point may no longer be in the oplog.` 오류를 어떻게 처리하나요? {#resume-point-may-no-longer-be-in-the-oplog-error}

이 오류는 일반적으로 oplog가 잘리면 발생하며, ClickPipe가 예상 지점에서 변경 스트림을 재개할 수 없음을 의미합니다. 이 문제를 해결하려면 [ClickPipe를 다시 동기화](./resync.md)하세요. 이 문제가 재발하지 않도록 하려면, [oplog 보존 기간을 늘리는 것을 권장합니다](./source/atlas#enable-oplog-retention) (자체 관리 MongoDB의 경우 [여기](./source/generic#enable-oplog-retention)를 참조하세요).

### 복제는 어떻게 관리되나요? {#how-is-replication-managed}

우리는 MongoDB의 네이티브 변경 스트림 API를 사용하여 데이터베이스의 변경 사항을 추적합니다. 변경 스트림 API는 MongoDB의 oplog(작업 로그)를 활용하여 데이터베이스 변경 사항의 재개 가능한 스트림을 제공합니다. ClickPipe는 MongoDB의 재개 토큰을 사용하여 oplog 내 위치를 추적하고 모든 변경 사항이 ClickHouse에 복제되도록 합니다.

### 어떤 읽기 기본 설정을 사용해야 하나요? {#which-read-preference-should-i-use}

어떤 읽기 기본 설정을 사용할지는 특정 사용 사례에 따라 다릅니다. 기본 노드의 부담을 최소화하려면 `secondaryPreferred` 읽기 기본 설정을 사용하는 것이 좋습니다. 수집 지연을 최적화하려면 `primaryPreferred` 읽기 기본 설정을 사용하는 것이 좋습니다. 자세한 내용은 [MongoDB 문서](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1)를 참조하세요.

### MongoDB ClickPipe는 샤드 클러스터를 지원하나요? {#does-the-mongodb-clickpipe-support-sharded-cluster}
예, MongoDB ClickPipe는 복제 세트와 샤드 클러스터를 모두 지원합니다.
