---
'alias': []
'description': 'Vertical フォーマットに関するドキュメント'
'input_format': false
'keywords':
- 'Vertical'
'output_format': true
'slug': '/interfaces/formats/Vertical'
'title': 'Vertical'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## Description {#description}

指定されたカラム名で各値を別々の行に印刷します。この形式は、各行が多数のカラムを含む場合に、1つまたは数行のみを印刷するのに便利です。
[`NULL`](/sql-reference/syntax.md) は `ᴺᵁᴸᴸ` として出力されます。

## Example usage {#example-usage}

例:

```sql
SELECT * FROM t_null FORMAT Vertical
```

```response
Row 1:
──────
x: 1
y: ᴺᵁᴸᴸ
```

行は縦の形式ではエスケープされません:

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
Row 1:
──────
test: string with 'quotes' and      with some special
 characters
```

この形式はクエリ結果を出力するのには適していますが、テーブルに挿入するデータの解析（取得）には適していません。

## Format settings {#format-settings}
