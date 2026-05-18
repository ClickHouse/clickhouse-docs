---
slug: /use-cases/observability/clickstack/demo-days/2026/05/2026-05-08
title: '데모 데이 - 2026-05-08'
sidebar_label: '2026-05-08'
pagination_prev: null
pagination_next: null
description: '2026-05-08 ClickStack 데모 데이'
doc_type: 'guide'
keywords: ['ClickStack', '데모 데이']
sidebar_position: -20260508
---

## 웹훅의 시크릿 처리 개선 \{#improved-handling-of-secrets-in-webhooks\}

*[@dhable](https://github.com/dhable)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/aD7sT5dc470" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

웹훅 URL과 헤더에는 자격 증명이 평문으로 그대로 노출되는 경우가 많습니다. Slack 웹훅 URL은 경로에 비밀 토큰이 포함되어 있고, HTTP 웹훅은 일반적으로 인증을 위해 Authorization 헤더가 필요합니다. 이번 릴리스 전까지 HyperDX의 웹훅 목록 조회 및 편집용 내부 API는 이러한 정보를 매 요청마다 모두 반환했기 때문에, 인증된 팀 구성원이라면 누구나 API를 호출하는 것만으로 시크릿을 확인할 수 있었습니다.

이번 변경에서는 공개 API에서 이미 사용 중인 것과 동일한 마스킹 패턴을 적용합니다. 웹훅 URL은 경로가 `****`로 대체된 상태로 반환되므로, Slack 토큰(또는 경로에 포함된 다른 키)이 서버 밖으로 나가지 않습니다. 또한 어떤 헤더에 시크릿이 포함되어 있는지 확실하게 구분할 방법이 없으므로, 기본적으로 헤더도 마스킹되며 모든 값은 `****`로 대체되고 헤더 이름만 표시됩니다.

편집 폼에서는 마스킹된 값을 &quot;변경 없음&quot;으로 처리합니다. 그대로 두면 저장된 값이 유지되고, 변경하면 새 값이 저장되며, 비우면 해당 필드가 완전히 제거됩니다. 이렇게 하면 일반적인 경우(한 필드만 편집하는 경우)에도 작업 흐름이 명확하게 유지되면서, 실제 시크릿이 브라우저를 통해 다시 오가는 일은 방지할 수 있습니다.

**관련 PR:** [#2239](https://github.com/hyperdxio/hyperdx/pull/2239) [HDX-4173] 내부 웹훅 API 응답에서 민감한 필드 마스킹

## 알림의 추가 메타데이터 \{#extra-metadata-in-alerts\}

*[@dhable](https://github.com/dhable)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/evEd7Cc9e1c" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

커뮤니티 Slack에서 알림에 자유 형식의 컨텍스트를 추가해 달라는 요청이 있었습니다. 임계값 이력을 남기거나, 런북 링크를 넣거나, 온콜 담당자를 위한 메모를 적어둘 수 있는 공간이 필요하다는 내용입니다. 이는 AI 요약을 위한 기준 정보로도 유용합니다. 이제 발생 중인 알림에 응답하는 LLM은 쿼리만 보고 의도를 추측하는 대신, 운영자가 직접 남긴 판단 근거를 바탕으로 응답할 수 있습니다.

메모 필드는 Markdown으로 렌더링할 수 있으므로 접을 수 있는 섹션, 목록, 링크를 모두 사용할 수 있습니다. 이 필드는 알림 구성에 포함되며, 알림이 표시되는 모든 곳에 함께 나타납니다. UX는 아직 완전히 확정된 것은 아닙니다. 현재의 Markdown 표면은 출발점이며, 어떻게 렌더링되는 것이 좋을지에 대한 피드백을 환영합니다.

이번 PR에서는 저장된 검색의 발생 중인 알림 UX도 함께 다듬었습니다. Alerts 버튼의 벨 아이콘에는 알림이 발생 중일 때 빨간 점이 표시되고, 대화 상자에서는 단순히 링크만 보여주는 대신 어떤 알림이 활성 상태인지 강조해서 보여줍니다. 또한 같은 상태에 대해 대시보드 타일에서 이미 사용하는 방식과 시각적 표현도 이제 일치합니다.

**관련 PR:** [#2210](https://github.com/hyperdxio/hyperdx/pull/2210) [HDX-3044] 알림에 선택적 메모 필드 추가

## 가능한 테마 \{#possible-themes\}

*[@elizabetdev](https://github.com/elizabetdev)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/JZYGz6ZOPf4" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이는 ClickStack UI에 IDE에서 영감을 받은 3가지 테마, 즉 Nord(북유럽의 차가운 블루 톤), Catppuccin(파스텔), One Dark(Atom 스타일)를 라이트 및 다크 버전으로 도입한 해커톤 실험이었습니다. 이름이 있는 원본 테마에서 생성한 색상 토큰을 적용해 거의 원하는 수준까지 구현했지만, 사이드바 색상과 줄 대비에는 여전히 정리가 필요한 부분이 조금 남아 있었습니다.

이 PR은 결국 머지되지 않고 닫혔습니다. 팀은 현재 단일 테마만 지원하는 ClickUI로 방향을 옮기고 있으며, 여러 개의 토큰 세트를 병렬로 유지하려면 지속적인 관리 작업이 필요합니다. 특히 각 조합의 대비를 제대로 점검하기 시작하면 그 부담은 더 커집니다. 따라서 ClickUI 자체에서 다중 테마를 지원할 때까지는 보류하기로 했습니다.

이 실험에서 나온 디자인 원칙 중 하나는 나중에 다시 검토하게 될 때 염두에 둘 만하다고 판단했습니다. 첫 번째 버전에서는 테마마다 HyperDX 로고 색상을 다시 입혔는데, 그 결과 브랜드 정체성이 희석되었습니다. 더 깔끔한 접근 방식은 다음과 같습니다. 라이트 테마에는 어두운 로고를, 다크 테마에는 밝은 로고를 표시하고, 초록색 HyperDX 워드마크 자체는 그대로 유지합니다.

**관련 PR:** [#2191](https://github.com/hyperdxio/hyperdx/pull/2191) feat: IDE에서 영감을 받은 테마 추가(Nord, Catppuccin, One Dark)