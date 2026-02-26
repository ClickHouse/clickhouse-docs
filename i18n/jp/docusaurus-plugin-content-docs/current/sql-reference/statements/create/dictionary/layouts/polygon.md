---
slug: /sql-reference/statements/create/dictionary/layouts/polygon
title: "ポリゴン Dictionary"
sidebar_label: "Polygon"
sidebar_position: 12
description: "ポイントインポリゴン検索用のポリゴン Dictionary を設定します。"
doc_type: "reference"
---

import CloudDetails from "@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md"
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

`polygon`（`POLYGON`）Dictionary は、ポイント・イン・ポリゴンクエリ、すなわち「逆ジオコーディング」ルックアップに最適化されています。
座標（緯度・経度）を指定すると、多数のポリゴン（国や地域の境界など）の中からその座標を含むポリゴン／地域を効率的に特定します。
位置座標をそれが属する地域にマッピングする用途に適しています。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y" title="ClickHouse のポリゴン辞書" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ポリゴンDictionaryの設定例：

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

  <TabItem value="xml" label="設定ファイル">
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

ポリゴンDictionaryを設定する際、キーは以下の2つの型のいずれかである必要があります：

* 単純ポリゴン。点の配列です。
* MultiPolygon。これはポリゴンの配列です。各ポリゴンは点の二次元配列です。この配列の最初の要素はポリゴンの外側の境界を表し、以降の要素はそのポリゴンから除外する領域を指定します。

点は座標の配列またはタプルとして指定できます。現在の実装では、2次元の点のみサポートされています。

ユーザーは、ClickHouseがサポートするすべての形式で自身のデータをアップロードできます。

利用可能な[インメモリストレージ](./#storing-dictionaries-in-memory)には、3つの種類があります：

| レイアウト                | 説明                                                                                                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POLYGON_SIMPLE`     | 単純な実装です。各クエリごとにすべてのポリゴンを線形走査し、追加の索引を使用せずに包含関係を判定します。                                                                                                                                    |
| `POLYGON_INDEX_EACH` | 各ポリゴンごとに個別の索引が構築され、多くの場合に高速な包含判定が可能になります（地理的な領域向けに最適化されています）。領域上にグリッドが重ね合わされ、セルは再帰的に 16 個の等しいパーツに分割されます。再帰の深さが `MAX_DEPTH` に達するか、1 つのセルと交差するポリゴンの数が `MIN_INTERSECTIONS` 以下になると分割は停止します。 |
| `POLYGON_INDEX_CELL` | 上記で説明したグリッドも、同じオプションで作成します。各リーフセルごとに、そのセルに含まれるすべてのポリゴン断片に対して索引を構築し、高速なクエリ応答を可能にします。                                                                                                     |
| `POLYGON`            | `POLYGON_INDEX_CELL` の別名です。                                                                                                                                                             |

Dictionaryのクエリは、Dictionaryを操作するための標準的な[関数](/sql-reference/functions/ext-dict-functions.md)を使用して実行されます。
重要な違いは、ここでのキーが、そのキーを含むポリゴンを検索したい地点になるという点です。

**例**

上記で定義したDictionaryを使用した例：

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

&#39;points&#39; テーブル内の各ポイントに対して上記のコマンドを実行すると、そのポイントを含む最小面積のポリゴンが検索され、指定した属性が出力されます。

**例**


`SELECT` クエリでポリゴン Dictionary からカラムを読み取ることができます。そのためには、Dictionary の設定または対応する DDL クエリで `store_polygon_key_column = 1` を有効にしてください。

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
