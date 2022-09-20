---
sidebar_position: 40
slug: /en/whats-new/cloud-compatibility
sidebar_label: Cloud Compatibility
title: Cloud Compatibility
---

# ClickHouse Cloud (Beta) - Compatibility Guide

This guide provides an overview of what to expect functionally and operationally in ClickHouse Cloud (Beta). 

## ClickHouse Cloud Architecture
ClickHouse Cloud significantly simplifies operational overhead and reduces the costs of running ClickHouse at scale. There is no need to size your deployment upfront, set up replication for high availability, manually shard your data, scale up your servers when your workload increases, or scale them down when you are not using them – we handle this for you.  

These benefits come as a result of architectural choices underlying ClickHouse Cloud:
- Compute and storage are separated and thus can be automatically scaled along separate dimensions, so you do not have to over-provision either storage or compute in static instance configurations.
- Tiered storage on top of object store and multi-level caching provides virtually limitless scaling and good price/performance ratio, so you do not have to size your storage partition upfront and worry about high storage costs.
- High availability is on by default and replication is transparently managed, so you can focus on building your applications or analyzing your data.
- Automatic scaling for variable continuous workloads is on by default, so you don’t have to size your service upfront, scale up your servers when your workload increases, or manually scale down your servers when you have less activity
- Seamless hibernation for intermittent worloads is on by default. We automatically pause your compute resources after a period of inactivity and transparently start it again when a new query arrives, so you don’t have to pay for idle resources. 
- Advanced scaling controls provide the ability to set an auto-scaling maximum for additional cost control or an auto-scaling minimum to reserve compute resources for applications with specialized performance requirements. 

## Capabilities
ClickHouse Cloud (Beta) provides access to a curated set of capabilities in the open source distribution of ClickHouse. Tables below describe some features that are disabled in ClickHouse Cloud at this time. 

### DDL syntax
For the most part, the DDL syntax of ClickHouse Cloud should match what is available in self-managed installs. A few notable exceptions:
  - Support for `CREATE AS SELECT`, which is currently not available. As a workaround, we suggest using `CREATE ... EMPTY ... AS SELECT` and then inserting into that table (see [this blog](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1) for an example).
  - Some experimental syntax may be disabled, for instance, `ALTER TABLE … MODIFY QUERY` statement.
  - Some introspection functionality may be disabled for security purposes, for example, `addressToLine`, `uptime`, `tcpPort` SQL functions.

### Database and table engines
ClickHouse Cloud provides a highly-available, replicated service by default. As a result, the database engine is Replicated and the following table engines are supported:
  - ReplicatedMergeTree (default, when none is specified)
  - ReplicatedSummingMergeTree
  - ReplicatedAggregatingMergeTree
  - ReplicatedReplacingMergeTree
  - ReplicatedCollapsingMergeTree
  - ReplicatedVersionedCollapsingMergeTree
  - MergeTree (converted to ReplicatedMergeTree)
  - SummingMergeTree (converted to ReplicatedSummingMergeTree)
  - AggregatingMergeTree (converted to ReplicatedAggregatingMergeTree)
  - ReplacingMergeTree (converted to ReplicatedReplacingMergeTree)
  - CollapsingMergeTree (converted to ReplicatedCollapsingMergeTree)
  - VersionedCollapsingMergeTree (converted to ReplicatedVersionedCollapsingMergeTree)
  - S3
  - URL
  - View
  - MaterializedView
  - GenerateRandom
  - Join
  - Null
  - Buffer

### Interfaces
ClickHouse Cloud (Beta) supports HTTP and Native interfaces. Support for more interfaces such as MySQL, Postgres, and gRPC is coming soon.

### Dictionaries
Dictionaries are a popular feature of ClickHouse and are initially supported in ClickHouse Cloud via local dictionaries. Support for external dictionaries is coming soon. 

### Federated queries
We support federated ClickHouse queries for cross-cluster communication in the cloud, and for communication with external self-managed ClickHouse clusters. Federated queries with external database and table engines, such as PostgreSQL, MySQL, SQLite, ODBC, JDBC, MongoDB, Redis, Kafka, RabbitMQ, HDFS and Hive are not yet supported.

### Projections
Projections are a new feature of ClickHouse that is not yet supported in ClickHouse Cloud. Support for projections is coming soon. 

### User defined functions
User-defined functions are a recent feature in ClickHouse that is partially supported in ClickHouse Cloud via SQL user-defined functions. Executable UDFs are not yet supported. 

### Experimental features
We think it is important to allow our users to experiment with new features when they are released in ClickHouse Cloud. Since we handle upgrades for you, it is easy to stay up to date with the latest features we introduce in our monthly release cadence. Experimental features are typically off by default, and require you to enable a specific setting to make the feature available. Examples include:
  - Lightweight deletes
  - Geo types
  - JSON Object type

  However, some experimental features do not yet work as expected in the ClickHouse Cloud architecture, so we removed access to them for now, to ensure smooth and predictable operation of your environment. Examples include:
  - LIVE VIEW
  - WINDOW VIEW
  - ALTER MATERIALIZED VIEW

## Operational Defaults and Considerations
The following are default settings for ClickHouse Cloud services. In some cases, these settings are fixed to ensure correct operation of the service, and in others, they can be adjusted. 

### System settings
ClickHouse Cloud is tuned for variable workloads, and for that reason most system settings are not configurable at this time. We do not anticipate the need to tune system settings for most users, but if you have a question about advanced system tuning, please contact ClickHouse Cloud Support. 

### Assuming AWS IAM roles
AWS S3 is supported in ClickHouse Cloud, so you can use the S3 functions and table engine. However, right now ClickHouse Cloud does not yet support assuming your AWS IAM roles for the purposes of accessing your S3 bucket (this capability is coming soon).

### Advanced security administration
As part of creating the ClickHouse service, we create a default database, and the default user that has broad permissions to this database. This initial user can create additional users and assign their permissions to this database. Beyond this, the ability to enable the following security features within the database using Kerberos, LDAP, or SSL X.509 certificate authentication are not supported at this time.

## Roadmap
The table below summarizes our efforts to expand some of the capabilities described above. If you have feedback, please [submit it here](mailto:feedback@clickhouse.com) or fill out [ClickHouse Cloud Roadmap](https://www.google.com/url?q=https://docs.google.com/forms/d/1rzQtP3C1AnLQUjujdRLIBhqShljLA9XRI3c_SbSFOPU/edit&sa=D&source=docs&ust=1663266534678117&usg=AOvVaw3vHOPQgo6jY55OxhDvw1uD) Survey.

| Capability                                       | Coming soon? |
|--------------------------------------------------|:------------:|
|AWS IAM role support for table engines, such as S3| ✔            |
|External dictionaries                             | ✔            |
|Federated queries for MySQL and Postgres          | ✔            |
|Projections                                       | ✔            |
|MySQL & Postgres interfaces                       |              |
|Kafka Table Engine                                |              |
|Executable UDFs                                   |              |
