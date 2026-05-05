---
slug: /sql-reference/statements/create/dictionary/layouts/direct
title: 'direct 字典布局'
sidebar_label: 'direct'
sidebar_position: 9
description: '一种不使用缓存、直接查询源数据的字典布局。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## direct \{#direct\}

字典不存储在内存中，在处理请求时会直接访问数据源。

字典键的类型为 [UInt64](/sql-reference/data-types/int-uint.md)。

支持除本地文件之外的所有类型的[数据源](../sources/#dictionary-sources)。

配置示例：

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(DIRECT())
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <direct />
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_direct \{#complex_key_direct\}

这种存储类型用于带有复合[键](../attributes.md#composite-key)的字典，与 `direct` 类似。