---
slug: /use-cases/AI/scikit-learn
sidebar_label: 'Scikit learn'
title: 'Predicting London properties with chDB and scikit-learn'
description: 'This guide explains how to integrate chDB, ClickHouse Cloud and Scikit-learn'
keywords: ['ML', 'Scikit-learn', 'chDB']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import image_1 from '@site/static/images/use-cases/AI_ML/jupyter/1.png';
import image_2 from '@site/static/images/use-cases/AI_ML/jupyter/2.png';
import image_3 from '@site/static/images/use-cases/AI_ML/jupyter/3.png';
import image_4 from '@site/static/images/use-cases/AI_ML/Marimo/4.png';
import statistics from '@site/static/images/use-cases/AI_ML/Scikit/statistics.png';
import visualisation_london_v_rouk from '@site/static/images/use-cases/AI_ML/Scikit/visualisation_london_v_rouk.png';
import property_type_stats from '@site/static/images/use-cases/AI_ML/Scikit/property_type_stats.png';

# Predicting London properties with chDB and scikit-learn

Machine learning prototyping often involves juggling datasets, preprocessing steps, and performance constraints, which can make the process both complex and time-consuming.
**scikit-learn** is one of Python's most popular and powerful libraries for machine learning, offering a large set of utilities for building and evaluating models.
In this guide, we will explore how **chDB** complements scikit-learn in the model development life cycle, by building a binary classifier that predicts whether a property is located in London or elsewhere in the UK, based on features like price, property type, and date.

**Prerequisites:**

Before starting, ensure you have:
- Python 3.8 or higher installed
- A virtual environment activated (recommended)
- Basic understanding of SQL and machine learning concepts
- A ClickHouse Cloud service or trial account

## What we'll be building {#what-we-will-build}

The UK property market has a unique characteristic: **London is an outlier**.
Properties in London generally cost significantly more (often 2-3x) than that of properties in the rest of the UK (ROUK).
Properties in London also have a different distribution of property types, for example there are more flats and fewer detached houses.
The London property market also follows slightly different market trends over time.
Our goal in this guide is to build a binary classifier that can predict `is_london = 1` (London) or `is_london = 0` (not London) from property transaction features.

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
pip install marimo chdb scikit-learn pandas matplotlib numpy imbalanced-learn
```

We will be using Marimo as a notebook to explore our data and develop our ML model.
Run the following command to start a new notebook:

```sql
marimo edit london_property_classifier.py
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
from sklearn.metrics import accuracy_score
from imblearn.over_sampling import SMOTE
import matplotlib.pyplot as plt
```

In this guide we'll be making use of the following libraries:
- `chdb`: an embedded ClickHouse SQL engine for data processing
- `pandas` and `numpy`: a familiar data-science tool for data manipulation and numerical operations
- `scikit-learn`: a Machine learning tools (model, evaluation metrics) library
- `matplotlib`: a popular library for visualization
- `marimo`: reactive notebook components

### Import data from Cloud {#import-data}

With our environment variables set, our data imported into our Cloud service, and our notebook up and running, we'll next load the data into our notebook for processing.

ClickHouse's [`remoteSecure`](/sql-reference/table-functions/remote) function allows you to easily retrieve the data from ClickHouse Cloud.
You can instruct chDB to return this data in process as a Pandas data frame - which is a convenient and familiar way of working with data.  

Run the following query in a new cell to fetch the UK price paid data from your ClickHouse Cloud service and turn it into a `pandas.DataFrame`:

```python
# Query UK property data
query = """
SELECT
    date,
    price,
    type::String AS type,
    town,
    district,
    locality,
    CASE WHEN locality = 'LONDON' THEN 1 ELSE 0 END AS is_london
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
FORMAT Arrow
""".format(
    host=os.getenv('CLICKHOUSE_CLOUD_HOSTNAME'),
    user=os.getenv('CLICKHOUSE_CLOUD_USER'),
    password=os.getenv('CLICKHOUSE_CLOUD_PASSWORD')
)

# Load as Arrow table for efficiency
arrow_data = chdb.query(query, "ArrowTable")
df_raw = arrow_data.to_pandas()

mo.md(f"Loaded {len(df_raw):,} property records from ClickHouse Cloud")
```

:::tip
Make sure your Cloud service is not in an idle state when you run the cell above.

You can run `df_raw.head()` in a new cell to take a look at the first few rows of the data.
:::

In the code snippet above we defined our SQL query as a templated string, passing in `host`, `user` and `password` as variables which hold our environment variables.
We used the **`remoteSecure()`** table engine to connect to ClickHouse Cloud over a secure connection (TLS encryption) and selected the columns we are interested in, using  the **`WHERE`** clause to filter data server side *before* transfer, removing invalid prices and null towns on the ClickHouse server rather than transferring everything and filtering locally, which would be slower.
We also returned a new column `is_london` by specifying `CASE WHEN locality = 'LONDON' THEN 1 ELSE 0 END AS is_london`.

**`FORMAT Arrow`** tells chDB to return data in the Apache Arrow format.
We chose Apache Arrow as it is a columnar data format that provides 3-10x faster data transfer compared to CSV.
ClickHouse offers the ability to work with over a hundred different file [formats](/interfaces/formats#formats-overview) including familiar ones like CSV, TSV and JSON.

The **`chdb.query(query, "ArrowTable")`** call tells chdb to execute the query we defined in String `query` and to return a PyArrow Table object as the result.
We then use the **`to_pandas()`** function, to convert the data to a Pandas data frame which is a convenient and familiar way of working with the data.
You'll see later in this guide how you can seamlessly transition between processing data using Pandas and using chdb depending on the task at hand.

## Data exploration {#data-exploration}

Before building our model, let's use chDB to understand how London differs from the rest of the UK.

### Compare price distributions {#compare-price-distributions}

Run the code below in a new cell to generate price distribution statistics for London properties vs properties in the rest of the UK.

```python
# Compare price statistics between London and the rest of the UK
query_stats = """
SELECT
    is_london,
    COUNT(*) AS count,
    AVG(price) AS avg_price,
    quantile(0.5)(price) AS median_price,
    quantile(0.25)(price) AS q25_price,
    quantile(0.75)(price) AS q75_price,
    MIN(price) AS min_price,
    MAX(price) AS max_price
FROM Python('df_raw')
GROUP BY is_london
ORDER BY is_london DESC
"""

price_comparison = chdb.query(query_stats, "DataFrame")
mo.ui.table(price_comparison, label="Price distribution: London vs rest of UK")
```

<Image size="lg" img={statistics} alt="Property price statistics"/>

In the `query_stats` string above we made use of the `Python` table engine.
This table engine allows us to read the data into chdb from the `df_raw` DataFrame which was defined in the previous cell.
We then used ClickHouse's built-in SQL capabilities and just a few of the many aggregate functions to aggregate and transform the data, calculating statistics like the average using `AVG` and the 25th percentile, median and 75th percentile using the `quantiles` function, as well as the min and max values using the `MIN` and `MAX` functions.
We used **`GROUP BY is_london`** to split the data into two groups for comparison

We're looking at these particular statistics because if the median price of a London property is significantly greater than the median price of property in the rest of the UK, then it's likely that we'll be able to train our model easily.
The 25th and 75th quartiles show us the "typical range" of the price distribution—if these don't overlap much between regions, then price alone is a strong signal.
**Min/Max** show us outliers in our data.

### Visualizing the price difference between London and ROUK {#visualizing-london-v-rouk}

Run the following code in a new cell to visualise the distribution:

```python
# 1. Calculate the 99th percentile threshold for the entire dataset
# we do this for visualization purposes due to extremely large outliers
price_99th_percentile = df_raw['price'].quantile(0.99)

# 2. Filter the DataFrame to include only prices up to the 99th percentile
df_filtered = df_raw[df_raw['price'] <= price_99th_percentile]

# Create side-by-side histograms using the filtered data
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# London properties (Filtered)
london_prices = df_filtered[df_filtered['is_london'] == 1]['price']
axes[0].hist(london_prices, bins=50, alpha=0.7, color='#e74c3c', edgecolor='white')
axes[0].axvline(london_prices.median(), color='darkred', linestyle='--', linewidth=2,
                label=f'Median: £{london_prices.median():,.0f}')
axes[0].set_xlabel('Price (£)')
axes[0].set_ylabel('Count')
axes[0].set_title('London Properties (Outliers Excluded)')
axes[0].legend()
axes[0].grid(True, alpha=0.3)
axes[0].ticklabel_format(style='plain', axis='x')

# Non-London properties (Filtered)
other_prices = df_filtered[df_filtered['is_london'] == 0]['price']
axes[1].hist(other_prices, bins=50, alpha=0.7, color='#3498db', edgecolor='white')
axes[1].axvline(other_prices.median(), color='darkblue', linestyle='--', linewidth=2,
                label=f'Median: £{other_prices.median():,.0f}')
axes[1].set_xlabel('Price (£)')
axes[1].set_ylabel('Count')
axes[1].set_title('Rest of UK Properties (Outliers Excluded)')
axes[1].legend()
axes[1].grid(True, alpha=0.3)
axes[1].ticklabel_format(style='plain', axis='x')

plt.suptitle(f"Price Distribution up to 99th Percentile (Max Price: £{price_99th_percentile:,.0f})")
plt.tight_layout(rect=[0, 0.03, 1, 0.95])

plt.show()
```

<Image size="lg" img={visualisation_london_v_rouk} alt="Visualising the distributions between London and Rest Of UK"/>

The distributions reveal three key differences that indicate we could build an effective classifier here
- significant shift in central tendency between the two markets.
- little overlap at their modes or peak frequencies.
- London exhibits a much more substantial high-price tail in its distribution.

<details>
First, there is a significant shift in central tendency between the two markets.
London's median property price of £254,000 is approximately 1.75 times higher than the rest of the UK's median of £144,995.
This difference in the typical property price provides a simple yet powerful signal that classifiers can leverage.

Second, the distributions show remarkably little overlap at their modes or peak frequencies.
The rest of the UK's distribution is heavily concentrated at the lower end of the price spectrum, with its peak occurring well below £150,000.
In contrast, London's distribution peaks much higher, in the £200,000 to £300,000 range.
This separation means that a property priced at £300,000, for example, falls beyond the peak frequency of the rest of the UK market, allowing a classifier to confidently predict it as a London property.

Lastly, London exhibits a much more substantial high-price tail in its distribution.
While both markets have properties extending to higher prices, London's distribution maintains a noticeably thicker tail that extends well beyond £600,000 and up to the £1,150,000 limit shown in the data.
Properties in these higher price brackets are overwhelmingly likely to be located in London, providing another clear distinguishing feature for classification purposes.
</details>

### Property type distribution {#property-type-distribution}

We'll again use chdb to explore how properties differ by property type.

In the query below we again make use of the `Python` table engine to read our DataFrame, transform the data using ClickHouse, and return the result back as a DataFrame. 

```python
# Compare property types between regions
query_property_types = """
SELECT 
    CASE WHEN is_london = 1 THEN 'London' ELSE 'Rest of UK' END as region,
    type,
    COUNT(*) as count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY is_london) as pct_within_region
FROM Python(df_raw)
GROUP BY is_london, type
ORDER BY is_london DESC, type
"""

type_comparison = chdb.query(query_property_types, "DataFrame")
mo.ui.table(type_comparison, label="Property types by region")
```

The query uses a window function with `PARTITION BY is_london` to calculate percentages within each region separately, rather than across the entire dataset.
This approach reveals the composition of property types within each market - for instance, showing what percentage of all London properties are flats versus what percentage of Rest of UK properties are flats.

By structuring the analysis this way, we can make meaningful comparisons between the regions and determine whether certain property types, such as flats, are more prevalent in London compared to elsewhere in the UK.
This is important because we see that London has a much higher percentage of flats comapred to the rest of the UK.
Property type therefore also becomes another useful signal for our classifier.

<Image size="lg" img={property_type_stats} alt="Property type stats"/>

## Feature engineering with chDB {#feature-engineering}

Now we'll create features for our machine learning model.
Feature engineering is where we transform raw data into inputs the model can learn from effectively.

### Creating time-based features {#creating-time-based-features}

```python
# Create features for classification
features_query = """
SELECT
    is_london,
    price,
    type,
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
Starting with the original columns like `is_london`, `price`, `type`, and location fields, the query adds several time-based and derived features to help the classification model identify patterns.

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

Machine learning models need numerical inputs, but we have text values like town names ("LONDON", "BIRMINGHAM", "MANCHESTER") and property types ("semi-detached", "flat", "terraced" etc).
We'll need to convert these to numbers first.
While we could use a function like `LabelEncoder` from Scikit learn, we'll use an approach called **label encoding** implemented through **reference tables** (also called dimension tables in data warehousing).

<VerticalStepper headerLevel="h4">

#### Create reference tables

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

#### Create reference tables for all categorical features

We can now use the `create_reference_table` function to generate reference tables for the features of interest

```python
# Create reference tables for categorical columns
type_ref = create_reference_table(df_features, 'type')
town_ref = create_reference_table(df_features, 'town')
district_ref = create_reference_table(df_features, 'district')
locality_ref = create_reference_table(df_features, 'locality')

# Display the mappings
mo.hstack([
    mo.ui.table(type_ref, label="Property Type Encoding"),
    mo.ui.table(town_ref, label="Property Town Encoding"),
    mo.ui.table(district_ref, label="Property District Encoding"),
    mo.ui.table(locality_ref, label="Property Locality Encoding")
])
```

This produces a unique numerical mapping for each of the categorical variables.

#### Apply the mappings

Now we replace text values with numeric IDs using these reference tables with the
`zip` function to pair up columns and the `dict` function to convert pairs to a dictionary:

```python
# Create dictionaries for fast lookups
type_dict = dict(zip(type_ref['type'], type_ref['type_id']))
town_dict = dict(zip(town_ref['town'], town_ref['town_id']))
district_dict = dict(zip(district_ref['district'], district_ref['district_id']))
locality_dict = dict(zip(locality_ref['locality'], locality_ref['locality_id']))
```

We can then apply the mappings:

```python
# Replace text with numeric IDs
df_features['type_id'] = df_features['type'].map(type_dict)
df_features['town_id'] = df_features['town'].map(town_dict)
df_features['district_id'] = df_features['district'].map(district_dict)
df_features['locality_id'] = df_features['locality'].map(locality_dict)
```

The table below shows an example of how our features looked before applying the encoding:


| record_id  | type          | town           | district         | locality    | price  |
|------------|---------------|----------------|------------------|-------------|--------|
| 1          | TERRACED      | ABBOTS LANGLEY | ABERCONWY        |             | 450000 |
| 2          | FLAT          | ABERAERON      | ADUR             | AB KETTLEBY | 180000 |
| 3          | DETACHED      | ABERDARE       | ALLERDALE        | ABBERD      | 520000 |
| 4          | SEMI-DETACHED | ABERDOVEY      | ALNWICK          | ABBERLEY    | 320000 |
| 5          | OTHER         | ABERGAVENNY    | ALYN AND DEESIDE | ABBERTON    | 275000 |


After encoding, they look like this:

| record_id  | type          | type_id  | town           | town_id  | district         | district_id  | locality    | locality_id  | price  |
|------------|---------------|----------|----------------|----------|------------------|--------------|-------------|--------------|--------|
| 1          | TERRACED      | 4        | ABBOTS LANGLEY | 0        | ABERCONWY        | 0            |             | 0            | 450000 |
| 2          | FLAT          | 1        | ABERAERON      | 1        | ADUR             | 1            | AB KETTLEBY | 1            | 180000 |
| 3          | DETACHED      | 0        | ABERDARE       | 2        | ALLERDALE        | 2            | ABBERD      | 2            | 520000 |
| 4          | SEMI-DETACHED | 3        | ABERDOVEY      | 3        | ALNWICK          | 3            | ABBERLEY    | 3            | 320000 |
| 5          | OTHER         | 2        | ABERGAVENNY    | 4        | ALYN AND DEESIDE | 4            | ABBERTON    | 4            | 275000 |

#### Clean the data

Most ML models can't handle `NaN` (missing) values so we either need to fill them or remove them.
For this demonstration, we will remove them using the `dropna` function:

```python
# Remove any rows with missing values
df_clean = df_features.dropna()

mo.ui.table(df_clean.head(10))
```

</VerticalStepper>

## Model training

Now that we have numerical features, it's time to build our classifier.

### Select feature columns

```python
# Select feature columns for the model
feature_columns = [
    'price',
    'log_price',
    'year',
    'month',
    'quarter',
    'day_of_week',
    'type_id',
    'years_since_2010'
]

# Note: We intentionally exclude town_id, dsitrict_id and locality_id because it would leak the answer!
# town_id=4 means LONDON, so the model would just memorize that.

# Separate features (X) from target (y)
X = df_clean[feature_columns]
y = df_clean['is_london']

mo.md(f"""
**Training data:**
- Features (X): {X.shape} - {X.shape[1]} features for {X.shape[0]:,} properties
- Target (y): {y.shape} - Binary (0 or 1)
- Positive class (London): {y.sum():,} properties ({y.mean():.1%})
- Negative class (Not London): {(~y.astype(bool)).sum():,} properties ({(~y.astype(bool)).mean():.1%})
""")
```

If we included `town_id` as a feature, the model would simply learn:

```
if town_id == 4: predict London
else: predict Not London
```

This is called **data leakage** — using information that directly contains the answer.
Our goal is to predict London from *indirect signals* like price and property type, not from the town name itself!
We therefore don't include `district_id` and `county_id` for the same reasons.

### Split the data

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
If the overall data is 30% London, 70% other then the training set will also be 30% London, 70% other
and the test set will also be 30% London, 70% other.
We do this to prevent a situation in which the training or test sets are selected in such a way that they are no longer representative of the original data.

### Correct for dominant majority class

If you were to proceed to training a model with the data in the current form you would find that we end up with a model
which has a high accuracy but is severely imbalanced and biased due to the dominant majority class.
We essentially end up with a model that is really good at telling us when a property is NOT a London property but not so good
at telling us when it is one.

The simplest and most direct way to handle this severe imbalance is to use a technique like SMOTE (Synthetic Minority Over-sampling Technique) on the training data to create synthetic London records, providing the model with more examples to learn from.

Run the following code in a new cell to use SMOTE:

```python
# Initialize SMOTE
# random_state is set for reproducibility
smote = SMOTE(sampling_strategy='minority', random_state=42)

mo.md(f"""
**Applying SMOTE to the training data...**
- Training set size BEFORE SMOTE: {X_train.shape[0]:,} samples
- London class BEFORE SMOTE: {y_train.sum():,}
""")

# Apply SMOTE to only the training data
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

mo.md(f"""
- Training set size AFTER SMOTE: {X_train_resampled.shape[0]:,} samples
- London class AFTER SMOTE: {y_train_resampled.sum():,} 
- Not London class AFTER SMOTE: {(~y_train_resampled.astype(bool)).sum():,}
""")
```

#### What SMOTE does

1. `smote.fit_resample(X_train, y_train)` calculates the feature space relationships in the training data.
2. It identifies the minority class (London properties).
3. It then creates new, synthetic London property records until the count of London properties equals the count of non-London properties, thus balancing the training set.

By training on balanced data, the Random Forest model will no longer have a bias toward the majority "Not London" class, which should significantly increase the precision of our model while maintaining high Recall, leading to a much better F1-score, which we will calculate later.

### Training a random forest classifier

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
pickle.dump(model, open("models/london_classifier.pkl", "wb"))

mo.md("**Model trained successfully!**")
```

:::tip Time for a coffee break
This step can take some time.
We recommend grabbing a warm beverage and reading something interesting on our [blog](https://clickhouse.com/blog) while you wait. ⏱️☕
:::

## Model evaluation

Now let's test how well our model performs on data it has never seen:

```python
# Make predictions on test set
y_pred = model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)

mo.md(f"""
## Model Performance

**Accuracy: {accuracy:.2%}**
""")
```

> Model Performance
> Accuracy: 89.07%

The table below gives context to what this level of accuracy means:


| Accuracy | Interpretation                                                                         |
| -------- |----------------------------------------------------------------------------------------|
| 50-60%   | Barely better than guessing. The model didn't learn much.                              |
| 60-75%   | There is some signal, but it is weak.                                                  |
| 75-85%   | The model has good performance, and useful patterns were learned.                      |
| 85-95%   | The model shows strong predictive patterns                                             |
| 95%+     | The model is suspiciously performant. This might indicate data leakage or overfitting. |

For our London prediction task, we would expect between **85-95% accuracy** because:
- London prices are distinctly higher
- Property type distributions differ
- Clear separating patterns exist

## Inference with chDB

Now that we have a trained model, let's explore three different approaches to make predictions on new data.
This is where chDB really shines—showing multiple patterns for integrating ML with SQL workflows.