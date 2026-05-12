---
slug: /cloud/managed-postgres/monitoring/prometheus
sidebar_label: 'Prometheus 엔드포인트'
title: 'Managed Postgres Prometheus 엔드포인트'
description: 'Managed Postgres 메트릭을 Prometheus, Grafana, Datadog 또는 OpenMetrics 호환 collector로 수집합니다'
keywords: ['managed postgres', 'prometheus', 'grafana', 'datadog', '메트릭', 'openmetrics', '관측성']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# Prometheus 연동 \{#prometheus-integration\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="monitoring-prometheus" />

Managed Postgres는 [ClickHouse Cloud API][cloud-api]를 통해
Prometheus와 호환되는 2개의 메트릭 엔드포인트를 노출합니다

| 엔드포인트 | 경로                                                     | 반환값                               |
| ----- | ------------------------------------------------------ | --------------------------------- |
| 조직    | `/v1/organizations/{orgId}/postgres/prometheus`        | 조직 내 모든 Managed Postgres 서비스의 메트릭 |
| 인스턴스  | `/v1/organizations/{orgId}/postgres/{pgId}/prometheus` | 단일 서비스의 메트릭                       |

:::note
조직 수준 엔드포인트는 최대 100개 서비스의 메트릭을 반환합니다. 조직에
Managed Postgres 서비스가 100개를 초과하는 경우 [지원팀에
문의하십시오](https://clickhouse.com/support/program).
:::

## 인증 \{#authentication\}

이 엔드포인트에서는 다른 OpenAPI와 동일한 [API 키]를 사용합니다. 이를 생성하고
조직 및 서비스 ID를 확인하는 방법은
[OpenAPI 가이드](/cloud/managed-postgres/openapi)를 참조하십시오.

```bash
KEY_ID=mykeyid
KEY_SECRET=mykeysecret
ORG_ID=myorgid
PG_ID=mypgid
```

## 조직 내 모든 서비스 스크레이핑 \{#scrape-org\}

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/prometheus"
```

## 단일 서비스 스크레이핑 \{#scrape-instance\}

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/prometheus"
```

## 예시 응답 \{#sample-response\}

```response
# HELP PostgresServiceInfo Information about PostgreSQL service, including status and version.
# TYPE PostgresServiceInfo gauge
PostgresServiceInfo{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres",postgres_status="running",postgres_version="18"} 1

# HELP PostgresServer_ActiveConnections Number of active connections by state.
# TYPE PostgresServer_ActiveConnections gauge
PostgresServer_ActiveConnections{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres",state="active"} 1
PostgresServer_ActiveConnections{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres",state="idle"} 4

# HELP PostgresServer_CacheHitRatio Buffer cache hit ratio: blocks served from cache vs. total blocks accessed (%).
# TYPE PostgresServer_CacheHitRatio gauge
PostgresServer_CacheHitRatio{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres"} 100
```

전체 메트릭 목록과 각 메트릭의 의미는
[메트릭 참고 문서](/cloud/managed-postgres/monitoring/metrics)를 참조하십시오.

## Prometheus 설정 \{#configuring-prometheus\}

이 구성은 30초마다 조직 수준 엔드포인트를 스크레이프하도록 설정되어 있습니다:

```yaml
scrape_configs:
  - job_name: "managed-postgres"
    scheme: https
    metrics_path: "/v1/organizations/<ORG_ID>/postgres/prometheus"
    static_configs:
      - targets: ["api.clickhouse.cloud"]
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
    honor_labels: true
    scrape_interval: 30s
```

`honor_labels: true`를 설정하여 엔드포인트의 `postgres_service` 및
`postgres_service_name` 레이블이 Prometheus에 의해 덮어써지지 않고 유지되도록
하십시오.

단일 서비스를 스크레이프하려면 `metrics_path`에 `/<PG_ID>`를 추가하십시오.

## Grafana 및 Datadog와 통합하기 \{#third-party-integrations\}

이 엔드포인트는 [ClickHouse Prometheus
엔드포인트](/integrations/prometheus)와 동일한 형식을 따르므로, 해당 문서에
설명된 Grafana Cloud, Grafana
Alloy 및 Datadog OpenMetrics agent 구성도
여기에서 그대로 적용할 수 있습니다. `metrics_path`는 ClickHouse 경로 대신 Managed Postgres 조직 또는
인스턴스 경로를 가리키도록 설정하십시오.

[cloud-api]: /cloud/manage/cloud-api "Cloud API"

[API keys]: /cloud/manage/openapi "API 키 관리"