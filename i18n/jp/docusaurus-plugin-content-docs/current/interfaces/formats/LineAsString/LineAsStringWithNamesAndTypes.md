---
'alias': []
'description': 'LineAsStringWithNamesAndTypes フォーマットのドキュメント'
'input_format': false
'keywords':
- 'LineAsStringWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/LineAsStringWithNamesAndTypes'
'title': 'LineAsStringWithNamesAndTypes'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

`LineAsStringWithNames` フォーマットは、[`LineAsString`](./LineAsString.md) フォーマットに似ていますが、2つのヘッダ行を印刷します：1つはカラム名、もう1つはタイプです。

## 例の使用法 {#example-usage}

```sql
CREATE TABLE example (
    name String,
    value Int32
)
ENGINE = Memory;

INSERT INTO example VALUES ('John', 30), ('Jane', 25), ('Peter', 35);

SELECT * FROM example FORMAT LineAsStringWithNamesAndTypes;
```

```response title="応答"
name    value
String    Int32
John    30
Jane    25
Peter    35
```

## フォーマット設定 {#format-settings}
