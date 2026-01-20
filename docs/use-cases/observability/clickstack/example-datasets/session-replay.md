---
slug: /use-cases/observability/clickstack/example-datasets/session-replay-demo
title: 'Session Replay Demo'
sidebar_position: 4
pagination_prev: null
pagination_next: null
description: 'Interactive demo application showing how to instrument web apps for ClickStack session replay'
doc_type: 'guide'
keywords: ['clickstack', 'session replay', 'browser sdk', 'demo', 'observability', 'instrumentation']
---

import Image from '@theme/IdealImage';
import api_key from '@site/static/images/clickstack/api-key.png';
import demo_app from '@site/static/images/clickstack/session-replay/demo-app.png';
import session_replay from '@site/static/images/clickstack/session-replay/session-replay.png';
import replay_search from '@site/static/images/clickstack/session-replay/replay-search-view.png';

:::note[TL;DR]
This guide demonstrates how to instrument a web application for session replay using the ClickStack Browser SDK. Unlike other sample datasets that load pre-generated data, this demo provides an interactive application where you generate session data through your own interactions.

The demo application is a documentation explorer that showcases real-world session replay use cases, including search behavior, navigation patterns, and user interactions with code examples.

Time required: 10-15 minutes
:::

## Overview {#overview}

This demo shows how session replay captures user interactions in web applications. Session replay is valuable for:

- **Debugging issues** - See exactly what a user experienced when encountering an error
- **Understanding user behavior** - Analyze how users navigate and interact with your application
- **Improving UX** - Identify friction points and drop-off patterns
- **Support** - Visually understand customer issues without lengthy descriptions

The demo application requires minimal instrumentation: one script tag and one initialization call. All user interactions are captured automatically.

## Prerequisites {#prerequisites}

- Docker and Docker Compose installed
- Ports 3000, 4317, 4318, and 8080 available

## Demo Steps {#demo-steps}

The demo consists of:

- **ClickStack** - The all-in-one observability stack (HyperDX UI, OTel Collector, ClickHouse)
- **Demo Application** - An instrumented documentation explorer built with vanilla JavaScript
- **ClickStack Browser SDK** - Captures all user interactions automatically

<VerticalStepper headerLevel="h3">

### Clone the demo repository {#clone-demo-repository}

```shell
git clone https://github.com/ClickHouse/clickstack-session-replay-demo
cd clickstack-session-replay-demo
```

### Start ClickStack {#start-clickstack}

```shell
docker-compose up -d clickstack
```

### Get your API key {#get-api-key}

1. Open HyperDX at [http://localhost:8080](http://localhost:8080)
2. Create an account or log in if needed
3. Navigate to **Team Settings → API Keys**
4. Copy your **Ingestion API Key**

<Image img={api_key} alt="ClickStack API Key"/>

5. Set it as an environment variable:

```shell
export CLICKSTACK_API_KEY='your-api-key-here'
```

### Start the demo application {#start-demo-app}

```shell
docker-compose --profile demo up demo-app
```

:::note
Ensure you run this command in the same terminal where you exported the `CLICKSTACK_API_KEY` variable.
:::

Open [http://localhost:3000](http://localhost:3000) in your browser and interact with the app.

<Image img={demo_app} alt="Session replay demo app"/>

All interactions are automatically captured by the ClickStack Browser SDK.

### View your session replay {#view-session-replay}

Return to HyperDX at [http://localhost:8080](http://localhost:8080) and navigate to **Client Sessions** from the left sidebar.

<Image img={replay_search} alt="Session replay search"/>

You should see your session listed with its duration and event count. Click the play button to replay it.

<Image img={session_replay} alt="Session replay"/>

Switch between `Highlighted` and `All Events` modes to adjust timeline detail.

</VerticalStepper>

## The instrumentation {#instrumentation}

The demo application shows how minimal session replay instrumentation can be. View the code in the cloned repository:

**Include the SDK (`app/public/index.html` line 11):**
```html
<script src="https://unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
```

**Initialize ClickStack (`app/public/js/app.js` lines 1-17):**
```javascript
window.HyperDX.init({
  url: 'http://localhost:4318',
  apiKey: window.CLICKSTACK_API_KEY,
  service: 'clickhouse-session-replay-demo',
  consoleCapture: true,
  advancedNetworkCapture: true,
});
```

Everything else is standard application code. The SDK automatically captures all user interactions, console logs, network requests, and errors.

## Using session replay in your application {#use-in-your-app}

Apply the same pattern to your web application:

1. Include the ClickStack Browser SDK
2. Initialize it with your configuration
3. All user interactions are captured automatically

For framework-specific examples and configuration options, see the [Browser SDK documentation](/use-cases/observability/clickstack/sdks/browser).

## Learn more {#learn-more}

- [Browser SDK Reference](/use-cases/observability/clickstack/sdks/browser)
- [ClickStack Getting Started](/use-cases/observability/clickstack/getting-started)
- [All Sample Datasets](/use-cases/observability/clickstack/sample-datasets)