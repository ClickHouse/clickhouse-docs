---
slug: /use-cases/observability/clickstack/demo-days/2026/2026-05-29
title: '데모 데이 - 2026-05-29'
sidebar_label: '2026-05-29'
sidebar_position: -20260529
pagination_prev: null
pagination_next: null
description: 'ClickStack 데모 데이 - 2026-05-29'
doc_type: 'guide'
keywords: ['ClickStack', '데모 데이']
---

## 버전을 고려한 개선된 스키마 필터링 \{#version-aware-improved-schema-filtering\}

*[@knudtty](https://github.com/knudtty)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/bAVaBnfJ82Y" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이제 ClickStack은 direct&#95;read 최적화를 ClickHouse 26.2 이상 버전에서만 적용합니다. 이 버전부터는 전문 검색 인덱스가 오픈소스 스키마에 추가된 alias 컬럼을 올바르게 지원하기 때문입니다. 이전에는 이 최적화가 제대로 동작하지 않는 구버전에서도 시도될 수 있었습니다. 버전 확인은 스키마를 검사해 쿼리 시점에 수행되며, alias 컬럼 자체도 이제 기본적으로 오픈소스 스키마에 포함됩니다.

함께 소개된 내용: 자동 완성용 materialized view를 텍스트 인덱스에 대한 직접 쿼리로 대체하는 작업도 진행 중입니다. 현재는 두 방식이 겹치는 작업을 수행하고 있어 수집 부하를 늘리고 있습니다. 벤치마크 결과 텍스트 인덱스 쿼리가 성능 면에서도 충분히 견고한 것으로 확인되면, materialized view는 단순화하거나 제거할 수 있습니다. Aaron은 또한 향후 ClickHouse 텍스트 인덱스 버전에서 위치 인코딩이 키-값 필터 lookup의 정확도를 한층 더 높일 수 있는 방식에 대해 팀의 질문에 답했습니다.

**관련 PR:** [#2341](https://github.com/hyperdxio/hyperdx/pull/2341) feat: logs 및 traces에 기본적으로 direct&#95;read 최적화 추가, [#2405](https://github.com/hyperdxio/hyperdx/pull/2405) feat(common-utils): SQL 필터에 direct&#95;read KV items 최적화 적용, [#2376](https://github.com/hyperdxio/hyperdx/pull/2376) feat: 텍스트 인덱스를 사용해 필터와 자동 완성 지원

## 더 나은 로그 파싱 \{#better-log-parsing\}

*[@dhable](https://github.com/dhable)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/vhkMlddahu4" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

한 고객의 logs에서는 이벤트 본문이 `level` 필드를 포함한 JSON 객체였습니다. 심각도 추론 로직은 두 가지를 수행하고 있었습니다. 본문을 JSON으로 파싱해 속성을 추출하고, OTel 단계에서 심각도가 설정되지 않은 경우에는 문자열 매칭으로 추론을 보완했습니다. 그런데 이 문자열 매칭이 본문 내부 알림 관리자 이름에 들어 있던 &quot;alert&quot;라는 단어를 잡아내면서 로그 수준을 잘못 분류하고 있었습니다.

이 수정에서는 보호 조건을 추가했습니다. 본문이 JSON으로 파싱되고 이미 level 필드를 포함하고 있다면 문자열 기반 추론 단계는 아예 건너뜁니다. 약 1년 전에 구축한 스모크 테스트 모음이 있었기 때문에, 새 테스트 케이스만 추가해도 수정 사항을 쉽게 검증하고 관련 경계 사례까지 잡아낼 수 있었습니다. 이는 바로 그런 목적을 위해 설계된 테스트였습니다.

**관련 PR:** [#2363](https://github.com/hyperdxio/hyperdx/pull/2363) fix(log-parser): body가 level 필드를 포함한 JSON으로 파싱될 때 문자열 추론 건너뛰기

## MCP Server 개선 사항 \{#mcp-server-improvements\}

*[@brandon-pereira](https://github.com/brandon-pereira)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/aIy1zfmlz3Y" title="YouTube 비디오 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이번 주에는 MCP 관련 여러 개선 사항이 적용되었습니다. 이벤트 pattern 버킷화 및 점수화가 개선되었고, 오류 힌트가 향상되었으며, 공용 헬퍼도 정리되었습니다. 또한 제품명에 맞게 도구 프리픽스가 `hyperdx_`에서 `clickstack_`로 변경되었습니다.

**관련 PR:** [#2337](https://github.com/hyperdxio/hyperdx/pull/2337) feat(mcp): MCP 도구 품질 개선 — 오류 힌트, 공용 헬퍼, 더 나은 메시지, [#2396](https://github.com/hyperdxio/hyperdx/pull/2396) refactor(mcp): 도구 프리픽스를 hyperdx&#95;에서 clickstack&#95;로 변경, [#2343](https://github.com/hyperdxio/hyperdx/pull/2343) feat(mcp): patch&#95;dashboard, get&#95;dashboard&#95;tile, search&#95;dashboards 도구 추가, [#2418](https://github.com/hyperdxio/hyperdx/pull/2418) fix(mcp): 읽기 쉬운 차트 범례를 위한 alias 설명 및 예시 개선, [#2412](https://github.com/hyperdxio/hyperdx/pull/2412) refactor: 공용 헬퍼와 스키마 수준 검사를 사용해 MCP ObjectId 검증 단순화

## 새로운 시리즈 색상 팔레트 \{#new-series-color-palette\}

*[@elizabetdev](https://github.com/elizabetdev)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/YzECP3diWvg" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Elizabet은 Alex의 색상 선택기 작업을 지원하기 위해 HyperDX와 ClickStack 테마 전반에서 데이터 시각화 색상 팔레트를 통합하는 작업을 진행했습니다. 기존에는 두 테마가 각각 별도의 팔레트를 사용했고, 테마별 예외 규칙도 있어 색상 체계를 이해하기가 불필요하게 복잡했습니다. 목표는 두 테마 모두에 공통으로 적용할 수 있는 단일 팔레트를 만드는 것이었습니다.

대비와 접근성을 확인하기 위해 색각 시뮬레이션 도구를 사용해 업계 표준 팔레트(Tableau, Observable, IBM)와 비교 테스트도 진행했습니다. ClickHouse 팔레트는 결과가 좋지 않았습니다 — 녹색이 흰색 배경에서 충분한 대비를 제공하지 못했습니다. Tableau와 Observable도 각각 최소 한 가지 검사에서 실패했고, IBM 팔레트는 모든 검사를 통과했지만 색상이 5개뿐이라 충분하지 않았습니다. 전체적으로는 Observable 팔레트가 가장 적합했으며, 파란색을 조금 조정한 버전을 이제 두 테마에서 공통으로 사용하게 됩니다.

**관련 PR:** [#2362](https://github.com/hyperdxio/hyperdx/pull/2362) refactor(theme): chart palette tokens를 색조 이름으로 변경하고 테마 전반에서 통합

## 고정 헤더를 갖춘 새로운 페이지 레이아웃 \{#new-page-layout-with-sticky-header\}

*[@elizabetdev](https://github.com/elizabetdev)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/e7d3ocqi4Ac" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

새로운 PageHeader와 PageLayout 컴포넌트 조합이 대시보드, 서비스 맵, 클라이언트 세션, Kubernetes, ClickHouse 대시보드 등 주요 페이지 전반에 적용되었습니다. 이제 모든 페이지는 동일한 패딩, 헤더 아래의 경계선, 제목 구조를 사용합니다. 이전에는 페이지마다 구성이 일관되지 않았습니다. 어떤 페이지는 왼쪽에 제목이 있고 오른쪽에 컨트롤이 있었지만, 어떤 페이지는 제목 자체가 없었습니다.

고정 동작은 prop을 통해 선택적으로 활성화할 수 있습니다. sticky 슬롯에 전달한 내용은 스크롤하는 동안 헤더 아래에 계속 고정되며, 나머지 요소는 일반적으로 스크롤됩니다. 아무것도 전달하지 않으면 breadcrumbs나 페이지 옵션만 자동으로 고정됩니다.

**관련 PR:** [#2282](https://github.com/hyperdxio/hyperdx/pull/2282) PageHeader/PageLayout 추가 및 Sessions 마이그레이션, [#2345](https://github.com/hyperdxio/hyperdx/pull/2345) 목록 페이지에서 PageHeader 제목 사용, [#2346](https://github.com/hyperdxio/hyperdx/pull/2346) Service Map을 PageLayout으로 마이그레이션, [#2347](https://github.com/hyperdxio/hyperdx/pull/2347) Kubernetes 대시보드를 PageLayout으로 마이그레이션, [#2348](https://github.com/hyperdxio/hyperdx/pull/2348) ClickHouse 대시보드를 PageLayout으로 마이그레이션, [#2364](https://github.com/hyperdxio/hyperdx/pull/2364) feat(대시보드): 고정 쿼리 도구 모음이 있는 PageLayout으로 마이그레이션, [#2394](https://github.com/hyperdxio/hyperdx/pull/2394) fix(PageHeader): 고정 헤더가 drawer 오버레이 아래에 유지되도록 수정

## 새 데이터 소스 선택기와 시리즈 색상 선택 \{#new-datasource-selector-and-color-picking-for-series\}

*[@alex-fedotyev](https://github.com/alex-fedotyev)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/DKfJs9onl50" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Alex가 진행한 두 가지 UI 개선 사항입니다. 데이터 소스 선택기가 더 깔끔하게 정리되었습니다. 이제 선택기를 클릭하면 선택 가능한 데이터 소스만 표시됩니다. 스키마 보기나 새 소스 생성 같은 관리 작업은 별도의 케밥 메뉴로 옮겼습니다. 이를 통해 선택과 구성을 분리했으며, 이는 오랫동안 할 일 목록에 있던 항목이자 팀 피드백을 반영한 변경입니다.

이제 Number 타일에도 정적 색상 선택기가 추가되어 메트릭에 특정 색상을 지정할 수 있습니다. 임계값이나 컬럼을 기준으로 빨간색, 초록색, 노란색으로 바뀌는 조건부 색상 규칙도 현재 개발 중입니다. Elizabet의 통합 팔레트가 적용되면 두 기능 모두 현재의 &quot;color 1, 2, 3&quot; 레이블 대신 적절한 이름이 붙은 색상을 사용하게 되며, 이는 Grafana 같은 도구에서 넘어오는 사용자에게 특히 의미 있는 개선이 될 것입니다.

**관련 PR:** [#2365](https://github.com/hyperdxio/hyperdx/pull/2365) feat(source-picker): chip + kebab menu UX, [#2265](https://github.com/hyperdxio/hyperdx/pull/2265) feat(app): number tile static color picker

## 대시보드 작업을 위한 더 나은 힌트 \{#better-hints-for-dashboard-actions\}

*[@alex-fedotyev](https://github.com/alex-fedotyev)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/yQaKMSXp8YA" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이제 대시보드 테이블 타일의 행에 더 유용한 호버 상태가 표시됩니다. 마우스를 올리면 커서와 아이콘이 바뀌어 클릭 시 어떤 일이 일어나는지 알 수 있습니다. 즉, 연결된 대시보드를 열거나 데이터 소스로 드릴다운합니다. 이 변경 전에는 행 자체가 클릭 가능하다는 점조차 분명하지 않았고, 클릭했을 때 어떤 동작을 하는지도 알기 어려웠습니다.

**관련 PR:** [#2321](https://github.com/hyperdxio/hyperdx/pull/2321) feat(app): 대시보드 테이블 타일 행 클릭에 대한 호버 힌트 및 네이티브 링크 표시 개선