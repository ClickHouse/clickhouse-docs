---
description: 'ClickHouse で廃止された Object データ型のドキュメント'
keywords:
- 'object'
- 'data type'
sidebar_label: 'オブジェクトデータ型'
sidebar_position: 26
slug: '/sql-reference/data-types/object-data-type'
title: 'Object Data Type'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# Object Data Type 

<DeprecatedBadge/>

**この機能は本番環境向けではなく、非推奨です。** JSON ドキュメントを扱う必要がある場合は、代わりに[このガイド](/integrations/data-formats/json/overview)を参照してください。JSON オブジェクトをサポートする新しい実装がベータ版で提供されています。詳細については[こちら](/sql-reference/data-types/newjson)をご覧ください。

<hr />

JavaScript Object Notation (JSON) ドキュメントを単一のカラムに格納します。

`JSON`は、[use_json_alias_for_old_object_type](/operations/settings/settings#use_json_alias_for_old_object_type)が有効な場合に`Object('json')`のエイリアスとして使用できます。

## 例 {#example}

**例 1**

`JSON` カラムを持つテーブルを作成し、データを挿入します:

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

順序つきの `MergeTree` ファミリー テーブルを作成するには、ソートキーをカラムに抽出する必要があります。たとえば、JSON 形式の圧縮された HTTP アクセスログのファイルを挿入するには、次のようにします:

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

## JSON カラムの表示 {#displaying-json-columns}

`JSON` カラムを表示すると、ClickHouse はデフォルトでフィールド値のみを表示します（内部的にはタプルとして表現されています）。フィールド名を表示するには、`output_format_json_named_tuples_as_objects = 1` を設定することができます:

```sql
SET output_format_json_named_tuples_as_objects = 1

SELECT * FROM json FORMAT JSONEachRow
```

```text
{"o":{"a":1,"b":{"c":2,"d":[1,2,3]}}}
```

## 関連コンテンツ {#related-content}

- [ClickHouse での JSON の使用](/integrations/data-formats/json/overview)
- [ClickHouse へのデータの取り込み - パート 2 - JSON の寄り道](https://clickhouse.com/blog/getting-data-into-clickhouse-part-2-json)
