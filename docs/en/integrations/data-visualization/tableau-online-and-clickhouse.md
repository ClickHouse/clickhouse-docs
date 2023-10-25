---
sidebar_label: Tableau Online
slug: /en/integrations/tableau-online
keywords: [clickhouse, tableau, online, mysql, connect, integrate, ui]
description: Tableau Online streamlines the power of data to make people faster and more confident decision makers from anywhere.
---

import MySQLCloudSetup from '@site/docs/en/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/docs/en/_snippets/_clickhouse_mysql_on_premise_setup.mdx';

# Tableau Online

Tableau Online can connect to ClickHouse Cloud or on-premise ClickHouse setup via MySQL interface using the official MySQL data source.

## ClickHouse Cloud Setup
<MySQLCloudSetup />

## On-premise ClickHouse Server Setup
<MySQLOnPremiseSetup />

## Connecting Tableau Online to ClickHouse (on-premise without SSL)

Login to your Tableau Cloud site and add a new Published Data Source.

<img src={require('./images/tableau_online_01.png').default} class="image" alt="Creating a new published data source" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Select "MySQL" from the list of available connectors.

<img src={require('./images/tableau_online_02.png').default} class="image" alt="Selecting MySQL connector" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Specify your connection details gathered during the ClickHouse setup.

<img src={require('./images/tableau_online_03.png').default} class="image" alt="Specifying your connection details" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Tableau Online will introspect the database and provide a list of available tables. Drag the desired table to the canvas on the right. Additionally, you can click "Update Now" to preview the data, as well as fine-tune the introspected field types or names.

<img src={require('./images/tableau_online_04.png').default} class="image" alt="Selecting the tables to use" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

After that, all that remains is to click "Publish As" in the top right corner, and you should be able to use a newly created dataset in Tableau Online as usual.

NB: if you want to use Tableau Online in combination with Tableau Desktop and share ClickHouse datasets between them, make sure you use Tableau Desktop with the default MySQL connector as well, following the setup guide that is displayed [here](https://www.tableau.com/support/drivers) if you select MySQL from the Data Source drop-down. If you have an M1 Mac, check [this troubleshooting thread](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) for a driver installation workaround.

## Connecting Tableau Online to ClickHouse (Cloud or on-premise setup with SSL)

As it is not possible to provide the SSL certificates via the Tableau Online MySQL connection setup wizard, 
the only way is to use Tableau Desktop to set the connection up, and then export it to Tableau Online. This process is, however, pretty straightforward.

Run Tableau Desktop on a Windows or Mac machine, and select "Connect" -> "To a Server" -> "MySQL".
Likely, it will be required to install the MySQL driver on your machine first. 
You can do that by following the setup guide that is displayed [here](https://www.tableau.com/support/drivers) if you select MySQL from the Data Source drop-down. 
If you have an M1 Mac, check [this troubleshooting thread](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) for a driver installation workaround.

<img src={require('./images/tableau_desktop_01.png').default} class="image" alt="Create a new data source" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

In the MySQL connection setup UI, make sure that the "SSL" option is enabled. 
ClickHouse Cloud's SSL certificate is signed by [LetsEncrypt](https://letsencrypt.org/certificates/). 
You can download this root cert [here](https://letsencrypt.org/certs/isrgrootx1.pem).

Provide your ClickHouse Cloud instance MySQL user credentials and the path to the downloaded root certificate.

<img src={require('./images/tableau_desktop_02.png').default} class="image" alt="Specifying your credentials" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Choose the desired tables as usual (similarly to Tableau Online), 
and select "Server" -> "Publish Data Source" -> Tableau Cloud.

<img src={require('./images/tableau_desktop_03.png').default} class="image" alt="Publish data source" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

IMPORTANT: you need to select "Embedded password" in "Authentication" options.

<img src={require('./images/tableau_desktop_04.png').default} class="image" alt="Data source publishing settings - embedding your credentials" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Additionally, choose "Update workbook to use the published data source".

<img src={require('./images/tableau_desktop_05.png').default} class="image" alt="Data source publishing settings - updating the workbook for online usage" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Finally, click "Publish", and your datasource with embedded credentials will be opened automatically in Tableau Online, ready to use with ClickHouse Cloud there.


## Known limitations (ClickHouse 23.10)

* Aggregation/filtering by week number does not work. Should be resolved after [#55308](https://github.com/ClickHouse/ClickHouse/issues/55308).
* Aggregation/filtering by quarter does not work. Should be resolved after [#55993](https://github.com/ClickHouse/ClickHouse/issues/55993)

If you encounter any other incompatibilities, please do not hesitate to [contact us](https://clickhouse.com/company/contact) or create a [new issue](https://github.com/ClickHouse/ClickHouse/issues).