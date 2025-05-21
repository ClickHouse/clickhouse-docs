---
slug: /use-cases/observability/clickhouse-stack/getting-started
title: 'Getting Started'
pagination_prev: null
pagination_next: null
description: 'Getting started with ClickStack - The ClickHouse Observability Stack'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';

# Getting started with ClickStack {#getting-started-with-clickstack}

Getting started with **ClickStack** is straightforward thanks to the availability of prebuilt Docker images. These images are based on the official ClickHouse Debian package and are available in multiple distributions to suit different use cases.

## Single image distribution {#single-image-distribution}

The simplest option is a **single-image distribution** that includes all core components of the stack bundled together:

- **HyperDX UI**
- **OpenTelemetry Collector**
- **ClickHouse**

This all-in-one image allows you to launch the full stack with a single command, making it ideal for testing, experimentation, or quick local deployments.

<VerticalStepper headerLevel="h3">

### Run with docker {#run-with-docker}

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

If you prefer to connect to your own **external ClickHouse cluster**, you can manually enter your connection credentials.

Alternatively, for a quick exploration of the product, you can also click **Connect to Demo Server** to access preloaded datasets and try ClickStack with no setup required.

<Image img={hyperdx_2} alt="Credentials" size="md"/>

If prompted to create a source, retain all default values and complete the `Table` field with the value `otel_logs`. All other settings should be auto-detected, allowing you to click `Save New Source`.

<Image img={hyperdx_logs} alt="Create logs source" size="md"/>

### Explore the product {#explore-the-product}

With the stack deployed, try one of our getting started guides.

If you've connected to the local cluster:

- [Example dataset](/use-cases/observability/clickhouse-stack/getting-started/example-data) - Load an example dataset from our public demo. Diagnose a simple issue.
- [Local files and metrics](/use-cases/observability/clickhouse-stack/getting-started/local-data) - Load local files and monitor system on OSX or Linux using a local OTel collector.

Alternatively, if you've connected to the demo cluster, you can explore the dataset with the following guide: 

- [Remote demo dataset](/use-cases/observability/clickhouse-stack/getting-started/remote-demo-data) - Explore a demo dataset in our demo ClickHouse service.

</VerticalStepper>

## Local mode {#local-mode}

Local mode is a way to deploy HyperDX without a database or OTel collector. You can connect directly to a Clickhouse server from your browser directly, with configuration stored locally in your browser's local or session storage. This image **only** includes the HyperDX UI. 

Authentication is not supported. 

This mode is is intended to be used for quick testing, development, demos and debugging use cases where deploying a full HyperDX instance is not necessary.

### Hosted Version

You can use HyperDX's hosted local mode available at [play.hyperdx.io](https://play.hyperdx.io).

### Self-Hosted Version

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

If connecting to the demo server, users can explore the dataset with the [demo dataset instructions](/use-cases/observability/clickhouse-stack/getting-started/remote-demo-data).

</VerticalStepper>
