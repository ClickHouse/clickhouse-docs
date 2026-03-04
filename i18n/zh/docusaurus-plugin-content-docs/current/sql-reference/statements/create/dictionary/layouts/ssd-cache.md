---
slug: /sql-reference/statements/create/dictionary/layouts/ssd-cache
title: 'ssd_cache 字典布局类型'
sidebar_label: 'ssd_cache'
sidebar_position: 8
description: '在 SSD 上存储字典数据，并在内存中维护索引：ssd_cache 或 complex_key_ssd_cache 类型'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## ssd_cache \{#ssd_cache\}

类似于 `cache`，但将数据存储在 SSD 上，并将索引存储在 RAM 中。所有与更新队列相关的缓存字典设置均同样适用于 SSD 缓存字典。

字典键的类型为 [UInt64](/sql-reference/data-types/int-uint.md)。

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```

</TabItem>
<TabItem value="xml" label="配置文件">

```xml
<layout>
    <ssd_cache>
        <!-- 以字节为单位的基本读取块大小。建议与 SSD 的页面大小相同。 -->
        <block_size>4096</block_size>
        <!-- 以字节为单位的最大缓存文件大小。 -->
        <file_size>16777216</file_size>
        <!-- 以字节为单位，用于从 SSD 读取元素的 RAM 缓冲区大小。 -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- 以字节为单位，用于在刷写到 SSD 之前聚合元素的 RAM 缓冲区大小。 -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- 缓存文件的存储路径。 -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_ssd_cache \{#complex_key_ssd_cache\}

此类存储用于复合[键](../attributes.md#composite-key)。类似于 `ssd_cache`。