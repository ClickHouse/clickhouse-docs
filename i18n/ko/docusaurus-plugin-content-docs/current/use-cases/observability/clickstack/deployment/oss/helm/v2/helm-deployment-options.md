---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options
title: 'Helm 배포 옵션'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Helm을 사용한 ClickStack의 고급 배포 구성'
doc_type: 'guide'
keywords: ['ClickStack 배포 옵션', '외부 ClickHouse', '외부 OTel', '최소 배포', 'Helm 구성']
---

:::warning 차트 버전 2.x
이 페이지에서는 **v2.x** 서브차트 기반 Helm 차트를 설명합니다. 아직 v1.x 인라인 템플릿 차트를 사용 중이라면 [Helm 배포 옵션 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1)을 참조하십시오. 마이그레이션 단계는 [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)를 참조하십시오.
:::

이 가이드는 Helm을 사용한 ClickStack의 고급 배포 옵션을 다룹니다. 기본 설치는 [기본 Helm 배포 가이드](/docs/use-cases/observability/clickstack/deployment/helm)를 참조하십시오.

## 개요 \{#overview\}

ClickStack의 Helm 차트는 여러 배포 구성을 지원합니다:

* **전체 스택** (기본값) — 모든 구성 요소가 포함되며, 오퍼레이터가 관리합니다
* **External ClickHouse** — 기존 ClickHouse 클러스터를 사용합니다
* **External OTel collector** — 기존 OTel 인프라를 사용합니다
* **최소 배포** — HyperDX만 포함되며, 외부 의존성을 사용합니다

## 외부 ClickHouse \{#external-clickhouse\}

기존 ClickHouse 클러스터(ClickHouse Cloud 포함)가 있으면 내장 ClickHouse를 비활성화하고 외부 인스턴스에 연결할 수 있습니다.

### 옵션 1: 인라인 설정(개발/테스트) \{#external-clickhouse-inline\}

빠른 테스트 또는 비프로덕션 환경에서는 이 방식을 사용하세요. `hyperdx.config` 및 `hyperdx.secrets`를 통해 연결 정보를 제공하세요:

```yaml
# values-external-clickhouse.yaml
clickhouse:
  enabled: false  # Disable the operator-managed ClickHouse

hyperdx:
  secrets:
    CLICKHOUSE_PASSWORD: "your-password"
    CLICKHOUSE_APP_PASSWORD: "your-password"

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

프로덕션 환경에 배포할 때 자격 증명을 Helm 구성과 분리해서 관리하려면 다음과 같이 진행하십시오.

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

  #### Helm이 시크릿을 사용하도록 구성 \{#configure-helm-secret\}

  ```yaml
  # values-external-clickhouse-secret.yaml
  clickhouse:
    enabled: false

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

ClickHouse Cloud에서는 다음과 같습니다:

```yaml
# values-clickhouse-cloud.yaml
clickhouse:
  enabled: false

hyperdx:
  secrets:
    CLICKHOUSE_PASSWORD: "your-cloud-password"
    CLICKHOUSE_APP_PASSWORD: "your-cloud-password"

  useExistingConfigSecret: true
  existingConfigSecret: "clickhouse-cloud-config"
  existingConfigConnectionsKey: "connections.json"
  existingConfigSourcesKey: "sources.json"
```

## 외부 OTel collector \{#external-otel-collector\}

기존 OTel collector 인프라를 사용 중인 경우 서브차트를 비활성화하십시오:

```yaml
# values-external-otel.yaml
otel-collector:
  enabled: false  # Disable the subchart OTEL collector

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-external-otel.yaml
```

인그레스를 통해 OTel collector 엔드포인트를 노출하는 방법은 [Ingress Configuration](/docs/use-cases/observability/clickstack/deployment/helm-configuration#otel-collector-ingress)을 참조하십시오.

## 최소 배포 \{#minimal-deployment\}

기존 인프라를 이미 갖춘 조직이라면 HyperDX만 배포하면 됩니다:

```yaml
# values-minimal.yaml
clickhouse:
  enabled: false

otel-collector:
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

* [구성 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 키, 시크릿, 인그레스 설정
* [Cloud 배포](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE, EKS, AKS별 구성
* [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x에서 v2.x로 마이그레이션
* [추가 매니페스트](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - 사용자 지정 Kubernetes 객체
* [메인 Helm 가이드](/docs/use-cases/observability/clickstack/deployment/helm) - 기본 설치
* [배포 옵션 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - v1.x 배포 옵션