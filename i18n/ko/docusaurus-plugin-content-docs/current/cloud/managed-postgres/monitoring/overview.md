---
slug: /cloud/managed-postgres/monitoring/overview
sidebar_label: '개요'
title: 'Managed Postgres 모니터링'
description: 'ClickHouse Managed Postgres에서 사용할 수 있는 모니터링 및 관측성 옵션 개요'
keywords: ['managed postgres', '모니터링', '관측성', '메트릭', '대시보드', 'prometheus', '쿼리 인사이트', 'pg_stat_ch']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

# Managed Postgres 모니터링 \{#managed-postgres-monitoring\}

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.monitoring-overview-beta" />

다음 방법으로 Managed Postgres 서비스를 모니터링할 수 있습니다:

| Section                                                              | Description                                                                   | Setup required           |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| [대시보드](/cloud/managed-postgres/monitoring/dashboard)                 | 리소스 사용량과 데이터베이스 활동을 보여주는 기본 제공 Cloud Console 차트                               | 없음                       |
| [쿼리 인사이트](/cloud/managed-postgres/monitoring/query-insights)  | statement별 텔레메트리: 영향도 기준으로 모든 쿼리 패턴의 순위를 매기고 진단용 Counter를 제공합니다               | 없음                       |
| [Prometheus endpoint](/cloud/managed-postgres/monitoring/prometheus) | 메트릭을 Prometheus, Grafana, Datadog 또는 OpenMetrics와 호환되는 모든 collector로 스크레이프합니다 | API key + scraper config |
| [메트릭 참고](/cloud/managed-postgres/monitoring/metrics)                 | Prometheus endpoint에서 노출되는 메트릭의 전체 목록으로, 타입, 레이블, 의미를 포함합니다                   | 해당 없음                    |

## 빠른 시작 \{#quick-start\}

Cloud Console을 열고 아무 Managed Postgres 인스턴스의 **Monitoring** 탭으로 이동하면 CPU, 메모리, IOPS,
연결, 트랜잭션, 캐시 적중률, 교착 상태의 실시간 차트를 확인할 수 있습니다. 별도
설정은 필요하지 않습니다.

쿼리별 텔레메트리 — 지연 시간 백분위수, 캐시와 디스크 읽기,
임시 스필, 병렬 worker 활용도, WAL 볼륨 — 를 보려면 동일한
인스턴스의 [Query Insights](/cloud/managed-postgres/monitoring/query-insights) 탭을
여십시오. 호스트 수준 메트릭을 자체
관측성 스택으로 가져오려면
[Prometheus endpoint](/cloud/managed-postgres/monitoring/prometheus)를 사용하십시오.