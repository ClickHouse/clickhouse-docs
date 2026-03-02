---
slug: /cloud/managed-postgres/clickhouse-integration
sidebar_label: 'ClickHouse 통합'
title: 'ClickHouse 통합'
description: '내장 CDC 기능을 사용하여 Postgres 데이터를 ClickHouse로 복제합니다'
keywords: ['postgres', 'clickhouse integration', 'cdc', '복제', 'ClickPipes', '데이터 동기화']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import chIntegrationIntro from '@site/static/images/managed-postgres/clickhouse-integration-intro.png';
import replicationServiceStep from '@site/static/images/managed-postgres/replication-service-step.png';
import selectTablesStep from '@site/static/images/managed-postgres/select-tables-step.png';
import integrationRunning from '@site/static/images/managed-postgres/integration-running.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="clickhouse-integration" />

모든 Managed Postgres 인스턴스에는 ClickHouse 서비스로의 CDC 기능이 기본 제공됩니다. 이를 통해 Postgres 인스턴스의 일부 또는 전체 데이터를 ClickHouse로 이동하고, Postgres의 데이터 변경 사항이 ClickHouse에 지속적이고 거의 실시간으로 반영되도록 할 수 있습니다. 이는 내부적으로 [ClickPipes](/integrations/clickpipes)에 의해 동작합니다.

이 기능을 사용하려면 Postgres 인스턴스 사이드바에서 **ClickHouse Integration**을 클릭합니다.

<Image img={chIntegrationIntro} alt="사이드바에 있는 통합 옵션이 표시된 ClickHouse 통합 랜딩 페이지" size="md" border />

:::note
계속 진행하기 전에 Postgres 서비스가 ClickPipes 서비스에서 접근 가능한지 확인하십시오. 기본적으로는 이렇게 설정되어 있지만, IP 접근을 제한해 둔 경우 **ClickHouse service**가 위치한 리전에 따라 [이](/integrations/clickpipes#list-of-static-ips) 목록에 있는 일부 소스 IP에 대해 접근을 허용해야 할 수 있습니다.
:::

**Replicate data in ClickHouse**를 클릭하여 ClickPipe 설정을 시작합니다.

<VerticalStepper type="numbered" headerLevel="h2">
  ## 복제 서비스 구성 \{#configure-replication-service\}

  복제 설정을 입력합니다:

  * **Integration name**: 이 ClickPipe의 이름
  * **ClickHouse service**: 기존 ClickHouse Cloud 서비스를 선택하거나 새로 생성
  * **Postgres database**: 복제할 소스 데이터베이스
  * **Replication method**: 다음 중 하나를 선택:
    * **Initial load + CDC**: 기존 데이터를 가져오고 이후 변경 사항으로 테이블을 계속 최신 상태로 유지합니다(권장).
    * **Initial load only**: 기존 데이터의 일회성 스냅샷만 수행하며 이후 업데이트는 없습니다.
    * **CDC only**: 초기 스냅샷을 건너뛰고 이후의 새로운 변경 사항만 캡처합니다.

  <Image img={replicationServiceStep} alt="통합 이름, 대상 서비스 및 복제 방법 옵션을 보여주는 복제 서비스 구성 화면" size="md" border />

  계속하려면 **Next**를 클릭합니다.

  ## 복제할 테이블 선택 \{#select-tables\}

  대상 데이터베이스를 선택하고 복제할 테이블을 선택합니다:

  * **Destination database**: 기존 ClickHouse 데이터베이스를 선택하거나 새로 생성
  * **Prefix default destination table names with schema name**: 이름 충돌을 피하기 위해 Postgres 스키마를 접두사로 추가
  * **Preserve NULL values from source**: 기본값으로 변환하지 않고 NULL 값을 유지
  * **Remove deleted rows during merges**: [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 테이블의 경우, 백그라운드 머지 중에 삭제된 행을 물리적으로 제거

  스키마를 펼친 뒤 복제할 개별 테이블을 선택합니다. 대상 테이블 이름과 컬럼 설정을 사용자 정의할 수도 있습니다.

  <Image img={selectTablesStep} alt="데이터베이스 선택, 복제 옵션 및 스키마별로 그룹화된 테이블 선택기가 표시된 테이블 선택 단계" size="md" border />

  **Replicate data to ClickHouse**를 클릭하여 복제를 시작합니다.

  ## ClickPipe 모니터링 \{#monitor-clickpipe\}

  ClickPipe가 시작되면 동일한 메뉴에 목록 형태로 표시됩니다. 모든 데이터의 초기 스냅샷은 테이블 크기에 따라 시간이 걸릴 수 있습니다.

  <Image img={integrationRunning} alt="대상 서비스와 상태가 표시된 실행 중인 ClickPipe가 있는 ClickHouse 통합 목록" size="md" border />

  세부 상태를 확인하고, 진행 상황을 모니터링하며, 오류를 확인하고, ClickPipe를 관리하려면 통합 이름을 클릭하십시오. ClickPipe가 가질 수 있는 다양한 상태를 이해하려면 [Lifecycle of a Postgres ClickPipe](/integrations/clickpipes/postgres/lifecycle)를 참조하십시오.
</VerticalStepper>
