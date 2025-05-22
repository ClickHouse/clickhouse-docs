---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: 'All in one'
pagination_prev: null
pagination_next: null
description: 'Deploying ClickStack with All In One - The ClickHouse Observability Stack'
---

This comprehensive Docker image bundles all ClickStack components:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry Collector** (exposing OTLP on ports `4317` and `4318`)
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

### Navigate to the UI {#navigate-to-the-ui}

Navigate to [http://localhost:8080](http://localhost:8080) and create a user.

This option should not be deployed to production for the following reasons:

#### Deploying to production {#deploying-to-production}

- **Non-persistent storage:** All data is stored using Docker’s native overlay filesystem. This setup does not support performance at scale and data will be lost if the container is removed or restarted.
- **Lack of component isolation:** All components run within a single Docker container. This prevents independent scaling and monitoring, and applies any cgroup limits globally to all processes. As a result, components may compete for CPU and memory,

#### Customizing Ports {#customizing-ports-deploy}

If you need to customize the app (8080) or api (8000) ports that HyperDX Local runs on, you'll need to modify the `docker run` command to forward the appropriate ports and set a few environment variables.

Customizing the OpenTelemetry ports can simply be changed by modifying the port forwarding flags. Ex. Replacing `-p 4318:4318` with `-p 4999:4318` to change the OpenTelemetry HTTP port to 4999.

```bash
docker run -p 8080:8080 -p 8123:8123 -p 4317:4317 -p 4999:4318 hyperdx/hyperdx-all-in-one:2-beta.16
```

</VerticalStepper>
