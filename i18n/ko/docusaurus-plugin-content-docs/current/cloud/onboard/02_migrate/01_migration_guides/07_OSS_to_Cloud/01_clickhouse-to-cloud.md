---
'sidebar_label': 'ClickHouse OSS'
'slug': '/cloud/migration/clickhouse-to-cloud'
'title': '자체 관리 ClickHouse와 ClickHouse Cloud 간의 마이그레이션'
'description': '자체 관리 ClickHouse와 ClickHouse Cloud 간의 마이그레이션 방법을 설명하는 페이지'
'doc_type': 'guide'
'keywords':
- 'migration'
- 'ClickHouse Cloud'
- 'OSS'
- 'Migrate self-managed to Cloud'
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';


# 자가 관리 ClickHouse와 ClickHouse Cloud 간의 마이그레이션

<Image img={self_managed_01} size='md' alt='자가 관리 ClickHouse 마이그레이션' background='white' />

이 가이드는 자가 관리 ClickHouse 서버에서 ClickHouse Cloud로 마이그레이션하는 방법과 ClickHouse Cloud 서비스 간의 마이그레이션 방법을 보여줍니다. [`remoteSecure`](/sql-reference/table-functions/remote) 함수는 원격 ClickHouse 서버에 대한 접근을 허용하기 위해 `SELECT` 및 `INSERT` 쿼리에서 사용되며, 이는 테이블을 마이그레이션 하는 과정을 `INSERT INTO` 쿼리 작성처럼 간단하게 만듭니다.

## 자가 관리 ClickHouse에서 ClickHouse Cloud로 마이그레이션 {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size='sm' alt='자가 관리 ClickHouse 마이그레이션' background='white' />

:::note
원본 테이블이 샤드되었거나 복제되었는지 여부와 관계없이, ClickHouse Cloud에서는 목적지 테이블을 생성하기만 하면 됩니다(이 테이블에 대해 엔진 매개변수를 생략해도 되며, 자동으로 ReplicatedMergeTree 테이블이 됩니다). ClickHouse Cloud는 수직 및 수평 확장을 자동으로 처리하므로 테이블을 복제하고 샤드하는 방법에 대해 고민할 필요가 없습니다.
:::

이 예제에서 자가 관리 ClickHouse 서버는 *원본*이고, ClickHouse Cloud 서비스는 *목적지*입니다.

### 개요 {#overview}

프로세스는 다음과 같습니다:

1. 원본 서비스에 읽기 전용 사용자 추가
1. 목적지 서비스에서 원본 테이블 구조 복제
1. 네트워크 가용성에 따라 원본에서 목적지로 데이터 풀기 또는 원본에서 데이터 푸시
1. 목적지의 IP 접근 리스트에서 원본 서버 제거 (해당되는 경우)
1. 원본 서비스에서 읽기 전용 사용자 제거

### 시스템 간 테이블 마이그레이션: {#migration-of-tables-from-one-system-to-another}
이 예에서는 자가 관리 ClickHouse 서버에서 ClickHouse Cloud로 하나의 테이블을 마이그레이션합니다.

### 원본 ClickHouse 시스템에서 (현재 데이터를 호스팅하는 시스템) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- 원본 테이블(`db.table` 오른쪽 예)의 데이터를 읽을 수 있는 읽기 전용 사용자 추가
```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

- 테이블 정의 복사
```sql
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```

### 목적지 ClickHouse Cloud 시스템에서: {#on-the-destination-clickhouse-cloud-system}

- 목적지 데이터베이스 생성:
```sql
CREATE DATABASE db
```

- 원본의 CREATE TABLE 문을 사용하여 목적지 생성.

:::tip
CREATE 문을 실행할 때 ENGINE을 ReplicatedMergeTree로 변경하세요. ClickHouse Cloud는 항상 테이블을 복제하며 올바른 매개변수를 제공합니다. `ORDER BY`, `PRIMARY KEY`, `PARTITION BY`, `SAMPLE BY`, `TTL` 및 `SETTINGS` 절은 유지하세요.
:::

```sql
CREATE TABLE db.table ...
```

- 자가 관리 원본에서 데이터 풀기 위해 `remoteSecure` 함수 사용

<Image img={self_managed_03} size='sm' alt='자가 관리 ClickHouse 마이그레이션' background='white' />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
원본 시스템이 외부 네트워크에서 사용할 수 없는 경우, 데이터를 푸시하는 것이 가능하며, `remoteSecure` 함수는 SELECT 및 INSERT 모두에 작동합니다. 다음 옵션을 참고하십시오.
:::

- ClickHouse Cloud 서비스에 데이터를 푸시하기 위해 `remoteSecure` 함수 사용

<Image img={self_managed_04} size='sm' alt='자가 관리 ClickHouse 마이그레이션' background='white' />

:::tip 원격 시스템을 ClickHouse Cloud 서비스의 IP 접근 리스트에 추가
`remoteSecure` 함수가 ClickHouse Cloud 서비스에 연결할 수 있도록 하려면 원격 시스템의 IP 주소가 IP 접근 리스트에 허용되어야 합니다. 추가 정보는 이 팁 아래의 **IP 접근 리스트 관리**를 확장하세요.
:::

  <AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```

## ClickHouse Cloud 서비스 간 마이그레이션 {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size='lg' alt='자가 관리 ClickHouse 마이그레이션' background='white' />

ClickHouse Cloud 서비스 간 데이터 마이그레이션의 몇 가지 예:
- 복원된 백업에서 데이터 마이그레이션
- 개발 서비스에서 스테이징 서비스로 데이터 복사 (또는 스테이징에서 프로덕션으로)

이 예에서는 두 개의 ClickHouse Cloud 서비스가 있으며, 이들은 *원본*과 *목적지*로 참조됩니다. 데이터는 원본에서 목적지로 풀립니다. 원하시면 푸시할 수 있지만 읽기 전용 사용자를 사용하는 점에서 풀기 방식을 보여줍니다.

<Image img={self_managed_06} size='lg' alt='자가 관리 ClickHouse 마이그레이션' background='white' />

마이그레이션에는 몇 가지 단계가 있습니다:
1. 한 ClickHouse Cloud 서비스는 *원본*으로, 다른 한 서비스는 *목적지*로 식별
1. 원본 서비스에 읽기 전용 사용자 추가
1. 목적지 서비스에서 원본 테이블 구조 복제
1. 원본 서비스에 IP 접근을 일시적으로 허용
1. 원본에서 목적지로 데이터 복사
1. 목적지의 IP 접근 리스트 재설정
1. 원본 서비스에서 읽기 전용 사용자 제거

#### 원본 서비스에 읽기 전용 사용자 추가 {#add-a-read-only-user-to-the-source-service}

- 원본 테이블(`db.table` 오른쪽 예)의 데이터를 읽을 수 있는 읽기 전용 사용자 추가
```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

- 테이블 정의 복사
```sql
select create_table_query
from system.tables
where database = 'db' and table = 'table'
```

#### 목적지 서비스에서 테이블 구조 복제 {#duplicate-the-table-structure-on-the-destination-service}

목적지 데이터베이스가 아직 없다면 생성하십시오:

- 목적지 데이터베이스 생성:
```sql
CREATE DATABASE db
```

- 원본의 CREATE TABLE 문을 사용하여 목적지 생성.

  원본의 `select create_table_query...` 출력 결과를 사용하여 목적지에서 테이블 생성:

```sql
CREATE TABLE db.table ...
```

#### 원본 서비스에 원격 접근 허용 {#allow-remote-access-to-the-source-service}

원본에서 목적지로 데이터를 풀기 위해서는 원본 서비스가 연결을 허용해야 합니다. 원본 서비스에서 "IP 접근 리스트" 기능을 일시적으로 비활성화하십시오.

:::tip
원본 ClickHouse Cloud 서비스를 계속 사용할 경우, "어디서든 접근 허용"으로 전환하기 전에 기존 IP 접근 리스트를 JSON 파일로 내보내십시오. 이렇게 하면 데이터 마이그레이션 후 접근 리스트를 다시 불러올 수 있습니다.
:::

허용 목록을 수정하여 임시로 **어디서나** 접근을 허용합니다. 자세한 내용은 [IP 접근 리스트](/cloud/security/setting-ip-filters) 문서를 참조하십시오.

#### 원본에서 목적지로 데이터 복사 {#copy-the-data-from-source-to-destination}

- `remoteSecure` 함수를 사용하여 원본 ClickHouse Cloud 서비스에서 데이터를 풀기
  목적지에 연결합니다. 목적지 ClickHouse Cloud 서비스에서 다음 명령을 실행하십시오:

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

- 목적지 서비스에서 데이터 확인

#### 원본에서 IP 접근 리스트 재설정 {#re-establish-the-ip-access-list-on-the-source}

  이전에 접근 리스트를 내보냈다면, **Share**를 사용하여 다시 가져올 수 있습니다. 그렇지 않은 경우, 접근 리스트에 항목을 다시 추가하십시오.

#### 읽기 전용 `exporter` 사용자 제거 {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- 서비스 IP 접근 리스트를 스위치하여 접근 제한
