---
sidebar_label: 'Explo'
sidebar_position: 131
slug: /integrations/explo
keywords: ['clickhouse', 'Explo', 'connect', 'integrate', 'ui']
description: 'Explo is an easy-to-use, open source UI tool for asking questions about your data.'
title: 'Connecting Explo to ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Connecting Explo to ClickHouse

<CommunityMaintainedBadge/>

Customer-facing analytics for any platform. Designed for beautiful visualization. Engineered for simplicity.

## Goal {#goal}

In this guide you will connect your data from ClickHouse to Explo and visualize the results.  The chart will look like this:
<Image img={explo_15} size="md" alt="Explo Dashboard" />

<p/>

:::tip Add some data
If you do not have a dataset to work with you can add one of the examples.  This guide uses the [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) dataset, so you might choose that one.  There are several others to look at in the same documentation category.
:::

## 1. Gather your connection details {#1-gather-your-connection-details}
<ConnectionDetails />

## 2.  Connect Explo to ClickHouse {#2--connect-explo-to-clickhouse}

1. Sign up for an Explo account.

2. Click on the Explo **data** tab on the left hand sidebar.

<Image img={explo_01} size="sm" alt="Data Tab" border />

3. Click **Connect Data Source** in the upper right hand side.

<Image img={explo_02} size="sm" alt="Connect Data Source" border />

4. Fill out the information on the **Getting Started** page

<Image img={explo_03} size="md" alt="Getting Started" border />

5. Select **Clickhouse**

<Image img={explo_04} size="md" alt="Clickhouse" border />

6. Enter your **Clickhouse Credentials**.

<Image img={explo_05} size="md" alt="Credentials" border />

7. Configure **Security**

<Image img={explo_06} size="md" alt="Security" border />

8. Within Clickhouse, **Whitelist the Explo IPs**.
`
54.211.43.19, 52.55.98.121, 3.214.169.94, and 54.156.141.148
`

## 3. Create a Dashboard {#3-create-a-dashboard}

1. Navigate to **Dashboard** tab on the left side nav bar.

<Image img={explo_07} size="sm" alt="Dashboard" border />

2. Click **Create Dashboard** in the upper right corner and name your dashboard. You've now created a dashboard!

<Image img={explo_08} size="sm" alt="Create Dashboard" border />

3. You should now see a screen that is similar to this:

<Image img={explo_09} size="md" alt="Explo Dashboard" border />

## 4. Run a SQL query {#4-run-a-sql-query}

1. Get your table name from the right hand sidebar under your schema title. You should then put the following command into your dataset editor:
`
SELECT * FROM YOUR_TABLE_NAME
LIMIT 100
`

<Image img={explo_10} size="md" alt="Explo Dashboard" border />

2. Now click run and go to the preview tab to see your data.

<Image img={explo_11} size="md" alt="Explo Dashboard" border />

## 5. Build a Chart {#5-build-a-chart}

1. From the left hand side, drag the bar chart icon onto the screen.

<Image img={explo_16} size="sm" alt="Explo Dashboard" border />

2. Select the dataset. You should now see a screen like the following:

<Image img={explo_12} size="sm" alt="Explo Dashboard" border />

3. Fill out the **county** in the X Axis and **Price** in the Y Axis Section like so:

<Image img={explo_13} size="sm" alt="Explo Dashboard" border />

4. Now, change the aggregation to **AVG**.

<Image img={explo_14} size="sm" alt="Explo Dashboard" border />

5. We now have average price of homes broken down by price!

<Image img={explo_15} size="md" alt="Explo Dashboard" />

## Learn more {#learn-more}

Find more information about Explo and how to build dashboards by <a href="https://docs.explo.co/" target="_blank">visiting the Explo documentation</a>.
