---
title: 'Adding specific tables to a ClickPipe'
description: 'Describes the steps need to add specific tables to a ClickPipe.'
sidebar_label: 'Add Table'
slug: /integrations/clickpipes/mysql/add_table
show_title: false
doc_type: how-to
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

# Adding specific tables to a ClickPipe

There are scenarios where it would be useful to add specific tables to a pipe. This becomes a common necessity as your transactional or analytical workload scales.

## Steps to add specific tables to a ClickPipe {#add-tables-steps}

This can be done by the following steps:
1. [Pause](./pause_and_resume.md) the pipe.
2. Click on Edit Table settings.
3. Locate your table - this can be done by searching it in the search bar.
4. Select the table by clicking on the checkbox.
<br/>
<Image img={add_table} border size="md"/>

5. Click update.
6. Upon successful update, the pipe will have statuses `Setup`, `Snapshot` and `Running` in that order. The table's initial load can be tracked in the **Tables** tab.
