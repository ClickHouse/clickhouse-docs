---
sidebar_label: 'Glossary'
description: 'This page contains a list of commonly used words and phrases regarding ClickHouse, as well as their definitions.'
title: 'Glossary'
slug: /concepts/glossary
doc_type: 'explanation'
---

<!-- no-glossary -->

# Glossary

## Atomicity {#atomicity}

Atomicity ensures that a transaction (a series of database operations) is treated as a single, indivisible unit. This means that either all operations within the transaction occur, or none do. An example of an atomic transaction is transferring money from one bank account to another. If either step of the transfer fails, the transaction fails, and the money stays in the first account. Atomicity ensures no money is lost or created.

## Block {#block}

A block is a logical unit for organizing data processing and storage. Each block contains columnar data which is processed together to enhance performance during query execution. By processing data in blocks, ClickHouse utilizes CPU cores efficiently by minimizing cache misses and facilitating vectorized execution. ClickHouse uses various compression algorithms, such as LZ4, ZSTD, and Delta, to compress data in blocks.

## Cluster {#cluster}

A collection of nodes (servers) that work together to store and process data.

## CMEK {#cmek}

Customer-managed encryption keys (CMEK) allow customers to use their key-management service (KMS) key to encrypt the ClickHouse disk data key and protect their data at rest.

## Dictionary {#dictionary}

A dictionary is a mapping of key-value pairs that is useful for various types of reference lists. It is a powerful feature that allows for the efficient use of dictionaries in queries, which is often more efficient than using a `JOIN` with reference tables.

## Distributed table {#distributed-table}

A distributed table in ClickHouse is a special type of table that does not store data itself but provides a unified view for distributed query processing across multiple servers in a cluster.

## Granule {#granule}

A granule is a batch of rows in an uncompressed block. When reading data, ClickHouse accesses granules, but not individual rows, which enables faster data processing in analytical workloads. A granule contains 8192 rows by default. The primary index contains one entry per granule.

## Incremental materialized view {#incremental-materialized-view}

In ClickHouse is a type of materialized view that processes and aggregates data at insert time. When new data is inserted into the source table, the materialized view executes a predefined SQL aggregation query only on the newly inserted blocks and writes the aggregated results to a target table.

## Lightweight update {#lightweight-update}

A lightweight update in ClickHouse is an experimental feature that allows you to update rows in a table using standard SQL UPDATE syntax, but instead of rewriting entire columns or data parts (as with traditional mutations), it creates "patch parts" containing only the updated columns and rows. These updates are immediately visible in SELECT queries through patch application, but the physical data is only updated during subsequent merges.

## Materialized view {#materialized-view}

A materialized view in ClickHouse is a mechanism that automatically runs a query on data as it is inserted into a source table, storing the transformed or aggregated results in a separate target table for faster querying.

## MergeTree {#mergetree}

A MergeTree in ClickHouse is a table engine designed for high data ingest rates and large data volumes. It is the core storage engine in ClickHouse, providing features such as columnar storage, custom partitioning, sparse primary indexes, and support for background data merges.

## Mutation {#mutation}

A mutation in ClickHouse refers to an operation that modifies or deletes existing data in a table, typically using commands like ALTER TABLE ... UPDATE or ALTER TABLE ... DELETE. Mutations are implemented as asynchronous background processes that rewrite entire data parts affected by the change, rather than modifying rows in place.

## On-the-fly mutation {#on-the-fly-mutation}

On-the-fly mutations in ClickHouse are a mechanism that allows updates or deletes to be visible in subsequent SELECT queries immediately after the mutation is submitted, without waiting for the background mutation process to finish.

## Parts {#parts}

A physical file on a disk that stores a portion of the table's data. This is different from a partition, which is a logical division of a table's data that is created using a partition key.

## Partitioning key {#partitioning-key}

A partitioning key in ClickHouse is a SQL expression defined in the PARTITION BY clause when creating a table. It determines how data is logically grouped into partitions on disk. Each unique value of the partitioning key forms its own physical partition, allowing for efficient data management operations such as dropping, moving, or archiving entire partitions.

## Primary key {#primary-key}

In ClickHouse, a primary key determines the order in which data is stored on disk and is used to build a sparse index that speeds up query filtering. Unlike traditional databases, the primary key in ClickHouse does not enforce uniqueness—multiple rows can have the same primary key value.

## Projection {#projection}

A projection in ClickHouse is a hidden, automatically maintained table that stores data in a different order or with precomputed aggregations to speed up queries, especially those filtering on columns not in the main primary key.

## Refreshable materialized view {#refreshable-materialized-view}

Refreshable materialized view is a type of materialized view that periodically re-executes its query over the full dataset and stores the result in a target table. Unlike incremental materialized views, refreshable materialized views are updated on a schedule and can support complex queries, including JOINs and UNIONs, without restrictions.

## Replica {#replica}

A copy of the data stored in a ClickHouse database. You can have any number of replicas of the same data for redundancy and reliability. Replicas are used in conjunction with the ReplicatedMergeTree table engine, which enables ClickHouse to keep multiple copies of data in sync across different servers.

## Shard {#shard}

A subset of data. ClickHouse always has at least one shard for your data. If you do not split the data across multiple servers, your data will be stored in one shard. Sharding data across multiple servers can be used to divide the load if you exceed the capacity of a single server.

## Skipping index {#skipping-index}

Skipping indices are used to store small amounts of metadata at the level of multiple consecutive granules which allows ClickHouse to avoid scanning irrelevant rows. Skipping indices provide a lightweight alternative to projections.

## Sorting key {#sorting-key}

In ClickHouse, a sorting key defines the physical order of rows on disk. If you do not specify a primary key, ClickHouse uses the sorting key as the primary key. If you specify both, the primary key must be a prefix of the sorting key.

## Sparse index {#sparse-index}

A type of indexing when the primary index contains one entry for a group of rows, rather than a single row. The entry that corresponds to a group of rows is referred to as a mark. With sparse indexes, ClickHouse first identifies groups of rows that potentially match the query and then processes them separately to find a match. Because of this, the primary index is small enough to be loaded into the memory.

## Table engine {#table-engine}

Table engines in ClickHouse determine how data is written, stored and accessed. MergeTree is the most common table engine, and allows quick insertion of large amounts of data which get processed in the background.

## TTL {#ttl}

Time To Live (TTL) is A ClickHouse feature that automatically moves, deletes, or rolls up columns or rows after a certain time period. This allows you to manage storage more efficiently because you can delete, move, or archive the data that you no longer need to access frequently.