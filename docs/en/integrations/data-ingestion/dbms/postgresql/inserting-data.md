---
slug: /en/integrations/postgresql/inserting-data
title: How to insert data from PostgreSQL
keywords: [postgres, postgresql, inserts]
---

We recommend reading [this guide](/en/guides/inserting-data) to learn best practices on inserting data to ClickHouse to optimize for insert performance.

For bulk loading data from PostgreSQL, users can use:

- using `PeerDB by ClickHouse`, an ETL tool specifically designed for PostgreSQL database replication to both self-hosted ClickHouse and ClickHouse Cloud. To get started, create an account on [PeerDB Cloud](https://www.peerdb.io/) and refer to [the documentation](https://docs.peerdb.io/connect/clickhouse/clickhouse-cloud) for setup instructions.
- The [Postgres table function](/en/sql-reference/table-functions/postgresql) to read data directly. This is typically appropriate if batch replication based on a known watermark, e.g., timestamp, is sufficient or if it's a one-off migration. This approach can scale to tens of millions of rows. Users looking to migrate larger datasets should consider multiple requests, each dealing with a chunk of the data. Staging tables can be used for each chunk prior to its partitions being moved to a final table. This allows failed requests to be retried. For further details on this bulk-loading strategy, see [here](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3).
- Data can be exported from [Postgres in CSV format](https://blog.n8n.io/postgres-export-to-csv/). This can then be inserted into ClickHouse from either [local files](/en/integrations/data-ingestion/insert-local-files) or via object storage using [table functions](/en/sql-reference/statements/insert-into#inserting-using-a-table-function).
