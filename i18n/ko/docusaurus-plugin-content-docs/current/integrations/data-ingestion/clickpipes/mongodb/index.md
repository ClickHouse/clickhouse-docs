---
sidebar_label: 'MongoDB에서 ClickHouse로 데이터 수집'
description: 'MongoDB를 ClickHouse Cloud에 원활하게 연결하는 방법을 설명합니다.'
slug: /integrations/clickpipes/mongodb
title: 'MongoDB에서 ClickHouse로 데이터 수집(CDC 사용)'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '데이터 수집', '실시간 동기화']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mongodb_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-tile.png'
import mongodb_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-connection-details.png'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'


# MongoDB에서 ClickHouse로 데이터 수집하기 (CDC 사용) \{#ingesting-data-from-mongodb-to-clickhouse-using-cdc\}

<BetaBadge/>

:::info
ClickPipes를 사용하여 MongoDB에서 ClickHouse Cloud로 데이터를 수집하는 기능은 퍼블릭 베타 단계입니다.
:::

:::note
ClickHouse Cloud 콘솔과 문서에서는 MongoDB와 관련하여 「table」과 「collection」을 같은 의미로 사용합니다.
:::

ClickPipes를 사용하여 MongoDB 데이터베이스의 데이터를 ClickHouse Cloud로 수집할 수 있습니다. 소스 MongoDB 데이터베이스는 온프레미스나 MongoDB Atlas와 같은 서비스를 사용한 클라우드 환경 어디에든 호스팅될 수 있습니다.

## 사전 준비 사항 \{#prerequisites\}

시작하려면 먼저 MongoDB 데이터베이스가 복제를 위해 올바르게 구성되어 있는지 확인해야 합니다. 구성 단계는 MongoDB 배포 방식에 따라 달라지므로 아래에서 해당하는 가이드를 따라 진행하십시오:

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [Generic MongoDB](./mongodb/source/generic)

3. [Amazon DocumentDB](./mongodb/source/documentdb)

소스 MongoDB 데이터베이스의 구성이 완료되면 ClickPipe 생성을 계속 진행할 수 있습니다.

## ClickPipe 생성하기 \{#create-your-clickpipe\}

ClickHouse Cloud 계정에 로그인되어 있는지 확인하십시오. 아직 계정이 없다면 [여기](https://cloud.clickhouse.com/)에서 가입할 수 있습니다.

1. ClickHouse Cloud 콘솔에서 ClickHouse Cloud Service로 이동합니다.

<Image img={cp_service} alt="ClickPipes 서비스" size="lg" border/>

2. 왼쪽 메뉴에서 `Data Sources` 버튼을 클릭한 다음 "Set up a ClickPipe"를 선택합니다.

<Image img={cp_step0} alt="가져오기 선택" size="lg" border/>

3. `MongoDB CDC` 타일을 선택합니다.

<Image img={mongodb_tile} alt="MongoDB 선택" size="lg" border/>

### 소스 MongoDB 데이터베이스 연결 추가 \{#add-your-source-mongodb-database-connection\}

4. 사전 준비 단계에서 구성한 소스 MongoDB 데이터베이스의 연결 정보를 입력합니다.

   :::info
   연결 정보를 추가하기 전에 방화벽 규칙에서 ClickPipes IP 주소를 허용 목록에 추가했는지 확인하십시오. 다음 페이지에서 [ClickPipes IP 주소 목록](../index.md#list-of-static-ips)을 확인할 수 있습니다.
   자세한 내용은 [이 페이지 상단](#prerequisites)에 연결된 소스 MongoDB 설정 가이드를 참고하십시오.
   :::

   <Image img={mongodb_connection_details} alt="연결 정보 입력" size="lg" border/>

#### (선택 사항) SSH 터널링 설정 \{#optional-set-up-ssh-tunneling\}

소스 MongoDB 데이터베이스가 공용 인터넷에서 접근할 수 없는 경우 SSH 터널링 정보를 지정할 수 있습니다.

1. "Use SSH Tunnelling" 토글을 활성화합니다.
2. SSH 연결 정보를 입력합니다.

   <Image img={ssh_tunnel} alt="SSH 터널링" size="lg" border/>

3. 키 기반 인증을 사용하려면 "Revoke and generate key pair"를 클릭하여 새 키 쌍을 생성한 다음, 생성된 공개 키를 SSH 서버의 `~/.ssh/authorized_keys`에 복사합니다.
4. "Verify Connection"을 클릭하여 연결을 확인합니다.

:::note
SSH 베스천 호스트에 대해 방화벽 규칙에서 [ClickPipes IP 주소](../clickpipes#list-of-static-ips)를 허용 목록에 추가하여 ClickPipes가 SSH 터널을 설정할 수 있도록 하십시오.
:::

연결 정보를 모두 입력한 후 `Next`를 클릭합니다.

#### 고급 설정 구성 \{#advanced-settings\}

필요한 경우 고급 설정을 구성할 수 있습니다. 각 설정에 대한 간단한 설명은 아래와 같습니다:

- **Sync interval**: ClickPipes가 소스 데이터베이스에서 변경 사항을 폴링하는 간격입니다. 이는 대상 ClickHouse 서비스에 영향을 미치므로, 비용에 민감한 사용자는 이 값을 높은 값으로(`3600` 이상) 유지할 것을 권장합니다.
- **Pull batch size**: 한 번에 하나의 배치로 가져올 행의 개수입니다. 이 설정은 best effort로 적용되며, 모든 경우에 이 값이 그대로 지켜지지 않을 수 있습니다.
- **Snapshot number of tables in parallel**: 초기 스냅샷 동안 병렬로 가져올 테이블 개수입니다. 많은 수의 테이블이 있고 병렬로 가져오는 테이블 수를 제어하려는 경우 유용합니다.

### 테이블 구성 \{#configure-the-tables\}

5. 여기에서 ClickPipe의 대상 데이터베이스를 선택할 수 있습니다. 기존 데이터베이스를 선택하거나 새로 만들 수 있습니다.

   <Image img={select_destination_db} alt="대상 데이터베이스 선택" size="lg" border/>

6. 소스 MongoDB 데이터베이스에서 복제할 테이블을 선택할 수 있습니다. 테이블을 선택할 때 대상 ClickHouse 데이터베이스에서 테이블 이름을 변경하도록 선택할 수도 있습니다.

### 권한을 검토하고 ClickPipe를 시작합니다 \{#review-permissions-and-start-the-clickpipe\}

7. 권한 드롭다운에서 「Full access」 역할을 선택한 다음 「Complete Setup」을 클릭합니다.

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

## 다음 단계는? \{#whats-next\}

MongoDB에서 ClickHouse Cloud로 데이터가 레플리케이션되도록 ClickPipe 설정을 완료했다면, 이제 최적의 성능을 위해 데이터를 어떻게 쿼리하고 모델링할지에 집중할 수 있습니다.

## 유의 사항 \{#caveats\}

이 커넥터를 사용할 때의 유의사항은 다음과 같습니다.

- MongoDB 5.1.0 이상 버전이 필요합니다.
- CDC를 위해 MongoDB의 네이티브 Change Streams API를 사용하며, 이는 MongoDB oplog를 기반으로 실시간 변경 사항을 캡처합니다. 
- MongoDB의 도큐먼트는 기본적으로 ClickHouse에 JSON 타입으로 복제됩니다. 이를 통해 스키마를 유연하게 관리할 수 있으며, ClickHouse에서 제공하는 다양한 JSON 연산자를 사용해 쿼리 및 분석을 수행할 수 있습니다. JSON 데이터 쿼리에 대한 자세한 내용은 [여기](https://clickhouse.com/docs/sql-reference/data-types/newjson)를 참고하십시오.
- 셀프 서비스형 PrivateLink 설정 기능은 현재 제공되지 않습니다. AWS를 사용 중이며 PrivateLink가 필요한 경우, db-integrations-support@clickhouse.com으로 문의하거나 지원 티켓을 생성해 주십시오. PrivateLink 활성화를 위해 지원해 드립니다.