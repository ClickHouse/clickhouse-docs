---
sidebar_label: Overview
sidebar_position: 1
keywords: [clickhouse, ingest, insert, data, ingestion, insertion]
pagination_next: 'en/integrations/data-ingestion/airbyte-and-clickhouse'
---

# Getting Data into ClickHouse

<div class='vimeo-container'>
  <iframe src="https://player.vimeo.com/video/751409158?h=54cfbce3b9"
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

- simply uploading a CSV file to ClickHouse Cloud as discussed in the [Quick Start](../quick-start.mdx)
- use [clickhouse-client or clickhouse-local](./clickhouse-client-local.md) to retrieve data from a local file, external file, or some other database like MySQL, PostgreSQL, or any ODBC- or JDBC-compatible database
- write your own client application in your favorite programming language like [Java](/docs/en/integrations/jdbc), [Golang](https://github.com/clickhouse/clickHouse-go#readme) or [Python](https://github.com/clickhouse/clickhouse-connect#readme)
- use one of the technologies listed here in the **Ingest** section of the docs, like [Kafka](./data-ingestion/kafka/), [Vector](./data-ingestion/vector-to-clickhouse.md), [Airbyte](./data-ingestion/airbyte-and-clickhouse.md), and more


