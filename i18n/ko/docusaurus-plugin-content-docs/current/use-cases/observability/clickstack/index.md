---
slug: /use-cases/observability/clickstack
title: 'ClickStack - ClickHouse 관측성 스택'
pagination_prev: null
pagination_next: null
description: 'ClickHouse 관측성 스택 랜딩 페이지'
keywords: ['ClickStack', 'observability stack', 'HyperDX', 'OpenTelemetry', 'logs', 'traces', 'metrics']
doc_type: 'landing-page'
---

**ClickStack**은 ClickHouse와 OpenTelemetry (OTel)를 기반으로 구축된 오픈 소스, 프로덕션급 관측성 플랫폼으로, 로그, 트레이스, 메트릭, 세션을 단일 고성능 솔루션에서 통합합니다. 이를 통해 개발자와 SRE는 도구를 전환하거나 데이터를 수동으로 상관 분석하지 않고도 복잡한 시스템을 엔드 투 엔드로 모니터링하고 디버깅할 수 있습니다.

ClickStack은 두 가지 방식으로 배포할 수 있습니다. **ClickStack Open Source**에서는 ClickHouse, ClickStack UI(HyperDX), OpenTelemetry Collector를 포함한 모든 컴포넌트를 직접 실행하고 관리합니다. **Managed ClickStack**에서는 인증과 운영 관련 문제를 포함하여 ClickHouse와 ClickStack UI(HyperDX)가 ClickHouse Cloud에서 완전 관리되며, 워크로드에서 생성되는 텔레메트리를 수신하여 OTLP를 통해 ClickHouse Cloud로 전달하는 OpenTelemetry Collector만 실행하면 됩니다.

| Section | Description |
|---------|-------------|
| [Overview](/use-cases/observability/clickstack/overview) | ClickStack 및 주요 기능 소개 |
| [Getting Started](/use-cases/observability/clickstack/getting-started) | 빠른 시작 가이드와 기본 설정 방법 |
| [Sample Datasets](/use-cases/observability/clickstack/sample-datasets) | 샘플 데이터셋 및 활용 예시 |
| [Architecture](/use-cases/observability/clickstack/architecture) | 시스템 아키텍처 및 컴포넌트 개요 |
| [Deployment](/use-cases/observability/clickstack/deployment) | 배포 가이드 및 옵션 |
| [Configuration](/use-cases/observability/clickstack/config) | 상세 설정 옵션 및 구성 방법 |
| [Ingesting Data](/use-cases/observability/clickstack/ingesting-data) | ClickStack으로 데이터를 수집하기 위한 가이드라인 |
| [Search](/use-cases/observability/clickstack/search) | 관측성 데이터를 검색하고 쿼리하는 방법 |
| [Production](/use-cases/observability/clickstack/production) | 프로덕션 배포 모범 사례 |