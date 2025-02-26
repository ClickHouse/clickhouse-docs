---
title : LineAsStringWithNamesAndTypes
slug: /interfaces/formats/LineAsStringWithNamesAndTypes
keywords : [LineAsStringWithNamesAndTypes]
input_format: false
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

`LineAsStringWithNames` フォーマットは、[`LineAsString`](./LineAsString.md) フォーマットに似ていますが、カラム名を含むヘッダー行とタイプを含む別のヘッダー行の2つを印刷します。

## 使用例 {#example-usage}

```sql
CREATE TABLE example (
    name String,
    value Int32
)
ENGINE = Memory;

INSERT INTO example VALUES ('John', 30), ('Jane', 25), ('Peter', 35);

SELECT * FROM example FORMAT LineAsStringWithNamesAndTypes;
```

```response title="レスポンス"
name	value
String	Int32
John	30
Jane	25
Peter	35
```

## フォーマット設定 {#format-settings}
