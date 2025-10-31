---
slug: /use-cases/AI/jupyter-notebook
sidebar_label: 'Exploring data with Jupyter notebooks and chDB'
title: 'Exploring data in Jupyter notebooks with chDB'
description: 'This guide explains how to setup and use chDB to explore data from ClickHouse Cloud or local files in Jupyer notebooks'
keywords: ['ML', 'Jupyer', 'chDB', 'pandas']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import image_1 from '@site/static/images/use-cases/AI_ML/jupyter/1.png';
import image_2 from '@site/static/images/use-cases/AI_ML/jupyter/2.png';
import image_3 from '@site/static/images/use-cases/AI_ML/jupyter/3.png';
import image_4 from '@site/static/images/use-cases/AI_ML/jupyter/4.png';
import image_5 from '@site/static/images/use-cases/AI_ML/jupyter/5.png';
import image_6 from '@site/static/images/use-cases/AI_ML/jupyter/6.png';
import image_7 from '@site/static/images/use-cases/AI_ML/jupyter/7.png';
import image_8 from '@site/static/images/use-cases/AI_ML/jupyter/8.png';
import image_9 from '@site/static/images/use-cases/AI_ML/jupyter/9.png';

# Exploring data with Jupyter notebooks and chDB

In this guide, you will learn how you can explore a dataset on ClickHouse Cloud data in Jupyter notebook with the help of [chDB](/chdb) - a fast in-process SQL OLAP Engine powered by ClickHouse.

**Prerequisites**:
- a virtual environment
- a working ClickHouse Cloud service and your [connection details](/cloud/guides/sql-console/gather-connection-details)

:::tip
If you don't yet have a ClickHouse Cloud account, you can [sign up](https://console.clickhouse.cloud/signUp?loc=docs-juypter-chdb) for
a trial and get $300 in free-credits to begin.
:::

**What you'll learn:**
- Connect to ClickHouse Cloud from Jupyter notebooks using chDB
- Query remote datasets and convert results to Pandas DataFrames
- Combine cloud data with local CSV files for analysis
- Visualize data using matplotlib

We'll be using the UK Property Price dataset which is available on ClickHouse Cloud as one of the starter datasets.
It contains data about the prices that houses were sold for in the United Kingdom from 1995 to 2024.

## Setup {#setup}

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

```bash
export CLICKHOUSE_USER=default
export CLICKHOUSE_PASSWORD=your_actual_password
```

:::note
The environment variables above persist only as long as your terminal session.
To set them permanently, add them to your shell configuration file.
:::

Now activate your virtual environment.
From within your virtual environment, install Jupyter Notebook with the following command:

```python
pip install notebook
```

launch Jupyter Notebook with the following command:

```python
jupyter notebook
```

A new browser window should open with the Jupyter interface on `localhost:8888`.
Click `File` > `New` > `Notebook` to create a new Notebook.

<Image size="md" img={image_4} alt="Create a new notebook"/>

You will be prompted to select a kernel.
Select any Python kernel available to you, in this example we will select the `ipykernel`:

<Image size="md" img={image_5} alt="Select kernel"/>

In a blank cell, you can type the following command to install chDB which we will be using connect to our remote ClickHouse Cloud instance:

```python
pip install chdb
```

You can now import chDB and run a simple query to check that everything is set up correctly:

```python
import chdb

result = chdb.query("SELECT 'Hello, ClickHouse!' as message")
print(result)
```

## Exploring the data {#exploring-the-data}

With the UK price paid data set up and chDB up and running in a Jupyter notebook, we can now get started exploring our data.

Let's imagine we are interested in checking how price has changed with time for a specific area in the UK such as the capital city, London.
ClickHouse's [`remoteSecure`](/sql-reference/table-functions/remote) function allows you to easily retrieve the data from ClickHouse Cloud.
You can instruct chDB to return this data in process as a Pandas data frame - which is a convenient and familiar way of working with data.

Write the following query to fetch the UK price paid data from your ClickHouse Cloud service and turn it into a `pandas.DataFrame`:

```python
import os
from dotenv import load_dotenv
import chdb
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

# Load environment variables from .env file
load_dotenv()

username = os.environ.get('CLICKHOUSE_USER')
password = os.environ.get('CLICKHOUSE_PASSWORD')

query = f"""
SELECT 
    toYear(date) AS year,
    avg(price) AS avg_price
FROM remoteSecure(
'****.europe-west4.gcp.clickhouse.cloud',
default.pp_complete,
'{username}',
'{password}'
)
WHERE town = 'LONDON'
GROUP BY toYear(date)
ORDER BY year;
"""

df = chdb.query(query, "DataFrame")
df.head()
```

In the snippet above, `chdb.query(query, "DataFrame")` runs the specified query and outputs the result to the terminal as a Pandas DataFrame.
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

`df.head` displays only the first few rows of the returned data:

<Image size="md" img={image_6} alt="dataframe preview"/>

Run the following command in a new cell to check the types of the columns:

```python
df.dtypes
```

```response
year          uint16
avg_price    float64
dtype: object
```

Notice that while `date` is of type `Date` in ClickHouse, in the resulting data frame it is of type `uint16`.
chDB automatically infers the most appropriate type when returning the DataFrame.

With the data now available to us in a familiar form, let's explore how prices of property in London have changed with time.

In a new cell, run the following command to build a simple chart of time vs price for London using matplotlib:

```python
plt.figure(figsize=(12, 6))
plt.plot(df['year'], df['avg_price'], marker='o')
plt.xlabel('Year')
plt.ylabel('Price (£)')
plt.title('Price of London property over time')

# Show every 2nd year to avoid crowding
years_to_show = df['year'][::2]  # Every 2nd year
plt.xticks(years_to_show, rotation=45)

plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

<Image size="md" img={image_7} alt="dataframe preview"/>

Perhaps unsurprisingly, property prices in London have increased substantially over time.

A fellow data scientist has sent us a .csv file with additional housing related variables and is curious how 
the number of houses sold in London has changed over time.
Let's plot some of these against the housing prices and see if we can discover any correlation.

You can use the `file` table engine to read files directly on your local machine.
In a new cell, run the following command to make a new DataFrame from the local .csv file.

```python
query = f"""
SELECT 
    toYear(date) AS year,
    sum(houses_sold)*1000
    FROM file('/Users/datasci/Desktop/housing_in_london_monthly_variables.csv')
WHERE area = 'city of london' AND houses_sold IS NOT NULL
GROUP BY toYear(date)
ORDER BY year;
"""

df_2 = chdb.query(query, "DataFrame")
df_2.head()
```

<details>
<summary>Read from multiple sources in a single step</summary>
It's also possible to read from multiple sources in a single step. You could use the query below using a `JOIN` to do so:

```python
query = f"""
SELECT 
    toYear(date) AS year,
    avg(price) AS avg_price, housesSold
FROM remoteSecure(
'****.europe-west4.gcp.clickhouse.cloud',
default.pp_complete,
'{username}',
'{password}'
) AS remote
JOIN (
  SELECT 
    toYear(date) AS year,
    sum(houses_sold)*1000 AS housesSold
    FROM file('/Users/datasci/Desktop/housing_in_london_monthly_variables.csv')
  WHERE area = 'city of london' AND houses_sold IS NOT NULL
  GROUP BY toYear(date)
  ORDER BY year
) AS local ON local.year = remote.year
WHERE town = 'LONDON'
GROUP BY toYear(date)
ORDER BY year;
"""
```
</details>

<Image size="md" img={image_8} alt="dataframe preview"/>

Although we are missing data from 2020 onwards, we can plot the two datasets against each other for the years 1995 to 2019.
In a new cell run the following command:

```python
# Create a figure with two y-axes
fig, ax1 = plt.subplots(figsize=(14, 8))

# Plot houses sold on the left y-axis
color = 'tab:blue'
ax1.set_xlabel('Year')
ax1.set_ylabel('Houses Sold', color=color)
ax1.plot(df_2['year'], df_2['houses_sold'], marker='o', color=color, label='Houses Sold', linewidth=2)
ax1.tick_params(axis='y', labelcolor=color)
ax1.grid(True, alpha=0.3)

# Create a second y-axis for price data
ax2 = ax1.twinx()
color = 'tab:red'
ax2.set_ylabel('Average Price (£)', color=color)

# Plot price data up until 2019
ax2.plot(df[df['year'] <= 2019]['year'], df[df['year'] <= 2019]['avg_price'], marker='s', color=color, label='Average Price', linewidth=2)
ax2.tick_params(axis='y', labelcolor=color)

# Format price axis with currency formatting
ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'£{x:,.0f}'))

# Set title and show every 2nd year
plt.title('London Housing Market: Sales Volume vs Prices Over Time', fontsize=14, pad=20)

# Use years only up to 2019 for both datasets
all_years = sorted(list(set(df_2[df_2['year'] <= 2019]['year']).union(set(df[df['year'] <= 2019]['year']))))
years_to_show = all_years[::2]  # Every 2nd year
ax1.set_xticks(years_to_show)
ax1.set_xticklabels(years_to_show, rotation=45)

# Add legends
ax1.legend(loc='upper left')
ax2.legend(loc='upper right')

plt.tight_layout()
plt.show()
```

<Image size="md" img={image_9} alt="Plot of remote data set and local data set"/>

From the plotted data, we see that sales started around 160,000 in the year 1995 and surged quickly, peaking at around 540,000 in 1999.
After that, volumes declined sharply through the mid-2000s, dropping severely during the 2007-2008 financial crisis and falling to around 140,000.
Prices on the other hand showed steady, consistent growth from about £150,000 in 1995 to around £300,000 by 2005.
Growth accelerated significantly after 2012, rising steeply from roughly £400,000 to over £1,000,000 by 2019.
Unlike sales volume, prices showed minimal impact from the 2008 crisis and maintained an upward trajectory. Yikes!

## Summary {#summary}

This guide demonstrated how chDB enables seamless data exploration in Jupyter notebooks by connecting ClickHouse Cloud with local data sources.
Using the UK Property Price dataset, we showed how to query remote ClickHouse Cloud data with the `remoteSecure()` function, read local CSV files with the `file()` table engine, and convert results directly to Pandas DataFrames for analysis and visualization.
Through chDB, data scientists can leverage ClickHouse's powerful SQL capabilities alongside familiar Python tools like Pandas and matplotlib, making it easy to combine multiple data sources for comprehensive analysis.

While many a London-based data scientist may not be able to afford their own home or apartment any time soon, at least they can analyze the market that priced them out!
