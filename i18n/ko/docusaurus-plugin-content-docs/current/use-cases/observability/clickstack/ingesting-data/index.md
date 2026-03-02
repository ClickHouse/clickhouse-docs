---
slug: /use-cases/observability/clickstack/ingesting-data
pagination_prev: null
pagination_next: null
description: 'ClickStack용 데이터 수집 - ClickHouse 관측성 스택'
title: '데이터 수집'
doc_type: 'landing-page'
keywords: ['ClickStack 데이터 수집', '관측성 데이터 수집
', 'ClickStack OpenTelemetry', 'ClickHouse 관측성 수집', '텔레메트리 데이터 수집']
---

관리형 및 오픈 소스 배포 형태의 ClickStack은 관측성 데이터를 ClickHouse 인스턴스로 수집하는 여러 가지 방법을 제공합니다. 로그, 메트릭, 트레이스, 세션 데이터를 수집하는 경우 OpenTelemetry(OTel) collector를 단일 수집 지점으로 사용하거나, 특정 사용 사례에 맞는 플랫폼별 통합을 활용할 수 있습니다.

| Section | Description |
|------|-------------|
| [Overview](/use-cases/observability/clickstack/ingesting-data/overview) | 데이터 수집 방법과 아키텍처 소개 |
| [Ingesting data with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) | OpenTelemetry를 사용하면서 ClickStack과 빠르게 연동하려는 사용자용 |
| [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) | ClickStack OpenTelemetry collector에 대한 고급 세부 정보 |
| [Ingesting data with Vector](/use-cases/observability/clickstack/ingesting-data/vector) | Vector를 사용하면서 ClickStack과 빠르게 연동하려는 사용자용 |
| [Tables and Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) | ClickStack에서 사용하는 ClickHouse 테이블 및 해당 스키마 개요 |
| [Language SDKs](/use-cases/observability/clickstack/sdks) | 프로그래밍 언어에 계측을 추가하고 텔레메트리 데이터를 수집하기 위한 ClickStack SDK |