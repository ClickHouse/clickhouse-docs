---
slug: '/sql-reference/data-types/object-data-type'
sidebar_position: 26
sidebar_label: 'オブジェクトデータ型'
keywords: ['object', 'data type']
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# オブジェクトデータ型 

<DeprecatedBadge/>

**この機能は本番環境には対応しておらず、非推奨です。** JSONドキュメントを扱う必要がある場合は、代わりに [このガイド](/integrations/data-formats/json/overview) を参照してください。JSONオブジェクトをサポートする新しい実装はベータ版です。詳細は [こちら](/sql-reference/data-types/newjson) をご覧ください。

<hr />

JavaScript Object Notation (JSON) ドキュメントを単一のカラムに保存します。

`JSON` は、[use_json_alias_for_old_object_type](/operations/settings/settings#use_json_alias_for_old_object_type) が有効な場合、`Object('json')` のエイリアスとして使用できます。

## 例 {#example}

**例 1**

`JSON` カラムを持つテーブルを作成し、データを挿入する：

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

順序が必要な `MergeTree` ファミリーのテーブルを作成するには、ソートキーをカラムに抽出する必要があります。例えば、圧縮されたHTTPアクセスログのJSON形式のファイルを挿入するには：

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

`JSON` カラムを表示する際、ClickHouseはデフォルトでフィールド値のみを表示します（内部的にはタプルとして表現されます）。フィールド名も表示するには `output_format_json_named_tuples_as_objects = 1` を設定します：

```sql
SET output_format_json_named_tuples_as_objects = 1

SELECT * FROM json FORMAT JSONEachRow
```

```text
{"o":{"a":1,"b":{"c":2,"d":[1,2,3]}}}
```

## 関連コンテンツ {#related-content}

- [ClickHouseでのJSONの使用](/integrations/data-formats/json/overview)
- [ClickHouseへのデータの取り込み - パート2 - JSONの迂回](https://clickhouse.com/blog/getting-data-into-clickhouse-part-2-json)
