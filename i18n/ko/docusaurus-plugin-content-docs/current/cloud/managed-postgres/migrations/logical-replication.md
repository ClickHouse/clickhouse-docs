---
slug: /cloud/managed-postgres/migrations/logical-replication
sidebar_label: '논리적 복제'
title: '논리적 복제를 사용하여 PostgreSQL 데이터 마이그레이션'
description: '논리적 복제를 사용하여 PostgreSQL 데이터를 ClickHouse Managed Postgres로 마이그레이션하는 방법을 알아봅니다'
keywords: ['postgres', 'postgresql', '논리적 복제', '마이그레이션', '데이터 전송', 'Managed Postgres']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import createPgForMigrate from '@site/static/images/managed-postgres/pg_dump_restore/create-pg-for-migration.png';
import sourceReplicationSetup from '@site/static/images/managed-postgres/logical_replication/source-setup.png';
import targetInitialSetup from '@site/static/images/managed-postgres/logical_replication/target-initial-setup.png';
import migrationResult from '@site/static/images/managed-postgres/logical_replication/migration-result.png';
import sourceSetup from '@site/static/images/managed-postgres/pg_dump_restore/source-setup.png';


# 논리적 복제를 사용하여 Managed Postgres로 마이그레이션하기 \{#logical-replication-migration\}

이 가이드는 PostgreSQL 데이터베이스를 Postgres 네이티브 논리적 복제(logical replication)를 사용하여 ClickHouse Managed Postgres로 마이그레이션하는 방법을 단계별로 안내합니다.

<PrivatePreviewBadge />

## 사전 준비 사항 \{#migration-logical-replication-prerequisites\}

* 소스 PostgreSQL 데이터베이스에 대한 접근 권한
* 로컬 머신에 `psql`, `pg_dump`, `pg_restore`가 설치되어 있어야 합니다. 이는 대상 데이터베이스에 빈 테이블을 생성하는 데 사용됩니다. 일반적으로 PostgreSQL 설치 시 함께 포함됩니다. 포함되어 있지 않다면 [PostgreSQL 공식 웹사이트](https://www.postgresql.org/download/)에서 다운로드할 수 있습니다.
* 소스 데이터베이스는 ClickHouse Managed Postgres에서 접근 가능해야 합니다. 이를 위해 필요한 방화벽 규칙이나 보안 그룹 설정이 해당 연결을 허용하는지 확인하십시오. Managed Postgres 인스턴스의 egress IP는 다음을 실행하여 확인할 수 있습니다.

```shell
dig +short <your-managed-postgres-hostname>
```


## 설정 \{#migration-logical-replication-setup\}

논리적 복제가 동작하려면 소스 데이터베이스가 올바르게 설정되어야 합니다. 주요 요구사항은 다음과 같습니다.

- 소스 데이터베이스의 `wal_level`이 `logical`로 설정되어 있어야 합니다.
- 소스 데이터베이스의 `max_replication_slots`가 최소 `1`로 설정되어 있어야 합니다.
- 이 가이드에서 예시로 사용하는 RDS의 경우, 파라미터 그룹에서 `rds.logical_replication`이 `1`로 설정되어 있는지 확인해야 합니다.
- 소스 데이터베이스 사용자가 `REPLICATION` 권한을 가지고 있어야 합니다. RDS의 경우 다음 명령을 실행합니다.
    ```sql
    GRANT rds_replication TO <your-username>;
    ```
- 대상 데이터베이스에 사용하는 역할(role)은 대상 데이터베이스 객체에 대한 쓰기 권한을 가져야 합니다.
    ```sql
    GRANT USAGE ON SCHEMA <schema_i> TO subscriber_user;
    GRANT CREATE ON DATABASE destination_db TO subscriber_user;
    GRANT pg_create_subscription TO subscriber_user;

    -- 테이블 권한 부여
    GRANT INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA <schema_i> TO subscriber_user;
    ```

소스 데이터베이스가 다음과 같이 설정되어 있는지 확인하십시오.

<Image img={sourceReplicationSetup} alt="Source PostgreSQL Replication Setup" size="md" border />

## 소스 데이터베이스의 스키마 전용 덤프 \{#migration-logical-replication-schema-dump\}

논리 복제를 설정하기 전에 대상 ClickHouse Managed Postgres 데이터베이스에 스키마를 먼저 생성해야 합니다. 이를 위해 `pg_dump`를 사용하여 소스 데이터베이스의 스키마만 포함된 덤프를 생성할 수 있습니다.

```shell
pg_dump \
    -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
    -s \
    --format directory \
    -f rds-dump
```

여기에서는 다음을 수행합니다:

* `<user>`, `<password>`, `<host>`, `<port>`, `<database>`를 소스 데이터베이스 자격 증명 정보로 바꿉니다.
* `-s`는 스키마만 덤프(schema-only dump)하도록 지정합니다.
* `--format directory`는 `pg_restore`에 적합한 디렉터리 형식으로 덤프를 생성하도록 지정합니다.
* `-f rds-dump`는 덤프 파일의 출력 디렉터리를 지정합니다. 이 디렉터리는 자동으로 생성되며, 미리 존재하면 안 됩니다.

이 예시에서는 `events`와 `users` 두 개의 테이블이 있습니다. `events`에는 100만 개의 행이 있고, `users`에는 1,000개의 행이 있습니다.

<Image img={sourceSetup} alt="소스 PostgreSQL 테이블 구성" size="xl" border />


### Managed Postgres 인스턴스 생성 \{#migration-pgdump-pg-restore-create-pg\}

먼저 Managed Postgres 인스턴스가 준비되어 있는지 확인하십시오. 가능하면 소스와 동일한 리전에 두는 것이 좋습니다. 빠른 시작 가이드는 [여기](../quickstart#create-postgres-database)를 참고하십시오. 이 가이드에서는 다음과 같은 인스턴스를 생성합니다:

<Image img={createPgForMigrate} alt="ClickHouse Managed Postgres 인스턴스 생성" size="md" border />

## 스키마를 ClickHouse Managed Postgres에 복원하기 \{#migration-logical-replication-restore-schema\}

이제 스키마 덤프가 준비되었으므로 `pg_restore`를 사용하여 ClickHouse Managed Postgres 인스턴스에 복원합니다:

```shell
pg_restore \
    -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
    --verbose \
    rds-dump
```

여기서는:

* `<user>`, `<password>`, `<host>`, `<port>`, `<database>`를 대상 ClickHouse Managed Postgres 데이터베이스의 자격 증명 값으로 교체하십시오.
* `--verbose`는 복원 과정에서 상세한 출력을 제공합니다.
  이 명령은 데이터를 복원하지 않고 대상 데이터베이스에 모든 테이블, 인덱스, VIEW 및 기타 스키마 객체를 생성합니다.

이 예제에서는 이 명령을 실행한 후 두 개의 테이블이 생성되며, 모두 비어 있습니다:

<Image img={targetInitialSetup} alt="대상 ClickHouse Managed Postgres 초기 설정" size="xl" border />


## 논리 복제 설정 \{#migration-logical-replication-setup-replication\}

스키마가 준비되었으므로 이제 소스 데이터베이스에서 대상 ClickHouse Managed Postgres 데이터베이스로의 논리 복제를 설정합니다. 이를 위해 소스 데이터베이스에는 publication을, 대상 데이터베이스에는 subscription을 생성합니다.

### 소스 데이터베이스에서 publication 생성하기 \{#migration-logical-replication-create-publication\}

소스 PostgreSQL 데이터베이스에 접속한 다음 레플리케이션할 테이블을 포함하는 publication(퍼블리케이션)을 생성합니다.

```sql
CREATE PUBLICATION <pub_name> FOR TABLE table1, table2...;
```

:::info
테이블이 많은 경우 `FOR ALL TABLES`로 publication을 생성하면 네트워크 오버헤드가 발생할 수 있습니다. 복제하려는 테이블만 publication에 명시하는 것이 좋습니다.
:::


### 대상 ClickHouse Managed Postgres 데이터베이스에 구독 생성하기 \{#migration-logical-replication-create-subscription\}

다음으로, 대상 ClickHouse Managed Postgres 데이터베이스에 접속한 후 소스 데이터베이스의 게시(publication)에 연결되는 구독을 생성합니다.

```sql
CREATE SUBSCRIPTION demo_rds_subscription
CONNECTION 'postgresql://<user>:<password>@<host>:<port>/<database>'
PUBLICATION <pub_name_you_entered_above>;
```

이 작업은 소스 데이터베이스에 복제 슬롯을 자동으로 생성하고, 지정한 테이블의 데이터를 대상 데이터베이스로 복제하기 시작합니다. 데이터 크기에 따라 이 과정은 다소 시간이 걸릴 수 있습니다.

이 예제에서는 구독을 설정한 후 데이터가 다음과 같이 유입되기 시작했습니다:

<Image img={migrationResult} alt="논리 복제 후 마이그레이션 결과" size="xl" border />

이제 소스 데이터베이스에 새로 삽입되는 행은 거의 실시간으로 대상 ClickHouse Managed Postgres 데이터베이스로 복제됩니다.


## 주의사항 및 고려 사항 \{#migration-logical-replication-caveats\}

- 논리 복제는 데이터 변경 사항(INSERT, UPDATE, DELETE)만 복제합니다. 스키마 변경(예: ALTER TABLE)은 별도로 처리해야 합니다.
- 복제가 중단되지 않도록 소스 데이터베이스와 대상 데이터베이스 간 네트워크 연결이 안정적으로 유지되도록 해야 합니다.
- 복제 지연(replication lag)을 모니터링하여 대상 데이터베이스가 소스 데이터베이스를 원본과 동일한 수준으로 따라가고 있는지 확인해야 합니다. 소스 데이터베이스에서 `max_slot_wal_keep_size`를 적절한 값으로 설정하면 증가하는 복제 슬롯을 관리하고, 과도한 디스크 공간 사용을 방지하는 데 도움이 됩니다.
- 사용 사례에 따라 복제 작업에 대한 모니터링과 경보(alerting)를 설정하는 것이 좋습니다.

## 다음 단계 \{#migration-pgdump-pg-restore-next-steps\}

축하합니다! `pg_dump`와 `pg_restore`를 사용하여 PostgreSQL 데이터베이스를 ClickHouse Managed Postgres로 성공적으로 마이그레이션했습니다. 이제 Managed Postgres의 기능과 ClickHouse와의 통합을 살펴볼 준비가 되었습니다. 10분 정도면 완료할 수 있는 다음 빠른 시작 가이드를 참고하십시오:

- [Managed Postgres 빠른 시작 가이드](../quickstart)