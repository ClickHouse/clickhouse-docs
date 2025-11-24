---
'sidebar_label': 'BladePipe'
'sidebar_position': 20
'keywords':
- 'clickhouse'
- 'BladePipe'
- 'connect'
- 'integrate'
- 'cdc'
- 'etl'
- 'data integration'
'slug': '/integrations/bladepipe'
'description': 'BladePipe 데이터 파이프라인을 사용하여 ClickHouse로 데이터를 스트리밍합니다.'
'title': 'BladePipe를 ClickHouse에 연결하기'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import bp_ck_1 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_1.png';
import bp_ck_2 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_2.png';
import bp_ck_3 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_3.png';
import bp_ck_4 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_4.png';
import bp_ck_5 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_5.png';
import bp_ck_6 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_6.png';
import bp_ck_7 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_7.png';
import bp_ck_8 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_8.png';
import bp_ck_9 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_9.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Connect BladePipe to ClickHouse

<PartnerBadge/>

<a href="https://www.bladepipe.com/" target="_blank">BladePipe</a>는 서브 초 단위 지연으로 실시간 종단 간 데이터 통합 도구로, 플랫폼 간 매끄러운 데이터 흐름을 증대시킵니다.

ClickHouse는 BladePipe의 사전 구축된 커넥터 중 하나로, 사용자가 다양한 출처의 데이터를 ClickHouse에 자동으로 통합할 수 있도록 합니다. 이 페이지에서는 데이터를 ClickHouse에 실시간으로 로드하는 방법을 단계별로 설명합니다.

## Supported sources {#supported-sources}
현재 BladePipe는 다음 출처에서 ClickHouse로의 데이터 통합을 지원합니다:
- MySQL/MariaDB/AuroraMySQL
- Oracle
- PostgreSQL/AuroraPostgreSQL
- MongoDB
- Kafka
- PolarDB-MySQL
- OceanBase
- TiDB

더 많은 출처가 지원될 예정입니다.

<VerticalStepper headerLevel="h2">
## Download and run BladePipe {#1-run-bladepipe}
1. <a href="https://www.bladepipe.com/" target="_blank">BladePipe Cloud</a>에 로그인합니다.

2. <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_docker" target="_blank">Worker 설치 (Docker)</a> 또는 <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_binary" target="_blank">Worker 설치 (Binary)</a>의 지침을 따라 BladePipe Worker를 다운로드하고 설치합니다.

  :::note
  또는 <a href="https://doc.bladepipe.com/productOP/onPremise/installation/install_all_in_one_binary" target="_blank">BladePipe Enterprise</a>를 다운로드하여 배포할 수 있습니다.
  :::

## Add ClickHouse as a target {#2-add-clickhouse-as-a-target}

  :::note
  1. BladePipe는 ClickHouse 버전 `20.12.3.3` 이상을 지원합니다.
  2. ClickHouse를 대상으로 사용하려면 사용자가 SELECT, INSERT 및 일반 DDL 권한을 가지고 있어야 합니다.
  :::

1. BladePipe에서 "DataSource" > "Add DataSource"를 클릭합니다.

2. `ClickHouse`를 선택하고 ClickHouse 호스트 및 포트, 사용자 이름 및 비밀번호를 입력하여 설정을 완료하고 "Test Connection"을 클릭합니다.

    <Image img={bp_ck_1} size="lg" border alt="Add ClickHouse as a target" />

3. 하단의 "Add DataSource"를 클릭하면 ClickHouse 인스턴스가 추가됩니다.

## Add MySQL as a source {#3-add-mysql-as-a-source}
이 튜토리얼에서는 MySQL 인스턴스를 소스로 사용하고 MySQL 데이터를 ClickHouse로 로드하는 프로세스를 설명합니다.

:::note
MySQL을 소스로 사용하려면 사용자가 <a href="https://doc.bladepipe.com/dataMigrationAndSync/datasource_func/MySQL/privs_for_mysql" target="_blank">필요한 권한</a>을 가지고 있어야 합니다.
:::

1. BladePipe에서 "DataSource" > "Add DataSource"를 클릭합니다.

2. `MySQL`을 선택하고 MySQL 호스트 및 포트, 사용자 이름 및 비밀번호를 입력하여 설정을 완료하고 "Test Connection"을 클릭합니다.

    <Image img={bp_ck_2} size="lg" border alt="Add MySQL as a source" />

3. 하단의 "Add DataSource"를 클릭하면 MySQL 인스턴스가 추가됩니다.

## Create a pipeline {#4-create-a-pipeline}

1. BladePipe에서 "DataJob" > "Create DataJob"을 클릭합니다.

2. 추가된 MySQL 및 ClickHouse 인스턴스를 선택하고 "Test Connection"을 클릭하여 BladePipe가 인스턴스에 연결되어 있는지 확인합니다. 그런 다음 이동할 데이터베이스를 선택합니다.
   <Image img={bp_ck_3} size="lg" border alt="Select source and target" />

3. DataJob 유형으로 "Incremental"을 선택하고 "Full Data" 옵션을 함께 선택합니다.
   <Image img={bp_ck_4} size="lg" border alt="Select sync type" />

4. 복제할 테이블을 선택합니다.
   <Image img={bp_ck_5} size="lg" border alt="Select tables" />

5. 복제할 컬럼을 선택합니다.
   <Image img={bp_ck_6} size="lg" border alt="Select columns" />

6. DataJob 생성을 확인하고 DataJob이 자동으로 실행됩니다.
    <Image img={bp_ck_8} size="lg" border alt="DataJob is running" />

## Verify the data {#5-verify-the-data}
1. MySQL 인스턴스에서 데이터 작성을 중지하고 ClickHouse가 데이터를 병합할 때까지 기다립니다.
:::note
ClickHouse의 자동 병합 시기가 예측 불가능하므로 `OPTIMIZE TABLE xxx FINAL;` 명령을 실행하여 수동으로 병합을 트리거할 수 있습니다. 이 수동 병합이 항상 성공하지 않을 수 있다는 점에 유의하세요.

또는 `CREATE VIEW xxx_v AS SELECT * FROM xxx FINAL;` 명령을 실행하여 뷰를 생성하고 뷰에서 쿼리를 실행하여 데이터가 완전히 병합되었는지 확인할 수 있습니다.
:::

2. <a href="https://doc.bladepipe.com/operation/job_manage/create_job/create_period_verification_correction_job" target="_blank">Verification DataJob</a>을 생성합니다. Verification DataJob이 완료되면 결과를 검토하여 ClickHouse의 데이터가 MySQL의 데이터와 동일한지 확인합니다.
   <Image img={bp_ck_9} size="lg" border alt="Verify data" />
   
</VerticalStepper>
