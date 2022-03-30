---
sidebar_label: Tutorial
sidebar_position: 3
keywords: [clickhouse, install, tutorial]
---

# ClickHouse Tutorial 

## What to Expect from This Tutorial? 

In this tutorial, you will create a table and insert a large dataset (two million rows of the [New York taxi data](./en/example-datasets/nyc-taxi.md)). Then you will execute queries on the dataset, including an example of how to use a Dictionary to perform a JOIN in ClickHouse.

:::note
This tutorial assumes you have already the ClickHouse server up and running [as described in the Quick Start](./quick-start.mdx).
:::

## 1. Create a New Table

The New York City taxi data contains the details of millions of Uber and taxi rides, with columns like pickup and dropoff times and locations, cost, tip amount, tolls, cab type, payment type and so on. Let's create a table to store this data...

1. Either open your Play UI at [http://localhost:8123/play](http://localhost:8123/play) or startup the `clickhouse client` by running the following command from the folder where your `clickhouse` binary is stored:
    ```bash
    ./clickhouse client
    ```

2. Create the following `trips` table in the `default` database:
    ```sql
    CREATE TABLE trips
    (
        `trip_id` UInt32,
        `vendor_id` Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
        `pickup_date` Date,
        `pickup_datetime` DateTime,
        `dropoff_date` Date,
        `dropoff_datetime` DateTime,
        `store_and_fwd_flag` UInt8,
        `rate_code_id` UInt8,
        `pickup_longitude` Float64,
        `pickup_latitude` Float64,
        `dropoff_longitude` Float64,
        `dropoff_latitude` Float64,
        `passenger_count` UInt8,
        `trip_distance` Float64,
        `fare_amount` Float32,
        `extra` Float32,
        `mta_tax` Float32,
        `tip_amount` Float32,
        `tolls_amount` Float32,
        `ehail_fee` Float32,
        `improvement_surcharge` Float32,
        `total_amount` Float32,
        `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
        `trip_type` UInt8,
        `pickup` FixedString(25),
        `dropoff` FixedString(25),
        `cab_type` Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
        `pickup_nyct2010_gid` Int8,
        `pickup_ctlabel` Float32,
        `pickup_borocode` Int8,
        `pickup_ct2010` String,
        `pickup_boroct2010` FixedString(7),
        `pickup_cdeligibil` String,
        `pickup_ntacode` FixedString(4),
        `pickup_ntaname` String,
        `pickup_puma` UInt16,
        `dropoff_nyct2010_gid` UInt8,
        `dropoff_ctlabel` Float32,
        `dropoff_borocode` UInt8,
        `dropoff_ct2010` String,
        `dropoff_boroct2010` FixedString(7),
        `dropoff_cdeligibil` String,
        `dropoff_ntacode` FixedString(4),
        `dropoff_ntaname` String,
        `dropoff_puma` UInt16
    )
    ENGINE = MergeTree
    PARTITION BY toYYYYMM(pickup_date)
    ORDER BY (cab_type, pickup_datetime)
    ```


## 2. Insert the Dataset

Now that you have a table created, let's add the NYC taxi data. It is in CSV files in S3, and you can simply load the data from there. 

1. Run the following command inserts 2,000,000 rows into your `trips` table from two different files in S3: `trips_7.tsv.gz` and `trips_8.tsv.gz`:
    ```sql
    INSERT INTO trips 
        SELECT * FROM s3(
            'https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{7..8}.tsv.gz', 
            'TabSeparatedWithNames'
        ) 
    ```

2. Wait for that to execute - it might take a minute or two for the files to be downloaded and inserted.

3. When the data is finished being inserted, verify it worked:
    ```sql
    SELECT count() FROM trips
    ```

    You should see 2,000,581 rows

    :::note
    Notice how quickly and how few rows ClickHouse had to process to determine the count. You can get back the count in 0.001 seconds and 26 rows processed. 26 just happens to be the number of **parts** that the `trips` table currently has, and parts know how many rows they have.
    :::

4. Notice if you run a query that needs to hit every row, you will notice considerably more rows need to be processed, but the execution time is still blazing fast:
    ```sql
    SELECT DISTINCT(pickup_ntaname) FROM trips
    ```

    This query has to process 2M rows and return 192 values, but notice it does this in about 0.05 seconds.

## 3. Analyze the Data

Let's see how quickly ClickHouse can process 2M rows of data...

1. We will start with some simple and fast calculations, like computing the average tip amount (which is right on $1)
    ```sql
    SELECT avg(tip_amount) FROM trips
    ```

2. This query computes the average cost based on the number of passengers:
    ```sql
    SELECT passenger_count, ceil(avg(total_amount),2) FROM trips GROUP BY passenger_count
    ```

3. Try this query, which returns the number of trips grouped by the number of passengers, the month, and the length of the trip:
    ```sql
    SELECT 
        passenger_count, 
        toMonth(pickup_date) AS month,
        toYear(pickup_date) AS year, 
        round(trip_distance) AS distance, 
        count() AS count
    FROM trips
    GROUP BY passenger_count, month, year, distance
    ORDER BY month, year, distance ASC
    ```

4. This query computes the length of the trip and groups the results by that value:
    ```sql
    SELECT 
        avg(tip_amount) AS avg_tip, 
        avg(fare_amount) AS avg_fare, 
        avg(passenger_count) AS avg_passenger,
        count() AS count,
        truncate(date_diff('second', pickup_datetime, dropoff_datetime)/3600) as trip_minutes
    FROM trips
    WHERE trip_minutes > 0
    GROUP BY trip_minutes
    ORDER BY trip_minutes DESC
    ```

5. This query counts the number of rides by day, then by each hour of the day:
    ```sql
    SELECT
        toDayOfMonth(dropoff_datetime) AS dropoff_date,
        toHour(dropoff_datetime) AS dropoff_hour,
        count(1) AS total
    FROM trips
    GROUP BY dropoff_date, dropoff_hour
    ORDER BY dropoff_date, dropoff_hour
    ```

6. As you can see, it doesn't seem to matter what type of grouping or calculation that is being performed, ClickHouse calculates the results almost immediately. Here is another query that has to hit every row:
    ```sql
    SELECT
        pickup_date,
        SUM(CASE WHEN cab_type IN ('yellow', 'green') THEN passenger_count ELSE 0 END) AS taxi,
        SUM(CASE WHEN cab_type = 'uber' THEN passenger_count ELSE 0 END) AS uber
    FROM trips
    WHERE pickup_ntaname != 'Airport'
    GROUP BY pickup_date
    ```

7. Let's look at rides to LaGuardia or JFK airports:
    ```sql
    SELECT
        cab_type,
        pickup_datetime,
        dropoff_datetime,
        total_amount,
        payment_type,
        pickup_nyct2010_gid,
        dropoff_nyct2010_gid,
        CASE
            WHEN dropoff_nyct2010_gid = 138 THEN 'LGA'
            WHEN dropoff_nyct2010_gid = 132 THEN 'JFK'
        END AS airport_code,
        EXTRACT(YEAR FROM pickup_datetime) AS year,
        EXTRACT(DAY FROM pickup_datetime) AS day,
        EXTRACT(HOUR FROM pickup_datetime) AS hour
    FROM trips
    WHERE dropoff_nyct2010_gid IN (132, 138)
    ORDER BY pickup_datetime  
    ```  


## 4. Define a Dictionary

If you are new to ClickHouse, it is important to understand how dictionaries work. They are similar to tables, but they reside in memory and are great for using on the right-hand side of a JOIN. Let's see how they work.

1. Notice the 

[Original article](https://clickhouse.com/docs/tutorial/) <!--hide-->
