---
slug: /use-cases/observability/clickstack/deployment/local-mode-only
title: 'Local Mode Only'
pagination_prev: null
pagination_next: null
description: 'Deploying ClickStack with Local Mode Only - The ClickHouse Observability Stack'
---

This mode includes the UI with all application state stored locally in the browser. 

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
docker run -p 8080:8080 hyperdx/hyperdx-local:2-beta.16-ui
```

### Navigate to the UI {#navigate-to-the-ui}

Navigate to [http://localhost:8080](http://localhost:8080).

</VerticalStepper>