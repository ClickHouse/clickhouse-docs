---
sidebar_label: PULL 
sidebar_position: 3
description: PULL data from Redshift to ClickHouse
---

# PULL data from Redshift to ClickHouse

In the PULL scenario, the idea is to leverage ClickHouse JDBC Bridge to connect to a Redshift cluster directly from ClickHouse instance and perform `INSERT INTO ... SELECT` queries


<img src={require('./images/pull.png').default} class="image" alt="PULL from Redshit to ClickHouse"/>

#### Pros

* Generic to all JDBC compatible tools
* Elegant solution to allow querying multiple external datasources from within ClickHouse 

#### Cons

* Requires a ClickHouse JDBC Bridge instance which can turn into a potential scalability bottleneck


:::note
Even is Redshift is based on PostgreSQL, using ClickHouse PostgreSQL table function and table engine is impossible since ClickHouse requires PostgreSQL version 9 or above and Redshift API is based on an earlier version (8.x).
:::

### Tutorial


To use this option, you will need to set up a ClickHouse JDBC Bridge. ClickHouse JDBC Bridge is a standalone Java application that handles JDBC connectivity and acts as a proxy between the ClickHouse instance and the datasources. For this tutorial, we used a pre-populated Redshift instance with a [sample database](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html).


1. Deploy the ClickHouse JDBC Bridge. For more details, see our user guide on [JDBC for External Datasources](../jdbc/jdbc-with-clickhouse)


2. Configure your Redshift datasource for ClickHouse JDBC Bridge. 
For example, `/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json ` 


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

```
SELECT *
FROM jdbc('redshift', 'select username, firstname, lastname from users limit 5')

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

```
SELECT * 
FROM jdbc('redshift', 'select count(*) from sales')

Query id: 2d0f957c-8f4e-43b2-a66a-cc48cc96237b

┌──count─┐
│ 172456 │
└────────┘

1 rows in set. Elapsed: 0.304 sec.
```


4. In the following, we display importing data using an `INSERT INTO ... SELECT` statement

```
# TABLE CREATION with 3 columns
CREATE TABLE users_imported
(
    `username` String,
    `firstname` String,
    `lastname` String
)
ENGINE = MergeTree
ORDER BY firstname

Query id: c7c4c44b-cdb2-49cf-b319-4e569976ab05

Ok.

0 rows in set. Elapsed: 0.233 sec.
```

```
# IMPORTING DATA
INSERT INTO users_imported (*) SELECT *
FROM jdbc('redshift', 'select username, firstname, lastname from users')

Query id: 9d3a688d-b45a-40f4-a7c7-97d93d7149f1

Ok.

0 rows in set. Elapsed: 4.498 sec. Processed 49.99 thousand rows, 2.49 MB (11.11 thousand rows/s., 554.27 KB/s.)
```
