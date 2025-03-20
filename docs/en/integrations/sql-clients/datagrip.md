---
sidebar_label: DataGrip
slug: /en/integrations/datagrip
description: DataGrip is a database IDE that supports ClickHouse out of the box.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# Connecting DataGrip to ClickHouse

## Start or download DataGrip

DataGrip is available at https://www.jetbrains.com/datagrip/

## 1. Gather your connection details
<ConnectionDetails />

## 2. Load the ClickHouse driver

1. Launch DataGrip, and on the **Data Sources** tab in the **Data Sources and Drivers** dialog, click the **+** icon

  ![](@site/docs/en/integrations/sql-clients/images/datagrip-5.png)

  Select **ClickHouse**

  :::tip
  As you establish connections the order changes, ClickHouse may not be at the top of your list yet.
  :::

  ![](@site/docs/en/integrations/sql-clients/images/datagrip-6.png)

- Switch to the **Drivers** tab and load the ClickHouse driver

  DataGrip does not ship with drivers in order to minimize the download size.  On the **Drivers** tab
  Select **ClickHouse** from the **Complete Support** list, and expand the **+** sign.  Choose the **Latest stable** driver from the **Provided Driver** option:

  ![](@site/docs/en/integrations/sql-clients/images/datagrip-1.png)

## 3. Connect to ClickHouse

- Specify your database connection details, and click **Test Connection**:

  In step one you gathered your connection details, fill in the host URL, port, username, password, and database name, then test the connection.

  :::tip
  The **HOST** entry in the DataGrip dialog is actually a URL, see the image below.

  For more details on JDBC URL settings, please refer to the [ClickHouse JDBC driver](https://github.com/ClickHouse/clickhouse-java) repository.
  :::

  ![](@site/docs/en/integrations/sql-clients/images/datagrip-7.png)

## Learn more

Find more information about DataGrip visit the DataGrip documentation.
