---
sidebar_label: 'Neon Postgres'
description: 'ClickPipes 소스로 사용하기 위한 Neon Postgres 인스턴스 설정'
slug: /integrations/clickpipes/postgres/source/neon-postgres
title: 'Neon Postgres 소스 설정 가이드'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Neon Postgres 소스 설정 가이드 \{#neon-postgres-source-setup-guide\}

이 문서는 ClickPipes에서 복제에 사용할 수 있는 Neon Postgres를 설정하는 방법을 안내합니다.
이 설정을 진행하기 전에 [Neon 콘솔](https://console.neon.tech/app/projects)에 로그인했는지 확인하십시오.

## 권한이 있는 사용자 생성 \{#creating-a-user-with-permissions\}

관리자 권한이 있는 사용자로 Neon 인스턴스에 접속한 후 다음 명령을 실행합니다:

1. ClickPipes 전용 사용자를 생성합니다:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 이전 단계에서 생성한 사용자에게 스키마 수준의 읽기 전용 권한을 부여합니다. 다음 예시는 `public` 스키마에 대한 권한을 보여줍니다. 복제하려는 테이블이 포함된 각 스키마마다 이 명령들을 반복합니다:
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 사용자에게 복제 권한을 부여합니다:

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. 복제하려는 테이블을 포함하는 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)을 생성합니다. 성능 오버헤드를 방지하기 위해 publication에는 필요한 테이블만 포함할 것을 강력히 권장합니다.

   :::warning
   publication에 포함되는 모든 테이블에는 **기본 키(primary key)**가 정의되어 있거나, **replica identity**가 `FULL`로 설정되어 있어야 합니다. 범위 지정에 대한 안내는 [Postgres FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)를 참조하십시오.
   :::

   - 특정 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 특정 스키마의 모든 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication에는 지정된 테이블에서 생성되는 변경 이벤트 집합이 포함되며, 이후 복제 스트림을 수집하는 데 사용됩니다.

## 논리 복제(Logical Replication) 활성화 \{#enable-logical-replication\}

Neon에서는 UI를 통해 논리 복제(Logical Replication)를 활성화할 수 있습니다. 이는 ClickPipes의 CDC가 데이터를 복제하는 데 필요합니다.
**Settings** 탭으로 이동한 후 **Logical Replication** 섹션으로 이동하십시오.

<Image size="lg" img={neon_enable_replication} alt="논리 복제 활성화" border />

**Enable**을 클릭하여 이 단계를 완료하십시오. 활성화가 완료되면 아래와 같은 성공 메시지가 표시됩니다.

<Image size="lg" img={neon_enabled_replication} alt="논리 복제 활성화 완료" border />

이제 Neon Postgres 인스턴스에서 다음 설정을 확인하십시오:

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```


## IP 화이트리스트 설정(Neon Enterprise 요금제용) \{#ip-whitelisting-for-neon-enterprise-plan\}

Neon Enterprise 요금제를 사용하는 경우, [ClickPipes IP](../../index.md#list-of-static-ips)를 화이트리스트에 추가하여 ClickPipes에서 Neon Postgres 인스턴스로 복제를 허용할 수 있습니다.
이를 위해 **Settings** 탭을 클릭한 뒤 **IP Allow** 섹션으로 이동하십시오.

<Image size="lg" img={neon_ip_allow} alt="IP 허용 화면" border/>

## 연결 정보 복사 \{#copy-connection-details\}

이제 USER와 publication 설정을 마치고 복제를 활성화했으므로, 새로운 ClickPipe를 생성하기 위해 연결 정보를 복사할 수 있습니다.
**Dashboard**로 이동한 후, 연결 문자열이 표시되는 텍스트 상자에서
표시 방식을 **Parameters Only**로 변경하십시오. 다음 단계를 위해 이 매개변수들이 필요합니다.

<Image size="lg" img={neon_conn_details} alt="연결 정보" border/>

## 다음 단계 \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하여 Postgres 인스턴스에서 ClickHouse Cloud로 데이터 수집을 시작할 수 있습니다.
Postgres 인스턴스를 설정할 때 사용한 연결 정보는 ClickPipe 생성 과정에서 필요하므로 반드시 메모해 두십시오.