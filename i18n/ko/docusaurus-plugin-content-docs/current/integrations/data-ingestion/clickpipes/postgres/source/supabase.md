---
'sidebar_label': 'Supabase Postgres'
'description': 'Supabase 인스턴스를 ClickPipes의 소스로 설정하기'
'slug': '/integrations/clickpipes/postgres/source/supabase'
'title': 'Supabase 소스 설정 가이드'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'postgresql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Supabase 소스 설정 가이드

이 문서는 ClickPipes에서 사용할 Supabase Postgres 설정 방법에 대한 가이드입니다.

:::note

ClickPipes는 원활한 복제를 위해 IPv6를 통해 Supabase를 기본적으로 지원합니다.

:::

## 권한 및 복제 슬롯이 있는 사용자 생성 {#creating-a-user-with-permissions-and-replication-slot}

CDC에 적합한 필요한 권한을 가진 ClickPipes용 새 사용자를 생성하고, 복제에 사용할 출판물을 생성합시다.

이를 위해 Supabase 프로젝트의 **SQL Editor**로 이동합니다.
여기에서 다음 SQL 명령어를 실행할 수 있습니다:
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

<Image img={supabase_commands} alt="사용자 및 출판물 명령어" size="large" border/>

**Run**을 클릭하여 출판물과 사용자가 준비됩니다.

:::note

`clickpipes_user`와 `clickpipes_password`를 원하는 사용자 이름과 비밀번호로 교체하는 것을 잊지 마세요.

Also, ClickPipes에서 미러를 생성할 때 동일한 출판물 이름을 사용하는 것을 기억하세요.

:::

## `max_slot_wal_keep_size` 늘리기 {#increase-max_slot_wal_keep_size}

:::warning

이 단계는 Supabase 데이터베이스를 재시작하며 잠시 다운타임이 발생할 수 있습니다.

Supabase 데이터베이스의 `max_slot_wal_keep_size` 매개변수를 더 높은 값(최소 100GB 또는 `102400`)으로 늘리려면 [Supabase 문서](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters)를 참조하세요.

이 값에 대해 더 나은 권장 사항이 필요하다면 ClickPipes 팀에 문의하시기 바랍니다.

:::

## Supabase에서 사용할 연결 세부정보 {#connection-details-to-use-for-supabase}

Supabase 프로젝트의 `Project Settings` -> `Database` (구성 아래)를 엽니다.

**중요**: 이 페이지에서 `Display connection pooler`를 비활성화하고 `Connection parameters` 섹션으로 이동하여 매개변수를 기록하거나 복사합니다.

<Image img={supabase_connection_details} size="lg" border alt="Supabase 연결 세부정보 찾기" border/>

:::info

연결 풀러는 CDC 기반 복제를 지원하지 않으므로 비활성화해야 합니다.

:::

## RLS에 대한 주의사항 {#note-on-rls}

ClickPipes Postgres 사용자는 RLS 정책에 의해 제한되지 않아야 하며, 그렇지 않으면 데이터 누락이 발생할 수 있습니다. 다음 명령어를 실행하여 사용자에 대한 RLS 정책을 비활성화할 수 있습니다:
```sql
ALTER USER clickpipes_user BYPASSRLS;
```

## 다음 단계는 무엇인가요? {#whats-next}

이제 [ClickPipe를 생성](../index.md)하고 Postgres 인스턴스에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다.
Postgres 인스턴스를 설정할 때 사용한 연결 세부정보를 기록해 두는 것을 잊지 마세요. 클릭파이프 생성 과정에서 필요할 것입니다.
