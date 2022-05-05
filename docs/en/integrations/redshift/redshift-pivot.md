---
sidebar_label: PIVOT 
sidebar_position: 4
description: PIVOT using S3
---

# PIVOT data from Redshift to ClickHouse using S3

In this scenario, the idea is to leverage exporting data to S3 in an intermediary pivot format and, in a second step, load the data from S3 into ClickHouse.


<img src={require('./images/pivot.png').default} class="image" alt="PIVOT from Redshit using S3"/>

#### Pros

* Both Redshift and ClickHouse have powerful S3 integration features.
* Leverages the existing features such as the Redshift UNLOAD command and ClickHouse S3 table function / table engine.
* Scales seamlessly thanks to parallel reads and high throughput capabilities from/to S3 in ClickHouse.
* Can leverage sophisticated and compressed formats like Apache Parquet.

#### Cons

* A two steps process (unload from Redshift then load into ClickHouse).

### Tutorial

1. Using Redshift's [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) feature, export the data into a an existing private S3 bucket

<img src={require('./images/s3-1.png').default} class="image" alt="UNLOAD from Redshit to S3"/>

2. It will generate part files containing the raw data in S3

<img src={require('./images/s3-2.png').default} class="image" alt="Data in S3"/>

3. You can then load the S3 files into ClickHouse using an `INSERT INTO ... SELECT` statement
```
INSERT INTO users_imported (*) SELECT *
FROM s3('https://ryadh-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV', 'username String, firstname String, lastname String')

Query id: 2e7e219a-6124-461c-8d75-e4f5002c8557

Ok.

0 rows in set. Elapsed: 0.545 sec. Processed 49.99 thousand rows, 2.34 MB (91.72 thousand rows/s., 4.30 MB/s.)
```

:::note
We used CSV as pivot format for this example. However, for production workloads, we recommend Apache Parquet as the best option for large migrations since it comes with compression and can save some storage costs while reducing transfer times (by default, each row group is compressed using SNAPPY). ClickHouse also leverages Parquet's column orientation to speed up data ingestion.
:::