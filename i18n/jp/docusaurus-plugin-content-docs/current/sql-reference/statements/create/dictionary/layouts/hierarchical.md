---
slug: /sql-reference/statements/create/dictionary/layouts/hierarchical
title: '階層型 Dictionary'
sidebar_label: '階層型'
sidebar_position: 10
description: '親子キー関係を持つ階層型 Dictionary を設定します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 階層型ディクショナリ \{#hierarchical-dictionaries\}

ClickHouse では、[数値キー](../attributes.md#numeric-key) を使用した階層型ディクショナリをサポートしています。

次の階層構造を見てみましょう。

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

この階層は、次のような Dictionary テーブルとして表現できます。

| region&#95;id | parent&#95;region | region&#95;name |
| ------------- | ----------------- | --------------- |
| 1             | 0                 | Russia          |
| 2             | 1                 | Moscow          |
| 3             | 2                 | Center          |
| 4             | 0                 | Great Britain   |
| 5             | 4                 | London          |

このテーブルには、各要素に対して直近の親要素のキーを保持する `parent_region` カラムがあります。

ClickHouse は外部 Dictionary 属性に対して階層プロパティをサポートしています。このプロパティにより、上記で説明したものと同様の階層 Dictionary を構成できます。

[dictGetHierarchy](/sql-reference/functions/ext-dict-functions.md#dictGetHierarchy) 関数を使用すると、要素の親階層のチェーンを取得できます。

この例では、Dictionary の構造は次のようになります。

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

  <TabItem value="xml" label="Configuration file">
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
