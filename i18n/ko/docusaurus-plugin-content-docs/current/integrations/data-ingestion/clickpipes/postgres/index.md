---
sidebar_label: 'Postgres에서 ClickHouse로 데이터 수집'
description: 'Postgres를 ClickHouse Cloud와 원활하게 연결합니다.'
slug: /integrations/clickpipes/postgres
title: 'Postgres에서 ClickHouse로 데이터 수집 (CDC 사용)'
keywords: ['PostgreSQL', 'ClickPipes', 'CDC', '변경 데이터 캡처(Change Data Capture)', '데이터베이스 복제']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import postgres_tile from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-tile.png'
import postgres_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-connection-details.jpg'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_replication_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-replication-slot.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-destination-db.jpg'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# Postgres에서 ClickHouse로 데이터 수집 (CDC 사용) \{#ingesting-data-from-postgres-to-clickhouse-using-cdc\}

ClickPipes를 사용하여 원본 Postgres 데이터베이스의 데이터를 ClickHouse Cloud로 수집할 수 있습니다. 원본 Postgres 데이터베이스는 온프레미스 또는 Amazon RDS, Google Cloud SQL, Azure Database for Postgres, Supabase 등을 포함한 클라우드 서비스에서 호스팅될 수 있습니다.

## 사전 준비 사항 \{#prerequisites\}

시작하려면 먼저 Postgres 데이터베이스가 적절히 설정되어 있는지 확인해야 합니다. 사용 중인 소스 Postgres 인스턴스에 따라 다음 가이드 중 하나를 따를 수 있습니다.

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [일반 Postgres 소스](./postgres/source/generic), 다른 Postgres 제공자를 사용하거나 자체 호스팅 인스턴스를 사용하는 경우.

9. [TimescaleDB](./postgres/source/timescale), 관리형 서비스 또는 자체 호스팅 인스턴스에서 TimescaleDB 확장을 사용하는 경우.

:::warning

PgBouncer, RDS Proxy, Supabase Pooler 등의 Postgres 프록시는 CDC 기반 복제를 지원하지 않습니다. ClickPipes 설정에서는 이러한 프록시를 사용하지 말고, 실제 Postgres 데이터베이스의 연결 정보를 추가해야 합니다.

:::

소스 Postgres 데이터베이스 구성이 완료되면 ClickPipe를 계속 생성할 수 있습니다.

## ClickPipe 생성하기 \{#creating-your-clickpipe\}

ClickHouse Cloud 계정에 로그인되어 있는지 확인하십시오. 아직 계정이 없다면 [여기](https://cloud.clickhouse.com/)에서 가입할 수 있습니다.

[//]: # (   TODO update image here)

1. ClickHouse Cloud 콘솔에서 해당 ClickHouse Cloud Service로 이동하십시오.

<Image img={cp_service} alt="ClickPipes 서비스" size="lg" border/>

2. 왼쪽 메뉴에서 `Data Sources` 버튼을 선택한 다음 "ClickPipe 설정"을 클릭하십시오.

<Image img={cp_step0} alt="가져오기 선택" size="lg" border/>

3. `Postgres CDC` 타일을 선택하십시오.

   <Image img={postgres_tile} alt="Postgres 선택" size="lg" border/>

### 소스 Postgres 데이터베이스 연결 추가 \{#adding-your-source-postgres-database-connection\}

4. 사전 준비 단계에서 구성한 소스 Postgres 데이터베이스에 대한 연결 정보를 입력합니다.

   :::info

   연결 정보를 추가하기 전에 방화벽 규칙에서 ClickPipes IP 주소를 허용 목록에 추가했는지 확인하십시오. ClickPipes IP 주소 목록은 [여기](../index.md#list-of-static-ips)에서 확인할 수 있습니다.
   자세한 내용은 [이 페이지 상단](#prerequisites)에 링크된 소스 Postgres 설정 가이드를 참조하십시오.

   :::

   <Image img={postgres_connection_details} alt="연결 정보 입력" size="lg" border/>

#### (선택 사항) AWS Private Link 설정 \{#optional-setting-up-aws-private-link\}

소스 Postgres 데이터베이스가 AWS에 호스팅되어 있는 경우 AWS Private Link를 사용해 연결할 수 있습니다. 이는 데이터 전송을 비공개로 유지하려는 경우에 유용합니다.
[연결 설정 가이드](/integrations/clickpipes/aws-privatelink)를 참고하여 설정하십시오.

#### (Optional) SSH 터널링 설정 \{#optional-setting-up-ssh-tunneling\}

소스 Postgres 데이터베이스가 공개적으로 접근할 수 없는 경우 SSH 터널링 정보를 지정할 수 있습니다.

1. "Use SSH Tunnelling" 토글을 활성화합니다.
2. SSH 연결 정보를 입력합니다.

   <Image img={ssh_tunnel} alt="SSH 터널링" size="lg" border/>

3. 키 기반 인증을 사용하려면 "Revoke and generate key pair"를 클릭하여 새 키 쌍을 생성한 뒤, 생성된 공개 키를 SSH 서버의 `~/.ssh/authorized_keys`에 복사합니다.
4. "Verify Connection"을 클릭하여 연결을 확인합니다.

:::note

SSH 배스천 호스트에 대한 방화벽 규칙에서 [ClickPipes IP addresses](../clickpipes#list-of-static-ips)를 허용 목록에 추가하여 ClickPipes가 SSH 터널을 설정할 수 있도록 해야 합니다.

:::

연결 정보를 모두 입력한 후 "Next"를 클릭합니다.

### 복제 설정 구성 \{#configuring-the-replication-settings\}

5. 사전 준비 단계에서 생성한 replication slot을 드롭다운 목록에서 선택했는지 확인합니다.

   <Image img={select_replication_slot} alt="Replication slot 선택" size="lg" border/>

#### 고급 설정 \{#advanced-settings\}

필요한 경우 고급 설정을 구성할 수 있습니다. 각 설정에 대한 간단한 설명은 아래와 같습니다.

- **Sync interval**: ClickPipes가 소스 데이터베이스의 변경 사항을 조회(polling)하는 주기입니다. 이는 대상 ClickHouse 서비스에 영향을 미치므로, 비용에 민감한 사용자의 경우 이 값을 높은 값(예: `3600` 이상)으로 설정할 것을 권장합니다.
- **Parallel threads for initial load**: 초기 스냅샷을 가져오는 데 사용되는 병렬 워커(worker) 수입니다. 테이블 수가 많고 초기 스냅샷을 가져오는 데 사용되는 병렬 워커 수를 제어하려는 경우에 유용합니다. 이 설정은 테이블별로 적용됩니다.
- **Pull batch size**: 한 번의 배치에서 가져올 행(row) 수입니다. 최대한 이 설정을 따르려 하지만, 모든 경우에 그대로 적용되지 않을 수도 있습니다.
- **Snapshot number of rows per partition**: 초기 스냅샷 동안 각 파티션(partition)에서 가져올 행(row) 수입니다. 테이블에 행이 매우 많고 각 파티션에서 가져오는 행 수를 제어하려는 경우에 유용합니다.
- **Snapshot number of tables in parallel**: 초기 스냅샷 동안 병렬로 가져올 테이블 수입니다. 테이블 수가 많고 병렬로 가져오는 테이블 수를 제어하려는 경우에 유용합니다.

### 테이블 구성하기 \{#configuring-the-tables\}

6. 여기에서 ClickPipe의 대상 데이터베이스를 선택할 수 있습니다. 기존 데이터베이스를 선택하거나 새 데이터베이스를 생성할 수 있습니다.

   <Image img={select_destination_db} alt="대상 데이터베이스 선택" size="lg" border/>

7. 원본 Postgres 데이터베이스에서 복제할 테이블을 선택할 수 있습니다. 테이블을 선택하는 과정에서, 대상 ClickHouse 데이터베이스에서 테이블 이름을 변경하거나 특정 컬럼을 제외하도록 설정할 수도 있습니다.

   :::warning
   ClickHouse에서 ordering key(정렬 키)를 Postgres의 primary key(기본 키)와 다르게 정의하는 경우, 이에 대한 모든 [고려 사항](/integrations/clickpipes/postgres/ordering_keys)을 반드시 확인하십시오.
   :::

### 권한을 검토하고 ClickPipe를 시작하기 \{#review-permissions-and-start-the-clickpipe\}

8. 권한 드롭다운에서 「Full access」 역할을 선택하고 「Complete Setup」을 클릭합니다.

   <Image img={ch_permissions} alt="권한 검토" size="lg" border/>

## 다음 단계는? \{#whats-next\}

PostgreSQL에서 ClickHouse Cloud로 데이터를 복제하는 ClickPipe 구성을 완료했다면, 이제 최적의 성능을 위해 데이터를 어떻게 쿼리하고 모델링할지에 집중하면 됩니다. 요구 사항에 가장 적합한 전략을 평가하려면 [마이그레이션 가이드](/migrations/postgresql/overview)를 참고하고, CDC 워크로드에 대한 모범 사례는 [중복 제거 전략 (CDC 사용)](/integrations/clickpipes/postgres/deduplication)과 [Ordering Keys](/integrations/clickpipes/postgres/ordering_keys) 페이지에서 확인하십시오.

PostgreSQL CDC 관련 일반적인 질문과 문제 해결 방법은 [Postgres FAQ 페이지](/integrations/clickpipes/postgres/faq)를 참고하십시오.