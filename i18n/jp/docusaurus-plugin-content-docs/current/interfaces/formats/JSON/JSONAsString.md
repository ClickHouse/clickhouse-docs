---
alias: []
description: 'JSONAsString フォーマットのドキュメント'
input_format: true
keywords:
- 'JSONAsString'
output_format: false
slug: '/interfaces/formats/JSONAsString'
title: 'JSONAsString'
---



| Input | Output  | Alias |
|-------|---------|-------|
| ✔     | ✗       |       |


## 説明 {#description}

この形式では、単一のJSONオブジェクトは単一の値として解釈されます。 
入力に複数のJSONオブジェクト（カンマ区切り）がある場合、それらは別々の行として解釈されます。 
入力データが角括弧で囲まれている場合、それはJSONオブジェクトの配列として解釈されます。

:::note
この形式は、[String](/sql-reference/data-types/string.md)型の単一フィールドを持つテーブルに対してのみ解析可能です。 
残りのカラムは、[`DEFAULT`](/sql-reference/statements/create/table.md/#default)または[`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view)に設定するか、省略する必要があります。 
:::

JSONオブジェクト全体を文字列に直列化したら、[JSON関数](/sql-reference/functions/json-functions.md)を使用してそれを処理できます。

## 使用例 {#example-usage}

### 基本例 {#basic-example}

```sql title="クエリ"
DROP TABLE IF EXISTS json_as_string;
CREATE TABLE json_as_string (json String) ENGINE = Memory;
INSERT INTO json_as_string (json) FORMAT JSONAsString {"foo":{"bar":{"x":"y"},"baz":1}},{},{"any json stucture":1}
SELECT * FROM json_as_string;
```

```response title="レスポンス"
┌─json──────────────────────────────┐
│ {"foo":{"bar":{"x":"y"},"baz":1}} │
│ {}                                │
│ {"any json stucture":1}           │
└───────────────────────────────────┘
```

### JSONオブジェクトの配列 {#an-array-of-json-objects}

```sql title="クエリ"
CREATE TABLE json_square_brackets (field String) ENGINE = Memory;
INSERT INTO json_square_brackets FORMAT JSONAsString [{"id": 1, "name": "name1"}, {"id": 2, "name": "name2"}];

SELECT * FROM json_square_brackets;
```

```response title="レスポンス"
┌─field──────────────────────┐
│ {"id": 1, "name": "name1"} │
│ {"id": 2, "name": "name2"} │
└────────────────────────────┘
```

## フォーマット設定 {#format-settings}
