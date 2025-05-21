---
description: 'ClickHouseにおける非推奨のObjectデータ型に関するドキュメント'
keywords: ['object', 'data type']
sidebar_label: 'Objectデータ型'
sidebar_position: 26
slug: /sql-reference/data-types/object-data-type
title: 'Objectデータ型'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# Objectデータ型 

<DeprecatedBadge/>

**この機能は本番環境向けではなく、非推奨です。** JSONドキュメントを操作する必要がある場合は、[このガイド](/integrations/data-formats/json/overview)を参照してください。JSONオブジェクトをサポートする新しい実装はベータ版です。詳細は[こちら](/sql-reference/data-types/newjson)を参照してください。

<hr />

JavaScript Object Notation (JSON) ドキュメントを単一のカラムに保存します。

`JSON` は、[use_json_alias_for_old_object_type](/operations/settings/settings#use_json_alias_for_old_object_type) が有効な場合に `Object('json')` の別名として使用できます。

## 例 {#example}

**例 1**

`JSON` カラムを持つテーブルを作成し、その中にデータを挿入します:

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

順序付きの `MergeTree` ファミリーテーブルを作成するためには、ソートキーをそのカラムに抽出する必要があります。たとえば、圧縮されたHTTPアクセスログのJSON形式のファイルを挿入する場合:

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

`JSON` カラムを表示する際、ClickHouseはデフォルトでフィールド値のみを表示します（内部的にはタプルとして表現されているため）。`output_format_json_named_tuples_as_objects = 1` を設定することでフィールド名も表示できます:

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
