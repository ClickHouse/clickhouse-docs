---
slug: /use-cases/observability/clickstack/sdks
pagination_prev: null
pagination_next: null
description: 'ClickStack용 Language SDKs - ClickHouse 관측성 스택'
title: 'Language SDKs'
doc_type: 'guide'
keywords: ['ClickStack SDKs', 'ClickStack 언어 SDKs', 'OpenTelemetry SDKs ClickStack', 'application instrumentation SDKs
', 'telemetry collection SDKs']
---

데이터는 일반적으로 **OpenTelemetry (OTel) collector**를 통해 ClickStack으로 전송됩니다. 애플리케이션 Language SDKs에서 collector로 직접 보내거나, 인프라 메트릭과 로그를 수집하는 에이전트 역할의 중간 OpenTelemetry collector를 거쳐 전송하는 방식입니다.

Language SDKs는 애플리케이션 내부에서 텔레메트리를 수집하는 역할을 담당합니다. 대표적으로 **traces**와 **logs**를 수집하며, 이 데이터를 OTLP endpoint를 통해 OpenTelemetry collector로 내보냅니다. collector는 해당 데이터의 ClickHouse로의 수집을 처리합니다.

브라우저 기반 환경에서는 SDKs가 UI 이벤트, 클릭, 페이지 이동 등의 **세션 데이터**를 수집하여 사용자 세션 리플레이를 가능하게 하는 역할도 담당할 수 있습니다. 

## 동작 방식 \{#how-it-works\}

1. 애플리케이션에서 ClickStack SDK(예: Node.js, Python, Go)를 사용합니다. 이 SDK는 OpenTelemetry SDK를 기반으로 하며, 추가 기능과 사용성 향상을 포함합니다.
2. SDK가 OTLP(HTTP 또는 gRPC)를 통해 trace와 log를 수집하고 내보냅니다.
3. OpenTelemetry Collector가 수집된 텔레메트리 데이터를 받아, 구성된 exporter를 통해 ClickHouse에 기록합니다.

## 지원 언어 \{#supported-languages\}

:::note OpenTelemetry 호환성
ClickStack는 향상된 텔레메트리와 기능을 제공하는 자체 언어 SDK를 제공하지만, 기존 OpenTelemetry SDKs도 문제 없이 사용할 수 있습니다.
:::

<br/>

| Language | Description | Link |
|----------|-------------|------|
| AWS Lambda | AWS Lambda 함수에 계측을 추가합니다 | [문서](/use-cases/observability/clickstack/sdks/aws_lambda) |
| Browser | 브라우저 기반 애플리케이션용 JavaScript SDK입니다 | [문서](/use-cases/observability/clickstack/sdks/browser) |
| Elixir | Elixir 애플리케이션용입니다 | [문서](/use-cases/observability/clickstack/sdks/elixir) |
| Go | Go 애플리케이션 및 마이크로서비스용입니다 | [문서](/use-cases/observability/clickstack/sdks/golang) |
| Java | Java 애플리케이션용입니다 | [문서](/use-cases/observability/clickstack/sdks/java) |
| NestJS | NestJS 애플리케이션용입니다 | [문서](/use-cases/observability/clickstack/sdks/nestjs) |
| Next.js | Next.js 애플리케이션용입니다 | [문서](/use-cases/observability/clickstack/sdks/nextjs) |
| Node.js | 서버 측 애플리케이션용 JavaScript 런타임입니다 | [문서](/use-cases/observability/clickstack/sdks/nodejs) |
| Deno | Deno 애플리케이션용입니다 | [문서](/use-cases/observability/clickstack/sdks/deno) |
| Python | Python 애플리케이션 및 웹 서비스용입니다 | [문서](/use-cases/observability/clickstack/sdks/python) |
| React Native | React Native 모바일 애플리케이션용입니다 | [문서](/use-cases/observability/clickstack/sdks/react-native) |
| Ruby | Ruby on Rails 애플리케이션 및 웹 서비스용입니다 | [문서](/use-cases/observability/clickstack/sdks/ruby-on-rails) |

## API key로 보안 설정하기 \{#securing-api-key\}

:::Not required for Managed ClickStack
Managed ClickStack에서는 API key가 필요하지 않습니다.
:::

OTel collector를 통해 ClickStack으로 데이터를 전송하려면 SDK에서 수집 API key를 지정해야 합니다. 이는 SDK의 `init` 함수에서 설정하거나 `OTEL_EXPORTER_OTLP_HEADERS` 환경 변수로 설정할 수 있습니다:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

이 API 키는 ClickStack UI(HyperDX) 애플리케이션에서 생성되며, 앱의 `Team Settings → API Keys`에서 확인할 수 있습니다.

대부분의 [language SDKs](/use-cases/observability/clickstack/sdks) 및 OpenTelemetry를 지원하는 텔레메트리 라이브러리에서는 애플리케이션에서 `OTEL_EXPORTER_OTLP_ENDPOINT` 환경 변수를 설정하거나 SDK를 초기화할 때 이 값을 지정하기만 하면 됩니다.

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```


## Kubernetes integration \{#kubernetes-integration\}

모든 SDKs는 Kubernetes 환경에서 실행될 때 Kubernetes 메타데이터(파드 이름, 네임스페이스 등)와의 자동 연관을 지원합니다. 이를 통해 다음과 같은 작업을 수행할 수 있습니다:

- 서비스와 연관된 파드 및 노드에 대한 Kubernetes 메트릭 보기
- 애플리케이션 로그와 트레이스를 인프라 메트릭과 연관하여 확인
- Kubernetes 클러스터 전반에 걸친 리소스 사용량과 성능 추적

이 기능을 활성화하려면 OpenTelemetry Collector가 리소스 태그를 파드로 전달하도록 구성하십시오. 자세한 설정 방법은 [Kubernetes 통합 가이드](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)를 참조하십시오.