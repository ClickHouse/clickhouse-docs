---
slug: /use-cases/observability/clickstack/event_deltas
title: 'ClickStack에서 이벤트 델타(Event Deltas) 사용하기'
sidebar_label: '이벤트 델타(Event Deltas)'
pagination_prev: null
pagination_next: null
description: 'ClickStack에서 이벤트 델타(Event Deltas) 사용하기'
doc_type: 'guide'
keywords: ['clickstack', '이벤트 델타', '변경 추적', '로그', '관측성']
---

import Image from '@theme/IdealImage';
import event_deltas from '@site/static/images/use-cases/observability/hyperdx-demo/step_17.png';
import event_deltas_no_selected from '@site/static/images/use-cases/observability/event_deltas_no_selected.png';
import event_deltas_highlighted from '@site/static/images/use-cases/observability/event_deltas_highlighted.png';
import event_deltas_selected from '@site/static/images/use-cases/observability/event_deltas_selected.png';
import event_deltas_issue from '@site/static/images/use-cases/observability/event_deltas_issue.png';
import event_deltas_outliers from '@site/static/images/use-cases/observability/event_deltas_outliers.png';
import event_deltas_separation from '@site/static/images/use-cases/observability/event_deltas_separation.png';
import event_deltas_customization from '@site/static/images/use-cases/observability/event_deltas_customization.png';
import event_deltas_inappropriate from '@site/static/images/use-cases/observability/event_deltas_inappropriate.png';

ClickStack의 Event deltas는 트레이스 중심 기능으로, 성능이 저하되거나 회귀했을 때 무엇이 변경되었는지 파악하기 위해 트레이스 속성을 자동으로 분석합니다. 하나의 데이터 집합 안에서 정상 트레이스와 느린 트레이스의 지연 시간 분포를 비교하여, ClickStack은 어떤 속성이 차이와 가장 강하게 연관되어 있는지 강조해 보여 줍니다. 이는 새 배포 버전인지, 특정 엔드포인트인지, 특정 사용자 ID인지 등을 식별하는 데 도움이 됩니다.

트레이스 데이터를 수동으로 일일이 살펴보는 대신, Event deltas는 두 데이터 하위 집합 간 지연 시간 차이를 유발하는 핵심 속성을 드러내어 성능 회귀를 진단하고 근본 원인을 정확히 파악하기 훨씬 쉽도록 합니다. 이 기능을 사용하면 원시 트레이스를 시각화하고 성능 변화에 영향을 주는 요인을 즉시 확인할 수 있어, 인시던트 대응을 가속화하고 평균 해결 시간(MTTR)을 단축할 수 있습니다.

<Image img={event_deltas} alt="Event deltas" size="lg" />

## Event deltas 사용하기 \{#using-event-deltas\}

`Trace` 타입의 소스를 선택하면 ClickStack의 **Search** 패널에서 바로 Event deltas를 사용할 수 있습니다.

왼쪽 상단의 **Analysis Mode** 선택기에서 **Event deltas**를 선택하면(`Trace` 소스가 선택된 상태), 스팬을 행으로 표시하는 표준 결과 테이블 보기에서 전환됩니다.

<Image img={event_deltas_no_selected} alt="선택되지 않은 Event deltas" size="lg" />

이 보기는 시간에 따른 스팬 분포를 렌더링하여, 볼륨과 함께 지연 시간이 어떻게 달라지는지 보여줍니다. 세로축은 지연 시간을 나타내고, 색상은 특정 지점에서의 트레이스 밀도를 나타냅니다. 더 밝은 노란색 영역일수록 트레이스가 더 많이 집중되어 있음을 의미합니다. 이 시각화를 사용하면 스팬이 지연 시간과 개수에 따라 어떻게 분포하는지 빠르게 파악할 수 있으므로, 성능 변화나 이상 징후를 더 쉽게 식별할 수 있습니다.

<Image img={event_deltas_highlighted} alt="강조 표시된 Event deltas" size="lg" />

그런 다음 시각화에서 영역을 선택할 수 있습니다. 이상적으로는 지속 시간이 더 긴 스팬이면서 밀도도 충분한 영역을 선택한 뒤 **Filter by Selection**을 적용하십시오. 그러면 분석 대상 &quot;이상치&quot;가 지정됩니다. 이후 Event deltas는 나머지 데이터셋과 비교해 이 이상치 하위 집합의 스팬과 가장 밀접하게 연관된 컬럼과 주요 값을 식별합니다. 의미 있는 이상치가 있는 영역에 초점을 맞추면, ClickStack은 이 하위 집합을 전체 데이터셋과 구분하는 고유한 값을 강조하여 관찰된 성능 차이와 가장 강하게 연관된 속성을 드러냅니다.

<Image img={event_deltas_selected} alt="선택된 Event deltas" size="lg" />

각 컬럼에 대해 ClickStack은 선택된 이상치 하위 집합 쪽으로 크게 치우친 값을 식별합니다. 다시 말해, 어떤 값이 컬럼에 나타날 때 전체 데이터셋(정상치, inliers)보다 이상치에서 주로 발생하면 해당 값은 중요한 것으로 강조됩니다. 가장 편향이 강한 컬럼이 먼저 나열되므로, 비정상적인 스팬과 가장 강하게 연관된 속성이 드러나고 이를 기준 동작과 구분할 수 있습니다.

<Image img={event_deltas_outliers} alt="Event deltas 이상치" size="lg" />

위 예시에서 `SpanAttributes.app.payment.card_type` 컬럼이 표시된 경우를 살펴보겠습니다. 여기서 Event deltas 분석은 정상치 중 `29%`가 MasterCard를 사용하고 이상치에서는 `0%`인 반면, 이상치의 `100%`는 Visa를 사용하고 정상치에서는 `71%`임을 보여줍니다. 이는 Visa 카드 타입이 비정상적이면서 지연 시간이 더 높은 트레이스와 강하게 연관되어 있고, MasterCard는 정상 하위 집합에만 나타난다는 점을 시사합니다.

<Image img={event_deltas_issue} alt="Event deltas 문제" size="lg" />

반대로, 정상치에만 연관된 값도 흥미로울 수 있습니다. 위 예시에서 `Visa Cash Full` 오류는 정상치에만 나타나고 이상치 스팬에는 전혀 나타나지 않습니다. 이런 경우 지연 시간은 항상 약 50밀리초보다 낮으므로, 이 오류는 낮은 지연 시간과 연관되어 있음을 시사합니다.

## Event deltas의 작동 방식 \{#how-event-deltas-work\}

Event deltas는 두 개의 쿼리를 실행하여 동작합니다. 하나는 선택된 이상치(outlier) 영역에 대한 것이고, 다른 하나는 정상치(inlier) 영역에 대한 것입니다. 각 쿼리는 해당 기간과 시간 구간으로 제한됩니다. 그런 다음 두 결과 집합에서 이벤트 샘플을 검사하여, 값의 높은 집중도가 주로 이상치에서 나타나는 컬럼을 식별합니다. 특정 값의 100%가 이상치 하위 집합에서만 발생하는 컬럼은 먼저 표시되며, 관찰된 차이에 가장 크게 기여하는 속성을 강조합니다.

## 그래프 커스터마이징 \{#customizing-the-graph\}

그래프 상단에는 히트맵 생성 방식을 사용자 지정할 수 있는 제어 요소가 있습니다. 이 필드를 조정하면 히트맵이 실시간으로 업데이트되며, 임의의 계량 가능한 값과 그 값의 시간에 따른 빈도 간 관계를 시각화하고 비교할 수 있습니다.

**기본 구성**

기본적으로 시각화는 다음 설정을 사용합니다:

* **Y Axis**: `Duration` — 지연 시간(latency) 값을 세로축으로 표시
* **Color (Z Axis)**: `count()` — 시간(X축)에 따른 요청 개수를 표현

이 구성은 시간에 따른 지연 시간 분포를 보여 주며, 색상의 강도로 각 구간에 포함되는 이벤트 개수를 나타냅니다.

**매개변수 조정**

다음 매개변수를 수정하여 데이터의 다양한 차원을 탐색할 수 있습니다:

* **Value**: Y축에 어떤 값을 표시할지 제어합니다. 예를 들어, `Duration` 대신 에러율(error rate)이나 응답 크기(response size)와 같은 메트릭으로 교체할 수 있습니다.
* **Count**: 색상 매핑 방식을 제어합니다. `count()`(버킷당 이벤트 개수)에서 `avg()`, `sum()`, `p95()` 등의 다른 집계 함수로 전환하거나, `countDistinct(field)`와 같은 커스텀 표현식을 사용할 수 있습니다.

<Image img={event_deltas_customization} alt="Event deltas customization" size="lg" />

## Recommendations \{#recommendations\}

Event deltas는 특정 서비스에 초점을 맞춘 분석에서 가장 효과적입니다. 여러 서비스에 걸친 지연 시간(latency)은 크게 달라질 수 있어, 이상치에 가장 크게 기여하는 컬럼과 값을 식별하기가 더 어려워집니다. Event deltas를 활성화하기 전에 지연 시간 분포가 유사할 것으로 예상되는 스팬 집합으로 먼저 필터링하십시오. 지연 시간 변동 폭이 넓을 것으로 예상되지 않는 집합을 대상으로 분석해야 가장 유용한 통찰을 얻을 수 있으며, (예: 서로 다른 두 서비스처럼) 지연 시간 편차가 원래 큰 경우는 피하는 것이 좋습니다.

분석 구간을 선택할 때에는 느린 지속 시간과 빠른 지속 시간이 명확히 구분되는 하위 집합을 목표로 하십시오. 이렇게 하면 더 높은 지연 시간을 가진 스팬을 분석을 위해 깔끔하게 분리할 수 있습니다. 예를 들어, 아래에서 선택된 구간은 분석을 위해 더 느린 스팬 집합을 명확히 포착하고 있습니다.

<Image img={event_deltas_separation} alt="Event deltas 분리" size="lg" />

반대로, 다음 데이터 세트는 Event deltas를 사용하여 유용하게 분석하기가 어렵습니다.

<Image img={event_deltas_inappropriate} alt="Event deltas 분리가 좋지 않은 예" size="lg" />