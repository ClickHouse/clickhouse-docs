---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: 'All in one'
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'Deploying ClickStack with All In One - The ClickHouse Observability Stack'
doc_type: how-to
---

import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

This comprehensive Docker image bundles all ClickStack components:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector** (exposing OTLP on ports `4317` and `4318`)
* **MongoDB** (for persistent application state)

This option includes authentication, enabling the persistence of dashboards, alerts, and saved searches across sessions and users.

### Suitable for {#suitable-for}

* Demos
* Local testing of the full stack

## Deployment steps {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Deploy with Docker {#deploy-with-docker}

The following will run an OpenTelemetry collector (on port 4317 and 4318) and the HyperDX UI (on port 8080).

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui}

Visit [http://localhost:8080](http://localhost:8080) to access the HyperDX UI.

Create a user, providing a username and password which meets the requirements. 

On clicking `Create` data sources will be created for the integrated ClickHouse instance.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

For an example of using an alternative ClickHouse instance, see ["Create a ClickHouse Cloud connection"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

### Ingest data {#ingest-data}

To ingest data see ["Ingesting data"](/use-cases/observability/clickstack/ingesting-data).

</VerticalStepper>

## Persisting data and settings {#persisting-data-and-settings}

To persist data and settings across restarts of the container, users can modify the above docker command to mount the paths `/data/db`, `/var/lib/clickhouse` and `/var/log/clickhouse-server`. For example:

```shell
# ensure directories exist
mkdir -p .volumes/db .volumes/ch_data .volumes/ch_logs
# modify command to mount paths
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

## Deploying to production {#deploying-to-production}

This option should not be deployed to production for the following reasons:

- **Non-persistent storage:** All data is stored using the Docker native overlay filesystem. This setup does not support performance at scale, and data will be lost if the container is removed or restarted - unless users [mount the required file paths](#persisting-data-and-settings).
- **Lack of component isolation:** All components run within a single Docker container. This prevents independent scaling and monitoring and applies any `cgroup` limits globally to all processes. As a result, components may compete for CPU and memory.

## Customizing ports {#customizing-ports-deploy}

If you need to customize the application (8080) or API (8000) ports that HyperDX Local runs on, you'll need to modify the `docker run` command to forward the appropriate ports and set a few environment variables.

Customizing the OpenTelemetry ports can simply be changed by modifying the port forwarding flags. For example,  replacing `-p 4318:4318` with `-p 4999:4318` to change the OpenTelemetry HTTP port to 4999.

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

## Using ClickHouse Cloud {#using-clickhouse-cloud}

This distribution can be used with ClickHouse Cloud. While the local ClickHouse instance will still be deployed (and ignored), the OTel collector can be configured to use a ClickHouse Cloud instance by setting the environment variables `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` and `CLICKHOUSE_PASSWORD`. 

For example:

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

The `CLICKHOUSE_ENDPOINT` should be the ClickHouse Cloud HTTPS endpoint, including the port `8443` e.g. `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

On connecting to the HyperDX UI, navigate to [`Team Settings`](http://localhost:8080/team) and create a connection to your ClickHouse Cloud service - followed by the required sources. For an example flow, see [here](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

## Configuring the OpenTelemetry collector {#configuring-collector}

The OTel collector configuration can be modified if required - see ["Modifying configuration"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).

<JSONSupport/>

For example:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```