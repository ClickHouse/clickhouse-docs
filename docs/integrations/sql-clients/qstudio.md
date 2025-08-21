---
slug: /integrations/qstudio
sidebar_label: 'QStudio'
description: 'QStudio is a free SQL tool.'
title: 'Connect QStudio to ClickHouse'
doc_type: how-to
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Connect QStudio to ClickHouse

<CommunityMaintainedBadge/>

QStudio is a free SQL GUI, it allows running SQL scripts, easy browsing of tables, charting and exporting of results. It works on every operating system, with every database.

QStudio connects to ClickHouse using JDBC.

## 1. Gather your ClickHouse details {#1-gather-your-clickhouse-details}

QStudio uses JDBC over HTTP(S) to connect to ClickHouse; you need:

- endpoint
- port number
- username
- password

<ConnectionDetails />

## 2. Download QStudio {#2-download-qstudio}

QStudio is available at https://www.timestored.com/qstudio/download/

## 3. Add a database {#3-add-a-database}

- When you first open QStudio click on the menu options **Server->Add Server** or on the add server button on the toolbar.
- Then set the details:

<Image img={qstudio_add_connection} size="lg" border alt="QStudio database connection configuration screen showing ClickHouse connection settings" />

1.   Server Type: Clickhouse.com
2.    Note for Host you MUST include https://
    Host: https://abc.def.clickhouse.cloud
    Port: 8443
3.  Username: default
    Password: `XXXXXXXXXXX`
 4. Click Add

If QStudio detects that you do not have the ClickHouse JDBC driver installed, it will offer to download them for you:

## 4. Query ClickHouse {#4-query-clickhouse}

- Open a query editor and run a query. You can run queries by
- Ctrl + e - Runs highlighted text
- Ctrl + Enter - Runs the current line

- An example query:

<Image img={qstudio_running_query} size="lg" border alt="QStudio interface showing sample SQL query execution against ClickHouse database" />

## Next steps {#next-steps}

See [QStudio](https://www.timestored.com/qstudio) to learn about the capabilities of QStudio, and the [ClickHouse documentation](https://clickhouse.com/docs) to learn about the capabilities of ClickHouse.
