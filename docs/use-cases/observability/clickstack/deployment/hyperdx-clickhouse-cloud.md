---
slug: /use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud
title: 'ClickHouse Cloud'
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'Deploying ClickStack with ClickHouse Cloud'
doc_type: 'tutorial'
---

import Image from '@theme/IdealImage';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import cloud_connect from '@site/static/images/use-cases/observability/clickhouse_cloud_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';
import hyperdx_cloud_landing from '@site/static/images/use-cases/observability/hyperdx_cloud_landing.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';

<PrivatePreviewBadge/>

This option is designed for users who are using ClickHouse Cloud. In this deployment pattern, both ClickHouse and HyperDX are hosted in ClickHouse Cloud, minimizing the number of components the user needs to self-host.

As well as reducing infrastructure management, this deployment pattern ensures authentication is integrated with ClickHouse Cloud SSO/SAML. Unlike self-hosted deployments, there is also no need to provision a MongoDB instance to store application state — such as dashboards, saved searches, user settings, and alerts.

In this mode, data ingestion is entirely left to the user. You can ingest data into ClickHouse Cloud using your own hosted OpenTelemetry collector, direct ingestion from client libraries, ClickHouse-native table engines (such as Kafka or S3), ETL pipelines, or ClickPipes — ClickHouse Cloud's managed ingestion service. This approach offers the simplest and most performant way to operate ClickStack.

### Suitable for {#suitable-for}

This deployment pattern is ideal in the following scenarios:

1. You already have observability data in ClickHouse Cloud and wish to visualize it using HyperDX.
2. You operate a large observability deployment and need the dedicated performance and scalability of ClickStack with ClickHouse Cloud.
3. You're already using ClickHouse Cloud for analytics and want to instrument your application using ClickStack instrumentation libraries — sending data to the same cluster. In this case, we recommend using [warehouses](/cloud/reference/warehouses) to isolate compute for observability workloads.

## Deployment steps {#deployment-steps}

The following guide assumes you have already created a ClickHouse Cloud service. If you haven't created a service, follow the ["Create a ClickHouse service"](/getting-started/quick-start/cloud#1-create-a-clickhouse-service) step from our Quick Start guide.

<VerticalStepper headerLevel="h3">

### Copy service credentials (optional) {#copy-service-credentials}

**If you have existing observability events you wish to visualize in your service, this step can be skipped.**

Navigate to the main service listing and select the service you intend to observability events in for visualization in HyperDX.

Press the `Connect` button from the navigation menu. A modal will open offering the credentials to your service with a set of instructions on how to connect via different interfaces and languages. Select `HTTPS` from the drop down and record the connection endpoint and credentials.

<Image img={cloud_connect} alt="ClickHouse Cloud connect" size="lg"/>

### Deploy Open Telemetry Collector (optional) {#deploy-otel-collector} 

**If you have existing observability events you wish to visualize in your service, this step can be skipped.**

This step ensures tables are created with an Open Telemetry (OTel) schema, which can in turn be used seamlessly to create a data source in HyperDX. This also provides an OLTP endpoint which can be used for loading [sample datasets](/use-cases/observability/clickstack/sample-datasets) and sending OTel events to ClickStack.

:::note Use of standard Open Telemetry collector
The following instructions use the standard distribution of the OTel collector, rather than the ClickStack distribution. The latter requires an OpAMP server for configuration. This is currently not supported in private preview. The configuration below replicates the version used by the ClickStack distribution of the collector, providing an OTLP endpoint to which events can be sent.
:::

Create a `otel-file-collector.yaml` file with the following content:

```yaml
receivers:
  otlp/hyperdx:
    protocols:
      grpc:
        include_metadata: true
        endpoint: '0.0.0.0:4317'
      http:
        cors:
          allowed_origins: ['*']
          allowed_headers: ['*']
        include_metadata: true
        endpoint: '0.0.0.0:4318'
processors:
  transform:
    log_statements:
      - context: log
        error_mode: ignore
        statements:
          # JSON parsing: Extends log attributes with the fields from structured log body content, either as an OTEL map or
          # as a string containing JSON content.
          - set(log.cache, ExtractPatterns(log.body, "(?P<0>(\\{.*\\}))")) where
            IsString(log.body)
          - merge_maps(log.attributes, ParseJSON(log.cache["0"]), "upsert")
            where IsMap(log.cache)
          - flatten(log.attributes) where IsMap(log.cache)
          - merge_maps(log.attributes, log.body, "upsert") where IsMap(log.body)
      - context: log
        error_mode: ignore
        conditions:
          - severity_number == 0 and severity_text == ""
        statements:
          # Infer: extract the first log level keyword from the first 256 characters of the body
          - set(log.cache["substr"], log.body.string) where Len(log.body.string)
            < 256
          - set(log.cache["substr"], Substring(log.body.string, 0, 256)) where
            Len(log.body.string) >= 256
          - set(log.cache, ExtractPatterns(log.cache["substr"],
            "(?i)(?P<0>(alert|crit|emerg|fatal|error|err|warn|notice|debug|dbug|trace))"))
          # Infer: detect FATAL
          - set(log.severity_number, SEVERITY_NUMBER_FATAL) where
            IsMatch(log.cache["0"], "(?i)(alert|crit|emerg|fatal)")
          - set(log.severity_text, "fatal") where log.severity_number ==
            SEVERITY_NUMBER_FATAL
          # Infer: detect ERROR
          - set(log.severity_number, SEVERITY_NUMBER_ERROR) where
            IsMatch(log.cache["0"], "(?i)(error|err)")
          - set(log.severity_text, "error") where log.severity_number ==
            SEVERITY_NUMBER_ERROR
          # Infer: detect WARN
          - set(log.severity_number, SEVERITY_NUMBER_WARN) where
            IsMatch(log.cache["0"], "(?i)(warn|notice)")
          - set(log.severity_text, "warn") where log.severity_number ==
            SEVERITY_NUMBER_WARN
          # Infer: detect DEBUG
          - set(log.severity_number, SEVERITY_NUMBER_DEBUG) where
            IsMatch(log.cache["0"], "(?i)(debug|dbug)")
          - set(log.severity_text, "debug") where log.severity_number ==
            SEVERITY_NUMBER_DEBUG
          # Infer: detect TRACE
          - set(log.severity_number, SEVERITY_NUMBER_TRACE) where
            IsMatch(log.cache["0"], "(?i)(trace)")
          - set(log.severity_text, "trace") where log.severity_number ==
            SEVERITY_NUMBER_TRACE
          # Infer: else
          - set(log.severity_text, "info") where log.severity_number == 0
          - set(log.severity_number, SEVERITY_NUMBER_INFO) where log.severity_number == 0
      - context: log
        error_mode: ignore
        statements:
          # Normalize the severity_text case
          - set(log.severity_text, ConvertCase(log.severity_text, "lower"))
  resourcedetection:
    detectors:
      - env
      - system
      - docker
    timeout: 5s
    override: false
  batch:
  memory_limiter:
    # 80% of maximum memory up to 2G, adjust for low memory environments
    limit_mib: 1500
    # 25% of limit up to 2G, adjust for low memory environments
    spike_limit_mib: 512
    check_interval: 5s
connectors:
  routing/logs:
    default_pipelines: [logs/out-default]
    error_mode: ignore
    table:
      - context: log
        statement: route() where IsMatch(attributes["rr-web.event"], ".*")
        pipelines: [logs/out-rrweb]
exporters:
  debug:
    verbosity: detailed
    sampling_initial: 5
    sampling_thereafter: 200
  clickhouse/rrweb:
    database: ${env:CLICKHOUSE_DATABASE}
    endpoint: ${env:CLICKHOUSE_ENDPOINT}
    password: ${env:CLICKHOUSE_PASSWORD}
    username: ${env:CLICKHOUSE_USER}
    ttl: 720h
    logs_table_name: hyperdx_sessions
    timeout: 5s
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
  clickhouse:
    database: ${env:CLICKHOUSE_DATABASE}
    endpoint: ${env:CLICKHOUSE_ENDPOINT}
    password: ${env:CLICKHOUSE_PASSWORD}
    username: ${env:CLICKHOUSE_USER}
    ttl: 720h
    timeout: 5s
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
extensions:
  health_check:
    endpoint: :13133
service:
  pipelines:
    traces:
      receivers: [otlp/hyperdx]
      processors: [memory_limiter, batch]
      exporters: [clickhouse]
    metrics:
      receivers: [otlp/hyperdx]
      processors: [memory_limiter, batch]
      exporters: [clickhouse]
    logs/in:
      receivers: [otlp/hyperdx]
      exporters: [routing/logs]
    logs/out-default:
      receivers: [routing/logs]
      processors: [memory_limiter, transform, batch]
      exporters: [clickhouse]
    logs/out-rrweb:
      receivers: [routing/logs]
      processors: [memory_limiter, batch]
      exporters: [clickhouse/rrweb]
```

Deploy the collector using the following Docker command, setting the respective environment variables to the connection settings recorded earlier and using the appropriate command below based on your operating system.

```bash
# modify to your cloud endpoint
export CLICKHOUSE_ENDPOINT=
export CLICKHOUSE_PASSWORD=
# optionally modify 
export CLICKHOUSE_DATABASE=default

# osx
docker run --rm -it \
  -p 4317:4317 -p 4318:4318 \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -e CLICKHOUSE_DATABASE=${CLICKHOUSE_DATABASE} \
  --user 0:0 \
  -v "$(pwd)/otel-file-collector.yaml":/etc/otel/config.yaml \
  -v /var/log:/var/log:ro \
  -v /private/var/log:/private/var/log:ro \
  otel/opentelemetry-collector-contrib:latest \
  --config /etc/otel/config.yaml

# linux command

# docker run --network=host --rm -it \
#   -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
#   -e CLICKHOUSE_USER=default \
#   -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
#   -e CLICKHOUSE_DATABASE=${CLICKHOUSE_DATABASE} \
#   --user 0:0 \
#   -v "$(pwd)/otel-file-collector.yaml":/etc/otel/config.yaml \
#   -v /var/log:/var/log:ro \
#   -v /private/var/log:/private/var/log:ro \
#   otel/opentelemetry-collector-contrib:latest \
#   --config /etc/otel/config.yaml
```

:::note
In production, we recommend creating a dedicated user for ingestion, restricting access permissions to the database and tables needed. See ["Database and ingestion user"](/use-cases/observability/clickstack/production#database-ingestion-user) for further details.
:::

### Connect to HyperDX {#connect-to-hyperdx}

Select your service, then select `HyperDX` from the left menu.

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

You will not need to create a user and will be automatically authenticated, before being prompted to create a datasource.

For users looking to explore the HyperDX interface only, we recommend our [sample datasets](/use-cases/observability/clickstack/sample-datasets), which use OTel data.

<Image img={hyperdx_cloud_landing} alt="ClickHouse Cloud HyperDX Landing" size="lg"/>

### Create a data source {#create-a-datasource}

HyperDX is Open Telemetry native but not Open Telemetry exclusive - users can use their own table schemas if desired.

#### Using Open Telemetry schemas  {#using-otel-schemas}

If you're using the above OTel collector to create the database and tables within ClickHouse, retain all default values within the create source model, completing the `Table` field with the value `otel_logs` - to create a logs source. All other settings should be auto-detected, allowing you to click `Save New Source`.

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

To create sources for traces and OTel metrics, users can select `Create New Source` from the top menu.

<Image img={hyperdx_create_new_source} alt="HyperDX create new source" size="lg"/>

From here, select the required source type followed by the appropriate table e.g. for traces, select the table `otel_traces`. All settings should be auto-detected.

<Image img={hyperdx_create_trace_datasource} alt="HyperDX create trace source" size="lg"/>

:::note Correlating sources
Note that different data sources in ClickStack—such as logs and traces—can be correlated with each other. To enable this, additional configuration is required on each source. For example, in the logs source, you can specify a corresponding trace source, and vice versa in the traces source. See ["Correlated sources"](/use-cases/observability/clickstack/config#correlated-sources) for further details.
:::

#### Using custom schemas {#using-custom-schemas}

Users looking to connect HyperDX to an existing service with data can complete the database and table settings as required. Settings will be auto-detected if tables conform to the Open Telemetry schemas for ClickHouse. 

If using your own schema, we recommend creating a Logs source ensuring the required fields are specified - see ["Log source settings"](/use-cases/observability/clickstack/config#logs) for further details.

</VerticalStepper>

## JSON type support {#json-type-support}

<BetaBadge/>

ClickStack has beta support for the [JSON type](/interfaces/formats/JSON) from version `2.0.4`.

For the benefits of this type, see [Benefits of the JSON type](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type).

In order to enable support for the JSON type, users must set the following environment variables:

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - enables support in the OTel collector, ensuring schemas are created using the JSON type.

Additionally, users should contact support@clickhouse.com to ensure JSON is enabled on both their ClickHouse Cloud service.
