---
alias: []
description: 'LineAsStringWithNames形式のドキュメント'
input_format: true
keywords: ['LineAsStringWithNames']
output_format: true
slug: /interfaces/formats/LineAsStringWithNames
title: 'LineAsStringWithNames'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

`LineAsStringWithNames`形式は、[`LineAsString`](./LineAsString.md)形式に似ていますが、カラム名付きのヘッダ行を印刷します。

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
name    value
John    30
Jane    25
Peter    35
```

## フォーマット設定 {#format-settings}
