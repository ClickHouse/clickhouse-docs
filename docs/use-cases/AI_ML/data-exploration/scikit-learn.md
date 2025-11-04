---
slug: /use-cases/AI/scikit-learn
sidebar_label: 'Building a binary classifier with scikit-learn'
title: 'Classifying UK property types with chDB and scikit-learn'
description: 'This guide explains how to build a binary classifier to distinguish flats from detached houses using chDB, ClickHouse Cloud and Scikit-learn'
keywords: ['ML', 'Scikit-learn', 'chDB', 'binary classification']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import image_1 from '@site/static/images/use-cases/AI_ML/jupyter/1.png';
import image_2 from '@site/static/images/use-cases/AI_ML/jupyter/2.png';
import image_3 from '@site/static/images/use-cases/AI_ML/jupyter/3.png';
import image_4 from '@site/static/images/use-cases/AI_ML/Marimo/4.png';
import property_price_distributions from '@site/static/images/use-cases/AI_ML/Scikit/property_price_distributions.png';
import property_type_composition from '@site/static/images/use-cases/AI_ML/Scikit/property_type_composition.png';
import confusion_matrix from '@site/static/images/use-cases/AI_ML/Scikit/confusion_matrix.png';

# Classifying UK property types with chDB and scikit-learn

Machine learning prototyping often involves juggling datasets, preprocessing steps, and performance constraints, which can make the process both complex and time-consuming.
**scikit-learn** is one of Python's most popular and powerful libraries for machine learning, offering a large set of utilities for building and evaluating models.
In this guide, we will explore how **chDB** complements scikit-learn in the model development life cycle, by building a binary classifier that predicts whether a property is a flat or a detached house, based on features like price, location, and date.

**Prerequisites:**

Before starting, ensure you have:
- Python 3.8 or higher installed
- A virtual environment activated (recommended)
- Basic understanding of SQL and machine learning concepts
- A ClickHouse Cloud service or trial account

## What we'll be building {#what-we-will-build}

The UK property market features diverse property types, each with distinct characteristics. Two of the most common types are **flats** and **detached houses**.
Flats are typically self-contained housing units within larger buildings, often found in urban areas with higher density. They generally cost less and have smaller floor areas.
Detached houses are standalone properties with no shared walls, usually found in suburban or rural areas. They typically command higher prices and offer more privacy and space.

Our goal in this guide is to build a binary classifier that can predict `is_flat = 1` (flat) or `is_flat = 0` (detached house) from property transaction features like price, location, and date.
By focusing only on these two property types, we can build a model that learns to distinguish between these fundamentally different housing options.

We'll be using the UK Property Price dataset which is available on ClickHouse Cloud as one of the starter datasets that you can import in a few easy clicks.
It contains pricing data for properties which were sold for in the United Kingdom from 1995 to 2024.

## Setup {#setup}

### Add the dataset to your Cloud service {#add-dataset}

To add this dataset to an existing ClickHouse Cloud service, login to [console.clickhouse.cloud](https://console.clickhouse.cloud/) with your account details. 

In the left hand menu, click on `Data sources`. Then click `Add sample data`:

<Image size="md" img={image_1} alt="Add example data set"/>

Select `Get started` in the UK property price paid data (4GB) card:

<Image size="md" img={image_2} alt="Select UK price paid dataset"/>

Then click `Import dataset`:

<Image size="md" img={image_3} alt="Import UK price paid dataset"/>

ClickHouse will automatically create the `pp_complete` table in the `default` database and fill the table with 28.92 million rows of price point data.

In order to reduce the likelihood of exposing your credentials, we recommend you add your Cloud username and password as environment variables on your local machine.
From a terminal run the following command to add your username and password as environment variables:

### Set up your credentials {#setting-up-credentials}

```bash
export CLICKHOUSE_CLOUD_HOSTNAME=<HOSTNAME>
export CLICKHOUSE_CLOUD_USER=default
export CLICKHOUSE_CLOUD_PASSWORD=your_actual_password
```

:::note
The environment variables above persist only as long as your terminal session.
To set them permanently, add them to your shell configuration file.

**Why environment variables?** Storing credentials in environment variables rather than hardcoding them in your notebook:
- Prevents accidentally committing passwords to version control
- Makes it easy to switch between development and production environments
- Follows security best practices
:::

### Setup a Marimo notebook {#marimo}

Activate your python virtual environment and install the following packages:

```sql
pip install marimo chdb scikit-learn pandas matplotlib numpy imbalanced-learn seaborn
```

We will be using Marimo as a notebook to explore our data and develop our ML model.
Run the following command to start a new notebook:

```sql
marimo edit property_type_classifier.py
```

A new browser window should open with the Marimo interface on localhost:2718:

<Image size="md" img={image_4} alt="Marimo interface"/>

Marimo notebooks are stored as pure Python files, making them easy to version control and share with others.

In your first cell, import the necessary libraries:

```python
import marimo as mo
import chdb
import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
from imblearn.over_sampling import SMOTE
import matplotlib.pyplot as plt
import seaborn as sns
```

In this guide we'll be making use of the following libraries:
- `chdb`: an embedded ClickHouse SQL engine for data processing
- `pandas` and `numpy`: a familiar data-science tool for data manipulation and numerical operations
- `scikit-learn`: a Machine learning tools (model, evaluation metrics) library
- `matplotlib` and `seaborn`: popular libraries for visualization
- `marimo`: reactive notebook components
- `imbalanced-learn`: provides tools for handling imbalanced datasets

### Import data from Cloud {#import-data}

With our environment variables set, our data imported into our Cloud service, and our notebook up and running, we'll next load the data into our notebook for processing.

ClickHouse's [`remoteSecure`](/sql-reference/table-functions/remote) function allows you to easily retrieve the data from ClickHouse Cloud.
You can instruct chDB to return this data in process as a Pandas data frame - which is a convenient and familiar way of working with data.  

Run the following query in a new cell to fetch the UK price paid data from your ClickHouse Cloud service and turn it into a `pandas.DataFrame`:

```python
# Query UK property data - only flats and detached houses
query = """
SELECT
    date,
    price,
    type::String AS type,
    town,
    district,
    locality,
    CASE WHEN type = 'flat' THEN 1 ELSE 0 END AS is_flat
FROM remoteSecure(
    '{host}',
    'default.pp_complete',
    '{user}',
    '{password}'
)
WHERE price > 0
    AND town IS NOT NULL
    AND district IS NOT NULL
    AND locality IS NOT NULL
    AND type IN ('detached', 'flat')
FORMAT Arrow
""".format(
    host=os.getenv('CLICKHOUSE_CLOUD_HOSTNAME'),
    user=os.getenv('CLICKHOUSE_CLOUD_USER'),
    password=os.getenv('CLICKHOUSE_CLOUD_PASSWORD')
)

# Load as Arrow table for efficiency
arrow_data = chdb.query(query, "ArrowTable")
df_raw = arrow_data.to_pandas()

mo.md(f"Loaded {len(df_raw):,} property records (flats and detached houses only) from ClickHouse Cloud")
```

The query above will load 11.8 million records from Cloud.

:::tip
Make sure your Cloud service is not in an idle state when you run the cell above.

You can run `df_raw.head()` in a new cell to take a look at the first few rows of the data.
:::

In the code snippet above we defined our SQL query as a templated string, passing in `host`, `user` and `password` as variables which hold our environment variables.
We used the **`remoteSecure()`** table engine to connect to ClickHouse Cloud over a secure connection (TLS encryption) and selected the columns we are interested in.
The **`WHERE`** clause filters data server side *before* transfer—removing invalid prices, null locations, and keeping only flats (`type = 'F'`) and detached houses (`type = 'D'`). This server-side filtering is much faster than transferring everything and filtering locally.
We also created a target variable `is_flat` using `CASE WHEN type = 'F' THEN 1 ELSE 0 END AS is_flat`, which creates a binary label (1 for flat, 0 for detached house).

**`FORMAT Arrow`** tells chDB to return data in the Apache Arrow format.
We chose Apache Arrow as it is a columnar data format that provides 3-10x faster data transfer compared to CSV.
ClickHouse offers the ability to work with over a hundred different file [formats](/interfaces/formats#formats-overview) including familiar ones like CSV, TSV and JSON.

The **`chdb.query(query, "ArrowTable")`** call tells chdb to execute the query we defined in String `query` and to return a PyArrow Table object as the result.
We then use the **`to_pandas()`** function, to convert the data to a Pandas data frame which is a convenient and familiar way of working with the data.
You'll see later in this guide how you can seamlessly transition between processing data using Pandas and using chdb depending on the task at hand.

## Data exploration {#data-exploration}

Before building our model, let's use chDB to understand how flats differ from detached houses.

### Compare price distributions {#compare-price-distributions}

Run the code below in a new cell to generate price distribution statistics for flats vs detached houses.

```python
def compare_price_stats():
    # Compare price statistics between flats and detached houses
    query_stats = """
    SELECT
        CASE WHEN is_flat = 1 THEN 'Flat' ELSE 'Detached' END as property_type,
        formatReadableQuantity(COUNT(*)) AS count,
        formatReadableQuantity(AVG(price)) AS avg_price,
        formatReadableQuantity(quantile(0.5)(price)) AS median_price,
        formatReadableQuantity(quantile(0.25)(price)) AS q25_price,
        formatReadableQuantity(quantile(0.75)(price)) AS q75_price,
        formatReadableQuantity(MIN(price)) AS min_price,
        formatReadableQuantity(MAX(price)) AS max_price
    FROM Python('df_raw')
    GROUP BY is_flat
    ORDER BY is_flat DESC
    """

    price_comparison = chdb.query(query_stats, "DataFrame")
    return mo.ui.table(price_comparison, label="Price distribution: Flats vs Detached houses")

compare_price_stats()
```

| Property Type |     Count | Average Price | Median Price | Q25 Price | Q75 Price | Min Price |    Max Price |
|---------------|-----------|---------------|--------------|-----------|-----------|-----------|--------------|
| Flat          | 5,204,810 |      £204,500 |     £144,720 |   £85,250 |  £232,500 |        £1 | £160,000,000 |
| Detached      | 6,666,708 |      £296,000 |     £234,950 |  £145,000 |  £360,000 |        £1 |  £53,490,000 |

In the `query_stats` string above we made use of the `Python` table engine.
This table engine allows us to read the data into chdb from the `df_raw` DataFrame which was defined in the previous cell.
We then used ClickHouse's built-in SQL capabilities and just a few of the many aggregate functions to aggregate and transform the data, calculating statistics like the average using `AVG` and the 25th percentile, median and 75th percentile using the `quantiles` function, as well as the min and max values using the `MIN` and `MAX` functions.
We used **`GROUP BY is_flat`** to split the data into two groups for comparison.

We're looking at these particular statistics because if the median price of a detached house is significantly different from the median price of a flat, then it's likely that we'll be able to train our model easily.
The 25th and 75th quartiles show us the "typical range" of the price distribution—if these don't overlap much between property types, then price alone is a strong signal.
**Min/Max** show us outliers in our data.

### Visualizing the price difference between flats and detached houses {#visualizing-flats-v-detached}

Run the following code in a new cell to visualize the distribution:

```python
def visualize_price_difference():
    # 1. Calculate the 99th percentile threshold for the entire dataset
    # we do this for visualization purposes due to extremely large outliers
    price_99th_percentile = df_raw['price'].quantile(0.99)
    
    # 2. Filter the DataFrame to include only prices up to the 99th percentile
    df_filtered = df_raw[df_raw['price'] <= price_99th_percentile]
    
    # Create side-by-side histograms using the filtered data
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    
    # Flats (Filtered)
    flat_prices = df_filtered[df_filtered['is_flat'] == 1]['price']
    axes[0].hist(flat_prices, bins=50, alpha=0.7, color='#e74c3c', edgecolor='white')
    axes[0].axvline(flat_prices.median(), color='darkred', linestyle='--', linewidth=2,
                    label=f'Median: £{flat_prices.median():,.0f}')
    axes[0].set_xlabel('Price (£)')
    axes[0].set_ylabel('Count')
    axes[0].set_title('Flats (Outliers Excluded)')
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)
    axes[0].ticklabel_format(style='plain', axis='x')
    
    # Detached houses (Filtered)
    detached_prices = df_filtered[df_filtered['is_flat'] == 0]['price']
    axes[1].hist(detached_prices, bins=50, alpha=0.7, color='#3498db', edgecolor='white')
    axes[1].axvline(detached_prices.median(), color='darkblue', linestyle='--', linewidth=2,
                    label=f'Median: £{detached_prices.median():,.0f}')
    axes[1].set_xlabel('Price (£)')
    axes[1].set_ylabel('Count')
    axes[1].set_title('Detached Houses (Outliers Excluded)')
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)
    axes[1].ticklabel_format(style='plain', axis='x')
    
    plt.suptitle(f"Price Distribution up to 99th Percentile (Max Price: £{price_99th_percentile:,.0f})")
    plt.tight_layout(rect=[0, 0.03, 1, 0.95])
    
    plt.show()

visualize_price_difference()
```

<Image size="lg" img={property_price_distributions} alt="Visualising the price distributions between flats and detached houses"/>

The distributions reveal three key differences that indicate we could build an effective classifier:
- significant shift in central tendency between the two property types
- different distribution shapes and peak frequencies
- detached houses exhibit a much more substantial high-price tail

<details>
First, there is a significant shift in central tendency between the two property types.
Detached houses typically have a higher median price compared to flats, reflecting their larger size, privacy, and standalone nature.
This difference in typical property price provides a simple yet powerful signal that classifiers can leverage.

Second, the distributions show different shapes and peak frequencies.
Flats tend to be concentrated at the lower end of the price spectrum, with their peak occurring in the more affordable price ranges.
In contrast, detached houses have a distribution that peaks at higher price points and extends further into premium price territory.
This separation means that price alone can be a strong indicator of property type.

Lastly, detached houses exhibit a much more substantial high-price tail in their distribution.
While both property types have outliers, detached houses maintain a noticeably thicker tail extending to much higher prices.
Properties in these higher price brackets are more likely to be detached houses, which offer more space, land, and privacy—features that command premium prices in the market.
</details>

### Geographic distribution {#geographic-distribution}

We'll again use chDB to explore how flats and detached houses are distributed across different localities.

In the query below we make use of the `Python` table engine to read our DataFrame, transform the data using ClickHouse, and return the result back as a DataFrame.

```python
def create_flat_vs_detached_chart(df):
    fig, ax = plt.subplots(figsize=(14, 10))

    # Define colors
    colors = {
        'detached': '#E74C3C',  # Red
        'flat': '#3498DB',      # Blue
    }

    # Prepare data
    localities = df['locality'].tolist()
    y_pos = np.arange(len(localities))

    # Create stacked bars - detached first, then flat
    ax.barh(y_pos, df['pct_detached'].values,
            color=colors['detached'],
            edgecolor='white', linewidth=1.5, label='Detached')

    ax.barh(y_pos, df['pct_flats'].values,
            left=df['pct_detached'].values,
            color=colors['flat'],
            edgecolor='white', linewidth=1.5, label='Flat')

    # Customize the plot
    ax.set_yticks(y_pos)
    ax.set_yticklabels(localities)
    ax.set_xlabel('Percentage of Properties', fontsize=12)
    ax.set_ylabel('City/Town', fontsize=12)
    ax.set_title('Property Type Composition by Major UK Cities (Flat vs Detached)',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xlim(0, 100)

    # Add grid
    ax.grid(axis='x', alpha=0.3, linestyle='--', linewidth=0.5)
    ax.set_axisbelow(True)

    # Create legend
    handles, labels = ax.get_legend_handles_labels()
    legend = ax.legend(handles, labels, title='Property Type',
                       loc='center left', bbox_to_anchor=(1, 0.5),
                       frameon=True, fancybox=False, shadow=False)
    legend.get_title().set_fontweight('bold')

    # Style adjustments
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_linewidth(0.5)
    ax.spines['bottom'].set_linewidth(0.5)

    plt.tight_layout()

    return fig

def compare_type_by_locality():
    # Compare property type composition by locality
    query_locality = """
    SELECT
        locality,
        COUNT(*) as total_properties,
        SUM(CASE WHEN is_flat = 1 THEN 1 ELSE 0 END) as flat_count,
        SUM(CASE WHEN is_flat = 0 THEN 1 ELSE 0 END) as detached_count,
        (SUM(CASE WHEN is_flat = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as pct_flats,
        (SUM(CASE WHEN is_flat = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as pct_detached
    FROM Python(df_raw)
    GROUP BY locality
    HAVING COUNT(*) > 10000  -- Only show localities with significant data
    ORDER BY pct_flats DESC
    LIMIT 10
    """

    locality_comparison = chdb.query(query_locality, "DataFrame")
    fig = create_flat_vs_detached_chart(locality_comparison)
    return fig

compare_type_by_locality()
```

This query reveals how the composition of property types varies by locality.
Urban areas like London tend to have a much higher percentage of flats, while more rural or suburban localities have a higher proportion of detached houses.
This geographic variation is important because location becomes another useful signal for our classifier—the locality where a property is located can help predict whether it's more likely to be a flat or a detached house.

<Image size="lg" img={property_type_composition} alt="Property type composition by locality"/>

## Feature engineering with chDB {#feature-engineering}

Now we'll create features for our machine learning model.
Feature engineering is where we transform raw data into inputs the model can learn from effectively.

### Creating time-based features {#creating-time-based-features}

```python
# Create features for classification
features_query = """
SELECT
    is_flat,
    price,
    toYear(date::Date) AS year,
    toMonth(date::Date) AS month,
    toQuarter(date::Date) AS quarter,
    toDayOfWeek(date::Date) AS day_of_week,
    town,
    district,
    locality,
    toYear(date::Date) - 2010 AS years_since_2010,
    log(price) AS log_price,
    row_number() OVER () AS record_id
FROM Python(df_raw)
WHERE price > 0
"""

df_features = chdb.query(features_query, "DataFrame")
mo.md(f"**Feature dataset:** {df_features.shape[0]:,} rows × {df_features.shape[1]} columns")
```

The query above creates a feature dataset by extracting and transforming multiple variables from the raw property data.
Starting with the original columns like `is_flat`, `price`, and location fields, the query adds several time-based and derived features to help the classification model identify patterns.

Time-based features are extracted from the transaction date to capture temporal patterns in the property market.
- The `year` extraction is important because property prices fluctuate over time due to changing market conditions.
- The `month` feature captures seasonal patterns, as the property market sees more activity during spring and summer.
- The `quarter` identifies broader economic cycles, while the day of the week (1 for Monday, 7 for Sunday) reflects that most transactions occur on weekdays.
- The `years_since_2010` variable provides a continuous time representation that machine learning models can more easily incorporate into their predictions.

The query also engineers a logarithmic transformation of the price variable, which offers several advantages for modeling.
It reduces the influence of extreme outliers, makes the price distribution more normal, and treats proportional changes equally—so the jump from £100,000 to £200,000 is modeled similarly to £500,000 to £1,000,000. Finally, a unique record ID is assigned to each row, making it easy to trace predictions back to their original records.

One of chDB's key advantages is that all these transformations happen together in a single SQL statement, which executes much faster than performing each transformation sequentially in pandas.
This efficiency is especially valuable when working with large datasets like ours.

### Encoding categorical variables {#encoding-categorical-variables}

Machine learning models need numerical inputs, but we have text values like town names ("LONDON", "BIRMINGHAM", "MANCHESTER"), district names, and locality names.
We'll need to convert these to numbers first.
While we could use a function like `LabelEncoder` from Scikit learn, we'll use an approach called **label encoding** implemented through **reference tables** (also called dimension tables in data warehousing).

<VerticalStepper headerLevel="h4">

#### Create reference tables {#create-reference-tables}

In a new cell, run the code shown below:

```python
def create_reference_table(df, column_name):
    """
    Create a reference table that maps category values to numeric IDs.
    
    This is like creating a lookup table or dictionary:
    LONDON -> 0
    BIRMINGHAM -> 1
    MANCHESTER -> 2
    etc.
    """
    query = f"""
    SELECT
        {column_name},
        row_number() OVER (ORDER BY {column_name}) - 1 as {column_name}_id
    FROM (
        SELECT DISTINCT {column_name}
        FROM Python(df)
        WHERE {column_name} IS NOT NULL
    )
    ORDER BY {column_name}
    """
    return chdb.query(query, "DataFrame")
```

Let's break this query down step by step, starting with the inner select statement:

```sql
SELECT DISTINCT {column_name} FROM Python(df) WHERE {column_name} IS NOT NULL
```

Here we use **`DISTINCT`** to get only unique column names (removing duplicates) and include **`WHERE ... IS NOT NULL`** to exclude missing values.
For column `town`, for example, this will return a list of unique towns such as "LONDON", "BIRMINGHAM", "MANCHESTER", etc.

```sql
SELECT {column_name}, row_number() OVER (ORDER BY {column_name}) - 1 as {column_name}_id
```

The outer query, shown above, then uses that data and assigns a sequential numbers to each row (to each unique town) using  **`row_number() OVER (ORDER BY {column_name})`** where `row_number` is a window function that numbers rows: 1, 2, 3, 4, etc.
We use `ORDER BY {column_name}` to order alphabetically.
Using the `town` column for example, will result in `BIRMINGHAM=1`, `LEEDS=2`, `LONDON=3`, `MANCHESTER=4` etc.
Finally, we subtract one so that IDs start from 0, which is a common ML convention.

This produces a mapping table where each unique categorical variable is assigned a unique numeric variable.
An example is shown below:

| town       | town_id |
| ---------- | ------- |
| BIRMINGHAM | 0       |
| BRISTOL    | 1       |
| LEEDS      | 2       |
| LIVERPOOL  | 3       |
| LONDON     | 4       |
| MANCHESTER | 5       |

#### Create reference tables for all categorical features {#create-reference-tables-for-all-categorical-features}

We can now use the `create_reference_table` function to generate reference tables for the features of interest.
Note that we don't encode the property type since it's already captured in our binary target variable `is_flat`.

```python
# Create reference tables for categorical columns
town_ref = create_reference_table(df_features, 'town')
district_ref = create_reference_table(df_features, 'district')
locality_ref = create_reference_table(df_features, 'locality')

# Display the mappings
mo.hstack([
    mo.ui.table(town_ref, label="Town Encoding"),
    mo.ui.table(district_ref, label="District Encoding"),
    mo.ui.table(locality_ref, label="Locality Encoding")
])
```

This produces a unique numerical mapping for each of the categorical variables.

#### Apply the mappings {#apply-the-mappings}

Now we replace text values with numeric IDs using these reference tables with the
`zip` function to pair up columns and the `dict` function to convert pairs to a dictionary:

```python
# Create dictionaries for fast lookups
town_dict = dict(zip(town_ref['town'], town_ref['town_id']))
district_dict = dict(zip(district_ref['district'], district_ref['district_id']))
locality_dict = dict(zip(locality_ref['locality'], locality_ref['locality_id']))
```

We can then apply the mappings:

```python
# Replace text with numeric IDs
df_features['town_id'] = df_features['town'].map(town_dict)
df_features['district_id'] = df_features['district'].map(district_dict)
df_features['locality_id'] = df_features['locality'].map(locality_dict)
```

The table below shows an example of how our features looked before applying the encoding:

| record_id  | town           | district         | locality    | price  | is_flat |
|------------|----------------|------------------|-------------|--------|---------|
| 1          | ABBOTS LANGLEY | ABERCONWY        | ABBERTON    | 450000 | 1       |
| 2          | ABERAERON      | ADUR             | AB KETTLEBY | 180000 | 1       |
| 3          | ABERDARE       | ALLERDALE        | ABBERD      | 520000 | 0       |
| 4          | ABERDOVEY      | ALNWICK          | ABBERLEY    | 320000 | 0       |
| 5          | ABERGAVENNY    | ALYN AND DEESIDE | ABBERTON    | 275000 | 1       |

After encoding, they look like this:

| record_id  | town           | town_id  | district         | district_id  | locality    | locality_id  | price  | is_flat |
|------------|----------------|----------|------------------|--------------|-------------|--------------|--------|---------|
| 1          | ABBOTS LANGLEY | 0        | ABERCONWY        | 0            | ABBERTON    | 4            | 450000 | 1       |
| 2          | ABERAERON      | 1        | ADUR             | 1            | AB KETTLEBY | 1            | 180000 | 1       |
| 3          | ABERDARE       | 2        | ALLERDALE        | 2            | ABBERD      | 2            | 520000 | 0       |
| 4          | ABERDOVEY      | 3        | ALNWICK          | 3            | ABBERLEY    | 3            | 320000 | 0       |
| 5          | ABERGAVENNY    | 4        | ALYN AND DEESIDE | 4            | ABBERTON    | 4            | 275000 | 1       |

#### Clean the data {#clean-the-data}

Most ML models can't handle `NaN` (missing) values so we either need to fill them or remove them.
For this demonstration, we will remove them using the `dropna` function:

```python
# Remove any rows with missing values
df_clean = df_features.dropna()

mo.ui.table(df_clean.head(10))
```

</VerticalStepper>

## Model training {#model-training}

Now that we have numerical features, it's time to build our classifier.

### Select feature columns {#select-feature-columns}

```python
# Select feature columns for the model
feature_columns = [
    'price',
    'log_price',
    'year',
    'month',
    'quarter',
    'day_of_week',
    'town_id',
    'district_id',
    'locality_id',
    'years_since_2010'
]

# Separate features (X) from target (y)
X = df_clean[feature_columns]
y = df_clean['is_flat']

mo.md(f"""
**Training data:**
- Features (X): {X.shape} - {X.shape[1]} features for {X.shape[0]:,} properties
- Target (y): {y.shape} - Binary (0 or 1)
- Positive class (Flat): {y.sum():,} properties ({y.mean():.1%})
- Negative class (Detached): {(~y.astype(bool)).sum():,} properties ({(~y.astype(bool)).mean():.1%})
""")
```

For this classification task, we include location features (`town_id`, `district_id`, `locality_id`) because geographic location is a legitimate signal for predicting property type.
Urban areas tend to have more flats, while suburban and rural areas have more detached houses.
Unlike the previous is_london task, these location features don't directly leak the answer—they provide useful context about the area's characteristics.

### Split the data {#split-the-data}

Machine learning models need to be tested on data they've never seen before.
We split our data into two sets:

```python
# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.20,      # 20% for testing, 80% for training
    random_state=42,     # Seed for reproducibility
    stratify=y           # Maintain class balance in both sets
)

mo.md(f"""
**Data split:**
- Training: {X_train.shape[0]:,} samples ({X_train.shape[0]/len(X)*100:.0f}%)
- Testing: {X_test.shape[0]:,} samples ({X_test.shape[0]/len(X)*100:.0f}%)
- Class distribution preserved: ✓
""")
```

In the code above we set `test_size=0.20` to hold out 20% of the data for testing.
Our model will learn patterns from the remaining 80% of the data, the training set.

We set `random_state=42`as the reproducibility seed.
With this set, we get the same split every time the code is run.

We set `stratify=y` to maintain class proportions.
If the overall data is 60% flats and 40% detached houses, then both the training and test sets will maintain the same 60/40 split.
We do this to prevent a situation in which the training or test sets are selected in such a way that they are no longer representative of the original data.

### Correct for class imbalance {#correct-for-class-imbalance}

If there is a significant imbalance between flats and detached houses in our dataset (for example, if one type is much more common than the other), we might want to address this imbalance.
An imbalanced dataset can cause the model to be biased toward the majority class.

The simplest and most direct way to handle class imbalance is to use a technique like SMOTE (Synthetic Minority Over-sampling Technique) on the training data to create synthetic examples of the minority class, providing the model with more balanced examples to learn from.

Run the following code in a new cell to use SMOTE:

```python
# Initialize SMOTE
# random_state is set for reproducibility
smote = SMOTE(sampling_strategy='minority', random_state=42)

mo.md(f"""
**Applying SMOTE to the training data...**
- Training set size BEFORE SMOTE: {X_train.shape[0]:,} samples
- Minority class count BEFORE SMOTE: {min(y_train.sum(), len(y_train) - y_train.sum()):,}
- Majority class count BEFORE SMOTE: {max(y_train.sum(), len(y_train) - y_train.sum()):,}
""")

# Apply SMOTE to only the training data
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

mo.md(f"""
- Training set size AFTER SMOTE: {X_train_resampled.shape[0]:,} samples
- Flat class AFTER SMOTE: {y_train_resampled.sum():,}
- Detached class AFTER SMOTE: {(~y_train_resampled.astype(bool)).sum():,}
""")
```

#### What SMOTE does {#what-smote-does}

1. `smote.fit_resample(X_train, y_train)` calculates the feature space relationships in the training data.
2. It identifies the minority class (whichever property type is less common).
3. It then creates new, synthetic property records for the minority class until both classes have equal representation, thus balancing the training set.

By training on balanced data, the Random Forest model will no longer have a bias toward the majority class, which should significantly improve the model's ability to correctly identify both flats and detached houses, leading to better overall performance metrics.

### Training a random forest classifier {#training-a-random-forest-classifier}

For our model, we'll use a **Random Forest** classifier, which is an ensemble of decision trees:
Run the code below to train the model:

```python
# Initialize and train the model
model = RandomForestClassifier(
    n_estimators=100,        # Build 100 decision trees
    max_depth=15,            # Each tree max 15 levels deep
    min_samples_split=20,    # Need ≥20 samples to split a node
    min_samples_leaf=10,     # Each leaf must have ≥10 samples
    random_state=42,         # Reproducibility
    n_jobs=-1,               # Use all CPU cores
)

model.fit(X_train_resampled, y_train_resampled)

# Save model for later use
os.makedirs("models", exist_ok=True)
pickle.dump(model, open("models/property_type_classifier.pkl", "wb"))

mo.md("**Model trained successfully!**")
```

:::tip Time for a coffee break
This step can take some time.
We recommend grabbing a warm beverage and reading something interesting on our [blog](https://clickhouse.com/blog) while you wait. ⏱️☕
:::

## Model evaluation {#model-evaluation}

Now let's test how well our model performs on data it has never seen:

```python
# Make predictions on test set
y_pred = model.predict(X_test)

# Calculate various performance metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

mo.md(f"""
## Model Performance Metrics

- **Accuracy: {accuracy:.2%}** - Overall correctness of predictions
- **Precision: {precision:.2%}** - Of all properties predicted as flats, how many were actually flats
- **Recall: {recall:.2%}** - Of all actual flats, how many did we correctly identify
- **F1-Score: {f1:.2%}** - Harmonic mean of precision and recall
""")
```

The model achieves strong performance with around **87% accuracy**. Let's understand what each metric means:

- **Accuracy** tells us the overall percentage of correct predictions across both classes
- **Precision** measures how reliable our "flat" predictions are (few false positives means high precision)
- **Recall** measures how well we catch all actual flats (few false negatives means high recall)
- **F1-Score** balances precision and recall, giving us a single metric that considers both

### Classification report {#classification-report}

For a more detailed breakdown, we can generate a full classification report:

```python
# Generate classification report
report = classification_report(y_test, y_pred, target_names=['Detached', 'Flat'])
print(report)
```

```text
               precision   recall    f1-score    support

Detached       0.89        0.88      0.89        1333708
Flat           0.85        0.86      0.85        1040810

accuracy                             0.87        2374518
macro avg       0.87       0.87      0.87        2374518
weighted avg    0.87       0.87      0.87        2374518
```

This report shows precision, recall, and F1-score for both classes (flats and detached houses), giving us insights into how well the model performs for each property type.

### Confusion matrix {#confusion-matrix}

A confusion matrix helps us visualize exactly where our model makes mistakes:

```python
def plot_confusion_matrix():
    # Calculate confusion matrix
    cm = confusion_matrix(y_test, y_pred)

    # Create figure
    fig, ax = plt.subplots(figsize=(8, 6))

    # Plot confusion matrix using seaborn
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['Detached', 'Flat'],
                yticklabels=['Detached', 'Flat'],
                ax=ax, cbar_kws={'label': 'Count'})

    # Add labels and title
    ax.set_xlabel('Predicted Label', fontsize=12, fontweight='bold')
    ax.set_ylabel('True Label', fontsize=12, fontweight='bold')
    ax.set_title('Confusion Matrix: Flat vs Detached House Classification',
                 fontsize=14, fontweight='bold', pad=20)

    # Add percentage annotations
    total = cm.sum()
    for i in range(2):
        for j in range(2):
            text = ax.text(j + 0.5, i + 0.7, f'({cm[i,j]/total*100:.1f}%)',
                          ha="center", va="center", color="gray", fontsize=10)

    plt.tight_layout()
    plt.show()

    # Print interpretation
    tn, fp, fn, tp = cm.ravel()
    mo.md(f"""
    ### Confusion Matrix Interpretation:

    - **True Negatives (TN):** {tn:,} - Detached houses correctly identified as detached
    - **False Positives (FP):** {fp:,} - Detached houses incorrectly classified as flats
    - **False Negatives (FN):** {fn:,} - Flats incorrectly classified as detached
    - **True Positives (TP):** {tp:,} - Flats correctly identified as flats

    The diagonal values (TN and TP) represent correct predictions, while off-diagonal values represent errors.
    """)

plot_confusion_matrix()
```

<Image img={confusion_matrix} size="md" alt="Confusion matrix for binary classifier model"/>

The confusion matrix provides valuable insights:
- The **darker cells on the diagonal** show correct predictions
- **Off-diagonal cells** reveal where the model gets confused
- By examining which type of error is more common (false positives vs false negatives), we can understand the model's biases

### Understanding model performance {#understanding-model-performance}

The table below gives context to what different levels of accuracy mean for classification tasks:

| Accuracy Range | Interpretation                                                                         |
|----------------|----------------------------------------------------------------------------------------|
| 50-60%         | Barely better than guessing. The model didn't learn much.                             |
| 60-75%         | There is some signal, but it is weak.                                                 |
| 75-85%         | The model has good performance, and useful patterns were learned.                     |
| 85-95%         | The model shows strong predictive patterns                                            |
| 95%+           | The model is suspiciously performant. This might indicate data leakage or overfitting.|

For our property type classification task, we would expect between **85-95% accuracy** because:
- Detached houses typically have higher prices than flats
- Geographic location correlates strongly with property type (urban areas have more flats)
- Clear separating patterns exist between the two property types

Our model's performance of ~87% accuracy with balanced precision and recall indicates that it has successfully learned to distinguish between flats and detached houses using the features we provided.

## Inference with chDB {#inference-with-chdb}

Now that we have a trained model, let's explore different approaches to make predictions on new data.
This is where chDB really shines—showing multiple patterns for integrating ML with SQL workflows.

### Loading the trained model {#loading-trained-model}

First, let's load our saved model that we trained earlier:

```python
# Load the trained model
with open("models/property_type_classifier.pkl", "rb") as f:
    loaded_model = pickle.load(f)

# Also load the reference tables for encoding new data
town_dict = dict(zip(town_ref['town'], town_ref['town_id']))
district_dict = dict(zip(district_ref['district'], district_ref['district_id']))
locality_dict = dict(zip(locality_ref['locality'], locality_ref['locality_id']))
```

### Single property prediction {#single-property-prediction}

Let's create a helper function that can predict the property type for a single property:

```python
def predict_property_type(price, date, town, district, locality):
    """
    Predict if a property is a flat (1) or detached house (0).

    Args:
        price: Property price in GBP
        date: Transaction date (YYYY-MM-DD)
        town: Town name
        district: District name
        locality: Locality name

    Returns:
        Dictionary with prediction and probability
    """
    # Convert date to pandas datetime
    date = pd.to_datetime(date)

    # Extract time features
    year = date.year
    month = date.month
    quarter = date.quarter
    day_of_week = date.dayofweek + 1  # Monday=1, Sunday=7
    years_since_2010 = year - 2010
    log_price = np.log(price)

    # Encode categorical variables
    town_id = town_dict.get(town, -1)
    district_id = district_dict.get(district, -1)
    locality_id = locality_dict.get(locality, -1)

    # Handle unknown locations
    if town_id == -1 or district_id == -1 or locality_id == -1:
        return {
            'prediction': None,
            'property_type': 'Unknown',
            'confidence': 0.0,
            'error': 'Unknown location - not in training data'
        }

    # Create feature array
    features = np.array([[
        price, log_price, year, month, quarter, day_of_week,
        town_id, district_id, locality_id, years_since_2010
    ]])

    # Make prediction
    prediction = loaded_model.predict(features)[0]
    probability = loaded_model.predict_proba(features)[0]

    return {
        'prediction': int(prediction),
        'property_type': 'Flat' if prediction == 1 else 'Detached House',
        'confidence': float(probability[prediction]),
        'flat_probability': float(probability[1]),
        'detached_probability': float(probability[0])
    }

# Example: Predict for a £250,000 property in London
result = predict_property_type(
    price=250000,
    date='2024-01-15',
    town='LONDON',
    district='CAMDEN',
    locality='CAMDEN'
)

mo.md(f"""
### Prediction Result:
- **Property Type:** {result['property_type']}
- **Confidence:** {result['confidence']:.1%}
- **Flat Probability:** {result['flat_probability']:.1%}
- **Detached Probability:** {result['detached_probability']:.1%}
""")
```

### Batch predictions with chDB {#batch-predictions-chdb}

For multiple properties, we can use chDB to handle feature engineering and then use our model for batch predictions:

```python
# Sample new properties to predict
new_properties = pd.DataFrame({
    'price': [250000, 450000, 180000, 650000, 320000],
    'date': ['2024-01-15', '2024-02-20', '2024-03-10', '2024-04-05', '2024-05-12'],
    'town': ['LONDON', 'MANCHESTER', 'BIRMINGHAM', 'OXFORD', 'LEEDS'],
    'district': ['CAMDEN', 'MANCHESTER', 'BIRMINGHAM', 'OXFORD', 'LEEDS'],
    'locality': ['CAMDEN', 'MANCHESTER', 'BIRMINGHAM', 'OXFORD', 'LEEDS']
})

# Use chDB for feature engineering
feature_query = """
SELECT
    price,
    log(price) AS log_price,
    toYear(date::Date) AS year,
    toMonth(date::Date) AS month,
    toQuarter(date::Date) AS quarter,
    toDayOfWeek(date::Date) AS day_of_week,
    toYear(date::Date) - 2010 AS years_since_2010,
    town,
    district,
    locality
FROM Python(new_properties)
"""

features_df = chdb.query(feature_query, "DataFrame")

# Encode categorical variables
features_df['town_id'] = features_df['town'].map(town_dict)
features_df['district_id'] = features_df['district'].map(district_dict)
features_df['locality_id'] = features_df['locality'].map(locality_dict)

# Prepare features for prediction
X_new = features_df[[
    'price', 'log_price', 'year', 'month', 'quarter',
    'day_of_week', 'town_id', 'district_id', 'locality_id',
    'years_since_2010'
]]

# Make predictions
predictions = loaded_model.predict(X_new)
probabilities = loaded_model.predict_proba(X_new)

# Add predictions back to original data
new_properties['predicted_type'] = ['Flat' if p == 1 else 'Detached' for p in predictions]
new_properties['flat_probability'] = probabilities[:, 1]
new_properties['detached_probability'] = probabilities[:, 0]
new_properties['confidence'] = [probabilities[i, predictions[i]] for i in range(len(predictions))]

mo.ui.table(new_properties, label="Batch Predictions")
```

## Inference with ClickHouse User-Defined-functions (UDFs) {#inference-with-clickhouse-udfs}

ClickHouse supports User Defined Functions (UDFs) that allow you to invoke machine learning models directly at insert or query time.

### Implementation steps {#implementation-steps}

<VerticalStepper headerLevel="h4">

#### Create a Python UDF Script {#create-python-udf}

Create a Python script that reads data from stdin, loads your model, and outputs predictions to stdout.
Save this in ClickHouse's `user_scripts` directory (typically `/var/lib/clickhouse/user_scripts/`):

:::tip
Make sure that the file is executable
:::

```python title="/var/lib/clickhouse/user_scripts/predict_property_type.py"
#!/usr/bin/env python3
import sys
import pickle
import os
import numpy as np

# Use absolute path to model - place your model file here
MODEL_PATH = "/var/lib/clickhouse/user_scripts/property_type_classifier.pkl"

# Load the model once (for executable_pool type)
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
except Exception as e:
    # Log error to stderr (will appear in ClickHouse logs)
    sys.stderr.write(f"Error loading model from {MODEL_PATH}: {e}\n")
    sys.stderr.flush()
    sys.exit(1)

def main():
    try:
        # Read chunk length for batching
        for number in sys.stdin:
            length = int(number.strip())

            # Collect rows in batch
            features_batch = []
            for _ in range(length):
                line = sys.stdin.readline().strip()
                if not line:
                    continue

                # Parse TabSeparated input: 10 features expected
                values = line.split('\t')

                if len(values) != 10:
                    sys.stderr.write(f"Expected 10 features, got {len(values)}: {values}\n")
                    sys.stderr.flush()
                    continue

                # Convert to appropriate types
                features = [
                    float(values[0]),  # price
                    float(values[1]),  # log_price
                    int(values[2]),    # year
                    int(values[3]),    # month
                    int(values[4]),    # quarter
                    int(values[5]),    # day_of_week
                    int(values[6]),    # town_id
                    int(values[7]),    # district_id
                    int(values[8]),    # locality_id
                    int(values[9])     # years_since_2010
                ]
                features_batch.append(features)

            if not features_batch:
                continue

            # Batch prediction
            predictions = model.predict(np.array(features_batch))

            # Output predictions (one per line)
            for pred in predictions:
                print(int(pred))

            sys.stdout.flush()

    except Exception as e:
        sys.stderr.write(f"Error during prediction: {e}\n")
        sys.stderr.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
```

**Setup Steps:**

1. **Install required Python dependencies** for the ClickHouse user:

   :::important
   This is the most common cause of `CHILD_WAS_NOT_EXITED_NORMALLY` and `ModuleNotFoundError` errors!
   :::

   ```bash
   # Install for the clickhouse user
   sudo -u clickhouse python3 -m pip install numpy scikit-learn

   # Or install system-wide if the above doesn't work
   sudo python3 -m pip install numpy scikit-learn
   ```

   Verify the installation:
   ```bash
   sudo -u clickhouse python3 -c "import sklearn; import numpy; print('Dependencies OK')"
   ```

2. **Copy the model file** to the ClickHouse user_scripts directory:

   ```bash
   sudo cp models/property_type_classifier.pkl /var/lib/clickhouse/user_scripts/
   ```

3. **Make the script executable**:

   ```bash
   sudo chmod +x /var/lib/clickhouse/user_scripts/predict_property_type.py
   ```

4. **Set proper ownership**:

   ```bash
   sudo chown clickhouse:clickhouse /var/lib/clickhouse/user_scripts/predict_property_type.py
   sudo chown clickhouse:clickhouse /var/lib/clickhouse/user_scripts/property_type_classifier.pkl
   ```

5. **Test the script manually** to verify it works:

```bash
echo -e "1\n250000\t12.429\t2023\t5\t2\t3\t100\t50\t25\t13" | \
/var/lib/clickhouse/user_scripts/predict_property_type.py
```
   
This should output `0` or `1` (the prediction).

<br/>

<details>
<summary>Common issues</summary>

If you get `CHILD_WAS_NOT_EXITED_NORMALLY` error:

- **Missing dependencies**: Make sure numpy and scikit-learn are installed for the user running ClickHouse:

```bash
sudo -u clickhouse python3 -m pip install numpy scikit-learn
```

- **Model not found**: Verify the model file exists and that the path is correct:

```bash
ls -la /var/lib/clickhouse/user_scripts/property_type_classifier.pkl
```

- **Permission issues**: Check the script is executable and owned by clickhouse user

- **Check ClickHouse logs** for stderr output from the script:

```bash
sudo tail -f /var/log/clickhouse-server/clickhouse-server.err.log
```

</details>

#### Configure the UDF {#configure-the-udf}

Create an XML configuration file in `/etc/clickhouse-server/` (ending with `_function.xml`)

```xml title="predict_property_type_function.xml"
<functions>
    <function>
        <type>executable_pool</type>
        <name>predict_is_flat</name>
        <return_type>UInt8</return_type>
        <argument><type>Float64</type></argument>  <!-- price -->
        <argument><type>Float64</type></argument>  <!-- log_price -->
        <argument><type>Int32</type></argument>     <!-- year -->
        <argument><type>Int32</type></argument>     <!-- month -->
        <argument><type>Int32</type></argument>     <!-- quarter -->
        <argument><type>Int32</type></argument>     <!-- day_of_week -->
        <argument><type>Int32</type></argument>     <!-- town_id -->
        <argument><type>Int32</type></argument>     <!-- district_id -->
        <argument><type>Int32</type></argument>     <!-- locality_id -->
        <argument><type>Int32</type></argument>     <!-- years_since_2010 -->
        <format>TabSeparated</format>
        <command>predict_property_type.py</command>
        <send_chunk_header>1</send_chunk_header>
        <command_termination_timeout>10</command_termination_timeout>
        <command_read_timeout>10000</command_read_timeout>
        <max_command_execution_time>10</max_command_execution_time>
    </function>
</functions>
```

**After creating the XML file:**

1. **Restart ClickHouse** to load the new function:

```bash
sudo systemctl restart clickhouse-server
```

2. **Verify the function is registered**:

```sql
SELECT name, origin FROM system.functions WHERE name = 'predict_is_flat';
```

You should see:

```response
┌─name────────────┬─origin────────────────┐
│ predict_is_flat │ ExecutableUserDefined │
└─────────────────┴───────────────────────┘
```

#### Use the UDF in SQL Queries {#use-udfs-in-SQL-queries}

With the setup complete, we'll take one of the existing rows and see how our newly defined `predict_is_flat`
UDF performs.

We'll take the following row from our existing dataset

```response
┌─price─┬─type─┬───────date─┬─town─────┬─district───┬─locality─┐
│ 39950 │ flat │ 1996-08-13 │ NEW QUAY │ CEREDIGION │ NEW QUAY │
└───────┴──────┴────────────┴──────────┴────────────┴──────────┘
```

Where our encoding for `NEW QUAY` (town) is 710, `CEREDIGION` is 74 and `NEW QUAY` (locality) is 13899.

```sql
-- Single property prediction
WITH price = 39950,
     year = '1996-08-13'::Date
SELECT
predict_is_flat(
    price,
    log(price),
    toYear(year),
    toMonth(year),
    toQuarter(year),
    toDayOfWeek(year),
    710,
    74,
    13899,
    toYear(year) - 2010
) AS predicted_is_flat
```

The function returns the prediction:

```sql
┌─predicted_is_flat─┐
│                 1 │
└───────────────────┘
```

</VerticalStepper>

## Inference with ClickHouse User-Defined-functions (UDFs) in Cloud (coming soon) {#cloud-udfs}

:::tip
UDFs in Cloud are currently in private-preview.
This guide will be updated soon, when executable UDFs in Cloud become general access.
:::
