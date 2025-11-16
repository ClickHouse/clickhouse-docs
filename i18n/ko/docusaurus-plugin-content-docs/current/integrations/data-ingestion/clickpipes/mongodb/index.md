---
'sidebar_label': 'MongoDB에서 ClickHouse로 데이터 수집'
'description': 'MongoDB를 ClickHouse Cloud에 원활하게 연결하는 방법을 설명합니다.'
'slug': '/integrations/clickpipes/mongodb'
'title': 'MongoDB에서 ClickHouse로 데이터 수집 (CDC 사용)'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mongodb'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mongodb_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-tile.png'
import mongodb_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-connection-details.png'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# MongoDB에서 ClickHouse로 데이터 전송 (CDC 사용)

<BetaBadge/>

:::info
ClickPipes를 통해 MongoDB에서 ClickHouse Cloud로 데이터를 전송하는 기능이 공개 베타 버전입니다.
:::

:::note
ClickHouse Cloud 콘솔과 문서에서는 "테이블"과 "컬렉션"을 MongoDB에 대해 서로 바꾸어 사용합니다.
:::

ClickPipes를 사용하여 MongoDB 데이터베이스에서 ClickHouse Cloud로 데이터를 전송할 수 있습니다. 소스 MongoDB 데이터베이스는 온프레미스 또는 MongoDB Atlas와 같은 클라우드 서비스에서 호스팅될 수 있습니다.

## 전제 조건 {#prerequisites}

시작하려면 먼저 MongoDB 데이터베이스가 복제를 위해 올바르게 구성되어 있는지 확인해야 합니다. 구성 단계는 MongoDB 배포 방법에 따라 다르므로, 아래의 관련 가이드를 따라 주세요:

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [Generic MongoDB](./mongodb/source/generic)

소스 MongoDB 데이터베이스가 설정되면 ClickPipe를 만들기 계속할 수 있습니다.

## ClickPipe 만들기 {#create-your-clickpipe}

ClickHouse Cloud 계정에 로그인되어 있는지 확인하세요. 아직 계정이 없다면 [여기서](https://cloud.clickhouse.com/) 가입할 수 있습니다.

1. ClickHouse Cloud 콘솔에서 ClickHouse Cloud 서비스를 탐색합니다.

<Image img={cp_service} alt="ClickPipes 서비스" size="lg" border/>

2. 왼쪽 메뉴에서 `데이터 소스` 버튼을 선택하고 "ClickPipe 설정"을 클릭합니다.

<Image img={cp_step0} alt="수입 선택" size="lg" border/>

3. `MongoDB CDC` 타일을 선택합니다.

<Image img={mongodb_tile} alt="MongoDB 선택" size="lg" border/>

### 소스 MongoDB 데이터베이스 연결 추가 {#add-your-source-mongodb-database-connection}

4. 전제 조건 단계에서 구성한 소스 MongoDB 데이터베이스의 연결 세부정보를 입력합니다.

   :::info
   연결 세부정보를 추가하기 전에 ClickPipes IP 주소를 방화벽 규칙에서 허용 목록에 추가했는지 확인하세요. 다음 페이지에서 [ClickPipes IP 주소 목록](../index.md#list-of-static-ips)을 찾을 수 있습니다.
   더 많은 정보는 [이 페이지 상단의 링크](#prerequisites)에 있는 소스 MongoDB 설정 가이드를 참조하세요.
   :::

   <Image img={mongodb_connection_details} alt="연결 세부정보 입력" size="lg" border/>

연결 세부정보를 입력한 후 `다음`을 클릭합니다.

#### 고급 설정 구성 {#advanced-settings}

필요에 따라 고급 설정을 구성할 수 있습니다. 각 설정에 대한 간략한 설명은 아래에 제공됩니다:

- **동기화 간격**: ClickPipes가 소스 데이터베이스에서 변경 사항을 폴링하는 간격입니다. 이는 목적지 ClickHouse 서비스에 영향을 미치며, 비용 민감한 사용자에게는 이 값을 높게 유지할 것을 권장합니다 (3600 초 이상).
- **풀 배치 크기**: 단일 배치에서 가져올 행의 수입니다. 이는 최대한의 노력을 기울이는 설정이며 모든 경우에 준수되지 않을 수 있습니다.
- **병렬 스냅샷 테이블 수**: 초기 스냅샷 동안 병렬로 가져올 테이블 수입니다. 많은 수의 테이블이 있는 경우 병렬로 가져올 테이블 수를 제어하는 데 유용합니다.

### 테이블 구성하기 {#configure-the-tables}

5. 여기에서 ClickPipe의 목적지 데이터베이스를 선택할 수 있습니다. 기존 데이터베이스를 선택하거나 새 데이터베이스를 만들 수 있습니다.

   <Image img={select_destination_db} alt="목적지 데이터베이스 선택" size="lg" border/>

6. 소스 MongoDB 데이터베이스에서 복제할 테이블을 선택할 수 있습니다. 테이블을 선택하는 동안 ClickHouse 데이터베이스의 테이블 이름을 변경할 수도 있습니다.

### 권한 검토 및 ClickPipe 시작 {#review-permissions-and-start-the-clickpipe}

7. 권한 드롭다운에서 "전체 액세스" 역할을 선택하고 "설정 완료"를 클릭합니다.

   <Image img={ch_permissions} alt="권한 검토" size="lg" border/>

## 다음 단계는 무엇인가요? {#whats-next}

MongoDB에서 ClickHouse Cloud로 데이터를 복제하도록 ClickPipe를 설정한 후에는 데이터 쿼리 및 모델링을 통해 최적의 성능을 달성하는 데 집중할 수 있습니다.

## 주의사항 {#caveats}

이 커넥터를 사용할 때 유의해야 할 몇 가지 사항은 다음과 같습니다:

- MongoDB 버전 5.1.0 이상이 필요합니다.
- MongoDB의 네이티브 Change Streams API를 사용하여 CDC를 수행하며, 이는 실시간 변경 사항을 캡처하기 위해 MongoDB oplog에 의존합니다.
- MongoDB의 문서는 기본적으로 ClickHouse에 JSON 형식으로 복제됩니다. 이는 유연한 스키마 관리가 가능하며 ClickHouse에서 쿼리 및 분석을 위해 풍부한 JSON 연산자를 사용할 수 있게 합니다. JSON 데이터 쿼리에 대한 더 많은 정보는 [여기](https://clickhouse.com/docs/sql-reference/data-types/newjson)에서 확인할 수 있습니다.
- 자체 서비스형 PrivateLink 구성은 현재 제공되지 않습니다. AWS에서 PrivateLink가 필요한 경우 db-integrations-support@clickhouse.com으로 연락하시거나 지원 티켓을 생성해 주시면, 활성화를 위해 함께 작업하겠습니다.
