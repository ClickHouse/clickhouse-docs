---
title : LineAsStringWithNames
slug: /interfaces/formats/LineAsStringWithNames
keywords : [LineAsStringWithNames]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

`LineAsStringWithNames`フォーマットは、[`LineAsString`](./LineAsString.md)フォーマットに似ていますが、カラム名を含むヘッダ行を出力します。

## 使用例 {#example-usage}

```sql title="クエリ"
CREATE TABLE example (
    name String,
    value Int32
)
ENGINE = Memory;

INSERT INTO example VALUES ('John', 30), ('Jane', 25), ('Peter', 35);

SELECT * FROM example FORMAT LineAsStringWithNames;
```

```response title="レスポンス"
name	value
John	30
Jane	25
Peter	35
```

## フォーマット設定 {#format-settings}
