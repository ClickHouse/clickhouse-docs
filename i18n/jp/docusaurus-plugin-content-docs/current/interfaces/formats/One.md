---
'alias': []
'description': 'Oneフォーマットのドキュメンテーション'
'input_format': true
'keywords':
- 'One'
'output_format': false
'slug': '/interfaces/formats/One'
'title': 'One'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

`One`フォーマットは、ファイルからデータを読み取らず、カラムの型が[`UInt8`](../../sql-reference/data-types/int-uint.md)の1行のみを返す特別な入力フォーマットであり、名前は`dummy`、値は`0`です（`system.one`テーブルのように）。仮想カラム`_file/_path`とともに使用して、実際のデータを読み込むことなくすべてのファイルをリストすることができます。

## 使用例 {#example-usage}

例:

```sql title="Query"
SELECT _file FROM file('path/to/files/data*', One);
```

```text title="Response"
┌─_file────┐
│ data.csv │
└──────────┘
┌─_file──────┐
│ data.jsonl │
└────────────┘
┌─_file────┐
│ data.tsv │
└──────────┘
┌─_file────────┐
│ data.parquet │
└──────────────┘
```

## フォーマット設定 {#format-settings}
