---
'sidebar_label': '일반 MongoDB'
'description': 'ClickPipes를 위한 소스로 MongoDB 인스턴스를 설정하십시오.'
'slug': '/integrations/clickpipes/mongodb/source/generic'
'title': '일반 MongoDB 소스 설정 가이드'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mongodb'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---


# 일반 MongoDB 소스 설정 가이드

:::info

MongoDB Atlas를 사용하는 경우, 특정 가이드를 [여기](./atlas)에서 참조하십시오.

:::

## oplog 보존 활성화 {#enable-oplog-retention}

복제를 위해 최소 24시간의 oplog 보존이 필요합니다. 초기 스냅샷이 완료되기 전에 oplog가 잘리지 않도록 oplog 보존을 72시간 이상으로 설정하는 것을 권장합니다.

MongoDB 셸에서 다음 명령을 실행하여 현재 oplog 보존 시간을 확인할 수 있습니다(이 명령을 실행하려면 `clusterMonitor` 역할이 필요합니다):

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

복제 세트의 각 노드에서 관리 사용자로서 oplog 보존을 72시간으로 설정하려면 다음 명령을 실행하십시오:

```javascript
db.adminCommand({
    "replSetResizeOplog" : 1,
    "minRetentionHours": 72
})
```

`replSetResizeOplog` 명령 및 oplog 보존에 대한 더 많은 세부정보는 [MongoDB 문서](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/)를 참조하십시오.

## 데이터베이스 사용자 구성 {#configure-database-user}

관리 사용자로 MongoDB 인스턴스에 연결하고 MongoDB CDC ClickPipes를 위한 사용자를 만들기 위해 다음 명령을 실행하십시오:

```javascript
db.getSiblingDB("admin").createUser({
    user: "clickpipes_user",
    pwd: "some_secure_password",
    roles: ["readAnyDatabase", "clusterMonitor"],
})
```

:::note

`clickpipes_user` 및 `some_secure_password`를 원하는 사용자 이름과 비밀번호로 바꾸는 것을 잊지 마십시오.

:::

## 다음 단계는 무엇인가요? {#whats-next}

이제 [ClickPipe를 생성](../index.md)하고 MongoDB 인스턴스에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다.
MongoDB 인스턴스를 설정할 때 사용한 연결 세부정보를 기록해 두십시오. ClickPipe 생성 과정에서 필요합니다.
