---
sidebar_label: Power BI
slug: /integrations/powerbi
keywords: [ clickhouse, Power BI, connect, integrate, ui ]
description: Microsoft Power BI is an interactive data visualization software product developed by Microsoft with a primary focus on business intelligence.
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';

# Power BI

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

## Power BI Desktop {#power-bi-desktop}

To get started with querying data in Power BI Desktop, you'll need to complete the following steps:

1. Install the ClickHouse ODBC Driver
2. Find the ClickHouse Connector
3. Connect to ClickHouse
4. Query and Visualize you data

### Install the ODBC Driver {#install-the-odbc-driver}

Download the most recent [ClickHouse ODBC release](https://github.com/ClickHouse/clickhouse-odbc/releases).

Execute the supplied `.msi` installer and follow the wizard.


<img src={require('./images/powerbi_odbc_install.png').default} class="image" alt="Installing the ODBC driver" style={{width: 
'50%', 'background-color': 'transparent'}}/>
<br/>

:::note
`Debug symbols` are optional and not required
:::

#### Verify ODBC Driver {#verify-odbc-driver}

When the driver installation is completed, you can verify the installation was successful by:

Searching for ODBC in the Start menu and select "ODBC Data Sources **(64-bit)**".

<img src={require('./images/powerbi_odbc_search.png').default} class="image" alt="Creating a new ODBC Data Source"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Verify the ClickHouse Driver is listed.

<img src={require('./images/powerbi_odbc_verify.png').default} class="image" alt="Verify ODBC existence" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

### Find the ClickHouse Connector {#find-the-clickhouse-connector}

:::note
Available in version `2.137.751.0` of Power BI Desktop
:::
On the Power BI Desktop start screen, click "Get Data".

<img src={require('./images/powerbi_get_data.png').default} class="image" alt="Getting started with Power BI Desktop"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Search for "ClickHouse"

<img src={require('./images/powerbi_search_clickhouse.png').default} class="image" alt="Choosing the data source" style={{width: 
'50%', 'background-color': 'transparent'}}/>
<br/>

### Connect to ClickHouse {#connect-to-clickhouse}

Select the connector, and enter in the ClickHouse instance credentials:

* Host (required) - Your instance domain/address. Make sure to add it with no prefixes/suffixes.
* Port (required) - Your instance port.
* Database - Your database name.
* Options - Any ODBC option as listed
  in [ClickHouse ODBC GitHub Page](https://github.com/ClickHouse/clickhouse-odbc#configuration)
* Data Connectivity mode - DirectQuery

<img src={require('./images/powerbi_connect_db.png').default} class="image" alt="Filling ClickHouse instance information"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

:::note
We advise selecting DirectQuery for querying ClickHouse directly. 

If you have a use case that has a small amount of data, you can choose import mode, and the entire data will be loaded to Power BI.
:::

* Specify username and password

<img src={require('./images/powerbi_connect_user.png').default} class="image" alt="Username and password prompt" style={{width:
'50%', 'background-color': 'transparent'}}/>
<br/>

### Query and Visualise Data {#query-and-visualise-data}

Finally, you should see the databases and tables in the Navigator view. Select the desired table and click "Load" to
import the data from ClickHouse.

<img src={require('./images/powerbi_table_navigation.png').default} class="image" alt="Navigator view" style={{width: '50%',
'background-color': 'transparent'}}/>
<br/>

Once the import is complete, your ClickHouse Data should be accessible in Power BI as usual.
<br/>

## Power BI Service {#power-bi-service}

In order to use Microsoft Power BI Service, you need to create an [on-premise data gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem).

For more details on how to setup custom connectors, please refer to Microsoft's documentation on how to [use custom data connectors with an on-premises data gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors).

## ODBC Driver (Import Only) {#odbc-driver-import-only}

We recommend using the ClickHouse Connector that uses DirectQuery.

Install the [ODBC Driver](#install-the-odbc-driver) onto the on-premise data gateway instance and [verify](#verify-odbc-driver) as outlined above.

### Create a new User DSN {#create-a-new-user-dsn}

When the driver installation is complete, an ODBC data source can be created. Search for ODBC in the Start menu and select "ODBC Data Sources (64-bit)".

<img src={require('./images/powerbi_odbc_search.png').default} class="image" alt="Creating a new ODBC Data Source"
style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

We need to add a new User DSN here. Click "Add" button on the left.

<img src={require('./images/powerbi_add_dsn.png').default} class="image" alt="Adding a new User DSN" style={{width: '40%', 
'background-color': 'transparent'}}/>
<br/>

Choose the Unicode version of the ODBC driver.

<img src={require('./images/powerbi_select_unicode.png').default} class="image" alt="Choosing Unicode Version" style={{width: 
'40%', 'background-color': 'transparent'}}/>
<br/>

Fill in the connection details. 


<img src={require('./images/powerbi_connection_details.png').default} class="image" alt="Connection Details" style={{width: '30%', 
'background-color': 'transparent'}}/>
<br/>

:::note
If you are using a deployment that has SSL enabled (e.g. ClickHouse Cloud or a self-managed instance), in the `SSLMode` field you should supply `require`. 

- `Host` should always have the protocol (i.e. `http://` or `https://`) omitted.
- `Timeout` is an integer representing seconds. Default value: `30 seconds`.
:::

### Get Data Into Power BI {#get-data-into-power-bi}

In case you don't have Power BI installed
yet, [download and install Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494).

On the Power BI Desktop start screen, click "Get Data".

<img src={require('./images/powerbi_get_data.png').default} class="image" alt="Getting started with Power BI Desktop"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Select "Other" -> "ODBC".

<img src={require('./images/powerbi_select_odbc.png').default} class="image" alt="Data Sources menu" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

Select your previously created data source from the list.

<img src={require('./images/powerbi_select_dsn.png').default} class="image" alt="Select ODBC Data Source" style={{width: 
'50%', 'background-color': 'transparent'}}/>
<br/>

:::note
If you did not specify credentials during the data source creation, you will be prompted to specify username and password.
:::

<img src={require('./images/powerbi_dsn_credentials.png').default} class="image" alt="Navigator view" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

Finally, you should see the databases and tables in the Navigator view. Select the desired table and click "Load" to import the data from ClickHouse.

<img src={require('./images/powerbi_table_navigation.png').default} class="image" alt="Navigator view" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

Once the import is complete, your ClickHouse Data should be accessible in Power BI as usual.


## Known Limitations {#known-limitations}

### UInt64 {#uint64}

Unsigned integer types such as UInt64 or bigger won't be loaded into the dataset automatically, as Int64 is the maximum whole number type support by Power BI.

:::note
To import the data properly, before hitting the "Load" button in the Navigator, click "Transform Data" first.
:::

In this example, `pageviews` table has a UInt64 column, which is recognized as "Binary" by default.
"Transform Data" opens Power Query Editor, where we can reassign the type of the column, setting it as, for example,
Text.

<img src={require('./images/powerbi_16.png').default} class="image" alt="Navigator view" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

Once finished, click "Close & Apply" in the top left corner, and proceed with loading the data.
