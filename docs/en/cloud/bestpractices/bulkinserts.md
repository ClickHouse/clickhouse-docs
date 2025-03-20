---
slug: /en/cloud/bestpractices/bulk-inserts
sidebar_position: 63
sidebar_label: Use Bulk Inserts
title: Bulk Inserts
---


## Ingest data in bulk
By default, each insert sent to ClickHouse causes ClickHouse to immediately create a part on storage containing the data from the insert together with other metadata that needs to be stored.
Therefore sending a smaller amount of inserts that each contain more data, compared to sending a larger amount of inserts that each contain less data, will reduce the number of writes required. Generally, we recommend inserting data in fairly large batches of at least 1,000 rows at a time, and ideally between 10,000 to 100,000 rows. To achieve this, consider implementing a buffer mechanism such as using the [Buffer table Engine](/docs/en/engines/table-engines/special/buffer.md) to enable batch inserts, or use asynchronous inserts (see [asynchronous inserts](/docs/en/cloud/bestpractices/asyncinserts.md)).

:::tip
Regardless of the size of your inserts, we recommend keeping the number of insert queries around one insert query per second.
The reason for that recommendation is that the created parts are merged to larger parts in the background (in order to optimize your data for read queries), and sending too many insert queries per second can lead to situations where the background merging can't keep up with the number of new parts.
However, you can use a higher rate of insert queries per second when you use asynchronous inserts (see [asynchronous inserts](/docs/en/cloud/bestpractices/asyncinserts.md)).
:::
