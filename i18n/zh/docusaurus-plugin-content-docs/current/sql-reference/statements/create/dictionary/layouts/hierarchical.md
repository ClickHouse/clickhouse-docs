---
slug: /sql-reference/statements/create/dictionary/layouts/hierarchical
title: '层级字典'
sidebar_label: '层级'
sidebar_position: 10
description: '配置具有父子键关系的层级字典。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 层级字典 \{#hierarchical-dictionaries\}

ClickHouse 支持具有[数值键](../attributes.md#numeric-key)的层级字典。

请看下面的层级结构：

```text
0 (Common parent)
│
├── 1 (Russia)
│   │
│   └── 2 (Moscow)
│       │
│       └── 3 (Center)
│
└── 4 (Great Britain)
    │
    └── 5 (London)
```

此层级可以用下表的字典表来表示。

| region&#95;id | parent&#95;region | region&#95;name |
| ------------- | ----------------- | --------------- |
| 1             | 0                 | Russia          |
| 2             | 1                 | Moscow          |
| 3             | 2                 | Center          |
| 4             | 0                 | Great Britain   |
| 5             | 4                 | London          |

该表包含一列 `parent_region`，其中存储了该元素最近上级的键值。

ClickHouse 为外部字典属性提供层级特性支持。通过该特性，您可以按如上所述的方式配置层级字典。

[dictGetHierarchy](/sql-reference/functions/ext-dict-functions.md#dictGetHierarchy) 函数可用于获取某个元素的父级链。

在我们的示例中，字典的结构可以如下所示：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    CREATE DICTIONARY regions_dict
    (
        region_id UInt64,
        parent_region UInt64 DEFAULT 0 HIERARCHICAL,
        region_name String DEFAULT ''
    )
    PRIMARY KEY region_id
    SOURCE(...)
    LAYOUT(HASHED())
    LIFETIME(3600);
    ```
  </TabItem>

  <TabItem value="xml" label="配置文件">
    ```xml
    <dictionary>
        <structure>
            <id>
                <name>region_id</name>
            </id>

            <attribute>
                <name>parent_region</name>
                <type>UInt64</type>
                <null_value>0</null_value>
                <hierarchical>true</hierarchical>
            </attribute>

            <attribute>
                <name>region_name</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>

        </structure>
    </dictionary>
    ```
  </TabItem>
</Tabs>

<br />
