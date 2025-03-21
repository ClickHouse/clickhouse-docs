---
slug: /cloud/bestpractices/low-cardinality-partitioning-key
sidebar_label: 选择低基数分区键
title: 选择低基数分区键
---

import partitioning01 from '@site/static/images/cloud/bestpractices/partitioning-01.png';
import partitioning02 from '@site/static/images/cloud/bestpractices/partitioning-02.png';

当您向 ClickHouse Cloud 中的一个表发送插入语句（该语句应包含多行 - 请参阅 [上面的部分](/optimize/bulk-inserts)），并且该表未使用 [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md) 时，所有插入的行数据将写入存储中的一个新分区：

<img src={partitioning01}
  class="image"
  alt="没有分区键的插入 - 创建了一个分区"
  style={{width: '100%', background: 'none'}} />

然而，当您向 ClickHouse Cloud 中的一个表发送插入语句，并且该表具有分区键时，ClickHouse 将：
- 检查插入中包含的行的分区键值
- 每个不同的分区键值在存储中创建一个新的分区
- 按照分区键值将行放置在相应的分区中

<img src={partitioning02}
  class="image"
  alt="带有分区键的插入 - 基于分区键值创建多个分区"
  style={{width: '100%', background: 'none'}} />

因此，为了最小化对 ClickHouse Cloud 对象存储的写请求数量，请使用低基数分区键或避免为您的表使用任何分区键。
