---
slug: /use-cases/observability/clickhouse-stack/getting-started
title: 'Getting Started'
pagination_prev: null
pagination_next: null
description: 'Getting started with ClickStack - The ClickHouse Observability Stack'
---
import Image from '@theme/IdealImage';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';


## Getting started

Getting started with **ClickStack** is straightforward thanks to the availability of prebuilt Docker images. These images are based on the official ClickHouse Debian package and are available in multiple distributions to suit different use cases.

The simplest option is a **single-image distribution** that includes all core components of the stack bundled together:

- **HyperDX UI**
- **OpenTelemetry Collector**
- **ClickHouse**

This all-in-one image allows you to launch the full stack with a single command, making it ideal for testing, experimentation, or quick local deployments.


<VerticalStepper>

## Install with docker {#install-with-docker}

The following will run an OpenTelemetry collector (on port 4317), Clickhouse (on port 8123), and the HyperDX UI (on port 8080).

```bash
docker run -p 8080:8080 -p 8123:8123 -p 4317:4317 docker.hyperdx.io/hyperdx/hyperdx-local:2-beta
```

## Navigate to the HyperDX UI

Visit [http://localhost:8080](http://localhost:8080) to access the HyperDX UI.

<Image img={hyperdx} alt="HyperDX UI" size="lg"/>



</VerticalStepper>

--demo debugging demos