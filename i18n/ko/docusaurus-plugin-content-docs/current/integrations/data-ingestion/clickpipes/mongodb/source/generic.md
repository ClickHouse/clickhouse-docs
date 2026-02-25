---
sidebar_label: '범용 MongoDB'
description: '임의의 MongoDB 인스턴스를 ClickPipes 소스로 설정합니다'
slug: /integrations/clickpipes/mongodb/source/generic
title: '범용 MongoDB 소스 설정 가이드'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 일반 MongoDB 소스 설정 가이드 \{#generic-mongodb-source-setup-guide\}

:::info

MongoDB Atlas를 사용하는 경우 [여기](./atlas)의 전용 가이드를 참고하십시오.

:::

## oplog 보존 기간 활성화 \{#enable-oplog-retention\}

복제를 위해서는 최소 24시간의 oplog 보존 기간이 필요합니다. 초기 스냅샷이 완료되기 전에 oplog가 삭제되지 않도록 oplog 보존 기간을 72시간 이상으로 설정할 것을 권장합니다.

MongoDB 셸에서 다음 명령을 실행하여 현재 oplog 보존 기간을 확인할 수 있습니다 (`clusterMonitor` 역할이 있어야 이 명령을 실행할 수 있습니다):

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

oplog 보존 기간을 72시간으로 설정하려면 레플리카 세트의 각 노드에서 관리자 권한으로 다음 명령을 실행하십시오.

```javascript
db.adminCommand({
    "replSetResizeOplog" : 1,
    "minRetentionHours": 72
})
```

`replSetResizeOplog` 명령과 oplog 보존(retention)에 대한 자세한 내용은 [MongoDB 문서](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/)를 참조하십시오.


## 데이터베이스 사용자 구성 \{#configure-database-user\}

MongoDB 인스턴스에 관리자 권한 계정으로 연결한 후, MongoDB CDC ClickPipes용 사용자를 생성하기 위해 다음 명령을 실행합니다:

```javascript
db.getSiblingDB("admin").createUser({
    user: "clickpipes_user",
    pwd: "some_secure_password",
    roles: ["readAnyDatabase", "clusterMonitor"],
})
```

:::note

`clickpipes_user`와 `some_secure_password`를 설정하려는 사용자 이름과 비밀번호로 반드시 변경하십시오.

:::


## 다음 단계 \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하고 MongoDB 인스턴스에서 ClickHouse Cloud로 데이터를 수집하기 시작할 수 있습니다.
MongoDB 인스턴스를 설정할 때 사용한 연결 정보를 꼭 기록해 두십시오. ClickPipe 생성 과정에서 해당 정보가 필요합니다.