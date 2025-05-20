---
slug: /use-cases/observability/clickhouse-stack/deployment
title: 'Deployment Options'
pagination_prev: null
pagination_next: null
description: 'Deploying ClickStack - The ClickHouse Observability Stack'
---

ClickStack provides multiple deployment options to suit various use cases:

## Deployment Options Overview {#options-overview}

### Option 1: Local Mode Only {#local-mode-only}

This mode includes the UI with all application state stored locally in the browser. 

It does not include a MongoDB instance, meaning dashboards, saved searches, and alerts are not persisted across users.

Suitable for:

* Demos
* Debugging
* Development where HyperDX is used

**Authentication is not supported**

There are a few missing features in HyperDX Local compared to the other deployment options:

- HyperDX Local is single-user only (due to skipping auth)
- No alerting support (alerts will not fire)
- No persistence of data (telemetry and settings) if the container is torn down

### Option 2: All-in-One {#all-in-one}

This comprehensive Docker image bundles all ClickStack components:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry Collector** (exposing OTLP on ports `4317` and `4318`)
* **MongoDB** (for persistent application state)

This option includes authentication, enabling persistence of dashboards, alerts, and saved searches across sessions and users.

Suitable for:

* Demos
* Local testing of the full stack

### Option 3: Docker Compose {#docker-compose}

All ClickStack components are distributed separately as individual Docker images:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry Collector**
* **MongoDB**

These images can be combined and deployed locally using Docker Compose.

The Docker Compose exposes additional ports for observability and ingestion based on the default `otel-collector` setup:

- `13133`: Health check endpoint for the `health_check` extension
- `24225`: Fluentd receiver for log ingestion
- `4317`: OTLP gRPC receiver (standard for traces, logs, and metrics)
- `4318`: OTLP HTTP receiver (alternative to gRPC)
- `8888`: Prometheus metrics endpoint for monitoring the collector itself

These ports enable integrations with a variety of telemetry sources and make the OpenTelemetry Collector production-ready for diverse ingestion needs.

Suitable for:

* Local testing
* Proof of concepts
* Production deployments where fault tolerance is not required and a single server is sufficient to host all ClickHouse data
* When deploying ClickStack but hosting ClickHouse separately e.g. using ClickHouse Cloud.

### Option 4: Helm {#helm}

We provide an official Helm chart to deploy ClickStack to Kubernetes clusters. This is the **recommended** method for production deployments.

By default, the Helm chart provisions all core components, including a ClickHouse instance. However, it can be easily customized to integrate with an existing ClickHouse deployment—for example, one hosted in **ClickHouse Cloud**.

The chart supports standard Kubernetes best practices, including:

- Environment-specific configuration via `values.yaml`
- Resource limits and pod-level scaling
- TLS and ingress configuration
- Secrets management and authentication setup

### Option 5: HyperDX Only {#hyperdx-only}

This option is designed for users who already have a running ClickHouse instance populated with observability or event data.

HyperDX can be used independently of the rest of the stack and is compatible with any data schema - not just OpenTelemetry. This makes it suitable for custom observability pipelines already built on ClickHouse.

To enable full functionality, you must provide a MongoDB instance for storing application state, including dashboards, saved searches, user settings, and alerts.

In this mode, data ingestion is left entirely to the user. You can ingest data into ClickHouse using your own hosted OpenTelemetry Collector, direct ingestion from client libraries, ClickHouse-native table engines (such as Kafka or S3), ETL pipelines, or managed ingestion services like ClickPipes. This approach offers maximum flexibility and is suitable for teams that already operate ClickHouse and want to layer HyperDX on top for visualization, search, and alerting.

## Demonstration

Each of the deployment options described above is demonstrated in detail below. The [Getting Started Guide](/use-cases/observability/clickhouse-stack/getting-started) specifically demonstrates Options 1 and 2. They are included here for completeness.

### Option 1: Local Mode Only {#local-mode-only-deploy}

Local mode deploys the HyperDX UI only, accessible on port 8080.

```bash
docker run -p 8080:8080 hyperdx/hyperdx-local:2-beta.16-ui
```

Navigate to [http://localhost:8080](http://localhost:8080).

### Option 2: All-in-One {#all-in-one-deploy}

The following will run an OpenTelemetry collector (on port 4317 and 4318), Clickhouse (on port 8123), and the HyperDX UI (on port 8080).

```bash
docker run -p 8080:8080 -p 8123:8123 -p 4317:4317 -p 4318:4318 hyperdx/hyperdx-all-in-one:2-beta.16
```

Navigate to [http://localhost:8080](http://localhost:8080) and create a user.

This option should not be deployed to production for the following reasons:

- **Non-persistent storage:** All data is stored using Docker’s native overlay filesystem. This setup does not support performance at scale and data will be lost if the container is removed or restarted.
- **Lack of component isolation:** All components run within a single Docker container. This prevents independent scaling and monitoring, and applies any cgroup limits globally to all processes. As a result, components may compete for CPU and memory,

#### Customizing Ports {#customizing-ports-deploy}

If you need to customize the app (8080) or api (8000) ports that HyperDX Local runs on, you'll need to modify the `docker run` command to forward the appropriate ports and set a few environment variables.

Customizing the OpenTelemetry ports can simply be changed by modifying the port forwarding flags. Ex. Replacing `-p 4318:4318` with `-p 4999:4318` to change the OpenTelemetry HTTP port to 4999.

```bash
docker run -p 8080:8080 -p 8123:8123 -p 4317:4317 -p 4999:4318 hyperdx/hyperdx-all-in-one:2-beta.16
```

### Option 3: Docker Compose {#docker-compose-deploy}

To deploy with Docker Compose clone the HyperDX repo, change in to the directory and run `docker-compose up`:

```bash
git clone git@github.com:hyperdxio/hyperdx.git
cd hyperdx
# switch to the v2 branch
git checkout v2
docker compose up
```

Navigate to [http://localhost:8080](http://localhost:8080) and create a user.

#### Settings and production

Users can modify settings for the stack, such as the version used, through the environment variable file:

```bash
user@example-host hyperdx % cat .env
# Used by docker-compose.yml
IMAGE_NAME=ghcr.io/hyperdxio/hyperdx
IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx
IMAGE_NAME_HDX=docker.hyperdx.io/hyperdx/hyperdx
LOCAL_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-local
LOCAL_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-local
ALL_IN_ONE_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-all-in-one
ALL_IN_ONE_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-all-in-one
OTEL_COLLECTOR_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-otel-collector
OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-otel-collector
CHANGESET_TAG=2.0.0-beta.16
IMAGE_VERSION_SUB_TAG=.16
IMAGE_VERSION=2-beta
IMAGE_NIGHTLY_TAG=2-nightly

# Set up domain URLs
HYPERDX_API_PORT=8000 #optional (should not be taken by other services)
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
```

### Option 4: Helm {#helm-deploy}

The helm chart for HyperDX can be found [here](git@github.com:hyperdxio/helm-charts.git).

#### Prerequisites

- [Helm](https://helm.sh/) v3+
- Kubernetes cluster (v1.20+ recommended)
- `kubectl` configured to interact with your cluster




### Option 5: HyperDX Only {#hyperdx-only-deploy}





