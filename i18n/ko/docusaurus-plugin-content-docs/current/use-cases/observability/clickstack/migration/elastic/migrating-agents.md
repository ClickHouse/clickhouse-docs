---
'slug': '/use-cases/observability/clickstack/migration/elastic/migrating-agents'
'title': 'Elastic에서 에이전트 마이그레이션'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '에이전트 마이그레이션'
'sidebar_position': 5
'description': 'Elastic에서 에이전트 마이그레이션'
'show_related_blogs': true
'keywords':
- 'ClickStack'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import add_logstash_output from '@site/static/images/use-cases/observability/add-logstash-output.png';
import agent_output_settings from '@site/static/images/use-cases/observability/agent-output-settings.png';
import migrating_agents from '@site/static/images/use-cases/observability/clickstack-migrating-agents.png';

## Elastic에서 에이전트 마이그레이션 {#migrating-agents-from-elastic}

Elastic Stack은 여러 가지 Observability 데이터 수집 에이전트를 제공합니다. 구체적으로:

- [Beats 패밀리](https://www.elastic.co/beats) - [Filebeat](https://www.elastic.co/beats/filebeat), [Metricbeat](https://www.elastic.co/beats/metricbeat), [Packetbeat](https://www.elastic.co/beats/packetbeat)과 같은 ─ 모두 `libbeat` 라이브러리를 기반으로 합니다. 이 Beats는 Lumberjack 프로토콜을 통해 [Elasticsearch, Kafka, Redis 또는 Logstash로 데이터 전송](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output)을 지원합니다.
- [`Elastic Agent`](https://www.elastic.co/elastic-agent)는 로그, 메트릭 및 추적을 수집할 수 있는 통합 에이전트를 제공합니다. 이 에이전트는 [Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet)를 통해 중앙에서 관리할 수 있으며 Elasticsearch, Logstash, Kafka 또는 Redis로 출력을 지원합니다.
- Elastic은 [OpenTelemetry Collector - EDOT](https://www.elastic.co/docs/reference/opentelemetry)의 배포판도 제공합니다. 현재 Fleet Server에 의해 오케스트레이션될 수는 없지만 사용자가 ClickStack으로 마이그레이션하는 보다 유연하고 열린 경로를 제공합니다.

최상의 마이그레이션 경로는 현재 사용 중인 에이전트에 따라 달라집니다. 다음 섹션에서는 각 주요 에이전트 유형에 대한 마이그레이션 옵션을 문서화합니다. 우리의 목표는 마찰을 최소화하고, 가능한 경우 전환 중에 사용자가 기존 에이전트를 계속 사용할 수 있도록 하는 것입니다.

## 선호하는 마이그레이션 경로 {#prefered-migration-path}

가능한 경우 모든 로그, 메트릭 및 추적 수집을 위해 [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/)로 마이그레이션할 것을 권장하며, 수집기를 [에지의 에이전트 역할로](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 배포하는 것을 권장합니다. 이는 데이터를 전송하는 가장 효율적인 수단을 나타내며 아키텍처의 복잡성과 데이터 변환을 피합니다.

:::note OpenTelemetry Collector의 이유
OpenTelemetry Collector는 Observability 데이터 수집을 위한 지속 가능한 공급업체 중립 솔루션을 제공합니다. 일부 조직이 수천 개 또는 수만 개의 Elastic 에이전트를 운영하고 있다는 것을 인식하고 있습니다. 이러한 사용자에게 기존 에이전트 인프라와의 호환성을 유지하는 것이 중요할 수 있습니다. 이 문서에서는 이를 지원하는 동시에 팀이 OpenTelemetry 기반 수집으로 점진적으로 전환할 수 있도록 도와줍니다.
:::

## ClickHouse OpenTelemetry 엔드포인트 {#clickhouse-otel-endpoint}

모든 데이터는 로그, 메트릭, 추적 및 세션 데이터를 위한 기본 진입점 역할을 하는 **OpenTelemetry (OTel) collector** 인스턴스를 통해 ClickStack으로 수집됩니다. 이 인스턴스에 대해 공식 [ClickStack 배포판](/use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector)을 사용하는 것을 권장하며, [이미 ClickStack 배포 모델에 포함되어 있지 않은 경우](/use-cases/observability/clickstack/deployment).

사용자는 [언어 SDKs](/use-cases/observability/clickstack/sdks) 또는 인프라 메트릭 및 로그를 수집하는 데이터 수집 에이전트를 통해 이 수집기에 데이터를 보냅니다 (예: [에이전트](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 역할의 OTel 수집기 또는 기타 기술 예: [Fluentd](https://www.fluentd.org/) 또는 [Vector](https://vector.dev)).

**이 수집기가 모든 에이전트 마이그레이션 단계에 사용할 수 있다고 가정합니다**.

## beats에서 마이그레이션 {#migrating-to-beats}

광범위한 Beats 배포를 가진 사용자는 ClickStack으로 마이그레이션할 때 이를 유지하고 싶어 할 수 있습니다.

**현재 이 옵션은 Filebeat에 대해서만 테스트되었으며, 따라서 로그에만 적합합니다.**

Beats 에이전트는 현재 [OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md) 사양으로 통합되는 [Elastic 공통 스키마 (ECS)](https://www.elastic.co/docs/reference/ecs)를 사용합니다. 그러나 이러한 [스키마는 여전히 상당한 차이를 보입니다](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview), 현재 사용자는 ClickStack으로 수집하기 전에 ECS 형식의 이벤트를 OpenTelemetry 형식으로 변환해야 합니다.

이 변환은 [Vector](https://vector.dev) 를 사용하여 수행하는 것을 권장합니다. Vector는 강력한 변환 언어인 Vector Remap Language (VRL)을 지원하는 경량 및 고성능 Observability 데이터 파이프라인입니다.

Filebeat 에이전트가 Kafka로 데이터를 보내도록 구성된 경우 - Beats에 의해 지원되는 출력 - Vector는 Kafka에서 해당 이벤트를 수집하고 VRL을 사용하여 스키마 변환을 적용한 후 OTLP를 통해 ClickStack과 함께 배포되는 OpenTelemetry Collector로 전달할 수 있습니다.

또는 Vector는 Logstash에서 사용하는 Lumberjack 프로토콜을 통해 이벤트를 수신하는 것도 지원합니다. 이를 통해 Beats 에이전트는 Vector로 직접 데이터를 전송할 수 있으며, 이후 ClickStack OpenTelemetry Collector로 OTLP를 통해 전달하기 전에 동일한 변환 프로세스를 적용할 수 있습니다.

아래에서 이러한 두 가지 아키텍처를 설명합니다.

<Image img={migrating_agents} alt="Migrating agents" size="lg" background/>

다음 예시에서는 Vector를 구성하여 Lumberjack 프로토콜을 통해 Filebeat에서 로그 이벤트를 수신하는 초기 단계를 제공합니다. VRL을 제공하여 수신된 ECS 이벤트를 OTel 사양으로 매핑하고, 이를 ClickStack OpenTelemetry 수집기로 OTLP를 통해 전송합니다. Kafka에서 이벤트를 수신하는 사용자는 Vector Logstash 소스를 [Kafka 소스](https://vector.dev/docs/reference/configuration/sources/kafka/)로 대체할 수 있으며 - 다른 모든 단계는 동일하게 유지됩니다.

<VerticalStepper headerLevel="h3">

### Vector 설치 {#install-vector}

[공식 설치 가이드](https://vector.dev/docs/setup/installation/)를 사용하여 Vector를 설치합니다.

이는 Elastic Stack OTel 수집기와 동일한 인스턴스에 설치할 수 있습니다.

사용자는 [Vector를 프로덕션으로 이동](https://vector.dev/docs/setup/going-to-prod/)할 때 아키텍처 및 보안과 관련하여 최선의 관행을 따를 수 있습니다.

### Vector 구성 {#configure-vector}

Vector는 Lumberjack 프로토콜을 통해 이벤트를 수신하도록 구성해야 하며, Logstash 인스턴스를 모방합니다. 이는 Vector에 대한 [`logstash` 소스](https://vector.dev/docs/reference/configuration/sources/logstash/)를 구성하여 달성할 수 있습니다.

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
상호 TLS가 필요한 경우 Elastic 가이드 ["Logstash 출력에 대한 SSL/TLS 구성"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)을 사용하여 인증서 및 키를 생성합니다. 그런 다음 위와 같이 구성에서 지정할 수 있습니다.
:::

이벤트는 ECS 형식으로 수신됩니다. 이러한 이벤트는 Vector Remap Language (VRL) 변환기를 사용하여 OpenTelemetry 스키마로 변환할 수 있습니다. 이 변환기의 구성은 간단하며, 스크립트 파일이 별도의 파일에 보관됩니다:

```yaml
transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: 'beat_to_otel.vrl'
```

위의 `beats` 소스에서 이벤트를 수신한다고 가정하십시오. 우리의 리맵 스크립트는 아래에 표시됩니다. 이 스크립트는 로그 이벤트에 대해서만 테스트되었지만 다른 형식에 대한 기초가 될 수 있습니다.

<details>
<summary>VRL - ECS에서 OTel로</summary>

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

마지막으로 변환된 이벤트는 OTLP를 통해 ClickStack에 있는 OpenTelemetry 수집기로 전송될 수 있습니다. 이를 위해서는 Vector에서 OTLP 싱크를 구성해야 하며, 이는 `remap_filebeat` 변환에서 이벤트를 입력으로 받아들입니다:

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

여기서 `YOUR_INGESTION_API_KEY`는 ClickStack에 의해 생성됩니다. 키는 HyperDX 앱의 `Team Settings → API Keys`에서 찾을 수 있습니다.

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

최종 완전한 구성은 아래에 표시됩니다:

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

### Filebeat 구성 {#configure-filebeat}

기존의 Filebeat 설치는 단순히 Vector로 이벤트를 보내도록 수정되어야 합니다. 이를 위해 Logstash 출력을 구성해야 하며 - 다시 말하지만 TLS는 선택적으로 구성할 수 있습니다:

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

## Elastic Agent에서 마이그레이션 {#migrating-from-elastic-agent}

Elastic Agent는 여러 Elastic Beats를 단일 패키지로 통합합니다. 이 에이전트는 [Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server)와 통합되어 중앙에서 오케스트레이션 및 구성할 수 있습니다.

Elastic Agents가 배포된 사용자는 여러 가지 마이그레이션 경로가 있습니다:

- 에이전트를 Lumberjack 프로토콜을 통해 Vector 엔드포인트로 보내도록 구성합니다. **현재 이 옵션은 Elastic Agent로 로그 데이터를 수집하는 사용자에 대해서만 테스트되었습니다.** 이는 Kibana의 Fleet UI를 통해 중앙에서 구성할 수 있습니다.
- [Elastic OpenTelemetry Collector (EDOT)로 에이전트 실행](https://www.elastic.co/docs/reference/fleet/otel-agent). Elastic Agent에는 한 번 애플리케이션과 인프라를 계측한 후 여러 공급업체 및 백엔드로 데이터를 전송할 수 있도록 하는 임베디드 EDOT Collector가 포함되어 있습니다. 이 구성에서는 사용자가 EDOT 수집기를 구성하여 OTLP를 통해 ClickStack OTel 수집기로 이벤트를 전달할 수 있습니다. **이 접근 방식은 모든 이벤트 유형을 지원합니다.**

아래에서 이 두 가지 옵션을 모두 보여줍니다.

### Vector를 통한 데이터 전송 {#sending-data-via-vector}

<VerticalStepper headerLevel="h4">

#### Vector 설치 및 구성 {#install-configure-vector}

Filebeat에서 마이그레이션하는 문서와 동일한 단계로 [Vector를 설치 및 구성](#install-vector)합니다.

#### Elastic Agent 구성 {#configure-elastic-agent}

Elastic Agent는 Lumberjack 프로토콜을 통해 데이터를 전송하도록 구성해야 합니다. 이는 [지원되는 배포 패턴](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge)이며, 중앙에서 구성하거나 [에이전트 구성 파일 `elastic-agent.yaml`](https://www.elastic.co/docs/reference/fleet/logstash-output)를 통해 구성할 수 있습니다(비 Fleet 배포 시).

Kibana를 통한 중앙 구성은 [Fleet에 출력을 추가](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings)함으로써 달성할 수 있습니다.

<Image img={add_logstash_output} alt="Add Logstash output" size="md"/>

이 출력을 [에이전트 정책](https://www.elastic.co/docs/reference/fleet/agent-policy)에서 사용할 수 있습니다. 이는 정책을 사용하는 모든 에이전트가 자동으로 데이터를 Vector로 전송하게 만듭니다.

<Image img={agent_output_settings} alt="Agent settings" size="md"/>

이것은 TLS를 통한 안전한 통신 구성이 필요하므로 ["Logstash 출력을 위한 SSL/TLS 구성" 가이드](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)를 권장합니다. 이 가이드를 따라 사용자가 Vector 인스턴스가 Logstash 역할을 맡는다고 가정할 수 있습니다.

사용자는 Vector에서 Logstash 소스를 구성하여 상호 TLS도 구성해야 합니다. [가이드에서 생성된 키 및 인증서](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs)를 사용하여 입력을 적절하게 구성합니다.

```yaml
sources:
  beats:
    type: logstash
    address: 0.0.0.0:5044
    tls:
      enabled: true  # Set to true if you're using TLS. 
      # The files below are generated from the steps at https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs
      crt_file: logstash.crt
      key_file: logstash.key
      ca_file: ca.crt
      verify_certificate: true
```

</VerticalStepper>

### OpenTelemetry 수집기로서 Elastic Agent 실행 {#run-agent-as-otel}

Elastic Agent에는 한 번 애플리케이션과 인프라를 계측한 후 여러 공급업체 및 백엔드로 데이터를 전송할 수 있도록 하는 임베디드 EDOT Collector가 포함되어 있습니다.

:::note 에이전트 통합 및 오케스트레이션
Elastic Agent와 함께 배포된 EDOT collector를 실행하는 사용자는 [에이전트가 제공하는 기존 통합](https://www.elastic.co/docs/reference/fleet/manage-integrations)을 활용할 수 없습니다. 또한 수집기는 Fleet에 의해 중앙에서 관리될 수 없으며 - 사용자가 [독립형 모드로 에이전트를 실행해야 하며](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents), 구성을 직접 관리해야 합니다.
:::

Elastic Agent를 EDOT collector와 함께 실행하려면 [공식 Elastic 가이드](https://www.elastic.co/docs/reference/fleet/otel-agent-transform)를 참조하십시오. 가이드에 표시된 대로 Elastic 엔드포인트를 구성하는 대신 기존 `exporters`를 제거하고 OTLP 출력을 구성하여 ClickStack OpenTelemetry collector로 데이터를 전송합니다. 예를 들어, 출력에 대한 구성은 다음과 같습니다:

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

여기서 `YOUR_INGESTION_API_KEY`는 ClickStack에 의해 생성됩니다. 키는 HyperDX 앱의 `Team Settings → API Keys`에서 찾을 수 있습니다.

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

Vector가 상호 TLS를 사용하도록 구성되어 있고, ["Logstash 출력을 위한 SSL/TLS 구성" 가이드](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output)에서 제공된 단계에 따라 인증서 및 키가 생성된 경우 `otlp` exporter는 accordingly로 구성해야 합니다. 예를 들어:

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

## Elastic OpenTelemetry 수집기에서 마이그레이션 {#migrating-from-elastic-otel-collector}

이미 [Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry)를 실행 중인 사용자는 에이전트를 OpenTelemetry collector로 ClickStack으로 OTLP를 통해 보내도록 간단히 재구성할 수 있습니다. 이 과정은 [OpenTelemetry 수집기로서 Elastic Agent 실행](#run-agent-as-otel)에서 설명한 것과 동일한 단계를 따릅니다. 이 접근 방식은 모든 데이터 유형에 사용할 수 있습니다.
