---
sidebar_label: 'Looker'
slug: /integrations/looker
keywords: ['clickhouse', 'looker', 'connect', 'integrate', 'ui']
description: 'Looker is an enterprise platform for BI, data applications, and embedded analytics that helps you explore and share insights in real time.'
title: 'Looker'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';

# Looker

Looker can connect to ClickHouse Cloud or on-premise deployment via the official ClickHouse data source.

## 1. Gather your connection details {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Create a ClickHouse data source {#2-create-a-clickhouse-data-source}

Navigate to Admin -> Database -> Connections and click the "Add Connection" button in the top right corner.

<img src={looker_01} class="image" alt="Adding a new connection" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

Choose a name for your data source, and select `ClickHouse` from the dialect drop-down. Enter your credentials in the form.

<img src={looker_02} class="image" alt="Specifying your credentials" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

If you are using ClickHouse Cloud or your deployment requires SSL, make sure you have SSL turned on in the additional settings.

<img src={looker_03} class="image" alt="Enabling SSL" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

Test your connection first, and, once it is done, connect to your new ClickHouse data source.

<img src={looker_04} class="image" alt="Enabling SSL" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

Now you should be able to attach ClickHouse Datasource to your Looker project.

## 3. Known limitations {#3-known-limitations}

1. The following data types are handled as strings by default:
   * Array - serialization does not work as expected due to the JDBC driver limitations
   * Decimal* - can be changed to number in the model
   * LowCardinality(...) - can be changed to a proper type in the model
   * Enum8, Enum16
   * UUID
   * Tuple
   * Map
   * JSON
   * Nested
   * FixedString
   * Geo types
     * MultiPolygon
     * Polygon
     * Point
     * Ring
2. [Symmetric aggregate feature](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates) is not supported
3. [Full outer join](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer) is not yet implemented in the driver