---
slug: /use-cases/observability/clickstack/demo-days/2026/04/10-04-2026
title: "데모 데이 - 10/04/2026"
sidebar_label: "10/04/2026"
pagination_prev: null
pagination_next: null
description: "10/04/2026 ClickStack 데모 데이"
doc_type: "guide"
keywords: ["ClickStack", "데모 데이"]
---

## 고정할 수 있는 데이터 소스 필터 \{#pinnable-datasource-filters\}

*[@brandon-pereira](https://github.com/brandon-pereira)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/j-b1ztSl8IQ" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이제 팀은 데이터 소스 필터를 고정하고 팀 전체에서 공유할 수 있습니다. 필터의 고정 아이콘을 클릭하면 본인에게만 고정할지, 모두와 공유할지를 선택할 수 있습니다. 공유된 필터는 필터 목록 상단의 전용 섹션에 표시되므로, 정확한 필터 이름을 몰라도 모든 팀원이 쉽게 찾아 적용할 수 있습니다.

이는 커뮤니티에서 가장 많이 요청된 기능 중 하나였습니다. 이제 팀은 필터 구성을 별도로 전달할 필요가 없습니다. 공유된 필터는 고정되는 즉시 모든 사용자에게 표시되며, 필터 키뿐 아니라 특정 필터 값도 공유할 수 있으므로 필터에 필요한 전체 맥락까지 함께 전달됩니다.

**관련 PR:** [#2047](https://github.com/hyperdxio/hyperdx/pull/2047) [HDX-2300] 팀 전체에서 필터를 더 잘 보고 쉽게 찾을 수 있도록 Shared Filters 도입

## ClickStack Cloud에서 서비스 깨우기 \{#waking-service-from-clickstack-cloud\}

*[@brandon-pereira](https://github.com/brandon-pereira)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Od7X0NOCqY0" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이제 ClickStack Cloud 사용자는 앱 내부에서 직접 잠든 서비스를 깨울 수 있습니다. 이전에는 서비스가 절전 상태로 전환되면 &quot;재시도&quot; 프롬프트가 표시되었지만, 앱이 실제로 서비스를 대신 깨우지는 못했습니다. ClickStack Cloud로 이동해 수동으로 서비스를 깨운 다음, 다시 돌아와 직접 재시도를 눌러야 했습니다.

이제는 앱이 이 과정을 엔드투엔드로 처리합니다. 서비스가 절전 상태이면 프롬프트에 &quot;서비스 깨우기&quot;라고 표시되며, 현재 보고 있는 화면을 벗어나지 않고도 전체 프로세스가 진행됩니다. 작지만 편의성을 높여 주는 개선으로, 워크플로를 방해하던 번거로운 여러 단계의 중단을 없애 줍니다. 특히 한동안 활동이 없다가 ClickStack에 다시 들어와 곧바로 데이터를 확인하려는 경우 더욱 유용합니다.

## AI 기능의 일관된 활성화 \{#consistent-enabling-of-ai-features\}

*[@brandon-pereira](https://github.com/brandon-pereira)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/zS5OekPCzC0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이제 ClickStack의 AI 기능은 ClickHouse Cloud 컨트롤 플레인에서만 전환되며, ClickHouse Cloud가 단일 기준점 역할을 합니다. 이전에는 서로 분리된 두 개의 체크박스가 있었습니다. 하나는 ClickStack 컨트롤 플레인에 있었고, 다른 하나는 앱 내부에 있었습니다. 한쪽만 활성화해도 다른 쪽과 동기화된다는 보장이 없었기 때문에, AI가 실제로 활성화된 상태인지 혼란이 있었습니다.

이제 ClickStack 내부의 체크박스는 ClickHouse Cloud로 연결되는 링크 역할만 하며, 그 외에는 비활성화되어 있습니다. ClickHouse Cloud에서 토글을 전환하면 해당 기능을 ClickStack에서 자동으로 사용할 수 있습니다. 이를 통해 AI 기능 활성화 방식이 일관되고 예측 가능해졌으며, 실제 동작을 제어하는 설정이 무엇인지 더 이상 헷갈릴 필요가 없습니다.

## Raw SQL 알림 \{#raw-sql-alerting\}

*[@pulpdrew](https://github.com/pulpdrew)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/bYYcYHkyy2E" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이제 Raw SQL 꺾은선 차트에서도 알림을 사용할 수 있습니다. 기존 Raw SQL 차트 기능이 확장되어 임계값 기반 알림을 지원합니다. 사용자 지정 SQL 쿼리를 기반으로 하는 꺾은선 차트가 있다면 여기에 알림을 연결하고, 다른 차트 알림과 동일한 방식으로 설정할 수 있습니다. 현재는 임계값 비교가 작동하려면 인터벌과 날짜 범위 매개변수가 모두 필요하므로, 꺾은선 차트와 막대 차트에서만 사용할 수 있습니다.

이를 통해 매우 강력한 활용 사례를 구현할 수 있습니다. 데모에서는 현재 인터벌의 오류 수를 계산한 뒤 이전 30개 인터벌과 비교하여, 값이 과거 기준보다 표준편차 2개 이상 높을 때 이를 표시하는 쿼리를 보여줍니다. 이와 같은 통계적 이상 탐지는 이제 적절한 SQL을 작성하고 임계값만 설정하면 됩니다. 알림 설정은 차트 편집기 안의 접을 수 있는 섹션에 배치되어 있어, 실제로 필요할 때까지 UI를 깔끔하게 유지합니다.

**관련 PR:** [#2073](https://github.com/hyperdxio/hyperdx/pull/2073) feat: Raw SQL 기반 대시보드 타일용 알림 구현, [#2085](https://github.com/hyperdxio/hyperdx/pull/2085) refactor: TileAlertEditor component 생성

## HyperDX TUI 개선 사항 \{#hyperdx-tui-improvements\}

*[@wrn14897](https://github.com/wrn14897)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/cIigBpcrYlw" title="YouTube 비디오 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

HyperDX 터미널 UI는 계속해서 더 쉽게 시작할 수 있도록 개선되고 있습니다. 이제 `npm install -g @hyperdx/cli`로 전역 설치한 후 `hdx`를 실행해 시작할 수 있습니다. `--tui` 플래그를 사용하면 대화형 터미널 인터페이스를 바로 열 수 있습니다. `hdx` 실행 파일도 `npm`을 통해 제공되므로, 패키지를 설치한 뒤에는 별도의 설치 단계가 필요하지 않습니다.

이번 주에는 설치 개선과 함께 눈에 띄는 기능 두 가지도 추가되었습니다. 이제 오류 메시지가 터미널에서 적절한 강조 표시와 구조화된 형식으로 렌더링되며, 웹 프런트엔드의 포맷과 일치하므로 브라우저와 TUI 중 어느 쪽을 사용하든 동일한 수준의 세부 정보를 확인할 수 있습니다. 또한 새 SQL 미리보기 기능이 추가되어 실제로 실행되는 쿼리를 확인할 수 있습니다. 여기에 더해 이벤트 뷰어에서 `Shift+A`를 눌러 새 알림 페이지에 접근할 수 있으며, 터미널을 벗어나지 않고도 구성된 모든 알림과 최근 트리거 이력을 한눈에 볼 수 있습니다.

**관련 PR:** [#2095](https://github.com/hyperdxio/hyperdx/pull/2095) [HDX-3966] TUI 오류 메시지 렌더링 개선 및 SQL 미리보기 추가, [#2093](https://github.com/hyperdxio/hyperdx/pull/2093) [HDX-3969] 개요 및 최근 이력이 포함된 알림 페이지(Shift+A) 추가, [#2043](https://github.com/hyperdxio/hyperdx/pull/2043) [HDX-3919] @hyperdx/cli 패키지 추가, [#2101](https://github.com/hyperdxio/hyperdx/pull/2101) [HDX-3976] CLI: 대화형 로그인 흐름과 함께 apiUrl에서 appUrl로 마이그레이션