---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-agents
title: 'Migrating agents from Elastic'
pagination_prev: null
pagination_next: null
sidebar_label: 'Migrating agents'
sidebar_position: 5
description: 'Migrating agents from Elastic'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'how-to'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import add_logstash_output from '@site/static/images/use-cases/observability/add-logstash-output.png';
import agent_output_settings from '@site/static/images/use-cases/observability/agent-output-settings.png';
import migrating_agents from '@site/static/images/use-cases/observability/clickstack-migrating-agents.png';

## Migrating agents from Elastic {#migrating-agents-from-elastic}

The Elastic Stack provides a number of Observability data collection agents. Specifically:

- The [Beats family](https://www.elastic.co/beats) - such as [Filebeat](https://www.elastic.co/beats/filebeat), [Metricbeat](https://www.elastic.co/beats/metricbeat), and [Packetbeat](https://www.elastic.co/beats/packetbeat) - all based on the `libbeat` library. These Beats support [sending data to Elasticsearch, Kafka, Redis, or Logstash](https://www.elastic.co/docs/reference/beats/filebeat/configuring-output) over the Lumberjack protocol.
- The [`Elastic Agent`](https://www.elastic.co/elastic-agent) provides a unified agent capable of collecting logs, metrics, and traces. This agent can be centrally managed via the [Elastic Fleet Server](https://www.elastic.co/docs/reference/fleet/manage-elastic-agents-in-fleet) and supports output to Elasticsearch, Logstash, Kafka, or Redis.
- Elastic also provides a distribution of the [OpenTelemetry Collector - EDOT](https://www.elastic.co/docs/reference/opentelemetry). While it currently cannot be orchestrated by the Fleet Server, it offers a more flexible and open path for users migrating to ClickStack.

The best migration path depends on the agent(s) currently in use. In the sections that follow, we document migration options for each major agent type. Our goal is to minimize friction and, where possible, allow users to continue using their existing agents during the transition.

## Preferred migration path {#prefered-migration-path}

Where possible we recommend migrating to the [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/) for all log, metric, and trace collection, deploying the collector at the [edge in an agent role](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles). This represents the most efficient means of sending data and avoids architectural complexity and data transformation.

:::note Why OpenTelemetry Collector?
The OpenTelemetry Collector provides a sustainable and vendor-neutral solution for observability data ingestion. We recognize that some organizations operate fleets of thousands—or even tens of thousands—of Elastic agents. For these users, maintaining compatibility with existing agent infrastructure may be critical. This documentation is designed to support this, while also helping teams gradually transition to OpenTelemetry-based collection.
:::

## ClickHouse OpenTelemetry endpoint {#clickhouse-otel-endpoint}

All data is ingested into ClickStack via an **OpenTelemetry (OTel) collector** instance, which acts as the primary entry point for logs, metrics, traces, and session data. We recommend using the official [ClickStack distribution](/use-cases/observability/clickstack/ingesting-data/opentelemetry#installing-otel-collector) of the collector for this instance, if not [already bundled in your ClickStack deployment model](/use-cases/observability/clickstack/deployment).

Users send data to this collector from [language SDKs](/use-cases/observability/clickstack/sdks) or through data collection agents collecting infrastructure metrics and logs (such OTel collectors in an [agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) role or other technologies e.g. [Fluentd](https://www.fluentd.org/) or [Vector](https://vector.dev/)).

**We assume this collector is available for all agent migration steps**.

## Migrating from beats {#migrating-to-beats}

Users with extensive Beat deployments may wish to retain these when migrating to ClickStack.

**Currently this option has only been tested with Filebeat, and is therefore appropriate for Logs only.**

Beats agents use the [Elastic Common Schema (ECS)](https://www.elastic.co/docs/reference/ecs), which is currently [in the process of being merged into the OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0199-support-elastic-common-schema-in-opentelemetry.md) specification used by ClickStack. However, these [schemas still differ significantly](https://www.elastic.co/docs/reference/ecs/ecs-otel-alignment-overview), and users are currently responsible for transforming ECS-formatted events into OpenTelemetry format before ingestion into ClickStack.

We recommend performing this transformation using [Vector](https://vector.dev), a lightweight and high-performance observability data pipeline that supports a powerful transformation language called Vector Remap Language (VRL). 

If your Filebeat agents are configured to send data to Kafka - a supported output by Beats - Vector can consume those events from Kafka, apply schema transformations using VRL, and then forward them via OTLP to the OpenTelemetry Collector distributed with ClickStack.

Alternatively, Vector also supports receiving events over the Lumberjack protocol used by Logstash. This enables Beats agents to send data directly to Vector, where the same transformation process can be applied before forwarding to the ClickStack OpenTelemetry Collector via OTLP.

We illustrate both of these architectures below.

<Image img={migrating_agents} alt="Migrating agents" size="lg" background/>

In the following example, we provide the initial steps to configure Vector to receive log events from Filebeat via the Lumberjack protocol. We provide VRL for mapping the inbound ECS events to OTel specification, before sending these to the ClickStack OpenTelemetry collector via OTLP. Users consuming events from Kafka can replace the Vector Logstash source with the [Kafka source](https://vector.dev/docs/reference/configuration/sources/kafka/) - all other steps remain the same.

<VerticalStepper headerLevel="h3">

### Install vector {#install-vector}

Install Vector using the [official installation guide](https://vector.dev/docs/setup/installation/).

This can be installed on the same instance as your Elastic Stack OTel collector.

Users can follow best practices with regards to architecture and security when [moving Vector to production](https://vector.dev/docs/setup/going-to-prod/).

### Configure vector {#configure-vector}

Vector should be configured to receive events over the Lumberjack protocol, imitating a Logstash instance. This can be achieved by configuring a [`logstash` source](https://vector.dev/docs/reference/configuration/sources/logstash/) for Vector:

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

:::note TLS configuration
If Mutual TLS is required, generate certificates and keys using the Elastic guide ["Configure SSL/TLS for the Logstash output"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output). These can then be specified in the configuration as shown above.
:::

Events will be received in ECS format. These can be converted to the OpenTelemetry schema using a Vector Remap Language (VRL) transformer. Configuration of this transformer is simple - with the script file held in a separate file:

```yaml
transforms:
  remap_filebeat:
    inputs: ["beats"]
    type: "remap"
    file: 'beat_to_otel.vrl'
```

Note it receives events from the above `beats` source. Our remap script is shown below. This script has been tested with log events only but can form the basis for other formats.

<details>
<summary>VRL - ECS to OTel</summary>

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

Finally, transformed events can be sent to ClickStack via OpenTelemetry collector over OTLP. This requires the configuration of a OTLP sink in Vector, which takes events from the `remap_filebeat` transform as input:

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

The `YOUR_INGESTION_API_KEY` here is produced by ClickStack. You can find the key in the HyperDX app under `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

Our final complete configuration is shown below:

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

### Configure Filebeat {#configure-filebeat}

Existing Filebeat installations simply need to be modified to send their events to Vector. This requires the configuration of a Logstash output - again, TLS can be optionally configured:

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

## Migrating from Elastic Agent {#migrating-from-elastic-agent}

The Elastic Agent consolidates the different Elastic Beats into a single package. This agent integrates with [Elastic Fleet](https://www.elastic.co/docs/reference/fleet/fleet-server), allowing it to be centrally orchestrated and configured.

Users with Elastic Agents deployed have several migration paths:

- Configure the agent to send to a Vector endpoint over the Lumberjack protocol. **This has currently been tested for users collecting log data with the Elastic Agent only.** This can be centrally configured via the Fleet UI in Kibana.
- [Run the agent as Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/fleet/otel-agent). The Elastic Agent includes an embedded EDOT Collector that allows you to instrument your applications and infrastructure once and send data to multiple vendors and backends. In this configuration, users can simply configure the EDOT collector to forward events to the ClickStack OTel collector over OTLP. **This approach supports all event types.**

We demonstrate both of these options below.

### Sending data via Vector {#sending-data-via-vector}

<VerticalStepper headerLevel="h4">

#### Install and configure Vector {#install-configure-vector}

Install and configure Vector using the [same steps](#install-vector) as those documented for migrating from Filebeat.

#### Configure Elastic Agent {#configure-elastic-agent}

Elastic Agent needs to be configured to send data via the Logstash protocol Lumberjack. This is a [supported deployment pattern](https://www.elastic.co/docs/manage-data/ingest/ingest-reference-architectures/ls-networkbridge) and can either be configured centrally or [via the agent configuration file `elastic-agent.yaml`](https://www.elastic.co/docs/reference/fleet/logstash-output) if deploying without Fleet.

Central configuration through Kibana can be achieved by adding [an Output to Fleet](https://www.elastic.co/docs/reference/fleet/fleet-settings#output-settings).

<Image img={add_logstash_output} alt="Add Logstash output" size="md"/>

This output can then be used in an [agent policy](https://www.elastic.co/docs/reference/fleet/agent-policy). This will automatically mean any agents using the policy will send their data to Vector.

<Image img={agent_output_settings} alt="Agent settings" size="md"/>

Since this requires secure communication over TLS to be configured, we recommend the guide ["Configure SSL/TLS for the Logstash output"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output), which can be followed with the user assuming their Vector instance assumes the role of Logstash.

Note that this requires users to configure the Logstash source in Vector to also mutual TLS. Use the keys and certificates [generated in the guide](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#generate-logstash-certs) to configure the input appropriately.

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

### Run Elastic Agent as OpenTelemetry collector {#run-agent-as-otel}

The Elastic Agent includes an embedded EDOT Collector that allows you to instrument your applications and infrastructure once and send data to multiple vendors and backends.

:::note Agent integrations and orchestration
Users running the EDOT collector distributed with Elastic Agent will not be able to exploit the [existing integrations offered by the agent](https://www.elastic.co/docs/reference/fleet/manage-integrations). Additionally, the collector cannot be centrally managed by Fleet - forcing the user to run the [agent in standalone mode](https://www.elastic.co/docs/reference/fleet/configure-standalone-elastic-agents), managing configuration themselves.
:::

To run the Elastic Agent with the EDOT collector, see the [official Elastic guide](https://www.elastic.co/docs/reference/fleet/otel-agent-transform). Rather than configuring the Elastic endpoint, as indicated in the guide, remove existing `exporters` and configure the OTLP output - sending data to the ClickStack OpenTelemetry collector. For example, the configuration for the exporters becomes:

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

The `YOUR_INGESTION_API_KEY` here is produced by ClickStack. You can find the key in the HyperDX app under `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

If Vector has been configured to use mutual TLS, with the certificate and keys generated using the steps from the guide ["Configure SSL/TLS for the Logstash output"](https://www.elastic.co/docs/reference/fleet/secure-logstash-connections#use-ls-output), the `otlp` exporter will need to be configured accordingly e.g.

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

## Migrating from the Elastic OpenTelemetry collector {#migrating-from-elastic-otel-collector}

Users already running the [Elastic OpenTelemetry Collector (EDOT)](https://www.elastic.co/docs/reference/opentelemetry) can simply reconfigure their agents to send to ClickStack OpenTelemetry collector via OTLP. The steps involved are identical to those outlined above for running the [Elastic Agent as an OpenTelemetry collector](#run-agent-as-otel). This approach can be used for all data types.
