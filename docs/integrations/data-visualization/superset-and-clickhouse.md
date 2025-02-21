---
sidebar_label: Superset
sidebar_position: 198
slug: /integrations/superset
keywords: [clickhouse, superset, connect, integrate, ui]
description: Apache Superset is an open-source data exploration and visualization platform.
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';

# Connect Superset to ClickHouse

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> is an open-source data exploration and visualization platform written in Python. Superset connects to ClickHouse using a Python driver provided by ClickHouse. Let's see how it works...

## Goal

In this guide you will build a dashboard in Superset with data from a ClickHouse database. The dashboard will look like this:

![New Dashboard](./images/superset_12.png)

:::tip Add some data
If you do not have a dataset to work with you can add one of the examples. This guide uses the [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) dataset, so you might choose that one. There are several others to look at in the same documentation category.
:::

## 1. Gather your connection details
<ConnectionDetails />

## 2. Install the Driver

1. Superset uses the `clickhouse-connect` driver to connect to ClickHouse. The details of `clickhouse-connect` are at <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a> and it can be installed with the following command:

    ```console
    pip install clickhouse-connect
    ```

2. Start (or restart) Superset.

## 3. Connect Superset to ClickHouse

1. Within Superset, select **Data** from the top menu and then **Databases** from the drop-down menu. Add a new database by clicking the **+ Database** button:

![Add a new database](./images/superset_01.png)

2. In the first step, select **ClickHouse Connect** as the type of database:

![Select Clickhouse](./images/superset_02.png)

3. In the second step:
  - Set SSL on or off.
  - Enter the connection information that you collected earlier
  - Specify the **DISPLAY NAME**: this can be any name you prefer. If you will be connecting to multiple ClickHouse databases then make the name more descriptive.

![Test the connection](./images/superset_03.png)

4. Click the **CONNECT** and then **FINISH** buttons to complete the setup wizard, and you should see your database in the list of databases.

## 4. Add a Dataset

1. To interact with your ClickHouse data with Superset, you need to define a **_dataset_**. From the top menu in Superset, select **Data**, then **Datasets** from the drop-down menu.

2. Click the button for adding a dataset. Select your new database as the datasource and you should see the tables defined in your database:

![New dataset](./images/superset_04.png)


3. Click the **ADD** button at the bottom of the dialog window and your table appears in the list of datasets. You are ready to build a dashboard and analyze your ClickHouse data!


## 5.  Creating charts and a dashboard in Superset

If you are familiar with Superset, then you will feel right at home with this next section. If you are new to Superset, well...it's like a lot of the other cool visualization tools out there in the world - it doesn't take long to get started, but the details and nuances get learned over time as you use the tool.

1. You start with a dashboard. From the top menu in Superset, select **Dashboards**. Click the button in the upper-right to add a new dashboard. The following dashboard is named **UK property prices**:

![New dashboard](./images/superset_05.png)

2. To create a new chart, select **Charts** from the top menu and click the button to add a new chart. You will be shown a lot of options. The following example shows a **Pie Chart** chart using the **uk_price_paid** dataset from the **CHOOSE A DATASET** drop-down:

![New chart](./images/superset_06.png)

3. Superset pie charts need a **Dimension** and a **Metric**, the rest of the settings are optional. You can pick your own fields for the dimension and metric, this example uses the ClickHouse field `district` as the dimension and `AVG(price)` as the metric.

![The SUM metric](./images/superset_08.png)
![The SUM metric](./images/superset_09.png)

5. If you prefer doughnut charts over pie, then you can set that and other options  under **CUSTOMIZE**:

![Add Chart to Dashboard](./images/superset_10.png)

6. Click the **SAVE** button to save the chart, then select **UK property prices** under the **ADD TO DASHBOARD** drop-down, then **SAVE & GO TO DASHBOARD** saves the chart and adds it to the dashboard:

![Add Chart to Dashboard](./images/superset_11.png)

7. That's it. Building dashboards in Superset based on data in ClickHouse opens up a whole world of blazing fast data analytics!

![New Dashboard](./images/superset_12.png)

## Related Content

- Blog: [Visualizing Data with ClickHouse - Part 2 - Superset](https://clickhouse.com/blog/visualizing-data-with-superset)
