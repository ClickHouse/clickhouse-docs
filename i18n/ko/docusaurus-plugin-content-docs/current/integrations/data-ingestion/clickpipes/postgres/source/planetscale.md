---
'sidebar_label': 'Postgres에 대한 PlanetScale'
'description': 'ClickPipes의 소스로서 Postgres용 PlanetScale 설정하기'
'slug': '/integrations/clickpipes/postgres/source/planetscale'
'title': 'Postgres 소스 설정 가이드 for PlanetScale'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'postgresql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';


# PlanetScale for Postgres 소스 설정 가이드

:::info
PlanetScale for Postgres는 현재 [얼리 액세스](https://planetscale.com/postgres) 중입니다.
:::

## 지원되는 Postgres 버전 {#supported-postgres-versions}

ClickPipes는 Postgres 버전 12 이상을 지원합니다.

## 논리 복제 활성화 {#enable-logical-replication}

1. Postgres 인스턴스에서 복제를 활성화하려면 다음 설정이 완료되어 있는지 확인해야 합니다:

```sql
wal_level = logical
```
   동일한 내용을 확인하려면 다음 SQL 명령을 실행할 수 있습니다:
```sql
SHOW wal_level;
```

   기본적으로 출력은 `logical`이어야 합니다. 그렇지 않은 경우, PlanetScale 콘솔에 로그인하여 `Cluster configuration->Parameters`로 이동한 후 `Write-ahead log`로 스크롤하여 변경하십시오.

<Image img={planetscale_wal_level_logical} alt="PlanetScale 콘솔에서 wal_level 조정" size="md" border/>

:::warning
PlanetScale 콘솔에서 이 설정을 변경하면 RESTART가 발생합니다.
:::

2. 또한, 기본값인 4GB에서 `max_slot_wal_keep_size` 설정을 늘리는 것이 권장됩니다. 이는 `Cluster configuration->Parameters`로 이동하여 `Write-ahead log`로 스크롤하여 PlanetScale 콘솔에서 수행할 수 있습니다. 새로운 값을 결정하는 데 도움이 필요하면 [여기](../faq#recommended-max_slot_wal_keep_size-settings)를 참조하세요.

<Image img={planetscale_max_slot_wal_keep_size} alt="PlanetScale 콘솔에서 max_slot_wal_keep_size 조정" size="md" border/>

## 권한 및 게시가 있는 사용자 만들기 {#creating-a-user-with-permissions-and-publication}

CDC에 적합한 필요한 권한으로 ClickPipes용 새 사용자를 만들고, 복제를 위해 사용할 게시물을 생성합니다.

이를 위해 기본 `postgres.<...>` 사용자로 PlanetScale Postgres 인스턴스에 연결하고 다음 SQL 명령을 실행할 수 있습니다:
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
-- You may need to grant these permissions on more schemas depending on the tables you're moving
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;

-- Create a publication. We will use this when creating the pipe
-- When adding new tables to the ClickPipe, you'll need to manually add them to the publication as well. 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, <...>;
```
:::note
`clickpipes_user` 및 `clickpipes_password`를 원하는 사용자 이름과 비밀번호로 바꾸는 것을 잊지 마세요.
:::

## 주의사항 {#caveats}
1. PlanetScale Postgres에 연결하려면 현재 브랜치가 위에서 생성한 사용자 이름에 추가되어야 합니다. 예를 들어 생성된 사용자가 `clickpipes_user`라면 ClickPipe 생성 시 실제로 제공해야 하는 사용자는 `clickpipes_user`.`branch`로, 여기서 `branch`는 현재 PlanetScale Postgres [브랜치](https://planetscale.com/docs/postgres/branching)의 "id"를 나타냅니다. 이를 빠르게 확인하는 방법은 이전에 사용한 `postgres` 사용자 이름의 점 이후 부분이 브랜치 ID가 됩니다.
2. PlanetScale Postgres에 연결하는 CDC 파이프에는 `PSBouncer` 포트(현재 `6432`)를 사용하지 마세요. 일반 포트 `5432`를 사용해야 합니다. 초기 로드 전용 파이프에는 두 포트를 모두 사용할 수 있습니다.
3. 반드시 기본 인스턴스에만 연결하고, [복제본 인스턴스](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas)에는 현재 연결되지 않도록 하세요.

## 다음 단계는 무엇인가요? {#whats-next}

이제 [ClickPipe를 생성](../index.md)하고 Postgres 인스턴스에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다.
Postgres 인스턴스를 설정하는 동안 사용한 연결 세부 정보를 꼭 기록해 두세요. ClickPipe 생성 과정에서 필요합니다.
