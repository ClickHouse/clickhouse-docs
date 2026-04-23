---
slug: /use-cases/observability/clickstack/demo-days/2026/04/2026-04-17
title: '데모 데이 - 2026-04-17'
sidebar_label: '2026-04-17'
pagination_prev: null
pagination_next: null
description: '2026-04-17 ClickStack 데모 데이'
doc_type: 'guide'
keywords: ['ClickStack', '데모 데이']
---

## 로그와 트레이스 요약 \{#summarize-logs-and-traces\}

*[@alex-fedotyev](https://github.com/alex-fedotyev)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/TWsFyWt-tD8" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이제 HyperDX에는 로그, 트레이스, 패턴 전반에서 작동하는 AI 요약 기능이 있습니다. 새로운 요약 버튼은 텔레메트리 데이터를 읽기 쉬운 요약으로 정리해, 이벤트를 하나씩 직접 읽지 않고도 일련의 이벤트 전반에서 무슨 일이 있었는지 빠르게 파악할 수 있게 해줍니다.

특히 재미있는 점은 요약에 사용할 어조나 테마를 선택할 수 있다는 것입니다. 예를 들어 「Shakespeare drama」 같은 옵션을 선택하면 시스템에서 발생한 일을 문체를 살린 방식으로 읽어볼 수 있습니다. 단순한 재미 요소를 넘어, 이 아키텍처는 Anthropic(또는 유사한) API와 연동할 수 있도록 설계되었으며, 최초 요약 이후에도 계속 질문할 수 있도록 후속 대화를 지원합니다.

**관련 PR:** [#2108](https://github.com/hyperdxio/hyperdx/pull/2108) feat: 확장 가능한 주제, 트레이스 Context, 보안 강화를 포함한 AI 요약, [#2100](https://github.com/hyperdxio/hyperdx/pull/2100) 스마트 톤 모드를 사용하는 실제 AI 요약 콜백 구현

## Event deltas 히트맵을 차트 빌더로 통합 \{#event-deltas-heatmap-into-chart-builder\}

*[@alex-fedotyev](https://github.com/alex-fedotyev)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/BLVhIQjocwE" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Event Deltas 히트맵 시각화는 현재 메인 차트 빌더로 이전되고 있으며, HyperDX의 다른 시각화와 함께 표준 차트 유형으로 사용할 수 있게 됩니다. 이전에는 전용 뷰에서만 사용할 수 있었지만, 이제는 다른 차트 유형과 함께 차트 탐색기에서 작동합니다.

이 작업이 완료되면 Event Deltas 히트맵을 대시보드 타일에 직접 추가할 수 있게 되며, 다른 차트와 마찬가지로 필드 필터링과 시간 범위 제어를 지원합니다. 현재 이 작업은 진행 중입니다.

**관련 PR:** [#2107](https://github.com/hyperdxio/hyperdx/pull/2107) feat: 히트맵 차트를 대시보드 편집기 및 타일 렌더링에 연결, [#2102](https://github.com/hyperdxio/hyperdx/pull/2102) Event Deltas를 지원하는 재사용 가능한 Heatmap 차트 구현

## schema 개선을 위한 벤치마킹 \{#benchmarking-for-schema-improvements\}

*[@knudtty](https://github.com/knudtty)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/_B7TmIiXZyM" title="YouTube 비디오 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Aaron은 HyperDX의 업데이트된 기본 OpenTelemetry 로그 schema에 대한 벤치마킹 결과를 설명합니다. 핵심 변경 사항은 기존 `timestamp_time` 컬럼(초 단위 정밀도의 32비트 Unix 타임스탬프)을 제거하고, 나노초 정밀도를 제공하는 `timestamp`만 사용하도록 한 것입니다. 이로써 schema에서 컬럼 하나가 줄어듭니다. 다양한 쿼리 벤치마크 전반에서 업데이트된 schema는 거의 모든 경우 기존 schema와 같거나 더 나은 성능을 보입니다.

최종 schema에는 선택도가 높은 쿼리에서 의미 있는 성능 향상을 보여주는 읽기 순서 최적화도 포함되어 있습니다. 비교적 드문 맵 값을 검색하는 작업은 기준 구성과 비교해 대략 2배 더 빠르게 실행되었고, 빈도가 높은 값 조회에서는 그보다 더 큰 개선이 나타났습니다. 삽입 성능은 유지해야 하는 컬럼이 더 많아져 오버헤드가 소폭 증가하지만, 전반적인 쿼리 성능은 동등하거나 개선되어 있어 무리 없이 업그레이드할 수 있습니다.

**관련 PR:** [#2125](https://github.com/hyperdxio/hyperdx/pull/2125) feat: 기본 otel-logs schema 최적화

## 자동 완성 개선 \{#improvements-to-autocomplete\}

*[@knudtty](https://github.com/knudtty)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/8zDZx49uYQo" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

HyperDX의 자동 완성은 훨씬 더 높은 카디널리티를 지원하고 값을 더 빠르게 로드할 수 있도록 대폭 개편되고 있습니다. 새 구현은 롤업 테이블(`AggregatingMergeTrees`가 15분 단위 시간 버킷에서 key-value 쌍을 사전 집계함)을 기반으로 하므로, 키를 입력할 때마다 원시 데이터를 쿼리하는 대신 훨씬 더 작은 사전 계산 데이터셋에서 읽어 옵니다. 2억 3천만 행 규모의 스테이징 인스턴스를 대상으로 한 라이브 데모에서 자동 완성은 `hostname` 같은 고 카디널리티 필드의 값을 눈에 띄는 지연 없이 빠르게 로드했습니다.

이 시스템은 키 전용 롤업(카디널리티 오버헤드를 낮추기 위해 모든 키를 반환하되 연결된 값은 반환하지 않음)과 전체 키-값 롤업을 모두 지원합니다. 키 롤업만 있는 경우 값 조회 단계에서는 기존 fetch-values 전략으로 폴백합니다. 롤업 테이블이 전혀 감지되지 않더라도 현재 동작으로 자연스럽게 폴백합니다. Aaron은 또한 어떤 키에 값 롤업을 적용할지 제어하는 향후 allow-list UI가 특히 카디널리티가 높은 데이터를 보유한 고객에게 유용한 추가 기능이 될 것이라고 언급했습니다.

**관련 PR:** [#2128](https://github.com/hyperdxio/hyperdx/pull/2128) feat: 빠르고 완전한 자동 완성, [#2127](https://github.com/hyperdxio/hyperdx/pull/2127) feat: 더 나은 자동 완성

## SQL을 사용한 알림 개선 사항 \{#improvements-to-alerting-with-sql\}

*[@pulpdrew](https://github.com/pulpdrew)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/BOk-LC0y2no" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

지난주에 Raw SQL 꺾은선 차트와 막대 차트에 대한 알림이 추가된 데 이어, 이제 HyperDX는 Raw SQL 숫자 차트에 대한 알림도 지원합니다. 이제 알림을 설정할 때 시간 필터 매개변수는 필수가 아닙니다. 이를 생략하면 경고 메시지가 표시되지만, 시간 차원이 전혀 없는 쿼리도 이제 완전히 유효합니다. 따라서 ClickHouse 클러스터 수가 예상 값과 일치하는지 확인하는 것처럼, 시간에 따라 변하지 않는 설정 값이나 시스템 메트릭에 대해서도 손쉽게 알림을 설정할 수 있습니다.

또한 여러 새로운 임계값 타입이 추가되었습니다: not-equals, is-above, at-most, between, outside. 이를 통해 팀은 단순한 초과 비교를 넘어 알림 조건을 훨씬 더 유연하게 표현할 수 있습니다. 마지막으로, 이제 알림 이력이 타일 편집기에 직접 표시됩니다. 따라서 발생 중인 알림이 특정 대시보드 타일에 연결된 경우, 사용자는 전체 이력을 확인하고 무엇이 알림을 트리거했는지 파악하며, 대시보드를 벗어나지 않고도 알림을 확인(ack)하거나 음소거할 수 있습니다.

**관련 PR:** [#2073](https://github.com/hyperdxio/hyperdx/pull/2073) feat: Raw SQL 기반 대시보드 타일에 대한 알림 구현, [#2114](https://github.com/hyperdxio/hyperdx/pull/2114) feat: Raw SQL 숫자 차트에 대한 알림 지원, [#2122](https://github.com/hyperdxio/hyperdx/pull/2122) feat: 추가 알림 임계값 타입 추가, [#2130](https://github.com/hyperdxio/hyperdx/pull/2130) feat: between 및 not-between 알림 임계값 추가, [#2123](https://github.com/hyperdxio/hyperdx/pull/2123) feat: 알림 편집기에 알림 이력 + ack 추가

## 알림 실행 중 오류 \{#errors-during-alert-execution\}

*[@pulpdrew](https://github.com/pulpdrew)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/b3G8kFiQiUg" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

알림 실행에 실패하면 이제 HyperDX가 해당 오류를 조용히 누락하는 대신 UI에 직접 표시합니다. 이전에는 아무런 설명 없이 알림 이력에 빈 구간이 생긴 것을 발견할 수 있었습니다. 오류 메시지도 없고 무엇이 잘못되었는지 디버깅할 방법도 없었습니다. 이제 잘못된 쿼리, webhook 전송 실패, 누락되었거나 잘못 구성된 webhook 설정 등 서로 다른 실패 유형에 대해 구분되는 오류 아이콘이 인라인으로 표시됩니다.

오류 아이콘을 클릭하면 문제를 진단하고 해결하는 데 필요한 구체적인 세부 정보가 표시되므로, 사용자는 서버 로그를 뒤지거나 지원 요청을 제출하지 않고도 잘못 구성된 알림를 수정할 수 있습니다. 목표는 알림 실패를 사용자가 직접 해결할 수 있도록 하는 것입니다. 오류를 확인하고, 이해하고, 수정하세요.

**관련 PR:** [#2132](https://github.com/hyperdxio/hyperdx/pull/2132) feat: UI에 알림 실행 오류 표시, [#2136](https://github.com/hyperdxio/hyperdx/pull/2136) fix: 민감할 수 있는 알림 오류 숨기기