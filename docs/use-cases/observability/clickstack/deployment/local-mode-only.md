---
slug: /use-cases/observability/clickstack/deployment/local-mode-only
title: 'Local Mode Only'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'Deploying ClickStack with Local Mode Only - The ClickHouse Observability Stack'
---

import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';

This mode includes the UI with all application state stored locally in the browser. 

**User authentication is disabled for this distribution of HyperDX**

It does not include a MongoDB instance, meaning dashboards, saved searches, and alerts are not persisted across users.

### Suitable for {#suitable-for}

* Demos
* Debugging
* Development where HyperDX is used

## Deployment steps {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Deploy with Docker {#deploy-with-docker}

Local mode deploys the HyperDX UI only, accessible on port 8080.

```bash
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui}

Visit [http://localhost:8080](http://localhost:8080) to access the HyperDX UI.

**You will not be prompted to create a user, as authentication is not enabled in this deployment mode.**

Connect to your own external ClickHouse cluster e.g. ClickHouse Cloud.

<Image img={hyperdx_2} alt="Create login" size="md"/>

Create a source, retain all default values, and complete the `Table` field with the value `otel_logs`. All other settings should be auto-detected, allowing you to click `Save New Source`.

<Image img={hyperdx_logs} alt="Create logs source" size="md"/>

</VerticalStepper>
