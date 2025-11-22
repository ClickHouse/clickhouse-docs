---
alias: []
description: 'LineAsStringWithNamesAndTypes フォーマットに関するドキュメント'
input_format: false
keywords: ['LineAsStringWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/LineAsStringWithNamesAndTypes
title: 'LineAsStringWithNamesAndTypes'
doc_type: 'reference'
---

| Input | Output | 別名 |
|-------|--------|-------|
| ✗     | ✔      |       |



## 説明 {#description}

`LineAsStringWithNames`フォーマットは[`LineAsString`](./LineAsString.md)フォーマットに似ていますが、2つのヘッダー行を出力します：1つはカラム名、もう1つは型です。


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
name    value
String    Int32
John    30
Jane    25
Peter    35
```


## フォーマット設定 {#format-settings}
