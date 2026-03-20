---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options
title: 'Helm 배포 옵션'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Helm을 사용한 ClickStack 고급 배포 구성'
doc_type: 'guide'
keywords: ['ClickStack 배포 옵션', '외부 ClickHouse', '외부 OTel', '최소 배포', 'Helm 구성']
---

이 가이드는 Helm을 사용한 ClickStack의 고급 배포 옵션을 다룹니다. 기본 설치는 [Helm 기본 배포 가이드](/docs/use-cases/observability/clickstack/deployment/helm)를 참고하십시오.

## 개요 \{#overview\}

ClickStack의 Helm 차트는 여러 배포 구성을 지원합니다:

- **풀 스택**(기본값) - 모든 구성 요소 포함
- **외부 ClickHouse** - 기존 ClickHouse 클러스터 사용
- **외부 OTel collector** - 기존 OTel 인프라 사용
- **최소 배포** - HyperDX만 포함하고, 외부 종속성 사용

## External ClickHouse \{#external-clickhouse\}

기존에 ClickHouse 클러스터(ClickHouse Cloud 포함)가 있는 경우, 내장 ClickHouse를 비활성화하고 외부 ClickHouse 인스턴스에 연결할 수 있습니다.

### 옵션 1: 인라인 설정(개발/테스트) \{#external-clickhouse-inline\}

빠른 테스트나 비운영 환경에서 이 방식을 사용하십시오.

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

다음 구성으로 설치하십시오:

```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```


### 옵션 2: 외부 시크릿(운영 환경 권장) \{#external-clickhouse-secret\}

운영 환경에 배포할 때 자격 증명을 Helm 구성과 분리해 두고자 하는 경우 다음 단계를 따르십시오:

<VerticalStepper headerlevel='h4'>

#### 설정 파일을 생성합니다 \{#create-configuration\}
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

#### Kubernetes 시크릿을 생성합니다 \{#create-kubernetes-secret\}
```bash
kubectl create secret generic hyperdx-external-config \
  --from-file=connections.json=connections.json \
  --from-file=sources.json=sources.json

# 로컬 파일 정리하기
rm connections.json sources.json
```

#### Helm이 시크릿을 사용하도록 구성합니다 \{#configure-helm-secret\}
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

### ClickHouse Cloud 사용하기 \{#using-clickhouse-cloud\}

특히 ClickHouse Cloud의 경우:

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

이미 구축된 OTel collector 인프라가 있는 경우:

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

인그레스를 통해 OTel collector 엔드포인트를 노출하는 방법은 [인그레스 구성](/docs/use-cases/observability/clickstack/deployment/helm-configuration#otel-collector-ingress)을 참조하십시오.


## 최소 배포 \{#minimal-deployment\}

이미 인프라를 보유한 조직은 HyperDX만 배포하십시오.

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

- [구성 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 키, 시크릿, 인그레스 설정
- [Cloud 배포](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE, EKS, AKS별 구성
- [기본 Helm 가이드](/docs/use-cases/observability/clickstack/deployment/helm) - 기본 설치