---
title: 'Migrating from Rockset'
slug: /migrations/rockset
description: 'Migrating from Rockset to ClickHouse'
keywords: ['Rockset', 'migration']
---

# Migrating from Rockset

Rockset is a real-time analytics database [acquired by OpenAI in June 2024](https://rockset.com/blog/openai-acquires-rockset/).
Users have until September 30th, 2024, 5 PM PDT to [off-board from the service](https://docs.rockset.com/documentation/docs/faq).

We think ClickHouse Cloud will provide an excellent home for Rockset users, and in this guide, we'll go through some things to consider when you migrate from Rockset to ClickHouse.

Let's get started!

## Immediate assistance {#immediate-assistance}

If you need immediate assistance, please contact us by filling out [this form](https://clickhouse.com/company/contact?loc=docs-rockest-migrations) and a human will get in touch with you! 


## ClickHouse vs Rockset - High-Level Comparison {#clickhouse-vs-rockset---high-level-comparison}

We'll begin with a brief overview of ClickHouse's strengths and where you might see some benefits compared to Rockset.

ClickHouse focuses on real-time performance and cost efficiency through a schema-first approach. 
While semi-structured data is supported, our philosophy is that users should decide how to structure their data to maximize performance and resource efficiency. 
As a result of the schema-first approach described above, in our benchmarks, ClickHouse exceeds Rockset in scalability, ingestion throughput, query performance, and cost-efficiency.

Regarding integration with other data systems, ClickHouse has [broad capabilities](/integrations) that exceed Rockset's.

Rockset and ClickHouse both offer a cloud-based product and associated support services.
Unlike Rockset, ClickHouse also has an open-source product and community.
ClickHouse's source code can be found at [github.com/clickhouse/clickhouse](https://github.com/clickhouse/clickhouse), and at the time of writing, there have been over 1,500 contributors.
The [ClickHouse Community Slack](https://clickhouse.com/slack) has over 7,000 members who share their experiences/best practices and help each other with any problems they run across.

This migration guide focuses on migrating from Rockset to ClickHouse Cloud, but users can refer to the [rest of our documentation](/) on open-source capabilities.

## Rockset Key Concepts {#rockset-key-concepts}

Let's start by going through the [key concepts of Rockset](https://docs.rockset.com/documentation/docs/key-concepts) and explain their equivalents (where they exist) in ClickHouse Cloud.

### Data Sources {#data-sources}

Rockset and ClickHouse both support loading data from a variety of sources. 

In Rockset, you create a data source and then create a _collection_ based on that data source.
There are fully managed integrations for event streaming platforms, OLTP databases, and cloud bucket storage.

In ClickHouse Cloud, the equivalent of fully managed integrations is [ClickPipes](/integrations/clickpipes).
ClickPipes supports continuously loading data from event streaming platforms and cloud bucket storage.
ClickPipes loads data into _tables_.

### Ingest Transformations {#ingest-transformations}

Rockset's ingest transformations let you transform the raw data coming into Rockset before it's stored in a collection.
ClickHouse Cloud does the same via ClickPipes, which uses ClickHouse's [materialized views feature](/guides/developer/cascading-materialized-views) to transform the data.

### Collections {#collections}

In Rockset, you query collections. In ClickHouse Cloud, you query tables.
In both services, querying is done using SQL.
ClickHouse adds extra functions on top of the ones in the SQL standard to give you more power to manipulate and transform your data.

### Query Lambdas {#query-lambdas}

Rockset supports query lambdas, named parameterized queries stored in Rockset that can be executed from a dedicated REST endpoint.
ClickHouse Cloud's [Query API Endpoints](/cloud/get-started/query-endpoints) offer similar functionality.

### Views {#views}

In Rockset, you can create views, virtual collections defined by SQL queries.
ClickHouse Cloud supports several types of [views](/sql-reference/statements/create/view):

* _Normal views_ do not store any data. They just perform a read from another table at query time.
* _Parameterized views_ are similar to normal views but can be created with parameters resolved at query time.
* _Materialized views_ store data transformed by the corresponding `SELECT` query. They are like a trigger that runs when new data is added to the source data to which they refer.

### Aliases {#aliases}

Rockset aliases are used to associate multiple names with a collection.
ClickHouse Cloud does not support an equivalent feature.

### Workspaces {#workspaces}

Rockset workspaces are containers that hold resources (i.e., collections, query lambdas, views, and aliases) and other workspaces.

In ClickHouse Cloud, you can use different services for full isolation.
You can also create databases to simplify RBAC access to different tables/views. 

## Design Considerations {#design-considerations}

In this section, we will review some of the key features of Rockset and learn how to address them when using ClickHouse Cloud. 

### JSON support {#json-support}

Rockset supports an extended version of the JSON format that allows for Rockset-specific types.

There are multiple ways to work with JSON in ClickHouse:

* JSON inference
* JSON extract at query time
* JSON extract at insert time

To understand the best approach for your user case, see [our JSON documentation](/integrations/data-formats/json/overview).

In addition, ClickHouse will soon have [a Semi-structured column data type](https://github.com/ClickHouse/ClickHouse/issues/54864).
This new type should give users the flexibility Rockset's JSON type offers.

### Full-Text Search {#full-text-search}

Rockset supports full-text search with its `SEARCH` function.
While ClickHouse isn't a search engine, it does have [various functions for searching in strings](/sql-reference/functions/string-search-functions). 
ClickHouse also supports [bloom filters](/optimize/skipping-indexes), which can help in many scenarios.

### Vector Search {#vector-search}

Rockset has a similarity index, which can be used to index the embeddings used in vector search applications.

ClickHouse can also be used for vector search, using linear scans:
- [Vector Search with ClickHouse - Part 1](https://clickhouse.com/blog/vector-search-clickhouse-p1?loc=docs-rockest-migrations)
- [Vector Search with ClickHouse - Part 2](https://clickhouse.com/blog/vector-search-clickhouse-p2?loc=docs-rockest-migrations)

ClickHouse also has a [vector search similarity index](/engines/table-engines/mergetree-family/annindexes), but this approach is currently experimental and is not yet compatible by the [new query analyzer](/guides/developer/understanding-query-execution-with-the-analyzer). 

### Ingesting data from OLTP databases {#ingesting-data-from-oltp-databases}

Rockset's managed integrations support ingesting data from OLTP databases like MongoDB and DynamoDB.

If you're ingesting data from DynamoDB, follow the DynamoDB integration guide [here](/integrations/data-ingestion/dbms/dynamodb/index.md).

### Compute-compute separation {#compute-compute-separation}

Compute-compute separation is an architectural design pattern in real-time analytics systems that makes dealing with sudden bursts of incoming data or queries possible.
Suppose a single component handles both ingestion and querying. 
In that case, we will see ingestion latency increase if there is a flood of queries, and query latency increases if there's a flood of data to ingest.

Compute-compute separation separates the data ingestion and query processing code paths to avoid this problem, and this is a feature that Rockset implemented in March 2023.

This feature is currently being implemented in ClickHouse Cloud and is nearing private preview. Please contact support to enable.

## Free migration services {#free-migration-services}

We appreciate that this is a stressful time for Rockset users - no one wants to move a production database in such a short period!

If ClickHouse could be a good fit for you, we will [provide free migration services](https://clickhouse.com/comparison/rockset?loc=docs-rockest-migrations) to help smooth the transition. 
