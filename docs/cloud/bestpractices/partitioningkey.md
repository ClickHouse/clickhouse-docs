---
slug: /cloud/bestpractices/low-cardinality-partitioning-key
sidebar_label: 'Choose a Low Cardinality Partitioning Key'
title: 'Choose a Low Cardinality Partitioning Key'
description: 'Page describing why you should choose a low cardinality partitioning key as a best practice'
---

import partitioning01 from '@site/static/images/cloud/bestpractices/partitioning-01.png';
import partitioning02 from '@site/static/images/cloud/bestpractices/partitioning-02.png';

# Choose a Low Cardinality Partitioning Key

When you send an insert statement (that should contain many rows - see [section above](/optimize/bulk-inserts)) to a table in ClickHouse Cloud, and that
table is not using a [partitioning key](/engines/table-engines/mergetree-family/custom-partitioning-key.md) then all row data from that insert is written into a new part on storage:

<img src={partitioning01}
  class="image"
  alt="Insert without partitioning key - one part created"
  style={{width: '100%', background: 'none'}} />

However, when you send an insert statement to a table in ClickHouse Cloud, and that table has a partitioning key, then ClickHouse:
- checks the partitioning key values of the rows contained in the insert
- creates one new part on storage per distinct partitioning key value
- places the rows in the corresponding parts by partitioning key value

<img src={partitioning02}
  class="image"
  alt="Insert with partitioning key - multiple parts created based on partitioning key values"
  style={{width: '100%', background: 'none'}} />

Therefore, to minimize the number of write requests to the ClickHouse Cloud object storage, use a low cardinality partitioning key or avoid using any partitioning key for your table.
