---
sidebar_label: Overview
sidebar_position: 1
keywords: [clickhouse, migrate, migration, migrating, data]
---

# Migrating Data into ClickHouse

<div class='vimeo-container'>
  <iframe src="https://player.vimeo.com/video/753082620?h=eb566c8c08"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br/>

There are several options for migrating data into ClickHouse Cloud, depending on where your data resides now:

- [Self-managed to Cloud](./clickhouse-to-cloud.md): use the `remoteSecure` function to transfer data
- [Another DBMS](./clickhouse-local-etl.md): use the [clickhouse-local] ETL tool along with the appropriate ClickHouse table function for your current DBMS
- [Anywhere!](./etl-tool-to-clickhouse.md): use one of the many popular ETL/ELT tools that connect to all kinds of different data sources
- [Object Storage](./object-storage-to-clickhouse.md): easily insert data from S3 into ClickHouse

In the example [Migrate from Redshift](/docs/en/integrations/data-ingestion/redshift/index.md), we present three different ways to migrate data to ClickHouse.
