---
alias: []
description: 'LineAsStringWithNames フォーマットのドキュメント'
input_format: true
keywords:
- 'LineAsStringWithNames'
output_format: true
slug: '/interfaces/formats/LineAsStringWithNames'
title: 'LineAsStringWithNames'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

`LineAsStringWithNames`形式は、[`LineAsString`](./LineAsString.md)形式に似ていますが、カラム名を含むヘッダ行を出力します。

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
