---
'sidebar_label': 'Google Cloud SQL'
'description': 'Google Cloud SQL Postgres 인스턴스를 ClickPipes의 소스로 설정하기'
'slug': '/integrations/clickpipes/postgres/source/google-cloudsql'
'title': 'Google Cloud SQL Postgres 소스 설정 가이드'
'doc_type': 'guide'
'keywords':
- 'google cloud sql'
- 'postgres'
- 'clickpipes'
- 'logical decoding'
- 'firewall'
---

import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/edit.png';
import cloudsql_logical_decoding1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding1.png';
import cloudsql_logical_decoding2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding2.png';
import cloudsql_logical_decoding3 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding3.png';
import connections from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections.png';
import connections_networking from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections_networking.png';
import firewall1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall1.png';
import firewall2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall2.png';
import Image from '@theme/IdealImage';


# Google Cloud SQL Postgres 소스 설정 가이드

:::info

지원되는 제공업체 중 하나를 사용하는 경우(사이드바에 있음), 해당 제공업체에 대한 특정 가이드를 참조하십시오.

:::

## 지원되는 Postgres 버전 {#supported-postgres-versions}

Postgres 12 이상의 모든 버전

## 논리 복제 활성화 {#enable-logical-replication}

`cloudsql.logical_decoding` 설정이 켜져 있고 `wal_sender_timeout`이 0인 경우 아래 단계를 따를 필요가 **없습니다**. 이러한 설정은 다른 데이터 복제 도구에서 마이그레이션하는 경우 대부분 미리 구성되어 있어야 합니다.

1. 개요 페이지에서 **편집** 버튼을 클릭합니다.

<Image img={edit_button} alt="Cloud SQL Postgres의 편집 버튼" size="lg" border/>

2. 플래그로 이동하여 `cloudsql.logical_decoding`을 켜고 `wal_sender_timeout`을 0으로 변경합니다. 이러한 변경 사항은 Postgres 서버를 재시작해야 합니다.

<Image img={cloudsql_logical_decoding1} alt="cloudsql.logical_decoding을 켜기로 변경" size="lg" border/>
<Image img={cloudsql_logical_decoding2} alt="cloudsql.logical_decoding 및 wal_sender_timeout 변경" size="lg" border/>
<Image img={cloudsql_logical_decoding3} alt="서버 재시작" size="lg" border/>

## ClickPipes 사용자 생성 및 권한 부여 {#creating-clickpipes-user-and-granting-permissions}

관리 사용자로 Cloud SQL Postgres에 연결하고 아래 명령을 실행합니다.

1. ClickPipes 전용 Postgres 사용자를 생성합니다.

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. 테이블을 복제하는 스키마에 대해 `clickpipes_user`에 읽기 전용 액세스를 제공합니다. 아래 예시는 `public` 스키마의 권한을 설정하는 방법을 보여줍니다. 여러 스키마에 액세스를 부여하려면 각 스키마에 대해 이 세 개의 명령을 실행할 수 있습니다.

```sql
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. 이 사용자에게 복제 액세스를 부여합니다:

```sql
ALTER ROLE clickpipes_user REPLICATION;
```

4. 미래에 MIRROR(복제)를 생성하는 데 사용할 게시물을 생성합니다.

```sql
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

[//]: # (TODO Add SSH Tunneling)

## ClickPipes IP를 방화벽에 추가 {#add-clickpipes-ips-to-firewall}

아래 단계를 따라 ClickPipes IP를 네트워크에 추가하세요.

:::note

SSH 터널링을 사용하는 경우, [ClickPipes IP](../../index.md#list-of-static-ips)를 점프 서버/배스천의 방화벽 규칙에 추가해야 합니다.

:::

1. **연결** 섹션으로 이동합니다.

<Image img={connections} alt="Cloud SQL의 연결 섹션" size="lg" border/>

2. 네트워킹 하위 섹션으로 이동합니다.

<Image img={connections_networking} alt="Cloud SQL의 네트워킹 하위 섹션" size="lg" border/>

3. [ClickPipes의 공인 IP](../../index.md#list-of-static-ips)를 추가합니다.

<Image img={firewall1} alt="방화벽에 ClickPipes 네트워크 추가" size="lg" border/>
<Image img={firewall2} alt="방화벽에 추가된 ClickPipes 네트워크" size="lg" border/>

## 다음은 무엇인가요? {#whats-next}

이제 [ClickPipe를 생성](../index.md)하고 Postgres 인스턴스에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다.
Postgres 인스턴스를 설정할 때 사용한 연결 세부정보를 기록해 두어야 ClickPipe 생성 과정에서 필요합니다.
