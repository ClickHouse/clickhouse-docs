---
slug: /use-cases/observability/clickstack/demo-days/2026/2026-05-22
title: '데모 데이 - 2026-05-22'
sidebar_label: '2026-05-22'
sidebar_position: -20260522
pagination_prev: null
pagination_next: null
description: 'ClickStack 데모 데이 - 2026-05-22'
doc_type: 'guide'
keywords: ['ClickStack', '데모 데이']
---

## ClickCannon 데이터 생성 업데이트 \{#clickcannon-data-generation-update\}

*[@SpencerTorres](https://github.com/SpencerTorres)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Zljd07_4uF4" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

[ClickCannon](https://github.com/clickhouse/clickcannon)은 내부에서 용량 산정 작업에 사용하는 도구입니다. 대량의 OpenTelemetry 데이터를 생성하는 동시에 여러 쿼리를 병렬로 실행하여, 주어진 수집 및 쿼리 작업 부하에 고객에게 어느 정도의 리소스가 필요한지 추정합니다. OpenHouse에서 이를 공개적으로 발표했으며, Spencer가 최신 버전을 소개했습니다.

이제 디스크에 데이터를 미리 구성해 둘 필요 없이 생성기를 인라인으로 설정할 수 있습니다. 생성기를 활성화한 뒤 스레드 수, 블록당 행 수, 전체 초당 행 수, 그리고 몇 가지 메모리 제약 조건을 설정하면 됩니다. 예전에는 먼저 디스크에 2테라바이트의 테스트 데이터를 준비해야 했기 때문에 이 도구를 공유하기가 어려웠지만, 이제 그럴 필요가 없습니다.

앞으로는 더 많은 사용자가 자체 용량 산정 작업에 ClickCannon을 활용할 수 있도록 안내할 예정입니다. 저장소는 [https://github.com/clickhouse/clickcannon](https://github.com/clickhouse/clickcannon)에 있습니다.

## 전체 화면 타일 및 소스 범위 필터용 날짜 입력 \{#date-input-for-full-screen-tiles-and-source-scoped-filters\}

*[@pulpdrew](https://github.com/pulpdrew)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Mop1EYtGwKc" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

서로 연관된 두 가지 대시보드 개선 사항이 함께 적용되었습니다. 이제 단일 타일을 전체 화면으로 열면 대시보드 자체의 시간 범위와 독립적으로 동작하는 전용 시간 선택기와 세분화 수준 선택기를 사용할 수 있습니다. 즉, 특정 메트릭 하나(예를 들어 ClickHouse 클러스터 대시보드의 차트 하나)의 긴 이력을 자세히 살펴보더라도 대시보드의 다른 모든 타일을 강제로 갱신할 필요가 없습니다. 이제 브라우저 탭 제목에도 대시보드 이름이 표시됩니다.

두 번째는 대시보드 필터의 소스 범위 지정 기능입니다. 필터를 모든 타일에 전역적으로 적용하는 대신, 특정 소스를 기반으로 하는 타일에만 전파되도록 제한할 수 있습니다. 예를 들어 로그와 트레이스를 함께 사용하는 혼합 소스 대시보드에서는, 필터가 적용되지 않아야 할 타일로 흘러들어가지 않도록 할 수 있습니다.

**관련 PR:** [#2302](https://github.com/hyperdxio/hyperdx/pull/2302) feat: 소규모 대시보드 개선, [#2331](https://github.com/hyperdxio/hyperdx/pull/2331) feat: 대시보드 필터에 소스 범위 지정 추가

## `lower(Body)`에서 인식되는 text index \{#text-index-recognised-on-lower-body\}

*[@pulpdrew](https://github.com/pulpdrew)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/l0GpNBP859o" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

대소문자를 구분하지 않는 검색의 정확성을 개선하는, 작지만 실질적인 수정입니다. 소스에 전처리기 인수 없이 `lower(Body)`에 대해 정의된 text index가 있으면, 이전에는 쿼리 플래너가 `hasAllTokens(Body, ...)` 조건을 생성했습니다. 이 표현식은 인덱스 표현식과 일치하지 않았기 때문에 text index가 사용되지 않았고, 쿼리는 스캔으로 폴백되었습니다.

이제 쿼리는 `hasAllTokens(lower(Body), ...)`로 생성되며, 이는 인덱스 표현식과 일치합니다. 따라서 이렇게 구성된 소스에서는 대소문자를 구분하지 않는 검색이 이제 text index로 올바르게 가속됩니다.

**관련 PR:** [#2326](https://github.com/hyperdxio/hyperdx/pull/2326) feat: 전처리기 없이 lower(Body)의 text index 지원

## 더 간편해진 Event Deltas 사용 경험 \{#simpler-event-deltas-experience\}

*[@alex-fedotyev](https://github.com/alex-fedotyev)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/BrIHHFz_Aw8" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

이전에는 Event Deltas를 사용하려면 한 단계가 더 필요했습니다. 히트맵에서 선택 영역을 드래그하기 전에 버튼을 클릭해 비교 모드로 전환해야 했습니다. 이제는 그 단계가 없어졌습니다. 페이지가 로드되면 즉시 분포 막대가 표시되고, 히트맵에서 영역을 드래그하는 순간 막대가 선택 영역과 배경을 비교하는 모드로 전환됩니다. 선택 영역 바깥을 클릭하면 전체 스팬 보기로 돌아갑니다.

이 변경 사항 자체는 몇 주 전에 이미 OSS에 반영되었지만, 그중 일부는 Managed ClickStack에 누락되어 있었습니다. 이제 그 차이도 해소되어 더 간단한 흐름이 두 에디션에서 모두 동일하게 제공됩니다.

**관련 PR:** [#1899](https://github.com/hyperdxio/hyperdx/pull/1899) feat: 항상 켜져 있는 속성 분포 모드

## 대시보드 목차 및 일괄 접기 \{#dashboard-table-of-contents-and-bulk-collapse\}

*[@teeohhem](https://github.com/teeohhem)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Pojo5zf_hrE" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

대시보드의 섹션 수가 몇 개를 넘어 많아지면(대규모 대시보드를 구성하는 핵심 단위가 섹션이므로 이는 바람직합니다) 탐색이 불편해집니다. Tom은 모든 섹션을 나열하고 원하는 섹션으로 바로 이동할 수 있는 오른쪽 레일 목차를 추가했습니다. 또한 모든 섹션의 내용을 한 번에 숨기거나 다시 펼칠 수 있는 일괄 접기/펼치기 컨트롤도 추가되어, 긴 대시보드를 끝까지 스크롤하지 않고도 전체 구조를 훑어볼 수 있습니다.

아직 초안 단계이지만, ClickHouse 클러스터 및 Kubernetes 보기를 위해 제공하는 다중 섹션 대시보드에서 이미 유용하게 활용되고 있습니다.

**관련 PR:** [#2350](https://github.com/hyperdxio/hyperdx/pull/2350) feat(dashboard): 목차 오른쪽 레일과 일괄 접기/펼치기 추가

## 세션 간 컬럼 크기 조정 유지 \{#column-resize-persisted-across-sessions\}

*[@teeohhem](https://github.com/teeohhem)의 데모*

<iframe width="768" height="432" src="https://www.youtube.com/embed/7l-Rz1tFlq8" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

어제 고객이 제보한 내용입니다. 결과 테이블에서 컬럼 크기를 조정하면, 조정한 크기가 유지되어야 한다는 것이었습니다. 이제는 그렇게 동작합니다. 조정된 너비는 테이블 ID를 키로 로컬 스토리지에 저장되므로, 서로 다른 테이블은 각자의 컬럼 레이아웃을 독립적으로 유지합니다. 브라우저를 닫았다가 나중에 다시 열어도 컬럼은 마지막으로 설정한 상태 그대로입니다. 또한 테이블에서 컬럼을 추가하거나 제거해도 다른 컬럼의 너비는 초기화되지 않습니다.

**관련 PR:** [#2327](https://github.com/hyperdxio/hyperdx/pull/2327) 수정: 검색 결과 테이블의 컬럼 너비 유지