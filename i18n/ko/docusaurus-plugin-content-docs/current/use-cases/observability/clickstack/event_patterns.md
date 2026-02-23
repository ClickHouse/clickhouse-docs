---
slug: /use-cases/observability/clickstack/event_patterns
title: 'ClickStack를 활용한 이벤트 패턴'
sidebar_label: '이벤트 패턴'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 활용한 이벤트 패턴'
doc_type: 'guide'
keywords: ['clickstack', 'event patterns', 'log analysis', 'pattern matching', 'observability']
---

import Image from '@theme/IdealImage';
import event_patterns from '@site/static/images/use-cases/observability/event_patterns.png';
import event_patterns_highlight from '@site/static/images/use-cases/observability/event_patterns_highlight.png';

ClickStack의 이벤트 패턴 기능은 유사한 메시지를 자동으로 클러스터링하여 대량의 로그 또는 트레이스를 빠르게 파악할 수 있도록 해 줍니다. 그 결과 수백만 개의 개별 이벤트를 일일이 살펴보는 대신, 의미 있는 소수의 그룹만 검토하면 됩니다.

<Image img={event_patterns} alt="Event patterns" size="lg" />

이를 통해 어떤 오류나 경고가 새로 발생한 것인지, 어떤 것은 반복되는지, 그리고 어떤 것이 로그량의 갑작스러운 급증을 유발하는지 훨씬 더 쉽게 파악할 수 있습니다. 패턴이 동적으로 생성되므로 정규식을 정의하거나 파싱 규칙을 유지 관리할 필요가 없으며, 형식과 관계없이 ClickStack이 이벤트에 자동으로 적응합니다.

인시던트 대응을 넘어, 이러한 상위 수준 뷰는 비용 절감을 위해 줄일 수 있는 불필요하게 시끄러운(noisy) 로그 소스를 식별하고, 서비스가 생성하는 다양한 로그 유형을 파악하며, 시스템이 이미 중요한 신호를 내보내고 있는지 더 빠르게 확인하는 데에도 도움이 됩니다.


## 이벤트 패턴에 접근하기 \{#accessing-event-patterns\}

이벤트 패턴은 ClickStack의 **Search** 패널에서 바로 사용할 수 있습니다.  

왼쪽 상단의 **Analysis Mode** 선택 메뉴에서 **Event Patterns**를 선택하여, 기본 결과 테이블 대신 유사한 이벤트를 군집화해 보여주는 뷰로 전환합니다.  

<Image img={event_patterns_highlight} alt="Event patterns" size="lg"/>

이 기능은 기본 **Results Table**에서 개별 로그나 트레이스를 모두 스크롤하며 확인하는 방식에 대한 대안을 제공합니다.

## Recommendations \{#recommendations\}

이벤트 패턴은 데이터의 **좁은 하위 집합**에 적용할 때 가장 효과적입니다. 예를 들어, 수천 개의 서비스 전체에 한 번에 패턴을 적용하는 것보다, 먼저 단일 서비스로 범위를 좁힌 다음 이벤트 패턴을 활성화하는 것이 더 관련성 높고 흥미로운 메시지를 표면화하는 데 도움이 됩니다.  

이벤트 패턴은 ID나 페이로드만 다른 반복 오류를 간결한 클러스터로 묶어 요약하는 데에도 특히 효과적입니다.  

실제 적용 사례는 [Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data#identify-error-patterns)에서 이벤트 패턴이 어떻게 사용되는지 살펴보십시오.