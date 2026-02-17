---
sidebar_label: 'Google Cloud SQL'
description: 'ClickPipes 소스로 사용할 Google Cloud SQL Postgres 인스턴스 설정'
slug: /integrations/clickpipes/postgres/source/google-cloudsql
title: 'Google Cloud SQL Postgres 소스 설정 가이드'
doc_type: 'guide'
keywords: ['google cloud sql', 'postgres', 'clickpipes', 'logical decoding', 'firewall']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
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


# Google Cloud SQL Postgres 소스 설정 가이드 \{#google-cloud-sql-postgres-source-setup-guide\}

:::info

사이드바에 나열된 지원 프로바이더를 사용하는 경우 해당 프로바이더 전용 가이드를 참고하십시오.

:::

## 지원되는 Postgres 버전 \{#supported-postgres-versions\}

Postgres 12 이상 버전은 모두 지원됩니다.

## 논리적 복제(logical replication) 활성화 \{#enable-logical-replication\}

`cloudsql.logical_decoding`이 on이고 `wal_sender_timeout`이 0으로 설정되어 있으면 **아래 단계를 따를 필요가 없습니다**. 다른 데이터 복제(replication) 도구에서 마이그레이션하는 경우에는 이 설정들이 대부분 이미 구성되어 있습니다.

1. Overview 페이지에서 **Edit** 버튼을 클릭합니다.

<Image img={edit_button} alt="Cloud SQL Postgres에서 Edit 버튼" size="lg" border/>

2. Flags 탭으로 이동하여 `cloudsql.logical_decoding`을 on으로, `wal_sender_timeout`을 0으로 변경합니다. 이러한 변경 사항을 적용하려면 Postgres 서버를 재시작해야 합니다.

<Image img={cloudsql_logical_decoding1} alt="cloudsql.logical_decoding을 on으로 변경" size="lg" border/>

<Image img={cloudsql_logical_decoding2} alt="cloudsql.logical_decoding과 wal_sender_timeout 변경 완료" size="lg" border/>

<Image img={cloudsql_logical_decoding3} alt="서버 재시작" size="lg" border/>

## ClickPipes 사용자 생성 및 권한 부여 \{#creating-clickpipes-user-and-granting-permissions\}

관리자 사용자로 Cloud SQL Postgres 인스턴스에 접속한 후 아래 명령을 실행하십시오.

1. ClickPipes 전용 사용자를 생성합니다.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 이전 단계에서 생성한 사용자에게 스키마 단위의 읽기 전용 권한을 부여합니다. 아래 예시는 `public` 스키마에 대한 권한을 보여 줍니다. 복제하려는 테이블이 포함된 각 스키마에 대해 이 명령들을 반복하십시오.

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. 사용자에게 복제(replication) 권한을 부여합니다.

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. 복제하려는 테이블을 포함하는 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)을 생성합니다. 성능 오버헤드를 피하기 위해 publication에는 필요한 테이블만 포함할 것을 강력히 권장합니다.

   :::warning
   publication에 포함되는 모든 테이블에는 **기본 키(primary key)**가 정의되어 있거나, **replica identity**가 `FULL`로 설정되어 있어야 합니다. 범위 지정 방법에 대한 가이드는 [Postgres FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)를 참고하십시오.
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

[//]: # (TODO SSH 터널링 추가)

## 방화벽에 ClickPipes IP 주소 추가 \{#add-clickpipes-ips-to-firewall\}

아래 절차에 따라 ClickPipes IP 주소를 네트워크에 추가합니다.

:::note

SSH 터널링을 사용 중인 경우, Jump Server/Bastion의 방화벽 규칙에 [ClickPipes IP 주소](../../index.md#list-of-static-ips)를 추가해야 합니다.

:::

1. **Connections** 섹션으로 이동합니다.

<Image img={connections} alt="Cloud SQL의 Connections 섹션" size="lg" border/>

2. 하위 섹션인 **Networking**으로 이동합니다.

<Image img={connections_networking} alt="Cloud SQL의 Networking 하위 섹션" size="lg" border/>

3. [ClickPipes의 공용 IP 주소](../../index.md#list-of-static-ips)를 추가합니다.

<Image img={firewall1} alt="방화벽에 ClickPipes 네트워크 추가" size="lg" border/>

<Image img={firewall2} alt="방화벽에 추가된 ClickPipes 네트워크" size="lg" border/>

## 다음 단계 \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하여 Postgres 인스턴스에서 ClickHouse Cloud로 데이터를 수집하기 시작할 수 있습니다.
Postgres 인스턴스를 설정할 때 사용한 연결 정보를 반드시 기록해 두십시오. ClickPipe를 생성하는 과정에서 이 정보가 필요합니다.