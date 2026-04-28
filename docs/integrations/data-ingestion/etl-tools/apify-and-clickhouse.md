---
sidebar_label: 'Apify'
keywords: ['apify', 'web scraping', 'data ingestion', 'actors', 'datasets', 'automation', 'webhooks']
slug: /integrations/apify
description: 'Load web scraping and automation data from Apify into ClickHouse'
title: 'Connect Apify to ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://apify.com/'
---

import PartnerBadge from '@theme/badges/PartnerBadge';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';

# Connect Apify to ClickHouse

<PartnerBadge/>

[Apify](https://apify.com/) is a web scraping and automation platform. You build, run, and scale serverless cloud programs called [**Actors**](https://docs.apify.com/platform/actors). Actors scrape websites, crawl the web, process data, or automate workflows. Every Actor run produces structured output stored in [**Datasets**](https://docs.apify.com/platform/storage/dataset) (collections of JSON objects).

Connect Apify to ClickHouse to load scraped or processed data into ClickHouse for analytics, monitoring, or enrichment pipelines.

## Key concepts {#key-concepts}

| Apify concept | What it is |
|---|---|
| **[Actor](https://docs.apify.com/platform/actors)** | A serverless cloud program that runs on the Apify platform. Thousands of ready-made Actors are available in the [Apify Store](https://apify.com/store). |
| **[Dataset](https://docs.apify.com/platform/storage/dataset)** | The output of an Actor run. A table-like collection of JSON objects, retrievable as JSON, CSV, XML, or other formats via the [Apify API](https://docs.apify.com/api/v2). |
| **[Webhook](https://docs.apify.com/platform/integrations/webhooks)** | An event-driven HTTP call triggered when an Actor run succeeds, fails, or reaches other lifecycle events. Use webhooks to automate the Apify-to-ClickHouse pipeline. |

## Setup guide {#setup-guide}

<VerticalStepper headerLevel="h3">

### Prerequisites {#1-prerequisites}

You'll need:

<ConnectionDetails />

- An [Apify account](https://console.apify.com/sign-up) (free tier available).
- An [Apify API token](https://docs.apify.com/platform/integrations/api#api-token), found in **Settings > Integrations** in the [Apify Console](https://console.apify.com/).
- Node.js 18+ installed locally (for the JavaScript examples).

### Install dependencies {#2-install-dependencies}

Install the Apify JavaScript client and the ClickHouse JavaScript client:

```bash
npm install apify-client @clickhouse/client
```

:::note
Apify also provides a [Python client](https://docs.apify.com/api/client/python). If you prefer Python, install `apify-client` via pip and use [clickhouse-connect](https://clickhouse.com/docs/integrations/python) for ClickHouse.
:::

### Create a target table in ClickHouse {#3-create-a-target-table}

Create a table to hold the scraped data. The schema depends on the Actor you use. This example uses [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) for a product scraping Actor:

```sql
CREATE TABLE apify_products
(
    url        String,
    title      String,
    price      Float64,
    currency   String,
    scraped_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (scraped_at, url);
```

### Fetch Apify dataset and load into ClickHouse {#4-fetch-and-load}

The following script fetches the results of an Apify Actor run and inserts them into ClickHouse:

```javascript
import { ApifyClient } from 'apify-client';
import { createClient } from '@clickhouse/client';

// Initialize clients
const apify = new ApifyClient({ token: 'YOUR_APIFY_API_TOKEN' });
const clickhouse = createClient({
    url: 'https://YOUR_CLICKHOUSE_HOST:8443',
    username: 'default',
    password: 'YOUR_CLICKHOUSE_PASSWORD',
    database: 'default',
});

// Fetch dataset items from the last run of an Actor
const run = await apify.actor('YOUR_ACTOR_ID').call();
const { items } = await apify.dataset(run.defaultDatasetId).listItems();

console.log(`Fetched ${items.length} items from Apify dataset.`);

// Insert into ClickHouse
await clickhouse.insert({
    table: 'apify_products',
    values: items,
    format: 'JSONEachRow',
});

console.log(`Inserted ${items.length} rows into ClickHouse.`);
await clickhouse.close();
```

:::tip
For large datasets, paginate through results using the `limit` and `offset` parameters of the [List dataset items](https://docs.apify.com/api/v2#/reference/datasets/item-collection/list-items) endpoint. You can also pass `clean=true` to retrieve only non-empty, deduplicated items.
:::

### Automate with webhooks {#5-automate-with-webhooks}

Instead of running the script manually, automate the pipeline so data loads into ClickHouse every time an Actor finishes:

1. In the [Apify Console](https://console.apify.com/), go to your Actor and open the **Integrations** tab.
2. Add a new webhook with:
   - **Event type:** `ACTOR.RUN.SUCCEEDED`
   - **Action:** An HTTP POST to your loader endpoint, or trigger another Actor that handles the ClickHouse insert.
3. The webhook payload includes the `defaultDatasetId`, which you can use to fetch the run's results.

See [Apify webhook documentation](https://docs.apify.com/platform/integrations/webhooks) for payload details and configuration options.

An alternative approach is to use [Apify Schedules](https://docs.apify.com/platform/schedules) to run Actors on a cron-like schedule, combined with webhooks for the loading step.

</VerticalStepper>

## Best practices {#best-practices}

Use the Apify client library (`apify-client` for [JavaScript](https://docs.apify.com/api/client/js) or [Python](https://docs.apify.com/api/client/python)) instead of raw HTTP calls. It handles pagination, retries, and authentication for you.

For large datasets, paginate through results using the `limit` and `offset` parameters of the [List dataset items](https://docs.apify.com/api/v2#/reference/datasets/item-collection/list-items) endpoint.

Use [`JSONEachRow`](/interfaces/formats/JSONEachRow) format when inserting into ClickHouse. It maps directly to Apify's JSON output with no transformation needed.

Match your ClickHouse table schema to the Actor's output fields. Check the Actor's output schema on its [Apify Store](https://apify.com/store) page or in the **Dataset** tab after a run.

## Related resources {#related-resources}

- [Apify Platform documentation](https://docs.apify.com)
- [Apify API reference](https://docs.apify.com/api/v2)
- [Apify JavaScript client](https://docs.apify.com/api/client/js)
- [Apify Python client](https://docs.apify.com/api/client/python)
- [Apify Store (ready-made Actors)](https://apify.com/store)
- [Apify integrations overview](https://docs.apify.com/platform/integrations)
- [ClickHouse JavaScript client](/integrations/language-clients/js.md)
