---
'slug': '/use-cases/observability/clickstack/event_patterns'
'title': 'ClickStack과 함께하는 이벤트 패턴'
'sidebar_label': '이벤트 패턴'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack과 함께하는 이벤트 패턴'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'event patterns'
- 'log analysis'
- 'pattern matching'
- 'observability'
---

import Image from '@theme/IdealImage';
import event_patterns from '@site/static/images/use-cases/observability/event_patterns.png';
import event_patterns_highlight from '@site/static/images/use-cases/observability/event_patterns_highlight.png';

Event patterns in ClickStack은 유사한 메시지를 자동으로 클러스터링하여 대량의 로그나 추적을 빠르게 이해할 수 있도록 도와줍니다. 이를 통해 수백만 개의 개별 이벤트를 파헤치는 대신 몇 개의 의미 있는 그룹만 검토하면 됩니다.

<Image img={event_patterns} alt="Event patterns" size="lg"/>

이렇게 하면 어떤 오류나 경고가 새롭게 발생했는지, 어떤 것이 반복되고 있는지, 어떤 것이 로그 볼륨의 갑작스러운 급증을 유도하는지 쉽게 알 수 있습니다. 패턴은 동적으로 생성되므로 정규 표현식을 정의하거나 파싱 규칙을 유지할 필요가 없습니다. ClickStack은 형식에 관계없이 자동으로 이벤트에 적응합니다.

사고 대응을 넘어서, 이러한 고차원적 뷰는 비용을 줄이기 위해 조정할 수 있는 시끄러운 로그 소스를 식별하고, 서비스가 생성하는 다양한 유형의 로그를 발견하며, 시스템이 이미 관심 있는 신호를 방출하고 있는지 더 빨리 확인하는 데 도움을 줍니다.

## Accessing event patterns {#accessing-event-patterns}

이벤트 패턴은 ClickStack의 **Search** 패널을 통해 직접 사용할 수 있습니다.

왼쪽 상단의 **Analysis Mode** 선택기에서 **Event Patterns**를 선택하면 표준 결과 테이블에서 유사한 이벤트의 클러스터 뷰로 전환됩니다.

<Image img={event_patterns_highlight} alt="Event patterns" size="lg"/>

이는 사용자가 개별 로그나 추적을 모두 스크롤할 수 있는 기본 **Results Table**에 대한 대안을 제공합니다.

## Recommendations {#recommendations}

이벤트 패턴은 데이터의 **좁혀진 하위 집합**에 적용할 때 가장 효과적입니다. 예를 들어, 이벤트 패턴을 활성화하기 전에 단일 서비스로 필터링하면 수천 개의 서비스에 패턴을 동시에 적용하는 것보다 더 관련성이 있고 흥미로운 메시지가 일반적으로 나타납니다.

반복적인 오류 메시지를 간결한 클러스터로 그룹화하는 데 특히 강력합니다. 다양한 ID 또는 페이로드가 있는 반복 오류를 요약하는 데 매우 유용합니다.

실제 예시를 보려면 [Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data#identify-error-patterns)에서 이벤트 패턴이 어떻게 사용되는지 확인해 보세요.
