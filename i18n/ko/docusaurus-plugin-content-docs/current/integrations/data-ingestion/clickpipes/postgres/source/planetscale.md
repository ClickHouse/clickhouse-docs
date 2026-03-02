---
sidebar_label: 'Postgres용 PlanetScale'
description: 'ClickPipes의 소스로 PlanetScale for Postgres를 설정합니다'
slug: /integrations/clickpipes/postgres/source/planetscale
title: 'PlanetScale for Postgres 소스 설정 가이드'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';


# PlanetScale for Postgres 소스 설정 가이드 \{#planetscale-for-postgres-source-setup-guide\}

:::info
PlanetScale for Postgres는 현재 [얼리 액세스(Early Access)](https://planetscale.com/postgres) 단계로 제공됩니다.
:::

## 지원되는 Postgres 버전 \{#supported-postgres-versions\}

ClickPipes는 Postgres 버전 12 이상을 지원합니다.

## 논리적 복제 활성화 \{#enable-logical-replication\}

1. Postgres 인스턴스에서 복제를 활성화하려면 다음 설정이 되어 있는지 확인해야 합니다:

    ```sql
    wal_level = logical
    ```
   이를 확인하려면 다음 SQL 명령을 실행합니다:
    ```sql
    SHOW wal_level;
    ```

   기본적으로 출력 값은 `logical`이어야 합니다. 그렇지 않은 경우 PlanetScale 콘솔에 로그인한 후 `Cluster configuration->Parameters`로 이동하여 아래로 스크롤해 `Write-ahead log`에서 값을 변경합니다.

<Image img={planetscale_wal_level_logical} alt="PlanetScale 콘솔에서 wal_level 조정" size="md" border/>

:::warning
PlanetScale 콘솔에서 이 값을 변경하면 재시작이 발생합니다.
:::

2. 또한 기본값인 4GB에서 `max_slot_wal_keep_size` 설정 값을 늘리는 것이 좋습니다. 이는 PlanetScale 콘솔에서 `Cluster configuration->Parameters`로 이동한 뒤, 아래로 스크롤해 `Write-ahead log`에서 마찬가지로 변경할 수 있습니다. 적절한 새 값을 결정하려면 [여기](../faq#recommended-max_slot_wal_keep_size-settings)를 참고하십시오.

<Image img={planetscale_max_slot_wal_keep_size} alt="PlanetScale 콘솔에서 max_slot_wal_keep_size 조정" size="md" border/>

## 권한 및 publication이 있는 사용자 생성 \{#creating-a-user-with-permissions-and-publication\}

기본 `postgres.<...>` 사용자를 사용하여 PlanetScale Postgres 인스턴스에 접속한 후 다음 명령을 실행합니다:

1. ClickPipes 전용 사용자를 생성합니다:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 이전 단계에서 생성한 사용자에게 스키마 수준의 읽기 전용 권한을 부여합니다. 다음 예시는 `public` 스키마에 대한 권한을 보여 줍니다. 복제하려는 테이블이 포함된 각 스키마에 대해 이 명령들을 반복해서 실행합니다:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 사용자에게 복제(replication) 권한을 부여합니다:

    ```sql
    ALTER USER clickpipes_user WITH REPLICATION;
    ```

4. 복제하려는 테이블을 포함하는 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)을 생성합니다. 성능 오버헤드를 줄이기 위해 publication에는 꼭 필요한 테이블만 포함할 것을 강력히 권장합니다.

   :::warning
   publication에 포함되는 모든 테이블에는 **기본 키(primary key)**가 정의되어 있거나, **replica identity**가 `FULL`로 설정되어 있어야 합니다. 스코프 설정에 대한 안내는 [Postgres FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)를 참고하십시오.
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

## 주의사항 \{#caveats\}

1. PlanetScale Postgres에 연결하려면 앞에서 생성한 사용자 이름에 현재 브랜치를 덧붙여야 합니다. 예를 들어, 생성한 사용자의 이름이 `clickpipes_user`인 경우, ClickPipe 생성 시 실제로 제공해야 하는 사용자 이름은 `clickpipes_user`.`branch` 형식이며, 여기서 `branch`는 현재 PlanetScale Postgres [브랜치](https://planetscale.com/docs/postgres/branching)의 "id"를 의미합니다. 이를 빠르게 확인하려면 앞에서 사용자 생성에 사용한 `postgres` 사용자의 사용자 이름을 참고하면 되며, 마침표 뒤에 오는 부분이 브랜치 ID입니다.
2. PlanetScale Postgres에 연결하는 CDC 파이프에는 `PSBouncer` 포트(현재 `6432`)를 사용하지 말고, 일반 포트인 `5432`를 반드시 사용해야 합니다. 초기 로드 전용 파이프의 경우에는 두 포트 중 어느 것이든 사용할 수 있습니다.
3. 기본 인스턴스에만 연결되어 있는지 반드시 확인하십시오. 현재는 [레플리카 인스턴스에 연결](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas)하는 것은 지원되지 않습니다. 

## 다음 단계 \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하고 Postgres 인스턴스에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다.
Postgres 인스턴스를 설정할 때 사용한 연결 정보를 반드시 메모해 두십시오. ClickPipe를 생성하는 과정에서 해당 정보가 필요합니다.