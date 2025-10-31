---
title: 'Resyncing a Database ClickPipe'
description: 'Doc for resyncing a database ClickPipe'
slug: /integrations/clickpipes/mysql/resync
sidebar_label: 'Resync ClickPipe'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### What does Resync do? {#what-mysql-resync-do}

Resync involves the following operations in order:

1. The existing ClickPipe is dropped, and a new "resync" ClickPipe is kicked off. Thus, changes to source table structures will be picked up when you resync.
2. The resync ClickPipe creates (or replaces) a new set of destination tables which have the same names as the original tables except with a `_resync` suffix.
3. Initial load is performed on the `_resync` tables.
4. The `_resync` tables are then swapped with the original tables. Soft deleted rows are transferred from the original tables to the `_resync` tables before the swap.

All the settings of the original ClickPipe are retained in the resync ClickPipe. The statistics of the original ClickPipe are cleared in the UI.

### Use cases for resyncing a ClickPipe {#use-cases-mysql-resync}

Here are a few scenarios:

1. You may need to perform major schema changes on the source tables which would break the existing ClickPipe and you would need to restart. You can just click Resync after performing the changes.
2. Specifically for Clickhouse, maybe you needed to change the ORDER BY keys on the target tables. You can Resync to re-populate data into the new table with the right sorting key.

:::note
You can resync multiple times, however please account for the load on the source database when you resync.
:::

### Resync ClickPipe Guide {#guide-mysql-resync}

1. In the Data Sources tab, click on the MySQL ClickPipe you wish to resync.
2. Head over to the **Settings** tab.
3. Click on the **Resync** button.

<Image img={resync_button} border size="md"/>

4. A dialog box should appear for confirmation. Click on Resync again.
5. Head over to the **Metrics** tab.
6. In around 5 seconds (and also on page refresh), the status of the pipe should be **Setup** or **Snapshot**.
7. The initial load of the resync can be monitored in the **Tables** tab - in the **Initial Load Stats** section.
8. Once the initial load is complete, the pipe will atomically swap the `_resync` tables with the original tables. During the swap, the status will be **Resync**.
9. Once the swap is complete, the pipe will enter the **Running** state and perform CDC if enabled.
