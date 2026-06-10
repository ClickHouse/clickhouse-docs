---
slug: /use-cases/observability/clickstack/demo-days/2026/2026-05-15
title: '데모 데이 - 2026-05-15'
sidebar_label: '2026-05-15'
sidebar_position: -20260515
pagination_prev: null
pagination_next: null
description: '2026-05-15 ClickStack 데모 데이'
doc_type: 'guide'
keywords: ['ClickStack', '데모 데이']
---

## 노트북에서 알림 만들기 \{#alerts-from-notebooks\}

*[@brandon-pereira](https://github.com/brandon-pereira)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/HIxCMDmdZ8o" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이제 노트북에서 알림을 만들 수 있습니다. 기존에 즉석에서 대시보드를 만들던 동일한 노트북 흐름이 이제는 알림까지 함께 설정해 주므로, 노트북을 벗어나지 않고도 &quot;흥미로운 쿼리가 있습니다&quot;에서 &quot;이 조건이 충족되면 페이징해 주세요&quot;까지 바로 이어갈 수 있습니다.

알아두어야 할 주의 사항이 하나 있습니다. 팀에는 미리 정의된 웹훅이 여러 개 있지만, 현재 노트북은 추가 질문을 하지 않으므로 선택하게 하지 않고 가장 관련 있어 보이는 웹훅을 자동으로 고릅니다. 노트북이 필요한 정보가 부족할 때 추가 질문을 할 수 있도록 하는 PR이 이미 진행 중이므로, 이 차이도 곧 해소될 것입니다.

## materialized view의 자동 완성 \{#autocomplete-from-materialized-views\}

*[@knudtty](https://github.com/knudtty)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/iQf5EwktBW4" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

얼마 전 검색창의 속성 자동 완성을 지원하기 위해 materialized view를 추가했습니다. 그 결과 값을 그때그때 계산하지 않고도 즉시 표시할 수 있게 되었습니다. 이제 같은 MV를 사이드 필터에도 사용하고 있어, 부하가 큰 인스턴스에서도 필터가 훨씬 더 빠르게 로드됩니다.

짚고 넘어갈 만한 동작 변경이 하나 있습니다. MV 기반 필터는 현재 쿼리에 맞춰 범위를 좁히는 대신, 현재 시간 범위 내에서 가능한 모든 필터 값을 반환합니다. 더 느리지만 현재 실시간 결과를 대상으로 집계를 수행하는 검색 범위 필터로 다시 전환할 수 있는 토글도 제공됩니다. 기본 `filterValueExpandedKeyLimit` 값도 상향되었습니다. MV가 없으면 20개 키, 있으면 100개 키이며, 원하는 값까지 설정할 수 있습니다(1000까지 테스트했습니다).

이 MV는 유지 부담이 비교적 적습니다. 스테이징 인스턴스에서 많은 데이터를 대상으로 실행 중인데도 안정적으로 잘 동작하고 있습니다. 같은 MV가 속성 자동 완성과 맵 컬럼 확장에도 사용되므로, 한 번 설정하면 여러 곳에서 속도 향상을 얻을 수 있습니다. 데모에서는 검색 범위 기준 필터와 전체 필터 간 토글을 설정 안에 둘 것이 아니라 필터 패널 상단의 주요 pill 스위치로 노출해야 하는지에 대한 논의도 있었습니다. 이는 후속 작업으로 검토 중입니다.

**관련 PR:** [#2272](https://github.com/hyperdxio/hyperdx/pull/2272) feat: 기본적으로 필터는 검색 범위를 인식하지 않음; MV로 가속됨

## 테이블 컬럼 순서 및 시리즈별 포맷 지정 \{#table-column-ordering-and-per-series-formatting\}

*[@pulpdrew](https://github.com/pulpdrew)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/iEn8kzvERE8" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

서로 연관된 몇 가지 테이블 개선 사항이 함께 적용되었습니다. 이제 group-by 컬럼을 항상 오른쪽에 표시하는 대신 테이블 왼쪽에 고정할 수 있습니다. 이는 일반적으로 서비스 이름을 아래로 훑어보게 되는 RED 스타일 대시보드에서 특히 유용합니다. 이 동작은 테이블별 표시 설정에서 제어할 수 있습니다.

이제 시리즈별 숫자 포맷도 지원됩니다. 이전 동작에서는 테이블 전체에 하나의 숫자 포맷만 적용되었기 때문에, 테이블에 밀리초 포맷 시리즈가 하나라도 있으면 Requests 컬럼이 `123ms`처럼 표시될 수 있었습니다. 이제는 컬럼별 또는 시리즈별로 포맷을 설정할 수 있으므로, 요청 수는 일반 숫자로 유지되고 지연 시간 컬럼은 기간으로 포맷됩니다.

여기에 더해, 포맷 추론도 이제 시리즈별로 수행됩니다. Trace Duration 필드를 기준으로 집계하면 해당 시리즈만 밀리초로 추론되며, 한 컬럼이 기간이라고 해서 테이블의 나머지까지 밀리초 포맷이 적용되지는 않습니다.

**관련 PR:** [#2149](https://github.com/hyperdxio/hyperdx/pull/2149) feat: 테이블 왼쪽에 group-by 컬럼 표시 허용, [#2174](https://github.com/hyperdxio/hyperdx/pull/2174) feat: 시리즈별 숫자 포맷 추가

## 사용자 지정 대시보드 연결 \{#customizable-dashboard-linking\}

*[@pulpdrew](https://github.com/pulpdrew)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Stlz02xES40" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이제 대시보드 테이블에서 행을 클릭하면 다른 대시보드(또는 검색)로 이동하도록 연결할 수 있으며, 대상과 전달할 필터 모두에 템플릿을 구성할 수 있습니다. 테이블 타일 구성에는 새로운 &quot;행 클릭 동작&quot; 옵션이 추가되었습니다. &quot;대시보드&quot;를 선택하고 연결할 대시보드를 고른 다음, 현재 행의 필터를 대상 대시보드의 필터에 매핑하세요. 필터 값은 Handlebars 스타일 템플릿을 사용하므로, 클릭한 행의 어떤 컬럼 값이든 대상 필터나 `WHERE` 절(SQL 또는 Lucene)에 가져와 사용할 수 있습니다. 데모에 나온 예시에서는 서비스 목록을 연결해 두어, 행을 클릭하면 `service.name`이 이미 필터링된 상태로 서비스 상세 대시보드로 이동합니다.

특정 대상 대시보드를 선택하는 대신 대시보드 이름 자체를 템플릿으로 지정할 수도 있습니다. 예를 들어 `${service.name} dashboard`와 같은 이름의 서비스별 대시보드가 있다면, 링크는 클릭한 행에 맞는 대시보드로 확인됩니다. 템플릿으로 지정한 대시보드가 존재하지 않는 경우를 위한 오류 처리도 포함되어 있어, 깨진 페이지로 이동하는 대신 알림이 표시됩니다.

여러 변수도 지원되며, 클릭한 행의 컬럼을 원하는 조합으로 필터 세트나 템플릿화된 대시보드 이름에 전달할 수 있습니다. Handlebars에는 동적 헬퍼와 조건부 블록이 있지만, 현재는 동작 범위를 작고 예측 가능하게 유지하기 위해 대부분 비활성화되어 있습니다. 가져오기 흐름도 업데이트되었습니다. 이제 ID로 다른 대시보드에 연결된 대시보드는 가져오는 동안 해당 참조를 대상 계정에 있는 대시보드에 맞게 다시 매핑할 수 있습니다.

**관련 PR:** [#2146](https://github.com/hyperdxio/hyperdx/pull/2146) feat: 사용자 지정 대시보드 on-click에 필터 템플릿 추가, [#2148](https://github.com/hyperdxio/hyperdx/pull/2148) feat: 대시보드 onClick의 가져오기/내보내기 지원, [#2156](https://github.com/hyperdxio/hyperdx/pull/2156) feat: 외부 대시보드 API에 사용자 지정 onClick 필드 추가, [#2273](https://github.com/hyperdxio/hyperdx/pull/2273) feat: MCP schemas 및 prompts에 대시보드 테이블 onClick 추가