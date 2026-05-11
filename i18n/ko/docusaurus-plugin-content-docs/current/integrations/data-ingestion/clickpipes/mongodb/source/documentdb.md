---
sidebar_label: 'Amazon DocumentDB'
description: 'Amazon DocumentDB를 ClickPipes 소스로 설정하는 단계별 가이드'
slug: /integrations/clickpipes/mongodb/source/documentdb
title: 'Amazon DocumentDB 소스 설정 가이드'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'documentdb', 'cdc', '데이터 수집', '실시간 동기화']
---

import docdb_select_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-select-parameter-group.png'
import docdb_modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-modify-parameter-group.png'
import docdb_apply_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-apply-parameter-group.png'
import docdb_parameter_group_status from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-parameter-group-status.png'
import Image from '@theme/IdealImage';


# Amazon DocumentDB 소스 설정 가이드 \{#amazon-documentdb-source-setup-guide\}

## ClickPipes가 지원하는 DocumentDB 버전 \{#supported-documentdb-versions\}

ClickPipes는 DocumentDB 5.0 버전을 지원합니다.

## 변경 스트림 로그 보존 구성 \{#configure-change-stream-log-retention\}

기본적으로 Amazon DocumentDB의 변경 스트림 로그 보존 기간은 3시간이며, 초기 적재는 DocumentDB에 이미 존재하는 데이터 양에 따라 훨씬 더 오래 걸릴 수 있습니다. 초기 스냅샷이 완료되기 전에 로그가 잘리지 않도록 변경 스트림 로그 보존 기간을 72시간 이상으로 설정하는 것이 좋습니다.

### AWS Console을 통해 change stream 로그 보존 기간 업데이트 \{#update-change-stream-log-retention-via-aws-console\}

1. 왼쪽 패널에서 `Parameter groups`를 클릭한 다음, DocumentDB 클러스터에서 사용 중인 파라미터 그룹을 찾습니다. 기본 파라미터 그룹을 사용 중이라면, 수정하기 위해 먼저 새 파라미터 그룹을 생성해야 합니다.

<Image img={docdb_select_parameter_group} alt="파라미터 그룹 선택" size="lg" border/>

2. `change_stream_log_retention_duration`을 검색한 후 선택하여 값을 `259200`(72시간)으로 수정합니다.

<Image img={docdb_modify_parameter_group} alt="파라미터 그룹 수정" size="lg" border/>

3. `Apply Changes`를 클릭하여 수정된 파라미터 그룹을 즉시 DocumentDB 클러스터에 적용합니다. 파라미터 그룹의 상태가 `applying`으로 변경되었다가, 변경 사항 적용이 완료되면 `in-sync`로 전환되는 것을 확인할 수 있습니다.

<Image img={docdb_apply_parameter_group} alt="파라미터 그룹 적용" size="lg" border/>

<Image img={docdb_parameter_group_status} alt="파라미터 그룹 상태" size="lg" border/>

### AWS CLI를 사용하여 변경 스트림 로그 보존 기간 업데이트 \{#update-change-stream-log-retention-via-aws-cli\}

또는 AWS CLI를 사용하여 구성할 수 있습니다.

현재 변경 스트림 로그 보존 기간을 확인하려면:

```shell
aws docdb describe-db-cluster-parameters --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --query "Parameters[?ParameterName=='change_stream_log_retention_duration'].{Name:ParameterName,Value:ParameterValue}"
```

변경 스트림 로그 보존 기간을 72시간으로 설정하려면:

```shell
aws docdb modify-db-cluster-parameter-group --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --parameters "ParameterName=change_stream_log_retention_duration,ParameterValue=259200,ApplyMethod=immediate"
```


## 데이터베이스 사용자 구성 \{#configure-database-user\}

관리자 계정으로 DocumentDB 클러ستر에 연결한 후, MongoDB CDC ClickPipes에 사용할 데이터베이스 사용자를 생성하려면 다음 명령을 실행합니다.

```javascript
db.getSiblingDB("admin").createUser({
    user: "clickpipes_user",
    pwd: "some_secure_password",
    roles: ["readAnyDatabase", "clusterMonitor"],
})
```

:::note
`clickpipes_user`와 `some_secure_password`를 사용하려는 사용자 이름과 비밀번호로 반드시 교체하십시오.
:::


## 다음 단계는? \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하여 DocumentDB 인스턴스의 데이터를 ClickHouse Cloud로 수집할 수 있습니다.
ClickPipe를 생성하는 과정에서 필요하므로, DocumentDB 클러스터를 설정할 때 사용한 연결 정보를 반드시 기록해 두십시오.