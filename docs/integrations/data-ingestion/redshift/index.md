---
sidebar_label: 'Redshift'
slug: /integrations/redshift
description: 'Migrating Data from Redshift to ClickHouse'
title: 'Migrating data from Redshift to ClickHouse'
keywords: ['Redshift']
show_related_blogs: true
doc_type: 'guide'
---

import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';

# Migrating data from Redshift to ClickHouse

## Related content {#related-content}

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/SyhZmS5ZZaA"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## Introduction {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) is a popular cloud data warehousing solution that is part of the Amazon Web Services offerings. This guide presents different approaches to migrating data from a Redshift instance to ClickHouse. We will cover three options:

<Image img={redshiftToClickhouse} size="lg" alt="Redshift to ClickHouse Migration Options" background="white"/>

From the ClickHouse instance standpoint, you can either:

1. **[PUSH](#push-data-from-redshift-to-clickhouse)** data to ClickHouse using a third party ETL/ELT tool or service

2. **[PULL](#pull-data-from-redshift-to-clickhouse)** data from Redshift leveraging the ClickHouse JDBC Bridge

3. **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** using S3 object storage using an "Unload then load" logic

:::note
We used Redshift as a data source in this tutorial. However, the migration approaches presented here are not exclusive to Redshift, and similar steps can be derived for any compatible data source.
:::

## Push data from Redshift to ClickHouse {#push-data-from-redshift-to-clickhouse}

In the push scenario, the idea is to leverage a third-party tool or service (either custom code or an [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)) to send your data to your ClickHouse instance. For example, you can use a software like [Airbyte](https://www.airbyte.com/) to move data between your Redshift instance (as a source) and ClickHouse as a destination ([see our integration guide for Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md))

<Image img={push} size="lg" alt="PUSH Redshift to ClickHouse" background="white"/>

### Pros {#pros}

* It can leverage the existing catalog of connectors from the ETL/ELT software.
* Built-in capabilities to keep data in sync (append/overwrite/increment logic).
* Enable data transformation scenarios (for example, see our [integration guide for dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)).

### Cons {#cons}

* Users need to set up and maintain an ETL/ELT infrastructure.
* Introduces a third-party element in the architecture which can turn into a potential scalability bottleneck.

## Pull data from Redshift to ClickHouse {#pull-data-from-redshift-to-clickhouse}

In the pull scenario, the idea is to leverage the ClickHouse JDBC Bridge to connect to a Redshift cluster directly from a ClickHouse instance and perform `INSERT INTO ... SELECT` queries:

<Image img={pull} size="lg" alt="PULL from Redshift to ClickHouse" background="white"/>

### Pros {#pros-1}

* Generic to all JDBC compatible tools
* Elegant solution to allow querying multiple external data sources from within ClickHouse

### Cons {#cons-1}

* Requires a ClickHouse JDBC Bridge instance which can turn into a potential scalability bottleneck

:::note
Even though Redshift is based on PostgreSQL, using the ClickHouse PostgreSQL table function or table engine is not possible since ClickHouse requires PostgreSQL version 9 or above and the Redshift API is based on an earlier version (8.x).
:::

### Tutorial {#tutorial}

To use this option, you need to set up a ClickHouse JDBC Bridge. ClickHouse JDBC Bridge is a standalone Java application that handles JDBC connectivity and acts as a proxy between the ClickHouse instance and the data sources. For this tutorial, we used a pre-populated Redshift instance with a [sample database](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html).

1. Deploy the ClickHouse JDBC Bridge. For more details, see our user guide on [JDBC for External Data sources](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)

:::note
If you are using ClickHouse Cloud, you will need to run your ClickHouse JDBC Bridge on a separate environment and connect to ClickHouse Cloud using the [remoteSecure](/sql-reference/table-functions/remote/) function
:::

2. Configure your Redshift datasource for ClickHouse JDBC Bridge. For example, `/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json `

  ```json
  {
    "redshift-server": {
      "aliases": [
        "redshift"
      ],
      "driverUrls": [
      "https://s3.amazonaws.com/redshift-downloads/drivers/jdbc/2.1.0.4/redshift-jdbc42-2.1.0.4.jar"
      ],
      "driverClassName": "com.amazon.redshift.jdbc.Driver",
      "jdbcUrl": "jdbc:redshift://redshift-cluster-1.ckubnplpz1uv.us-east-1.redshift.amazonaws.com:5439/dev",
      "username": "awsuser",
      "password": "<password>",
      "maximumPoolSize": 5
    }
  }
  ```

3. Once ClickHouse JDBC Bridge deployed and running, you can start querying your Redshift instance from ClickHouse

  ```sql
  SELECT *
  FROM jdbc('redshift', 'select username, firstname, lastname from users limit 5')
  ```

  ```response
  Query id: 1b7de211-c0f6-4117-86a2-276484f9f4c0

  ┌─username─┬─firstname─┬─lastname─┐
  │ PGL08LJI │ Vladimir  │ Humphrey │
  │ XDZ38RDD │ Barry     │ Roy      │
  │ AEB55QTM │ Reagan    │ Hodge    │
  │ OWY35QYB │ Tamekah   │ Juarez   │
  │ MSD36KVR │ Mufutau   │ Watkins  │
  └──────────┴───────────┴──────────┘

  5 rows in set. Elapsed: 0.438 sec.
  ```

  ```sql
  SELECT *
  FROM jdbc('redshift', 'select count(*) from sales')
  ```

  ```response
  Query id: 2d0f957c-8f4e-43b2-a66a-cc48cc96237b

  ┌──count─┐
  │ 172456 │
  └────────┘

  1 rows in set. Elapsed: 0.304 sec.
  ```

4. In the following, we display importing data using an `INSERT INTO ... SELECT` statement

  ```sql
  # TABLE CREATION with 3 columns
  CREATE TABLE users_imported
  (
      `username` String,
      `firstname` String,
      `lastname` String
  )
  ENGINE = MergeTree
  ORDER BY firstname
  ```

  ```response
  Query id: c7c4c44b-cdb2-49cf-b319-4e569976ab05

  Ok.

  0 rows in set. Elapsed: 0.233 sec.
  ```

  ```sql
  # IMPORTING DATA
  INSERT INTO users_imported (*) SELECT *
  FROM jdbc('redshift', 'select username, firstname, lastname from users')
  ```

  ```response
  Query id: 9d3a688d-b45a-40f4-a7c7-97d93d7149f1

  Ok.

  0 rows in set. Elapsed: 4.498 sec. Processed 49.99 thousand rows, 2.49 MB (11.11 thousand rows/s., 554.27 KB/s.)
  ```

## Pivot data from Redshift to ClickHouse using S3 {#pivot-data-from-redshift-to-clickhouse-using-s3}

In this scenario, we export data to S3 in an intermediary pivot format and, in a second step, load the data from S3 into ClickHouse.

<Image img={pivot} size="lg" alt="PIVOT from Redshift using S3" background="white"/>

### Pros {#pros-2}

* Both Redshift and ClickHouse have powerful S3 integration features.
* Leverages the existing features such as the Redshift `UNLOAD` command and ClickHouse S3 table function / table engine.
* Scales seamlessly thanks to parallel reads and high throughput capabilities from/to S3 in ClickHouse.
* Can leverage sophisticated and compressed formats like Apache Parquet.

### Cons {#cons-2}

* Two steps in the process (unload from Redshift then load into ClickHouse).

### Tutorial {#tutorial-1}

1. Using Redshift's [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) feature, export the data into a an existing private S3 bucket:

    <Image img={s3_1} size="md" alt="UNLOAD from Redshift to S3" background="white"/>

    It will generate part files containing the raw data in S3

    <Image img={s3_2} size="md" alt="Data in S3" background="white"/>

2. Create the table in ClickHouse:

    ```sql
    CREATE TABLE users
    (
        username String,
        firstname String,
        lastname String
    )
    ENGINE = MergeTree
    ORDER BY username
    ```

    Alternatively, ClickHouse can try to infer the table structure using `CREATE TABLE ... EMPTY AS SELECT`:

    ```sql
    CREATE TABLE users
    ENGINE = MergeTree ORDER BY username
    EMPTY AS
    SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
    ```

    This works especially well when the data is in a format that contains information about data types, like Parquet.

3. Load the S3 files into ClickHouse using an `INSERT INTO ... SELECT` statement:
    ```sql
    INSERT INTO users SELECT *
    FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
    ```

    ```response
    Query id: 2e7e219a-6124-461c-8d75-e4f5002c8557

    Ok.

    0 rows in set. Elapsed: 0.545 sec. Processed 49.99 thousand rows, 2.34 MB (91.72 thousand rows/s., 4.30 MB/s.)
    ```

:::note
This example used CSV as the pivot format. However, for production workloads we recommend Apache Parquet as the best option for large migrations since it comes with compression and can save some storage costs while reducing transfer times. (By default, each row group is compressed using SNAPPY). ClickHouse also leverages Parquet's column orientation to speed up data ingestion.
:::
