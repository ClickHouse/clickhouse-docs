---
slug: /integrations/partners/building-integrations
title: 'Building integrations with ClickHouse'
sidebar_label: 'Building integrations'
sidebar_position: 2
description: 'Orientation for partners on ingestion, consumption, wire protocols, and client conventions.'
keywords: ['partner', 'ingestion', 'consumption', 'ClickPipes', 'language clients', 'user-agent']
doc_type: 'guide'
---

# Building integrations with ClickHouse

This page orients you to the integration surface so you can scope ingestion and consumption work. For validation and publishing, continue with [Testing your integration](/integrations/partners/testing-your-integration) and [Documenting your integration](/integrations/partners/documenting-your-integration).

## Ingestion

Two paths bring data into ClickHouse. Choose based on whether your product should own the ingestion plane or delegate it.

### Path A: ClickPipes (managed, ClickHouse Cloud only)

If you prefer not to build and operate ingestion infrastructure, [ClickPipes](/integrations/clickpipes) is the managed service that pulls from your customer's sources into their ClickHouse Cloud service. ClickPipes handles scaling, parallelization, retries, and lag reporting.

Supported sources today include:

- **Streaming:** Apache Kafka (including MSK, Confluent Cloud, Redpanda, Azure Event Hubs, WarpStream), Amazon Kinesis
- **Object storage:** Amazon S3 (and S3-compatible stores), Google Cloud Storage, Azure Blob Storage
- **CDC:** PostgreSQL, MySQL, MongoDB, BigQuery

### Path B: Self-driven ingestion via an official language client

If you own the pipeline, use one of the [official language clients](/integrations/language-clients). They handle serialization, batching, TLS, compression, and connection pooling. You pass runtime primitives; the client handles the wire format.

- Official clients: Python, Go, Java, JavaScript, Rust, C#, C++
- Both wire protocols: HTTP and native TCP (Go and C++)
- Auth: username and password over TLS by default; mTLS and SSL client-certificate auth are supported by all major clients
- Data format is usually an implementation detail. Clients convert runtime types to ClickHouse Native or RowBinary format. If you already produce Arrow, Parquet, JSONEachRow, or another format, most clients expose a raw-bytes API for pre-serialized data
- For throughput, batch **10K–100K rows** and aim for roughly **one insert per second** as an upper bound for synchronous inserts. If client-side batching is impractical, use [asynchronous inserts](/optimize/asynchronous-inserts) to shift batching to the server

See also: [Bulk inserts](/optimize/bulk-inserts).

## Consumption

HTTP and native TCP both carry queries. Native is binary and lower overhead. HTTP works through load balancers and proxies. Both are first-class; pick based on infrastructure, not feature gaps.

- **Application code:** use the same [official language clients](/integrations/language-clients) as for ingestion
- **BI and SQL tools:** ClickHouse ships an official [JDBC v2 driver](/integrations/java) (Java) and an [ODBC driver](/interfaces/odbc). Tableau, Looker, Power BI, Metabase, Apache Superset, and Grafana integrate via these drivers or dedicated connectors maintained by ClickHouse and partners
- **Result format:** clients typically own serialization. You can request Arrow, Parquet, or other columnar formats on the wire if your product needs them

### Result-set sizing

Most analytical queries return small result sets (aggregates, summaries, top-N), and the wire is rarely the bottleneck. ClickHouse tables can hold billions of rows, and an unbounded `SELECT *` over a large fact table can move terabytes. **Shape the request in your application:** use `LIMIT`, pagination, streaming reads, and explicit column lists. If you build user-facing analytics, treat unbounded result sets as a UX problem, not a transport problem.

ClickHouse has a rich type system: arrays, tuples, maps, JSON, nested, LowCardinality, and more. Official clients map these to idiomatic language types. If your product surfaces ClickHouse data to end users, plan a type-mapping strategy early.

## Next steps

Pick a path, prototype against a [ClickHouse Cloud trial](https://clickhouse.com/cloud), and register your integration through the partner portal when it is available.

## User-agent string convention

Partner clients that connect over HTTP should set a `User-Agent` string that identifies the integration. ClickHouse parses this server-side to track adoption, surface usage telemetry to partners, and inform the roadmap.

Format:

```
<app_name>/<app_version> <client_name>/<client_version> (<comment>; <key1>: <value1>; <key2>: <value2>)
```

Examples:

- `clickhouse-java/0.8.0`
- `my-analytics-app/3.1.2 clickhouse-js/1.2.0 (env: staging; region: us-east-1; lv: node/20.10)`

Rules:

- No whitespace in client name or version
- If you include a comment, it must come first
- Standard metadata keys: `lv` (language or framework version), `os`, `arch`
- TCP and native protocol clients report client name and version via protocol fields, not `User-Agent`

## Sandbox and trial access

[ClickHouse Cloud](https://clickhouse.com/cloud) offers a free trial for development and integration validation. Partners enrolled in the formal program receive additional development credits; details will be available in the partner portal.
