---
'slug': '/use-cases/observability/clickstack/migration/elastic/intro'
'title': 'Elastic에서 ClickStack으로 마이그레이션하기'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '개요'
'sidebar_position': 0
'description': 'Elastic에서 ClickHouse Observability Stack으로 마이그레이션하는 개요'
'show_related_blogs': true
'keywords':
- 'Elasticsearch'
'doc_type': 'guide'
---

## Elastic에서 ClickStack으로 마이그레이션하기 {#migrating-to-clickstack-from-elastic}

이 가이드는 Elastic Stack에서 마이그레이션하는 사용자를 위한 것으로, 특히 Kibana를 사용하여 Elastic Agent를 통해 수집된 로그, 추적 및 메트릭을 모니터링하고 Elasticsearch에 저장하는 사용자에게 적합합니다. ClickStack의 동등한 개념과 데이터 유형을 설명하고, Kibana Lucene 기반 쿼리를 HyperDX의 구문으로 변환하는 방법을 설명하며, 원활한 전환을 위한 데이터 및 에이전트 마이그레이션에 대한 지침을 제공합니다.

마이그레이션을 시작하기 전에 ClickStack과 Elastic Stack 간의 트레이드오프를 이해하는 것이 중요합니다.

ClickStack으로 이동하는 것을 고려해야 하는 경우:

- 대량의 관찰 가능성 데이터를 수집하고 있으며 비효율적인 압축 및 자원 활용으로 인해 Elastic이 비용 부담이 되는 경우. ClickStack은 원시 데이터에서 최소 10배 압축을 제공함으로써 저장소 및 컴퓨팅 비용을 크게 줄일 수 있습니다.
- 대규모에서 검색 성능이 좋지 않거나 수집 병목현상을 겪고 있는 경우.
- SQL을 사용하여 관찰 가능성 신호를 비즈니스 데이터와 상관관계 있게 연결하고자 하며, 관찰 가능성 및 분석 워크플로우를 통합하고자 하는 경우.
- OpenTelemetry에 전념하며 공급업체 종속을 피하고 싶어하는 경우.
- ClickHouse Cloud에서 스토리지와 컴퓨팅의 분리를 이용해 사실상 무한한 확장을 원하며, 유휴 기간 동안 수집 컴퓨팅 및 객체 저장소에 대해서만 비용을 지불하고자 하는 경우.

하지만 ClickStack이 적합하지 않을 수 있는 경우:

- 보안 사용 사례를 주로 위해 관찰 가능성 데이터를 사용하는 경우 및 SIEM 중심의 제품이 필요한 경우.
- 범용 프로파일링이 워크플로우의 중요한 부분인 경우.
- 비즈니스 인텔리전스(BI) 대시보드 플랫폼이 필요한 경우. ClickStack은 SRE 및 개발자를 위한 의견이 반영된 시각적 워크플로우를 의도적으로 갖추고 있으며 비즈니스 인텔리전스(BI) 도구로 설계되지 않았습니다. 동등한 기능을 위해서는 [ClickHouse 플러그인이 포함된 Grafana](/integrations/grafana) 또는 [Superset](/integrations/superset)을 사용하는 것을 추천합니다.
