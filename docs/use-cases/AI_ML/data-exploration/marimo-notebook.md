---
slug: /use-cases/AI/marimo-notebook
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
import image_6 from '@site/static/images/use-cases/AI_ML/Marimo/6.png';
import image_7 from '@site/static/images/use-cases/AI_ML/Marimo/7.gif';
import image_8 from '@site/static/images/use-cases/AI_ML/Marimo/8.gif';

In this guide, you will learn how you can explore a dataset on ClickHouse Cloud data in Marimo notebook with the help of [chDB](/docs/chdb) - a fast in-process SQL OLAP Engine powered by ClickHouse.

**Prerequisites:**
- Python 3.8 or higher
- a virtual environment
- a working ClickHouse Cloud service and your [connection details](/docs/cloud/guides/sql-console/gather-connection-details)

:::tip
If you don't yet have a ClickHouse Cloud account, you can [sign up](https://console.clickhouse.cloud/signUp?loc=docs-marimo-chdb) for
a trial and get $300 in free-credits to begin.
:::

**What you'll learn:**
- Connect to ClickHouse Cloud from Marimo notebooks using chDB
- Query remote datasets and convert results to Pandas DataFrames
- Visualize data using Plotly in Marimo
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

In order to reduce the likelihood of exposing your credentials, we recommend you add your Cloud username and password as environment variables on your local machine.
From a terminal run the following command to add your username and password as environment variables:

### Setting up credentials {#setting-up-credentials}

```bash
export CLICKHOUSE_CLOUD_HOSTNAME=<HOSTNAME>
export CLICKHOUSE_CLOUD_USER=default
export CLICKHOUSE_CLOUD_PASSWORD=your_actual_password
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
ClickHouse's [`remoteSecure`](/docs/sql-reference/table-functions/remote) function allows you to easily retrieve the data from ClickHouse Cloud.
You can instruct chDB to return this data in process as a Pandas data frame - which is a convenient and familiar way of working with data.

### Querying ClickHouse Cloud data {#querying-clickhouse-cloud-data}

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

In the query we are using the [`remoteSecure`](/sql-reference/table-functions/remote) function to connect to ClickHouse Cloud.

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

### Visualizing the data {#visualizing-the-data}

With the data now available to us in a familiar form, let's explore how prices of property in London have changed with time.

Marimo works particularly well with interactive plotting libraries like Plotly.
In a new cell, create an interactive chart:

```python
fig = px.line(
    df, 
    x='year', 
    y='price',
    title='Average Property Prices in London Over Time',
    labels={'price': 'Average Price (£)', 'year': 'Year'}
)

fig.update_traces(mode='lines+markers')
fig.update_layout(hovermode='x unified')
fig
```

Perhaps unsurprisingly, property prices in London have increased substantially over time.

<Image size="md" img={image_6} alt="Marimo data visualization"/>

One of Marimo's strengths is its reactive execution model. Let's create an interactive widget to select different towns dynamically.

### Interactive town selection {#interactive-town-selection}

In a new cell, create a dropdown to select different towns:

```python
town_selector = mo.ui.dropdown(
    options=['LONDON', 'MANCHESTER', 'BIRMINGHAM', 'LEEDS', 'LIVERPOOL'],
    value='LONDON',
    label='Select a town:'
)
town_selector
```

In another cell, create a query that reacts to the town selection. When you change the dropdown, this cell will automatically re-execute:

```python
query_reactive = f"""
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = '{town_selector.value}'
GROUP BY year
ORDER BY year
"""

df_reactive = chdb.query(query_reactive, "DataFrame")
df_reactive
```

Now create a chart that updates automatically when you change the town.
You can move the chart above the dynamic dataframe so that it appears
below the cell with the dropdown.

```python
fig_reactive = px.line(
    df_reactive,
    x='year',
    y='price',
    title=f'Average Property Prices in {town_selector.value} Over Time',
    labels={'price': 'Average Price (£)', 'year': 'Year'}
)

fig_reactive.update_traces(mode='lines+markers')
fig_reactive.update_layout(hovermode='x unified')
fig_reactive
```

Now when you select a town from the drop-down the chart will update dynamically:

<Image size="md" img={image_7} alt="Marimo dynamic chart"/>

### Exploring price distributions with interactive box plots {#exploring-price-distributions}

Let's dive deeper into the data by examining the distribution of property prices in London for different years.
A box and whisker plot will show us the median, quartiles, and outliers, giving us a much better understanding than just the average price.
First, let's create a year slider that will let us interactively explore different years:

In a new cell, add the following:

```python
year_slider = mo.ui.slider(
    start=1995,
    stop=2024,
    value=2020,
    step=1,
    label='Select Year:',
    show_value=True
)
year_slider
```

Now, let's query the individual property prices for the selected year.
Note that we're not aggregating here - we want all the individual transactions to build our distribution:

```python
query_distribution = f"""
SELECT
    price,
    toYear(date) AS year
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = 'LONDON'
  AND toYear(date) = {year_slider.value}
  AND price > 0
  AND price < 5000000
"""

df_distribution = chdb.query(query_distribution, "DataFrame")

# create an interactive box plot.
fig_box = go.Figure()

fig_box.add_trace(
    go.Box(
        y=df_distribution['price'],
        name=f'London {year_slider.value}',
        boxmean='sd',  # Show mean and standard deviation
        marker_color='lightblue',
        boxpoints='outliers'  # Show outlier points
    )
)

fig_box.update_layout(
    title=f'Distribution of Property Prices in London ({year_slider.value})',
    yaxis=dict(
        title='Price (£)',
        tickformat=',.0f'
    ),
    showlegend=False,
    height=600
)

fig_box
```
If you select the options button in the top right hand of the cell, you can hide
the code.
As you move the slider, the plot will automatically update thanks to Marimo's reactive execution:

<Image size="md" img={image_8} alt="Marimo dynamic chart"/>

## Summary {#summary}

This guide demonstrated how you can use chDB to explore your data in  ClickHouse Cloud using Marimo notebooks.
Using the UK Property Price dataset, we showed how to query remote ClickHouse Cloud data with the `remoteSecure()` function, and convert results directly to Pandas DataFrames for analysis and visualization.
Through chDB and Marimo's reactive execution model, data scientists can leverage ClickHouse's powerful SQL capabilities alongside familiar Python tools like Pandas and Plotly, with the added benefit of interactive widgets and automatic dependency tracking that make exploratory analysis more efficient and reproducible.
