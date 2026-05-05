---
slug: /use-cases/observability/clickstack/event_deltas
title: 'ClickStack의 Event deltas'
sidebar_label: 'Event deltas'
pagination_prev: null
pagination_next: null
description: 'ClickStack의 Event deltas를 사용해 트레이스 속성 분포를 분석하고 이상치 스팬을 비교합니다'
doc_type: 'guide'
keywords: ['clickstack', 'event deltas', 'heatmap', 'attribute distribution', 'trace analysis', 'observability']
---

import Image from '@theme/IdealImage';
import event_deltas from '@site/static/images/use-cases/observability/hyperdx-demo/step_17.png';
import event_deltas_separation from '@site/static/images/use-cases/observability/event_deltas_separation.png';
import event_deltas_issue from '@site/static/images/use-cases/observability/event_deltas_issue.png';
import distribution_mode from '@site/static/images/clickstack/event-deltas/distribution-mode.png';
import settings_drawer from '@site/static/images/clickstack/event-deltas/settings-drawer.png';

Event deltas는 쿼리를 작성하지 않고도 지연 시간 히트맵과 자동 속성 분석을 결합해 트레이스 데이터의 양상을 파악하고, 느린 스팬을 다르게 만드는 요인을 찾을 수 있게 해줍니다. 사용하는 방법은 세 가지입니다:

* **분포 모드(항상 활성화)** — 히트맵에서 선택한 영역이 없으면 현재 스팬 집합에 대한 각 속성 값의 분포가 표시됩니다. 지배적인 값이나 비정상적으로 드문 값(카디널리티 이상치)을 찾는 데 유용합니다.
* **비교 모드** — 히트맵에서 사각형을 드래그해 내부의 스팬(Selection)과 외부의 모든 스팬(Background)을 비교합니다. 편차를 분리해 살펴보는 데 유용합니다.
* **반복 드릴다운** — 막대를 클릭해 해당 값으로 필터링하거나 제외합니다. 그러면 필터링된 집합을 기준으로 히트맵이 다시 렌더링되므로 원인이 분명해질 때까지 계속 범위를 좁혀갈 수 있습니다.

<Image img={event_deltas} alt="Event deltas 개요" size="lg" />

## 사전 요구 사항 \{#prerequisites\}

Event deltas를 사용하려면 duration 표현식이 있는 **Trace** 데이터 소스가 필요합니다. 스팬 데이터를 생성하는 OpenTelemetry로 계측된 서비스라면 모두 사용할 수 있습니다. 모든 ClickStack 배포 환경(Managed, Open Source, ClickHouse Cloud)에서 사용할 수 있습니다.

## 시작하기 \{#getting-started\}

1. **Data Source** 드롭다운에서 트레이스를 포함하는 소스를 선택합니다. 소스명은 임의로 지정할 수 있으며, 중요한 것은 해당 소스가 Trace 유형으로 구성되어 있다는 점입니다. **Event Deltas** 탭은 이런 소스에서만 활성화됩니다.
2. **Analysis Mode** 섹션에서 **Event Deltas** 탭을 클릭합니다.

Event deltas는 **Results Table** 및 **Event Patterns**와 나란히 제공되는 별도의 분석 모드입니다. 이 모드로 전환하면 보기가 히트맵과 속성 분석 그리드로 바뀌지만, 검색 필터와 시간 범위는 유지되며 언제든지 다시 돌아갈 수 있습니다.

## 히트맵 \{#the-heatmap\}

히트맵은 스팬을 두 개의 차원으로 표시합니다:

* **X축** — 시간
* **Y축** — 수치 값으로, 기본값은 스팬 지속 시간(밀리초, 로그 척도)입니다

색상 강도는 버킷당 이벤트 수를 나타냅니다 — 더 밝을수록 스팬 수가 많습니다.

히트맵에서 이봉형 지연 시간 분포, 특정 시점의 지연 시간 급증, 또는 지속적으로 느린 스팬이 형성하는 띠 같은 패턴을 한눈에 파악할 수 있습니다. 특정 영역을 조사하려면 해당 영역 위에서 사각형을 클릭한 채 드래그하십시오 — 그러면 해당 영역이 **Selection**으로 설정되고, 아래 분석이 비교 모드로 전환됩니다.

## 분포 모드: 카디널리티 이상치 \{#distribution-mode\}

히트맵에서 아무것도 선택하지 않으면 분석 패널에는 일치하는 모든 스팬을 기준으로 계산된 속성별 막대 차트가 하나씩 표시됩니다. 범례에는 **모든 스팬**이라고 표시됩니다.

<Image img={distribution_mode} alt="모든 스팬에서 속성별 값 분포를 보여주는 분포 모드" size="lg" />

속성은 값이 얼마나 집중되어 있는지에 따라 순위가 매겨집니다. 즉, 소수의 값이 대부분을 차지하는 속성이 먼저 표시되고, 균일하며 엔트로피가 높은 속성은 우선순위가 낮아집니다.

데이터의 **카디널리티 양상**을 파악하려면 분포 모드를 사용하십시오:

* **높은 쪽** — 어떤 서비스, 엔드포인트, 상태 코드 또는 호스트가 스팬 집합의 대부분을 차지합니까? 대개 특정 테넌트, 버전 또는 경로 하나가 트래픽의 대부분을 처리하고 있음을 드러냅니다.
* **낮은 쪽** — 존재하지만 드물게 나타나는 값입니다. 전체 스팬 중 `0.5%`에서만 나타나는 상태 코드나 거의 나타나지 않는 특정 호스트 하나가 가장 흥미로운 신호일 수 있습니다. 회귀와 비정상 행위는 이런 롱테일 구간에 숨어 있는 경우가 많습니다.

먼저 검색 표시줄과 함께 사용하여 대상을 좁히십시오(예: 오류 스팬만, 클라이언트 스팬만, 하나의 엔드포인트만). 그런 다음 해당 부분집합의 분포를 확인하십시오.

## 비교 모드: 정상 상태에서의 편차 \{#comparison-mode\}

히트맵에서 사각형 영역을 클릭한 채 드래그한 다음 **Filter by Selection**을 클릭하여 비교 모드로 전환하십시오. 선택한 스팬은 **Selection**(빨간 막대)이 되고, 선택 영역 밖의 모든 항목은 **Background**(초록 막대)가 됩니다. 그러면 각 속성 차트에 두 집단이 나란히 표시되며, 차이가 가장 큰 속성이 먼저 오도록 정렬됩니다. 즉, 한쪽에만 거의 전적으로 존재하는 값(또는 한쪽에는 없는 값)이 무엇이 다른지 보여 주는 가장 유력한 후보입니다.

<Image img={event_deltas_separation} alt="특정 시점에 시작되는 느린 구간 위의 히트맵 선택 영역과 그 아래의 비교 막대" size="lg" />

어떤 사각형을 선택해도 되지만, 세 가지 선택 방식은 서로 다른 질문에 답합니다:

* **이상해 보이는 영역** — 특정 시간 창에만 나타나는 더 높은 지연 시간의 띠, 눈에 띄는 성능 회귀가 시작되는 지점, 나머지와 맞지 않는 스팬의 집합입니다. 히트맵에서 이미 수상해 보이는 부분이 있을 때 사용하십시오.
* **전체 너비 수직 분할(느림 vs 빠름)** — 전체 시간 범위를 덮되 위쪽 지연 시간 대역(느린 꼬리)만 포함하도록 사각형을 드래그하고, 대부분의 빠른 스팬은 Background로 남겨 두십시오. 이렇게 하면 느린 스팬이 빠른 스팬과 무엇이 다른지 비교할 수 있습니다.
* **전체 높이 수평 분할(이전 vs 이후)** — 전체 지연 시간 축을 덮되 의심되는 변경 이후의 시간 창만 포함하도록 사각형을 드래그하고, 더 이른 기간은 Background로 남겨 두십시오. 이렇게 하면 지연 시간과 무관하게 두 시간 창 사이에서 무엇이 바뀌었는지 비교할 수 있습니다.

세로 및 가로 전체 범위 분할은 특히 히트맵에서 시각적으로 눈에 띄는 것이 없을 때 유용합니다. 이런 방식은 눈으로 판단하는 대신 속성 분석이 편차를 찾아내도록 해줍니다.

## 반복적 드릴다운 \{#drill-down\}

비교 모드와 분포 모드는 연계해서 사용할 때 가장 강력합니다. 막대를 클릭하면 세 가지 작업이 있는 팝오버가 열립니다.

* **Filter** — 이 값을 가진 스팬만 유지합니다
* **Exclude** — 이 값을 가진 스팬을 제외합니다
* **Copy** — 값을 클립보드에 복사합니다

<Image img={event_deltas_issue} alt="한 모집단에만 나타나는 값 위에 filter, exclude, copy 작업이 표시된 막대 팝오버" size="lg" />

Filter 또는 Exclude를 적용하면 히트맵 선택이 해제되고, 새 모집단 기준으로 히트맵이 다시 렌더링되며, 분포 모드도 해당 필터링된 집합을 기준으로 다시 이어집니다. 히트맵 형태가 어떻게 바뀌는지 확인하십시오. 필터가 제대로 적용되면 느린 구간이 눈에 띄게 사라지거나 이봉 분포의 분리가 하나로 좁혀집니다. 이를 반복하십시오. 다음으로 의심스러운 값을 찾고, 필터링하고, 새 히트맵을 보고, 새 분포를 확인하십시오. 보통 몇 번만 반복해도 회귀 원인을 한두 개 속성으로 좁힐 수 있습니다.

:::note
빈도가 낮은 값을 묶어 축약한 집계 **Other (N)** 버킷은 클릭할 수 없습니다. 해당 버킷 내 특정 값으로 필터링하려면 [검색창](/use-cases/observability/clickstack/search)을 직접 사용하십시오.
:::

모집단이 충분히 작아지면 **Results Table** 탭으로 전환해 개별 트레이스를 검사하십시오. 적용한 필터는 그대로 유지됩니다.

## 히트맵 사용자 지정 \{#customize\}

히트맵 오른쪽 상단의 톱니바퀴 아이콘을 클릭하면 **Heatmap Settings** 드로어가 열립니다.

<Image img={settings_drawer} alt="Scale, Value, Count 필드가 있는 Heatmap Settings 드로어" size="lg" />

| 매개변수      | 기본값              | 설명                                                                                               |
| --------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| **Scale** | Log              | Log는 지연 시간 범위가 넓을 때 적합하며, Linear는 범위가 좁고 분포가 균일할 때 더 적합합니다.                                      |
| **Value** | `(Duration)/1e6` | 응답 크기, 오류 비율, 사용자 정의 스팬 속성 등 임의의 숫자 표현식을 사용할 수 있습니다.                                             |
| **Count** | `count()`        | 색상을 계산하는 데 사용하는 집계입니다. `avg()`, `sum()`, `p95()` 또는 `countDistinct(field)`와 같은 표현식으로 변경할 수 있습니다. |

히트맵을 업데이트하려면 **Apply**를 클릭하십시오. 그러면 아래의 속성 분석도 이에 맞춰 업데이트됩니다.

## 문제 해결 \{#troubleshooting\}

### Event Deltas 탭이 표시되지 않습니다 \{#tab-not-visible\}

**Analysis Mode** 아래의 **Event Deltas** 탭은 duration 표현식이 있는 **Trace** 소스를 선택한 경우에만 표시됩니다. 데이터 소스가 Trace 유형으로 구성되어 있고 duration 정보가 포함된 스팬 데이터가 있는지 확인하십시오.

### 속성 차트에 결과가 거의 없거나 전혀 표시되지 않음 \{#few-results\}

샘플이 너무 작으면(스팬이 수십 개도 되지 않는 경우) 분포가 통계적으로 유의미하지 않을 수 있습니다. 시간 범위를 넓히거나 검색 필터를 완화하세요.