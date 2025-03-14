---
sidebar_label: 'Explo'
sidebar_position: 131
slug: /integrations/explo
keywords: ['clickhouse', 'Explo', 'connect', 'integrate', 'ui']
description: 'Explo is an easy-to-use, open source UI tool for asking questions about your data.'
title: 'Connecting Explo to ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import explo_01 from '@site/static/images/integrations/data-visualization/explo_01.png';
import explo_02 from '@site/static/images/integrations/data-visualization/explo_02.png';
import explo_03 from '@site/static/images/integrations/data-visualization/explo_03.png';
import explo_04 from '@site/static/images/integrations/data-visualization/explo_04.png';
import explo_05 from '@site/static/images/integrations/data-visualization/explo_05.png';
import explo_06 from '@site/static/images/integrations/data-visualization/explo_06.png';
import explo_07 from '@site/static/images/integrations/data-visualization/explo_07.png';
import explo_08 from '@site/static/images/integrations/data-visualization/explo_08.png';
import explo_09 from '@site/static/images/integrations/data-visualization/explo_09.png';
import explo_10 from '@site/static/images/integrations/data-visualization/explo_10.png';
import explo_11 from '@site/static/images/integrations/data-visualization/explo_11.png';
import explo_12 from '@site/static/images/integrations/data-visualization/explo_12.png';
import explo_13 from '@site/static/images/integrations/data-visualization/explo_13.png';
import explo_14 from '@site/static/images/integrations/data-visualization/explo_14.png';
import explo_15 from '@site/static/images/integrations/data-visualization/explo_15.png';
import explo_16 from '@site/static/images/integrations/data-visualization/explo_16.png';

# Connecting Explo to ClickHouse

Customer-facing analytics for any platform. Designed for beautiful visualization. Engineered for simplicity.

## Goal {#goal}

In this guide you will connect your data from ClickHouse to Explo and visualize the results.  The chart will look like this:
<img src={explo_15} class="image" alt="Explo Dashboard" />

<p/>

:::tip Add some data
If you do not have a dataset to work with you can add one of the examples.  This guide uses the [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) dataset, so you might choose that one.  There are several others to look at in the same documentation category.
:::

## 1. Gather your connection details {#1-gather-your-connection-details}
<ConnectionDetails />


## 2.  Connect Explo to ClickHouse {#2--connect-explo-to-clickhouse}

1. Sign up for an Explo account.

2. Click on the Explo **data** tab on the left hand sidebar.


<img src={explo_01} class="image" alt="Data Tab" />

3. Click **Connect Data Source** in the upper right hand side.


<img src={explo_02} class="image" alt="Connect Data Source" />

4. Fill out the information on the **Getting Started** page


<img src={explo_03} class="image" alt="Getting Started" />

5. Select **Clickhouse**


<img src={explo_04} class="image" alt="Clickhouse" />


6. Enter your **Clickhouse Credentials**. 


<img src={explo_05} class="image" alt="Credentials" />


7. Configure **Security**


<img src={explo_06} class="image" alt="Security" />

8. Within Clickhouse, **Whitelist the Explo IPs**.
`
54.211.43.19, 52.55.98.121, 3.214.169.94, and 54.156.141.148
`

## 3. Create a Dashboard {#3-create-a-dashboard}

1. Navigate to **Dashboard** tab on the left side nav bar.


<img src={explo_07} class="image" alt="Dashboard" />


2. Click **Create Dashboard** in the upper right corner and name your dashboard. You've now created a dashboard!


<img src={explo_08} class="image" alt="Create Dashboard" />


3. You should now see a screen that is similar to this:


<img src={explo_09} class="image" alt="Explo Dashboard" />


## 4. Run a SQL query {#4-run-a-sql-query}

1. Get your table name from the right hand sidebar under your schema title. You should then put the following command into your dataset editor:
`
SELECT * FROM YOUR_TABLE_NAME
LIMIT 100
`


<img src={explo_10} class="image" alt="Explo Dashboard" />


2. Now click run and go to the preview tab to see your data.


<img src={explo_11} class="image" alt="Explo Dashboard" />


## 5. Build a Chart {#5-build-a-chart}

1. From the left hand side, drag the bar chart icon onto the screen.


<img src={explo_16} class="image" alt="Explo Dashboard" />


2. Select the dataset. You should now see a screen like the following:


<img src={explo_12} class="image" alt="Explo Dashboard" />


3. Fill out the **county** in the X Axis and **Price** in the Y Axis Section like so:


<img src={explo_13} class="image" alt="Explo Dashboard" />


4. Now, change the aggregation to **AVG**.


<img src={explo_14} class="image" alt="Explo Dashboard" />


5. We now have average price of homes broken down by price!


<img src={explo_15} class="image" alt="Explo Dashboard" />

## Learn more {#learn-more}

Find more information about Explo and how to build dashboards by <a href="https://docs.explo.co/" target="_blank">visiting the Explo documentation</a>.
