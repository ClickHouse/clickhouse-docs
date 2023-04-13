---
sidebar_label: Overview
sidebar_position: 1
keywords: [clickhouse, ingest, insert, data, ingestion, insertion]
pagination_next: 'en/integrations/data-ingestion/upload-file-to-clickhouse-cloud'
---

# Inserting Data into ClickHouse

<div class='vimeo-container'>
  <iframe src="https://player.vimeo.com/video/754267391?h=71555a7bbf"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br/>

ClickHouse is a database, so there are countless ways to ingest data. There is no special tool designed just for inserting data into ClickHouse. So how do users get data in? Options include:

- simply uploading a CSV file to ClickHouse Cloud as discussed in the [Quick Start](/docs/en/quick-start.mdx)
- use [clickhouse-client or clickhouse-local](/docs/en/integrations/data-ingestion/insert-local-files.md) to retrieve data from a local file, external file, or some other database like MySQL, PostgreSQL, or any ODBC- or JDBC-compatible database
- write your own client application in your favorite programming language like [Java](/docs/en/integrations/language-clients/java/index.md), [Golang](/docs/en/integrations/go/) or [Python](/docs/en/integrations/python)
- use one of the technologies listed here in the **Ingest** section of the docs, like [Kafka](./data-ingestion/kafka/index.md), [Vector](./data-ingestion/etl-tools/vector-to-clickhouse.md), [Airbyte](./data-ingestion/etl-tools/airbyte-and-clickhouse.md), and more


