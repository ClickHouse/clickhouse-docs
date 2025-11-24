---
'slug': '/use-cases/observability/clickstack/ingesting-data/overview'
'title': 'ClickStack에 데이터 가져오기'
'sidebar_label': '개요'
'sidebar_position': 0
'pagination_prev': null
'pagination_next': 'use-cases/observability/clickstack/ingesting-data/opentelemetry'
'description': 'ClickStack에 데이터를 가져오는 개요'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'observability'
- 'logs'
- 'monitoring'
- 'platform'
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

모든 데이터는 **OpenTelemetry (OTel) 수집기**를 통해 ClickStack으로 수집되며, 이는 로그, 메트릭, 트레이스 및 세션 데이터의 주요 진입점 역할을 합니다.

<Image img={architecture_with_flow} alt="흐름이 있는 간단한 아키텍처" size="md"/>

이 수집기는 두 개의 OTLP 엔드포인트를 노출합니다:

- **HTTP** - 포트 `4318`
- **gRPC** - 포트 `4317`

사용자는 [언어 SDKs](/use-cases/observability/clickstack/sdks) 또는 OTel 호환 데이터 수집 에이전트, 예를 들어 인프라 메트릭 및 로그를 수집하는 다른 OTel 수집기에서 직접 이 엔드포인트에 데이터를 보낼 수 있습니다.

더 구체적으로:

- [**언어 SDKs**](/use-cases/observability/clickstack/sdks)는 애플리케이션 내에서 원거리 측정을 수집할 책임이 있으며 - 특히 **트레이스**와 **로그** - 이 데이터를 OpenTelemetry 수집기로 내보냅니다. 이 과정은 OTLP 엔드포인트를 통해 이루어지며, 해당 수집기는 ClickHouse로의 수집을 처리합니다. ClickStack에서 사용할 수 있는 언어 SDKs에 대한 자세한 내용은 [SDKs](/use-cases/observability/clickstack/sdks) 를 참조하십시오.

- **데이터 수집 에이전트**는 엣지에 배포된 에이전트로, 서버, Kubernetes 노드 또는 애플리케이션과 함께 작동합니다. 이들은 인프라 원거리 측정(예: 로그, 메트릭)을 수집하거나 SDK로 계측된 애플리케이션에서 직접 이벤트를 수신합니다. 이 경우 에이전트는 애플리케이션과 동일한 호스트에서 실행되며, 종종 사이드카 또는 DaemonSet으로 배치됩니다. 이러한 에이전트는 중앙 ClickStack OTel 수집기로 데이터를 전달하며, 이는 [게이트웨이](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 역할을 하며, 일반적으로 클러스터, 데이터 센터 또는 지역 당 한 번 배포됩니다. [게이트웨이](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)는 에이전트 또는 애플리케이션으로부터 OTLP 이벤트를 수신하고 ClickHouse로의 수집을 처리합니다. 더 많은 세부정보는 [OTel 수집기](/use-cases/observability/clickstack/ingesting-data/otel-collector) 를 참조하십시오. 이러한 에이전트는 OTel 수집기의 다른 인스턴스 또는 [Fluentd](https://www.fluentd.org/) 또는 [Vector](https://vector.dev/)와 같은 대체 기술일 수 있습니다.

:::note OpenTelemetry 호환성
ClickStack은 자체 언어 SDK와 강화된 원거리 측정 및 기능을 갖춘 사용자 정의 OpenTelemetry를 제공하지만, 사용자는 기존의 OpenTelemetry SDK 및 에이전트를 원활하게 사용할 수도 있습니다.
:::
