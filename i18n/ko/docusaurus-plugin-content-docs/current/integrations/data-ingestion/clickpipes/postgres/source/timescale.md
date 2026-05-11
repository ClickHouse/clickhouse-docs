---
sidebar_label: 'Timescale'
description: 'ClickPipes의 소스로 사용할 TimescaleDB 확장이 포함된 Postgres 설정'
slug: /integrations/clickpipes/postgres/source/timescale
title: 'TimescaleDB 확장이 포함된 Postgres 소스 설정 가이드'
keywords: ['TimescaleDB']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import BetaBadge from '@theme/badges/BetaBadge';


# TimescaleDB를 사용하는 Postgres 소스 설정 가이드 \{#postgres-with-timescaledb-source-setup-guide\}

<BetaBadge/>

## 배경 \{#background\}

[TimescaleDB](https://github.com/timescale/timescaledb)는 Timescale Inc에서 개발한 오픈 소스 Postgres 확장으로, Postgres를 벗어나지 않고도 분석 쿼리 성능을 향상시키는 것을 목표로 합니다. 이는 확장에서 관리하는 「hypertable」을 생성하고, 이를 청크(chunks) 단위로 자동 파티셔닝하도록 지원함으로써 달성됩니다. 
Hypertable은 또한 투명한 압축 및 하이브리드 행-열 지향(row-columnar) 스토리지(「hypercore」라고도 함)를 지원하지만, 이러한 기능을 사용하려면 독점 라이선스가 적용된 버전의 확장이 필요합니다.

Timescale Inc는 TimescaleDB에 대해 다음 두 가지 관리형 서비스를 제공합니다. 

- `Managed Service for Timescale`
- `Timescale Cloud`. 

TimescaleDB 확장을 사용할 수 있는 관리형 서비스를 제공하는 서드파티 벤더도 있지만, 라이선스 제약으로 인해 이들 벤더는 오픈 소스 버전의 확장만 지원합니다.

Timescale hypertable은 여러 측면에서 일반 Postgres 테이블과 다르게 동작합니다. 이로 인해 이를 복제하는 과정이 복잡해지며, 따라서 Timescale hypertable의 복제 기능은 **최선의 노력(best effort)** 수준으로 간주해야 합니다.

## 지원되는 Postgres 버전 \{#supported-postgres-versions\}

ClickPipes는 Postgres 버전 12 이상을 지원합니다.

## 논리적 복제(logical replication) 활성화 \{#enable-logical-replication\}

TimescaleDB가 포함된 Postgres 인스턴스가 어떻게 배포되었는지에 따라 수행해야 할 절차가 달라집니다. 

- 관리형 서비스를 사용하고 있고 서비스 제공자가 사이드바에 나열되어 있는 경우, 해당 제공자용 가이드를 따르십시오.
- TimescaleDB를 직접 배포하는 경우, 일반 가이드(generic guide)를 따르십시오. 

그 밖의 관리형 서비스를 사용하는 경우, 아직 논리적 복제가 활성화되어 있지 않다면 서비스 제공자 측에 지원 티켓을 생성하여
논리적 복제를 활성화하는 데 도움을 받으십시오.

:::info
Timescale Cloud는 Postgres 파이프의 CDC 모드에 필요한 논리적 복제 활성화를 지원하지 않습니다.
따라서 Timescale Cloud 사용자는 Postgres ClickPipe를 사용하여 데이터에 대해 한 번만 적재하는
`Initial Load Only` 작업만 수행할 수 있습니다.
:::

## Configuration \{#configuration\}

Timescale hypertable는 하이퍼테이블 자체에 삽입된 데이터를 저장하지 않습니다. 대신 해당 데이터는 `_timescaledb_internal` 스키마에 있는 여러 개의 청크(`chunk`) 테이블에 저장됩니다. 하이퍼테이블에 대해 쿼리를 실행할 때는 이것이 문제가 되지 않습니다. 하지만 논리 복제를 수행하는 동안에는 하이퍼테이블의 변경 사항을 감지하는 대신 청크 테이블에서 변경 사항을 감지하게 됩니다. Postgres ClickPipe에는 청크 테이블에서 상위 하이퍼테이블로 변경 사항을 자동으로 재매핑하는 로직이 있지만, 이를 위해서는 추가 단계가 필요합니다.

:::info
데이터를 한 번만 로드하는 작업(`Initial Load Only`)만 수행하려는 경우, 2단계부터는 건너뜁니다.
:::

1. ClickPipes 전용 사용자를 생성합니다:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 이전 단계에서 생성한 사용자에게 스키마 수준의 읽기 전용 접근 권한을 부여합니다. 다음 예시는 `public` 스키마에 대한 권한을 보여줍니다. 복제하려는 테이블이 포함된 각 스키마에 대해 이 명령을 반복하십시오:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 사용자에게 복제(replication) 권한을 부여합니다:

    ```sql
    ALTER USER clickpipes_user WITH REPLICATION;
    ```

4. 복제하려는 테이블을 포함하는 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)을 생성합니다. 성능 오버헤드를 줄이기 위해, publication에는 필요한 테이블만 포함할 것을 강력히 권장합니다.

   :::warning
   publication에 포함되는 모든 테이블에는 **primary key**가 정의되어 있거나, **replica identity**가 `FULL`로 설정되어 있어야 합니다. 범위 설정에 대한 안내는 [Postgres FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)를 참조하십시오.
   :::

   - 특정 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 특정 스키마 내의 모든 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication에는 지정된 테이블에서 생성된 변경 이벤트 집합이 포함되며, 이후 복제 스트림을 수집하는 데 사용됩니다.

이 단계들을 완료한 후에는 [ClickPipe 생성](../index.md)을 계속 진행하면 됩니다.

## 네트워크 액세스 구성 \{#configure-network-access\}

Timescale 인스턴스로 향하는 트래픽을 제한하려는 경우, [문서화된 고정 NAT IP](../../index.md#list-of-static-ips)를 허용 목록에 추가하십시오.
이 작업을 수행하는 방법은 클라우드 제공자마다 다르므로, 사용 중인 제공자가 사이드바에 나와 있다면 해당 내용을 참고하거나, 제공자에 지원 티켓을 생성해 문의하십시오.