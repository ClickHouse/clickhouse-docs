---
title: 'Connecting Chartbrew to ClickHouse'
sidebar_label: 'Chartbrew'
sidebar_position: 131
slug: /integrations/chartbrew-and-clickhouse
keywords: ['ClickHouse', 'Chartbrew', 'connect', 'integrate', 'visualization']
description: 'Connect Chartbrew to ClickHouse to create real-time dashboards and client reports.'
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import chartbrew_01 from '@site/static/images/integrations/data-visualization/chartbrew_01.png';
import chartbrew_02 from '@site/static/images/integrations/data-visualization/chartbrew_02.png';
import chartbrew_03 from '@site/static/images/integrations/data-visualization/chartbrew_03.png';
import chartbrew_04 from '@site/static/images/integrations/data-visualization/chartbrew_04.png';
import chartbrew_05 from '@site/static/images/integrations/data-visualization/chartbrew_05.png';
import chartbrew_06 from '@site/static/images/integrations/data-visualization/chartbrew_06.png';
import chartbrew_07 from '@site/static/images/integrations/data-visualization/chartbrew_07.png';
import chartbrew_08 from '@site/static/images/integrations/data-visualization/chartbrew_08.png';
import chartbrew_09 from '@site/static/images/integrations/data-visualization/chartbrew_09.png';

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import Image from '@theme/IdealImage';

# Connecting Chartbrew to ClickHouse

<CommunityMaintainedBadge/>

[Chartbrew](https://chartbrew.com) is a data visualization platform that allows users to create dashboards and monitor data in real time. It supports multiple data sources, including ClickHouse, and provides a no-code interface for building charts and reports.

## Goal {#goal}

In this guide, you will connect Chartbrew to ClickHouse, run a SQL query, and create a visualization. By the end, your dashboard may look something like this:

<Image img={chartbrew_01} size="lg" alt="Chartbrew dashboard" />

:::tip Add some data
If you do not have a dataset to work with, you can add one of the examples. This guide uses the [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) dataset.
:::

## 1. Gather your connection details {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Connect Chartbrew to ClickHouse {#2-connect-chartbrew-to-clickhouse}

1. Log in to [Chartbrew](https://chartbrew.com/login) and go to the **Connections** tab.
2. Click **Create connection** and select **ClickHouse** from the available database options.

   <Image img={chartbrew_02} size="lg" alt="Select ClickHouse connection in Chartbrew" />

3. Enter the connection details for your ClickHouse database:

   - **Display Name**: A name to identify the connection in Chartbrew.
   - **Host**: The hostname or IP address of your ClickHouse server.
   - **Port**: Typically `8443` for HTTPS connections.
   - **Database Name**: The database you want to connect to.
   - **Username**: Your ClickHouse username.
   - **Password**: Your ClickHouse password.

   <Image img={chartbrew_03} size="lg" alt="ClickHouse connection settings in Chartbrew" />

4. Click **Test connection** to verify that Chartbrew can connect to ClickHouse.
5. If the test is successful, click **Save connection**. Chartbrew will automatically retrieve the schema from ClickHouse.

   <Image img={chartbrew_04} size="lg" alt="ClickHouse JSON schema in Chartbrew" />

## 3. Create a dataset and run a SQL query {#3-create-a-dataset-and-run-a-sql-query}

  1. Click on the **Create dataset** button or navigate to the **Datasets** tab to create one.
  2. Select the ClickHouse connection you created earlier.

  <Image img={chartbrew_05} size="lg" alt="Select ClickHouse connection for dataset" />

  Write a SQL query to retrieve the data you want to visualize. For example, this query calculates the average price paid per year from the `uk_price_paid` dataset:

  ```sql
  SELECT toYear(date) AS year, avg(price) AS avg_price
  FROM uk_price_paid
  GROUP BY year
  ORDER BY year;
  ```

  <Image img={chartbrew_07} size="lg" alt="ClickHouse SQL query in Chartbrew" />

  Click **Run query** to fetch the data.

  If you're unsure how to write the query, you can use **Chartbrew's AI assistant** to generate SQL queries based on your database schema.

<Image img={chartbrew_06} size="lg" alt="ClickHouse AI SQL assistant in Chartbrew" />

Once the data is retrieved, click **Configure dataset** to set up the visualization parameters.

## 4. Create a visualization {#4-create-a-visualization}
   
  1. Define a metric (numerical value) and dimension (categorical value) for your visualization.
  2. Preview the dataset to ensure the query results are structured correctly.
  3. Choose a chart type (e.g., line chart, bar chart, pie chart) and add it to your dashboard.
  4. Click **Complete dataset** to finalize the setup.

  <Image img={chartbrew_08} size="lg" alt="Chartbrew dashboard with ClickHouse data" />

  You can create as many datasets as you want to visualize different aspects of your data. Using these datasets, you can create multiple dashboards to keep track of different metrics.

  <Image img={chartbrew_01} size="lg" alt="Chartbrew dashboard with ClickHouse data" />

## 5. Automate data updates {#5-automate-data-updates}
   
  To keep your dashboard up-to-date, you can schedule automatic data updates:

  1. Click the Calendar icon next to the dataset refresh button.
  2. Configure the update interval (e.g., every hour, every day).
  3. Save the settings to enable automatic refresh.

  <Image img={chartbrew_09} size="lg" alt="Chartbrew dataset refresh settings" />

## Learn more {#learn-more}

For more details, check out the blog post about [Chartbrew and ClickHouse](https://chartbrew.com/blog/visualizing-clickhouse-data-with-chartbrew-a-step-by-step-guide/).
