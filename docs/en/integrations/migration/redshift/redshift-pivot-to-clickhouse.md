---
sidebar_label: Pivot to ClickHouse
sidebar_position: 4
slug: /en/integrations/redshift/redshift-pivot-to-clickhouse
description: Pivot using S3
---

# Pivot Data from Redshift to ClickHouse using S3

In this scenario, we export data to S3 in an intermediary pivot format and, in a second step, load the data from S3 into ClickHouse.

<img src={require('./images/pivot.png').default} class="image" alt="PIVOT from Redshit using S3"/>

#### Pros

* Both Redshift and ClickHouse have powerful S3 integration features.
* Leverages the existing features such as the Redshift `UNLOAD` command and ClickHouse S3 table function / table engine.
* Scales seamlessly thanks to parallel reads and high throughput capabilities from/to S3 in ClickHouse.
* Can leverage sophisticated and compressed formats like Apache Parquet.

#### Cons

* Two steps in the process (unload from Redshift then load into ClickHouse).

### Tutorial

1. Using Redshift's [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) feature, export the data into a an existing private S3 bucket:

    <img src={require('./images/s3-1.png').default} class="image" alt="UNLOAD from Redshit to S3"/>

    It will generate part files containing the raw data in S3

    <img src={require('./images/s3-2.png').default} class="image" alt="Data in S3"/>

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
