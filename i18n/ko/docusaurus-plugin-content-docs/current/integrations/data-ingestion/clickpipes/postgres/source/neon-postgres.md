---
'sidebar_label': 'Neon Postgres'
'description': 'ClickPipes의 소스로서 Neon Postgres 인스턴스를 설정합니다.'
'slug': '/integrations/clickpipes/postgres/source/neon-postgres'
'title': 'Neon Postgres 소스 설정 안내서'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'postgresql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Neon Postgres 소스 설정 가이드

이것은 ClickPipes에서 복제를 위한 Neon Postgres를 설정하는 방법에 대한 가이드입니다. 이 설정을 위해 [Neon 콘솔](https://console.neon.tech/app/projects)에 로그인되어 있는지 확인하세요.

## 권한이 있는 사용자 생성하기 {#creating-a-user-with-permissions}

CDC에 적합한 필요한 권한을 가진 ClickPipes용 새 사용자를 생성하고, 복제에 사용할 게시물을 생성해 보겠습니다.

이렇게 하려면 **SQL 편집기** 탭으로 이동하세요. 여기에서 다음 SQL 명령을 실행할 수 있습니다:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;

-- Create a publication. We will use this when creating the mirror
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image size="lg" img={neon_commands} alt="사용자 및 게시물 명령어" border/>

**실행** 버튼을 클릭하여 게시물과 사용자를 준비합니다.

## 논리적 복제 활성화하기 {#enable-logical-replication}
Neon에서는 UI를 통해 논리적 복제를 활성화할 수 있습니다. 이는 ClickPipes의 CDC가 데이터를 복제하는 데 필요합니다. **설정** 탭으로 이동한 후 **논리적 복제** 섹션으로 가세요.

<Image size="lg" img={neon_enable_replication} alt="논리적 복제 활성화" border/>

**활성화** 버튼을 클릭하여 모든 설정을 완료하세요. 활성화 후 아래 성공 메시지가 표시될 것입니다.

<Image size="lg" img={neon_enabled_replication} alt="논리적 복제 활성화됨" border/>

Neon Postgres 인스턴스에서 아래 설정을 확인해 보겠습니다:
```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```

## IP 화이트리스트 (Neon 기업 플랜 용) {#ip-whitelisting-for-neon-enterprise-plan}
Neon 기업 플랜을 사용 중이라면, ClickPipes에서 Neon Postgres 인스턴스로의 복제를 허용하기 위해 [ClickPipes IPs](../../index.md#list-of-static-ips)를 화이트리스트에 추가할 수 있습니다. 이렇게 하려면 **설정** 탭을 클릭한 후 **IP 허용** 섹션으로 가세요.

<Image size="lg" img={neon_ip_allow} alt="IP 허용 화면" border/>

## 연결 세부정보 복사하기 {#copy-connection-details}
이제 사용자가 준비되고, 게시물이 생성되었으며, 복제가 활성화되었으므로 새 ClickPipe를 생성하기 위해 연결 세부정보를 복사할 수 있습니다. **대시보드**로 이동하여 연결 문자열이 표시되는 텍스트 박스에서 **파라미터 전용** 보기로 변경하세요. 이 파라미터는 다음 단계에 필요합니다.

<Image size="lg" img={neon_conn_details} alt="연결 세부정보" border/>

## 다음 단계는 무엇인가요? {#whats-next}

이제 [ClickPipe를 생성](../index.md)하고 Postgres 인스턴스에서 ClickHouse Cloud로 데이터를 수집하기 시작할 수 있습니다. Postgres 인스턴스를 설정하는 동안 사용한 연결 세부정보를 기록해 두세요. ClickPipe 생성 과정에서 필요할 것입니다.
