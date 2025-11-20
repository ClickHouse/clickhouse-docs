---
'sidebar_label': 'MySQL에서 ClickHouse로 데이터 수집'
'description': 'MySQL을 ClickHouse Cloud에 원활하게 연결하는 방법을 설명합니다.'
'slug': '/integrations/clickpipes/mysql'
'title': 'MySQL에서 ClickHouse로 데이터 수집하기 (CDC 사용)'
'doc_type': 'guide'
'keywords':
- 'MySQL'
- 'ClickPipes'
- 'CDC'
- 'change data capture'
- 'database replication'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mysql_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-tile.png'
import mysql_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-connection-details.png'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# MySQL에서 ClickHouse로 데이터 수집 (CDC 사용)

<BetaBadge/>

:::info
ClickPipes를 통해 MySQL에서 ClickHouse Cloud로 데이터를 수집하는 기능은 공개 베타 단계에 있습니다.
:::

ClickPipes를 사용하여 소스 MySQL 데이터베이스에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다. 소스 MySQL 데이터베이스는 온프레미스 또는 Amazon RDS, Google Cloud SQL 등과 같은 서비스를 통해 클라우드에 호스팅될 수 있습니다.

## 필수 조건 {#prerequisites}

시작하려면 먼저 MySQL 데이터베이스가 binlog 복제를 위해 올바르게 구성되어 있는지 확인해야 합니다. 구성 단계는 MySQL을 배포하는 방법에 따라 다르므로, 아래의 관련 가이드를 따라 주시기 바랍니다:

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL for MySQL](./mysql/source/gcp)

4. [Generic MySQL](./mysql/source/generic)

5. [Amazon RDS MariaDB](./mysql/source/rds_maria)

6. [Generic MariaDB](./mysql/source/generic_maria)

소스 MySQL 데이터베이스가 설정되면 ClickPipe 생성을 계속할 수 있습니다.

## ClickPipe 생성하기 {#create-your-clickpipe}

ClickHouse Cloud 계정에 로그인되어 있는지 확인하십시오. 아직 계정이 없다면 [여기](https://cloud.clickhouse.com/)에서 가입할 수 있습니다.

[//]: # (   TODO update image here)
1. ClickHouse Cloud 콘솔에서 ClickHouse Cloud 서비스를 탐색합니다.

<Image img={cp_service} alt="ClickPipes 서비스" size="lg" border/>

2. 왼쪽 메뉴에서 `데이터 소스` 버튼을 선택하고 "ClickPipe 설정"을 클릭합니다.

<Image img={cp_step0} alt="수입 선택" size="lg" border/>

3. `MySQL CDC` 타일을 선택합니다.

<Image img={mysql_tile} alt="MySQL 선택" size="lg" border/>

### 소스 MySQL 데이터베이스 연결 추가하기 {#add-your-source-mysql-database-connection}

4. 필수 조건 단계에서 구성한 소스 MySQL 데이터베이스의 연결 세부정보를 입력합니다.

   :::info
   연결 세부정보 추가를 시작하기 전에 ClickPipes IP 주소를 방화벽 규칙에 허용해야 합니다. 다음 페이지에서 [ClickPipes IP 주소 목록](../index.md#list-of-static-ips)을 찾을 수 있습니다.
   추가 정보는 [이 페이지 상단](#prerequisites)에 링크된 소스 MySQL 설정 가이드를 참조하십시오.
   :::

   <Image img={mysql_connection_details} alt="연결 세부정보 입력" size="lg" border/>

#### (선택사항) SSH 터널링 설정하기 {#optional-set-up-ssh-tunneling}

소스 MySQL 데이터베이스가 공개적으로 접근할 수 없는 경우 SSH 터널링 세부정보를 지정할 수 있습니다.

1. "SSH 터널링 사용" 토글을 활성화합니다.
2. SSH 연결 세부정보를 입력합니다.

   <Image img={ssh_tunnel} alt="SSH 터널링" size="lg" border/>

3. 키 기반 인증을 사용하려면 "키 쌍 취소 및 생성" 버튼을 클릭하여 새 키 쌍을 생성하고 생성된 공개 키를 SSH 서버의 `~/.ssh/authorized_keys`에 복사합니다.
4. "연결 확인" 버튼을 클릭하여 연결을 확인합니다.

:::note
ClickPipes가 SSH 터널을 설정할 수 있도록 SSH 배스천 호스트에 대한 방화벽 규칙에 [ClickPipes IP 주소](../clickpipes#list-of-static-ips)를 허용하십시오.
:::

연결 세부정보를 모두 입력한 후 `다음`을 클릭합니다.

#### 고급 설정 구성하기 {#advanced-settings}

필요한 경우 고급 설정을 구성할 수 있습니다. 각 설정에 대한 간단한 설명은 아래와 같습니다:

- **동기화 간격**: ClickPipes가 소스 데이터베이스에서 변경 사항을 확인하는 간격입니다. 이는 목적지 ClickHouse 서비스에 영향을 미치므로, 비용에 민감한 사용자에게는 이 값을 높게 설정하는 것을 권장합니다 (3600초 이상).
- **초기 로드를 위한 병렬 스레드**: 초기 스냅샷을 가져오는 데 사용할 병렬 작업자의 수입니다. 테이블 수가 많은 경우 초기 스냅샷을 가져오는 병렬 작업자 수를 제어하는 데 유용합니다. 이 설정은 테이블별입니다.
- **풀 배치 크기**: 한 번의 배치에서 가져올 행의 수입니다. 이는 최선의 노력을 다하는 설정으로 모든 경우에 지켜지지 않을 수 있습니다.
- **파티션당 스냅샷 행 수**: 초기 스냅샷 중 각 파티션에서 가져올 행의 수입니다. 테이블에 많은 행이 있는 경우 각 파티션에서 가져오는 행 수를 제어하는 데 유용합니다.
- **병렬 테이블의 스냅샷 수**: 초기 스냅샷 중 병렬로 가져올 테이블의 수입니다. 테이블 수가 많을 경우 병렬로 가져오는 테이블 수를 제어하는 데 유용합니다.

### 테이블 구성하기 {#configure-the-tables}

5. 여기에서 ClickPipe의 목적지 데이터베이스를 선택할 수 있습니다. 기존 데이터베이스를 선택하거나 새로 만들 수 있습니다.

   <Image img={select_destination_db} alt="목적지 데이터베이스 선택" size="lg" border/>

6. 소스 MySQL 데이터베이스에서 복제할 테이블을 선택할 수 있습니다. 테이블을 선택할 때에는 목적지 ClickHouse 데이터베이스에서 테이블 이름을 변경하거나 특정 컬럼을 제외할 수도 있습니다.

### 권한 검토 및 ClickPipe 시작하기 {#review-permissions-and-start-the-clickpipe}

7. 권한 드롭다운에서 "전체 액세스" 역할을 선택하고 "설정 완료"를 클릭합니다.

   <Image img={ch_permissions} alt="권한 검토" size="lg" border/>

마지막으로, 일반적인 문제와 이를 해결하는 방법에 대한 추가 정보는 ["MySQL용 ClickPipes FAQ"](/integrations/clickpipes/mysql/faq) 페이지를 참조해 주시기 바랍니다.

## 다음 단계는 무엇인가요? {#whats-next}

[//]: # "TODO Write a MySQL-specific migration guide and best practices similar to the existing one for PostgreSQL. The current migration guide points to the MySQL table engine, which is not ideal."

MySQL에서 ClickHouse Cloud로 데이터 복제를 위한 ClickPipe를 설정한 후에는 쿼리 및 데이터 모델링을 최적의 성능을 위해 집중할 수 있습니다. MySQL CDC와 관련된 일반적인 질문 및 문제 해결에 대한 내용은 [MySQL FAQ 페이지](/integrations/data-ingestion/clickpipes/mysql/faq.md)를 참조하십시오.
