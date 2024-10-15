---
title: Inserting Data
description: How to insert data into ClickHouse
keywords: [insert, insert data, insert into table]
---

## Basic Example

You can use the familiar `INSERT INTO TABLE` command with ClickHouse:

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

Let's verify it worked - you should see the four rows of data that were inserted:

```sql
SELECT * FROM helloworld.my_first_table
```

## Inserting into ClickHouse vs. OLTP Databases

As an OLAP database, ClickHouse is optimized for high performance and scalability, allowing potentially millions of rows to be inserted per second. This is achieved through a combination of a highly parallelized architecture, high compression from column orientation, but with compromises on consistency. More specifically, ClickHouse is optimized for append-only operations and offers only eventual consistency guarantees.

In contrast, OLTP databases such as Postgres are specifically optimized for transactional inserts with full ACID compliance, ensuring strong consistency and reliability guarantees. PostgreSQL uses MVCC (Multi-Version Concurrency Control) to handle concurrent transactions, which involves maintaining multiple versions of data. These transactions can potentially be a small number of rows at a time, with considerable overhead incurred due to the reliability guarantees limiting insert performance.

In order to achieve high insert performance while obtaining strong consistency guarantees, users should adhere to simple rules described below when inserting into ClickHouse. This also avoids common issues users encounter when using ClickHouse for the first time and replicating their OLTP insert strategy.

## Best Practices for Inserts

- **Large batch sizes** - By default, each insert sent to ClickHouse causes ClickHouse to immediately create a part of storage containing the data from the insert together with other metadata that needs to be stored. Therefore, sending a smaller amount of inserts that each contain more data, compared to sending a larger amount of inserts that each contain less data, will reduce the number of writes required. Generally, we recommend inserting data in fairly large batches of at least 1,000 rows at a time, and ideally between 10,000 to 100,000 rows. Further details [here](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance). If large batches are not possible, use asynchronous inserts described below.

- **Ensure consistent batches for retries for idempotent retries** - By default, inserts into ClickHouse are synchronous and idempotent if identical. For tables of the MergeTree engine family, ClickHouse will, by default, automatically [deduplicate inserts](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). This means inserts are tolerant in cases like the following:

    1. If the node receiving the data has issues, the insert query will time out (or get a more specific error) and not get an acknowledgment.
    2. If the data got written by the node, but the acknowledgement can't be returned to the sender of the query because of network interruptions, the sender will either get a time-out or a network error.

    From the client's perspective, (i) and (ii) can be hard to distinguish. However, in both cases, the unacknowledged insert can just immediately be retried. As long as the retried insert query contains the same data in the same order, ClickHouse will automatically ignore the retried insert if the (unacknowledged) original insert succeeded.

- **Insert to a MergeTree table or Distributed table**  - We recommend inserting directly into a MergeTree (or Replicated table), balancing the requests across a set of nodes if the data is sharded, and using `internal_replication=true`. This will leave ClickHouse to replicate the data to any replica shards and ensure the data is eventually consistent. If this client side load balancing is inconvenient, users can insert via a [Distributed table](/en/engines/table-engines/special/distributed). This will then distribute writes across the nodes (again, leave `internal_replication=true`). This approach is a little less performant as writes have to be made locally on the node with the distributed table and then sent to the shards.
- **Use asynchronous inserts for small batches** - There are scenarios where client-side batching is not feasible e.g. an observability use case with 100s or 1000s of single-purpose agents sending logs, metrics, traces, etc., where real-time transport of that data is key to detect issues and anomalies as quickly as possible. Furthermore, there is the risk of event spikes in observed systems, potentially causing large memory spikes and related issues when trying to buffer observability data client-side. If large batches cannot be inserted, users can delegate batching to ClickHouse using [asynchronous inserts](/en/cloud/bestpractices/asynchronous-inserts). With asynchronous inserts, data is inserted into a buffer first and then written to the database storage later or asynchronously, respectively.

    <br />

    <img src={require('./images/postgres-inserts.png').default}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '600px'}} />

    <br />

    With enabled asynchronous inserts, when ClickHouse (1) receives an insert query, then the query's data is (2) immediately written into an in-memory buffer first. Asynchronously to (1), only when (3) the next buffer flush takes place is the buffer's data sorted and written as a part to the database storage. Note that the data is not searchable by queries before being flushed to the database storage; the buffer flush is configurable.

    Before the buffer gets flushed, the data of other asynchronous insert queries from the same or other clients can be collected in the buffer. The part created from the buffer flush will potentially contain the data from several asynchronous insert queries. Generally, these mechanics shift the batching of data from the client side to the server side (ClickHouse instance).

    Full details on configuring asynchronous inserts can be found [here](/en/optimize/asynchronous-inserts#enabling-asynchronous-inserts), with a deep dive [here](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

- **Use official clients** - ClickHouse has clients in the most popular programming languages. These are optimized for ensuring inserts are performed correctly and natively support asynchronous inserts either directly e.g. in the [Go client](/en/integrations/go#async-insert), or indirectly when enabled in the query, user or connection level settings.
- **Native format preferred** - ClickHouse supports many [input formats](/en/interfaces/formats) at insert (and query) time. This is a significant difference with OLTP databases and makes loading data from external sources much easier - especially when coupled with [table functions](/en/sql-reference/table-functions)  and the ability to load data from files on disk. These formats are ideal for ad hoc data loading and data engineering tasks. For applications looking to achieve optimal insert performance, users should insert using the Native format. This is supported by most clients (Go and Python) and ensures the server has to do minimal work since this format is already column-oriented. This thus forces the work to produce column-oriented data for the client, which should be considered in any effort to scale inserts. Alternatively, users can use [RowBinary format](/en/interfaces/formats#rowbinary) (as used by the Java client) if a row format is preferred - this is typically easier to write than the native format. This is more efficient, in terms of compression, network overhead, and processing on the server, than alternative row formats such as JSON. JSONEachRow format can be considered for users with lower write throughputs looking to integrate quickly. Users should be aware this format will incur a CPU overhead in ClickHouse for parsing.
- **HTTP or Native protocol** - Unlike many traditional databases, ClickHouse supports an HTTP interface. Users can use this for both inserting and querying data, using any of the above formats. This is often preferable to ClickHouse’s native protocol as it allows traffic to be easily switched with load balancers. We expect small differences in insert performance with the native protocol, which incurs a little less overhead. Existing clients use either of these protocols ( in some cases both e.g. the Go client). The native protocol does allow query progress to be easily tracked.

## Bulk loading data

For bulk loading data from Postgres, users can use:
- using `PeerDB by ClickHouse`, an ETL tool specifically designed for PostgreSQL database replication to both self-hosted ClickHouse and ClickHouse Cloud. To get started, create an account on [PeerDB Cloud](https://www.peerdb.io/) and refer to [the documentation](https://docs.peerdb.io/connect/clickhouse/clickhouse-cloud) for setup instructions.
- The postgres table function to read data directly as shown in previous examples. Typically appropriate if batch replication based on a known watermark, e.g., timestamp, is sufficient or if it's a one-off migration. This approach can scale to 10's millions of rows. Users looking to migrate larger datasets should consider multiple requests, each dealing with a chunk of the data. Staging tables can be used for each chunk prior to its partitions being moved to a final table. This allows failed requests to be retried.  For further details on this bulk-loading strategy, see here.
- Data can be exported from Postgres in CSV format. This can then be inserted into ClickHouse from either local files or via object storage using table functions.

:::note Need help inserting large datasets?
If you need help inserting large datasets or encounter any errors when importing data into ClickHouse Cloud, please contact us at support@clickhouse.com and we can assist.
:::
