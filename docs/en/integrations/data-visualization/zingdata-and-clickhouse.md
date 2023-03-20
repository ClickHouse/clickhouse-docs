---
sidebar_label: Zing Data
sidebar_position: 198
slug: /en/integrations/zingdata
keywords: [clickhouse, zingdata, connect, integrate, ui]
description: Zing Data is simple social business intelligence for ClickHouse, made for iOS, Android and the web.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# Connect Zing Data to ClickHouse

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> is data exploration and visualization platform. Zing Data connects to ClickHouse using the JS driver provided by ClickHouse. 

## How to connect


## 1. Gather your connection details
<ConnectionDetails />

## 2. Connect Zing Data to ClickHouse



## 4. Add a Dataset

1. To interact with your ClickHouse data with Zing Data, you need to define a **_dataset_**. From the top menu in Zing Data, select **Data**, then **Datasets** from the drop-down menu.

2. Click the button for adding a dataset. Select your new database as the datasource and you should see the tables defined in your database:

  <img src={require('./images/superset_04.png').default} class="image" alt="New dataset" />


3. Click the **ADD** button at the bottom of the dialog window and your table appears in the list of datasets. You are ready to build a dashboard and analyze your ClickHouse data!


## 5.  Creating charts and a dashboard in Zing Data


## Related Content

- Blog: [Visualizing Data with ClickHouse - Zing Data]()
