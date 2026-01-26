---
title: 'Removing specific tables from a ClickPipe'
description: 'Removing specific tables from a ClickPipe'
sidebar_label: 'Remove table'
slug: /integrations/clickpipes/mongodb/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

In some cases, it makes sense to exclude specific tables from a MongoDB ClickPipe - for example, if a table isn't needed for your analytics workload, skipping it can reduce storage and replication costs in ClickHouse.

## Steps to remove specific tables {#remove-tables-steps}

The first step is to remove the table from the pipe. This can be done by the following steps:

1. [Pause](./pause_and_resume.md) the pipe.
2. Click on Edit Table Settings.
3. Locate your table - this can be done by searching it in the search bar.
4. Deselect the table by clicking on the selected checkbox.
<br/>

<Image img={remove_table} border size="md"/>

5. Click update.
6. Upon successful update, in the **Metrics** tab the status will be **Running**. This table will no longer be replicated by this ClickPipe.
