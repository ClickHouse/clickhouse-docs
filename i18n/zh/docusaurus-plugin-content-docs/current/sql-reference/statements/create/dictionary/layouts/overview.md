---
description: '字典布局类型，用于在内存中存储字典'
sidebar_label: '概览'
sidebar_position: 1
slug: /sql-reference/statements/create/dictionary/layouts
title: '字典布局'
doc_type: 'reference'
---

import CloudDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## 字典布局类型 \{#storing-dictionaries-in-memory\}

将字典存储在内存中有多种方式，每种方式在 CPU 和内存使用上都有取舍。

| 布局 | 描述 |
|---|---|
| [flat](./flat.md) | 将数据存储在按键索引的扁平数组中。查询速度最快，但键必须为 `UInt64`，且受 `max_array_size` 限制。 |
| [hashed](./hashed.md) | 将数据存储在哈希表中。没有键大小限制，支持任意数量的元素。 |
| [sparse_hashed](./hashed.md#sparse_hashed) | 类似 `hashed`，但以更多 CPU 开销换取更低的内存占用。 |
| [complex_key_hashed](./hashed.md#complex_key_hashed) | 类似 `hashed`，用于复合键。 |
| [complex_key_sparse_hashed](./hashed.md#complex_key_sparse_hashed) | 类似 `sparse_hashed`，用于复合键。 |
| [hashed_array](./hashed-array.md) | 属性存储在数组中，通过哈希表将键映射到数组索引。对于属性数量较多的场景，内存利用率更高。 |
| [complex_key_hashed_array](./hashed-array.md#complex_key_hashed_array) | 类似 `hashed_array`，用于复合键。 |
| [range_hashed](./range-hashed.md) | 带有有序范围的哈希表。支持按键 + 日期/时间范围进行查找。 |
| [complex_key_range_hashed](./range-hashed.md#complex_key_range_hashed) | 类似 `range_hashed`，用于复合键。 |
| [cache](./cache.md) | 固定大小的内存缓存。仅存储被频繁访问的键。 |
| [complex_key_cache](./complex-key-cache.md) | 类似 `cache`，用于复合键。 |
| [ssd_cache](./ssd-cache.md) | 类似 `cache`，但将数据存储在 SSD 上，并在内存中维护索引。 |
| [complex_key_ssd_cache](./ssd-cache.md#complex_key_ssd_cache) | 类似 `ssd_cache`，用于复合键。 |
| [direct](./direct.md) | 无内存存储——每次请求都直接查询数据源。 |
| [complex_key_direct](./direct.md#complex_key_direct) | 类似 `direct`，用于复合键。 |
| [ip_trie](./ip-trie.md) | 用于快速 IP 前缀（基于 CIDR）查找的 Trie 结构。 |

:::tip 推荐布局
[flat](./flat.md)、[hashed](./hashed.md) 和 [complex_key_hashed](./hashed.md#complex_key_hashed) 提供最佳查询性能。
不推荐使用缓存型布局，因为其可能具有较差的性能且参数调优困难——详情参见 [cache](./cache.md)。
:::

## 指定字典布局 \{#specify-dictionary-layout\}

<CloudDetails />

可以使用 `LAYOUT` 子句（用于 DDL）或在配置文件定义中通过 `layout` 设置来配置字典布局。

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- layout settings
...
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- layout settings -->
            </layout_type>
        </layout>
        ...
    </dictionary>
</clickhouse>
```

</TabItem>
</Tabs>

<br/>

另请参阅 [CREATE DICTIONARY](../index.md) 以获取完整的 DDL 语法。

布局名称中不包含单词 `complex-key*` 的字典，其键的类型为 [UInt64](../../../data-types/int-uint.md)；`complex-key*` 字典则具有复合键（复杂键，支持任意类型的组合）。

**数值键示例**（列 key_column 的类型为 [UInt64](../../../data-types/int-uint.md)）：

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY dict_name (
    key_column UInt64,
    ...
)
PRIMARY KEY key_column
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<structure>
    <id>
        <name>key_column</name>
    </id>
    ...
</structure>
```

</TabItem>
</Tabs>

<br/>

**复合键示例**（key 仅包含一个元素，类型为 [String](../../../data-types/string.md)）：

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY dict_name (
    country_code String,
    ...
)
PRIMARY KEY country_code
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<structure>
    <key>
        <attribute>
            <name>country_code</name>
            <type>String</type>
        </attribute>
    </key>
    ...
</structure>
```

</TabItem>
</Tabs>

## 提升字典性能 \{#improve-performance\}

有多种方式可以提升字典性能：

- 在 `GROUP BY` 之后再调用用于处理字典的函数。
- 将要提取的属性标记为单射属性。
  如果不同的键对应不同的属性值，则该属性称为单射。
  因此，当 `GROUP BY` 使用按键获取属性值的函数时，此函数会自动从 `GROUP BY` 子句中被提取出来单独执行。

ClickHouse 在发生与字典相关的错误时会抛出异常。
错误示例包括：

- 无法加载正在访问的字典。
- 查询 `cached` 字典时出错。

可以在 [system.dictionaries](../../../../operations/system-tables/dictionaries.md) 表中查看字典列表及其状态。