---
sidebar_label: 'Supabase Postgres'
description: 'Supabase 인스턴스를 ClickPipes 소스로 설정합니다'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Supabase 소스 설정 가이드'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Supabase 소스 설정 가이드 \{#supabase-source-setup-guide\}

이 문서는 ClickPipes에서 사용하기 위한 Supabase Postgres 설정 방법을 설명합니다.

:::note

ClickPipes는 원활한 복제를 위해 Supabase를 IPv6를 통해 기본적으로 지원합니다.

:::

## 권한 및 복제 슬롯이 있는 사용자 생성 \{#creating-a-user-with-permissions-and-replication-slot\}

관리자 사용자로 Supabase 인스턴스에 연결한 후 다음 명령을 실행합니다.

1. ClickPipes 전용 사용자를 생성합니다.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 앞 단계에서 생성한 사용자에게 스키마 단위의 읽기 전용 권한을 부여합니다. 다음 예시는 `public` 스키마에 대한 권한을 보여줍니다. 복제하려는 테이블이 포함된 각 스키마마다 아래 명령을 반복해서 실행합니다.
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 사용자에게 복제 권한을 부여합니다.

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. 복제하려는 테이블을 포함하는 [퍼블리케이션(publication)](https://www.postgresql.org/docs/current/logical-replication-publication.html)을 생성합니다. 성능 오버헤드를 방지하기 위해 퍼블리케이션에는 필요한 테이블만 포함할 것을 강력히 권장합니다.

   :::warning
   퍼블리케이션에 포함되는 모든 테이블에는 **기본 키(primary key)**가 정의되어 있거나, **replica identity**가 `FULL`로 설정되어 있어야 합니다. 범위 설정에 대한 안내는 [Postgres FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)를 참고하십시오.
   :::

   - 특정 테이블에 대한 퍼블리케이션을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 특정 스키마의 모든 테이블에 대한 퍼블리케이션을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` 퍼블리케이션에는 지정된 테이블에서 생성되는 변경 이벤트 집합이 포함되며, 이후 복제 스트림을 수집하는 데 사용됩니다.

## `max_slot_wal_keep_size` 증가 \{#increase-max_slot_wal_keep_size\}

:::warning

이 단계를 수행하면 Supabase 데이터베이스가 재시작되며, 짧은 시간 동안 다운타임이 발생할 수 있습니다.

[Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters)를 참고하여 Supabase 데이터베이스의 `max_slot_wal_keep_size` 파라미터를 더 높은 값(최소 100GB 또는 `102400`)으로 늘릴 수 있습니다.

이 값에 대한 보다 적절한 권장 값을 원한다면 ClickPipes 팀에 문의하십시오.

:::

## Supabase에 사용할 연결 정보 \{#connection-details-to-use-for-supabase\}

Supabase 프로젝트의 `Project Settings`에서 `Configuration` 아래에 있는 `Database`를 엽니다.

**중요**: 이 페이지에서 `Display connection pooler`를 비활성화한 후 `Connection parameters` 섹션으로 이동하여 해당 파라미터를 기록하거나 복사합니다.

<Image img={supabase_connection_details} size="lg" border alt="Supabase 연결 정보 찾기" border/>

:::info

연결 풀러(connection pooler)는 CDC 기반 복제를 지원하지 않으므로 비활성화해야 합니다.

:::

## RLS 관련 참고 사항 \{#note-on-rls\}

ClickPipes Postgres USER는 RLS 정책의 적용을 받지 않아야 합니다. 그렇지 않으면 데이터 누락이 발생할 수 있습니다. 아래 명령어를 실행하여 해당 USER에 대한 RLS 정책을 비활성화할 수 있습니다:

```sql
ALTER USER clickpipes_user BYPASSRLS;
```


## 다음 단계는? \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하여 Postgres 인스턴스의 데이터를 ClickHouse Cloud로 수집하기 시작할 수 있습니다.
Postgres 인스턴스를 설정할 때 사용한 연결 정보는 ClickPipe 생성 과정에서 필요하므로 반드시 기록해 두십시오.