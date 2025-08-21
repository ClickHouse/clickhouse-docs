---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: /integrations/tableau-online
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau Online streamlines the power of data to make people faster and more confident decision makers from anywhere.'
title: 'Tableau Online'
doc_type: 'explanation'
---

import MySQLCloudSetup from '@site/docs/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/docs/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import Image from '@theme/IdealImage';
import tableau_online_01 from '@site/static/images/integrations/data-visualization/tableau_online_01.png';
import tableau_online_02 from '@site/static/images/integrations/data-visualization/tableau_online_02.png';
import tableau_online_03 from '@site/static/images/integrations/data-visualization/tableau_online_03.png';
import tableau_online_04 from '@site/static/images/integrations/data-visualization/tableau_online_04.png';
import tableau_desktop_01 from '@site/static/images/integrations/data-visualization/tableau_desktop_01.png';
import tableau_desktop_02 from '@site/static/images/integrations/data-visualization/tableau_desktop_02.png';
import tableau_desktop_03 from '@site/static/images/integrations/data-visualization/tableau_desktop_03.png';
import tableau_desktop_04 from '@site/static/images/integrations/data-visualization/tableau_desktop_04.png';
import tableau_desktop_05 from '@site/static/images/integrations/data-visualization/tableau_desktop_05.png';

# Tableau Online

Tableau Online can connect to ClickHouse Cloud or on-premise ClickHouse setup via MySQL interface using the official MySQL data source.

## ClickHouse Cloud setup {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## On-premise ClickHouse server setup {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Connecting Tableau Online to ClickHouse (on-premise without SSL) {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

Login to your Tableau Cloud site and add a new Published Data Source.

<Image size="md" img={tableau_online_01} alt="Tableau Online interface showing the 'New' button to create a published data source" border />
<br/>

Select "MySQL" from the list of available connectors.

<Image size="md" img={tableau_online_02} alt="Tableau Online connector selection screen with MySQL option highlighted" border />
<br/>

Specify your connection details gathered during the ClickHouse setup.

<Image size="md" img={tableau_online_03} alt="Tableau Online MySQL connection configuration screen with server, port, database and credential fields" border />
<br/>

Tableau Online will introspect the database and provide a list of available tables. Drag the desired table to the canvas on the right. Additionally, you can click "Update Now" to preview the data, as well as fine-tune the introspected field types or names.

<Image size="md" img={tableau_online_04} alt="Tableau Online data source page showing database tables on the left and canvas on the right with drag-and-drop functionality" border />
<br/>

After that, all that remains is to click "Publish As" in the top right corner, and you should be able to use a newly created dataset in Tableau Online as usual.

NB: if you want to use Tableau Online in combination with Tableau Desktop and share ClickHouse datasets between them, make sure you use Tableau Desktop with the default MySQL connector as well, following the setup guide that is displayed [here](https://www.tableau.com/support/drivers) if you select MySQL from the Data Source drop-down. If you have an M1 Mac, check [this troubleshooting thread](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) for a driver installation workaround.

## Connecting Tableau Online to ClickHouse (cloud or on-premise setup with SSL) {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

As it is not possible to provide the SSL certificates via the Tableau Online MySQL connection setup wizard, 
the only way is to use Tableau Desktop to set the connection up, and then export it to Tableau Online. This process is, however, pretty straightforward.

Run Tableau Desktop on a Windows or Mac machine, and select "Connect" -> "To a Server" -> "MySQL".
Likely, it will be required to install the MySQL driver on your machine first. 
You can do that by following the setup guide that is displayed [here](https://www.tableau.com/support/drivers) if you select MySQL from the Data Source drop-down. 
If you have an M1 Mac, check [this troubleshooting thread](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) for a driver installation workaround.

<Image size="md" img={tableau_desktop_01} alt="Tableau Desktop interface showing the Connect menu with MySQL option highlighted" border />
<br/>

:::note
In the MySQL connection setup UI, make sure that the "SSL" option is enabled. 
ClickHouse Cloud's SSL certificate is signed by [Let's Encrypt](https://letsencrypt.org/certificates/). 
You can download this root cert [here](https://letsencrypt.org/certs/isrgrootx1.pem).
:::

Provide your ClickHouse Cloud instance MySQL user credentials and the path to the downloaded root certificate.

<Image size="sm" img={tableau_desktop_02} alt="Tableau Desktop MySQL connection dialog with SSL option enabled and fields for server, username, password and certificate" border />
<br/>

Choose the desired tables as usual (similarly to Tableau Online), 
and select "Server" -> "Publish Data Source" -> Tableau Cloud.

<Image size="md" img={tableau_desktop_03} alt="Tableau Desktop showing Server menu with Publish Data Source option highlighted" border />
<br/>

IMPORTANT: you need to select "Embedded password" in "Authentication" options.

<Image size="md" img={tableau_desktop_04} alt="Tableau Desktop publish dialog showing Authentication options with Embedded password selected" border />
<br/>

Additionally, choose "Update workbook to use the published data source".

<Image size="sm" img={tableau_desktop_05} alt="Tableau Desktop publish dialog with 'Update workbook to use the published data source' option checked" border />
<br/>

Finally, click "Publish", and your datasource with embedded credentials will be opened automatically in Tableau Online.

## Known limitations (ClickHouse 23.11) {#known-limitations-clickhouse-2311}

All the known limitations has been fixed in ClickHouse `23.11`. If you encounter any other incompatibilities, please do not hesitate to [contact us](https://clickhouse.com/company/contact) or create a [new issue](https://github.com/ClickHouse/ClickHouse/issues).
