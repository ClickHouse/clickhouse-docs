---
slug: /use-cases/observability/clickstack/dashboards
title: 'ClickStack 기반 시각화 및 대시보드'
sidebar_label: '대시보드'
pagination_prev: null
pagination_next: null
description: 'ClickStack 기반 시각화 및 대시보드'
doc_type: 'guide'
keywords: ['clickstack', 'dashboards', 'visualization', 'monitoring', 'observability']
---

import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/use-cases/observability/hyperdx-visualization-1.png';
import visualization_2 from '@site/static/images/use-cases/observability/hyperdx-visualization-2.png';
import visualization_3 from '@site/static/images/use-cases/observability/hyperdx-visualization-3.png';
import dashboard_1 from '@site/static/images/use-cases/observability/hyperdx-dashboard-1.png';
import dashboard_2 from '@site/static/images/use-cases/observability/hyperdx-dashboard-2.png';
import dashboard_3 from '@site/static/images/use-cases/observability/hyperdx-dashboard-3.png';
import dashboard_4 from '@site/static/images/use-cases/observability/hyperdx-dashboard-4.png';
import dashboard_5 from '@site/static/images/use-cases/observability/hyperdx-dashboard-5.png';
import dashboard_filter from '@site/static/images/use-cases/observability/hyperdx-dashboard-filter.png';
import dashboard_save from '@site/static/images/use-cases/observability/hyperdx-dashboard-save.png';
import dashboard_search from '@site/static/images/use-cases/observability/hyperdx-dashboard-search.png';
import dashboard_edit from '@site/static/images/use-cases/observability/hyperdx-dashboard-edit.png';
import dashboard_clickhouse from '@site/static/images/use-cases/observability/hyperdx-dashboard-clickhouse.png';
import dashboard_services from '@site/static/images/use-cases/observability/hyperdx-dashboard-services.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';
import Tagging from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_clickstack_tagging.mdx';

ClickStack는 이벤트 시각화를 지원하며, ClickStack UI(HyperDX)에 차트 작성 기능이 기본 제공됩니다. 이러한 차트는 대시보드에 추가하여 다른 사용자와 공유할 수 있습니다.

시각화는 트레이스, 메트릭, 로그 또는 사용자 정의 와이드 이벤트 스키마를 기반으로 생성할 수 있습니다.


## 시각화 생성하기 \{#creating-visualizations\}

HyperDX의 **Chart Explorer** 인터페이스를 사용하면 메트릭, 트레이스, 로그를 시간 흐름에 따라 시각화하여 데이터 분석을 위한 빠른 시각화를 쉽게 만들 수 있습니다. 이 인터페이스는 대시보드를 만들 때에도 재사용됩니다. 다음 섹션에서는 Chart Explorer를 사용해 시각화를 만드는 과정을 단계별로 설명합니다.

각 시각화는 **데이터 소스**를 선택하는 것에서 시작하여, 그 다음 **메트릭**을 선택하고, 선택적으로 **필터 표현식**과 **GROUP BY** 필드를 설정합니다. 개념적으로 HyperDX의 시각화는 내부적으로 SQL `GROUP BY` 쿼리에 매핑됩니다. 사용자는 선택한 차원 전반에 걸쳐 집계할 메트릭을 정의합니다.

예를 들어, 서비스 이름별로 그룹화된 에러 개수(`count()`)를 차트로 표시할 수 있습니다.

아래 예제에서는 ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data) 가이드에서 설명하는 [sql.clickhouse.com](https://sql.clickhouse.com)의 원격 데이터셋을 사용합니다. **[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)에 접속하여 이 예제를 재현할 수도 있습니다.**

<VerticalStepper headerLevel="h3">

### Chart Explorer로 이동 \{#navigate-chart-explorer\}

왼쪽 메뉴에서 `Chart Explorer`를 선택합니다.

<Image img={visualization_1} alt="Chart Explorer" size="lg"/>

### 시각화 생성 \{#create-visualization\}

아래 예제에서는 서비스 이름별로 시간에 따른 평균 요청 지연 시간을 차트로 표시합니다. 이를 위해 메트릭, 컬럼(SQL 표현식일 수도 있음), 집계 필드를 지정해야 합니다.

상단 메뉴에서 `Line/Bar` 시각화 유형을 선택한 다음, `Traces`(또는 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)을 사용하는 경우 `Demo Traces`) 데이터셋을 선택합니다. 다음 값을 입력합니다:

- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

<Image img={visualization_2} alt="단순 시각화" size="lg"/>

SQL `WHERE` 절 또는 Lucene 문법을 사용해 이벤트를 필터링할 수 있으며, 이벤트를 시각화할 시간 범위를 설정할 수 있습니다. 여러 시리즈도 지원됩니다.

예를 들어, 필터 `ServiceName:"frontend"`를 추가하여 서비스 `frontend`로 필터링합니다. `Add Series`를 클릭하여 `Count`라는 별칭을 가진, 시간에 따른 이벤트 개수 시리즈를 두 번째 시리즈로 추가합니다.

<Image img={visualization_3} alt="단순 시각화 2" size="lg"/>

:::note
시각화는 메트릭, 트레이스, 로그 등 어떤 데이터 소스에서든 생성할 수 있습니다. ClickStack은 이 모든 데이터를 와이드 이벤트(wide event)로 취급합니다. **숫자형 컬럼**은 시간에 따른 차트로 표시할 수 있으며, **문자열**, **날짜**, **숫자형** 컬럼은 그룹화에 사용할 수 있습니다.

이 통합된 방식 덕분에 일관되고 유연한 모델을 활용하여 다양한 텔레메트리 유형 전반에 걸친 대시보드를 구축할 수 있습니다.
:::

</VerticalStepper>

## 대시보드 생성 \{#creating-dashboards\}

대시보드는 관련 시각화를 그룹화하여 메트릭을 비교하고 패턴을 나란히 탐색하면서 시스템의 잠재적인 근본 원인을 식별할 수 있는 수단을 제공합니다. 이러한 대시보드는 애드혹(ad-hoc) 조사를 위해 사용하거나, 지속적인 모니터링을 위해 저장해 둘 수 있습니다.

전역 필터는 대시보드 수준에서 적용할 수 있으며, 해당 대시보드 내 모든 시각화에 자동으로 전파됩니다. 이를 통해 차트 전반에서 일관된 드릴다운이 가능해지고, 서비스 및 텔레메트리 타입 간 이벤트 상관관계 분석이 단순해집니다.

아래에서는 로그와 트레이스 데이터 소스를 사용해 두 개의 시각화가 포함된 대시보드를 생성합니다. 이 단계는 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)에서 그대로 따라 하거나, 가이드 ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data)에 설명된 대로 [sql.clickhouse.com](https://sql.clickhouse.com)에 호스팅된 데이터셋에 로컬에서 연결해 재현할 수 있습니다.

<VerticalStepper headerLevel="h3">

### Dashboards로 이동 \{#navigate-dashboards\}

왼쪽 메뉴에서 `Dashboards`를 선택합니다.

<Image img={dashboard_1} alt="대시보드 생성" size="lg"/>

기본적으로 대시보드는 애드혹(ad-hoc) 조사를 지원하기 위해 임시로 생성됩니다. 

자체 HyperDX 인스턴스를 사용하는 경우 `Create New Saved Dashboard`를 클릭해 이 대시보드를 나중에 저장할 수 있도록 설정할 수 있습니다. 읽기 전용 환경인 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)을 사용하는 경우에는 이 옵션을 사용할 수 없습니다.

### 시각화 생성 – 서비스별 평균 요청 시간 \{#create-a-tile\}

시각화 생성 패널을 열기 위해 `Add New Tile`을 선택합니다.

상단 메뉴에서 `Line/Bar` 시각화 타입을 선택한 뒤, `Traces` (또는 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)을 사용하는 경우 `Demo Traces`) 데이터셋을 선택합니다. 이후 아래 값을 설정해 서비스 이름별 평균 요청 지속 시간을 시간 경과에 따라 표시하는 차트를 생성합니다:

- Chart Name: `Average duration by service`  
- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

`Save`를 클릭하기 전에 **재생(play)** 버튼을 클릭합니다.

<Image img={dashboard_2} alt="대시보드 시각화 생성" size="lg"/>

시각화의 크기를 조정하여 대시보드의 전체 너비를 차지하도록 합니다.

<Image img={dashboard_3} alt="시각화가 포함된 대시보드" size="lg"/>

### 시각화 생성 – 서비스별 시간 경과에 따른 이벤트 \{#create-a-tile-2\}

시각화 생성 패널을 열기 위해 `Add New Tile`을 선택합니다.

상단 메뉴에서 `Line/Bar` 시각화 타입을 선택한 뒤, `Logs` (또는 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)을 사용하는 경우 `Demo Logs`) 데이터셋을 선택합니다. 이후 아래 값을 설정해 서비스 이름별 시간 경과에 따른 이벤트 개수를 표시하는 차트를 생성합니다:

- Chart Name: `Event count by service`  
- Metric: `Count of Events`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Count of events`

`Save`를 클릭하기 전에 **재생(play)** 버튼을 클릭합니다.

<Image img={dashboard_4} alt="대시보드 시각화 2" size="lg"/>

시각화의 크기를 조정하여 대시보드의 전체 너비를 차지하도록 합니다.

<Image img={dashboard_5} alt="시각화가 포함된 대시보드 2" size="lg"/>

### 대시보드 필터링 \{#filter-dashboards\}

Lucene 또는 SQL 필터와 시간 범위는 대시보드 수준에서 적용할 수 있으며, 모든 시각화에 자동으로 전파됩니다.

<Image img={dashboard_filter} alt="필터가 적용된 대시보드" size="lg"/>

예시로, 대시보드에 Lucene 필터 `ServiceName:"frontend"`를 적용하고 시간 범위를 최근 3시간(Last 3 hours)으로 변경합니다. 그러면 시각화에는 이제 `frontend` 서비스의 데이터만 표시됩니다.

대시보드는 자동으로 저장됩니다. 대시보드 이름을 설정하려면 제목을 선택한 후 수정한 다음 `Save Name`을 클릭합니다. 

<Image img={dashboard_save} alt="대시보드 저장" size="lg"/>

</VerticalStepper>

## 대시보드 - 시각화 편집 \{#dashboards-editing-visualizations\}

시각화를 삭제, 편집 또는 복제하려면 시각화 위에 커서를 올린 후 표시되는 작업 버튼을 사용하십시오.

<Image img={dashboard_edit} alt="Dashboard edit" size="lg"/>

## 대시보드 - 목록 및 검색 \{#dashboard-listing-search\}

대시보드는 왼쪽 메뉴에서 열 수 있고, 내장 검색 기능을 통해 특정 대시보드를 빠르게 찾을 수 있습니다.

<Image img={dashboard_search} alt="Dashboard search" size="sm"/>

## 대시보드 - 태그 지정 \{#tagging\}

<Tagging />

## 사전 설정 \{#presets\}

HyperDX는 기본 대시보드를 포함해 배포됩니다.

### ClickHouse 대시보드 \{#clickhouse-dashboard\}

이 대시보드는 ClickHouse 모니터링을 위한 시각화를 제공합니다. 이 대시보드로 이동하려면 왼쪽 메뉴에서 선택하면 됩니다.

<Image img={dashboard_clickhouse} alt="ClickHouse 대시보드" size="lg"/>

이 대시보드는 탭을 사용하여 **Selects**, **Inserts**, **ClickHouse Infrastructure**별 모니터링을 구분합니다.

:::note 필수 시스템 테이블 접근 권한
이 대시보드는 핵심 메트릭을 표시하기 위해 ClickHouse [시스템 테이블](/operations/system-tables)에 쿼리를 실행합니다. 다음 권한이 필요합니다:

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### Services 대시보드 \{#services-dashboard\}

Services 대시보드는 트레이스 데이터를 기반으로 현재 활성화된 서비스를 표시합니다. 이를 위해서는 트레이스를 수집하고 유효한 Traces 데이터 소스를 구성해야 합니다.

서비스 이름은 트레이스 데이터에서 자동으로 감지되며, HTTP Services, Database, Errors 세 가지 탭에 걸쳐 사전 정의된 여러 시각화를 제공합니다.

시각화는 Lucene 또는 SQL 문법을 사용해 필터링할 수 있으며, 집중 분석을 위해 시간 범위를 조정할 수 있습니다.

<Image img={dashboard_services} alt="ClickHouse services" size="lg"/>

### Kubernetes 대시보드 \{#kubernetes-dashboard\}

이 대시보드는 OpenTelemetry를 통해 수집된 Kubernetes 이벤트를 탐색할 수 있습니다. Kubernetes 파드, 배포, 노드 이름, 네임스페이스, 클러스터별로 필터링할 수 있는 고급 필터 옵션과 자유 형식 텍스트 검색 기능을 제공합니다.

Kubernetes 데이터는 쉽게 탐색할 수 있도록 파드, 노드, 네임스페이스 세 개의 탭으로 구성됩니다.

<Image img={dashboard_kubernetes} alt="ClickHouse Kubernetes" size="lg"/>