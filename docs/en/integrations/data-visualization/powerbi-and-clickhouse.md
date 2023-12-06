---
sidebar_label: Power BI
slug: /en/integrations/powerbi
keywords: [clickhouse, powerbi, connect, integrate, ui]
description: Microsoft Power BI is an interactive data visualization software product developed by Microsoft with a primary focus on business intelligence.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# Power BI

Power BI can load the data from ClickHouse Cloud or on-premise deployment using either the [ODBC driver](https://github.com/ClickHouse/clickhouse-odbc) or [ClickHouse Native connector](https://github.com/ClickHouse/power-bi-clickhouse). Both methods support Load mode, but the latter also supports Direct Query mode which eliminates the necessity to load the entire table.

This tutorial will guide you through the process of loading data using either of these methods. 
<br/>
<br/>
<br/>

# ClickHouse Native Connector

## 1. Gather your connection details
<ConnectionDetails />

## 2. Install ClickHouse ODBC Client

Download the most recent ClickHouse ODBC release from [here](https://github.com/ClickHouse/clickhouse-odbc/releases).
Execute the supplied `.msi` installer and follow the wizard. 
Optional "debug symbols" are not required, so you could keep everything default.

<img src={require('./images/powerbi_01.png').default} class="image" alt="Installing the ODBC driver" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

When the driver installation is completed, you can verify the installation was successful:
Search for ODBC in the Start menu and select "ODBC Data Sources **(64-bit)**".

<img src={require('./images/powerbi_02.png').default} class="image" alt="Creating a new ODBC Data Source" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Make sure ClickHouse Driver is listed.

<img src={require('./images/powerbi_03.png').default} class="image" alt="Verify ODBC existence" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>


In case you don't have Power BI installed yet, [download and install Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494).


## 3. Install ClickHouse Native Connector

* Create the following directory for the custom connector "[Documents]\Microsoft Power BI Desktop\Custom Connectors directory".
* Download the latest release (.mez file) of the native connector from the [Releases Section](https://github.com/ClickHouse/power-bi-clickhouse/releases) and place it in the directory you created in the previous step.
* Open Power BI and enable unsigned connectors loading: File -> Options and settings -> Options -> Security -> Data Extensions -> Allow any extension to load without warning or validation

<img src={require('./images/powerbi_04.png').default} class="image" alt="Enable unsigned connectors loading" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

* Restart Power BI. 

## 4. Get Data Into Power BI


On the Power BI Desktop start screen, click "Get Data".

<img src={require('./images/powerbi_05.png').default} class="image" alt="Getting started with Power BI Desktop" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Search for "ClickHouseConnector (Beta)"

<img src={require('./images/powerbi_06.png').default} class="image" alt="Choosing the data source" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Select the connector, and fill the following boxes:
* Server (required field) - Your instance domain/address. Make sure to add it with no prefixes/suffixes.
* Port (required field) - Your instance port.
* Database - Your database name.
* Options - Any ODBC option as listed in [ClickHouse ODBC GitHub Page](https://github.com/ClickHouse/clickhouse-odbc#configuration)
* Data Connectivity mode - Choose DirectQuery for querying ClickHouse directly. In case you have a small load, you can choose import mode, and the entire data will be loaded to Power BI.  

<img src={require('./images/powerbi_07.png').default} class="image" alt="Filling ClickHouse instance information" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

* Specify username and password

<img src={require('./images/powerbi_08.png').default} class="image" alt="Username and password prompt" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Finally, you should see the databases and tables in the Navigator view. Select the desired table and click "Load" to import the data from ClickHouse.

<img src={require('./images/powerbi_09.png').default} class="image" alt="Navigator view" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Once the import is complete, your ClickHouse Data should accessible in Power BI as usual.
<br/>
<br/>
<br/>

# ODBC Driver

Follow steps 1 and 2 from the Native Connector section above.

## 3. Create a new User DSN 

When the driver installation is complete, an ODBC data source can be created. Search for ODBC in the Start menu and select "ODBC Data Sources (64-bit)".

<img src={require('./images/powerbi_02.png').default} class="image" alt="Creating a new ODBC Data Source" style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

We need to add a new User DSN here. Click "Add" button on the left.

<img src={require('./images/powerbi_10.png').default} class="image" alt="Adding a new User DSN" style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

Choose the Unicode version of the ODBC driver.

<img src={require('./images/powerbi_11.png').default} class="image" alt="Choosing Unicode Version" style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

Fill in the connection details. The "Host" field should not include the protocol (i.e. omit http:// or https:// part).
If you are using ClickHouse Cloud or your on-premise deployment has SSL enabled, type require in the "SSLMode" field.
"Timeout" field value is set in seconds and, if omitted, the default value is 30 seconds.

<img src={require('./images/powerbi_12.png').default} class="image" alt="Connection Details" style={{width: '30%', 'background-color': 'transparent'}}/>
<br/>

## 4. Get Data Into Power BI

In case you don't have Power BI installed yet, [download and install Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494).

On the Power BI Desktop start screen, click "Get Data".

<img src={require('./images/powerbi_05.png').default} class="image" alt="Getting started with Power BI Desktop" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Select "Other" -> "ODBC".

<img src={require('./images/powerbi_13.png').default} class="image" alt="Data Sources menu" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Select your previously created data source from the list.

<img src={require('./images/powerbi_14.png').default} class="image" alt="Select ODBC Data Source" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

If you specified all the credentials during the data source creation, it should connect straight away. Otherwise, you will be prompted to specify username and password.

<img src={require('./images/powerbi_15.png').default} class="image" alt="Navigator view" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Finally, you should see the databases and tables in the Navigator view. Select the desired table and click "Load" to import the data from ClickHouse.

<img src={require('./images/powerbi_09.png').default} class="image" alt="Navigator view" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Once the import is complete, your ClickHouse Data should accessible in Power BI as usual.
<br/>
<br/>

:::note 
Unsigned integer types such as UInt64 or bigger won't be loaded into the dataset automatically, as Int64 is the maximum whole number type support by Power BI.<br/>
To import the data properly, before hitting the "Load" button in the Navigator, click "Transform Data" first.
:::

In this example, `pageviews` table has a UInt64 column, which is recognized as "Binary" by default. 
"Transform Data" opens Power Query Editor, where we can reassign the type of the column, setting it as, for example, Text.

<img src={require('./images/powerbi_16.png').default} class="image" alt="Navigator view" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Once finished, click "Close & Apply" in the top left corner, and proceed with loading the data.
