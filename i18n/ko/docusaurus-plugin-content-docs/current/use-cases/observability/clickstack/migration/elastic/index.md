---
slug: /use-cases/observability/clickstack/migration/elastic
title: 'Elastic에서 ClickStack으로 마이그레이션'
pagination_prev: null
pagination_next: null
description: 'Elastic에서 ClickHouse 관측성 스택으로 마이그레이션하기 위한 랜딩 페이지'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'landing-page'
---

이 가이드는 Elastic Stack에서 ClickStack으로 마이그레이션하는 데 필요한 포괄적인 접근 방식을 제공합니다. 관측성 워크로드에서 ClickHouse의 강점을 활용하면서 위험을 최소화할 수 있는 병행 운영 전략에 초점을 둡니다. 

| 섹션 | 설명 |
|---------|-------------|
| [Introduction](/use-cases/observability/clickstack/migration/elastic/intro) | 마이그레이션 과정과 주요 고려 사항에 대한 개요 |
| [Concepts](/use-cases/observability/clickstack/migration/elastic/concepts) | Elastic과 ClickStack 간의 대응 개념 이해 |
| [Types](/use-cases/observability/clickstack/migration/elastic/types) | Elasticsearch 타입을 ClickHouse의 대응 개념에 매핑 |
| [Search](/use-cases/observability/clickstack/migration/elastic/search) | 검색 기능과 쿼리 구문 비교 |
| [Migrating Data](/use-cases/observability/clickstack/migration/elastic/migrating-data) | 데이터 마이그레이션 및 병행 운영 전략 |
| [Migrating Agents](/use-cases/observability/clickstack/migration/elastic/migrating-agents) | Elastic 에이전트에서 OpenTelemetry로 전환 |
| [Migrating SDKs](/use-cases/observability/clickstack/migration/elastic/migrating-sdks) | Elastic APM 에이전트를 OpenTelemetry SDKS로 대체 |