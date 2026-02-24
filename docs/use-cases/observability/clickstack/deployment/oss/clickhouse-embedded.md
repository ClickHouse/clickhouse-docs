---
slug: /use-cases/observability/clickstack/deployment/clickhouse-embedded
title: 'ClickHouse Embedded'
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'Using ClickStack embedded in ClickHouse Server - The ClickHouse Observability Stack'
doc_type: 'guide'
keywords: ['ClickStack embedded', 'ClickHouse embedded', 'ClickStack ClickHouse server', 'built-in observability']
---

import Image from '@theme/IdealImage';
import authenticate from '@site/static/images/clickstack/deployment/embedded/authenticate.png';
import create_source from '@site/static/images/clickstack/deployment/embedded/create-source.png';

ClickStack is bundled directly into the ClickHouse server binary. This means you can access the ClickStack UI (HyperDX) from your ClickHouse instance without deploying any additional components. This deployment is similar to the public demo at [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com), but running against your own ClickHouse instance and data.

### Suitable for {#suitable-for}

* Trying ClickStack with minimal setup
* Exploring your own ClickHouse data with an observability UI
* Demos and evaluations

### Limitations {#limitations}

This embedded version is **not designed for production use**. The following features are not available compared to the [production-ready OSS deployments](/use-cases/observability/clickstack/deployment/oss):

- [Alerting](/use-cases/observability/clickstack/alerts)
- [Dashboard](/use-cases/observability/clickstack/dashboards) and [search](/use-cases/observability/clickstack/search) persistence — dashboards and saved searches are not retained across sessions
- Customizable query settings
- [Event patterns](/use-cases/observability/clickstack/event_patterns)

## Deployment steps {#deployment-steps}

<VerticalStepper headerLevel="h3">

### Start ClickHouse {#start-clickhouse}

Pull and run the ClickHouse server image with a password set:

```shell
docker run --rm -it -p 8123:8123 -e CLICKHOUSE_PASSWORD=password clickhouse/clickhouse-server:head-alpine
```

:::tip Running without a password
If you prefer to run without a password, you must explicitly enable default access management:

```shell
docker run --rm -it -p 8123:8123 -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 clickhouse/clickhouse-server:head-alpine
```
:::

### Navigate to the ClickStack UI {#navigate-to-clickstack-ui}

Open [http://localhost:8123](http://localhost:8123) in your browser and click **ClickStack**.

Enter your credentials — if using the example above, the username is `default` and the password is `password`.

<Image img={authenticate} alt="Authenticate" size="lg"/>

### Create a source {#create-a-source}

After logging in, you'll be prompted to create a data source. If you have existing OpenTelemetry tables, retain the default values and complete the `Table` field with the appropriate table name (e.g. `otel_logs`). All other settings should be auto-detected, allowing you to click `Save New Source`.

If you don't have data yet, see ["Ingesting data"](/use-cases/observability/clickstack/ingesting-data) for available options.

<Image img={create_source} alt="Create Source" size="lg"/>

</VerticalStepper>

## Next steps {#next-steps}

If you're ready to move beyond evaluation, consider a production-ready deployment:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one) — single container with all components, including persistence and authentication
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) — individual components for more control
- [Helm](/use-cases/observability/clickstack/deployment/helm) — recommended for production Kubernetes deployments
- [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed) — fully managed on ClickHouse Cloud
