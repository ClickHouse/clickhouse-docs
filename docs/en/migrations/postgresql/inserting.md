---
sidebar_label: Inserting data
sidebar_position: 80
title: Inserting data
slug: /en/migrations/postgresql/inserting
description: Inserting data
keywords: [migrate, migration, migrating, data, etl, elt, postgresql, postgres, concepts, mappings, data types, inserting]
---

As an OLTP database, Postgres is specifically optimized for transactional inserts with full ACID compliance, ensuring strong consistency and reliability guarantees. PostgreSQL uses MVCC (Multi-Version Concurrency Control) to handle concurrent transactions, which involves maintaining multiple versions of data. These transactions can potentially be a small number of rows at a time, with considerable overhead incurred due to the reliability guarantees limiting insert performance.

In contrast, as an OLAP database, ClickHouse is optimized for high performance and scalability allowing potentially millions of rows to be inserted per second. This is achieved through a combination of a highly parallelized architecture, high compression from column orientation, and compromises on consistency. More specifically, ClickHouse is optimized for append-only operations and offers only eventual consistency guarantees.

In order to achieve high insert performance while obtaining strong consistency guarantees, users should adhere to simple rules when inserting into ClickHouse. This also avoids common issues users encounter when using ClickHouse for the first time and replicating their Postgres insert strategy.

1. **Large batch sizes** - By default, each insert sent to ClickHouse causes ClickHouse to immediately create a part of storage containing the data from the insert together with other metadata that needs to be stored. Therefore sending a smaller amount of inserts that each contain more data, compared to sending a larger amount of inserts that each contain less data, will reduce the number of writes required. Generally, we recommend inserting data in fairly large batches of at least 1,000 rows at a time, and ideally between 10,000 to 100,000 rows. Further details [here](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance). If large batches are not possible, see (4).

2. **Ensure consistent batches for retries for idempotent retries** - By default, inserts into ClickHouse are synchronous and idempotent if identical. For tables of the merge tree engine family, ClickHouse will, by default, automatically [deduplicate inserts](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). This means inserts are tolerant in cases like the following:

    a. If the node receiving the data has issues, the insert query will time out (or get a more specific error) and not get an acknowledgment.

    b. If the data got written by the node, but the acknowledgement can’t be returned to the sender of the query because of network interruptions, the sender will either get a time-out or a network error.

    From the client's perspective, (1) and (2) can be hard to distinguish. However, in both cases, the unacknowledged insert can just immediately be retried. As long as the retried insert query contains the same data in the same order, ClickHouse will automatically ignore the retried insert if the (unacknowledged) original insert succeeded.

3. **Insert to MergeTree table or Distributed table** - We recommend inserting directly into a MergeTree (or Replicated table), balancing the requests across a set of nodes if the data is sharded, and using `internal_replication=true`. This will leave ClickHouse to replicate the data to any replica shards and ensure the data is eventually consistent. If this client side load balancing is inconvenient, users can insert via a Distributed table. This will then distribute writes across the nodes (again, leave `internal_replication=true`). This approach is a little less performant as writes have to be made locally on the node with the distributed table and then sent to the shards.

4. **Use asynchronous inserts for small batches** - There are scenarios where client-side batching is not feasible e.g. Observability use case with 100s or 1000s of single-purpose agents sending logs, metrics, traces, etc., where real-time transport of that data is key to detect issues and anomalies as quickly as possible. Furthermore, there is the risk of event spikes in observed systems, potentially causing large memory spikes and related issues when trying to buffer observability data client-side. If large batches cannot be inserted, users can delegate batching to ClickHouse using Asynchronous Inserts. With asynchronous inserts, data is inserted into a buffer first and then written to the database storage later or asynchronously, respectively.

<img src={require('./images/async_inserts.png').default} class="image" alt="Async inserts in ClickHouse" style={{width: '50%', marginBottom: '20px', textAlign: 'left'}}/>

With [enabled](/docs/en/optimize/asynchronous-inserts#enabling-asynchronous-inserts) asynchronous inserts, when ClickHouse ① receives an insert query, then the query’s data is ② immediately written into an in-memory buffer first. Asynchronously to ①, only when ③ the next buffer flush takes place the buffer’s data is [sorted](/docs/en/optimize/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) and written as a part to the database storage. Note that the data is not searchable by queries before being flushed to the database storage; the buffer flush is [configurable](/docs/en/optimize/asynchronous-inserts).

Before the buffer gets flushed, the data of other asynchronous insert queries from the same or other clients can be collected in the buffer. The part created from the buffer flush will potentially contain the data from several asynchronous insert queries. Generally, these mechanics shift the batching of data from the client side to the server side (ClickHouse instance).

Full details on configuring this feature can be found [here](/docs/en/optimize/asynchronous-inserts#enabling-asynchronous-inserts), with a deep dive [here](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

5. **Use official clients** - ClickHouse has clients in the most popular programming languages. These are optimized for ensuring inserts are performed correctly and natively support asynchronous inserts either directly e.g. [in the Go client](/docs/en/integrations/go#async-insert), or indirectly when[ enabled](/docs/en/optimize/asynchronous-inserts#enabling-asynchronous-inserts) in the query, user or connection level settings.

6. **Native format preferred** - ClickHouse supports many [input formats at insert](/docs/en/interfaces/formats) (and query) time. This is a significant difference with Postgres and makes loading data from external sources much easier - especially when coupled with Table functions such as S3 and Postgres and the ability to load data from files on disk. These formats are ideal for ad hoc data loading and data engineering tasks. For applications looking to achieve optimal insert performance, users should insert using the Native format. This is supported by most clients (Go and Python) and ensures the server has to do minimal work since this format is already column-oriented. This thus forces the work to produce column-oriented data for the client, which should be considered in any effort to scale inserts. Alternatively, users can use [RowBinary format](/docs/en/interfaces/formats#rowbinary) (as used by the Java client) if a row format is preferred - this is typically easier to write than the native format. This is more efficient, in terms of compression, network overhead, and processing on the server, than alternative row formats such as JSON. [JSONEachRow](/docs/en/interfaces/formats#jsoneachrow) format can be considered for users with lower write throughputs looking to integrate quickly. Users should be aware this format will incur a CPU overhead in ClickHouse for parsing.

7. **HTTP or Native protocol** - Unlike many traditional databases, ClickHouse supports an HTTP interface. Users can use this for both inserting and querying data, using any of the above formats. This is often preferable to ClickHouse’s native protocol as it allows traffic to be easily switched with load balancers. We expect small differences in insert performance with the native protocol, which incurs a little less overhead. Existing clients use either of these protocols (in some cases both e.g. the [Go client](/docs/en/integrations/go)). The native protocol does allow query progress to be easily tracked.

## Bulk loading data

For bulk loading data from Postgres, users can use:

* The postgres table function to read data directly as shown in previous examples. Typically appropriate if batch replication based on a known watermark, e.g., timestamp, is sufficient or if it's a one-off migration. This approach can scale to 10's millions of rows. Users looking to migrate larger datasets should consider multiple requests, each dealing with a chunk of the data. Staging tables can be used for each chunk prior to its partitions being moved to a final table. This allows failed requests to be retried.  For further details on this bulk-loading strategy, see [here](/blog/supercharge-your-clickhouse-data-loads-part3).
* Data can be exported from Postgres[ in CSV format](https://blog.n8n.io/postgres-export-to-csv/). This can then be inserted into ClickHouse from either [local files](/docs/en/integrations/data-ingestion/insert-local-files) or via [object storage using table functions](/docs/en/sql-reference/statements/insert-into#inserting-using-a-table-function).
