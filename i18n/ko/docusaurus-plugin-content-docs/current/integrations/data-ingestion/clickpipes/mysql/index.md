---
sidebar_label: 'MySQL에서 ClickHouse로 데이터 수집'
description: 'MySQL 또는 MariaDB 데이터베이스의 데이터를 ClickHouse Cloud로 원활하게 수집합니다.'
slug: /integrations/clickpipes/mysql
title: 'MySQL에서 ClickHouse로 데이터 수집 (CDC 사용)'
doc_type: 'guide'
keywords: ['MySQL', 'ClickPipes', 'CDC', '변경 데이터 캡처(change data capture)', '데이터베이스 복제']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import Aurorasvg from '@site/static/images/integrations/logos/amazon_aurora.svg';
import AFSsvg from '@site/static/images/integrations/logos/azure_database_mysql.svg';
import CloudSQLsvg from '@site/static/images/integrations/logos/gcp_cloudsql.svg';
import MariaDBsvg from '@site/static/images/integrations/logos/mariadb.svg';
import MySQLsvg from '@site/static/images/integrations/logos/mysql.svg';
import RDSsvg from '@site/static/images/integrations/logos/amazon_rds.svg';
import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mysql_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-tile.png'
import mysql_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-connection-details.png'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# MySQL에서 ClickHouse로 데이터 수집하기 (CDC 사용) \{#ingesting-data-from-mysql-to-clickhouse-using-cdc\}

<BetaBadge/>

:::info
ClickPipes를 통해 MySQL에서 ClickHouse Cloud로 데이터를 수집하는 기능은 퍼블릭 베타 단계입니다.
:::

MySQL ClickPipe는 MySQL 및 MariaDB 데이터베이스에서 ClickHouse Cloud로 데이터를 수집하기 위한 완전 관리형이면서도 안정적인 방법을 제공합니다. 일회성 수집을 위한 **대량 적재(bulk load)** 와 지속적인 수집을 위한 **Change Data Capture (CDC)** 를 모두 지원합니다.

MySQL ClickPipes는 ClickPipes UI를 사용하여 수동으로 배포하고 관리할 수 있습니다. 향후에는 [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) 및 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe)를 사용하여 MySQL ClickPipes를 프로그래밍 방식으로 배포하고 관리할 수 있게 될 예정입니다.

## 사전 준비 사항 \{#prerequisites\}

[//]: # "TODO Binlog 복제 설정은 1회성 수집 파이프에는 필요하지 않습니다. 이는 그동안 혼란의 원인이 되어 왔으므로, 사용자가 주저하지 않도록 대량 적재에 필요한 최소 요구 사항도 함께 제공해야 합니다."

시작하려면 먼저 MySQL 데이터베이스가 binlog 복제를 위해 올바르게 설정되어 있는지 확인해야 합니다. 구성 단계는 MySQL 배포 방식에 따라 달라지므로, 아래의 해당 안내서를 따라 주십시오:

### 지원되는 데이터 소스 \{#supported-data-sources\}

| Name                 | Logo | Details           |
|----------------------|------|-------------------|
| **Amazon RDS MySQL** <br></br> _일회성 적재, CDC_ |  | [Amazon RDS MySQL](./mysql/source/rds) 구성 가이드를 따르십시오. |
| **Amazon Aurora MySQL** <br></br> _일회성 적재, CDC_ |  | [Amazon Aurora MySQL](./mysql/source/aurora) 구성 가이드를 따르십시오. |
| **Cloud SQL for MySQL** <br></br> _일회성 적재, CDC_ | |  [Cloud SQL for MySQL](./mysql/source/gcp) 구성 가이드를 따르십시오. |
| **Azure Flexible Server for MySQL** <br></br> _일회성 적재_ |  | [Azure Flexible Server for MySQL](./mysql/source/azure-flexible-server-mysql) 구성 가이드를 따르십시오. |
| **Self-hosted MySQL** <br></br> _일회성 적재, CDC_ | |  [Generic MySQL](./mysql/source/generic) 구성 가이드를 따르십시오. |
| **Amazon RDS MariaDB** <br></br> _일회성 적재, CDC_ |  | [Amazon RDS MariaDB](./mysql/source/rds_maria) 구성 가이드를 따르십시오. |
| **Self-hosted MariaDB** <br></br> _일회성 적재, CDC_ | |  [Generic MariaDB](./mysql/source/generic_maria) 구성 가이드를 따르십시오. |

소스 MySQL 데이터베이스를 설정한 후에는 ClickPipe 생성을 계속 진행할 수 있습니다.

## ClickPipe 생성하기 \{#create-your-clickpipe\}

ClickHouse Cloud 계정에 로그인되어 있는지 확인하십시오. 아직 계정이 없다면 [여기](https://cloud.clickhouse.com/)에서 가입할 수 있습니다.

[//]: # (   TODO update image here)

1. ClickHouse Cloud 콘솔에서 사용 중인 ClickHouse Cloud Service로 이동합니다.

<Image img={cp_service} alt="ClickPipes 서비스" size="lg" border/>

2. 왼쪽 메뉴에서 `Data Sources` 버튼을 선택한 다음 「Set up a ClickPipe」를 클릭합니다.

<Image img={cp_step0} alt="가져오기 항목 선택" size="lg" border/>

3. `MySQL CDC` 타일을 선택합니다.

<Image img={mysql_tile} alt="MySQL 선택" size="lg" border/>

### 소스 MySQL 데이터베이스 연결 추가 \{#add-your-source-mysql-database-connection\}

4. 사전 준비 단계에서 구성해 둔 소스 MySQL 데이터베이스의 연결 정보를 입력합니다.

   :::info
   연결 정보를 추가하기 전에 방화벽 규칙에서 ClickPipes IP 주소를 허용하도록 설정했는지 확인하십시오. 다음 페이지에서 [ClickPipes IP 주소 목록](../index.md#list-of-static-ips)을 확인할 수 있습니다.
   자세한 내용은 [이 페이지 상단](#prerequisites)에 연결된 소스 MySQL 설정 가이드를 참고하십시오.
   :::

   <Image img={mysql_connection_details} alt="연결 정보 입력" size="lg" border/>

#### (선택 사항) SSH 터널링 설정 \{#optional-set-up-ssh-tunneling\}

소스 MySQL 데이터베이스가 공용 인터넷에서 접근할 수 없는 경우 SSH 터널링 정보를 지정할 수 있습니다.

1. "Use SSH Tunnelling" 토글을 활성화합니다.
2. SSH 연결 정보를 입력합니다.

   <Image img={ssh_tunnel} alt="SSH tunneling" size="lg" border/>

3. 키 기반 인증을 사용하려면 "Revoke and generate key pair"를 클릭하여 새 키 쌍을 생성한 뒤, 생성된 공개 키를 SSH 서버의 `~/.ssh/authorized_keys`에 복사합니다.
4. "Verify Connection"을 클릭하여 연결을 확인합니다.

:::note
ClickPipes가 SSH 터널을 설정할 수 있도록, SSH 배스천 호스트의 방화벽 규칙에서 [ClickPipes IP addresses](../clickpipes#list-of-static-ips)를 허용 목록에 추가하십시오.
:::

연결 정보를 모두 입력한 후 `Next`를 클릭합니다.

#### 고급 설정 구성 \{#advanced-settings\}

필요한 경우 고급 설정을 구성할 수 있습니다. 각 설정에 대한 간단한 설명은 다음과 같습니다.

- **Sync interval**: ClickPipes가 소스 데이터베이스의 변경 사항을 폴링하는 주기입니다. 이 값은 대상 ClickHouse 서비스에 영향을 줍니다. 비용에 민감한 사용자의 경우 이 값을 비교적 큰 값(예: `3600` 이상)으로 설정할 것을 권장합니다.
- **Parallel threads for initial load**: 초기 스냅샷을 가져올 때 사용되는 병렬 워커 수입니다. 테이블 수가 많고 초기 스냅샷을 가져오는 데 사용되는 병렬 워커 수를 제어하려는 경우에 유용합니다. 이 설정은 테이블별로 적용됩니다.
- **Pull batch size**: 단일 배치에서 가져올 행의 수입니다. 최선의 시도로 동작하는 설정이므로, 모든 경우에 이 값이 그대로 적용되지 않을 수 있습니다.
- **Snapshot number of rows per partition**: 초기 스냅샷 동안 각 파티션에서 가져올 행의 수입니다. 테이블에 행이 매우 많고 각 파티션에서 가져오는 행의 수를 제어하려는 경우에 유용합니다.
- **Snapshot number of tables in parallel**: 초기 스냅샷 동안 병렬로 가져올 테이블의 수입니다. 테이블 수가 많고 병렬로 가져올 테이블 수를 제어하려는 경우에 유용합니다.

### 테이블 구성 \{#configure-the-tables\}

5. 여기에서 ClickPipe의 대상 데이터베이스를 선택할 수 있습니다. 기존 데이터베이스를 선택하거나 새 데이터베이스를 생성할 수 있습니다.

   <Image img={select_destination_db} alt="대상 데이터베이스 선택" size="lg" border/>

6. 원본 MySQL 데이터베이스에서 복제할 테이블을 선택할 수 있습니다. 테이블을 선택하는 과정에서 대상 ClickHouse 데이터베이스에서 테이블 이름을 변경하거나 특정 컬럼을 제외하도록 설정할 수도 있습니다.

### 권한 검토 및 ClickPipe 시작 \{#review-permissions-and-start-the-clickpipe\}

7. 권한 드롭다운에서 "Full access" 역할을 선택한 후 "Complete Setup"을 클릭합니다.

   <Image img={ch_permissions} alt="권한 검토" size="lg" border/>

마지막으로, 자주 발생하는 문제와 해결 방법에 대한 자세한 내용은 ["ClickPipes for MySQL FAQ"](/integrations/clickpipes/mysql/faq) 페이지를 참고하십시오.

## 다음 단계는 무엇입니까? \{#whats-next\}

[//]: # "PostgreSQL용 기존 가이드와 유사한 MySQL 전용 마이그레이션 가이드와 모범 사례 문서를 작성해야 합니다. 현재 마이그레이션 가이드는 MySQL 테이블 엔진을 가리키고 있으며, 이는 최선의 방법이 아닙니다."

ClickPipe를 설정하여 MySQL에서 ClickHouse Cloud로 데이터를 복제하도록 했다면, 이제 최적의 성능을 위해 데이터를 어떻게 쿼리하고 모델링할지에 집중하면 됩니다. MySQL CDC 및 문제 해결과 관련된 일반적인 질문은 [MySQL FAQ 페이지](/integrations/data-ingestion/clickpipes/mysql/faq.md)를 참고하십시오.