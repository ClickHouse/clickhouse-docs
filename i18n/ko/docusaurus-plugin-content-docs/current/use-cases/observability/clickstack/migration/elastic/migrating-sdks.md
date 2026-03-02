---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-sdks
title: 'Elastic에서 SDK 이전'
pagination_prev: null
pagination_next: null
sidebar_label: 'SDK 이전'
sidebar_position: 6
description: 'Elastic에서 SDK 이전'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

Elastic Stack은 애플리케이션을 계측하기 위해 두 가지 유형의 언어별 SDK를 제공합니다:

1. **[Elastic Official APM agents](https://www.elastic.co/docs/reference/apm-agents/)** – Elastic Stack 전용으로 제작된 에이전트입니다. 현재 이 SDK에 대해서는 직접적인 마이그레이션 경로가 없습니다. 이를 사용하는 애플리케이션은 해당 언어에 맞는 [ClickStack SDKs](/use-cases/observability/clickstack/sdks)로 다시 계측해야 합니다.

2. **[Elastic Distributions of OpenTelemetry (EDOT SDKs)](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – 표준 OpenTelemetry SDKs를 Elastic에서 배포한 버전으로, .NET, Java, Node.js, PHP, Python용이 제공됩니다. 애플리케이션에서 이미 EDOT SDK를 사용 중이라면 코드를 다시 계측할 필요는 없습니다. 대신 SDK를 재구성하여 ClickStack에 포함된 OTLP Collector로 텔레메트리 데이터를 내보내도록 설정하면 됩니다. 자세한 내용은 [「Migrating EDOT SDKs」](#migrating-edot-sdks)를 참조하십시오.

:::note 가능한 경우 ClickStack SDKs를 사용하십시오
표준 OpenTelemetry SDKs도 지원되지만, 각 언어별로 [**ClickStack-distributed SDKs**](/use-cases/observability/clickstack/sdks) 사용을 강력히 권장합니다. 이 배포판에는 추가 계측, 향상된 기본 설정, ClickStack 파이프라인 및 UI와 원활하게 동작하도록 설계된 맞춤형 확장 기능이 포함되어 있습니다. ClickStack SDKs를 사용하면, 기본 OpenTelemetry 또는 EDOT SDKs에서는 제공되지 않는 예외 스택 트레이스와 같은 고급 기능을 활용할 수 있습니다.
:::

## EDOT SDK 마이그레이션 \{#migrating-edot-sdks\}

ClickStack에서 사용하는 OpenTelemetry 기반 SDK와 마찬가지로, Elastic Distributions of the OpenTelemetry SDKs(EDOT SDK)는 공식 OpenTelemetry SDK를 커스터마이징한 버전입니다. 예를 들어 [EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/)는 [OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/)를 기반으로 Elastic 관측성과 매끄럽게 동작하도록 설계된 벤더 커스터마이징 배포판입니다.

이 SDK들은 표준 OpenTelemetry 라이브러리를 기반으로 하므로 ClickStack으로의 마이그레이션은 간단하며, 재계측(re-instrumentation)이 필요하지 않습니다. 텔레메트리 데이터를 ClickStack OpenTelemetry Collector로 전송하도록 구성만 조정하면 됩니다.

구성은 표준 OpenTelemetry 메커니즘을 따릅니다. Python의 경우 일반적으로 [OpenTelemetry Zero-Code Instrumentation 문서](https://opentelemetry.io/docs/zero-code/python/configuration/)에 설명된 것처럼 환경 변수(environment variables)를 통해 설정합니다.

일반적인 EDOT SDK 구성은 다음과 비슷합니다.

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

ClickStack로 마이그레이션하려면 엔드포인트를 로컬 OTLP Collector를 가리키도록 업데이트하고 Authorization 헤더 값을 변경합니다:

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>"
```

수집 API key는 HyperDX 애플리케이션에서 생성되며 Team Settings → API Keys에서 확인할 수 있습니다.

<Image img={ingestion_key} alt="수집 키" size="lg" />
