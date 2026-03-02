---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'ClickStack - ClickHouse 관측성 스택을 위한 데이터 수집'
title: '통합 가이드'
doc_type: 'landing-page'
keywords: ['ClickStack 데이터 수집', '관측성 데이터 수집', 'ClickStack 통합 가이드']
---

ClickStack은 ClickHouse 인스턴스로 관측성 데이터를 수집하는 다양한 방법을 제공합니다. 이 섹션에는 여러 로그, 트레이스 및 메트릭 소스에 대한 빠른 시작 가이드가 포함되어 있습니다.

:::note
이러한 통합 가이드 중 일부는 빠른 테스트 및 평가를 위해 ClickStack Open Source의 내장 OpenTelemetry Collector를 사용합니다.

프로덕션 배포의 경우, 워크로드에 가까운 위치에서 OpenTelemetry Collector 에이전트로 통합을 실행하는 것을 권장합니다. 이러한 에이전트는 OTLP를 통해 텔레메트리 데이터를 ClickStack OpenTelemetry Collector로 전달해야 하며, 이후 ClickStack Open Source 배포의 경우 자가 관리형 ClickHouse 인스턴스로, 또는 Managed ClickStack으로 데이터를 전달합니다. 프로덕션 구성에 대해서는 ["OpenTelemetry 데이터 전송"](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참조하십시오.
:::

| 섹션 | 설명 |
|------|-------------|
| [일반 호스트 로그](/use-cases/observability/clickstack/integrations/host-logs) | 호스트 시스템 로그 수집 |
| [EC2 호스트 로그](/use-cases/observability/clickstack/integrations/host-logs/ec2) | EC2 인스턴스 로그 모니터링 |
| [Rotel을 사용한 AWS Lambda 로그](/use-cases/observability/clickstack/integrations/aws-lambda) | Rotel로 Lambda 로그 전달 |
| [AWS CloudWatch](/use-cases/observability/clickstack/integrations/aws-cloudwatch-logs) | CloudWatch 로그 그룹 전달 |
| [JVM 메트릭](/use-cases/observability/clickstack/integrations/jvm-metrics) | JVM 성능 모니터링 |
| [Kafka 메트릭](/use-cases/observability/clickstack/integrations/kafka-metrics) | Kafka 성능 모니터링 |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | K8s 클러스터 모니터링 |
| [MySQL 로그](/use-cases/observability/clickstack/integrations/mysql-logs) | MySQL 슬로우 쿼리/오류 로그 수집 |
| [Nginx 로그](/use-cases/observability/clickstack/integrations/nginx) | Nginx 액세스/오류 로그 수집 |
| [Nginx 트레이스](/use-cases/observability/clickstack/integrations/nginx-traces) | Nginx HTTP 요청 추적 |
| [Node.js 트레이스](/use-cases/observability/clickstack/integrations/nodejs-traces) | Node.js HTTP 요청 추적 |
| [PostgreSQL 로그](/use-cases/observability/clickstack/integrations/postgresql-logs) | Postgres 로그 수집 |
| [PostgreSQL 메트릭](/use-cases/observability/clickstack/integrations/postgresql-metrics) | Postgres 성능 모니터링 |
| [Redis 로그](/use-cases/observability/clickstack/integrations/redis) | Redis 서버 로그 수집 |
| [Redis 메트릭](/use-cases/observability/clickstack/integrations/redis-metrics) | Redis 성능 모니터링 |
| [Systemd 로그](/use-cases/observability/clickstack/integrations/systemd-logs) | Systemd/Journald 로그 수집 |
| [Temporal 메트릭](/use-cases/observability/clickstack/integrations/temporal-metrics)| Temporal Cloud 메트릭 모니터링 |