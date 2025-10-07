---
slug: /use-cases/AI/jupyter-notebook
sidebar_label: 'Exploring data with Marimo notebooks and chDB'
title: 'Exploring data with Marimo notebooks and chDB'
description: 'This guide explains how to setup and use chDB to explore data from ClickHouse Cloud or local files in Marimo notebooks'
keywords: ['ML', 'Marimo', 'chDB', 'pandas']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import image_1 from '@site/static/images/use-cases/AI_ML/jupyter/1.png';
import image_2 from '@site/static/images/use-cases/AI_ML/jupyter/2.png';
import image_3 from '@site/static/images/use-cases/AI_ML/jupyter/3.png';
import image_4 from '@site/static/images/use-cases/AI_ML/Marimo/4.png';
import image_5 from '@site/static/images/use-cases/AI_ML/Marimo/5.png';

In this guide, you will learn how you can explore a dataset on ClickHouse Cloud data in Marimo notebook with the help of [chDB](/docs/chdb) - a fast in-process SQL OLAP Engine powered by ClickHouse.

**Prerequisites:**
- Python 3.8 or higher
- a virtual environment
- a working ClickHouse Cloud service and your [connection details](/docs/cloud/guides/sql-console/gather-connection-details)

**What you'll learn:**
- Connect to ClickHouse Cloud from Marimo notebooks using chDB
- Query remote datasets and convert results to Pandas DataFrames
- Combine cloud data with local CSV files for analysis
- Visualize data using Plotly in Marimo's reactive environment
- Leverage Marimo's reactive execution model for interactive data exploration

We'll be using the UK Property Price dataset which is available on ClickHouse Cloud as one of the starter datasets.
It contains data about the prices that houses were sold for in the United Kingdom from 1995 to 2024.

## Setup {#setup}

### Loading the dataset {#loading-the-dataset}

To add this dataset to an existing ClickHouse Cloud service, login to [console.clickhouse.cloud](https://console.clickhouse.cloud/) with your account details.

In the left hand menu, click on `Data sources`. Then click `Predefined sample data`:

<Image size="md" img={image_1} alt="Add example data set"/>

Select `Get started` in the UK property price paid data (4GB) card:

<Image size="md" img={image_2} alt="Select UK price paid dataset"/>

Then click `Import dataset`:

<Image size="md" img={image_3} alt="Import UK price paid dataset"/>

ClickHouse will automatically create the `pp_complete` table in the `default` database and fill the table with 28.92 million rows of price point data.

In order to reduce the likelihood of exposing your credentials, we recommend to add your Cloud username and password as environment variables on your local machine.
From a terminal run the following command to add your username and password as environment variables:

### Setting up credentials {#setting-up-credentials}

```bash
export CLICKHOUSE_CLOUD_HOSTNAME=<HOSTNAME>
export CLICKHOUSE_USER=default
export CLICKHOUSE_PASSWORD=your_actual_password
```

:::note
The environment variables above persist only as long as your terminal session.
To set them permanently, add them to your shell configuration file.
:::

### Installing Marimo {#installing-marimo}

Now activate your virtual environment.
From within your virtual environment, install the following packages that we will be using in this guide:

```python
pip install chdb pandas plotly marimo
```

Create a new Marimo notebook with the following command:

```bash
marimo edit clickhouse_exploration.py
```

A new browser window should open with the Marimo interface on localhost:2718:

<Image size="md" img={image_4} alt="Marimo interface"/>

Marimo notebooks are stored as pure Python files, making them easy to version control and share with others.

## Installing dependencies {#installing-dependencies}

In a new cell, import the required packages:

```python
import marimo as mo
import chdb
import pandas as pd
import os
import plotly.express as px
import plotly.graph_objects as go
```

If you hover your mouse over the cell you will see two circles with the "+" symbol appear.
You can click these to add new cells.

Add a new cell and run a simple query to check that everything is set up correctly:

```python
result = chdb.query("SELECT 'Hello ClickHouse from Marimo!'", "DataFrame")
result
```

You should see the result shown underneath the cell you just ran:

<Image size="md" img={image_5} alt="Marimo hello world"/>

## Exploring the data {#exploring-the-data}

With the UK price paid data set up and chDB up and running in a Marimo notebook, we can now get started exploring our data.

Let's imagine we are interested in checking how price has changed with time for a specific area in the UK such as the capital city, London.

ClickHouse's [remoteSecure](/docs/sql-reference/table-functions/remote) function allows you to easily retrieve the data from ClickHouse Cloud.

You can instruct chDB to return this data in process as a Pandas data frame - which is a convenient and familiar way of working with data.

### Querying ClickHouse Cloud data

Create a new cell with the following query to fetch the UK price paid data from your ClickHouse Cloud service and turn it into a `pandas.DataFrame`:

```python
query = f"""
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year
"""

df = chdb.query(query, "DataFrame")
df.head()
```

In the snippet above, `chdb.query(query, "DataFrame")` runs the specified query and outputs the result as a Pandas DataFrame.

In the query we are using the `remoteSecure` function to connect to ClickHouse Cloud.

The `remoteSecure` functions takes as parameters:
- a connection string
- the name of the database and table to use
- your username
- your password

As a security best practice, you should prefer using environment variables for the username and password parameters rather than specifying them directly in the function, although this is possible if you wish.

The `remoteSecure` function connects to the remote ClickHouse Cloud service, runs the query and returns the result.

Depending on the size of your data, this could take a few seconds.

In this case we return an average price point per year, and filter by `town='LONDON'`.

The result is then stored as a DataFrame in a variable called `df`.