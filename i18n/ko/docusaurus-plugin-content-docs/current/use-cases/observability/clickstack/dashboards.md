---
'slug': '/use-cases/observability/clickstack/dashboards'
'title': 'ClickStack과 함께하는 시각화 및 대시보드'
'sidebar_label': '대시보드'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack과 함께하는 시각화 및 대시보드'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'dashboards'
- 'visualization'
- 'monitoring'
- 'observability'
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

ClickStack은 HyperDX에서 차트 작성에 대한 기본 지원을 통해 이벤트 시각화를 지원합니다. 이러한 차트는 다른 사용자와 공유할 수 있는 대시보드에 추가할 수 있습니다.

시각화는 추적, 메트릭, 로그 또는 사용자가 정의한 와이드 이벤트 스키마에서 생성할 수 있습니다.

## 시각화 생성하기 {#creating-visualizations}

HyperDX의 **차트 탐색기** 인터페이스는 사용자가 시간에 따른 메트릭, 추적 및 로그를 시각화할 수 있게 하여 데이터 분석을 위한 빠른 시각화를 쉽게 만들 수 있도록 합니다. 이 인터페이스는 대시보드를 생성할 때도 재사용됩니다. 다음 섹션에서는 차트 탐색기를 사용하여 시각화를 생성하는 과정을 안내합니다.

각 시각화는 **데이터 소스**를 선택하는 것부터 시작하며, 그 다음에 **메트릭**을 선택하고 선택적으로 **필터 표현식**과 **그룹화** 필드를 추가합니다. 개념적으로 HyperDX의 시각화는 내부적으로 SQL `GROUP BY` 쿼리에 매핑됩니다 — 사용자는 선택한 차원에 따라 집계할 메트릭을 정의합니다.

예를 들어, 서비스 이름별로 오류 수(`count()`)를 차트로 나타낼 수 있습니다.

아래 예에서는 [sql.clickhouse.com](https://sql.clickhouse.com)에서 사용할 수 있는 원격 데이터 세트를 사용하며, 가이드 ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data)에서 설명됩니다. **사용자는 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 방문을 통해 이러한 예제를 재현할 수 있습니다.**

<VerticalStepper headerLevel="h3">

### 차트 탐색기로 이동하기 {#navigate-chart-explorer}

왼쪽 메뉴에서 `차트 탐색기`를 선택합니다.

<Image img={visualization_1} alt="Chart Explorer" size="lg"/>

### 시각화 만들기 {#create-visualization}

아래 예에서는 서비스 이름별로 평균 요청 지속 시간을 시간에 따라 차트로 나타냅니다. 이를 위해 사용자는 메트릭, 컬럼(이는 SQL 표현일 수 있음), 그리고 집계 필드를 지정해야 합니다.

상단 메뉴에서 `라인/바` 시각화 유형을 선택하고, 그 다음에 `추적`(또는 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)을 사용하는 경우 `데모 추적`) 데이터 세트를 선택합니다. 다음 값을 완료합니다:

- 메트릭: `평균`  
- 컬럼: `Duration/1000`  
- 조건: `<empty>`  
- 그룹화 기준: `ServiceName`  
- 별칭: `평균 시간`

<Image img={visualization_2} alt="Simple visualization" size="lg"/>

사용자는 SQL `WHERE` 절 또는 Lucene 구문을 사용하여 이벤트를 필터링하고, 시각화할 이벤트의 시간 범위를 설정할 수 있습니다. 여러 시리즈도 지원됩니다.

예를 들어, 필터 `ServiceName:"frontend"`를 추가하여 서비스 `frontend`로 필터링할 수 있습니다. '시리즈 추가'를 클릭하여 시간에 따른 이벤트 수를 표시하는 두 번째 시리즈를 추가하고 별칭을 `Count`로 설정합니다.

<Image img={visualization_3} alt="Simple visualization 2" size="lg"/>

:::note
시각화는 모든 데이터 소스 — 메트릭, 추적 또는 로그 — 에서 생성할 수 있습니다. ClickStack은 모든 것을 와이드 이벤트로 처리합니다. **숫자 컬럼**은 시간에 따라 차트화할 수 있으며, **문자열**, **날짜** 또는 **숫자** 컬럼은 그룹화에 사용할 수 있습니다.

이 통합 접근 방식은 사용자가 일관되고 유연한 모델을 사용하여 텔레메트리 유형에 걸쳐 대시보드를 구축할 수 있게 합니다.
:::

</VerticalStepper>

## 대시보드 생성하기 {#creating-dashboards}

대시보드는 관련 시각화를 그룹화하여 사용자가 메트릭을 비교하고 패턴을 나란히 탐색할 수 있게 함으로써 시스템 내에서 잠재적 근본 원인을 식별할 수 있는 방법을 제공합니다. 이러한 대시보드는 애드혹 조사에 사용하거나 지속적인 모니터링을 위해 저장할 수 있습니다.

전역 필터는 대시보드 수준에서 적용될 수 있으며, 이 필터는 해당 대시보드 내의 모든 시각화에 자동으로 전파됩니다. 이를 통해 차트 간의 일관된 드릴다운이 가능하며 서비스 및 텔레메트리 유형 간 이벤트 상관관계가 간소화됩니다.

아래에서는 로그 및 추적 데이터 소스를 사용하여 두 개의 시각화를 가진 대시보드를 생성합니다. 이 단계는 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)에서 재현하거나 [sql.clickhouse.com](https://sql.clickhouse.com)에서 호스팅되는 데이터 세트에 연결하여 로컬에서 재현할 수 있습니다, 가이드 ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data)에서 설명된 대로.

<VerticalStepper headerLevel="h3">

### 대시보드로 이동하기 {#navigate-dashboards}

왼쪽 메뉴에서 `대시보드`를 선택합니다.

<Image img={dashboard_1} alt="Create Dashboard" size="lg"/>

기본적으로 대시보드는 애드혹 조사를 지원하기 위해 임시로 생성됩니다.

자신의 HyperDX 인스턴스를 사용하는 경우, `새로운 저장 대시보드 생성`을 클릭하여 이 대시보드를 나중에 저장할 수 있도록 할 수 있습니다. 읽기 전용 환경인 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)에서는 이 옵션을 사용할 수 없습니다.

### 시각화 생성하기 – 서비스별 평균 요청 시간 {#create-a-tile}

`새 타일 추가`를 선택하여 시각화 생성 패널을 엽니다.

상단 메뉴에서 `라인/바` 시각화 유형을 선택하고, 그 다음에 `추적`(또는 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)을 사용하는 경우 `데모 추적`) 데이터 세트를 선택합니다. 평균 요청 지속 시간을 서비스 이름별로 시간에 따라 차트로 표시하기 위해 다음 값을 입력합니다:

- 차트 이름: `서비스별 평균 지속 시간`  
- 메트릭: `평균`  
- 컬럼: `Duration/1000`  
- 조건: `<empty>`  
- 그룹화 기준: `ServiceName`  
- 별칭: `평균 시간`

적용하기 전에 **재생** 버튼을 클릭한 다음 `저장`을 클릭합니다.

<Image img={dashboard_2} alt="Create Dashboard Visualization" size="lg"/>

시각화 크기를 조정하여 대시보드의 전체 너비를 차지하도록 합니다.

<Image img={dashboard_3} alt="Dashboard with visuals" size="lg"/>

### 시각화 생성하기 – 서비스별 시간에 따른 이벤트 수 {#create-a-tile-2}

`새 타일 추가`를 선택하여 시각화 생성 패널을 엽니다.

상단 메뉴에서 `라인/바` 시각화 유형을 선택하고, 그 다음에 `로그`(또는 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)을 사용하는 경우 `데모 로그`) 데이터 세트를 선택합니다. 서비스 이름별로 시간에 따른 이벤트 수를 보여주는 차트를 만들기 위해 다음값을 작성합니다:

- 차트 이름: `서비스별 이벤트 수`  
- 메트릭: `이벤트 수`  
- 조건: `<empty>`  
- 그룹화 기준: `ServiceName`  
- 별칭: `이벤트 수`

적용하기 전에 **재생** 버튼을 클릭한 다음 `저장`을 클릭합니다.

<Image img={dashboard_4} alt="Dashboard Visualization 2" size="lg"/>

시각화 크기를 조정하여 대시보드의 전체 너비를 차지하도록 합니다.

<Image img={dashboard_5} alt="Dashboard with visuals 2" size="lg"/>

### 대시보드 필터링 {#filter-dashboards}

Lucene 또는 SQL 필터와 함께 시간 범위는 대시보드 수준에서 적용될 수 있으며, 모든 시각화에 자동으로 전파됩니다.

<Image img={dashboard_filter} alt="Dashboard with filtering" size="lg"/>

예를 들어, Lucene 필터 `ServiceName:"frontend"`를 대시보드에 적용하고 시간 범위를 지난 3시간으로 수정합니다. 이제 시각화가 `frontend` 서비스의 데이터만 반영하는 모습을 주목하세요.

대시보드는 자동으로 저장됩니다. 대시보드 이름을 설정하려면 제목을 선택하고 수정한 후 `이름 저장`을 클릭합니다.

<Image img={dashboard_save} alt="Dashboard save" size="lg"/>

</VerticalStepper>

## 대시보드 - 시각화 편집하기 {#dashboards-editing-visualizations}

시각화를 제거, 편집 또는 복제하려면 해당 시각화 위로 마우스를 가져가고 해당 작업 버튼을 사용합니다.

<Image img={dashboard_edit} alt="Dashboard edit" size="lg"/>

## 대시보드 - 목록 및 검색 {#dashboard-listing-search}

대시보드는 왼쪽 메뉴에서 액세스할 수 있으며, 특정 대시보드를 신속하게 찾을 수 있도록 내장된 검색 기능이 있습니다.
<Image img={dashboard_search} alt="Dashboard search" size="sm"/>

## 대시보드 - 태깅 {#tagging}
<Tagging />

## 프리셋 {#presets}

HyperDX는 즉시 사용 가능한 대시보드를 가지고 배포됩니다.

### ClickHouse 대시보드 {#clickhouse-dashboard}

이 대시보드는 ClickHouse를 모니터링하기 위한 시각화를 제공합니다. 이 대시보드로 이동하려면 왼쪽 메뉴에서 선택합니다.

<Image img={dashboard_clickhouse} alt="ClickHouse dashboard" size="lg"/>

이 대시보드는 **Selects**, **Inserts**, 및 **ClickHouse Infrastructure**의 모니터링을 구분하기 위해 탭을 사용합니다.

:::note 필수 시스템 테이블 접근
이 대시보드는 ClickHouse [시스템 테이블](/operations/system-tables)을 쿼리하여 주요 메트릭을 노출합니다. 다음 권한이 필요합니다:

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### 서비스 대시보드 {#services-dashboard}

서비스 대시보드는 추적 데이터를 기반으로 현재 활성화된 서비스를 표시합니다. 이는 사용자가 추적을 수집하고 유효한 추적 데이터 소스를 구성해야 함을 의미합니다.

서비스 이름은 추적 데이터에서 자동으로 감지되며, HTTP 서비스, 데이터베이스, 오류의 세 개 탭에 정리된 일련의 미리 구축된 시각화를 포함합니다.

시각화는 Lucene 또는 SQL 구문으로 필터링할 수 있으며, 집중적인 분석을 위해 시간 창을 조정할 수 있습니다.

<Image img={dashboard_services} alt="ClickHouse services" size="lg"/>

### Kubernetes 대시보드 {#kubernetes-dashboard}

이 대시보드는 사용자가 OpenTelemetry를 통해 수집된 Kubernetes 이벤트를 탐색할 수 있게 합니다. 고급 필터링 옵션을 포함하여 사용자가 Kubernetes 포드, 배포, 노드 이름, 네임스페이스, 클러스터로 필터링하고 자유 텍스트 검색을 수행할 수 있습니다.

Kubernetes 데이터는 쉽게 탐색할 수 있도록 포드, 노드 및 네임스페이스의 세 개 탭으로 구성됩니다.

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>
