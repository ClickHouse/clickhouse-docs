---
sidebar_label: 'DataGrip'
slug: /integrations/datagrip
description: 'DataGrip is a database IDE that supports ClickHouse out of the box.'
title: 'Connecting DataGrip to ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';

# Connecting DataGrip to ClickHouse

## Start or download DataGrip {#start-or-download-datagrip}

DataGrip is available at https://www.jetbrains.com/datagrip/

## 1. Gather your connection details {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Load the ClickHouse driver {#2-load-the-clickhouse-driver}

1. Launch DataGrip, and on the **Data Sources** tab in the **Data Sources and Drivers** dialog, click the **+** icon

<img src={datagrip_5} class="image" alt="DataGrip 05" />

  Select **ClickHouse**

  :::tip
  As you establish connections the order changes, ClickHouse may not be at the top of your list yet.
  :::

<img src={datagrip_6} class="image" alt="DataGrip 06" />

- Switch to the **Drivers** tab and load the ClickHouse driver

  DataGrip does not ship with drivers in order to minimize the download size.  On the **Drivers** tab
  Select **ClickHouse** from the **Complete Support** list, and expand the **+** sign.  Choose the **Latest stable** driver from the **Provided Driver** option:

<img src={datagrip_1} class="image" alt="DataGrip 01" />

## 3. Connect to ClickHouse {#3-connect-to-clickhouse}

- Specify your database connection details, and click **Test Connection**:

  In step one you gathered your connection details, fill in the host URL, port, username, password, and database name, then test the connection.

  :::tip
  The **HOST** entry in the DataGrip dialog is actually a URL, see the image below.

  For more details on JDBC URL settings, please refer to the [ClickHouse JDBC driver](https://github.com/ClickHouse/clickhouse-java) repository.
  :::

<img src={datagrip_7} class="image" alt="DataGrip 07" />

## Learn more {#learn-more}

Find more information about DataGrip visit the DataGrip documentation.
