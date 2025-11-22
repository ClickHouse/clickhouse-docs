---
alias: []
description: 'JSONAsString フォーマットに関するドキュメント'
input_format: true
keywords: ['JSONAsString']
output_format: false
slug: /interfaces/formats/JSONAsString
title: 'JSONAsString'
doc_type: 'reference'
---

| 入力 | 出力  | エイリアス |
|-------|---------|-------|
| ✔     | ✗       |       |



## Description {#description}

このフォーマットでは、単一のJSONオブジェクトが単一の値として解釈されます。
入力に複数のJSONオブジェクト（カンマ区切り）が含まれる場合、それらは個別の行として解釈されます。
入力データが角括弧で囲まれている場合は、JSONオブジェクトの配列として解釈されます。

:::note
このフォーマットは、[String](/sql-reference/data-types/string.md)型の単一フィールドを持つテーブルに対してのみ解析可能です。
残りのカラムは[`DEFAULT`](/sql-reference/statements/create/table.md/#default)または[`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view)のいずれかに設定するか、省略する必要があります。
:::

JSONオブジェクト全体をStringにシリアライズすれば、[JSON関数](/sql-reference/functions/json-functions.md)を使用して処理できます。


## 使用例 {#example-usage}

### 基本的な例 {#basic-example}

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
