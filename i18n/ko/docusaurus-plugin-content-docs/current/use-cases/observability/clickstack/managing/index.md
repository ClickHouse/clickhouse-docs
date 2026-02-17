---
slug: /use-cases/observability/clickstack/managing
title: 'ClickStack 관리'
pagination_prev: null
pagination_next: null
sidebar_label: 'ClickStack 관리'
description: 'ClickStack 관리'
doc_type: 'guide'
keywords: ['ClickStack 관리', '성능', 'materialized views', '관리 명령']
---

이 섹션에서는 ClickStack 관리 방법을 설명합니다.

## 관리 가이드 \{#admin-guides\}

| 섹션 | 설명 |
|--------|-------------|
| [기본 관리](/use-cases/observability/clickstack/admin) | ClickStack에서 일반적인 관리 작업을 수행하는 방법을 소개합니다. |
| [프로덕션 환경 준비](/use-cases/observability/clickstack/production) | 프로덕션 환경에서 ClickStack을 실행하기 전에 권장 단계와 모범 사례를 설명합니다. |
| [Materialized views](/use-cases/observability/clickstack/materialized_views) | ClickStack에서 materialized view를 사용하여 쿼리 성능을 향상시키는 방법을 자세히 설명합니다. |
| [성능 튜닝](/use-cases/observability/clickstack/performance_tuning) | 대규모 워크로드에 맞게 ClickStack을 튜닝하는 방법을 종합적으로 안내합니다. |

## 핵심 ClickHouse 개념 \{#core-concepts\}

대부분의 ClickStack 관리 작업은 기반이 되는 ClickHouse 데이터베이스에 대한 이해를 필요로 합니다. 운영 또는 성능 관련 작업을 수행하기 전에 아래에 정리된 핵심 ClickHouse 개념을 검토하는 것이 좋습니다.

| 개념 | 설명 |
|---------|-------------|
| **테이블** | ClickStack 데이터 소스가 기반 ClickHouse 테이블에 매핑되는 방식입니다. ClickHouse 테이블은 주로 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 엔진을 사용합니다. |
| **파트** | 데이터가 불변의 파트로 기록되고 시간이 지나면서 병합(머지)되는 방식입니다. |
| **파티션** | 데이터 관리, 쿼리, 최적화를 단순화하는 테이블 파트의 논리적 그룹입니다. |
| **머지** | 쿼리되는 파트 수를 줄이고 성능을 유지하기 위해 파트를 병합하는 백그라운드 프로세스입니다. |
| **그래뉼** | 쿼리 실행 중에 읽히고 프루닝이 수행되는 최소 데이터 단위입니다. |
| **프라이머리(정렬) 키** | `ORDER BY` 키가 디스크 상의 데이터 레이아웃, 압축, 쿼리 프루닝 동작을 정의하는 방식입니다. |

이러한 개념은 ClickHouse 성능의 기초가 되며, ClickStack을 관리할 때 운영 관련 의사결정을 내리는 데 도움을 줍니다.