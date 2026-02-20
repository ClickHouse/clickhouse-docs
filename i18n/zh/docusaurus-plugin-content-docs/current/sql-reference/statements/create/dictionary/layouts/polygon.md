---
slug: /sql-reference/statements/create/dictionary/layouts/polygon
title: "多边形字典"
sidebar_label: "Polygon"
sidebar_position: 12
description: "配置多边形字典以执行点在多边形内的查找。"
doc_type: "reference"
---

import CloudDetails from "@site/i18n/zh/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md"
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

`polygon`（`POLYGON`）字典针对点在多边形内的查询进行了优化，本质上是一种&quot;反向地理编码&quot;查找。
给定一个坐标（纬度/经度），它能高效地从多个多边形（如国家或地区边界）中找出包含该点的多边形/区域。
它非常适合将位置坐标映射到其所属区域。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y" title="ClickHouse 中的多边形字典" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

配置多边形字典的示例：

<CloudDetails />

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    CREATE DICTIONARY polygon_dict_name (
        key Array(Array(Array(Array(Float64)))),
        name String,
        value UInt64
    )
    PRIMARY KEY key
    LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
    ...
    ```
  </TabItem>

  <TabItem value="xml" label="配置文件">
    ```xml
    <dictionary>
        <structure>
            <key>
                <attribute>
                    <name>key</name>
                    <type>Array(Array(Array(Array(Float64))))</type>
                </attribute>
            </key>

            <attribute>
                <name>name</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>

            <attribute>
                <name>value</name>
                <type>UInt64</type>
                <null_value>0</null_value>
            </attribute>
        </structure>

        <layout>
            <polygon>
                <store_polygon_key_column>1</store_polygon_key_column>
            </polygon>
        </layout>

        ...
    </dictionary>
    ```
  </TabItem>
</Tabs>

<br />

配置多边形字典时，键必须为以下两种类型之一：

* 一个简单多边形。用一个点的数组表示。
* MultiPolygon。它是一个多边形数组。每个多边形都是一个由点组成的二维数组。该数组的第一个元素是多边形的外部边界，后续元素表示需要从该多边形中排除的区域。

点可以用坐标数组或元组来表示。当前实现仅支持二维点。

用户可以上传 ClickHouse 所支持的任意格式的数据。

共有 3 种[内存存储](./#storing-dictionaries-in-memory)类型：

| 布局                   | 描述                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `POLYGON_SIMPLE`     | 朴素实现：对于每个查询，线性遍历所有多边形，在没有额外索引的情况下检查其是否属于该多边形。                                                                                                  |
| `POLYGON_INDEX_EACH` | 为每个多边形单独构建一个索引，在大多数情况下都能快速进行成员关系判断（针对地理区域进行了优化）。在该区域上叠加一个网格，递归地将单元划分为 16 个相等部分。当递归深度达到 `MAX_DEPTH`，或某个单元与不超过 `MIN_INTERSECTIONS` 个多边形相交时，划分停止。 |
| `POLYGON_INDEX_CELL` | 还会使用相同的选项创建上述网格。对于每个叶单元格，会在位于该单元格的所有多边形片段上构建索引，从而能够快速响应查询。                                                                                     |
| `POLYGON`            | `POLYGON_INDEX_CELL` 的同义词。                                                                                                                     |

字典查询使用标准的[函数](../../../functions/ext-dict-functions.md)进行操作。
一个重要的区别在于，此处的键是您希望查找其所在多边形的点。

**示例**

以下是使用上述字典的示例：

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

对 &#39;points&#39; 表中的每个点执行上述最后一条命令后，系统将找到包含该点的最小面积多边形，并输出所请求的属性。

**示例**

您可以通过 SELECT 查询从多边形字典中读取列，只需在字典配置或相应的 DDL 查询中开启 `store_polygon_key_column = 1` 即可。

```sql title="Query"
CREATE TABLE polygons_test_table
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
) ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO polygons_test_table VALUES ([[[(3, 1), (0, 1), (0, -1), (3, -1)]]], 'Value');

CREATE DICTIONARY polygons_test_dictionary
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
)
PRIMARY KEY key
SOURCE(CLICKHOUSE(TABLE 'polygons_test_table'))
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
LIFETIME(0);

SELECT * FROM polygons_test_dictionary;
```

```text title="Response"
┌─key─────────────────────────────┬─name──┐
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Value │
└─────────────────────────────────┴───────┘
```
