---
title: "Adding specific tables to a ClickPipe"
slug: /en/integrations/clickpipes/postgres/add_table
---

There are scenarios where it would be useful to add specific tables to a pipe. This becomes a common necessity as your transactional or analytical workload scales.

## Steps to add specific tables
This can be done by the following steps:
1. [Pause](./pause_and_resume#steps-to-pause-a-postgres-clickpipe) the pipe.
2. Click on Edit Table settings.
3. Locate your table - this can be done by searching it in the search bar.
4. Select the table by clicking on the checkbox.
<br/>
![Add table](./images/add_table.png)

5. Click update.
6. Upon successful update, the pipe will have statuses Setup, Snapshot and Running in that order. The table's initial load can be tracked in the **Tables** tab.
