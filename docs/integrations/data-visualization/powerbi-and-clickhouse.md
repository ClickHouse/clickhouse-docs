---
sidebar_label: 'Power BI'
slug: /integrations/powerbi
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui']
description: 'Microsoft Power BI is an interactive data visualization software product developed by Microsoft with a primary focus on business intelligence.'
title: 'Power BI'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import powerbi_odbc_install from '@site/static/images/integrations/data-visualization/powerbi_odbc_install.png';
import powerbi_odbc_search from '@site/static/images/integrations/data-visualization/powerbi_odbc_search.png';
import powerbi_odbc_verify from '@site/static/images/integrations/data-visualization/powerbi_odbc_verify.png';
import powerbi_get_data from '@site/static/images/integrations/data-visualization/powerbi_get_data.png';
import powerbi_search_clickhouse from '@site/static/images/integrations/data-visualization/powerbi_search_clickhouse.png';
import powerbi_connect_db from '@site/static/images/integrations/data-visualization/powerbi_connect_db.png';
import powerbi_connect_user from '@site/static/images/integrations/data-visualization/powerbi_connect_user.png';
import powerbi_table_navigation from '@site/static/images/integrations/data-visualization/powerbi_table_navigation.png';
import powerbi_add_dsn from '@site/static/images/integrations/data-visualization/powerbi_add_dsn.png';
import powerbi_select_unicode from '@site/static/images/integrations/data-visualization/powerbi_select_unicode.png';
import powerbi_connection_details from '@site/static/images/integrations/data-visualization/powerbi_connection_details.png';
import powerbi_select_odbc from '@site/static/images/integrations/data-visualization/powerbi_select_odbc.png';
import powerbi_select_dsn from '@site/static/images/integrations/data-visualization/powerbi_select_dsn.png';
import powerbi_dsn_credentials from '@site/static/images/integrations/data-visualization/powerbi_dsn_credentials.png';
import powerbi_16 from '@site/static/images/integrations/data-visualization/powerbi_16.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Power BI

<ClickHouseSupportedBadge/>

Microsoft Power BI can query or load into memory data from [ClickHouse Cloud](https://clickhouse.com/cloud) or a self-managed deployment.

There are several flavours of Power BI that you can use to visualise your data:

* Power BI Desktop: A Windows desktop application for creating Dashboards and Visualisations
* Power BI Service: Available within Azure as a SaaS to host the Dashboards created on Power BI Desktop

Power BI requires you to create your dashboards within the Desktop version and publish them to Power BI Service.

This tutorial will guide you through the process of:

* [Installing the ClickHouse ODBC Driver](#install-the-odbc-driver)
* [Installing the ClickHouse Power BI Connector into Power BI Desktop](#power-bi-installation)
* [Querying data from ClickHouse for visualization in Power BI Desktop](#query-and-visualise-data)
* [Setting up an on-premise data gateway for Power BI Service](#power-bi-service)

## Prerequisites {#prerequisites}

### Power BI Installation {#power-bi-installation}

This tutorial assumes you have Microsoft Power BI Desktop installed on your Windows machine. You can download and install Power BI Desktop [here](https://www.microsoft.com/en-us/download/details.aspx?id=58494)

We recommend updating to the latest version of Power BI. The ClickHouse Connector is available by default from version `2.137.751.0`.

### Gather your ClickHouse connection details {#gather-your-clickhouse-connection-details}

You'll need the following details for connecting to your ClickHouse instance:

* Hostname - ClickHouse
* Username - User credentials
* Password - Password of the user
* Database - Name of the database on the instance you want to connect to

## Power BI desktop {#power-bi-desktop}

To get started with querying data in Power BI Desktop, you'll need to complete the following steps:

1. Install the ClickHouse ODBC Driver
2. Find the ClickHouse Connector
3. Connect to ClickHouse
4. Query and Visualize you data

### Install the ODBC Driver {#install-the-odbc-driver}

Download the most recent [ClickHouse ODBC release](https://github.com/ClickHouse/clickhouse-odbc/releases).

Execute the supplied `.msi` installer and follow the wizard.


<Image size="md" img={powerbi_odbc_install} alt="ClickHouse ODBC driver installation wizard showing installation options" border />
<br/>

:::note
`Debug symbols` are optional and not required
:::

#### Verify ODBC driver {#verify-odbc-driver}

When the driver installation is completed, you can verify the installation was successful by:

Searching for ODBC in the Start menu and select "ODBC Data Sources **(64-bit)**".

<Image size="md" img={powerbi_odbc_search} alt="Windows search showing ODBC Data Sources (64-bit) option" border />
<br/>

Verify the ClickHouse Driver is listed.

<Image size="md" img={powerbi_odbc_verify} alt="ODBC Data Source Administrator showing ClickHouse drivers in the Drivers tab" border />
<br/>

### Find the ClickHouse Connector {#find-the-clickhouse-connector}

:::note
Available in version `2.137.751.0` of Power BI Desktop
:::
On the Power BI Desktop start screen, click "Get Data".

<Image size="md" img={powerbi_get_data} alt="Power BI Desktop home screen showing the Get Data button" border />
<br/>

Search for "ClickHouse"

<Image size="md" img={powerbi_search_clickhouse} alt="Power BI Get Data dialog with ClickHouse searched in the search bar" border />
<br/>

### Connect to ClickHouse {#connect-to-clickhouse}

Select the connector, and enter in the ClickHouse instance credentials:

* Host (required) - Your instance domain/address. Make sure to add it with no prefixes/suffixes.
* Port (required) - Your instance port.
* Database - Your database name.
* Options - Any ODBC option as listed
  in [ClickHouse ODBC GitHub Page](https://github.com/ClickHouse/clickhouse-odbc#configuration)
* Data Connectivity mode - DirectQuery

<Image size="md" img={powerbi_connect_db} alt="ClickHouse connection dialog showing host, port, database and connectivity mode fields" border />
<br/>

:::note
We advise selecting DirectQuery for querying ClickHouse directly.

If you have a use case that has a small amount of data, you can choose import mode, and the entire data will be loaded to Power BI.
:::

* Specify username and password

<Image size="md" img={powerbi_connect_user} alt="ClickHouse connection credentials dialog for username and password" border />
<br/>

### Query and Visualise Data {#query-and-visualise-data}

Finally, you should see the databases and tables in the Navigator view. Select the desired table and click "Load" to
import the data from ClickHouse.

<Image size="md" img={powerbi_table_navigation} alt="Power BI Navigator view showing ClickHouse database tables and sample data" border />
<br/>

Once the import is complete, your ClickHouse Data should be accessible in Power BI as usual.
<br/>

## Power BI service {#power-bi-service}

In order to use Microsoft Power BI Service, you need to create an [on-premise data gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem).

For more details on how to setup custom connectors, please refer to Microsoft's documentation on how to [use custom data connectors with an on-premises data gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors).

## ODBC driver (import only) {#odbc-driver-import-only}

We recommend using the ClickHouse Connector that uses DirectQuery.

Install the [ODBC Driver](#install-the-odbc-driver) onto the on-premise data gateway instance and [verify](#verify-odbc-driver) as outlined above.

### Create a new User DSN {#create-a-new-user-dsn}

When the driver installation is complete, an ODBC data source can be created. Search for ODBC in the Start menu and select "ODBC Data Sources (64-bit)".

<Image size="md" img={powerbi_odbc_search} alt="Windows search showing ODBC Data Sources (64-bit) option" border />
<br/>

We need to add a new User DSN here. Click "Add" button on the left.

<Image size="md" img={powerbi_add_dsn} alt="ODBC Data Source Administrator with Add button highlighted for creating new DSN" border />
<br/>

Choose the Unicode version of the ODBC driver.

<Image size="md" img={powerbi_select_unicode} alt="Create New Data Source dialog showing ClickHouse Unicode Driver selection" border />
<br/>

Fill in the connection details.


<Image size="sm" img={powerbi_connection_details} alt="ClickHouse ODBC Driver configuration dialog with connection parameters" border />
<br/>

:::note
If you are using a deployment that has SSL enabled (e.g. ClickHouse Cloud or a self-managed instance), in the `SSLMode` field you should supply `require`.

- `Host` should always have the protocol (i.e. `http://` or `https://`) omitted.
- `Timeout` is an integer representing seconds. Default value: `30 seconds`.
:::

### Get data into Power BI {#get-data-into-power-bi}

In case you don't have Power BI installed
yet, [download and install Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494).

On the Power BI Desktop start screen, click "Get Data".

<Image size="md" img={powerbi_get_data} alt="Power BI Desktop home screen showing the Get Data button" border />
<br/>

Select "Other" -> "ODBC".

<Image size="md" img={powerbi_select_odbc} alt="Power BI Get Data dialog with ODBC option selected under the Other category" border />
<br/>

Select your previously created data source from the list.

<Image size="md" img={powerbi_select_dsn} alt="ODBC driver selection dialog showing the configured ClickHouse DSN" border />
<br/>

:::note
If you did not specify credentials during the data source creation, you will be prompted to specify username and password.
:::

<Image size="md" img={powerbi_dsn_credentials} alt="Credentials dialog for the ODBC DSN connection" border />
<br/>

Finally, you should see the databases and tables in the Navigator view. Select the desired table and click "Load" to import the data from ClickHouse.

<Image size="md" img={powerbi_table_navigation} alt="Power BI Navigator view showing ClickHouse database tables and sample data" border />
<br/>

Once the import is complete, your ClickHouse Data should be accessible in Power BI as usual.


## Known limitations {#known-limitations}

### UInt64 {#uint64}

Unsigned integer types such as UInt64 or bigger won't be loaded into the dataset automatically, as Int64 is the maximum whole number type support by Power BI.

:::note
To import the data properly, before hitting the "Load" button in the Navigator, click "Transform Data" first.
:::

In this example, `pageviews` table has a UInt64 column, which is recognized as "Binary" by default.
"Transform Data" opens Power Query Editor, where we can reassign the type of the column, setting it as, for example,
Text.

<Image size="md" img={powerbi_16} alt="Power Query Editor showing data type transformation for UInt64 column" border />
<br/>

Once finished, click "Close & Apply" in the top left corner, and proceed with loading the data.
