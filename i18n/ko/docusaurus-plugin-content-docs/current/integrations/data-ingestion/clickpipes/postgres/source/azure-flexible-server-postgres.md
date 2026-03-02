---
sidebar_label: 'Postgres용 Azure Flexible Server'
description: 'ClickPipes 소스로 Azure Flexible Server for Postgres를 설정합니다'
slug: /integrations/clickpipes/postgres/source/azure-flexible-server-postgres
title: 'Postgres용 Azure Flexible Server 소스 설정 가이드'
keywords: ['azure', 'flexible server', 'postgres', 'clickpipes', 'wal level']
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';


# Azure Flexible Server for Postgres 소스 설정 가이드 \{#azure-flexible-server-for-postgres-source-setup-guide\}

ClickPipes는 Postgres 12 이상 버전을 지원합니다.

## 논리적 복제(logical replication) 활성화 \{#enable-logical-replication\}

`wal_level`이 `logical`로 설정되어 있다면, 아래 단계를 **따를 필요가 없습니다**. 다른 데이터 복제 도구에서 마이그레이션하는 경우에는 이 설정이 대부분 미리 구성되어 있을 것입니다.

1. **Server parameters** 섹션을 클릭합니다.

<Image img={server_parameters} alt="Azure Flexible Server for Postgres의 Server Parameters" size="lg" border/>

2. `wal_level` 값을 `logical`로 수정합니다.

<Image img={wal_level} alt="Azure Flexible Server for Postgres에서 wal_level을 logical로 변경" size="lg" border/>

3. 이 변경 사항을 적용하려면 서버 재시작이 필요합니다. 요청이 표시되면 서버를 재시작합니다.

<Image img={restart} alt="wal_level 변경 후 서버 재시작" size="lg" border/>

## ClickPipes 사용자 생성 및 권한 부여 \{#creating-clickpipes-user-and-granting-permissions\}

admin 사용자로 Azure Flexible Server Postgres에 접속한 후 다음 명령을 실행합니다.

1. ClickPipes 전용 사용자를 생성합니다.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 앞 단계에서 생성한 사용자에게 스키마 단위의 읽기 전용 권한을 부여합니다. 아래 예시는 `public` 스키마에 대한 권한을 보여줍니다. 복제하려는 테이블이 포함된 각 스키마에 대해 이 명령들을 반복합니다.

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. 사용자에게 복제 권한을 부여합니다.

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. 복제하려는 테이블을 포함하는 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)을 생성합니다. 성능 오버헤드를 줄이기 위해 publication에는 필요한 테이블만 포함할 것을 강력히 권장합니다.

   :::warning
   publication에 포함되는 모든 테이블에는 **primary key**가 정의되어 있거나, **replica identity**가 `FULL`로 설정되어 있어야 합니다. 범위 지정에 대한 안내는 [Postgres FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)를 참고하십시오.
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

5. `clickpipes_user`에 대해 `wal_sender_timeout`을 0으로 설정합니다.

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```

## ClickPipes IP를 방화벽에 추가 \{#add-clickpipes-ips-to-firewall\}

[ClickPipes IP](../../index.md#list-of-static-ips)를 네트워크에 추가하려면 아래 단계를 따르십시오.

1. **Networking** 탭으로 이동한 후, Azure Flexible Server Postgres의 방화벽 또는 SSH 터널링을 사용하는 경우 Jump Server/Bastion의 방화벽에 [ClickPipes IP](../../index.md#list-of-static-ips)를 추가합니다.

<Image img={firewall} alt="Azure Flexible Server for Postgres에서 방화벽에 ClickPipes IP 추가" size="lg"/>

## 다음 단계 \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하여 Postgres 인스턴스의 데이터를 ClickHouse Cloud로 수집하기 시작할 수 있습니다.
Postgres 인스턴스를 설정할 때 사용한 연결 정보를 반드시 어딘가에 적어 두십시오. ClickPipe를 생성하는 과정에서 해당 정보가 필요합니다.