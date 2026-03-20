---
slug: /sql-reference/statements/create/dictionary/layouts/cache
title: '缓存字典布局'
sidebar_label: '缓存'
sidebar_position: 6
description: '在固定大小的内存缓存中存储字典。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

`cached` 字典布局类型会将字典存储在具有固定数量单元格的缓存中。
这些单元格包含经常使用的元素。

字典键的类型是 [UInt64](/sql-reference/data-types/int-uint.md)。

在查找字典时，首先会搜索缓存。对于每个数据块，所有在缓存中未找到或已过期的键会通过 `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)` 向源请求。接收到的数据随后会写入缓存。

如果在字典中未找到键，则会创建更新缓存任务并将其加入更新队列。可以通过 `max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates` 这些设置控制更新队列属性。

对于缓存字典，可以设置缓存中数据的过期 [lifetime](../lifetime.md)。如果自单元格中数据加载以来已经过去的时间超过 `lifetime`，则不会使用该单元格的值，并且该键会变为过期状态。下次需要使用该键时会重新请求。可以通过设置 `allow_read_expired_keys` 配置此行为。

这是所有存储字典方式中效率最低的一种。缓存速度强烈依赖于正确的设置和使用场景。仅当命中率足够高时（建议 99% 及以上），缓存类型的字典才会有良好表现。可以在 [system.dictionaries](/operations/system-tables/dictionaries.md) 表中查看平均命中率。

如果将设置 `allow_read_expired_keys` 设为 1（默认值为 0），则字典可以支持异步更新。如果客户端请求了一组键，这些键都在缓存中，但其中一些已过期，则字典会向客户端返回这些过期键，并从源端异步请求它们。

为了提升缓存性能，请在子查询中使用 `LIMIT`，并在外部调用字典函数。

支持所有类型的源。

设置示例：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <layout>
        <cache>
            <!-- 缓存的大小，以单元格个数表示。向上取整到 2 的幂。 -->
            <size_in_cells>1000000000</size_in_cells>
            <!-- 允许读取已过期的键。 -->
            <allow_read_expired_keys>0</allow_read_expired_keys>
            <!-- 更新队列的最大大小。 -->
            <max_update_queue_size>100000</max_update_queue_size>
            <!-- 将更新任务推入队列的最大超时时间（毫秒）。 -->
            <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
            <!-- 等待更新任务完成的最大超时时间（毫秒）。 -->
            <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
            <!-- 缓存字典更新的最大线程数。 -->
            <max_threads_for_updates>4</max_threads_for_updates>
        </cache>
    </layout>
    ```
  </TabItem>
</Tabs>

<br />

请设置足够大的缓存大小。需要通过试验选择单元格数量：

1. 设定一个值。
2. 运行查询，直到缓存完全填满。
3. 使用 `system.dictionaries` 表评估内存消耗。
4. 增加或减少单元格数量，直到达到所需的内存消耗。

:::note
不推荐使用 ClickHouse 作为此布局的源。字典查找需要随机点读，这并不是 ClickHouse 所优化的访问模式。
:::
