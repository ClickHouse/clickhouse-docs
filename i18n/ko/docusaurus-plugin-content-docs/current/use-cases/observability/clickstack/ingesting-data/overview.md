---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: 'ClickStack으로 데이터 수집하기'
sidebar_label: '개요'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: 'ClickStack으로 데이터 수집에 대한 개요'
doc_type: 'guide'
keywords: ['clickstack', '관측성', '로그', '모니터링', '플랫폼']
---

import Image from '@theme/IdealImage';
import oss_architecture_with_flow from '@site/static/images/use-cases/observability/clickstack-oss-architecture-with-flow.png';
import managed_architecture_with_flow from '@site/static/images/use-cases/observability/clickstack-managed-architecture-with-flow.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

모든 데이터는 **OpenTelemetry (OTel) collector**를 통해 ClickStack Open Source 또는 Managed ClickStack으로 수집됩니다. 이는 로그, 메트릭, 트레이스, 세션 데이터의 기본 진입점 역할을 합니다.

아키텍처의 주요 차이점은 각 구성 요소가 어디에 호스팅되느냐에 있습니다. 두 경우 모두 애플리케이션에서 나오는 텔레메트리 데이터를 수신하기 위해 OpenTelemetry collector를 실행합니다. ClickStack Open Source에서는 ClickHouse와 ClickStack UI(HyperDX) 모두를 직접 관리하고 호스팅합니다. Managed ClickStack에서는 ClickHouse와 HyperDX UI가 ClickHouse Cloud에서 호스팅 및 관리되며, 통합 인증 및 운영 관리는 ClickHouse Cloud에서 처리합니다.

<Tabs groupId="architecture">
  <TabItem value="managed-clickstack" label="Managed ClickStack" default>
    <Image img={managed_architecture_with_flow} alt="데이터 흐름이 포함된 Managed 아키텍처" size="md" />
  </TabItem>

  <TabItem value="oss-clickstack" label="Open Source ClickStack">
    <Image img={oss_architecture_with_flow} alt="데이터 흐름이 포함된 간단한 아키텍처" size="md" />
  </TabItem>
</Tabs>

두 배포 모델 모두에서 collector는 두 개의 OTLP 엔드포인트를 노출합니다:

* **HTTP** - 포트 `4318`
* **gRPC** - 포트 `4317`

데이터는 [language SDKs](/use-cases/observability/clickstack/sdks)에서 직접 또는 다른 OTel collector와 같은 OTel 호환 데이터 수집 에이전트(인프라 메트릭과 로그를 수집하는 역할)를 통해 이 엔드포인트로 전송할 수 있습니다.

좀 더 구체적으로 설명하면:

* [**Language SDKs**](/use-cases/observability/clickstack/sdks)는 애플리케이션 내부에서 텔레메트리를 수집하는 역할을 합니다. 특히 **traces**와 **logs**를 중심으로 수집하고, 이 데이터를 OTLP 엔드포인트를 통해 OpenTelemetry collector로 내보냅니다. 이 OpenTelemetry collector가 ClickHouse로의 수집을 처리합니다. ClickStack에서 사용 가능한 language SDK에 대한 자세한 내용은 [SDKs](/use-cases/observability/clickstack/sdks)를 참조하십시오.

* **데이터 수집 에이전트**는 서버, Kubernetes 노드 또는 애플리케이션과 함께(또는 옆에) 엣지에 배포되는 에이전트입니다. 이들은 인프라 텔레메트리(예: 로그, 메트릭)를 수집하거나, SDK로 계측된 애플리케이션으로부터 직접 이벤트를 수신합니다. 이 경우 에이전트는 보통 사이드카 또는 데몬셋으로 애플리케이션과 동일한 호스트에서 실행됩니다. 이러한 에이전트는 데이터를 중앙 ClickStack OTel collector로 전달하며, 이 collector는 일반적으로 클러스터, 데이터 센터 또는 리전당 한 번 배포되는 [gateway](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 역할을 합니다. [gateway](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)는 에이전트 또는 애플리케이션으로부터 OTLP 이벤트를 수신하고 ClickHouse로의 수집을 처리합니다. 자세한 내용은 [OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)를 참조하십시오. 이러한 에이전트는 OTel collector의 다른 인스턴스일 수도 있고, [Fluentd](https://www.fluentd.org/)나 [Vector](https://vector.dev/)와 같은 대체 기술일 수도 있습니다.

:::note OpenTelemetry 호환성
ClickStack은 고급 텔레메트리와 기능을 제공하는 자체 language SDK와 커스텀 OpenTelemetry를 제공하지만, 기존 OpenTelemetry SDK와 에이전트도 그대로 원활하게 사용할 수 있습니다.
:::
