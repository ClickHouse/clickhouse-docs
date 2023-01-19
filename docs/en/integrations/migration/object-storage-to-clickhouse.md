---
sidebar_position: 50
sidebar_label: Object Storage to ClickHouse Cloud
---

# Move data from Cloud Object Storage to ClickHouse Cloud



<img src={require('./images/object-storage-01.png').default} class="image" alt="Migrating Self-managed ClickHouse" style={{width: '90%', padding: '30px'}}/>

:::note
Currently, ClickHouse Cloud only supports Amazon AWS S3 Object Storage.
:::

If you use a Cloud Object Storage as a data lake and wish to import this data into ClickHouse Cloud,
or if your current database system is able to directly offload data into a Cloud Object Storage, then you can use one of the
table functions - for now, [s3](/docs/en/sql-reference/table-functions/s3.md) or [s3Cluster](/docs/en/sql-reference/table-functions/s3Cluster.md)) - for migrating data stored in Cloud Object Storage into a ClickHouse Cloud table.

If your current database system is not able to directly offload data into a Cloud Object Storage, you could use a [third-party ETL/ELT tool](./etl-tool-to-clickhouse.md) or [clickhouse-local](./clickhouse-local-etl.md) for moving data
from you current database system to Cloud Object Storage, in order to migrate that data in a second step into a ClickHouse Cloud table.

Although this is a two steps process (offload data into a Cloud Object Storage, then load into ClickHouse), the advantage is that this
scales to petabytes thanks to a [solid ClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) support of highly-parallel reads from Cloud Object Storage.
Also you can leverage sophisticated and compressed formats like [Parquet](https://clickhouse.com/docs/en/interfaces/formats/#data-format-parquet).

There is a [blog article](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) with concrete code examples showing how you can get data into ClickHouse Cloud using S3.
