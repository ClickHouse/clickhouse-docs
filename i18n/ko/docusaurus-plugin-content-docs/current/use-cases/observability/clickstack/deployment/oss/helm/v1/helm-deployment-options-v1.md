---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options-v1
title: 'Helm 배포 옵션 (v1.x)'
pagination_prev: null
pagination_next: null
sidebar_position: 12
description: 'v1.x ClickStack Helm 차트의 고급 배포 구성'
doc_type: 'guide'
keywords: ['ClickStack 배포 옵션', '외부 ClickHouse', '외부 OTel', '최소 배포', 'Helm 구성']
---

:::warning 지원 중단 — v1.x 차트
이 페이지에서는 유지 관리 모드인 **v1.x** 인라인 템플릿 방식의 Helm 차트에 대한 배포 옵션을 설명합니다. v2.x 차트는 [Helm 배포 옵션](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options)을 참조하십시오. 마이그레이션하려면 [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)를 참조하십시오.
:::

이 가이드에서는 Helm을 사용해 ClickStack를 배포할 때의 고급 옵션을 다룹니다. 기본 설치 방법은 [기본 Helm 배포 가이드](/docs/use-cases/observability/clickstack/deployment/helm-v1)를 참조하십시오.

## 개요 \{#overview\}

ClickStack의 Helm 차트는 여러 배포 구성을 지원합니다:

* **전체 스택** (기본값) - 모든 구성 요소 포함
* **외부 ClickHouse** - 기존 ClickHouse 클러스터 사용
* **외부 OTel collector** - 기존 OTel 인프라 사용
* **최소 배포** - HyperDX만 포함, 의존성은 외부 사용

## 외부 ClickHouse \{#external-clickhouse\}

기존 ClickHouse 클러스터(ClickHouse Cloud 포함)를 사용 중인 경우, 내장 ClickHouse를 비활성화하고 외부 인스턴스에 연결할 수 있습니다.

### 옵션 1: 인라인 구성(개발/테스트) \{#external-clickhouse-inline\}

빠른 테스트나 비프로덕션 환경에서는 이 방식을 사용하십시오:

```yaml
# values-external-clickhouse.yaml
clickhouse:
  enabled: false  # Disable the built-in ClickHouse

otel:
  clickhouseEndpoint: "tcp://your-clickhouse-server:9000"
  clickhousePrometheusEndpoint: "http://your-clickhouse-server:9363"  # Optional

hyperdx:
  defaultConnections: |
    [
      {
        "name": "External ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
```

다음 구성으로 설치하세요:

```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```

### 옵션 2: 외부 시크릿(프로덕션 권장) \{#external-clickhouse-secret\}

프로덕션 배포에서 자격 증명을 Helm 구성과 분리해 관리하려는 경우:

<VerticalStepper headerlevel="h4">
  #### 설정 파일 생성 \{#create-configuration\}

  ```bash
  # connections.json 생성
  cat <<EOF > connections.json
  [
    {
      "name": "Production ClickHouse",
      "host": "https://your-production-clickhouse.com",
      "port": 8123,
      "username": "hyperdx_user",
      "password": "your-secure-password"
    }
  ]
  EOF

  # sources.json 생성
  cat <<EOF > sources.json
  [
    {
      "from": {
        "databaseName": "default",
        "tableName": "otel_logs"
      },
      "kind": "log",
      "name": "Logs",
      "connection": "Production ClickHouse",
      "timestampValueExpression": "TimestampTime",
      "displayedTimestampValueExpression": "Timestamp",
      "implicitColumnExpression": "Body",
      "serviceNameExpression": "ServiceName",
      "bodyExpression": "Body",
      "eventAttributesExpression": "LogAttributes",
      "resourceAttributesExpression": "ResourceAttributes",
      "severityTextExpression": "SeverityText",
      "traceIdExpression": "TraceId",
      "spanIdExpression": "SpanId"
    },
    {
      "from": {
        "databaseName": "default",
        "tableName": "otel_traces"
      },
      "kind": "trace",
      "name": "Traces",
      "connection": "Production ClickHouse",
      "timestampValueExpression": "Timestamp",
      "displayedTimestampValueExpression": "Timestamp",
      "implicitColumnExpression": "SpanName",
      "serviceNameExpression": "ServiceName",
      "traceIdExpression": "TraceId",
      "spanIdExpression": "SpanId",
      "durationExpression": "Duration"
    }
  ]
  EOF
  ```

  #### Kubernetes 시크릿 생성 \{#create-kubernetes-secret\}

  ```bash
  kubectl create secret generic hyperdx-external-config \
    --from-file=connections.json=connections.json \
    --from-file=sources.json=sources.json

  # 로컬 파일 정리
  rm connections.json sources.json
  ```

  #### 시크릿을 사용하도록 Helm 설정 \{#configure-helm-secret\}

  ```yaml
  # values-external-clickhouse-secret.yaml
  clickhouse:
    enabled: false

  otel:
    clickhouseEndpoint: "tcp://your-clickhouse-server:9000"
    clickhousePrometheusEndpoint: "http://your-clickhouse-server:9363"

  hyperdx:
    useExistingConfigSecret: true
    existingConfigSecret: "hyperdx-external-config"
    existingConfigConnectionsKey: "connections.json"
    existingConfigSourcesKey: "sources.json"
  ```

  ```shell
  helm install my-clickstack clickstack/clickstack -f values-external-clickhouse-secret.yaml
  ```
</VerticalStepper>

### ClickHouse Cloud 사용 \{#using-clickhouse-cloud\}

ClickHouse Cloud에서는:

```yaml
# values-clickhouse-cloud.yaml
clickhouse:
  enabled: false
  persistence:
    enabled: false

otel:
  clickhouseEndpoint: "tcp://your-cloud-instance.clickhouse.cloud:9440?secure=true"

hyperdx:
  useExistingConfigSecret: true
  existingConfigSecret: "clickhouse-cloud-config"
  existingConfigConnectionsKey: "connections.json"
  existingConfigSourcesKey: "sources.json"
```

## 외부 OTel collector \{#external-otel-collector\}

기존 OTel collector 인프라를 사용 중인 경우:

```yaml
# values-external-otel.yaml
otel:
  enabled: false  # Disable the built-in OTEL collector

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-external-otel.yaml
```

인그레스를 통해 OTel collector 엔드포인트를 노출하는 방법은 [인그레스 구성](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#otel-collector-ingress)을 참조하십시오.

## 최소 배포 \{#minimal-deployment\}

기존 인프라를 이미 갖춘 조직은 HyperDX만 배포하세요:

```yaml
# values-minimal.yaml
clickhouse:
  enabled: false

otel:
  enabled: false

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"

  # Option 1: Inline (for testing)
  defaultConnections: |
    [
      {
        "name": "External ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]

  # Option 2: External secret (production)
  # useExistingConfigSecret: true
  # existingConfigSecret: "my-external-config"
  # existingConfigConnectionsKey: "connections.json"
  # existingConfigSourcesKey: "sources.json"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-minimal.yaml
```

## 다음 단계 \{#next-steps\}

* [구성 가이드 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - API 키, 시크릿 및 인그레스 설정
* [Cloud 배포 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - GKE, EKS 및 AKS별 구성
* [주요 Helm 가이드 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - 기본 설치
* [배포 옵션 (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - v2.x 배포 옵션
* [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x에서 v2.x로 마이그레이션