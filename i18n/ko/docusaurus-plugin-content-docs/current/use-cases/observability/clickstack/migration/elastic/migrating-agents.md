---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-agents
title: 'Elastic에서 에이전트 마이그레이션'
pagination_prev: null
pagination_next: null
sidebar_label: '에이전트 마이그레이션'
sidebar_position: 5
description: 'Elastic에서 에이전트 마이그레이션'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import add_logstash_output from '@site/static/images/use-cases/observability/add-logstash-output.png';
import agent_output_settings from '@site/static/images/use-cases/observability/agent-output-settings.png';
import migrating_agents from '@site/static/images/use-cases/observability/clickstack-migrating-agents.png';


## Elastic에서 에이전트 마이그레이션하기 \{#migrating-agents-from-elastic\}

Elastic Stack은 여러 관측성(Observability) 데이터 수집 에이전트를 제공합니다. 구체적으로는 다음과 같습니다.

- [Beats 제품군](https://www.elastic.co/beats) - [Filebeat](https://www.elastic.co/beats/filebeat), [Metricbeat](https://www.elastic.co/beats/metricbeat), [Packetbeat](https://www.elastic.co/beats/packetbeat) 등 - 은 모두 `libbeat` 라이브러리를 기반으로 합니다. 이러한 Beats는 Lumberjack 프로토콜을 통해 [Elasticsearch, Kafka, Redis 또는 Logstash로 데이터 전송](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output)을 지원합니다.
- [`Elastic Agent`](https://www.elastic.co/elastic-agent)는 로그, 메트릭, 트레이스를 수집할 수 있는 통합 에이전트입니다. 이 에이전트는 [Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet)를 통해 중앙에서 관리할 수 있으며, Elasticsearch, Logstash, Kafka 또는 Redis로 출력할 수 있습니다.
- Elastic은 [OpenTelemetry Collector - EDOT](https://www.elastic.co/docs/reference/opentelemetry) 배포판도 제공합니다. 현재는 Fleet Server로 오케스트레이션할 수 없지만, ClickStack으로 마이그레이션할 때 더 유연하고 개방적인 경로를 제공합니다.

가장 적합한 마이그레이션 경로는 현재 사용 중인 에이전트에 따라 달라집니다. 다음 섹션에서는 주요 에이전트 유형별 마이그레이션 옵션을 설명합니다. 목표는 마이그레이션 과정에서의 부담을 최소화하고, 가능한 경우 전환 기간 동안 기존 에이전트를 계속 사용할 수 있도록 하는 것입니다.

## 권장 마이그레이션 경로 \{#prefered-migration-path\}

가능한 경우 모든 로그, 메트릭, 트레이스 수집을 위해 [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/)로 마이그레이션하고, 콜렉터를 [엣지에서 에이전트 역할로](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 배포할 것을 권장합니다. 이는 데이터를 전송하는 가장 효율적인 방법이며, 아키텍처 복잡성과 데이터 변환을 피할 수 있습니다.

:::note OpenTelemetry Collector를 선택하는 이유
OpenTelemetry Collector는 관측성 데이터 수집을 위한 지속 가능하고 벤더 중립적인 솔루션을 제공합니다. 일부 조직이 수천 개, 혹은 수만 개에 달하는 Elastic 에이전트 플릿을 운영하고 있음을 인지하고 있습니다. 이러한 조직에게는 기존 에이전트 인프라와의 호환성을 유지하는 것이 중요할 수 있습니다. 이 문서는 이를 지원하는 동시에, 팀이 점진적으로 OpenTelemetry 기반 수집으로 전환할 수 있도록 돕기 위해 설계되었습니다.
:::

## ClickHouse OpenTelemetry endpoint \{#clickhouse-otel-endpoint\}

모든 데이터는 로그, 메트릭, 트레이스, 세션 데이터를 위한 기본 진입점 역할을 하는 **OpenTelemetry (OTel) collector** 인스턴스를 통해 ClickStack으로 수집됩니다. 이 인스턴스에는 공식 [ClickStack distribution](/use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector)의 collector 사용을 권장하며, 이는 [ClickStack 배포 모델에 이미 번들되어 있지 않은 경우](/use-cases/observability/clickstack/deployment)에 해당합니다.

데이터는 [language SDKs](/use-cases/observability/clickstack/sdks) 또는 인프라 메트릭과 로그를 수집하는 데이터 수집 에이전트를 통해 이 collector로 전송됩니다(예: [agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 역할의 OTel collector 또는 [Fluentd](https://www.fluentd.org/), [Vector](https://vector.dev/)와 같은 기타 기술). 관리형 OpenTelemetry 파이프라인을 원하는 팀은 [Bindplane](/use-cases/observability/clickstack/integration-partners/bindplane)을 사용하여 ClickStack을 네이티브 대상으로 지원하는 OpenTelemetry-네이티브 솔루션을 활용함으로써 텔레메트리 수집, 처리, 라우팅을 단순화할 수 있습니다.

**모든 에이전트 마이그레이션 단계에서 이 collector가 사용 가능하다고 가정합니다**.

## Migrating from beats \{#migrating-to-beats\}

대규모 Beats 배포를 사용 중인 사용자는 ClickStack으로 마이그레이션할 때 이를 그대로 유지하기를 원할 수 있습니다.

**현재 이 옵션은 Filebeat로만 테스트되었으며, 따라서 로그(Logs)에만 적합합니다.**

Beats 에이전트는 ClickStack에서 사용하는 OpenTelemetry 사양으로 [통합이 진행 중인](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md) [Elastic Common Schema (ECS)](https://www.elastic.co/docs/reference/ecs)를 사용합니다. 그러나 현재 이 [스키마들은 여전히 상당한 차이](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview)가 있으며, 사용자가 ECS 형식의 이벤트를 ClickStack에 수집하기 전에 OpenTelemetry 형식으로 변환할 책임이 있습니다.

이 변환 작업은 [Vector](https://vector.dev)를 사용하여 수행할 것을 권장합니다. Vector는 고성능 경량 관측성(observability) 데이터 파이프라인으로, Vector Remap Language (VRL)라는 강력한 변환 언어를 지원합니다. 

Filebeat 에이전트가 Beats에서 지원하는 출력인 Kafka로 데이터를 전송하도록 설정되어 있는 경우, Vector는 Kafka에서 해당 이벤트를 가져와 VRL을 사용해 스키마 변환을 적용한 다음, 이를 OTLP를 통해 ClickStack과 함께 배포되는 OpenTelemetry Collector로 전달할 수 있습니다.

또한 Vector는 Logstash에서 사용하는 Lumberjack 프로토콜을 통한 이벤트 수신도 지원합니다. 이를 통해 Beats 에이전트가 데이터를 Vector로 직접 전송할 수 있으며, 동일한 변환 과정을 적용한 뒤 OTLP를 통해 ClickStack OpenTelemetry Collector로 전달할 수 있습니다.

아래에서 두 가지 아키텍처를 모두 보여 줍니다.

<Image img={migrating_agents} alt="에이전트 마이그레이션" size="lg" background/>

다음 예에서는 Lumberjack 프로토콜을 통해 Filebeat에서 발생한 로그 이벤트를 Vector가 수신하도록 설정하는 초기 단계를 제공합니다. 수신된 ECS 이벤트를 OTel 사양에 매핑하기 위한 VRL을 제공하고, 이후 이를 OTLP를 통해 ClickStack OpenTelemetry Collector로 전송합니다. Kafka에서 이벤트를 소비하는 사용자는 Vector Logstash 소스를 [Kafka source](https://vector.dev/docs/reference/configuration/sources/kafka/)로 교체하면 되며, 그 외 단계는 모두 동일합니다.

<VerticalStepper headerLevel="h3">
  ### Vector 설치하기

  [공식 설치 가이드](https://vector.dev/docs/setup/installation/)를 사용하여 Vector를 설치하세요.

  이는 Elastic Stack OTel collector와 동일한 인스턴스에 설치할 수 있습니다.

  [Vector를 프로덕션으로 이전](https://vector.dev/docs/setup/going-to-prod/)할 때 아키텍처 및 보안에 관한 모범 사례를 따르시기 바랍니다.

  ### Vector 구성하기

  Vector는 Logstash 인스턴스를 모방하여 Lumberjack 프로토콜을 통해 이벤트를 수신하도록 구성되어야 합니다. 이는 Vector에 [`logstash` source](https://vector.dev/docs/reference/configuration/sources/logstash/)를 구성하여 수행할 수 있습니다:

  ```yaml
  sources:
    beats:
      type: logstash
      address: 0.0.0.0:5044
      tls:
        enabled: false  # Set to true if you're using TLS
        # The files below are generated from the steps at https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs
        # crt_file: logstash.crt
        # key_file: logstash.key
        # ca_file: ca.crt
        # verify_certificate: true
  ```

  :::note TLS 구성
  상호 TLS가 필요한 경우, Elastic 가이드 [&quot;Configure SSL/TLS for the Logstash output&quot;](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)를 사용하여 인증서와 키를 생성하세요. 생성된 인증서와 키는 위에 표시된 구성에서 지정할 수 있습니다.
  :::

  이벤트는 ECS 형식으로 수신됩니다. Vector Remap Language(VRL) 변환기를 사용하여 이를 OpenTelemetry 스키마로 변환할 수 있습니다. 변환기 구성은 간단합니다. 스크립트 파일을 별도 파일로 관리하면 됩니다:

  ```yaml
  transforms:
    remap_filebeat:
      inputs: ["beats"]
      type: "remap"
      file: 'beat_to_otel.vrl'
  ```

  위의 `beats` 소스로부터 이벤트를 수신한다는 점에 유의하십시오. remap 스크립트는 아래와 같습니다. 이 스크립트는 로그 이벤트에 대해서만 테스트되었지만 다른 형식을 위한 기반으로 활용할 수 있습니다.

  <details>
    <summary>VRL - ECS를 OTel로</summary>

    ```javascript
    # Define keys to ignore at root level
    ignored_keys = ["@metadata"]

    # Define resource key prefixes
    resource_keys = ["host", "cloud", "agent", "service"]

    # Create separate objects for resource and log record fields
    resource_obj = {}
    log_record_obj = {}

    # Copy all non-ignored root keys to appropriate objects
    root_keys = keys(.)
    for_each(root_keys) -> |_index, key| {
        if !includes(ignored_keys, key) {
            val, err = get(., [key])
            if err == null {
                # Check if this is a resource field
                is_resource = false
                if includes(resource_keys, key) {
                    is_resource = true
                }

                # Add to appropriate object
                if is_resource {
                    resource_obj = set(resource_obj, [key], val) ?? resource_obj
                } else {
                    log_record_obj = set(log_record_obj, [key], val) ?? log_record_obj
                }
            }
        }
    }

    # Flatten both objects separately
    flattened_resources = flatten(resource_obj, separator: ".")
    flattened_logs = flatten(log_record_obj, separator: ".")

    # Process resource attributes
    resource_attributes = []
    resource_keys_list = keys(flattened_resources)
    for_each(resource_keys_list) -> |_index, field_key| {
        field_value, err = get(flattened_resources, [field_key])
        if err == null && field_value != null {
            attribute, err = {
                "key": field_key,
                "value": {
                    "stringValue": to_string(field_value)
                }
            }
            if (err == null) {
                resource_attributes = push(resource_attributes, attribute)
            }
        }
    }

    # Process log record attributes
    log_attributes = []
    log_keys_list = keys(flattened_logs)
    for_each(log_keys_list) -> |_index, field_key| {
        field_value, err = get(flattened_logs, [field_key])
        if err == null && field_value != null {
            attribute, err = {
                "key": field_key,
                "value": {
                    "stringValue": to_string(field_value)
                }
            }
            if (err == null) {
                log_attributes = push(log_attributes, attribute)
            }
        }
    }

    # Get timestamp for timeUnixNano (convert to nanoseconds)
    timestamp_nano = if exists(.@timestamp) {
        to_unix_timestamp!(parse_timestamp!(.@timestamp, format: "%Y-%m-%dT%H:%M:%S%.3fZ"), unit: "nanoseconds")
    } else {
        to_unix_timestamp(now(), unit: "nanoseconds")
    }

    # Get message/body field
    body_value = if exists(.message) {
        to_string!(.message)
    } else if exists(.body) {
        to_string!(.body)
    } else {
        ""
    }

    # Create the OpenTelemetry structure
    . = {
        "resourceLogs": [
            {
                "resource": {
                    "attributes": resource_attributes
                },
                "scopeLogs": [
                    {
                        "scope": {},
                        "logRecords": [
                            {
                                "timeUnixNano": to_string(timestamp_nano),
                                "severityNumber": 9,
                                "severityText": "info",
                                "body": {
                                    "stringValue": body_value
                                },
                                "attributes": log_attributes
                            }
                        ]
                    }
                ]
            }
        ]
    }
    ```
  </details>

  마지막으로, 변환된 이벤트는 OpenTelemetry 수집기를 통해 OTLP로 ClickStack에 전송됩니다. 이를 위해 Vector에서 OTLP 싱크를 구성해야 하며, 이 싱크는 `remap_filebeat` 변환에서 이벤트를 입력으로 받습니다:

  ```yaml
  sinks:
    otlp:
      type: opentelemetry
      inputs: [remap_filebeat] # receives events from a remap transform - see below
      protocol:
        type: http  # Use "grpc" for port 4317
        uri: http://localhost:4318/v1/logs # logs endpoint for the OTel collector 
        method: post
        encoding:
          codec: json
        framing:
          method: newline_delimited
        headers:
          content-type: application/json
          authorization: ${YOUR_INGESTION_API_KEY}
  ```

  여기서 `YOUR_INGESTION_API_KEY`는 ClickStack에서 생성됩니다. 이 키는 ClickStack UI(HyperDX)의 `Team Settings → API Keys`에서 확인하실 수 있습니다.

  <Image img={ingestion_key} alt="수집 키" size="lg" />

  최종 완성된 구성은 아래와 같습니다:

  ```yaml
  sources:
    beats:
      type: logstash
      address: 0.0.0.0:5044
      tls:
        enabled: false  # Set to true if you're using TLS
          #crt_file: /data/elasticsearch-9.0.1/logstash/logstash.crt
          #key_file: /data/elasticsearch-9.0.1/logstash/logstash.key
          #ca_file: /data/elasticsearch-9.0.1/ca/ca.crt
          #verify_certificate: true

  transforms:
    remap_filebeat:
      inputs: ["beats"]
      type: "remap"
      file: 'beat_to_otel.vrl'

  sinks:
    otlp:
      type: opentelemetry
      inputs: [remap_filebeat]
      protocol:
        type: http  # Use "grpc" for port 4317
        uri: http://localhost:4318/v1/logs
        method: post
        encoding:
          codec: json
        framing:
          method: newline_delimited
        headers:
          content-type: application/json
  ```

  ### Filebeat 구성하기

  기존 Filebeat 설치에서 이벤트를 Vector로 전송하도록 수정하면 됩니다. 이를 위해 Logstash 출력을 구성해야 하며, TLS는 선택적으로 구성할 수 있습니다:

  ```yaml
  # ------------------------------ Logstash Output -------------------------------
  output.logstash:
    # The Logstash hosts
    hosts: ["localhost:5044"]

    # Optional SSL. By default is off.
    # List of root certificates for HTTPS server verifications
    #ssl.certificate_authorities: ["/etc/pki/root/ca.pem"]

    # Certificate for SSL client authentication
    #ssl.certificate: "/etc/pki/client/cert.pem"

    # Client Certificate Key
    #ssl.key: "/etc/pki/client/cert.key"
  ```
</VerticalStepper>

## Elastic Agent에서 마이그레이션하기 {#migrating-from-elastic-agent}

Elastic Agent는 여러 Elastic Beats를 하나의 패키지로 통합합니다. 이 에이전트는 [Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server)과 통합되며, 이를 통해 중앙에서 오케스트레이션하고 구성할 수 있습니다.

Elastic Agent를 배포한 사용자는 다음과 같은 여러 마이그레이션 경로를 선택할 수 있습니다:

- 에이전트를 Lumberjack 프로토콜을 통해 Vector 엔드포인트로 데이터를 전송하도록 구성합니다. **현재 이 방식은 Elastic Agent로 로그 데이터를 수집하는 사용자에 대해서만 테스트되었습니다.** 이 설정은 Kibana의 Fleet UI를 통해 중앙에서 구성할 수 있습니다.
- [에이전트를 Elastic OpenTelemetry Collector (EDOT)로 실행](https://www.elastic.co/docs/reference/fleet/otel-agent)합니다. Elastic Agent에는 내장된 EDOT Collector가 포함되어 있어, 애플리케이션과 인프라를 한 번 계측한 후 여러 벤더와 백엔드로 데이터를 전송할 수 있습니다. 이 구성에서는 EDOT Collector가 ClickStack OTel collector로 OTLP를 통해 이벤트를 전달하도록 간단히 구성하면 됩니다. **이 접근 방식은 모든 이벤트 타입을 지원합니다.**

아래에서 이 두 가지 옵션을 모두 설명합니다.

### Vector를 통한 데이터 전송 \{#sending-data-via-vector\}

<VerticalStepper headerLevel="h4">

#### Vector 설치 및 구성 {#install-configure-vector}

Filebeat에서 마이그레이션할 때와 동일한 [단계](#install-vector)를 사용하여 Vector를 설치하고 구성합니다.

#### Elastic Agent 구성 {#configure-elastic-agent}

Elastic Agent는 Logstash 프로토콜인 Lumberjack을 통해 데이터를 전송하도록 구성해야 합니다. 이는 [지원되는 배포 패턴](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge)이며, 중앙에서 구성하거나 Fleet 없이 배포하는 경우 [에이전트 구성 파일 `elastic-agent.yaml`](https://www.elastic.co/docs/reference/fleet/logstash-output)을 통해 구성할 수 있습니다.

Kibana를 통한 중앙 구성은 [Fleet에 Output을 추가](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings)하여 수행할 수 있습니다.

<Image img={add_logstash_output} alt="Logstash 출력 추가" size="md"/>

이 Output은 [에이전트 정책(agent policy)](https://www.elastic.co/docs/reference/fleet/agent-policy)에서 사용할 수 있습니다. 이렇게 하면 해당 정책을 사용하는 모든 에이전트가 자동으로 데이터를 Vector로 전송합니다.

<Image img={agent_output_settings} alt="에이전트 설정" size="md"/>

이는 TLS를 통한 보안 통신 구성이 필요하므로, Vector 인스턴스가 Logstash의 역할을 수행한다고 가정하고 따라 할 수 있는 가이드 「[Configure SSL/TLS for the Logstash output](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)」를 참고할 것을 권장합니다.

또한 Vector에서 Logstash 소스를 상호 TLS(mutual TLS)로 구성해야 합니다. 입력을 적절히 구성하기 위해 [해당 가이드에서 생성한](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs) 키와 인증서를 사용하십시오.

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: true  # TLS를 사용하는 경우 true로 설정합니다. 
      # 아래 파일들은 https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs 의 단계에서 생성됩니다.
      crt_file: logstash.crt
      key_file: logstash.key
      ca_file: ca.crt
      verify_certificate: true
```

</VerticalStepper>

### OpenTelemetry collector로 Elastic Agent 실행 \{#sending-data-via-vector\}

Elastic Agent에는 내장된 EDOT Collector가 포함되어 있어 애플리케이션과 인프라를 한 번 계측한 후 여러 벤더 및 백엔드로 데이터를 전송할 수 있습니다.

:::note Agent integrations and orchestration
Elastic Agent에 포함된 EDOT collector를 사용하는 사용자는 [에이전트에서 제공하는 기존 통합(Integration) 기능](https://www.elastic.co/docs/reference/fleet/manage-integrations)을 활용할 수 없습니다. 또한 이 collector는 Fleet에서 중앙 집중식으로 관리할 수 없으므로, 사용자가 [standalone 모드에서 에이전트를 실행](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents)하여 구성을 직접 관리해야 합니다.
:::

EDOT collector와 함께 Elastic Agent를 실행하려면 [공식 Elastic 가이드](https://www.elastic.co/docs/reference/fleet/otel-agent-transform)를 참조하십시오. 가이드에 나와 있는 것처럼 Elastic 엔드포인트를 구성하는 대신, 기존 `exporters`를 제거하고 OTLP output을 구성하여 데이터를 ClickStack OpenTelemetry collector로 전송합니다. 예를 들어, `exporters`에 대한 구성은 다음과 같이 변경합니다:

```yaml
exporters:
  # Exporter to send logs and metrics to Elasticsearch Managed OTLP Input
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: true
```

:::note Managed ClickStack
기본적으로 Managed ClickStack에서 OpenTelemetry Collector를 독립 실행형으로 실행하는 경우 API 수집 키는 필요하지 않습니다. 다만 OTLP 인증 토큰을 지정하여 수집을 보호하도록 설정할 수 있습니다. [&quot;Securing the collector&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)를 참고하십시오.
:::

여기에서 `YOUR_INGESTION_API_KEY` 는 ClickStack에서 생성됩니다. ClickStack UI의 `Team Settings → API Keys` 에서 키를 확인할 수 있습니다.

<Image img={ingestion_key} alt="수집 키" size="lg" />

Vector가 상호 TLS를 사용하도록 구성되어 있고, [&quot;Configure SSL/TLS for the Logstash output&quot;](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output) 가이드의 단계를 사용하여 인증서와 키를 생성한 경우, `otlp` exporter를 이에 맞게 구성해야 합니다. 예시는 다음과 같습니다.

```yaml
exporters:
  # Exporter to send logs and metrics to Elasticsearch Managed OTLP Input
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: ${YOUR_INGESTION_API_KEY}
    tls:
      insecure: false
      ca_file: /path/to/ca.crt
      cert_file: /path/to/client.crt
      key_file: /path/to/client.key
```


## Elastic OpenTelemetry collector에서 마이그레이션하기 {#migrating-from-elastic-otel-collector}

이미 [Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry)를 실행 중인 경우, 에이전트 구성을 변경하여 OTLP를 통해 ClickStack OpenTelemetry collector로 전송하도록 설정하면 됩니다. 필요한 단계는 위에서 설명한 [Elastic Agent를 OpenTelemetry collector로 실행](#run-agent-as-otel)하는 방법과 동일합니다. 이 방식은 모든 유형의 데이터에 사용할 수 있습니다.