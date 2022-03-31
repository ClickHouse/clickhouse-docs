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

1. Run the following command inserts 2,000,000 rows into your `trips` table from two different files in S3: `trips_1.tsv.gz` and `trips_2.tsv.gz`:
    ```sql
    INSERT INTO trips 
        SELECT * FROM s3(
            'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{1..2}.tsv.gz', 
            'TabSeparatedWithNames'
        ) 
    ```

2. Wait for that to execute - it might take a minute or two for the files to be downloaded and inserted.

3. When the data is finished being inserted, verify it worked:
    ```sql
    SELECT count() FROM trips
    ```

    You should see about 2M rows (1,999,530 to be precise).

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

1. We will start with some simple and fast calculations, like computing the average tip amount (which is right on $1.00)
    ```sql
    SELECT avg(tip_amount) FROM trips
    ```

2. This query computes the average cost based on the number of passengers:
    ```sql
    SELECT 
        passenger_count, 
        ceil(avg(total_amount),2) 
    FROM trips 
    GROUP BY passenger_count
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


## 4. Create a Dictionary

If you are new to ClickHouse, it is important to understand how dictionaries work. A dictionary is a mapping of key->value pairs that is stored in memory. They often are associated with data in a file or external database - and they can periodically update with that external data source. 

Let's see how to create a dictionary associated with a file in S3. The file contains the names of the boroughs (neighborhoods) of New York City, and the `LocationID` value relates to the `pickup_nyct2010_gid` and `dropoff_nyct2010_gid` columns in your `trips` table.

1. Notice what the CSV file looks like that contains the NYC boroughs:

    | LocationID      | Borough |  Zone      | service_zone |
    | ----------- | ----------- |   ----------- | ----------- |
    | 1      | EWR       |  Newark Airport   | EWR        |
    | 2    |   Queens     |   Jamaica Bay   |      Boro Zone   |
    | 3   |   Bronx     |  Allerton/Pelham Gardens    |    Boro Zone     |
    | 4     |    Manhattan    |    Alphabet City  |     Yellow Zone    |
    | 5     |  Staten Island      |   Arden Heights   |    Boro Zone     |


2. The URL for the file is `https://s3.amazonaws.com/nyc-tlc/misc/taxi+_zone_lookup.csv`. Run the following SQL, which creates a new dictionary named `taxi_zone_dictionary` that is based on this file in S3:
    ```sql
    CREATE DICTIONARY taxi_zone_dictionary (
        LocationID UInt16 DEFAULT 0,
        Borough String,
        Zone String,
        service_zone String
    )
    PRIMARY KEY LocationID
    SOURCE(HTTP(
        url 'https://s3.amazonaws.com/nyc-tlc/misc/taxi+_zone_lookup.csv'
        format 'CSVWithNames'
    ))
    LIFETIME(0)
    LAYOUT(HASHED());
    ```

    :::note
    Setting `LIFETIME` to 0 means this dictionary will never update with its source. It is used here to not send unnecessary traffic to our S3 bucket, but in general you could specify any lifetime values you prefer. For example:

    ```sql
    LIFETIME(MIN 1 MAX 10)
    ```
    specifies the dictionary to update after some random time between 1 and 10 seconds. (The random time is necessary in order to distribute the load on the dictionary source when updating on a large number of servers.)
    :::
    
3. Verify it worked - you should get around 265 rows:
    ```sql
    SELECT * FROM taxi_zone_dictionary 
    ```

4. Use the `dictGet` function ([or its variations](./en/sql-reference/functions/ext-dict-functions.md)) to retrieve a value from a dictionary. You pass in the name of the dictionary, the value you want, and the key (which in our example is the `LocationID` column of `taxi_zone_dictionary`). For exmaple, the following query returns the `Zone` whose `LocationID` is 132 (which as we saw above is JFK airport):
    ```sql
    SELECT dictGet('taxi_zone_dictionary', 'Zone', 132) 
    ```

5. Use the `dictHas` function to see if a key is present in the dictionary. For example, the following query returns 1 (which is "true" in ClickHouse):
    ```sql
    SELECT dictHas('taxi_zone_dictionary', 132) 
    ```

6. The following query returns 0 because 4567 is not a value of `LocationID` in the dictionary:
    ```sql
    SELECT dictHas('taxi_zone_dictionary', 4567) 
    ```

7. Use the `dictGet` function to retrieve a borough's name in a query. For example:
    ```sql
    SELECT
        count(1) AS total,
        dictGetOrDefault('taxi_zone_dictionary','Borough', toUInt64(pickup_nyct2010_gid), 'Unknown') AS borough_name
    FROM trips 
    WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
    GROUP BY borough_name
    ORDER BY total DESC
    ```

    This query sums up the number of taxi rides per borough that end at either the LaGuardia or JFK airport. The result is:
    ```
    ┌─total─┬─borough_name──┐
    │  7365 │ Unknown       │
    │  4320 │ Manhattan     │
    │  4229 │ Brooklyn      │
    │  4002 │ Queens        │
    │  2088 │ Bronx         │
    │  1619 │ Staten Island │
    │    42 │ EWR           │
    └───────┴───────────────┘
    ```


## 5. Perform a Join

Let's write some queries that join the `taxi_zone_dictionary` with your `trips` table.

1. We can start with a simple JOIN that acts similarly to the previous airport query above:
    ```sql
    SELECT
        count(1) AS total,
        Borough
    FROM trips 
    JOIN taxi_zone_dictionary ON toUInt64(trips.pickup_nyct2010_gid) = taxi_zone_dictionary.LocationID
    WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
    GROUP BY Borough
    ORDER BY total DESC
    ```

    :::note
    Notice the output of the above `JOIN` query is the same as the query before it that used `dictGetOrDefault`, except that the `Unknown` values are not included. Behind the scenes, ClickHouse is actually calling the `dictGet` function for the `taxi_zone_dictionary` dictionary, but the `JOIN` syntax is more familiar for SQL developers.
    :::

2. We do not use `SELECT *` often in ClickHouse - you should only retrieve the columns you actually need! But it is difficult to find a query that takes a long time, so this query purposely selects every column and does a right join on the dictionary:
    ```sql
    SELECT * 
    FROM trips 
    JOIN taxi_zone_dictionary 
        ON trips.dropoff_nyct2010_gid = taxi_zone_dictionary.LocationID
    WHERE tip_amount > 0
    ORDER BY tip_amount DESC
    ```

    It is the slowest query in this tutorial, and it takes about 1/2 second to process all 2M rows. Nice!

#### Congrats!

Well done, you made it through the tutorial, and hopefully you have a better understanding of how to use ClickHouse. Here are some options for what to do next:

- Read [how primary keys work in ClickHouse](./guides/improving-query-performance/sparse-primary-indexes.md) - this knowledge will move you a long ways along your journey to becoming a ClickHouse expert
- [Integrate an external data source](./integrations/) like files, Kafka, PostgreSQL, data pipelines, or lots of other data sources
- [Connect your favorite UI/BI tool](./connect-a-ui/) to ClickHouse
- Check out the [SQL Reference](./en/sql-reference/) and browse through the various functions. ClickHouse has an amazing collection of functions for transforming, processing and analyzing data



[Original article](https://clickhouse.com/docs/tutorial/) <!--hide-->
