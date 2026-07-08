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
import edit_filters from '@site/static/images/clickstack/dashboards/edit-filters.png';
import add_filter from '@site/static/images/clickstack/dashboards/add-filter.png';
import saved_filters from '@site/static/images/clickstack/dashboards/saved-filters.png';
import filtered_dashboard from '@site/static/images/clickstack/dashboards/filtered-dashboard.png';
import filter_dropdown from '@site/static/images/clickstack/dashboards/filter-dropdown.png';
import save_filter_values from '@site/static/images/clickstack/dashboards/save-filter-values.png';
import drilldown from '@site/static/images/clickstack/dashboards/drilldown.png';
import heatmap_tile_editor from '@site/static/images/clickstack/dashboards/heatmap-tile-editor.png';
import heatmap_tile_rendered from '@site/static/images/clickstack/dashboards/heatmap-tile-rendered.png';
import heatmap_tile_drilldown from '@site/static/images/clickstack/dashboards/heatmap-tile-drilldown.png';
import Tagging from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_clickstack_tagging.mdx';

ClickStack는 이벤트 시각화를 지원하며, ClickStack UI(HyperDX)에 차트 작성 기능이 기본 제공됩니다. 이러한 차트는 대시보드에 추가하여 다른 사용자와 공유할 수 있습니다.

시각화는 트레이스, 메트릭, 로그 또는 사용자 정의 와이드 이벤트 스키마를 기반으로 생성할 수 있습니다.

## 시각화 생성하기 \{#creating-visualizations\}

HyperDX의 **Chart Explorer** 인터페이스를 사용하면 메트릭, 트레이스, 로그를 시간 흐름에 따라 시각화하여 데이터 분석을 위한 빠른 시각화를 쉽게 만들 수 있습니다. 이 인터페이스는 대시보드를 만들 때에도 재사용됩니다. 다음 섹션에서는 Chart Explorer를 사용해 시각화를 만드는 과정을 단계별로 설명합니다.

각 시각화는 **데이터 소스**를 선택하는 것에서 시작하여, 그 다음 **메트릭**을 선택하고, 선택적으로 **필터 표현식**과 **GROUP BY** 필드를 설정합니다. 개념적으로 HyperDX의 시각화는 내부적으로 SQL `GROUP BY` 쿼리에 매핑됩니다. 선택한 차원 전반에 걸쳐 집계할 메트릭을 정의합니다.

:::tip AI 기반 차트 생성
ClickStack은 [text-to-chart](/use-cases/observability/clickstack/text-to-chart) 기능을 사용해 자연어 프롬프트로 차트를 생성하는 것도 지원합니다. 보고 싶은 내용을 설명하면 ClickStack이 시각화를 자동으로 생성합니다.
:::

예를 들어, 서비스 이름별로 그룹화된 에러 개수(`count()`)를 차트로 표시할 수 있습니다.

아래 예제에서는 [&quot;Remote Demo Dataset&quot;](/use-cases/observability/clickstack/getting-started/remote-demo-data) 가이드에서 설명하는 [sql.clickhouse.com](https://sql.clickhouse.com)의 원격 데이터셋을 사용합니다. **[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)에 접속하여 이 예제를 재현할 수도 있습니다.**

<VerticalStepper headerLevel="h3">
  ### Chart Explorer로 이동

  왼쪽 메뉴에서 `Chart Explorer`를 선택합니다.

  <Image img={visualization_1} alt="Chart Explorer" size="lg" />

  ### 시각화 생성

  아래 예제에서는 서비스 이름별로 시간에 따른 평균 요청 지연 시간을 차트로 표시합니다. 이를 위해 메트릭, 컬럼(SQL 표현식일 수도 있음), 집계 필드를 지정해야 합니다.

  상단 메뉴에서 `Line/Bar` 시각화 유형을 선택한 다음, `Traces`(또는 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)을 사용하는 경우 `Demo Traces`) 데이터셋을 선택합니다. 다음 값을 입력합니다:

  * Metric: `Average`
  * Column: `Duration/1000`
  * Where: `<empty>`
  * Group By: `ServiceName`
  * Alias: `Average Time`

  <Image img={visualization_2} alt="단순 시각화" size="lg" />

  SQL `WHERE` 절 또는 Lucene 문법을 사용해 이벤트를 필터링할 수 있으며, 이벤트를 시각화할 시간 범위를 설정할 수 있습니다. 여러 시리즈도 지원됩니다.

  예를 들어, 필터 `ServiceName:"frontend"`를 추가하여 서비스 `frontend`로 필터링합니다. `Add Series`를 클릭하여 `Count`라는 별칭을 가진 시간에 따른 이벤트 개수 시리즈를 두 번째 시리즈로 추가합니다.

  <Image img={visualization_3} alt="단순 시각화 2" size="lg" />

  :::note
  시각화는 메트릭, 트레이스, 로그 등 어떤 데이터 소스에서든 생성할 수 있습니다. ClickStack은 이 모든 데이터를 와이드 이벤트(wide event)로 취급합니다. **숫자형 컬럼**은 시간에 따른 차트로 표시할 수 있으며, **문자열**, **날짜**, **숫자형** 컬럼은 그룹화에 사용할 수 있습니다.

  이 통합된 방식 덕분에 일관되고 유연한 모델을 활용하여 다양한 텔레메트리 유형 전반에 걸친 대시보드를 구축할 수 있습니다.
  :::
</VerticalStepper>

## 대시보드 생성

대시보드는 관련 시각화를 그룹화하여 메트릭을 비교하고 패턴을 나란히 탐색하면서 시스템의 잠재적인 근본 원인을 식별할 수 있는 수단을 제공합니다. 이러한 대시보드는 애드혹(ad-hoc) 조사를 위해 사용하거나, 지속적인 모니터링을 위해 저장해 둘 수 있습니다.

전역 필터는 대시보드 수준에서 적용할 수 있으며, 해당 대시보드 내 모든 시각화에 자동으로 전파됩니다. 이를 통해 차트 전반에서 일관된 드릴다운이 가능해지고, 서비스 및 텔레메트리 타입 간 이벤트 상관관계 분석이 단순해집니다.

아래에서는 로그와 트레이스 데이터 소스를 사용해 두 개의 시각화가 포함된 대시보드를 생성합니다. 이 단계는 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)에서 그대로 따라 하거나, 가이드 [&quot;Remote Demo Dataset&quot;](/use-cases/observability/clickstack/getting-started/remote-demo-data)에 설명된 대로 [sql.clickhouse.com](https://sql.clickhouse.com)에 호스팅된 데이터셋에 로컬에서 연결해 재현할 수 있습니다.

<VerticalStepper headerLevel="h3">
  ### 대시보드로 이동

  왼쪽 메뉴에서 `Dashboards`를 선택합니다. 그런 다음 `New Dashboard`를 클릭해 임시 또는 저장된 대시보드를 생성합니다.

  <Image img={dashboard_1} alt="대시보드 생성" size="lg" />

  ### 시각화 생성 – 서비스별 평균 요청 시간

  시각화 생성 패널을 열기 위해 `Add New Tile`을 선택합니다.

  상단 메뉴에서 `Line/Bar` 시각화 유형을 선택한 뒤, `Traces` (또는 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)을 사용하는 경우 `Demo Traces`) 데이터셋을 선택합니다. 이후 아래 값을 설정해 서비스 이름별 평균 요청 지속 시간을 시간 경과에 따라 표시하는 차트를 생성합니다:

  * Chart Name: `Average duration by service`
  * Metric: `Average`
  * Column: `Duration/1000`
  * Where: `<empty>`
  * Group By: `ServiceName`
  * Alias: `Average Time`

  `Save`를 클릭하기 전에 **실행** 버튼을 클릭합니다.

  <Image img={dashboard_2} alt="대시보드 시각화 생성" size="lg" />

  시각화의 크기를 조정하여 대시보드의 전체 너비를 차지하도록 합니다.

  <Image img={dashboard_3} alt="시각화가 포함된 대시보드" size="lg" />

  ### 시각화 생성 – 서비스별 시간 경과에 따른 이벤트

  시각화 생성 패널을 열기 위해 `Add New Tile`을 선택합니다.

  상단 메뉴에서 `Line/Bar` 시각화 유형을 선택한 뒤, `Logs` (또는 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)을 사용하는 경우 `Demo Logs`) 데이터셋을 선택합니다. 이후 아래 값을 설정해 서비스 이름별 시간 경과에 따른 이벤트 개수를 표시하는 차트를 생성합니다:

  * Chart Name: `Event count by service`
  * Metric: `Count of Events`
  * Where: `<empty>`
  * Group By: `ServiceName`
  * Alias: `Count of events`

  `Save`를 클릭하기 전에 **실행** 버튼을 클릭합니다.

  <Image img={dashboard_4} alt="대시보드 시각화 2" size="lg" />

  시각화의 크기를 조정하여 대시보드의 전체 너비를 차지하도록 합니다.

  <Image img={dashboard_5} alt="시각화가 포함된 대시보드 2" size="lg" />

  ### 스팬 지속 시간에 대한 히트맵 타일 추가

  히트맵 타일은 각 (시간, 값) 버킷에 해당하는 이벤트 수를 색상 격자로 표시합니다. 평균값이나 단일 백분위수만이 아닌, 시간 경과에 따른 분포의 **형태**를 파악하고자 할 때 히트맵을 사용하십시오. 지연 시간 히트맵은 이중 모드(bimodal) 지속 시간 패턴, 느린 꼬리(slow-tail) 클러스터, 또는 Line 차트에서는 평균화되어 사라질 수 있는 갑작스러운 분산을 드러냅니다.

  히트맵 타일을 추가하려면:

  1. `Add New Tile`을 선택합니다.
  2. 상단 메뉴에서 `Heatmap` 시각화 유형을 선택합니다. 데이터 소스 드롭다운에는 [소스 유형이 `Traces`인](/use-cases/observability/clickstack/config#traces) 소스만 표시됩니다. 히트맵에는 트레이스 소스에만 있는 스팬 지속 시간 컬럼이 필요하므로, 로그, 메트릭, 세션 소스는 제외됩니다.
  3. 트레이스 소스 중 아무 것이나 이름으로 선택합니다. 이름 자체는 임의이며, 중요한 것은 유형뿐입니다.

  소스를 선택하면 히트맵이 자동으로 채워집니다:

  * **값**: 소스의 `Duration Expression`을 현재 표시 단위에 맞게 조정한 값입니다(예를 들어 각 이벤트의 스팬 지속 시간을 나노초에서 밀리초로 변환하려면 `(Duration)/1e6`를 사용합니다)
  * **개수**: `count()`

  4. 차트 이름을 설정하고, 관찰하려는 성능의 특정 서비스 또는 작업 집합으로 히트맵 범위를 좁히려면 `Where`를 사용합니다.
  5. 관심 있는 기간에 맞게 시간 범위를 조정합니다. 범위를 넓히면 짧은 시간 창에서는 가려지는 분포 변화와 이봉형 지연 시간 패턴을 확인할 수 있습니다.

  아래 예시는 24시간 범위에서 단일 서비스를 보여주며, 스팬 지속 시간의 빠른 경로와 느린 경로가 두 개의 수평 띠로 명확하게 구분되어 있습니다.

  히트맵을 추가로 사용자 정의하려면 **Display Settings**를 클릭하여 **Scale**(Log 또는 Linear), **Value**, **Count** 표현식에 대한 드로어를 엽니다. 전체 옵션 목록은 Event Deltas 페이지의 [히트맵 사용자 정의](/use-cases/observability/clickstack/event_deltas#customize)에 설명되어 있습니다. 동일한 드로어가 재사용됩니다.

  `Run`을 클릭하여 차트를 미리 보고 `Save`를 클릭합니다.

  <Image img={heatmap_tile_editor} alt="스팬 지속 시간 기본값이 미리 채워져 있고, `ServiceName` `payment` 필터와 `Display Settings` 버튼이 있는 히트맵 타일 편집기" size="lg" />

  저장된 타일은 대시보드에 히트맵(heatmap)으로 렌더링됩니다. 셀 위에 마우스를 올리면 버킷 범위와 이벤트 개수를 확인할 수 있습니다.

  <Image img={heatmap_tile_rendered} alt="24시간 동안 `payment` 서비스 스팬의 지속 시간 분포를 보여주는 히트맵 대시보드 타일" size="lg" />

  :::tip 히트맵당 두 개의 ClickHouse 쿼리
  히트맵은 두 개의 순차적인 쿼리로 실행됩니다. 값 범위를 확인하는 소규모 **bounds 쿼리**와, 버킷별 이벤트 수를 집계하는 **heatmap 쿼리**입니다. 두 쿼리 모두 편집기의 **Generated SQL** 항목에서 확인하거나 복사할 수 있습니다.
  :::

  #### Event Deltas 드릴다운

  렌더링된 heatmap 타일의 임의 셀을 클릭하면 **View in Event Deltas** 작업이 열립니다.

  <Image img={heatmap_tile_drilldown} alt="「View in Event Deltas」 작업을 표시하는 히트맵 셀 클릭" size="lg" />

  이를 선택하면 타일의 데이터 소스, `Where` 절, 시간 범위가 그대로 유지된 상태로 [Event Deltas](/use-cases/observability/clickstack/event_deltas) 뷰가 열립니다. 이 뷰에서는 동일한 분포를 대화형으로 검토하고, 속성별로 슬라이스하여 느린 스팬과 빠른 스팬의 차이를 파악하며, 쿼리를 직접 재구성하지 않고도 각 셀에 해당하는 개별 스팬을 검사할 수 있습니다.

  ### 대시보드 필터링

  Lucene 또는 SQL 필터와 시간 범위는 대시보드 수준에서 적용할 수 있으며, 모든 시각화에 자동으로 전파됩니다.

  <Image img={dashboard_filter} alt="필터가 적용된 대시보드" size="lg" />

  예시로, 대시보드에 Lucene 필터 `ServiceName:"frontend"`를 적용하고 시간 범위를 최근 3시간(Last 3 hours)으로 변경합니다. 그러면 시각화에는 이제 `frontend` 서비스의 데이터만 표시됩니다.

  대시보드는 자동으로 저장됩니다. 대시보드 이름을 설정하려면 제목을 선택한 후 수정한 다음 `Save Name`을 클릭합니다.

  <Image img={dashboard_save} alt="대시보드 저장" size="lg" />
</VerticalStepper>

## 대시보드 - 시각화 편집

시각화를 삭제, 편집 또는 복제하려면 시각화 위에 커서를 올린 후 표시되는 작업 버튼을 사용하십시오.

<Image img={dashboard_edit} alt="Dashboard edit" size="lg" />

## 대시보드 - 목록 및 검색 \{#creating-dashboards\}

대시보드는 대시보드 페이지에서 열 수 있습니다. 태그별로 구성되어 있으며, 내장 검색 및 필터링 기능을 통해 특정 대시보드를 빠르게 찾을 수 있습니다.

대시보드는 사이드바와 목록 페이지 상단에서 쉽게 접근할 수 있도록 즐겨찾기에 추가할 수 있습니다. 즐겨찾기는 사용자별로 개별 적용됩니다.

<Image img={dashboard_search} alt="Dashboard search" size="lg" />

## 대시보드 - 태그 지정

<Tagging />

## 사용자 지정 필터

모든 대시보드에서 사용할 수 있는 [자유 텍스트 필터](#filter-dashboards) 외에도, 저장된 대시보드는 ClickHouse에서 쿼리한 데이터로 채워지는 사용자 지정 드롭다운 필터를 지원합니다. 이를 통해 재사용 가능한 클릭 기반 필터 컨트롤을 제공하므로, 대시보드 사용자는 표현식을 수동으로 작성하지 않고도 필터링할 수 있습니다.

<Image img={filter_dropdown} alt="사용 가능한 서비스 이름을 보여주는 서비스 드롭다운 필터" size="lg" />

다음 단계에서는 [&quot;대시보드 만들기&quot;](#creating-dashboards) 섹션에서 만든 대시보드에 사용자 지정 필터를 추가하는 방법을 설명합니다.

<VerticalStepper headerLevel="h3">
  ### Edit Filters 대화상자 열기

  저장된 대시보드를 열고 도구 모음에서 **Edit Filters**를 선택하십시오.

  <Image img={edit_filters} alt="대시보드 도구 모음의 Edit Filters 버튼" size="lg" />

  ### 새 필터 추가

  **Add new filter**를 클릭하십시오. **Name**을 입력하고, **Data source**를 선택하고, **Filter expression**을 입력하여 필터를 구성합니다. 여기에는 드롭다운을 채울 서로 다른 값을 반환하는 SQL 컬럼 또는 표현식을 지정합니다. **Save filter**를 클릭하십시오.

  예를 들어, 트레이스 데이터용 서비스 필터를 추가하려면 `Traces` 데이터 소스에서 `ServiceName`을 필터 표현식으로 사용하십시오. &quot;Dropdown values filter&quot;는 선택 사항이며, 드롭다운에 표시할 값을 제한할 때 사용합니다.

  <Image img={add_filter} alt="Name, Data source, Filter expression 필드가 있는 Add filter 대화상자" size="md" />

  Filters 모달에는 대시보드에 구성된 모든 필터가 표시됩니다. 여기에서 기존 필터를 편집하거나 삭제하거나, 추가 필터를 더할 수 있습니다.

  <Image img={saved_filters} alt="구성된 Services 필터를 보여주는 Filters 모달" size="md" />

  ### 필터 사용

  Filters 모달을 닫으십시오. 새 드롭다운 필터가 검색 창 아래에 표시됩니다. 이를 클릭하여 사용 가능한 값을 확인한 다음 하나를 선택하면 대시보드의 모든 시각화에 필터가 적용됩니다.

  <Image img={filtered_dashboard} alt="frontend 서비스로 필터링된 대시보드" size="lg" />

  ### (선택 사항) 필터 값을 기본값으로 저장

  필터 선택을 대시보드 기본값으로 유지하려면 대시보드 메뉴에서 **Save Query &amp; Filters as Default**를 선택하십시오. 그러면 대시보드는 선택한 필터가 적용된 상태로 항상 열립니다. 재설정하려면 같은 메뉴에서 **Remove Default Query &amp; Filters**를 선택하십시오.

  <Image img={save_filter_values} alt="Save Query and Filters as Default 옵션을 보여주는 대시보드 메뉴" size="lg" />
</VerticalStepper>

:::note
사용자 지정 드롭다운 필터는 저장된 대시보드에서 사용할 수 있습니다. 이 패턴이 실제로 적용된 예시는 [Kubernetes 대시보드](#kubernetes-dashboard)를 참조하십시오. 여기에는 파드, 배포, 노드 이름, 네임스페이스, 클러스터에 대한 기본 제공 드롭다운 필터가 포함되어 있습니다.
:::

## 검색으로 드릴다운 {#drilldown-to-search}

대시보드 타일은 검색 페이지로의 드릴다운을 지원합니다. 시각화에서 데이터 포인트를 클릭하면 다음 옵션이 포함된 컨텍스트 메뉴가 열립니다.

- **View All Events** — 선택한 시간 창의 모든 이벤트를 표시하는 검색 페이지로 이동합니다.
- **Filter by group** — 특정 시리즈로 필터링된 검색 페이지로 이동합니다.

<Image img={drilldown} alt="Drilldown context menu showing View All Events and Filter by group options" size="lg"/>

이 기능은 대시보드에서 발견된 특정 급증 현상이나 이상 징후를 조사할 때 유용합니다. 집계된 보기에서 기본이 되는 개별 이벤트로 빠르게 전환할 수 있습니다.

## 사전 설정 {#presets}

HyperDX는 기본 대시보드를 포함해 배포됩니다.

### ClickHouse 대시보드 {#clickhouse-dashboard}

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

### Services 대시보드 \{#filter-dashboards\}

Services 대시보드는 트레이스 데이터를 기반으로 현재 활성화된 서비스를 표시합니다. 이를 위해서는 트레이스를 수집하고 유효한 Traces 데이터 소스를 구성해야 합니다.

서비스 이름은 트레이스 데이터에서 자동으로 감지되며, HTTP Services, Database, Errors 세 가지 탭에 걸쳐 사전 정의된 여러 시각화를 제공합니다.

시각화는 Lucene 또는 SQL 문법을 사용해 필터링할 수 있으며, 집중 분석을 위해 시간 범위를 조정할 수 있습니다.

<Image img={dashboard_services} alt="ClickHouse services" size="lg" />

### Kubernetes 대시보드 {#kubernetes-dashboard}

이 대시보드는 OpenTelemetry를 통해 수집된 Kubernetes 이벤트를 탐색할 수 있습니다. Kubernetes 파드, 배포, 노드 이름, 네임스페이스, 클러스터별로 필터링할 수 있는 고급 필터 옵션과 자유 형식 텍스트 검색 기능을 제공합니다.

Kubernetes 데이터는 쉽게 탐색할 수 있도록 파드, 노드, 네임스페이스 세 개의 탭으로 구성됩니다.

<Image img={dashboard_kubernetes} alt="ClickHouse Kubernetes" size="lg"/>