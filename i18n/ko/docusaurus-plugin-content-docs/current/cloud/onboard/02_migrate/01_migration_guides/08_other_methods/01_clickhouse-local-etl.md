---
sidebar_label: 'clickhouse-local 사용'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: 'clickhouse-local을 사용해 ClickHouse로 마이그레이션하기'
description: 'clickhouse-local을 사용해 ClickHouse로 마이그레이션하는 방법을 설명하는 가이드'
doc_type: 'guide'
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


# clickhouse-local을 사용한 ClickHouse로의 마이그레이션 \{#migrating-to-clickhouse-using-clickhouse-local\}

<Image img={ch_local_01} size='lg' alt='자가 관리형 ClickHouse로 마이그레이션'/>

ClickHouse, 더 구체적으로는 [`clickhouse-local`](/operations/utilities/clickhouse-local.md)을 ETL 도구로 사용하여 현재 데이터베이스 시스템에서 ClickHouse Cloud로 데이터를 마이그레이션할 수 있습니다. 이때 현재 데이터베이스 시스템에 대해 ClickHouse에서 제공하는 [integration engine](/engines/table-engines/#integration-engines) 또는 [table function](/sql-reference/table-functions/)이 있거나, 벤더에서 제공하는 JDBC 드라이버 또는 ODBC 드라이버를 사용할 수 있어야 합니다.

이 마이그레이션 방법을 중간 「피벗(pivot)」 지점을 사용하는 방식이라고 부르기도 합니다. 소스 데이터베이스에서 대상 데이터베이스로 데이터를 이동하기 위해 중간 피벗 지점 또는 홉(hop)을 사용하기 때문입니다. 예를 들어 보안 요구 사항으로 인해 사설 또는 내부 네트워크 내부에서 아웃바운드 연결만 허용되는 경우, `clickhouse-local`을 사용해 소스 데이터베이스에서 데이터를 가져온 다음, `clickhouse-local`을 피벗 지점으로 사용하여 대상 ClickHouse 데이터베이스로 데이터를 푸시해야 할 수 있습니다.

ClickHouse는 [MySQL](/engines/table-engines/integrations/mysql/), [PostgreSQL](/engines/table-engines/integrations/postgresql), [MongoDB](/engines/table-engines/integrations/mongodb), [SQLite](/engines/table-engines/integrations/sqlite)에 대해 integration 엔진과 (동적으로 integration 엔진을 생성하는) table FUNCTION을 제공합니다.
그 밖의 다른 일반적인 데이터베이스 시스템에 대해서는 시스템 벤더에서 JDBC 드라이버 또는 ODBC 드라이버를 제공하고 있습니다.

## clickhouse-local이란? \{#what-is-clickhouse-local\}

<Image img={ch_local_02} size='lg' alt='자가 관리형 ClickHouse 마이그레이션'  />

일반적으로 ClickHouse는 클러스터 형태로 실행되며, 여러 ClickHouse 데이터베이스 엔진 인스턴스가 서로 다른 서버에서 분산 방식으로 동작합니다.

단일 서버에서는 ClickHouse 데이터베이스 엔진이 `clickhouse-server` 프로그램의 일부로 실행됩니다. 데이터베이스 접근(경로, 사용자, 보안 등)은 서버 구성 파일로 설정합니다.

`clickhouse-local` 도구를 사용하면 ClickHouse 서버를 구성하고 시작할 필요 없이, 명령줄 유틸리티 형태로 분리된 ClickHouse 데이터베이스 엔진을 사용하여 충분한 양의 다양한 입력 및 출력에 대해 초고속 SQL 데이터 처리를 수행할 수 있습니다.

## `clickhouse-local` 설치 \{#installing-clickhouse-local\}

현재 사용 중인 소스 데이터베이스 시스템과 대상 ClickHouse Cloud 서비스 모두에 네트워크로 연결할 수 있는 `clickhouse-local` 호스트 머신이 필요합니다.

해당 호스트 머신에서 사용하는 운영 체제에 맞는 `clickhouse-local` 빌드를 다운로드합니다:

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. 다음 명령을 실행하면 `clickhouse-local`을 로컬에 가장 간단하게 다운로드할 수 있습니다:
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. `clickhouse-local`을 실행합니다(버전 정보만 출력됩니다):
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. 다음 명령을 실행하면 `clickhouse-local`을 로컬에 가장 간단하게 다운로드할 수 있습니다:
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. `clickhouse-local`을 실행합니다(버전 정보만 출력됩니다):
  ```bash
  ./clickhouse local
  ```

</TabItem>
</Tabs>

:::info Important
이 가이드 전체의 예시는 `clickhouse-local`을 실행하는 Linux 명령(`./clickhouse-local`)을 사용합니다.
Mac에서 `clickhouse-local`을 실행하려면 `./clickhouse local`을 사용합니다.
:::

:::tip ClickHouse Cloud 서비스의 IP Access List에 원격 시스템 추가
`remoteSecure` 함수를 사용하여 ClickHouse Cloud 서비스에 연결하려면, 원격 시스템의 IP 주소가 IP Access List에서 허용되어야 합니다. 자세한 내용은 아래의 **Manage your IP Access List**를 펼쳐서 확인하십시오.
:::

<AddARemoteSystem />

## Example: Migrating from MySQL to ClickHouse Cloud with an Integration engine \{#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine\}

소스 MySQL 데이터베이스에서 데이터를 읽기 위해 [integration table engine](/engines/table-engines/integrations/mysql/)을(를) 사용합니다. 이 엔진은 [mysql table function](/sql-reference/table-functions/mysql/)에 의해 필요할 때마다 즉석에서 생성됩니다. 그리고 ClickHouse Cloud 서비스의 대상 테이블에 데이터를 쓰기 위해 [remoteSecure table function](/sql-reference/table-functions/remote/)을(를) 사용합니다.

<Image img={ch_local_03} size='lg' alt='자가 관리형 ClickHouse 마이그레이션'  />

### 대상 ClickHouse Cloud 서비스에서: \{#on-the-destination-clickhouse-cloud-service\}

#### 대상 데이터베이스를 생성하십시오: \{#create-the-destination-database\}

```sql
  CREATE DATABASE db
```


#### MySQL 테이블과 동일한 스키마를 사용하는 대상 테이블을 생성하십시오: \{#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table\}

```sql
  CREATE TABLE db.table ...
```

:::note
대상 ClickHouse Cloud 테이블의 스키마와 소스 MySQL 테이블의 스키마가 일치해야 합니다(컬럼 이름과 순서는 동일해야 하며, 컬럼 데이터 타입은 호환 가능해야 합니다).
:::


### clickhouse-local이 설치된 호스트 머신에서: \{#on-the-clickhouse-local-host-machine\}

#### 마이그레이션 쿼리를 사용하여 clickhouse-local을 실행합니다: \{#run-clickhouse-local-with-the-migration-query\}

```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
```

:::note
데이터는 `clickhouse-local` 호스트 머신에 로컬로 저장되지 않습니다. 대신 데이터는 소스 MySQL 테이블에서 읽어 온 다음
바로 ClickHouse Cloud 서비스의 대상 테이블로 기록됩니다.
:::
