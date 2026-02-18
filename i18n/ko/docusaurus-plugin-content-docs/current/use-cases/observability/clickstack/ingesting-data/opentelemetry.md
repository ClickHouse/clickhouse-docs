---
slug: /use-cases/observability/clickstack/ingesting-data/opentelemetry
pagination_prev: null
pagination_next: null
toc_max_heading_level: 2
description: 'ClickStack을 위한 OpenTelemetry 데이터 수집 - ClickHouse 관측성 스택'
title: 'OpenTelemetry를 사용한 수집'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

모든 데이터는 로그, 메트릭, 트레이스, 세션 데이터의 기본 진입 지점 역할을 하는 **OpenTelemetry (OTel) collector** 인스턴스를 통해 ClickStack으로 수집됩니다. 이 인스턴스에는 collector의 공식 [ClickStack 배포판](#installing-otel-collector) 사용을 권장합니다.

데이터는 [language SDKs](/use-cases/observability/clickstack/sdks)나 인프라 메트릭과 로그를 수집하는 데이터 수집 에이전트(예: [agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 역할의 OTel collector 또는 [Fluentd](https://www.fluentd.org/), [Vector](https://vector.dev/) 등의 기타 기술)를 통해 이 collector로 전송됩니다. 관리형 OpenTelemetry 파이프라인을 원하는 팀의 경우, [Bindplane](/use-cases/observability/clickstack/integration-partners/bindplane)은 ClickStack을 네이티브 대상으로 지원하는 OpenTelemetry 네이티브 솔루션을 제공하여 텔레메트리 수집, 처리 및 라우팅을 단순화합니다.


## OpenTelemetry 데이터 전송 \{#sending-otel-data\}

<Tabs groupId="os-type">
  <TabItem value="managed-clickstack" label="관리형 ClickStack" default>
    ### ClickStack OpenTelemetry collector 설치

    Managed ClickStack으로 데이터를 전송하려면 [gateway 역할](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)의 OTel collector를 배포해야 합니다. OTel 호환 계측 도구는 HTTP 또는 gRPC 기반 OTLP를 통해 이 collector로 이벤트를 전송합니다.

    :::note ClickStack OpenTelemetry collector 사용을 권장합니다
    이를 통해 표준화된 수집, 스키마 강제 적용, 그리고 ClickStack UI(HyperDX)와의 즉시 사용 가능한 호환성의 이점을 누릴 수 있습니다. 기본 스키마를 사용하면 자동 소스 감지와 사전 구성된 컬럼 매핑이 활성화됩니다.
    :::

    자세한 내용은 [&quot;Deploying the collector&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector)를 참조하십시오.

    ### collector로 데이터 전송

    Managed ClickStack으로 데이터를 전송하려면 OpenTelemetry collector가 제공하는 다음 엔드포인트를 OpenTelemetry 계측 도구에 지정하면 됩니다.

    * **HTTP (OTLP):** `http://localhost:4318`
    * **gRPC (OTLP):** `localhost:4317`

    OpenTelemetry를 지원하는 [언어 SDK](/use-cases/observability/clickstack/sdks) 및 텔레메트리 라이브러리의 경우 애플리케이션에서 `OTEL_EXPORTER_OTLP_ENDPOINT` 환경 변수만 설정하면 됩니다.

    ```shell
    export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
    ```

    에이전트 역할로 [contrib 배포판 OTel collector](https://github.com/open-telemetry/opentelemetry-collector-contrib)를 배포하면 OTLP exporter를 사용하여 ClickStack collector로 데이터를 전송할 수 있습니다. 아래는 이 [구조화된 로그 파일](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)을 수집하는 에이전트 설정 예시입니다.

    ```yaml
    # clickhouse-agent-config.yaml
    receivers:
      filelog:
        include:
          - /opt/data/logs/access-structured.log
        start_at: beginning
        operators:
          - type: json_parser
            timestamp:
              parse_from: attributes.time_local
              layout: '%Y-%m-%d %H:%M:%S'
    exporters:
      # HTTP setup
      otlphttp/hdx:
        endpoint: 'http://localhost:4318'
        compression: gzip
     
      # gRPC setup (alternative)
      otlp/hdx:
        endpoint: 'localhost:4317'
        compression: gzip
    processors:
      batch:
        timeout: 5s
        send_batch_size: 1000
    service:
      telemetry:
        metrics:
          address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
      pipelines:
        logs:
          receivers: [filelog]
          processors: [batch]
          exporters: [otlphttp/hdx]
    ```
  </TabItem>

  <TabItem value="oss-clickstack" label="오픈소스 ClickStack" default>
    ClickStack OpenTelemetry collector는 다음을 포함한 대부분의 ClickStack 배포판에 포함되어 있습니다.

    * [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
    * [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
    * [Helm](/use-cases/observability/clickstack/deployment/helm)

    ### ClickStack OpenTelemetry collector 설치

    ClickStack OTel collector는 스택의 다른 컴포넌트와 독립적으로 단독 배포할 수도 있습니다.

    [HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only) 배포판을 사용하는 경우, ClickHouse로 데이터를 전달하는 작업은 직접 처리해야 합니다. 이는 다음과 같은 방식으로 수행할 수 있습니다.

    * 자체 OpenTelemetry collector를 실행하고 ClickHouse를 대상으로 설정합니다. 아래 내용을 참고하십시오.
    * [Vector](https://vector.dev/), [Fluentd](https://www.fluentd.org/) 등과 같은 대체 도구를 사용하거나, 기본 [OTel contrib collector distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib)을 사용하여 ClickHouse로 직접 전송합니다.

    :::note ClickStack OpenTelemetry collector 사용을 권장합니다
    이를 사용하면 표준화된 수집, 강제되는 스키마, HyperDX UI와의 즉시 사용 가능한 호환성의 이점을 얻을 수 있습니다. 기본 스키마를 사용하면 자동 소스 감지와 미리 구성된 컬럼 매핑이 가능해집니다.
    :::

    자세한 내용은 [&quot;Deploying the collector&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector)를 참조하십시오.

    ### collector로 데이터 보내기

    ClickStack으로 데이터를 보내려면 OpenTelemetry collector에서 제공하는 다음 엔드포인트를 대상으로 OpenTelemetry 계측을 설정하면 됩니다.

    * **HTTP (OTLP):** `http://localhost:4318`
    * **gRPC (OTLP):** `localhost:4317`

    [언어 SDKs](/use-cases/observability/clickstack/sdks) 및 OpenTelemetry를 지원하는 텔레메트리 라이브러리에 대해서는 애플리케이션에서 `OTEL_EXPORTER_OTLP_ENDPOINT` 환경 변수를 설정하기만 하면 됩니다.

    ```shell
    export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
    ```

    또한 API 수집 키가 포함된 Authorization 헤더가 필요합니다. 키는 HyperDX 앱의 `Team Settings → API Keys`에서 확인할 수 있습니다.

    <Image img={ingestion_key} alt="Ingestion keys" size="lg" />

    언어별 SDK에서는 `init` 함수로 설정하거나 `OTEL_EXPORTER_OTLP_HEADERS` 환경 변수로 설정할 수 있습니다. 예를 들어:

    ```shell
    OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
    ```

    에이전트 역시 모든 OTLP 통신에 이 Authorization 헤더를 포함해야 합니다. 예를 들어 에이전트 역할로 [contrib distribution of the OTel collector](https://github.com/open-telemetry/opentelemetry-collector-contrib)를 배포하는 경우 OTLP exporter를 사용할 수 있습니다. 이 [structured log file](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)을(를) 처리하는 에이전트 설정 예시는 아래와 같습니다. Authorization 키를 지정해야 합니다. `<YOUR_API_INGESTION_KEY>`를 설정하십시오.

    ```yaml
    # clickhouse-agent-config.yaml
    receivers:
      filelog:
        include:
          - /opt/data/logs/access-structured.log
        start_at: beginning
        operators:
          - type: json_parser
            timestamp:
              parse_from: attributes.time_local
              layout: '%Y-%m-%d %H:%M:%S'
    exporters:
      # HTTP setup
      otlphttp/hdx:
        endpoint: 'http://localhost:4318'
        headers:
          authorization: <YOUR_API_INGESTION_KEY>
        compression: gzip
     
      # gRPC setup (alternative)
      otlp/hdx:
        endpoint: 'localhost:4317'
        headers:
          authorization: <YOUR_API_INGESTION_KEY>
        compression: gzip
    processors:
      batch:
        timeout: 5s
        send_batch_size: 1000
    service:
      telemetry:
        metrics:
          address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
      pipelines:
        logs:
          receivers: [filelog]
          processors: [batch]
          exporters: [otlphttp/hdx]
    ```
  </TabItem>
</Tabs>