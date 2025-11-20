---
'slug': '/use-cases/observability/clickstack/event_deltas'
'title': 'ClickStack을 사용한 Event Deltas'
'sidebar_label': 'Event Deltas'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack을 사용한 Event Deltas'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'event deltas'
- 'change tracking'
- 'logs'
- 'observability'
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

Event Deltas in ClickStack는 성능이 저하될 때 어떤 변화가 있었는지를 파악하기 위해 트레이스의 속성을 자동으로 분석하는 트레이스 중심 기능입니다. ClickStack은 데이터 집합 내에서 정상 트레이스와 느린 트레이스의 지연 분포를 비교함으로써 새로운 배포 버전, 특정 엔드포인트 또는 특정 사용자 ID와 같이 차이와 가장 연관된 속성을 강조합니다.

트레이스 데이터를 수동으로 검색하는 대신, 이벤트 델타는 데이터의 두 하위 집합 간의 지연 차이를 유도하는 주요 속성을 부각시켜 회귀를 진단하고 근본 원인을 파악하는 데 훨씬 더 쉽게 만듭니다. 이 기능을 통해 사용자는 원시 트레이스를 시각화하고 성능 변화에 영향을 미치는 요소를 즉시 확인할 수 있어 사고 대응을 가속화하고 평균 복구 시간을 단축할 수 있습니다.

<Image img={event_deltas} alt="Event Deltas" size="lg"/>

## 이벤트 델타 사용하기 {#using-event-deltas}

이벤트 델타는 ClickStack의 **검색** 패널에서 타입이 `Trace`인 소스를 선택할 때 직접 사용할 수 있습니다.

왼쪽 상단의 **분석 모드** 선택기에서 **Event Deltas**를 선택하면 스팬을 행으로 표시하는 표준 결과 테이블에서 전환됩니다.

<Image img={event_deltas_no_selected} alt="Event Deltas not selected" size="lg"/>

이 뷰는 시간에 따른 스팬의 분포를 시각적으로 렌더링하여 지연 시간이 볼륨과 함께 어떻게 변하는지를 보여줍니다. 수직 축은 지연 시간을 나타내고, 색상은 특정 지점에서의 트레이스 밀도를 나타내며, 더 밝은 노란색 영역은 더 높은 트레이스 농도를 나타냅니다. 이 시각화를 통해 사용자는 스팬이 지연 시간과 카운트 모두에 걸쳐 어떻게 분배되어 있는지를 빠르게 확인할 수 있어 성능의 변화나 이상을 식별하기가 훨씬 쉬워집니다.

<Image img={event_deltas_highlighted} alt="Event Deltas highlighted" size="lg"/>

사용자는 그런 다음 시각화의 영역 - 이상적으로는 높은 지속 시간을 가진 스팬과 충분한 밀도를 가진 영역을 선택하고 **선택으로 필터링**을 클릭하여 "이상치"를 분석으로 지정합니다. 이후 이벤트 델타는 이 이상치 하위 집합에서 다른 데이터셋과 비교하여 해당 스팬과 가장 관련된 컬럼과 주요 값을 식별합니다. 의미 있는 이상치가 있는 영역에 집중함으로써 ClickStack은 이 하위 집합을 전체 데이터 집합과 구별하는 고유한 값을 강조하여 관찰된 성능 차이와 가장 상관관계가 깊은 속성을 부각시킵니다.

<Image img={event_deltas_selected} alt="Event Deltas selected" size="lg"/>

각 컬럼에 대해 ClickStack은 선택된 이상치 하위 집합에 편향된 값을 식별합니다. 즉, 컬럼에 값이 나타날 때, 그것이 전체 데이터 집합(내부자)이 아니라 이상치 내에서 주로 발생한다면 중요하다고 강조됩니다. 편향이 가장 강한 컬럼이 먼저 나열되어 이상한 스팬과 기본 동작을 구별하는 속성을 드러냅니다.

<Image img={event_deltas_outliers} alt="Event Deltas outliers" size="lg"/>

위의 예를 고려해보면 `SpanAttributes.app.payment.card_type` 컬럼이 부각되었습니다. 여기서 이벤트 델타 분석은 `29%`의 내부자가 MasterCard를 사용하고, 이상치에서는 `0%`가 사용되며, 이상치의 `100%`가 Visa를 사용하고 내부자는 `71%`가 Visa를 사용하는 것을 보여줍니다. 이는 Visa 카드 유형이 비정상적이고 높은 지연 시간이 있는 트레이스와 강한 연관이 있음을 시사하고, 반면 MasterCard는 정상적인 하위 집합에서만 나타납니다.

<Image img={event_deltas_issue} alt="Event Deltas issue" size="lg"/>

반대로, 내부자와 고유하게 연관된 값도 흥미로울 수 있습니다. 위의 예에서 오류 `Visa Cash Full`은 내부자에게만 독점적으로 나타나고 이상치 스팬에는 완전히 나타나지 않습니다. 이런 경우 지연 시간은 항상 약 50밀리초 미만임을 나타내며, 이 오류는 낮은 지연 시간과 연관이 있음을 시사합니다.

## 이벤트 델타의 작동 원리 {#how-event-deltas-work}

이벤트 델타는 선택한 이상치 영역과 내부자 영역에 대해 두 개의 쿼리를 발행하여 작동합니다. 각 쿼리는 적절한 지속 시간과 시간 창으로 제한됩니다. 양쪽 결과 집합에서 이벤트 샘플을 검사한 다음 이상치에서 주로 나타나는 값의 농도가 높은 컬럼을 식별합니다. 값이 오직 이상치 하위 집합에서만 100% 발생하는 컬럼이 우선 표시되며, 관찰된 차이에 가장 책임이 있는 속성을 강조합니다.

## 그래프 사용자 정의하기 {#customizing-the-graph}

그래프 위에는 히트맵이 생성되는 방식을 사용자 정의할 수 있는 컨트롤이 있습니다. 이러한 필드를 조정함에 따라 히트맵이 실시간으로 업데이트되어 측정할 수 있는 값과 시간에 따른 빈도 간의 관계를 시각화하고 비교할 수 있습니다.

**기본 구성**

기본적으로 시각화는 다음을 사용합니다:

- **Y 축**: `Duration` — 지연 시간 값을 수직으로 표시합니다.
- **색상 (Z 축)**: `count()` — 시간에 따른 요청 수를 나타냅니다 (X 축).

이 설정은 시간에 따른 지연 시간 분포를 보여주며, 색상 강도가 각 범위 내에 몇 개의 이벤트가 있는지를 나타냅니다.

**매개변수 조정**

이 매개변수를 수정하여 데이터의 다양한 차원을 탐색할 수 있습니다:

- **값**: Y 축에 무엇이 표시될지를 제어합니다. 예를 들어 `Duration`을 오류율 또는 응답 크기와 같은 메트릭으로 교체합니다.
- **카운트**: 색상 맵핑을 제어합니다. `count()` (버킷당 이벤트 수)에서 `avg()`, `sum()`, `p95()`와 같은 다른 집계 함수 또는 `countDistinct(field)`와 같은 사용자 정의 식으로 변경할 수 있습니다.

<Image img={event_deltas_customization} alt="Event Deltas Customization" size="lg"/>

## 권장 사항 {#recommendations}

이벤트 델타는 분석이 특정 서비스에 초점을 맞출 때 가장 잘 작동합니다. 여러 서비스 간의 지연 시간은 광범위하게 달라질 수 있어 이상치에 가장 책임이 있는 컬럼과 값을 식별하기가 더 어려워집니다. 이벤트 델타를 활성화하기 전에 지연 분포가 유사할 것으로 예상되는 집합으로 스팬을 필터링하세요. 가장 유용한 통찰을 위해 넓은 지연 변동이 예상되지 않는 집합을 목표로 분석하고, 그것이 일반적인 경우(예: 두 개의 서로 다른 서비스)를 피해야 합니다.

영역을 선택할 때, 사용자는 느린 지속 시간과 빠른 지속시간 간의 명확한 분포가 있는 하위 집합을 목표로 해야 하며, 이는 높은 지연 시간의 스팬을 분석을 위해 깔끔하게 고립시킵니다. 예를 들어, 아래에서 선택된 영역은 분석을 위한 느린 스팬 집합을 명확하게 캡처하고 있습니다.

<Image img={event_deltas_separation} alt="Event Deltas Separation" size="lg"/>

반대로, 다음 데이터 집합은 이벤트 델타로 유용한 방식으로 분석하기 어렵습니다.

<Image img={event_deltas_inappropriate} alt="Event Deltas Poor seperation" size="lg"/>
