---
sidebar_label: 'BladePipe'
sidebar_position: 20
keywords: ['clickhouse', 'BladePipe', '연결', '통합', 'CDC', 'ETL', '데이터 통합']
slug: /integrations/bladepipe
description: 'BladePipe 데이터 파이프라인을 사용하여 ClickHouse로 데이터를 스트리밍합니다'
title: 'BladePipe를 ClickHouse에 연결'
doc_type: 'guide'
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

<PartnerBadge />

<a href="https://www.bladepipe.com/" target="_blank">BladePipe</a>는 1초 미만의 지연 시간으로 플랫폼 전반에서 원활한 데이터 흐름을 지원하는 실시간 엔드투엔드 데이터 통합 도구입니다.

ClickHouse는 BladePipe의 사전 구축된 커넥터 중 하나로, 다양한 소스의 데이터를 ClickHouse로 자동 통합할 수 있습니다. 이 페이지에서는 ClickHouse에 데이터를 실시간으로 로드하는 방법을 단계별로 설명합니다.

## 지원되는 소스 \{#supported-sources\}

현재 BladePipe는 다음 소스에서 ClickHouse로의 데이터 통합을 지원합니다:

* MySQL/MariaDB/AuroraMySQL
* Oracle
* PostgreSQL/AuroraPostgreSQL
* MongoDB
* Kafka
* PolarDB-MySQL
* OceanBase
* TiDB

추가 소스도 순차적으로 지원될 예정입니다.

<VerticalStepper headerLevel="h2">
  ## BladePipe 다운로드 및 실행 \{#1-run-bladepipe\}

  1. <a href="https://www.bladepipe.com/" target="_blank">BladePipe Cloud</a>에 로그인합니다.

  2. <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_docker" target="_blank">Install Worker (Docker)</a> 또는 <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_binary" target="_blank">Install Worker (Binary)</a>의 안내에 따라 BladePipe Worker를 다운로드하고 설치합니다.

  :::note
  또는 <a href="https://doc.bladepipe.com/productOP/onPremise/installation/install_all_in_one_binary" target="_blank">BladePipe Enterprise</a>를 다운로드하여 배포할 수 있습니다.
  :::

  ## ClickHouse를 대상으로 추가 \{#2-add-clickhouse-as-a-target\}

  :::note

  1. BladePipe는 ClickHouse 버전 `20.12.3.3` 이상을 지원합니다.

  2. ClickHouse를 대상으로 사용하려면 사용자에게 SELECT, INSERT 및 일반 DDL 권한이 있어야 합니다.
     :::

  3. BladePipe에서 &quot;DataSource&quot; &gt; &quot;Add DataSource&quot;를 클릭합니다.

  4. `ClickHouse`를 선택한 다음 ClickHouse 호스트와 포트, 사용자 이름과 비밀번호를 입력하여 설정을 완료하고 &quot;Test Connection&quot;을 클릭합니다.

     <Image img={bp_ck_1} size="lg" border alt="ClickHouse를 대상으로 추가" />

  5. 하단의 &quot;Add DataSource&quot;를 클릭하면 ClickHouse 인스턴스가 추가됩니다.

  ## MySQL을 소스로 추가 \{#3-add-mysql-as-a-source\}

  이 튜토리얼에서는 MySQL 인스턴스를 소스로 사용하여 MySQL 데이터를 ClickHouse로 적재하는 과정을 설명합니다.

  :::note
  MySQL을 소스로 사용하려면 사용자에게 <a href="https://doc.bladepipe.com/dataMigrationAndSync/datasource_func/MySQL/privs_for_mysql" target="_blank">필요한 권한</a>이 있어야 합니다.
  :::

  1. BladePipe에서 &quot;DataSource&quot; &gt; &quot;Add DataSource&quot;를 클릭합니다.

  2. `MySQL`을 선택한 다음 MySQL 호스트와 포트, 사용자 이름과 비밀번호를 입력하여 설정을 완료하고 &quot;Test Connection&quot;을 클릭합니다.

     <Image img={bp_ck_2} size="lg" border alt="MySQL을 소스로 추가" />

  3. 하단의 &quot;Add DataSource&quot;를 클릭하면 MySQL 인스턴스가 추가됩니다.

  ## 파이프라인 생성 \{#4-create-a-pipeline\}

  1. BladePipe에서 &quot;DataJob&quot; &gt; &quot;Create DataJob&quot;을 클릭합니다.

  2. 추가한 MySQL 및 ClickHouse 인스턴스를 선택하고 &quot;Test Connection&quot;을 클릭하여 BladePipe가 해당 인스턴스에 연결되어 있는지 확인합니다. 그런 다음 이동할 데이터베이스를 선택합니다.
     <Image img={bp_ck_3} size="lg" border alt="소스와 대상 선택" />

  3. DataJob Type으로 &quot;Incremental&quot;을 선택하고, &quot;Full Data&quot; 옵션도 함께 선택합니다.
     <Image img={bp_ck_4} size="lg" border alt="동기화 유형 선택" />

  4. 복제할 테이블을 선택합니다.
     <Image img={bp_ck_5} size="lg" border alt="테이블 선택" />

  5. 복제할 컬럼을 선택합니다.
     <Image img={bp_ck_6} size="lg" border alt="컬럼 선택" />

  6. DataJob 생성을 확인하면 DataJob이 자동으로 실행됩니다.
     <Image img={bp_ck_8} size="lg" border alt="DataJob 실행 중" />

  ## 데이터 검증 \{#5-verify-the-data\}

  1. MySQL 인스턴스에서 데이터 쓰기를 중지하고 ClickHouse가 데이터를 병합할 때까지 기다립니다.
     :::note
     ClickHouse의 자동 병합 시점을 예측할 수 없으므로, `OPTIMIZE TABLE xxx FINAL;` 명령을 실행하여 수동으로 병합을 트리거할 수 있습니다. 수동 병합이 항상 성공하는 것은 아니라는 점에 유의하십시오.

  또는 `CREATE VIEW xxx_v AS SELECT * FROM xxx FINAL;` 명령을 실행하여 뷰(View)를 생성하고 해당 뷰에서 쿼리를 수행하여 데이터가 완전히 병합되었는지 확인할 수 있습니다.
  :::

  2. <a href="https://doc.bladepipe.com/operation/job_manage/create_job/create_period_verification_correction_job" target="_blank">검증 DataJob</a>을 생성합니다. 검증 DataJob이 완료되면 결과를 검토하여 ClickHouse의 데이터와 MySQL의 데이터가 동일한지 확인하십시오.
     <Image img={bp_ck_9} size="lg" border alt="데이터 검증" />
</VerticalStepper>