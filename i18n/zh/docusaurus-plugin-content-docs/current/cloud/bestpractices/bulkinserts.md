---
slug: /cloud/bestpractices/bulk-inserts
sidebar_position: 63
sidebar_label: 使用批量插入
title: 批量插入
---

## 批量导入数据 {#ingest-data-in-bulk}
默认情况下，发送到 ClickHouse 的每个插入操作都会导致 ClickHouse 立即在存储中创建一个包含插入数据及其他需要存储的元数据的部分。因此，与发送大量每个数据量较少的插入相比，发送较少的每个包含更多数据的插入将减少所需的写入次数。通常，我们建议一次插入至少 1,000 行数据，理想情况下为 10,000 到 100,000 行。为此，可以考虑实施缓冲机制，例如使用 [Buffer table Engine](/engines/table-engines/special/buffer.md) 以启用批量插入，或使用异步插入（请参见 [asynchronous inserts](/cloud/bestpractices/asyncinserts.md)）。

:::tip
无论插入的大小如何，我们建议将插入查询的数量保持在每秒大约一个插入查询。
这样推荐的原因是，创建的部分会在后台合并成更大的部分（以优化数据以便进行读取查询），而每秒发送过多的插入查询可能会导致后台合并无法跟上新部分的数量。
然而，当使用异步插入时（请参见 [asynchronous inserts](/cloud/bestpractices/asyncinserts.md)），可以使用更高的插入查询速率。
:::
