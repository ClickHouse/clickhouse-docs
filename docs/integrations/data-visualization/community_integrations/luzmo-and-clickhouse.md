---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo is an embedded analytics platform with a native ClickHouse integration, purpose-built for Software and SaaS applications.'
title: 'Integrating Luzmo with ClickHouse'
sidebar: 'integrations'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Integrating Luzmo with ClickHouse

<CommunityMaintainedBadge/>

## 1. Setup a ClickHouse connection {#1-setup-a-clickhouse-connection}

To make a connection to ClickHouse, navigate to the **Connections page**, select **New Connection**, then select the ClickHouse from the New Connection modal.

<Image img={luzmo_01} size="md" alt="Luzmo interface showing the Create a New Connection dialog with ClickHouse selected" border />

You'll be asked to provide a **host**, **username** and **password**:

<Image img={luzmo_02} size="md" alt="Luzmo connection configuration form showing fields for ClickHouse host, username and password" border />

*   **Host**: this is the host where your ClickHouse database is exposed. Note that only `https` is allowed here in order to securely transfer data over the wire. The structure of the host url expects: `https://url-to-clickhouse-db:port/database`
    By default, the plugin will connect to the 'default' database and the 443 port. By providing a database after the '/' you can configure which database to connect to.
*   **Username**: the username that will be used to connect to your ClickHouse cluster.
*   **Password**: the password to connect to your ClickHouse cluster

Please refer to the examples in our developer documentation to find out how to [create a connection to ClickHouse](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody) via our API.

## 2. Add datasets {#2-add-datasets}

Once you have connected your ClickHouse you can add datasets as explained [here](https://academy.luzmo.com/article/ldx3iltg). You can select one or multiple datasets as available in your ClickHouse and [link](https://academy.luzmo.com/article/gkrx48x5) them in Luzmo to ensure they can be used together in a dashboard. Also make sure to check out this article on [Preparing your data for analytics](https://academy.luzmo.com/article/u492qov0).

To find out how to add datasets using our API, please refer to [this example in our developer documentation](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody).

You can now use your datasets to build beautiful (embedded) dashboards, or even power an AI Data Analyst ([Luzmo IQ](https://luzmo.com/iq)) that can answer your clients' questions.

<Image img={luzmo_03} size="md" alt="Luzmo dashboard example showing multiple visualizations of data from ClickHouse" border />

## Usage notes {#usage-notes}

1. The Luzmo ClickHouse connector uses the HTTP API interface (typically running on port 8123) to connect.
2. If you use tables with the `Distributed` table engine some Luzmo-charts might fail when `distributed_product_mode` is `deny`. This should only occur, however, if you link the table to another table and use that link in a chart. In that case make sure to set the `distributed_product_mode` to another option that makes sense for you within your ClickHouse cluster. If you are using ClickHouse Cloud you can safely ignore this setting.
3. To ensure that e.g. only the Luzmo application can access your ClickHouse instance, it is highly recommended to **whitelist** the [Luzmo range of static IP addresses](https://academy.luzmo.com/article/u9on8gbm). We also recommend using a technical read-only user.
4. The ClickHouse connector currently supports following data types:

    | ClickHouse Type | Luzmo Type |
    | --- | --- |
    | UInt | numeric |
    | Int | numeric |
    | Float | numeric |
    | Decimal | numeric |
    | Date | datetime |
    | DateTime | datetime |
    | String | hierarchy |
    | Enum | hierarchy |
    | FixedString | hierarchy |
    | UUID | hierarchy |
    | Bool | hierarchy |
