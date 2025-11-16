---
'slug': '/use-cases/observability/clickstack/migration/elastic/migrating-sdks'
'title': 'Elastic에서 SDK 마이그레이션'
'pagination_prev': null
'pagination_next': null
'sidebar_label': 'SDK 마이그레이션'
'sidebar_position': 6
'description': 'Elastic에서 SDK 마이그레이션'
'show_related_blogs': true
'keywords':
- 'ClickStack'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

The Elastic Stack는 애플리케이션을 계측하기 위한 두 가지 유형의 언어 SDK를 제공합니다:

1. **[Elastic 공식 APM 에이전트](https://www.elastic.co/docs/reference/apm-agents/)** – 이러한 에이전트는 Elastic Stack과 함께 사용하도록 특별히 제작되었습니다. 현재 이러한 SDK에 대한 직접 마이그레이션 경로는 없습니다. 이들을 사용하는 애플리케이션은 해당 [ClickStack SDKs](/use-cases/observability/clickstack/sdks)를 사용하여 다시 계측해야 합니다.

2. **[OpenTelemetry의 Elastic 배포판 (EDOT SDKs)](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – 이는 .NET, Java, Node.js, PHP 및 Python용으로 제공되는 표준 OpenTelemetry SDK의 Elastic 배포판입니다. 애플리케이션에서 EDOT SDK를 이미 사용 중인 경우, 코드를 다시 계측할 필요가 없습니다. 대신 SDK를 재구성하여 ClickStack에 포함된 OTLP 수집기로 계측 데이터를 내보내면 됩니다. 자세한 내용은 ["EDOT SDK 마이그레이션"](#migrating-edot-sdks)를 참조하세요.

:::note ClickStack SDK를 가능한 한 사용하세요
표준 OpenTelemetry SDK도 지원되지만, 각 언어에 대해 [**ClickStack 배포 SDK**](/use-cases/observability/clickstack/sdks)를 사용하는 것을 강력히 권장합니다. 이러한 배포판에는 추가 계측, 향상된 기본 설정 및 ClickStack 파이프라인과 HyperDX UI와 원활하게 작동하도록 설계된 사용자 지정 확장이 포함됩니다. ClickStack SDK를 사용하면 순수 OpenTelemetry 또는 EDOT SDK에서는 사용할 수 없는 예외 스택 추적과 같은 고급 기능을 활용할 수 있습니다.
:::

## EDOT SDK 마이그레이션 {#migrating-edot-sdks}

ClickStack OpenTelemetry 기반 SDK와 유사하게, OpenTelemetry SDK의 Elastic 배포판(EDOT SDK)은 공식 OpenTelemetry SDK의 사용자 지정 버전입니다. 예를 들어, [EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/)는 Elastic Observability와 원활하게 작동하도록 설계된 [OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/)의 공급업체 맞춤 배포판입니다.

이 SDK는 표준 OpenTelemetry 라이브러리를 기반으로 하기 때문에 ClickStack으로의 마이그레이션은 간단합니다 - 재계측이 필요 없습니다. 구성만 조정하여 계측 데이터를 ClickStack OpenTelemetry 수집기로 보내면 됩니다.

구성은 표준 OpenTelemetry 메커니즘을 따릅니다. Python의 경우, 이는 일반적으로 [OpenTelemetry 제로 코드 계측 문서](https://opentelemetry.io/docs/zero-code/python/configuration/)에 설명된 대로 환경 변수를 통해 수행됩니다.

전형적인 EDOT SDK 구성은 다음과 같을 수 있습니다:

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

ClickStack으로 마이그레이션하려면 엔드포인트를 로컬 OTLP 수집기로 가리키도록 업데이트하고 인증 헤더를 변경합니다:

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>"
```

당신의 수집 API 키는 HyperDX 애플리케이션에서 생성되며 팀 설정 → API 키 아래에서 찾을 수 있습니다.

<Image img={ingestion_key} alt="수집 키" size="lg"/>
