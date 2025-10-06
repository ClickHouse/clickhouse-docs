---
'description': 'ClickHouseにおける非推奨のObjectデータ型に関するドキュメント'
'keywords':
- 'object'
- 'data type'
'sidebar_label': 'オブジェクトデータ型'
'sidebar_position': 26
'slug': '/sql-reference/data-types/object-data-type'
'title': 'オブジェクトデータ型'
'doc_type': 'reference'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# オブジェクトデータ型 

<DeprecatedBadge/>

**この機能は本番環境での使用には準備ができておらず、非推奨です。** JSON文書を扱う必要がある場合は、代わりに[このガイド](/integrations/data-formats/json/overview)を使用してください。JSONオブジェクトをサポートする新しい実装はベータ版です。さらなる詳細は[こちら](/sql-reference/data-types/newjson)を参照してください。

<hr />

JavaScript Object Notation (JSON)文書を単一のカラムに格納します。

`JSON`は、[use_json_alias_for_old_object_type](/operations/settings/settings#use_json_alias_for_old_object_type)が有効な場合、`Object('json')`のエイリアスとして使用できます。

## 例 {#example}

**例 1**

`JSON`カラムを持つテーブルを作成し、データを挿入する:

```sql
CREATE TABLE json
(
    o JSON
)
ENGINE = Memory
```

```sql
INSERT INTO json VALUES ('{"a": 1, "b": { "c": 2, "d": [1, 2, 3] }}')
```

```sql
SELECT o.a, o.b.c, o.b.d[3] FROM json
```

```text
┌─o.a─┬─o.b.c─┬─arrayElement(o.b.d, 3)─┐
│   1 │     2 │                      3 │
└─────┴───────┴────────────────────────┘
```

**例 2**

整理された`MergeTree`ファミリーのテーブルを作成できるようにするため、ソートキーはそのカラムに抽出する必要があります。例えば、圧縮されたHTTPアクセスログのファイルをJSON形式で挿入するためには:

```sql
CREATE TABLE logs
(
    timestamp DateTime,
    message JSON
)
ENGINE = MergeTree
ORDER BY timestamp
```

```sql
INSERT INTO logs
SELECT parseDateTimeBestEffort(JSONExtractString(json, 'timestamp')), json
FROM file('access.json.gz', JSONAsString)
```

## JSONカラムの表示 {#displaying-json-columns}

`JSON`カラムを表示すると、ClickHouseはデフォルトでフィールド値のみを表示します（内部的にはタプルとして表現されるため）。フィールド名を表示するには、`output_format_json_named_tuples_as_objects = 1`を設定します:

```sql
SET output_format_json_named_tuples_as_objects = 1

SELECT * FROM json FORMAT JSONEachRow
```

```text
{"o":{"a":1,"b":{"c":2,"d":[1,2,3]}}}
```

## 関連内容 {#related-content}

- [ClickHouseでのJSONの使用](/integrations/data-formats/json/overview)
- [ClickHouseへのデータの取り込み - パート2 - JSONの迂回](https://clickhouse.com/blog/getting-data-into-clickhouse-part-2-json)
