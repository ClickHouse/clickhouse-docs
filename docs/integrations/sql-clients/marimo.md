---
slug: /integrations/marimo
sidebar_label: 'marimo'
description: 'marimo is a next-generation Python notebook for interacting with data'
title: 'Using marimo with ClickHouse'
doc_type: 'guide'
keywords: ['marimo', 'notebook', 'data analysis', 'python', 'visualization']
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import Image from '@theme/IdealImage';
import marimo_connect from '@site/static/images/integrations/sql-clients/marimo/clickhouse-connect.gif';
import add_db_panel from '@site/static/images/integrations/sql-clients/marimo/panel-arrow.png';
import add_db_details from '@site/static/images/integrations/sql-clients/marimo/add-db-details.png';
import run_cell from '@site/static/images/integrations/sql-clients/marimo/run-cell.png';
import choose_sql_engine from '@site/static/images/integrations/sql-clients/marimo/choose-sql-engine.png';
import results from '@site/static/images/integrations/sql-clients/marimo/results.png';
import dropdown_cell_chart from '@site/static/images/integrations/sql-clients/marimo/dropdown-cell-chart.png';
import run_app_view from '@site/static/images/integrations/sql-clients/marimo/run-app-view.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Using marimo with ClickHouse

<CommunityMaintainedBadge/>

[marimo](https://marimo.io/) is an open-source reactive notebook for Python with SQL built-in. When you run a cell or interact with a UI element, marimo automatically runs affected cells (or marks them as stale), keeping code and outputs consistent and preventing bugs before they happen. Every marimo notebook is stored as pure Python, executable as a script, and deployable as an app.

<Image img={marimo_connect} size="md" border alt="Connect to ClickHouse" />

## 1. Install marimo with SQL support {#install-marimo-sql}

```shell
pip install "marimo[sql]" clickhouse_connect
marimo edit clickhouse_demo.py
```
This should open up a web browser running on localhost.

## 2. Connecting to ClickHouse. {#connect-to-clickhouse}

Navigate to the datasources panel on the left side of the marimo editor and click on 'Add database'.

<Image img={add_db_panel} size="sm" border alt="Add a new database" />

You will be prompted to fill in the database details.

<Image img={add_db_details} size="md" border alt="Fill in the database details" />

You will then have a cell that can be run to establish a connection.

<Image img={run_cell} size="md" border alt="Run the cell to connect to ClickHouse" />

## 3. Run SQL {#run-sql}

Once you have set up a connection, you can create a new SQL cell and choose the clickhouse engine. 

<Image img={choose_sql_engine} size="md" border alt="Choose SQL engine" />

For this guide, we will use the New York Taxi dataset.

```sql
CREATE TABLE trips (
    trip_id             UInt32,
    pickup_datetime     DateTime,
    dropoff_datetime    DateTime,
    pickup_longitude    Nullable(Float64),
    pickup_latitude     Nullable(Float64),
    dropoff_longitude   Nullable(Float64),
    dropoff_latitude    Nullable(Float64),
    passenger_count     UInt8,
    trip_distance       Float32,
    fare_amount         Float32,
    extra               Float32,
    tip_amount          Float32,
    tolls_amount        Float32,
    total_amount        Float32,
    payment_type        Enum('CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4, 'UNK' = 5),
    pickup_ntaname      LowCardinality(String),
    dropoff_ntaname     LowCardinality(String)
)
ENGINE = MergeTree
PRIMARY KEY (pickup_datetime, dropoff_datetime);
```

```sql
INSERT INTO trips
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM gcs(
    'https://storage.googleapis.com/clickhouse-public-datasets/nyc-taxi/trips_0.gz',
    'TabSeparatedWithNames'
);
```

```sql
SELECT * FROM trips LIMIT 1000;
```

<Image img={results} size="lg" border alt="Results in a dataframe" />

Now, you are able to view the results in a dataframe. I would like to visualize the most expensive drop-offs from a given pickup location. marimo provides several UI components to help you. I will use a dropdown to select the location and altair for charting.

<Image img={dropdown_cell_chart} size="lg" border alt="Combination of dropdown, table and chart" />

marimo's reactive execution model extends into SQL queries, so changes to your SQL will automatically trigger downstream computations for dependent cells (or optionally mark cells as stale for expensive computations). Hence the chart and table changes when the query is updated.

You can also toggle App View to have a clean interface for exploring your data.

<Image img={run_app_view} size="md" border alt="Run app view" />
