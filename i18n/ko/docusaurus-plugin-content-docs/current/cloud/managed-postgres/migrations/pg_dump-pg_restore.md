---
slug: /cloud/managed-postgres/migrations/pg_dump-pg_restore
sidebar_label: 'pg_dump 및 pg_restore'
title: 'pg_dump 및 pg_restore를 사용하여 PostgreSQL 데이터 마이그레이션하기'
description: 'pg_dump 및 pg_restore를 사용하여 PostgreSQL 데이터를 ClickHouse Managed Postgres로 마이그레이션하는 방법을 알아봅니다'
keywords: ['postgres', 'postgresql', 'pg_dump', 'pg_restore', 'migration', 'data transfer', 'managed postgres']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import createPgForMigrate from '@site/static/images/managed-postgres/pg_dump_restore/create-pg-for-migration.png';
import sourceSetup from '@site/static/images/managed-postgres/pg_dump_restore/source-setup.png';
import dumpCommand from '@site/static/images/managed-postgres/pg_dump_restore/dump-command.png';
import restoreCommand from '@site/static/images/managed-postgres/pg_dump_restore/restore-command.png';
import targetSetup from '@site/static/images/managed-postgres/pg_dump_restore/target-setup.png';


# pg_dump 및 pg_restore를 사용하여 Managed Postgres로 마이그레이션하기 \{#pg-dump-pg-restore\}

이 가이드는 `pg_dump` 및 `pg_restore` 유틸리티를 사용하여 PostgreSQL 데이터베이스를 ClickHouse Managed Postgres로 마이그레이션하는 단계별 안내를 제공합니다.

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="pg_dump-pg_restore" />

## 선행 조건 \{#migration-pgdump-pg-restore-prerequisites\}

- 소스 PostgreSQL 데이터베이스에 대한 접근 권한.
- 로컬 머신에 `pg_dump` 및 `pg_restore`가 설치되어 있어야 합니다. 일반적으로 PostgreSQL을 설치하면 함께 포함됩니다. 포함되어 있지 않다면 [PostgreSQL 공식 웹사이트](https://www.postgresql.org/download/)에서 다운로드할 수 있습니다.

## 설정 \{#migration-pgdump-pg-restore-setup\}

단계를 따라가기 위해 예제로 RDS Postgres 데이터베이스를 소스 데이터베이스로 사용하겠습니다. 구성은 다음과 같습니다:

<Image img={sourceSetup} alt="소스 PostgreSQL 데이터베이스 설정" size="xl" border />

다음과 같은 구성을 사용합니다:

- 두 개의 테이블 - `events`와 `users`. `events`에는 백만 행이 있고, `users`에는 천 행이 있습니다.
- `events`에는 인덱스가 있습니다.
- `events` 테이블 위에 뷰가 하나 있습니다.
- 시퀀스가 두 개 있습니다.

## 소스 데이터베이스 덤프 생성 \{#migration-pgdump-pg-restore-dump\}

이제 `pg_dump`를 사용하여 위의 객체 덤프 파일을 생성합니다. 다음과 같은 간단한 명령입니다:

```shell
pg_dump \
  -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
  --format directory \
  -f rds-dump
```

여기에서는 다음과 같이 합니다:

* `<user>`, `<password>`, `<host>`, `<port>`, `<database>`를 소스 데이터베이스 자격 증명으로 바꿉니다. 대부분의 Postgres 제공업체는 바로 사용할 수 있는 연결 문자열을 제공합니다.
* `--format directory`는 덤프를 디렉터리 형식으로 생성하도록 지정하며, 이는 `pg_restore`에 적합합니다.
* `-f rds-dump`는 덤프 파일의 출력 디렉터리를 지정합니다. 이 디렉터리는 자동으로 생성되며, 미리 존재하지 않아야 합니다.
* `--jobs` 플래그 뒤에 실행할 병렬 작업 개수를 지정해 덤프 작업을 병렬화할 수도 있습니다. 자세한 내용은 [pg&#95;dump 문서](https://www.postgresql.org/docs/current/app-pgdump.html)를 참고하십시오.

:::tip
이 과정을 한 번 실행해 보면 소요 시간과 덤프 파일 크기를 미리 파악할 수 있습니다.
:::

이 명령을 실행하면 다음과 같이 출력됩니다:

<Image img={dumpCommand} alt="pg_dump Command Execution" size="xl" border />


## 덤프를 ClickHouse Managed Postgres로 마이그레이션하기 \{#migration-pgdump-pg-restore-restore\}

이제 덤프 파일이 준비되었으므로 `pg_restore`를 사용하여 ClickHouse Managed Postgres 인스턴스에 복원할 수 있습니다. 

### Managed Postgres 인스턴스 생성 \{#migration-pgdump-pg-restore-create-pg\}

먼저 Managed Postgres 인스턴스가, 가능하면 소스와 동일한 리전에 준비되어 있는지 확인합니다. [여기](../quickstart#create-postgres-database)에 있는 빠른 가이드를 참고할 수 있습니다. 이 가이드에서는 다음과 같은 인스턴스를 실행합니다:

<Image img={createPgForMigrate} alt="ClickHouse Managed Postgres 인스턴스 생성" size="md" border />

### 덤프 복원하기 \{#migration-pgdump-pg-restore-restore-dump\}

이제 로컬 머신으로 돌아와 `pg_restore` 명령을 사용해 덤프를 Managed Postgres 인스턴스로 복원합니다:

```shell
pg_restore \
  -d 'postgresql://<user>:<password>@<pg_clickhouse_host>:5432/<database>' \
  --verbose \
  rds-dump
```

Managed Postgres 인스턴스에 대한 연결 문자열은 ClickHouse Cloud 콘솔에서 확인할 수 있습니다. 이에 대해서는 [여기](../connection)에서 아주 간단히 설명합니다.

여기에서도 확인해야 할 플래그가 몇 가지 있습니다:

* `--verbose`는 복원 과정에서 자세한 출력을 제공합니다.
* `--jobs` 플래그를 사용하여 복원 작업을 병렬로 실행할 수도 있습니다. 자세한 내용은 [pg&#95;restore 문서](https://www.postgresql.org/docs/current/app-pgrestore.html)를 참고하십시오.

이 경우 명령은 다음과 같습니다:

<Image img={restoreCommand} alt="pg_restore 명령 실행" size="xl" border />


## 마이그레이션 검증 \{#migration-pgdump-pg-restore-verify\}

복원 프로세스가 완료되면 Managed Postgres 인스턴스에 연결하여 모든 데이터와 객체가 성공적으로 마이그레이션되었는지 확인할 수 있습니다. PostgreSQL 클라이언트를 사용해 연결한 뒤 쿼리를 실행하면 됩니다.
다음은 마이그레이션 후 Managed Postgres 설정의 모습입니다:

<Image img={targetSetup} alt="대상 Managed Postgres 데이터베이스 설정" size="xl" border />

모든 테이블, 인덱스, 뷰, 시퀀스가 온전히 존재하며, 데이터 건수도 일치함을 확인할 수 있습니다.

## 고려 사항 \{#migration-pgdump-pg-restore-considerations\}

- 소스 및 대상 데이터베이스의 PostgreSQL 버전이 호환되는지 확인합니다.
소스 서버보다 오래된 버전의 pg_dump를 사용하면 기능 누락이나 복원 문제로 이어질 수 있습니다. 이상적으로는 소스 데이터베이스와 동일하거나 더 최신의 메이저 버전의 pg_dump를 사용합니다.
- 대규모 데이터베이스는 덤프 및 복원에 상당한 시간이 소요될 수 있습니다.
다운타임을 최소화할 수 있도록 사전에 계획하고, 지원되는 경우 병렬 덤프/복원(`--jobs`) 사용을 고려합니다.
- pg_dump / pg_restore는 모든 데이터베이스 관련 객체나 런타임 상태를 그대로 가져오지 않는다는 점에 유의하십시오.
여기에는 역할 및 역할 멤버십, 복제 슬롯, 서버 수준 설정(예: postgresql.conf, pg_hba.conf), 테이블스페이스, 런타임 통계 등이 포함됩니다.

## 다음 단계 \{#migration-pgdump-pg-restore-next-steps\}

축하합니다! pg_dump과 pg_restore를 사용하여 PostgreSQL 데이터베이스를 ClickHouse Managed Postgres로 성공적으로 마이그레이션했습니다. 이제 Managed Postgres 기능과 ClickHouse와의 통합을 살펴볼 준비가 되었습니다. 시작에 도움이 되는 10분 분량의 퀵스타트 가이드를 참고하십시오:

- [Managed Postgres 퀵스타트 가이드](../quickstart)