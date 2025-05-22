---
slug: /use-cases/observability/clickstack/deployment/docker-compose
title: 'Docker Compose'
pagination_prev: null
pagination_next: null
description: 'Deploying ClickStack with Docker Compose - The ClickHouse Observability Stack'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';


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

### Suitable for {#suitable-for}

* Local testing
* Proof of concepts
* Production deployments where fault tolerance is not required and a single server is sufficient to host all ClickHouse data
* When deploying ClickStack but hosting ClickHouse separately e.g. using ClickHouse Cloud.

## Deployment steps {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Clone the repo {#clone-the-repo}

To deploy with Docker Compose clone the HyperDX repo, change in to the directory and run `docker-compose up`:

```bash
git clone git@github.com:hyperdxio/hyperdx.git
cd hyperdx
# switch to the v2 branch
git checkout v2
docker compose up
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


## Settings and production {#settings-and-production}

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
