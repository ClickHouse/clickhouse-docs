---
slug: /sql-reference/statements/create/dictionary/layouts/hashed-array
title: 'hashed_array 字典布局类型'
sidebar_label: 'hashed_array'
sidebar_position: 4
description: '使用带属性数组的哈希表在内存中存储字典。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## hashed_array \{#hashed_array\}

字典完全驻留在内存中。每个属性都存储在一个数组中。键属性以哈希表的形式存储，其中的值是属性数组中的索引。字典可以包含任意数量、任意标识符的元素。在实践中，键的数量可以达到数千万个。

字典键的数据类型为 [UInt64](/sql-reference/data-types/int-uint.md)。

支持所有类型的源。在更新时，会将数据（无论来自文件还是表）整体读取。

配置示例：

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <hashed_array>
  </hashed_array>
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_hashed_array \{#complex_key_hashed_array\}

这种存储类型用于带有复合[keys](../attributes.md#composite-key) 的场景。类似于 [hashed_array](#hashed_array)。

配置示例：

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```

</TabItem>
<TabItem value="xml" label="配置文件">

```xml
<layout>
  <complex_key_hashed_array />
</layout>
```

</TabItem>
</Tabs>

<br/>