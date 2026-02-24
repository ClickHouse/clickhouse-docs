---
slug: /sql-reference/statements/create/dictionary/layouts/flat
title: 'flat 字典布局'
sidebar_label: '扁平'
sidebar_position: 2
description: '将字典以扁平数组的形式存储在内存中。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

使用 `flat` 布局时，字典以扁平数组的形式完全存储在内存中。
所使用的内存量与最大键（其占用空间）的大小成正比。

:::tip
这种布局类型在所有可用的字典存储方式中性能最佳。
:::

字典键的类型为 [UInt64](../../../data-types/int-uint.md)，并且键值受 `max_array_size` 限制（默认值为 500,000）。
如果在创建字典时发现更大的键，ClickHouse 会抛出异常并且不会创建该字典。
字典扁平数组的初始大小由 `initial_array_size` 设置控制（默认值为 1024）。

支持所有类型的数据源。
在更新字典时，会一次性完整读取数据（来自文件或表）。

配置示例：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <layout>
      <flat>
        <initial_array_size>50000</initial_array_size>
        <max_array_size>5000000</max_array_size>
      </flat>
    </layout>
    ```
  </TabItem>
</Tabs>

<br />
