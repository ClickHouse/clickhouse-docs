---
slug: /use-cases/observability/clickstack/getting-started
title: 'Getting Started'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'Getting started with ClickStack - The ClickHouse Observability Stack'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud-creds.png';
import add_connection from '@site/static/images/use-cases/observability/add_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import create_cloud_connection from '@site/static/images/use-cases/observability/create_cloud_connection.png';
import delete_source from '@site/static/images/use-cases/observability/delete_source.png';
import delete_connection from '@site/static/images/use-cases/observability/delete_connection.png';
import created_sources from '@site/static/images/use-cases/observability/created_sources.png';


# Getting started with ClickStack {#getting-started-with-clickstack}

Getting started with **ClickStack** is straightforward thanks to the availability of prebuilt Docker images. These images are based on the official ClickHouse Debian package and are available in multiple distributions to suit different use cases.

## Local deployment {#local-deployment}

The simplest option is a **single-image distribution** that includes all core components of the stack bundled together:

- **HyperDX UI**
- **OpenTelemetry (OTel) collector**
- **ClickHouse**

This all-in-one image allows you to launch the full stack with a single command, making it ideal for testing, experimentation, or quick local deployments.

<VerticalStepper headerLevel="h3">

### Deploy stack with docker {#deploy-stack-with-docker}

The following will run an OpenTelemetry collector (on port 4317 and 4318), Clickhouse (on port 8123), and the HyperDX UI (on port 8080).

```bash
docker run -p 8080:8080 -p 8123:8123 -p 4317:4317 -p 4318:4318 hyperdx/hyperdx-all-in-one:2-beta.16
```

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui}

Visit [http://localhost:8080](http://localhost:8080) to access the HyperDX UI.

Create a user, providing a username and password which meets the complexity requirements. 

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDX will automatically connect to the local cluster and create data sources for the logs, traces, metrics and sessions - allowing you to explore the product immediately.

### Explore the product {#explore-the-product}

With the stack deployed, try one of our same datasets.

To continue using the local cluster:

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - Load an example dataset from our public demo. Diagnose a simple issue.
- [Local files and metrics](/use-cases/observability/clickstack/getting-started/local-data) - Load local files and monitor system on OSX or Linux using a local OTel collector.

<br/>
Alternatively, you can connect to a demo cluster where can explore a larger dataset: 

- [Remote demo dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data) - Explore a demo dataset in our demo ClickHouse service.

</VerticalStepper>

## Deploy with ClickHouse Cloud {#deploy-with-clickhouse-cloud}

Users can deploy ClickStack against ClickHouse Cloud, benefiting from a fully managed, secure backend while retaining complete control over ingestion, schema, and observability workflows.

<VerticalStepper headerLevel="h3">

### Create a ClickHouse Cloud service {#create-a-service}

Follow the [getting started guide for ClickHouse Cloud](/cloud/get-started/cloud-quick-start#1-create-a-clickhouse-service) to create a service.

### Copy connection details {#copy-cloud-connection-details}

To find the connection details for HyperDX, navigate to the ClickHouse Cloud console and click the <b>Connect</b> button on the sidebar. 

Copy the the HTTP connection details specifically the HTTPS endpoint (endpoint) and password.

<Image img={connect_cloud} alt="Connect Cloud" size="md"/>

:::note Deploying to production
While we will use the `default` user to connect HyperDX, we recommend creating a dedicated user when [going to production](/use-cases/observability/clickstack/production#create-a-user).
:::

### Deploy with docker {#deploy-with-docker}

Open a terminal and export the credentials copied above:

```bash
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

Run the following docker command:

```bash
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 hyperdx/hyperdx-all-in-one:2-nightly
```

This will expose an OpenTelemetry collector (on port 4317 and 4318), and the HyperDX UI (on port 8080).

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui-cloud}

Visit [http://localhost:8080](http://localhost:8080) to access the HyperDX UI.

Create a user, providing a username and password which means the complexity requirements. 

<Image img={hyperdx_login} alt="HyperDX Login" size="lg"/>

### Create a ClickHouse Cloud connection {#create-a-cloud-connection}

Navigate to `Team Settings` and click `Add Connection`:

<Image img={add_connection} alt="Add Connection" size="lg"/>

Complete the subsequent form with your ClickHouse Cloud service credentials before clicking `Create`:

<Image img={create_cloud_connection} alt="Create Cloud connection" size="lg"/>

### Remove current sources {#remove-current-sources}

We recommend removing current sources for logs, traces, metrics and sessions. Scroll up to `Sources`, select each source and click `Delete`.

<Image img={delete_source} alt="Delete source" size="lg"/>

Also remove the `Local ClickHouse` connection.

<Image img={delete_connection} alt="Delete connection" size="lg"/>


### Create sources {#create-sources}

In order to view data we need to create a data source for each of our data types: logs, metrics, traces and sessions.

Create a `Logs`, `Traces`, `Metrics` and `Sessions` source using the following details for each. If not specified, settings should be automatically infered from the schema.

#### Logs {#logs}

- `Name`: `Logs`
- `Source Data Type`: `Log`
- `Server Connection`: `Cloud`
- `Database`: `Default`
- `Table`: `otel_logs`

<br/>

#### Traces {#traces}

- `Name`: `Traces`
- `Source Data Type`: `Trace`
- `Server Connection`: `Cloud`
- `Database`: `Default`
- `Table`: `otel_traces`
- `Correlated Log Source`: `Logs`

<br/>

#### Metrics {#metrics}

- `Name`: `Metrics`
- `Source Data Type`: `OTEL Metrics`
- `Server Connection`: `Cloud`
- `Database`: `Default`
- `Table`: `otel_traces`
- `Gauge Table`: `otel_metrics_gauge`
- `Histogram Table`: `otel_metrics_histogram`
- `Sum Table`: `otel_metrics_sum`
- `Summary Table`: `otel_metrics_summary`
- `Exponential Histogram Table`: `otel_metrics_exponential_histogram`
- `Correlated Log Source`: `Logs`

<br/>

#### Sessions {#sessions}

- `Name`: `Sessions`
- `Source Data Type`: `Session`
- `Server Connection`: `Cloud`
- `Database`: `Default`
- `Table`: `hyperdx_sessions`
- `Correlated Trace Source`: `Traces`

<br/>

When finished you should have a source for each data type:

<Image img={created_sources} alt="Created sources" size="lg"/>

### Correlate sources {#correlate-sources}

Correlating sources allows HyperDX to link logs, traces, metrics, and sessions - enabling rich context when navigating incidents and debugging issues.

Edit each source ensuring the following fields are completed for each source:

#### Logs {#logs}

To edit the `Logs` source you will need to select the source and click `Configure Optional Fields`.

- `Name`: `Logs`
- `Correlated Metric Source`: `Metrics`
- `Correlated Trace Source`: `Traces`

<br/>

#### Traces {#traces}

- `Name`: `Traces`
- `Correlated Session Source`: `Sessions`
- `Correlated Metric Source`: `Metrics`

<br/>

### Explore the product {#explore-the-product-cloud}

With the stack deployed, try one of our same datasets.

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - Load an example dataset from our public demo. Diagnose a simple issue.
- [Local files and metrics](/use-cases/observability/clickstack/getting-started/local-data) - Load local files and monitor system on OSX or Linux using a local OTel collector.

</VerticalStepper>

## Local mode {#local-mode}

Local mode is a way to deploy HyperDX without a database or OTel collector. You can connect directly to a Clickhouse server from your browser directly, with configuration stored locally in your browser's local or session storage. This image **only** includes the HyperDX UI. 

Authentication is not supported. 

This mode is is intended to be used for quick testing, development, demos and debugging use cases where deploying a full HyperDX instance is not necessary.

### Hosted Version {#hosted-version}

You can use a hosted of version HyperDX in local mode available at [play.hyperdx.io](https://play.hyperdx.io).

### Self-Hosted Version {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Run with docker {#run-local-with-docker}

The self-hosted local mode image comes with an OpenTelemetry collector and a Clickhouse server pre-configured as well. This makes it easy to consume telemetry data from your applications and visualize it in HyperDX with minimal external setup. To get started with the self-hosted version, simply run the Docker container with the appropriate ports forwarded:

```bash
docker run -p 8080:8080 hyperdx/hyperdx-local:2-beta.16-ui
```

You will not be promoted to create a user as local mode does not include authentication.

### Complete connection credentials {#complete-connection-credentials}

To connect to your own **external ClickHouse cluster**, you can manually enter your connection credentials.

Alternatively, for a quick exploration of the product, you can also click **Connect to Demo Server** to access preloaded datasets and try ClickStack with no setup required.

<Image img={hyperdx_2} alt="Credentials" size="md"/>

If connecting to the demo server, users can explore the dataset with the [demo dataset instructions](/use-cases/observability/clickstack/getting-started/remote-demo-data).

</VerticalStepper>
