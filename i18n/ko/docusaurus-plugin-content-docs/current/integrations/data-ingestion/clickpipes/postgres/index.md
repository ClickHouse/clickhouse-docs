---
'sidebar_label': 'Postgres에서 ClickHouse로 데이터 수집'
'description': 'Postgres를 ClickHouse Cloud에 매끄럽게 연결합니다.'
'slug': '/integrations/clickpipes/postgres'
'title': 'Postgres에서 ClickHouse로 데이터 수집 (CDC 사용)'
'keywords':
- 'PostgreSQL'
- 'ClickPipes'
- 'CDC'
- 'change data capture'
- 'database replication'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'clickpipes'
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


# Postgres에서 ClickHouse로 데이터 수집하기 (CDC 사용)

ClickPipes를 사용하여 소스 Postgres 데이터베이스에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다. 소스 Postgres 데이터베이스는 온프레미스 또는 Amazon RDS, Google Cloud SQL, Azure Database for Postgres, Supabase 등 클라우드에서 호스팅될 수 있습니다.

## 전제 조건 {#prerequisites}

시작하려면 먼저 Postgres 데이터베이스가 올바르게 설정되었는지 확인해야 합니다. 소스 Postgres 인스턴스에 따라 다음 가이드 중 하나를 따를 수 있습니다:

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [Generic Postgres Source](./postgres/source/generic), 다른 Postgres 제공업체를 사용하거나 자체 호스팅된 인스턴스를 사용하는 경우.

9. [TimescaleDB](./postgres/source/timescale), 관리형 서비스 또는 자체 호스팅된 인스턴스에서 TimescaleDB 확장을 사용하는 경우.

:::warning

PgBouncer, RDS Proxy, Supabase Pooler와 같은 Postgres 프록시는 CDC 기반 복제를 지원하지 않습니다. ClickPipes 설정에 사용할 수 없으므로 실제 Postgres 데이터베이스의 연결 세부 정보를 추가해야 합니다.

:::

소스 Postgres 데이터베이스가 설정되면 ClickPipe 생성을 계속 진행할 수 있습니다.

## ClickPipe 생성하기 {#creating-your-clickpipe}

ClickHouse Cloud 계정에 로그인되어 있는지 확인하십시오. 계정이 아직 없다면 [여기](https://cloud.clickhouse.com/)에서 가입할 수 있습니다.

[//]: # (   TODO update image here)
1. ClickHouse Cloud 콘솔에서 ClickHouse Cloud 서비스를 탐색합니다.

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. 왼쪽 메뉴에서 `데이터 소스` 버튼을 선택하고 "ClickPipe 설정"을 클릭합니다.

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. `Postgres CDC` 타일을 선택합니다.

   <Image img={postgres_tile} alt="Select Postgres" size="lg" border/>

### 소스 Postgres 데이터베이스 연결 추가하기 {#adding-your-source-postgres-database-connection}

4. 전제 조건 단계에서 구성한 소스 Postgres 데이터베이스의 연결 세부 정보를 입력합니다.

   :::info

   연결 세부 정보를 추가하기 전에 ClickPipes의 IP 주소를 방화벽 규칙에 화이트리스트에 추가했는지 확인합니다. ClickPipes의 IP 주소 목록은 [여기](../index.md#list-of-static-ips)에서 확인할 수 있습니다.
   더 많은 정보는 [이 페이지 상단](#prerequisites)에 연결된 소스 Postgres 설정 가이드를 참조하십시오.

   :::

   <Image img={postgres_connection_details} alt="Fill in connection details" size="lg" border/>

#### (선택 사항) AWS Private Link 설정하기 {#optional-setting-up-aws-private-link}

AWS에 호스팅된 소스 Postgres 데이터베이스에 연결하려면 AWS Private Link를 사용할 수 있습니다. 이는 데이터 전송을 비공식적으로 유지하고 싶을 때 유용합니다.
[연결 설정 가이드](https://cloud.clickhouse.com/integrations/clickpipes/aws-privatelink)를 따라 설정할 수 있습니다.

#### (선택 사항) SSH 터널링 설정하기 {#optional-setting-up-ssh-tunneling}

소스 Postgres 데이터베이스가 공개적으로 액세스할 수 없는 경우 SSH 터널링 세부 정보를 지정할 수 있습니다.

1. "SSH 터널링 사용" 토글을 활성화합니다.
2. SSH 연결 세부 정보를 입력합니다.

   <Image img={ssh_tunnel} alt="SSH tunneling" size="lg" border/>

3. 키 기반 인증을 사용하려면 "키 쌍 무효화 및 생성"을 클릭하여 새로운 키 쌍을 생성하고 생성된 공개 키를 SSH 서버의 `~/.ssh/authorized_keys`에 복사합니다.
4. "연결 확인"을 클릭하여 연결을 확인합니다.

:::note

ClickPipes가 SSH 터널을 설정할 수 있도록 SSH 배스천 호스트의 방화벽 규칙에서 [ClickPipes의 IP 주소](../clickpipes#list-of-static-ips)를 화이트리스트에 추가해야 합니다.

:::

연결 세부 정보가 입력되면 "다음"을 클릭하십시오.

### 복제 설정 구성하기 {#configuring-the-replication-settings}

5. 전제 조건 단계에서 생성한 복제 슬롯을 드롭다운 목록에서 선택합니다.

   <Image img={select_replication_slot} alt="Select replication slot" size="lg" border/>

#### 고급 설정 {#advanced-settings}

필요한 경우 고급 설정을 구성할 수 있습니다. 각 설정에 대한 간략한 설명은 아래와 같습니다:

- **동기화 간격**: ClickPipes가 소스 데이터베이스에서 변경 사항을 가져오는 간격입니다. 이는 목적지 ClickHouse 서비스에 영향을 주며, 비용에 민감한 사용자에게는 이 값을 높게 유지할 것을 권장합니다(3600 초 이상).
- **초기 로드를 위한 병렬 스레드**: 초기 스냅샷을 가져오는 데 사용할 병렬 작업자의 수입니다. 테이블이 많을 경우 초기 스냅샷을 가져오는 데 사용되는 병렬 작업자의 수를 제어할 수 있습니다. 이 설정은 테이블별로 적용됩니다.
- **당겨오기 배치 크기**: 한 번의 배치에서 가져올 행의 수입니다. 이는 최선의 노력 설정이며 모든 경우에 해당되지 않을 수 있습니다.
- **파티션당 스냅샷 행 수**: 초기 스냅샷 동안 각 파티션에서 가져올 행의 수입니다. 테이블에 행이 많을 경우 각 파티션에서 가져오는 행의 수를 제어할 수 있습니다.
- **병렬로 가져올 테이블 수**: 초기 스냅샷 동안 병렬로 가져올 테이블의 수입니다. 테이블이 많을 경우 병렬로 가져오는 테이블의 수를 제어할 수 있습니다.

### 테이블 구성하기 {#configuring-the-tables}

6. 여기에서 ClickPipe의 목적지 데이터베이스를 선택할 수 있습니다. 기존 데이터베이스를 선택하거나 새로 생성할 수 있습니다.

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

7. 소스 Postgres 데이터베이스에서 복제할 테이블을 선택할 수 있습니다. 테이블을 선택하는 동안 ClickHouse 데이터베이스에서 테이블 이름을 변경하거나 특정 컬럼을 제외할 수도 있습니다.

   :::warning
   ClickHouse에서 정렬 키를 Postgres의 기본 키와 다르게 정의하고 있는 경우, 모든 [고려 사항](/integrations/clickpipes/postgres/ordering_keys)을 읽는 것을 잊지 마십시오.
   :::

### 권한 검토 및 ClickPipe 시작하기 {#review-permissions-and-start-the-clickpipe}

8. 권한 드롭다운에서 "전체 액세스" 역할을 선택하고 "설정 완료"를 클릭합니다.

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

## 다음은 무엇인가요? {#whats-next}

PostgreSQL에서 ClickHouse Cloud로 데이터를 복제하도록 ClickPipe를 설정한 후, 최적의 성능을 위해 데이터를 쿼리하고 모델링하는 방법에 집중할 수 있습니다. [마이그레이션 가이드](/migrations/postgresql/overview)를 참조하여 요구 사항에 가장 적합한 전략을 평가하고, [중복 제거 전략 (CDC 사용)](/integrations/clickpipes/postgres/deduplication) 및 [정렬 키](/integrations/clickpipes/postgres/ordering_keys) 페이지에서 CDC 작업에 대한 모범 사례를 확인하십시오.

PostgreSQL CDC 및 문제 해결에 대한 일반적인 질문은 [Postgres FAQs 페이지](/integrations/clickpipes/postgres/faq)를 참조하세요.
