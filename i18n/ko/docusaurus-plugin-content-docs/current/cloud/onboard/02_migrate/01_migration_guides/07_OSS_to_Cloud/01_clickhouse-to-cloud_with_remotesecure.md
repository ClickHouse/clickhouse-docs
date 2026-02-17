---
sidebar_label: 'remoteSecure 사용하기'
slug: /cloud/migration/clickhouse-to-cloud
title: '자가 관리형 ClickHouse와 ClickHouse Cloud 간 마이그레이션'
description: '자가 관리형 ClickHouse와 ClickHouse Cloud 간 마이그레이션 방법을 설명하는 페이지'
doc_type: 'guide'
keywords: ['마이그레이션', 'ClickHouse Cloud', 'OSS', '자가 관리형에서 Cloud로 마이그레이션']
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';
import CompatibilityNote from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/compatibility.mdx'


# remoteSecure를 사용하여 자가 관리형 ClickHouse와 ClickHouse Cloud 간 마이그레이션 \{#migrating-between-self-managed-clickhouse-and-clickhouse-cloud-using-remotesecure\}

<Image img={self_managed_01} size='lg' alt='자가 관리형 ClickHouse 마이그레이션'/>

이 가이드는 자가 관리형 ClickHouse 서버에서 ClickHouse Cloud로 마이그레이션하는 방법과 ClickHouse Cloud 서비스 간에 마이그레이션하는 방법을 설명합니다.
[`remoteSecure`](/sql-reference/table-functions/remote) 함수는 `SELECT` 및 `INSERT` 쿼리에서 사용되어 원격 ClickHouse 서버에 접근할 수 있게 해주며, 포함된 `SELECT`를 사용한 `INSERT INTO` 쿼리를 작성하는 것만으로 테이블을 손쉽게 마이그레이션할 수 있게 해줍니다.

## 자가 관리형 ClickHouse에서 ClickHouse Cloud로 마이그레이션 \{#migrating-from-self-managed-clickhouse-to-clickhouse-cloud\}

<Image img={self_managed_02} size='lg' alt='자가 관리형 ClickHouse 마이그레이션'  />

원본 테이블이 세그먼트로 구성되어 있든 레플리카가 있든 관계없이, ClickHouse Cloud에서는 대상 테이블만 생성하면 됩니다(이 테이블에 대해서는 Engine 파라미터를 생략해도 되며, 테이블 엔진으로 `SharedMergeTree`가 자동으로 선택됩니다).
그러면 ClickHouse Cloud가 수직 및 수평 스케일링을 자동으로 처리합니다.
사용자는 테이블을 어떻게 레플리카로 복제하고 세그먼트로 분할할지 고민할 필요가 없습니다.

이 예에서는 자가 관리형 ClickHouse 서버가 *원본*이고, ClickHouse Cloud 서비스가 *대상*입니다.

### 개요 \{#overview\}

프로세스는 다음과 같습니다.

1. 소스 서비스에 읽기 전용 사용자(read-only user)를 추가합니다.
1. 대상 서비스에 소스 테이블과 동일한 구조를 생성합니다.
1. 소스의 네트워크 접근 가능 여부에 따라 대상에서 소스의 데이터를 가져오거나(pull), 소스에서 대상으로 데이터를 전송합니다(push).
1. 대상 서비스의 IP Access List에서 소스 서버를 제거합니다(해당하는 경우).
1. 소스 서비스에서 읽기 전용 사용자를 제거합니다.

### 한 시스템에서 다른 시스템으로 테이블 마이그레이션: \{#migration-of-tables-from-one-system-to-another\}

이 예제에서는 자가 관리형 ClickHouse 서버에서 ClickHouse Cloud로 하나의 테이블을 마이그레이션합니다.

<CompatibilityNote/>

### 소스 ClickHouse 시스템(현재 데이터를 호스팅하는 시스템)에서 \{#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data\}

* 소스 테이블(이 예제에서는 `db.table`)을 읽을 수 있는 읽기 전용 사용자(read-only user)를 추가합니다.

```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

* 테이블 정의를 복사하십시오

```sql
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```


### 대상 ClickHouse Cloud 시스템에서: \{#on-the-destination-clickhouse-cloud-system\}

* 대상 데이터베이스를 생성합니다.

```sql
CREATE DATABASE db
```

* 소스에 있는 CREATE TABLE 문을 사용하여 대상 테이블을 생성합니다.

:::tip
CREATE 문을 실행할 때 ENGINE을 매개변수 없이 ReplicatedMergeTree로 변경하십시오. ClickHouse Cloud는 항상 테이블을 복제하며 올바른 매개변수를 제공합니다. 다만 `ORDER BY`, `PRIMARY KEY`, `PARTITION BY`, `SAMPLE BY`, `TTL`, `SETTINGS` 절은 그대로 유지하십시오.
:::

```sql
CREATE TABLE db.table ...
```

* `remoteSecure` FUNCTION을 사용하여 자가 관리형 ClickHouse 소스에서 데이터를 가져옵니다.

<Image img={self_managed_03} size="lg" alt="자가 관리형 ClickHouse 마이그레이션" />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
소스 시스템에 외부 네트워크에서 접근할 수 없다면 데이터를 끌어오는 대신 푸시할 수 있습니다. `remoteSecure` 함수는 SELECT와 INSERT 모두에서 동작합니다. 다음 옵션을 참고하십시오.
:::

* `remoteSecure` 함수를 사용하여 데이터를 ClickHouse Cloud 서비스로 푸시합니다.

<Image img={self_managed_04} size="lg" alt="자가 관리형 ClickHouse 마이그레이션" />

:::tip ClickHouse Cloud 서비스 IP Access List에 원격 시스템 추가
`remoteSecure` 함수가 ClickHouse Cloud 서비스에 연결하려면 원격 시스템의 IP 주소가 IP Access List에서 허용되어야 합니다. 자세한 내용은 이 안내 아래의 **Manage your IP Access List**를 펼쳐서 확인하십시오.
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```


## ClickHouse Cloud 서비스 간 마이그레이션 \{#migrating-between-clickhouse-cloud-services\}

<Image img={self_managed_05} size='lg' alt='자가 관리형 ClickHouse 마이그레이션'  />

ClickHouse Cloud 서비스 간에 데이터를 마이그레이션하는 몇 가지 예시는 다음과 같습니다:

- 복원된 백업에서 데이터 마이그레이션
- 개발 서비스에서 스테이징 서비스로 데이터 복사(또는 스테이징에서 프로덕션으로 복사)

이 예시에서는 두 개의 ClickHouse Cloud 서비스가 있으며, 각각을 *소스(source)* 와 *대상(destination)* 이라고 합니다. 데이터는 소스에서 대상 서비스로 끌어옵니다. 푸시 방식도 사용할 수 있지만, 여기서는 읽기 전용 사용자(read-only user)를 사용하므로 풀(pull) 방식으로 진행합니다.

<Image img={self_managed_06} size='lg' alt='자가 관리형 ClickHouse 마이그레이션'  />

마이그레이션 단계는 다음과 같습니다:

1. 한 ClickHouse Cloud 서비스를 *소스(source)* 로, 다른 하나를 *대상(destination)* 으로 지정합니다
1. 소스 서비스에 읽기 전용 사용자(read-only user)를 추가합니다
1. 대상 서비스에 소스 테이블 구조를 동일하게 생성합니다
1. 소스 서비스에 일시적으로 IP 액세스를 허용합니다
1. 소스에서 대상로 데이터를 복사합니다
1. 대상 서비스에서 IP 액세스 목록(IP Access List)을 다시 설정합니다
1. 소스 서비스에서 읽기 전용 사용자를 제거합니다

#### 소스 서비스에 읽기 전용 사용자 추가 \{#add-a-read-only-user-to-the-source-service\}

- 소스 테이블(`db.table` 예시)을 조회할 수 있는 읽기 전용 사용자를 추가합니다.
  ```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
  ```

  ```sql
  GRANT SELECT ON db.table TO exporter;
  ```

- 테이블 정의를 복사합니다.
  ```sql
  select create_table_query
  from system.tables
  where database = 'db' and table = 'table'
  ```

#### 대상 서비스에 테이블 구조 복제하기 \{#duplicate-the-table-structure-on-the-destination-service\}

대상 서비스에 데이터베이스가 아직 없다면 생성합니다.

- 대상 데이터베이스를 생성합니다.
  ```sql
  CREATE DATABASE db
  ```

- 소스의 CREATE TABLE 구문을 사용하여 대상에 테이블을 생성합니다.

  대상에서 소스에서 실행한 `select create_table_query...`의 출력 결과를 사용하여 테이블을 생성합니다.
  ```sql
  CREATE TABLE db.table ...
  ```

#### 소스 서비스에 대한 원격 액세스 허용 \{#allow-remote-access-to-the-source-service\}

소스 서비스에서 대상 서비스로 데이터를 가져오려면 소스 서비스가 연결을 허용해야 합니다. 소스 서비스에서 일시적으로 「IP Access List」 기능을 비활성화하십시오.

:::tip
소스 ClickHouse Cloud 서비스를 계속 사용할 예정이라면, 어디서나 액세스를 허용하도록 변경하기 전에 기존 「IP Access List」를 JSON 파일로 내보내십시오. 이렇게 하면 데이터 마이그레이션이 완료된 후 액세스 목록을 다시 가져올 수 있습니다.
:::

허용 목록을 수정하여 일시적으로 **Anywhere**에서의 액세스를 허용하십시오. 자세한 내용은 [IP Access List](/cloud/security/setting-ip-filters) 문서를 참조하십시오.

#### 소스에서 대상 서비스로 데이터를 복사합니다 \{#copy-the-data-from-source-to-destination\}

- `remoteSecure` 함수를 사용하여 소스 ClickHouse Cloud 서비스에서 데이터를 가져옵니다.  
  대상 서비스에 연결한 후, 대상 ClickHouse Cloud 서비스에서 다음 명령을 실행합니다:

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- 대상 서비스에 데이터가 올바르게 복사되었는지 확인합니다

#### 소스에서 IP 액세스 목록을 다시 구성합니다 \{#re-establish-the-ip-access-list-on-the-source\}

이전에 액세스 목록을 내보냈다면 **Share**를 사용하여 다시 가져올 수 있으며, 내보내지 않았다면 액세스 목록에 항목을 다시 추가합니다.

#### 읽기 전용 `exporter` 사용자 제거 \{#remove-the-read-only-exporter-user\}

```sql
DROP USER exporter
```

* 서비스 IP 액세스 목록을 변경하여 접근을 제한합니다
