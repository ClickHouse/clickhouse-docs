---
slug: /use-cases/observability
title: '관측성'
pagination_prev: null
pagination_next: null
description: '관측성 사용 사례 가이드 랜딩 페이지'
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

ClickHouse는 관측성 워크로드에서 속도, 확장성, 비용 효율성 측면에서 타의 추종을 불허합니다. 이 가이드는 필요에 따라 선택할 수 있는 두 가지 경로를 제시합니다:

## ClickStack - ClickHouse 관측성 스택 \{#clickstack\}

ClickHouse Observability Stack은 대부분의 사용자에게 **권장하는 접근 방식**입니다.

**ClickStack**은 ClickHouse와 OpenTelemetry (OTel)를 기반으로 구축된 프로덕션급 관측성 플랫폼으로, 로그, 트레이스, 메트릭 및 세션 데이터를 단일 고성능 확장형 솔루션으로 통합하여 단일 노드 배포부터 **여러 페타바이트** 규모까지 지원합니다.

| Section | Description |
|---------|-------------|
| [Overview](/use-cases/observability/clickstack/overview) | ClickStack과 주요 기능 소개 |
| [Getting Started](/use-cases/observability/clickstack/getting-started) | 빠른 시작 안내 및 기본 설정 방법 |
| [Example Datasets](/use-cases/observability/clickstack/sample-datasets) | 샘플 데이터셋과 사용 사례 |
| [Architecture](/use-cases/observability/clickstack/architecture) | 시스템 아키텍처 및 구성 요소 개요 |
| [Deployment](/use-cases/observability/clickstack/deployment) | 배포 가이드 및 옵션 |
| [Configuration](/use-cases/observability/clickstack/config) | 상세 설정 옵션 및 구성 방법 |
| [Ingesting Data](/use-cases/observability/clickstack/ingesting-data) | ClickStack으로 데이터를 수집하는 방법 |
| [Search](/use-cases/observability/clickstack/search) | 관측성 데이터를 검색하고 쿼리하는 방법 |
| [Production](/use-cases/observability/clickstack/production) | 프로덕션 배포 모범 사례 |

## 사용자 정의 스택 구축 \{#build-your-own-stack\}

**맞춤 요구 사항**(예: 고도로 특화된 수집 파이프라인, 스키마 설계, 극단적인 확장 요구 등)이 있는 사용자를 위해 ClickHouse를 핵심 데이터베이스로 사용하는 사용자 정의 관측성(observability) 스택을 구축하는 방법을 안내합니다.

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | 이 가이드는 로그와 트레이스를 중심으로 ClickHouse를 활용해 자체 관측성 솔루션을 구축하려는 경우를 대상으로 합니다.                                             |
| [Schema design](/use-cases/observability/schema-design)          | 로그와 트레이스를 위해 자체 스키마를 생성하는 것이 권장되는 이유와, 이를 구현할 때의 모범 사례를 제공합니다.                                                  |
| [Managing data](/observability/managing-data)          | 관측성을 위한 ClickHouse 배포는 필연적으로 대규모 데이터셋을 포함하게 되며, 이를 관리해야 합니다. ClickHouse는 데이터 관리를 지원하는 다양한 기능을 제공합니다.           |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | ClickHouse와 함께 OpenTelemetry를 사용하여 로그와 트레이스를 수집하고 내보내는 방법을 다룹니다.                                                           |
| [Using Visualization Tools](/observability/grafana)    | HyperDX와 Grafana를 포함한 ClickHouse용 관측성 시각화 도구를 사용하는 방법을 설명합니다.                                       |
| [Demo Application](/observability/demo-application)    | 로그와 트레이스를 위해 ClickHouse와 함께 동작하도록 포크된 OpenTelemetry Demo Application을 살펴봅니다.                                           |