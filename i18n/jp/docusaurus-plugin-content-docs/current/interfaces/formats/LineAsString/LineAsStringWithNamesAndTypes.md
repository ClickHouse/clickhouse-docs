---
alias: []
description: 'LineAsStringWithNamesAndTypes 形式に関するドキュメント'
input_format: false
keywords: ['LineAsStringWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/LineAsStringWithNamesAndTypes
title: 'LineAsStringWithNamesAndTypes'
doc_type: 'reference'
---

| 入力 | 出力 | 別名 |
|-------|--------|-------|
| ✗     | ✔      |       |



## 説明 {#description}

`LineAsStringWithNames` フォーマットは [`LineAsString`](./LineAsString.md) フォーマットに似ていますが、
2 行のヘッダー行を出力します。1 行目は列名、2 行目は型です。



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

```response title="Response"
name    value
String    Int32
John    30
Jane    25
Peter    35
```


## フォーマット設定 {#format-settings}
