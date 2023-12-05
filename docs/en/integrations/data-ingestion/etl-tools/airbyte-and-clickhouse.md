---
sidebar_label:  Airbyte
sidebar_position: 11
keywords: [clickhouse, airbyte, connect, integrate, etl, data integration]
slug: /en/integrations/airbyte
description: Stream data into ClickHouse using Airbyte data pipelines
---

:::note
Please note that the Airbyte source and destination for ClickHouse are currently in [Alpha status](https://docs.airbyte.com/integrations/)
:::

# Connect Airbyte to ClickHouse

<a href="https://www.airbyte.com/" target="_blank">Airbyte</a> is an open-source data integration platform. It allows the creation of <a href="https://airbyte.com/blog/why-the-future-of-etl-is-not-elt-but-el" target="_blank">ELT</a> data pipelines and is shipped with more than 140 out-of-the-box connectors. This step-by-step tutorial shows how to connect Airbyte to ClickHouse as a destination and load a sample dataset.


## 1. Download and run Airbyte


1. Airbyte runs on Docker and uses `docker-compose`. Make sure to download and install the latest versions of Docker.

2. Deploy Airbyte by cloning the official Github repository and running `docker-compose up` in your favorite terminal:

	```bash
	git clone https://github.com/airbytehq/airbyte.git --depth=1
	cd airbyte
	./run-ab-platform.sh
	```

4. Once you see the Airbyte banner in your terminal, you can connect to <a href="http://localhost:8000" target="_blank">localhost:8000</a>

    <img src={require('./images/airbyte_01.png').default} class="image" alt="Airbyte banner" style={{width: '100%'}}/>

	:::note
	Alternatively, you can signup and use <a href="https://docs.airbyte.com/deploying-airbyte/on-cloud" target="_blank">Airbyte Cloud</a>
	:::

## 2. Add ClickHouse as a destination

In this section, we will display how to add a ClickHouse instance as a destination.

1. Start your ClickHouse server (Airbyte is compatible with ClickHouse version `21.8.10.19` or above) or login to your ClickHouse cloud account:

    ```bash
    clickhouse-server start
    ```

2. Within Airbyte, select the "Destinations" page and add a new destination:

    <img src={require('./images/airbyte_02.png').default} class="image" alt="Add a destination in Airbyte" style={{width: '100%'}}/>

3. Select ClickHouse from the "Destination type" drop-down list, and Fill out the "Set up the destination" form by providing your ClickHouse hostname and ports, database name, username and password and select if it's an SSL connection (equivalent to the `--secure` flag in the  `clickhouse-client`):

    <img src={require('./images/airbyte_03.png').default} class="image" alt="ClickHouse destination creation in Airbyte"/>

4. Congratulations! you have now added ClickHouse as a destination in Airbyte.

:::note
In order to use ClickHouse as a destination, the user you'll use need to have the permissions to create databases, tables and insert rows. We recommend creating a dedicated user for Airbyte (eg. `my_airbyte_user`) with the following permissions:

```sql
CREATE USER 'my_airbyte_user'@'%' IDENTIFIED BY 'your_password_here';

GRANT CREATE ON * TO my_airbyte_user;
```
:::


## 3. Add a dataset as a source

The example dataset we will use is the <a href="https://clickhouse.com/docs/en/getting-started/example-datasets/nyc-taxi/" target="_blank">New York City Taxi Data</a> (on <a href="https://github.com/toddwschneider/nyc-taxi-data" target="_blank">Github</a>). For this tutorial, we will use a subset of this dataset which corresponds to the month of Jan 2022.


1. Within Airbyte, select the "Sources" page and add a new source of type file.

    <img src={require('./images/airbyte_04.png').default} class="image" alt="Add a source in Airbyte" style={{width: '100%'}}/>

2. Fill out the "Set up the source" form by naming the source and providing the URL of the NYC Taxi Jan 2022 file (see below). Make sure to pick `parquet` as file format, `HTTPS Public Web` as Storage Provider and `nyc_taxi_2022` as Dataset Name.

	```text
	https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-01.parquet
	```

    <img src={require('./images/airbyte_05.png').default} class="image" alt="ClickHouse source creation in Airbyte"/>

3. Congratulations! You have now added a source file in Airbyte.


## 4. Create a connection and load the dataset into ClickHouse

1. Within Airbyte, select the "Connections" page and add a new connection

	<img src={require('./images/airbyte_06.png').default} class="image" alt="Add a connection in Airbyte" style={{width: '100%'}}/>

2. Select "Use existing source" and select the New York City Taxi Data, the select "Use existing destination" and select you ClickHouse instance.

3. Fill out the "Set up the connection" form by choosing a Replication Frequency (we will use `manual` for this tutorial) and select `nyc_taxi_2022` as the stream you want to sync. Make sure you pick `Normalized Tabular Data` as a Normalization.

	<img src={require('./images/airbyte_07.png').default} class="image" alt="Connection creation in Airbyte"/>

4. Now that the connection is created, click on "Sync now" to trigger the data loading (since we picked `Manual` as a Replication Frequency)

	<img src={require('./images/airbyte_08.png').default} class="image" alt="Sync now in Airbyte" style={{width: '100%'}}/>


5. Your data will start loading, you can expand the view to see Airbyte logs and progress. Once the operation finishes, you'll see a `Completed successfully` message in the logs:

	<img src={require('./images/airbyte_09.png').default} class="image" alt="Completed succesfully" style={{width: '100%'}}/>

6. Connect to your ClickHouse instance using your preferred SQL Client and check the resulting table:

	```sql
	SELECT *
	FROM nyc_taxi_2022
	LIMIT 10
	```

	The response should look like:
	```response
	Query id: 4f79c106-fe49-4145-8eba-15e1cb36d325

	┌─extra─┬─mta_tax─┬─VendorID─┬─RatecodeID─┬─tip_amount─┬─airport_fee─┬─fare_amount─┬─DOLocationID─┬─PULocationID─┬─payment_type─┬─tolls_amount─┬─total_amount─┬─trip_distance─┬─passenger_count─┬─store_and_fwd_flag─┬─congestion_surcharge─┬─tpep_pickup_datetime─┬─improvement_surcharge─┬─tpep_dropoff_datetime─┬─_airbyte_ab_id───────────────────────┬─────_airbyte_emitted_at─┬─_airbyte_normalized_at─┬─_airbyte_nyc_taxi_2022_hashid────┐
	│     0 │     0.5 │        2 │          1 │       2.03 │           0 │          17 │           41 │          162 │            1 │            0 │        22.33 │          4.25 │               3 │ N                  │                  2.5 │ 2022-01-24T16:02:27  │                   0.3 │ 2022-01-24T16:22:23   │ 000022a5-3f14-4217-9938-5657f9041c8a │ 2022-07-19 04:35:31.000 │    2022-07-19 04:39:20 │ 91F83E2A3AF3CA79E27BD5019FA7EC94 │
	│     3 │     0.5 │        1 │          1 │       1.75 │           0 │           5 │          186 │          246 │            1 │            0 │        10.55 │           0.9 │               1 │ N                  │                  2.5 │ 2022-01-22T23:23:05  │                   0.3 │ 2022-01-22T23:27:03   │ 000036b6-1c6a-493b-b585-4713e433b9cd │ 2022-07-19 04:34:53.000 │    2022-07-19 04:39:20 │ 5522F328014A7234E23F9FC5FA78FA66 │
	│     0 │     0.5 │        2 │          1 │       7.62 │        1.25 │          27 │          238 │           70 │            1 │         6.55 │        45.72 │          9.16 │               1 │ N                  │                  2.5 │ 2022-01-22T19:20:37  │                   0.3 │ 2022-01-22T19:40:51   │ 00003c6d-78ad-4288-a79d-00a62d3ca3c5 │ 2022-07-19 04:34:46.000 │    2022-07-19 04:39:20 │ 449743975782E613109CEE448AFA0AB3 │
	│   0.5 │     0.5 │        2 │          1 │          0 │           0 │         9.5 │          234 │          249 │            1 │            0 │         13.3 │           1.5 │               1 │ N                  │                  2.5 │ 2022-01-22T20:13:39  │                   0.3 │ 2022-01-22T20:26:40   │ 000042f6-6f61-498b-85b9-989eaf8b264b │ 2022-07-19 04:34:47.000 │    2022-07-19 04:39:20 │ 01771AF57922D1279096E5FFE1BD104A │
	│     0 │       0 │        2 │          5 │          5 │           0 │          60 │          265 │           90 │            1 │            0 │         65.3 │          5.59 │               1 │ N                  │                    0 │ 2022-01-25T09:28:36  │                   0.3 │ 2022-01-25T09:47:16   │ 00004c25-53a4-4cd4-b012-a34dbc128aeb │ 2022-07-19 04:35:46.000 │    2022-07-19 04:39:20 │ CDA4831B683D10A7770EB492CC772029 │
	│     0 │     0.5 │        2 │          1 │          0 │           0 │        11.5 │           68 │          170 │            2 │            0 │         14.8 │           2.2 │               1 │ N                  │                  2.5 │ 2022-01-25T13:19:26  │                   0.3 │ 2022-01-25T13:36:19   │ 00005c75-c3c8-440c-a8e8-b1bd2b7b7425 │ 2022-07-19 04:35:52.000 │    2022-07-19 04:39:20 │ 24D75D8AADD488840D78EA658EBDFB41 │
	│   2.5 │     0.5 │        1 │          1 │       0.88 │           0 │         5.5 │           79 │          137 │            1 │            0 │         9.68 │           1.1 │               1 │ N                  │                  2.5 │ 2022-01-22T15:45:09  │                   0.3 │ 2022-01-22T15:50:16   │ 0000acc3-e64f-4b58-8e15-dc47ff1685f3 │ 2022-07-19 04:34:37.000 │    2022-07-19 04:39:20 │ 2BB5B8E849A438E08F7FCF789E7D7E65 │
	│  1.75 │     0.5 │        1 │          1 │        7.5 │        1.25 │        27.5 │           17 │          138 │            1 │            0 │        37.55 │             9 │               1 │ N                  │                    0 │ 2022-01-30T21:58:19  │                   0.3 │ 2022-01-30T22:19:30   │ 0000b339-b44b-40b0-99f8-ebbf2092cc5b │ 2022-07-19 04:38:10.000 │    2022-07-19 04:39:20 │ DCCE79199EF9217CD769EFD5271302FE │
	│   0.5 │     0.5 │        2 │          1 │          0 │           0 │          13 │           79 │          140 │            2 │            0 │         16.8 │          3.19 │               1 │ N                  │                  2.5 │ 2022-01-26T20:43:14  │                   0.3 │ 2022-01-26T20:58:08   │ 0000caa8-d46a-4682-bd25-38b2b0b9300b │ 2022-07-19 04:36:36.000 │    2022-07-19 04:39:20 │ F502BE51809AF36582561B2D037B4DDC │
	│     0 │     0.5 │        2 │          1 │       1.76 │           0 │         5.5 │          141 │          237 │            1 │            0 │        10.56 │          0.72 │               2 │ N                  │                  2.5 │ 2022-01-27T15:19:54  │                   0.3 │ 2022-01-27T15:26:23   │ 0000cd63-c71f-4eb9-9c27-09f402fddc76 │ 2022-07-19 04:36:55.000 │    2022-07-19 04:39:20 │ 8612CDB63E13D70C1D8B34351A7CA00D │
	└───────┴─────────┴──────────┴────────────┴────────────┴─────────────┴─────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴───────────────┴─────────────────┴────────────────────┴──────────────────────┴──────────────────────┴───────────────────────┴───────────────────────┴──────────────────────────────────────┴─────────────────────────┴────────────────────────┴──────────────────────────────────┘
	```

	```sql
	SELECT count(*)
	FROM nyc_taxi_2022
	```

	The response is:
	```response
	Query id: a9172d39-50f7-421e-8330-296de0baa67e

	┌─count()─┐
	│ 2392428 │
	└─────────┘
	```



7. Notice that Airbyte automatically inferred the data types and added 4 columns to the destination table. These columns are used by Airbyte to manage the replication logic and log the operations. More details are available in the  <a href="https://docs.airbyte.com/integrations/destinations/clickhouse#output-schema" target="_blank">Airbyte official documentation</a>.

	```sql
	    `_airbyte_ab_id` String,
	    `_airbyte_emitted_at` DateTime64(3, 'GMT'),
	    `_airbyte_normalized_at` DateTime,
	    `_airbyte_nyc_taxi_072021_hashid` String
	```

	Now that the dataset is loaded on your ClickHouse instance, you can create an new table and use more suitable ClickHouse data types (<a href="https://clickhouse.com/docs/en/getting-started/example-datasets/nyc-taxi/" target="_blank">more details</a>).


8. Congratulations - you have successfully loaded the NYC taxi data into ClickHouse using Airbyte!
