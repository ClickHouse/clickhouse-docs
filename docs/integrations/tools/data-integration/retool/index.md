---
sidebar_label: 'Retool'
slug: /integrations/retool
keywords: ['clickhouse', 'retool', 'connect', 'integrate', 'ui', 'admin', 'panel', 'dashboard', 'nocode', 'no-code']
description: 'Quickly build web and mobile apps with rich user interfaces, automate complex tasks, and integrate AI—all powered by your data.'
title: 'Connecting Retool to ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_integration'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import retool_01 from '@site/static/images/integrations/tools/data-integration/retool/retool_01.png';
import retool_02 from '@site/static/images/integrations/tools/data-integration/retool/retool_02.png';
import retool_03 from '@site/static/images/integrations/tools/data-integration/retool/retool_03.png';
import retool_04 from '@site/static/images/integrations/tools/data-integration/retool/retool_04.png';
import retool_05 from '@site/static/images/integrations/tools/data-integration/retool/retool_05.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Connecting Retool to ClickHouse

<CommunityMaintainedBadge/>

## 1. Gather your connection details {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Create a ClickHouse resource {#2-create-a-clickhouse-resource}

Login to your Retool account and navigate to the _Resources_ tab. Choose "Create New" -> "Resource":

<Image img={retool_01} size="lg" border alt="Creating a new resource" />
<br/>

Select "JDBC" from the list of available connectors:

<Image img={retool_02} size="lg" border alt="Choosing JDBC connector" />
<br/>

In the setup wizard, make sure you select `com.clickhouse.jdbc.ClickHouseDriver` as the "Driver name":

<Image img={retool_03} size="lg" border alt="Selecting the right driver" />
<br/>

Fill in your ClickHouse credentials in the following format: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`.
If your instance requires SSL or you are using ClickHouse Cloud, add `&ssl=true` to the connection string, so it looks like `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`

<Image img={retool_04} size="lg" border alt="Specifying your credentials" />
<br/>

After that, test your connection:

<Image img={retool_05} size="lg" border alt="Testing your connection" />
<br/>

Now, you should be able to proceed to your app using your ClickHouse resource.
