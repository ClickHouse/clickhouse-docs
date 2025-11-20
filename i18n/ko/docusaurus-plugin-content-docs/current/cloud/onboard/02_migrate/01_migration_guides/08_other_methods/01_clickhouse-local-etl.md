---
'sidebar_label': 'clickhouse-local 사용'
'keywords':
- 'clickhouse'
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'clickhouse-local'
- 'clickhouse-client'
'slug': '/cloud/migration/clickhouse-local'
'title': 'ClickHouse로 이주하기 위한 clickhouse-local 사용'
'description': 'clickhouse-local을 사용하여 ClickHouse로 이주하는 방법을 보여주는 가이드'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import AddARemoteSystem from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import ch_local_01 from '@site/static/images/integrations/migration/ch-local-01.png';
import ch_local_02 from '@site/static/images/integrations/migration/ch-local-02.png';
import ch_local_03 from '@site/static/images/integrations/migration/ch-local-03.png';
import ch_local_04 from '@site/static/images/integrations/migration/ch-local-04.png';


# ClickHouse로 마이그레이션하기: clickhouse-local 사용하기

<Image img={ch_local_01} size='sm' alt='자체 관리 ClickHouse로의 마이그레이션' background='white' />

ClickHouse, 보다 구체적으로는 [`clickhouse-local`](/operations/utilities/clickhouse-local.md)을 ETL 도구로 사용하여 현재 데이터베이스 시스템에서 ClickHouse Cloud로 데이터를 마이그레이션할 수 있습니다. 현재 데이터베이스 시스템에 기본 제공되는 ClickHouse [통합 엔진](/engines/table-engines/#integration-engines) 또는 [테이블 함수](/sql-reference/table-functions/)가 있거나, 공급자가 제공하는 JDBC 드라이버 또는 ODBC 드라이버가 사용 가능해야 합니다.

이 마이그레이션 방법을 "회전(pivot)" 방식이라고 부르기도 합니다. 이는 데이터 소스 데이터베이스에서 대상 데이터베이스로 데이터를 전송하기 위해 중간 회전 포인트 또는 홉을 사용하는 방법입니다. 예를 들어, 보안 요구 사항으로 인해 내부 네트워크 내에서 아웃바운드 연결만 허용되는 경우 이 방법이 필요할 수 있으며, 이 경우 clickhouse-local을 사용하여 소스 데이터베이스에서 데이터를 가져온 후, 그 데이터를 대상 ClickHouse 데이터베이스로 푸시하게 됩니다. 이때 clickhouse-local이 회전 포인트 역할을 합니다.

ClickHouse는 [MySQL](/engines/table-engines/integrations/mysql/), [PostgreSQL](/engines/table-engines/integrations/postgresql), [MongoDB](/engines/table-engines/integrations/mongodb) 및 [SQLite](/engines/table-engines/integrations/sqlite)에 대한 통합 엔진과 테이블 함수를 제공합니다 (이 함수는 즉석에서 통합 엔진을 생성합니다). 다른 모든 인기 있는 데이터베이스 시스템의 경우, 해당 시스템 공급자로부터 JDBC 드라이버 또는 ODBC 드라이버가 제공됩니다.

## clickhouse-local이란 무엇인가? {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='자체 관리 ClickHouse로의 마이그레이션' background='white' />

일반적으로 ClickHouse는 여러 인스턴스의 ClickHouse 데이터베이스 엔진이 다양한 서버에서 분산 방식으로 실행되는 클러스터 형태로 실행됩니다.

단일 서버에서 ClickHouse 데이터베이스 엔진은 `clickhouse-server` 프로그램의 일부로 실행됩니다. 데이터베이스 접근(경로, 사용자, 보안 등)은 서버 구성 파일로 설정됩니다.

`clickhouse-local` 도구는 ClickHouse 데이터베이스 엔진을 명령줄 유틸리티 방식으로 격리하여, ClickHouse 서버를 구성하고 시작할 필요 없이 많은 입력 및 출력에 대해 신속한 SQL 데이터 처리를 수행할 수 있도록 합니다.

## clickhouse-local 설치하기 {#installing-clickhouse-local}

`clickhouse-local`을 실행할 호스트 머신은 현재 소스 데이터베이스 시스템과 ClickHouse Cloud 타겟 서비스 모두에 네트워크 접근이 가능해야 합니다.

그 호스트 머신에서, 컴퓨터의 운영 체제에 따라 적절한 `clickhouse-local` 빌드를 다운로드합니다:

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. `clickhouse-local`을 로컬에서 다운로드하는 가장 간단한 방법은 다음 명령어를 실행하는 것입니다:
```bash
curl https://clickhouse.com/ | sh
```

1. `clickhouse-local`을 실행합니다 (단순히 버전을 출력합니다):
```bash
./clickhouse-local
```

</TabItem>
<TabItem value="mac" label="macOS">

1. `clickhouse-local`을 로컬에서 다운로드하는 가장 간단한 방법은 다음 명령어를 실행하는 것입니다:
```bash
curl https://clickhouse.com/ | sh
```

1. `clickhouse-local`을 실행합니다 (단순히 버전을 출력합니다):
```bash
./clickhouse local
```

</TabItem>
</Tabs>

:::info 중요
이 가이드의 예제는 `clickhouse-local`을 실행하기 위한 Linux 명령을 사용합니다 (`./clickhouse-local`).
Mac에서 `clickhouse-local`을 실행하려면 `./clickhouse local`을 사용하세요.
:::

:::tip ClickHouse Cloud 서비스 IP 접근 목록에 원격 시스템 추가
`remoteSecure` 함수가 ClickHouse Cloud 서비스에 연결할 수 있도록 하려면, 원격 시스템의 IP 주소가 IP 접근 목록에서 허용되어야 합니다. 이 팁 아래의 **IP 접근 목록 관리**를 확장하여 자세한 정보를 확인하세요.
:::

  <AddARemoteSystem />

## 예제 1: 통합 엔진을 사용하여 MySQL에서 ClickHouse Cloud로 마이그레이션하기 {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

우리는 소스 MySQL 데이터베이스에서 데이터를 읽기 위해 [통합 테이블 엔진](/engines/table-engines/integrations/mysql/) (즉석에서 생성되는 [mysql 테이블 함수](/sql-reference/table-functions/mysql/))을 사용할 것이며, ClickHouse Cloud 서비스의 대상 테이블에 데이터를 쓰기 위해 [remoteSecure 테이블 함수](/sql-reference/table-functions/remote/)를 사용할 것입니다.

<Image img={ch_local_03} size='sm' alt='자체 관리 ClickHouse로의 마이그레이션' background='white' />

### ClickHouse Cloud 서비스에서: {#on-the-destination-clickhouse-cloud-service}

#### 대상 데이터베이스 생성: {#create-the-destination-database}

```sql
CREATE DATABASE db
```

#### MySQL 테이블에 상응하는 스키마를 가진 대상 테이블 생성: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

```sql
CREATE TABLE db.table ...
```

:::note
ClickHouse Cloud 대상 테이블의 스키마와 소스 MySQL 테이블의 스키마는 일치해야 합니다 (컬럼 이름과 순서가 동일해야 하며, 컬럼 데이터 유형이 호환 가능해야 합니다).
:::

### clickhouse-local 호스트 머신에서: {#on-the-clickhouse-local-host-machine}

#### 마이그레이션 쿼리로 clickhouse-local 실행: {#run-clickhouse-local-with-the-migration-query}

```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
```

:::note
`clickhouse-local` 호스트 머신에는 데이터가 로컬에 저장되지 않습니다. 대신, 소스 MySQL 테이블에서 데이터를 읽고, 즉시 ClickHouse Cloud 서비스의 대상 테이블에 쓰게 됩니다.
:::

## 예제 2: JDBC 브리지를 사용하여 MySQL에서 ClickHouse Cloud로 마이그레이션하기 {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

우리는 [JDBC 통합 테이블 엔진](/engines/table-engines/integrations/jdbc.md) (즉석에서 생성되는 [jdbc 테이블 함수](/sql-reference/table-functions/jdbc.md))과 [ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) 및 MySQL JDBC 드라이버를 사용하여 소스 MySQL 데이터베이스에서 데이터를 읽고, ClickHouse Cloud 서비스의 대상 테이블에 데이터를 쓰기 위해 [remoteSecure 테이블 함수](/sql-reference/table-functions/remote.md)를 사용할 것입니다.

<Image img={ch_local_04} size='sm' alt='자체 관리 ClickHouse로의 마이그레이션' background='white' />

### ClickHouse Cloud 서비스에서: {#on-the-destination-clickhouse-cloud-service-1}

#### 대상 데이터베이스 생성: {#create-the-destination-database-1}
```sql
CREATE DATABASE db
```
