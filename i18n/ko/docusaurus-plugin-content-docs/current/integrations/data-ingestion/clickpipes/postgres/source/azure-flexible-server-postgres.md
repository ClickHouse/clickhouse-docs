---
'sidebar_label': 'Azure Flexible Server for Postgres'
'description': 'ClickPipes를 위한 소스로 Azure Flexible Server for Postgres 설정'
'slug': '/integrations/clickpipes/postgres/source/azure-flexible-server-postgres'
'title': 'Azure Flexible Server for Postgres 소스 설정 가이드'
'keywords':
- 'azure'
- 'flexible server'
- 'postgres'
- 'clickpipes'
- 'wal level'
'doc_type': 'guide'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';


# Azure flexible server for Postgres source setup guide

ClickPipes는 Postgres 버전 12 및 이후 버전을 지원합니다.

## 논리적 복제 활성화 {#enable-logical-replication}

**`wal_level`이 `logical`로 설정되어 있다면** 아래 단계를 따를 필요가 없습니다. 이 설정은 대부분 다른 데이터 복제 도구에서 마이그레이션할 때 미리 구성되어야 합니다.

1. **서버 매개변수** 섹션을 클릭합니다.

<Image img={server_parameters} alt="Azure Flexible Server for Postgres의 서버 매개변수" size="lg" border/>

2. `wal_level`을 `logical`로 변경합니다.

<Image img={wal_level} alt="Azure Flexible Server for Postgres에서 wal_level을 logical로 변경하기" size="lg" border/>

3. 이 변경은 서버 재시작이 필요합니다. 요청 시 재시작하십시오.

<Image img={restart} alt="wal_level 변경 후 서버 재시작" size="lg" border/>

## ClickPipes 사용자 생성 및 권한 부여 {#creating-clickpipes-user-and-granting-permissions}

관리자 사용자로 Azure Flexible Server Postgres에 연결하고 아래 명령어를 실행합니다:

1. ClickPipes 전용 Postgres 사용자를 생성합니다.

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. 테이블을 복제하는 스키마에 대해 `clickpipes_user`에 읽기 전용 접근 권한을 부여합니다. 아래 예시는 `public` 스키마에 대한 권한 설정을 보여줍니다. 여러 스키마에 접근 권한을 부여하려면 각 스키마에 대해 이 세 가지 명령을 실행할 수 있습니다.

```sql
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. 이 사용자에게 복제 권한을 부여합니다:

```sql
ALTER ROLE clickpipes_user REPLICATION;
```

4. 미래에 MIRROR(복제)를 생성하는 데 사용할 게시물을 생성합니다.

```sql
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

5. `clickpipes_user`에 대해 `wal_sender_timeout`을 0으로 설정합니다.

```sql
ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
```

## ClickPipes IP를 방화벽에 추가 {#add-clickpipes-ips-to-firewall}

아래 단계를 따라 [ClickPipes IP](../../index.md#list-of-static-ips)를 네트워크에 추가하십시오.

1. **네트워킹** 탭으로 이동하여 Azure Flexible Server Postgres의 방화벽 또는 SSH 터널링을 사용하는 경우 점프 서버/배스천에 [ClickPipes IP](../../index.md#list-of-static-ips)를 추가합니다.

<Image img={firewall} alt="Azure Flexible Server for Postgres의 방화벽에 ClickPipes IP 추가" size="lg"/>

## 다음 단계는? {#whats-next}

이제 [ClickPipe를 생성](../index.md)하고 Postgres 인스턴스에서 ClickHouse Cloud로 데이터를 수집하기 시작할 수 있습니다. Postgres 인스턴스를 설정할 때 사용한 연결 세부 정보를 기록해 두어야 ClickPipe 생성 과정에서 필요합니다.
