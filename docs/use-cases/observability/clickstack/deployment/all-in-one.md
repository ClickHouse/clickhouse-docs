---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: 'All in one'
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'Deploying ClickStack with All In One - The ClickHouse Observability Stack'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

This comprehensive Docker image bundles all ClickStack components:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector** (exposing OTLP on ports `4317` and `4318`)
* **MongoDB** (for persistent application state)

This option includes authentication, enabling persistence of dashboards, alerts, and saved searches across sessions and users.

### Suitable for {#suitable-for}

* Demos
* Local testing of the full stack

## Deployment steps {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Deploy with Docker {#deploy-with-docker}

The following will run an OpenTelemetry collector (on port 4317 and 4318), Clickhouse (on port 8123), and the HyperDX UI (on port 8080).

```bash
docker run -p 8080:8080 -p 8123:8123 -p 4317:4317 -p 4318:4318 hyperdx/hyperdx-all-in-one:2-beta.16
```

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui}

Visit [http://localhost:8080](http://localhost:8080) to access the HyperDX UI.

Create a user, providing a username and password which means the requirements. 

On clicking `Register` you'll be prompted for connection details.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### Complete connection details {#complete-connection-details}

To use the in-built ClickHouse instance, simply click **Create** and accept the default settings.  

If you prefer to connect to your own **external ClickHouse cluster** e.g. ClickHouse Cloud, you can manually enter your connection credentials.

If prompted to create a source, retain all default values and complete the `Table` field with the value `otel_logs`. All other settings should be auto-detected, allowing you to click `Save New Source`.

<Image img={hyperdx_logs} alt="Create logs source" size="md"/>

</VerticalStepper>

## Deploying to production {#deploying-to-production}

This option should not be deployed to production for the following reasons:

- **Non-persistent storage:** All data is stored using the Docker native overlay filesystem. This setup does not support performance at scale and data will be lost if the container is removed or restarted.
- **Lack of component isolation:** All components run within a single Docker container. This prevents independent scaling and monitoring, and applies any cgroup limits globally to all processes. As a result, components may compete for CPU and memory,

## Customizing ports {#customizing-ports-deploy}

If you need to customize the app (8080) or api (8000) ports that HyperDX Local runs on, you'll need to modify the `docker run` command to forward the appropriate ports and set a few environment variables.

Customizing the OpenTelemetry ports can simply be changed by modifying the port forwarding flags. Ex. Replacing `-p 4318:4318` with `-p 4999:4318` to change the OpenTelemetry HTTP port to 4999.

```bash
docker run -p 8080:8080 -p 8123:8123 -p 4317:4317 -p 4999:4318 hyperdx/hyperdx-all-in-one:2-beta.16
```

## Using ClickHouse Cloud {#using-clickhouse-cloud}

This distribution can be used with ClickHouse Cloud. While the local ClickHouse instance will still be deployed (and ignored), the OTel collector can be configured to use a ClickHouse Cloud instance by setting the environment variables `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` and `CLICKHOUSE_PASSWORD`. 

For example:

```bash
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 hyperdx/hyperdx-all-in-one:2-nightly
```

The `CLICKHOUSE_ENDPOINT` should be the ClickHouse Cloud HTTPS endpoint, including the port `8443` e.g. `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

On connecting to the HyperDX UI and creating a connection to ClickHouse, use your Cloud credentials.

## Configuring the OpenTelemetry collector {#configuring-collector}

The OTel collector configuration can be modified if required - see ["Modifying configuration"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).
