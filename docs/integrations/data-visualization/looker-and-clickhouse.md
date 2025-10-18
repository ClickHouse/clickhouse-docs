---
sidebar_label: 'Looker'
slug: /integrations/looker
keywords: ['clickhouse', 'looker', 'connect', 'integrate', 'ui']
description: 'Looker is an enterprise platform for BI, data applications, and embedded analytics that helps you explore and share insights in real time.'
title: 'Looker'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Looker

<PartnerBadge/>

Looker can connect to ClickHouse Cloud or on-premise deployment via the official ClickHouse data source.

## 1. Gather your connection details {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Create a ClickHouse data source {#2-create-a-clickhouse-data-source}

Navigate to Admin -> Database -> Connections and click the "Add Connection" button in the top right corner.

<Image size="md" img={looker_01} alt="Adding a new connection in Looker's database management interface" border />
<br/>

Choose a name for your data source, and select `ClickHouse` from the dialect drop-down. Enter your credentials in the form.

<Image size="md" img={looker_02} alt="Specifying your ClickHouse credentials in Looker connection form" border />
<br/>

If you are using ClickHouse Cloud or your deployment requires SSL, make sure you have SSL turned on in the additional settings.

<Image size="md" img={looker_03} alt="Enabling SSL for ClickHouse connection in Looker settings" border />
<br/>

Test your connection first, and, once it is done, connect to your new ClickHouse data source.

<Image size="md" img={looker_04} alt="Testing and connecting to the ClickHouse data source" border />
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
