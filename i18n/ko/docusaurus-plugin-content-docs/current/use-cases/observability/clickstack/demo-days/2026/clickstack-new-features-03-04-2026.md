---
slug: /use-cases/observability/clickstack/demo-days/2026/04/03-04-2026
title: '데모 데이 - 03/04/2026'
sidebar_label: '03/04/2026'
pagination_prev: null
pagination_next: null
description: 'ClickStack 데모 데이 - 03/04/2026'
doc_type: 'guide'
keywords: ['ClickStack', '데모 데이']
---

## 새로운 대시보드 및 저장된 검색 목록 페이지 \{#new-dashboard-and-saved-search-listing-pages\}

*[@pulpdrew](https://github.com/pulpdrew)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/dQCkNZElwcg" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

대시보드와 저장된 검색이 사이드바에서 전용 목록 페이지로 이동했습니다. 팀에 대시보드가 어느 정도 쌓이면 기존 사이드바 방식은 금방 불편해졌습니다. 새 페이지에서는 태그별로 정리된 카드 보기로 모든 항목을 표시하며, 이름 검색과 태그 필터링도 기본 제공됩니다. 더 조밀한 구성을 선호한다면 목록 보기로도 전환할 수 있습니다.

이제 즐겨찾기 기능도 지원합니다. 대시보드나 저장된 검색에 별표를 지정하면 목록 페이지 상단에 고정되고, 빠른 접근을 위해 사이드바에도 다시 표시됩니다. 이전과 비슷한 방식이지만, 다른 사용자들의 탐색 영역을 복잡하게 만들지는 않습니다. 또한 목록 페이지에서는 각 카드에 알림 상태 아이콘과 &quot;생성자 / 업데이트한 사용자&quot; 메타데이터도 표시하므로, 누가 무엇을 관리하는지와 현재 어떤 항목에서 알림이 발생 중인지 한눈에 확인할 수 있습니다.

이를 마무리하는 기능으로 새로운 템플릿 갤러리도 추가되었습니다. Node.js, Python, Go, Java의 OTel 런타임 메트릭을 다루는 4개의 사전 구축된 대시보드를 몇 번의 클릭만으로 가져올 수 있습니다. 가져오는 동안 태그와 대상 메트릭 소스를 편집할 수 있으므로 기존 태깅 구조에 바로 맞춰 적용할 수 있습니다.

**관련 PR:** [#1971](https://github.com/hyperdxio/hyperdx/pull/1971) 대시보드 목록 페이지 추가, [#2012](https://github.com/hyperdxio/hyperdx/pull/2012) 저장된 검색 목록 페이지 추가, [#2021](https://github.com/hyperdxio/hyperdx/pull/2021) 대시보드 및 저장된 검색 즐겨찾기 추가, [#2033](https://github.com/hyperdxio/hyperdx/pull/2033) 태그별 대시보드 및 검색 그룹화, [#2031](https://github.com/hyperdxio/hyperdx/pull/2031) 생성/업데이트 메타데이터 표시, [#2053](https://github.com/hyperdxio/hyperdx/pull/2053) 대시보드 목록 페이지에 알림 아이콘 추가, [#2010](https://github.com/hyperdxio/hyperdx/pull/2010) 대시보드 템플릿 갤러리 추가

## 필터를 위한 필터 \{#filters-for-filters\}

*[@pulpdrew](https://github.com/pulpdrew)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Tfe9kJygoEg" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이제 대시보드 변수 필터가 자체 필터 조건을 지원합니다. 활용 사례는 간단합니다. Node.js 대시보드에 &quot;서비스 이름&quot; 드롭다운이 있다면, 해당 드롭다운에는 환경의 모든 서비스가 아니라 Node.js 서비스만 표시되도록 하는 편이 더 적절합니다. 이제 대시보드 변수에 필터 조건을 직접 설정해 표시되는 항목의 범위를 제한할 수 있습니다.

필터 선택기도 다중 선택을 지원하도록 업데이트되었습니다. 서비스를 기준으로 그룹화한 대시보드에서는 드롭다운에서 여러 값을 한 번에 선택할 수 있어 비교가 훨씬 더 실용적입니다.

**관련 PR:** [#1969](https://github.com/hyperdxio/hyperdx/pull/1969) Dashboard 필터에 조건 추가; 필터 다중 선택 지원

## 기본 제공 대시보드용 RBAC \{#rbac-for-predefined-dashboards\}

*[@pulpdrew](https://github.com/pulpdrew)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/AZ94-quHEuw" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이제 역할 기반 접근 제어가 ClickStack의 기본 제공 대시보드에도 적용됩니다. 이전에는 이러한 내장 대시보드가 RBAC를 완전히 무시했기 때문에 할당된 역할과 관계없이 모든 사용자가 접근할 수 있었습니다. 이제 이 문제가 해결되었습니다.

세분화된 읽기 권한은 예상대로 동작합니다. 특정 서비스에 대한 읽기 전용 접근 권한으로 구성된 역할은 사용자가 해당 서비스와 관련된 기본 제공 대시보드만 볼 수 있도록 제한합니다. 해당 역할의 사용자는 대시보드와 해당 필터를 볼 수 있지만, 필터 컨트롤은 편집할 수 없도록 잠깁니다. 데모에서는 이름이 지정된 서비스로 범위가 제한된 &quot;services&quot; 읽기 권한을 가진 사용자 지정 역할과, 해당 역할로 로그인한 사용자가 자신에게 허용된 대시보드와 필터 상태만 정확히 확인하는 모습을 보여줍니다.

## 검색을 위한 최적화 \{#optimizations-for-searching\}

*[@knudtty](https://github.com/knudtty)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/uVD2FKzoHjM" title="YouTube 비디오 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ClickHouse의 &quot;Read in Order&quot; 최적화는 ORDER BY가 테이블의 기본 키(primary key)와 일치할 때 데이터를 순차적으로 읽고 LIMIT에 도달하는 즉시 중단하여 검색 쿼리를 빠르게 처리합니다. 벤치마킹 결과, 그럼에도 더 큰 데이터셋에서는 검색이 여전히 필요 이상으로 많은 데이터를 읽고 있는 것으로 나타났습니다. 문제의 핵심은 순회하는 파트 수에 있습니다. 최적화가 활성화되어 있더라도 테이블이 충분히 크면, 파트가 많아져 ClickHouse가 필요한 것보다 더 많은 데이터를 읽게 됩니다.

해결 방법은 검색 쿼리의 windowed query array 앞에 1분짜리 시간 창을 추가하는 것입니다. 대부분의 검색은 어차피 최근 1분 내 데이터만으로도 충분하므로, 먼저 이 창을 조회하면 거의 즉시 결과를 반환할 수 있습니다. 여기서 아무것도 찾지 못하면 쿼리는 평소처럼 점차 더 넓은 시간 창으로 확장됩니다. 또한 `otel_traces` schema에는 ORDER BY 최적화가 올바르게 적용되지 않고 있었습니다. 타임스탬프 컬럼이 인식되지 않던 `toDateTime(Timestamp)` 표현식을 사용하고 있었기 때문입니다. 이 문제 역시 수정되었습니다.

**관련 PR:** [#2019](https://github.com/hyperdxio/hyperdx/pull/2019) 검색에 1분 창 사용, [#2014](https://github.com/hyperdxio/hyperdx/pull/2014) otel&#95;traces의 optimize order by 문제 수정

## 행 복사 및 구성 가능한 필터 수 \{#copy-row-and-configurable-filter-sizes\}

*[@knudtty](https://github.com/knudtty)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/e_IIKG3f6SE" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이제 행 뷰어에서 &quot;JSON으로 복사&quot; 버튼을 사용할 수 있어, 한 번의 클릭으로 로그 행 전체를 복사할 수 있습니다. 이 버튼은 전체 사이드바 보기에도 표시됩니다. 이 기능은 이 로그가 코드의 어디에서 발생하는지 묻기 위해 행을 LLM 프롬프트에 붙여 넣거나, 모든 텍스트를 일일이 선택하지 않고도 장애 보고서용으로 전체 이벤트를 캡처할 때 유용합니다.

이제 사이드바에서 가져올 필터 키 수를 Query Settings 아래의 팀 설정으로 구성할 수 있습니다. 이전에는 고정된 제한 때문에 데이터세트가 큰 경우 사용 가능한 필터 속성 중 일부만 표시되었습니다. 이제 팀에서 이 제한을 높여 더 많은 리소스 및 로그 속성을 표시할 수 있습니다. 또한 많은 수의 필터 그룹이 표시되더라도 필터 패널이 빠르게 렌더링되도록 가상화도 개선되었습니다.

**관련 PR:** [#2035](https://github.com/hyperdxio/hyperdx/pull/2035) JSON으로 행 복사 버튼 추가, [#2020](https://github.com/hyperdxio/hyperdx/pull/2020) 가져올 필터 수를 위한 새 팀 설정, [#1979](https://github.com/hyperdxio/hyperdx/pull/1979) 중첩된 필터 그룹 가상화

## 대시보드의 탭과 그룹 \{#tabs-and-groups-in-dashboards\}

*[@alex-fedotyev](https://github.com/alex-fedotyev)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/tyumDlJuDTg" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이제 대시보드 타일을 그룹으로 구성할 수 있습니다. 이는 이전의 두 가지 개별 컨테이너 유형(&quot;섹션&quot;과 &quot;그룹&quot;)을 대체하는 방식입니다. 이전 방식에서는 사용할 컨테이너 유형을 미리 결정해야 했습니다. 새로운 단일 그룹 개념은 구성을 더 단순하게 만듭니다. 그룹은 기본적으로 접을 수 있으며, 필요에 따라 테두리를 표시할 수 있고 탭도 추가할 수 있습니다. 각 탭은 자체 타일 집합을 가지며, 타일은 드래그 핸들을 사용해 그룹 사이에서 이동할 수 있습니다.

이 데모에서는 여러 사용자 지정 옵션을 켜거나 끈 그룹을 보여줍니다. 접기 가능 여부, 테두리 표시 여부, 탭 활성화 여부 등이 포함됩니다. 데모 당시에는 해당 PR이 아직 리뷰 중이었고, 디자인 피드백도 수집하고 있었습니다. 이 변경이 반영되면 이전의 두 컨테이너 유형 모델보다 더 유연하고 덜 혼란스러운 구성 요소를 대시보드 작성자에게 제공할 것으로 예상됩니다.

**관련 PR:** [#1972](https://github.com/hyperdxio/hyperdx/pull/1972) 탭 및 접기/테두리 옵션이 있는 대시보드 그룹, [#2015](https://github.com/hyperdxio/hyperdx/pull/2015) 섹션/그룹을 단일 그룹으로 통합

## ClickStack CLI \{#clickstack-cli\}

*[@wrn14897](https://github.com/wrn14897)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/9XqJNhstabw" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ClickStack CLI(`hdx`)는 터미널을 벗어나지 않고 로그와 트레이스를 검색하고, 실시간으로 추적하고, 자세히 살펴볼 수 있는 새로운 터미널 TUI입니다. 브라우저와 동일한 웹 세션 메커니즘을 사용해 HyperDX 인스턴스에 연결하므로 별도로 관리할 API key는 없습니다. 인스턴스 URL과 이메일로 `hdx auth login`을 한 번 실행하면 이후에도 인증 상태가 유지됩니다.

이 TUI는 웹 앱에서 제공되는 검색 인터페이스와 동일한 화면을 제공합니다. 즉, 동일한 쿼리 구문, 동일한 소스 선택, 그리고 개별 로그 항목을 자세히 확인하는 기능을 그대로 사용할 수 있습니다. 주요 특징 중 하나는 트레이스 워터폴 보기입니다. 로그 항목을 클릭하면 전체 분산 트레이스가 터미널에 직접 렌더링되어 표시됩니다. 이 데모에서는 agentic 사용 방식의 초기 실험도 미리 보여줍니다. AI 에이전트에 CLI의 schema 인트로스펙션 출력에 대한 접근 권한과 ClickHouse 프록시를 통해 쿼리를 실행할 수 있는 기능을 함께 제공하면, 에이전트가 문제를 자율적으로 조사할 수 있습니다. 데모는 여기서 더 나아가 에이전트가 웹 세션을 사용해 Playwright로 HyperDX UI를 탐색하고, 렌더링된 차트에서 메트릭을 가져와 로그에서 찾은 내용과 교차 검증하는 모습도 보여줍니다.

**관련 PR:** [#2043](https://github.com/hyperdxio/hyperdx/pull/2043) @hyperdx/cli package 추가 — 이벤트 검색 및 실시간 추적을 위한 터미널 TUI