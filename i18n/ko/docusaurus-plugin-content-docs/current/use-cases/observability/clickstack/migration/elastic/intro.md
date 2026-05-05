---
slug: /use-cases/observability/clickstack/migration/elastic/intro
title: 'Elastic에서 ClickStack으로 마이그레이션'
pagination_prev: null
pagination_next: null
sidebar_label: '개요'
sidebar_position: 0
description: 'Elastic에서 ClickHouse 관측성 스택(ClickStack)으로 마이그레이션하는 개요'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'guide'
---

## Elastic에서 ClickStack으로 마이그레이션 \{#migrating-to-clickstack-from-elastic\}

이 가이드는 Elastic Stack에서 마이그레이션하려는 사용자, 특히 Elastic Agent로 수집되어 Elasticsearch에 저장된 로그, 트레이스, 메트릭을 Kibana로 모니터링하는 사용자를 대상으로 합니다. ClickStack에서의 대응되는 개념과 데이터 유형을 정리하고, Kibana의 Lucene 기반 쿼리를 HyperDX 구문으로 변환하는 방법을 설명하며, 원활한 전환을 위해 데이터와 에이전트 모두를 마이그레이션하는 방법을 안내합니다.

마이그레이션을 시작하기 전에 ClickStack과 Elastic Stack 간의 트레이드오프를 이해하는 것이 중요합니다.

다음과 같은 경우 ClickStack으로 이전하는 것을 고려하는 것이 좋습니다:

- 대량의 관측성 데이터를 수집하고 있으며, 비효율적인 압축과 낮은 리소스 활용도로 인해 Elastic 비용이 과도하다고 느낍니다. ClickStack은 원시 데이터에 대해 최소 10배 이상의 압축률을 제공하여 스토리지와 컴퓨팅 비용을 크게 절감할 수 있습니다.
- 대규모 환경에서 검색 성능이 좋지 않거나 수집(ingestion) 단계에서 병목 현상을 겪고 있습니다.
- SQL을 사용해 관측성 시그널과 비즈니스 데이터를 연관시키고, 관측성과 분석 워크플로를 통합하고자 합니다.
- OpenTelemetry 사용에 이미 투자했으며 벤더 종속을 피하고자 합니다.
- ClickHouse Cloud의 스토리지와 컴퓨트 분리 구조를 활용하여 사실상 무제한에 가까운 확장성을 확보하고, 유휴 기간에는 수집 컴퓨트와 객체 스토리지 비용만 지불하기를 원합니다.

다만, 다음과 같은 경우 ClickStack이 적합하지 않을 수 있습니다:

- 관측성 데이터를 주로 보안 용도로 사용하며, SIEM 중심의 제품이 필요합니다.
- Universal profiling이 워크플로에서 매우 중요한 요소입니다.
- 비즈니스 인텔리전스(BI) 대시보드 플랫폼이 필요합니다. ClickStack은 의도적으로 SRE와 개발자를 위한 특정 시각화 워크플로를 제공하며, Business Intelligence(BI) 도구로 설계되지 않았습니다. 동등한 기능이 필요하다면 [Grafana의 ClickHouse 플러그인](/integrations/grafana) 또는 [Superset](/integrations/superset) 사용을 권장합니다.