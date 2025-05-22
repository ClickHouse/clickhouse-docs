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
* **OpenTelemetry (OTel) Collector**
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

To connect to the deployed ClickHouse instance, simply click **Create** and accept the default settings.  

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

## Using ClickHouse Cloud {#using-clickhouse-cloud}

This distribution can be used with ClickHouse Cloud. Users should:

- Remove the ClickHouse service  from the [`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/86465a20270b895320eb21dca13560b65be31e68/docker-compose.yml#L89) file. This is optional if testing, as the deployed ClickHouse instance will simply be ignored - although waste local resources. If removing the service, ensure [any references](https://github.com/hyperdxio/hyperdx/blob/86465a20270b895320eb21dca13560b65be31e68/docker-compose.yml#L65) to the service such as `depends_on` are removed.
- Modify the OTel collector to use a ClickHouse Cloud instance by setting the environment variables `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` and `CLICKHOUSE_PASSWORD` in the compose file. Specifically, add the environment variables to the OTel collector service:

    ```bash
    otel-collector:
        image: ${OTEL_COLLECTOR_IMAGE_NAME}:${IMAGE_VERSION}
        environment:
          CLICKHOUSE_ENDPOINT: '<CLICKHOUSE_ENDPOINT>' # https endpoint here
          CLICKHOUSE_USER: '<CLICKHOUSE_USER>'
          CLICKHOUSE_PASSWORD: '<CLICKHOUSE_PASSWORD>'
          HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
        ports:
          - '13133:13133' # health_check extension
          - '24225:24225' # fluentd receiver
          - '4317:4317' # OTLP gRPC receiver
          - '4318:4318' # OTLP http receiver
          - '8888:8888' # metrics extension
        restart: always
        networks:
          - internal
    ```

    The `CLICKHOUSE_ENDPOINT` should be the ClickHouse Cloud HTTPS endpoint, including the port `8443` e.g. `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

- On connecting to the HyperDX UI and creating a connection to ClickHouse, use your Cloud credentials.
