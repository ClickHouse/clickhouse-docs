---
slug: /integrations/postgresql/inserting-data
title: 'PostgreSQLからデータを挿入する方法'
keywords: ['postgres', 'postgresql', 'inserts']
description: 'ClickPipes、PeerDB、またはPostgresテーブル関数を使用してPostgreSQLからデータを挿入する方法を説明するページ'
---

We recommend reading [このガイド](/guides/inserting-data) to learn best practices on inserting data to ClickHouse to optimize for insert performance.

For bulk loading data from PostgreSQL, users can use:

- using [ClickPipes](/integrations/clickpipes/postgres), the managed integration service for ClickHouse Cloud - now in public beta. Please [こちらからサインアップしてください](https://clickpipes.peerdb.io/)
- `PeerDB by ClickHouse`, an ETL tool specifically designed for PostgreSQLデータベースのレプリケーションを、セルフマネージドのClickHouseおよびClickHouse Cloudの両方に行うためのものです。
    - PeerDBは現在、ClickHouse Cloudでネイティブに利用可能です - 当社の[新しいClickPipeコネクタ](/integrations/clickpipes/postgres)を使用した超高速なPostgresからClickHouseへのCDC - 現在、パブリックベータ中です。 Please [こちらからサインアップしてください](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)
- The [Postgres Table Function](/sql-reference/table-functions/postgresql) to read data directly. This is typically appropriate for if batch replication based on a known watermark, e.g. a timestamp. is sufficient or if it's a once-off migration. This approach can scale to 10's of millions of 行. Users looking to migrate larger datasets should consider multiple requests, each dealing with a chunk of the data. Staging tables can be used for each chunk prior to its パーティション being moved to a final table. This allows failed requests to be retried. For further details on this bulk-loading strategy, see here.
- Data can be exported from Postgres in CSV format. This can then be inserted into ClickHouse from either local files or via object storage using table functions.
