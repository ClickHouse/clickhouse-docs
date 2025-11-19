---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', 'connect', 'integrate', 'notebook']
description: 'Efficiently query very large datasets, analyzing and modeling in the comfort of known notebook environment.'
title: 'Connect ClickHouse to Deepnote'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
  - website: 'https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';

# Connect ClickHouse to Deepnote

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> is a collaborative data notebook built for teams to discover and share insights. In addition to being Jupyter-compatible, it works in the cloud and provides you with one central place to collaborate and work on data science projects efficiently.

This guide assumes you already have a Deepnote account and that you have a running ClickHouse instance.

## Interactive example {#interactive-example}
If you would like to explore an interactive example of querying ClickHouse from Deepnote data notebooks, click the button below to  launch a template project connected to the [ClickHouse playground](../../../getting-started/playground.md).

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="Launch in Deepnote" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## Connect to ClickHouse {#connect-to-clickhouse}

1. Within Deepnote, select the "Integrations" overview and click on the ClickHouse tile.

<Image size="lg" img={deepnote_01} alt="ClickHouse integration tile" border />

2. Provide the connection details for your ClickHouse instance:
<ConnectionDetails />

   <Image size="md" img={deepnote_02} alt="ClickHouse details dialog" border />

   **_NOTE:_** If your connection to ClickHouse is protected with an IP Access List, you might need to allow Deepnote's IP addresses. Read more about it in [Deepnote's docs](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses).

3. Congratulations! You have now integrated ClickHouse into Deepnote.

## Using ClickHouse integration. {#using-clickhouse-integration}

1. Start by connecting to the ClickHouse integration on the right of your notebook.

   <Image size="lg" img={deepnote_03} alt="ClickHouse details dialog" border />

2. Now create a new ClickHouse query block and query your database. The query results will be saved as a DataFrame and stored in the variable specified in the SQL block.
3. You can also convert any existing [SQL block](https://docs.deepnote.com/features/sql-cells) to a ClickHouse block.
