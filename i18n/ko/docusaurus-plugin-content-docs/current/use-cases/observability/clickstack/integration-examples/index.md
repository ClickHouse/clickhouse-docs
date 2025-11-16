---
'slug': '/use-cases/observability/clickstack/integration-guides'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack을 위한 데이터 수집 - ClickHouse 가시성 스택'
'title': '통합 가이드'
'doc_type': 'landing-page'
'keywords':
- 'ClickStack data ingestion'
- 'observability data ingestion'
- 'ClickStack integration guides'
---

ClickStack는 관찰 가능성 데이터를 ClickHouse 인스턴스에 수집하는 여러 방법을 제공합니다. 이 섹션에는 다양한 로그, 추적 및 메트릭 소스에 대한 빠른 시작 가이드가 포함되어 있습니다.

:::note
이 통합 가이드의 여러 개가 ClickStack의 내장 OpenTelemetry Collector를 사용하여 빠른 테스트를 수행합니다. 프로덕션 배포의 경우, 자체 OTel Collector를 실행하고 데이터를 ClickStack의 OTLP 엔드포인트로 전송하는 것을 권장합니다. 프로덕션 구성에 대한 자세한 내용은 [OpenTelemetry 데이터 전송하기](/use-cases/observability/clickstack/ingesting-data/opentelemetry)를 참조하세요.
:::

| 섹션 | 설명 |
|------|-------------|
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Kafka Metrics에 대한 빠른 시작 가이드 |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Nginx Logs에 대한 빠른 시작 가이드 |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Nginx Traces에 대한 빠른 시작 가이드 |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | PostgreSQL Logs에 대한 빠른 시작 가이드 |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | PostgreSQL Metrics에 대한 빠른 시작 가이드 |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Redis Logs에 대한 빠른 시작 가이드 |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Redis Metrics에 대한 빠른 시작 가이드 |
