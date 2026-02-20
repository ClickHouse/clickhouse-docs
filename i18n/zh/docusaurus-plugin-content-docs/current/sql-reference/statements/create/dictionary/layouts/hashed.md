---
slug: /sql-reference/statements/create/dictionary/layouts/hashed
title: 'hashed 字典布局类型'
sidebar_label: 'hashed'
sidebar_position: 3
description: '使用哈希表在内存中将字典存储为：hashed、sparse_hashed、complex_key_hashed、complex_key_sparse_hashed 布局'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## hashed \{#hashed\}

字典以哈希表的形式完全存储在内存中。字典可以包含任意数量、具有任意标识符的元素。实际使用中，键的数量可以达到数千万级。

字典键的类型为 [UInt64](../../../data-types/int-uint.md)。

支持所有类型的数据源。更新时会完整读取数据（从文件或表中）。

配置示例：

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(HASHED())
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <hashed />
</layout>
```

</TabItem>
</Tabs>

<br/>

带 `settings` 的配置示例：

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <hashed>
    <!-- 如果 shards 大于 1（默认值为 `1`），字典将并行加载数据，
         适用于单个字典包含大量元素的场景。 -->
    <shards>10</shards>

    <!-- 并行队列中数据块的 backlog 长度。

         由于并行加载中的瓶颈在于 rehash，因此为了避免因为某个线程在执行
         rehash 而导致阻塞，你需要保留一定的 backlog。

         10000 是内存占用与速度之间的良好平衡。
         即便对于 10e10 个元素，也能在不出现线程饥饿的情况下处理全部负载。 -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- 哈希表的最大负载因子，值越大，内存利用率越高（浪费的内存越少），
         但读取性能可能会下降。

         合法取值: [0.5, 0.99]
         默认值: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

</TabItem>
</Tabs>

<br/>

## sparse_hashed \{#sparse_hashed\}

类似于 `hashed`，但在节省内存的同时会消耗更多 CPU 资源。

字典键的类型为 [UInt64](../../../data-types/int-uint.md)。

配置示例：

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="配置文件">

```xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </sparse_hashed>
</layout>
```

</TabItem>
</Tabs>

<br/>

对于这种类型的字典，也可以使用 `shards`；并且由于 `sparse_hashed` 更慢，相比于 `hashed`，`shards` 对 `sparse_hashed` 更为重要。

## complex_key_hashed \{#complex_key_hashed\}

这种存储类型用于复合[键](../keys-and-fields.md#dictionary-key-and-fields)，类似于 `hashed`。

配置示例：

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <complex_key_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_hashed>
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_sparse_hashed \{#complex_key_sparse_hashed\}

此存储类型用于复合[键](../keys-and-fields.md#dictionary-key-and-fields)。类似于 [sparse_hashed](#sparse_hashed)。

配置示例：

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <complex_key_sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_sparse_hashed>
</layout>
```

</TabItem>
</Tabs>

<br/>