---
title: 'BigQuery vs ClickHouse Cloud'
slug: /migrations/bigquery/biquery-vs-clickhouse-cloud
description: 'How BigQuery differs from ClickHouse Cloud'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: 'Overview'
doc_type: 'guide'
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';

# Comparing ClickHouse Cloud and BigQuery 

## Resource organization {#resource-organization}

The way resources are organized in ClickHouse Cloud is similar to [BigQuery's resource hierarchy](https://cloud.google.com/bigquery/docs/resource-hierarchy). We describe specific differences below based on the following diagram showing the ClickHouse Cloud resource hierarchy:

<Image img={bigquery_1} size="md" alt="Resource organizations"/>

### Organizations {#organizations}

Similar to BigQuery, organizations are the root nodes in the ClickHouse cloud resource hierarchy. The first user you set up in your ClickHouse Cloud account is automatically assigned to an organization owned by the user. The user may invite additional users to the organization.

### BigQuery Projects vs ClickHouse Cloud Services {#bigquery-projects-vs-clickhouse-cloud-services}

Within organizations, you can create services loosely equivalent to BigQuery projects because stored data in ClickHouse Cloud is associated with a service. There are [several service types available](/cloud/manage/cloud-tiers) in ClickHouse Cloud. Each ClickHouse Cloud service is deployed in a specific region and includes:

1. A group of compute nodes (currently, 2 nodes for a Development tier service and 3 for a Production tier service). For these nodes, ClickHouse Cloud [supports vertical and horizontal scaling](/manage/scaling#how-scaling-works-in-clickhouse-cloud), both manually and automatically.
2. An object storage folder where the service stores all the data.
3. An endpoint (or multiple endpoints created via ClickHouse Cloud UI console)  - a service URL that you use to connect to the service (for example, `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`)

### BigQuery Datasets vs ClickHouse Cloud Databases {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouse logically groups tables into databases. Like BigQuery datasets, ClickHouse databases are logical containers that organize and control access to table data.

### BigQuery Folders {#bigquery-folders}

ClickHouse Cloud currently has no concept equivalent to BigQuery folders.

### BigQuery Slot reservations and Quotas {#bigquery-slot-reservations-and-quotas}

Like BigQuery slot reservations, you can [configure vertical and horizontal autoscaling](/cloud/features/autoscaling/vertical#configuring-vertical-auto-scaling) in ClickHouse Cloud. For vertical autoscaling, you can set the minimum and maximum size for the memory and CPU cores of the compute nodes for a service. The service will then scale as needed within those bounds. These settings are also available during the initial service creation flow. Each compute node in the service has the same size. You can change the number of compute nodes within a service with [horizontal scaling](/cloud/features/autoscaling/horizontal#manual-horizontal-scaling).

Furthermore, similar to BigQuery quotas, ClickHouse Cloud offers concurrency control, memory usage limits, and I/O scheduling, enabling you to isolate queries into workload classes. By setting limits on shared resources (CPU cores, DRAM, disk and network I/O) for specific workload classes, it ensures these queries don't affect other critical business queries. Concurrency control prevents thread oversubscription in scenarios with a high number of concurrent queries.

ClickHouse tracks byte sizes of memory allocations at the server, user, and query level, allowing flexible memory usage limits. Memory overcommit enables queries to use additional free memory beyond the guaranteed memory, while assuring memory limits for other queries. Additionally, memory usage for aggregation, sort, and join clauses can be limited, allowing fallback to external algorithms when the memory limit is exceeded.

Lastly, I/O scheduling allows you to restrict local and remote disk accesses for workload classes based on maximum bandwidth, in-flight requests, and policy.

### Permissions {#permissions}

ClickHouse Cloud controls user access in two places, via the [cloud console](/cloud/guides/sql-console/manage-sql-console-role-assignments) and via the [database](/cloud/security/manage-database-users). Console access is managed via the [clickhouse.cloud](https://console.clickhouse.cloud) user interface. Database access is managed via database user accounts and roles. Additionally, console users can be granted roles within the database that enable the console user to interact with the database via our [SQL console](/integrations/sql-clients/sql-console).

## Data types {#data-types}

For the full BigQuery-to-ClickHouse type mapping, see the [Data types section](/migrations/bigquery/sql-translation-reference#data-types) of the SQL translation reference.

## Query acceleration techniques {#query-acceleration-techniques}

### Primary and Foreign keys and Primary index {#primary-and-foreign-keys-and-primary-index}

In BigQuery, a table can have [primary key and foreign key constraints](https://cloud.google.com/bigquery/docs/information-schema-table-constraints). Typically, primary and foreign keys are used in relational databases to ensure data integrity. A primary key value is normally unique for each row and isn't `NULL`. Each foreign key value in a row must be present in the primary key column of the primary key table or be `NULL`. In BigQuery, these constraints aren't enforced, but the query optimizer may use this information to optimize queries better.

In ClickHouse, a table can also have a primary key. Like BigQuery, ClickHouse doesn't enforce uniqueness for a table's primary key column values. Unlike BigQuery, a table's data is stored on disk [ordered](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files) by the primary key columns. The query optimizer utilizes this sort order to prevent resorting, to minimize memory usage for joins, and to enable short-circuiting for limit clauses. Unlike BigQuery, ClickHouse automatically creates [a (sparse) primary index](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) based on the primary key column values. This index is used to speed up all queries that contain filters on the primary key columns. ClickHouse currently doesn't support foreign key constraints.

## Secondary indexes (Only available in ClickHouse) {#secondary-indexes-only-available-in-clickhouse}

In addition to the primary index created from the values of a table's primary key columns, ClickHouse allows you to create secondary indexes on columns other than those in the primary key.  ClickHouse offers several types of secondary indexes, each suited to different types of queries:

- [**Bloom Filter Index**](/engines/table-engines/mergetree-family/mergetree#bloom-filter):
  - Used to speed up queries with equality conditions (e.g., =, IN).
  - Uses probabilistic data structures to determine whether a value exists in a data block.
- [**Token Bloom Filter Index**](/engines/table-engines/mergetree-family/mergetree#token-bloom-filter):
  - Similar to a Bloom Filter Index but used for tokenized strings and  suitable for full-text search queries.
- [**Min-Max Index**](/engines/table-engines/mergetree-family/mergetree#minmax):
  - Maintains the minimum and maximum values of a column for each data part.
  - Helps to skip reading data parts that don't fall within the specified range.

## Search indexes {#search-indexes}

Similar to [search indexes](https://cloud.google.com/bigquery/docs/search-index) in BigQuery, [full-text indexes](/engines/table-engines/mergetree-family/textindexes) can be created for ClickHouse tables on columns with string values.

## Vector indexes {#vector-indexes}

BigQuery recently introduced [vector indexes](https://cloud.google.com/bigquery/docs/vector-index) as a Pre-GA feature. Likewise, ClickHouse has experimental support for [indexes to speed up](/engines/table-engines/mergetree-family/annindexes) vector search use cases.

## Partitioning {#partitioning}

Like BigQuery, ClickHouse uses table partitioning to enhance the performance and manageability of large tables by dividing tables into smaller, more manageable pieces called partitions. We describe ClickHouse partitioning in detail [here](/engines/table-engines/mergetree-family/custom-partitioning-key).

## Clustering {#clustering}

With clustering, BigQuery automatically sorts table data based on the values of a few specified columns and colocates them in optimally sized blocks. Clustering improves query performance, allowing BigQuery to better estimate the cost of running the query. With clustered columns, queries also eliminate scans of unnecessary data.

In ClickHouse, data is automatically [clustered on disk](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files) based on a table's primary key columns and logically organized in blocks that can be quickly located or pruned by queries utilizing the primary index data structure.

## Materialized views {#materialized-views}

Both BigQuery and ClickHouse support materialized views – precomputed results based on a transformation query's result against a base table for increased performance and efficiency.

## Querying materialized views {#querying-materialized-views}

BigQuery materialized views can be queried directly or used by the optimizer to process queries to the base tables. If changes to base tables might invalidate the materialized view, data is read directly from the base tables. If the changes to the base tables don't invalidate the materialized view, then the rest of the data is read from the materialized view, and only the changes are read from the base tables.

In ClickHouse, materialized views can be queried directly only. However, compared to BigQuery (in which materialized views are automatically refreshed within 5 minutes of a change to the base tables, but no more frequently than [every 30 minutes](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)), materialized views are always in sync with the base table.

**Updating materialized views**

BigQuery periodically fully refreshes materialized views by running the view's transformation query against the base table. Between refreshes, BigQuery combines the materialized view's data with new base table data to provide consistent query results while still using the materialized view.

In ClickHouse, materialized views are incrementally updated. This incremental update mechanism provides high scalability and low computing costs: incrementally updated materialized views are engineered especially for scenarios where base tables contain billions or trillions of rows. Instead of querying the ever-growing base table repeatedly to refresh the materialized view, ClickHouse simply calculates a partial result from (only) the values of the newly inserted base table rows. This partial result is incrementally merged with the previously calculated partial result in the background. This results in dramatically lower computing costs compared to refreshing the materialized view repeatedly from the whole base table.

## Transactions {#transactions}

In contrast to ClickHouse, BigQuery supports multi-statement transactions inside a single query, or across multiple queries when using sessions. A multi-statement transaction lets you perform mutating operations, such as inserting or deleting rows on one or more tables, and either commit or rollback the changes atomically.  Multi-statement transactions are on [ClickHouse's roadmap for 2024](https://github.com/ClickHouse/ClickHouse/issues/58392).

## Aggregate functions {#aggregate-functions}

Compared to BigQuery, ClickHouse comes with significantly more built-in aggregate functions:

- BigQuery comes with [18 aggregate functions](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions), and [4 approximate aggregate functions](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions).
- ClickHouse has over [150 pre-built aggregation functions](/sql-reference/aggregate-functions/reference), plus powerful [aggregation combinators](/sql-reference/aggregate-functions/combinators) for [extending](https://www.youtube.com/watch?v=7ApwD0cfAFI) the behavior of pre-built aggregation functions. As an example, you can apply the over 150 pre-built aggregate functions to arrays instead of table rows simply by calling them with a [-Array suffix](/sql-reference/aggregate-functions/combinators#-array). With a [-Map suffix](/sql-reference/aggregate-functions/combinators#-map) you can apply any aggregate function to maps. And with a [-ForEach suffix](/sql-reference/aggregate-functions/combinators#-foreach), you can apply any aggregate function to nested arrays.

## Data sources and file formats {#data-sources-and-file-formats}

Compared to BigQuery, ClickHouse supports significantly more file formats and data sources:

- ClickHouse has native support for loading data in 90+ file formats from virtually any data source
- BigQuery supports 5 file formats and 19 data sources

## SQL language features {#sql-language-features}

ClickHouse provides standard SQL with many extensions and improvements that make it more friendly for analytical tasks. E.g. ClickHouse SQL [supports lambda functions](/sql-reference/functions/overview#arrow-operator-and-lambda) and higher order functions, so you don't have to unnest/explode arrays when applying transformations. This is a big advantage over other systems like BigQuery.

## Arrays {#arrays}

For the ClickHouse equivalents of BigQuery array functions and `UNNEST`-based patterns, see the [Array functions section](/migrations/bigquery/sql-translation-reference#array-functions) of the SQL translation reference.
