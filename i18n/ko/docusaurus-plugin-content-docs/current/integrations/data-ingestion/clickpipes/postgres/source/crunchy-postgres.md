---
sidebar_label: 'Crunchy Bridge Postgres'
description: 'ClickPipes 소스로 Crunchy Bridge Postgres를 설정합니다'
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
title: 'Crunchy Bridge Postgres 소스 설정 가이드'
keywords: ['crunchy bridge', 'postgres', 'clickpipes', '논리적 복제', '데이터 수집']
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';


# Crunchy Bridge Postgres 소스 설정 가이드 \{#crunchy-bridge-postgres-source-setup-guide\}

ClickPipes는 Postgres 버전 12 이상을 지원합니다.

## 논리 복제 활성화 \{#enable-logical-replication\}

Crunchy Bridge에서는 논리 복제가 [기본적으로](https://docs.crunchybridge.com/how-to/logical-replication) 활성화되어 있습니다. 아래 설정이 올바르게 구성되어 있는지 확인하고, 그렇지 않다면 적절히 수정하십시오.

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```


## ClickPipes 사용자 생성 및 권한 부여 \{#creating-clickpipes-user-and-granting-permissions\}

`postgres` 사용자로 Crunchy Bridge Postgres에 접속한 뒤 아래 명령들을 실행하십시오:

1. ClickPipes용 전용 사용자를 생성합니다:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 이전 단계에서 생성한 사용자에게 스키마 수준의 읽기 전용 권한을 부여합니다. 아래 예시는 `public` 스키마에 대한 권한을 보여줍니다. 복제하려는 테이블이 포함된 각 스키마에 대해 이 명령들을 반복하십시오:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 사용자에게 복제(replication) 권한을 부여합니다:

    ```sql
     ALTER USER clickpipes_user WITH REPLICATION;
    ```

4. 복제하려는 테이블들로 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)을 생성합니다. 성능 오버헤드를 줄이기 위해 publication에는 필요한 테이블만 포함할 것을 강력히 권장합니다.

   :::warning
   publication에 포함되는 모든 테이블은 **기본 키(primary key)**가 정의되어 있거나, **replica identity**가 `FULL`로 설정되어 있어야 합니다. 범위를 설정하는 방법에 대한 가이드는 [Postgres FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)를 참고하십시오.
   :::

   - 특정 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 특정 스키마 내 모든 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication에는 지정된 테이블에서 생성된 변경 이벤트 집합이 포함되며, 이후 복제 스트림을 수집하는 데 사용됩니다.

## ClickPipes IP 허용 목록 구성 \{#safe-list-clickpipes-ips\}

Crunchy Bridge에서 Firewall 규칙(Firewall Rules)을 추가하여 [ClickPipes IPs](../../index.md#list-of-static-ips)를 허용 목록에 등록합니다.

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="Crunchy Bridge에서 Firewall 규칙(Firewall Rules) 위치" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="ClickPipes용 Firewall 규칙(Firewall Rules) 추가" border/>

## 다음 단계는 무엇인가요? \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하여 Postgres 인스턴스에서 ClickHouse Cloud로 데이터 수집을 시작할 수 있습니다.
Postgres 인스턴스를 설정할 때 사용한 연결 정보를 반드시 메모해 두십시오. ClickPipe를 생성하는 과정에서 해당 정보가 필요합니다.