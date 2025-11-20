---
'sidebar_label': 'Crunchy Bridge Postgres'
'description': 'ClickPipes의 소스로 Crunchy Bridge Postgres를 설정합니다.'
'slug': '/integrations/clickpipes/postgres/source/crunchy-postgres'
'title': 'Crunchy Bridge Postgres 소스 설정 가이드'
'keywords':
- 'crunchy bridge'
- 'postgres'
- 'clickpipes'
- 'logical replication'
- 'data ingestion'
'doc_type': 'guide'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';


# Crunchy Bridge Postgres 소스 설정 가이드

ClickPipes는 Postgres 버전 12 이상을 지원합니다.

## 논리적 복제 활성화 {#enable-logical-replication}

Crunchy Bridge는 기본적으로 [논리적 복제](https://docs.crunchybridge.com/how-to/logical-replication)가 활성화되어 있습니다. 아래 설정이 올바르게 구성되었는지 확인하십시오. 그렇지 않은 경우, 적절하게 조정하십시오.

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```

## ClickPipes 사용자 생성 및 권한 부여 {#creating-clickpipes-user-and-granting-permissions}

`postgres` 사용자로 Crunchy Bridge Postgres에 연결하고 아래 명령을 실행하십시오:

1. ClickPipes 전용 Postgres 사용자를 생성합니다.

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. 테이블을 복제하는 스키마에 대한 읽기 전용 액세스를 `clickpipes_user`에게 부여하십시오. 아래 예시는 `public` 스키마에 대한 권한 부여를 보여줍니다. 여러 스키마에 액세스를 부여하려면 각각의 스키마에 대해 이 세 가지 명령을 실행할 수 있습니다.

```sql
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. 이 사용자에게 복제 액세스를 부여합니다:

```sql
ALTER ROLE clickpipes_user REPLICATION;
```

4. 향후 MIRROR(복제)를 생성하는 데 사용할 출판물을 생성합니다.

```sql
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

## ClickPipes IP를 안전 목록에 추가 {#safe-list-clickpipes-ips}

Crunchy Bridge의 방화벽 규칙에 [ClickPipes IP를 안전 목록](../../index.md#list-of-static-ips)에 추가합니다.

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="Crunchy Bridge에서 방화벽 규칙을 찾는 곳은?" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="ClickPipes를 위한 방화벽 규칙 추가" border/>

## 다음은 무엇인가요? {#whats-next}

이제 [ClickPipe를 생성](../index.md)하고 Postgres 인스턴스에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다.
ClickPipe 생성 과정에서 사용할 Postgres 인스턴스를 설정할 때 사용한 연결 세부 정보를 반드시 기록해 두십시오.
