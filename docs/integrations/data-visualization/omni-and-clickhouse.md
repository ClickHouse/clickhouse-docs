---
sidebar_label: Omni
slug: /integrations/omni
keywords: [clickhouse, Omni, connect, integrate, ui]
description: Omni is an enterprise platform for BI, data applications, and embedded analytics that helps you explore and share insights in real time.
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';

# Omni

Omni can connect to ClickHouse Cloud or on-premise deployment via the official ClickHouse data source.

## 1. Gather your connection details {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Create a ClickHouse data source {#2-create-a-clickhouse-data-source}

Navigate to Admin -> Connections and click the "Add Connection" button in the top right corner.

<img src={omni_01} class="image" alt="Adding a new connection" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

Select `ClickHouse`. Enter your credentials in the form.

<img src={omni_02} class="image" alt="Specifying your credentials" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

Now you should can query and visualize data from ClickHouse in Omni.
