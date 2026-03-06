---
slug: /use-cases/observability/clickstack/text-to-chart
title: 'Text-to-Chart'
sidebar_label: 'Text-to-Chart'
pagination_prev: null
pagination_next: null
description: 'Generate charts from natural language prompts in ClickStack using the AI-powered text-to-chart feature.'
doc_type: 'guide'
keywords: ['clickstack', 'text-to-chart', 'AI', 'visualization', 'Chart Explorer', 'natural language', 'observability']
---

import Image from '@theme/IdealImage';
import text_to_chart from '@site/static/images/clickstack/text-to-chart/text-to-chart.png';
import chart_explorer from '@site/static/images/clickstack/text-to-chart/chart-explorer.png';
import create_connection from '@site/static/images/clickstack/text-to-chart/create-connection.png';

ClickStack's text-to-chart feature allows you to create visualizations by describing what you want to see in plain text. Rather than manually selecting metrics, filters, and group-by fields, you can type a prompt such as "error rates by service over the last 24 hours" and ClickStack will generate the corresponding chart automatically.

This feature uses a large language model (LLM) to convert your text prompt into a query, then builds the visualization in the [Chart Explorer](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer). It works with any configured data source.

## Prerequisites {#prerequisites}

Text-to-chart requires an [Anthropic API key](https://console.anthropic.com/). Set the `ANTHROPIC_API_KEY` environment variable when starting ClickStack.

For open source deployments, pass the key as an environment variable. The method varies by deployment type:

**Docker (All-in-One or Local Mode)**

```bash
docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

**Docker (HyperDX Only)**

```bash
docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

**Docker Compose**

Add the variable to your `.env` file or set it directly in the `docker-compose.yaml`:

```yaml
services:
  app:
    environment:
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
```

**Helm**

Pass the key using `--set`:

```bash
helm install my-hyperdx hyperdx/hdx-oss-v2 \
  --set env[0].name=ANTHROPIC_API_KEY \
  --set env[0].value=<YOUR_KEY>
```

## Using text-to-chart {#using-text-to-chart}

<VerticalStepper headerLevel="h3">

### Navigate to Chart Explorer {#navigate-chart-explorer}

Select **Chart Explorer** from the left menu in HyperDX.

### Select a data source {#select-data-source}

Choose the data source you want to visualize — for example, **Logs**, **Traces**, or **Metrics**.

<Image img={chart_explorer} alt="Chart explorer" />

### Enter a text prompt {#enter-text-prompt}

At the top of the Chart Explorer, locate the **AI Assistant** input. Type a natural language description of the chart you want to create. For example:

- `Show error rates by service over the last 24 hours`
- `Latency breakdown by endpoint`
- `Count of events over time grouped by severity`

ClickStack converts the prompt into a query and renders the visualization automatically.

<Image img={text_to_chart} alt="Text to chart" />

</VerticalStepper>

## Trying it with demo data {#demo-data}

The quickest way to try text-to-chart is with the [Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only) Docker image and the [remote demo dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data):

```bash
docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 clickhouse/clickstack-local:latest
```

Navigate to `localhost:8080`. To connect to demo data, go to **Team Settings** and create a new connection with the following details:

- **Connection Name**: `Demo`
- **Host**: `https://sql-clickhouse.clickhouse.com`
- **Username**: `otel_demo`
- **Password**: Leave empty

<Image img={create_connection} alt="Create connection" />

Then modify each of the sources — **Logs**, **Traces**, **Metrics**, and **Sessions** — to use the `otel_v2` database. For full details on configuring sources, see the [remote demo dataset guide](/use-cases/observability/clickstack/getting-started/remote-demo-data).

Once connected, open the **Chart Explorer** and try prompts against the available logs, traces, and metrics.

## Example prompts {#example-prompts}

The following prompts demonstrate common use cases when working with observability data:

| Prompt | Data source | Description |
|--------|-------------|-------------|
| `Error count by service over time` | Logs | Charts the frequency of errors across services |
| `Average request duration grouped by endpoint` | Traces | Shows latency patterns per endpoint |
| `P99 latency by service` | Traces | Identifies tail latency across services |
| `Count of 5xx status codes over the last 6 hours` | Logs | Tracks server error trends |

Prompts can reference any column or attribute available in your configured data sources. The more specific the prompt, the more accurate the generated chart.

## Limitations {#limitations}

- Text-to-chart currently supports Anthropic as the LLM provider. Support for additional providers, including OpenAI, is planned for future releases.
- Chart accuracy depends on the clarity of the prompt and the structure of the underlying data. If a generated chart does not match expectations, try rephrasing the prompt or specifying column names explicitly.

## Further reading {#further-reading}

- [From text to charts: a faster way to visualize with ClickStack](https://clickhouse.com/blog/text-to-charts-faster-way-to-visualize-clickstack) — blog post introducing the feature
- [Dashboards and visualizations](/use-cases/observability/clickstack/dashboards) — manual chart creation using Chart Explorer
- [Search](/use-cases/observability/clickstack/search) — full-text and property search syntax
- [Configuration](/use-cases/observability/clickstack/config) — all ClickStack environment variables
