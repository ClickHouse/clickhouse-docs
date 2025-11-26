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

| Input | 出力  | 別名 |
|-------|-------|------|
| ✔     | ✗     |      |



## 説明 {#description}

この形式では、1 つの JSON オブジェクトが 1 つの値として解釈されます。  
入力に複数の JSON オブジェクト（カンマ区切り）が含まれている場合、それぞれが別々の行として解釈されます。  
入力データが角括弧で囲まれている場合、それは JSON オブジェクトの配列として解釈されます。

:::note
この形式をパースできるのは、型が [String](/sql-reference/data-types/string.md) の単一フィールドだけを持つテーブルに対してのみです。  
残りのカラムは [`DEFAULT`](/sql-reference/statements/create/table.md/#default) または [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view) に設定するか、  
省略する必要があります。 
:::

JSON オブジェクト全体を String にシリアライズしたら、[JSON 関数](/sql-reference/functions/json-functions.md) を利用して処理できます。



## 使用例

### 基本的な例

```sql title="Query"
DROP TABLE IF EXISTS json_as_string;
CREATE TABLE json_as_string (json String) ENGINE = Memory;
INSERT INTO json_as_string (json) FORMAT JSONAsString {"foo":{"bar":{"x":"y"},"baz":1}},{},{"any json stucture":1}
SELECT * FROM json_as_string;
```

```response title="Response"
┌─json──────────────────────────────┐
│ {"foo":{"bar":{"x":"y"},"baz":1}} │
│ {}                                │
│ {"any json stucture":1}           │
└───────────────────────────────────┘
```

### JSON オブジェクトの配列

```sql title="Query"
CREATE TABLE json_square_brackets (field String) ENGINE = Memory;
INSERT INTO json_square_brackets FORMAT JSONAsString [{"id": 1, "name": "name1"}, {"id": 2, "name": "name2"}];

SELECT * FROM json_square_brackets;
```

```response title="Response"
┌─field──────────────────────┐
│ {"id": 1, "name": "name1"} │
│ {"id": 2, "name": "name2"} │
└────────────────────────────┘
```


## 形式設定 {#format-settings}
