---
sidebar_label:  Deepnote
sidebar_position: 11
slug: /en/integrations/deepnote
keywords: [clickhouse, Deepnote, connect, integrate, notebook]
description: Efficiently query very large datasets, analyzing and modeling in the comfort of known notebook environment.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# Connect ClickHouse to Deepnote

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> is a collaborative data notebook built for teams to discover and share insights. In addition to being Jupyter-compatible, it works in the cloud and provides you with one central place to collaborate and work on data science projects efficiently.

This guide assumes you already have a Deepnote account and that you have a running ClickHouse instance.

## Interactive example
If you would like to explore an interactive example of querying ClickHouse from Deepnote data notebooks, click the button below to  launch a template project connected to the [ClickHouse playground](../../getting-started/playground.md).

[<img src="https://deepnote.com/buttons/launch-in-deepnote.svg"/>](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## Connect to ClickHouse

1. Within Deepnote, select the "Integrations" overview and click on the ClickHouse tile.

<img src={require('./images/deepnote_01.png').default} class="image" alt="ClickHouse integration tile" style={{width: '100%'}}/>

2. Provide the connection details for your ClickHouse instance:
<ConnectionDetails />

   <img src={require('./images/deepnote_02.png').default} class="image" alt="ClickHouse details dialog" style={{width: '100%'}}/>

   **_NOTE:_** If your connection to ClickHouse is protected with an IP Access List, you might need to allow Deepnote's IP addresses. Read more about it in [Deepnote's docs](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses).
3. Congratulations! You have now integrated ClickHouse into Deepnote.

## Using ClickHouse integration.

1. Start by connecting to the ClickHouse integration on the right of your notebook.

   <img src={require('./images/deepnote_03.png').default} class="image" alt="ClickHouse details dialog" style={{width: '100%'}}/>
2. Now create a new ClickHouse query block and query your database. The query results will be saved as a dataframe and stored in the variable specified in the SQL block.
3. You can also convert any existing [SQL block](https://docs.deepnote.com/features/sql-cells) to a ClickHouse block.


