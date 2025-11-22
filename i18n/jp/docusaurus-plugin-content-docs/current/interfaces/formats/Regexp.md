---
alias: []
description: 'Regexp フォーマットに関するドキュメント'
input_format: true
keywords: ['Regexp']
output_format: false
slug: /interfaces/formats/Regexp
title: 'Regexp'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✗      |       |



## Description {#description}

`Regex`形式は、指定された正規表現に従ってインポートデータの各行を解析します。

**使用方法**

[format_regexp](/operations/settings/settings-formats.md/#format_regexp)設定で指定された正規表現が、インポートデータの各行に適用されます。正規表現内のサブパターンの数は、インポートするデータセットの列数と一致している必要があります。

インポートデータの各行は、改行文字`'\n'`またはDOS形式の改行`"\r\n"`で区切る必要があります。

マッチした各サブパターンの内容は、[format_regexp_escaping_rule](/operations/settings/settings-formats.md/#format_regexp_escaping_rule)設定に従い、対応するデータ型のメソッドで解析されます。

正規表現が行にマッチせず、かつ[format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_escaping_rule)が1に設定されている場合、その行は警告なくスキップされます。それ以外の場合は例外がスローされます。


## 使用例 {#example-usage}

ファイル `data.tsv` を考えます:

```text title="data.tsv"
id: 1 array: [1,2,3] string: str1 date: 2020-01-01
id: 2 array: [1,2,3] string: str2 date: 2020-01-02
id: 3 array: [1,2,3] string: str3 date: 2020-01-03
```

およびテーブル `imp_regex_table`:

```sql
CREATE TABLE imp_regex_table (id UInt32, array Array(UInt32), string String, date Date) ENGINE = Memory;
```

以下のクエリを使用して、上記のファイルからテーブルにデータを挿入します:

```bash
$ cat data.tsv | clickhouse-client  --query "INSERT INTO imp_regex_table SETTINGS format_regexp='id: (.+?) array: (.+?) string: (.+?) date: (.+?)', format_regexp_escaping_rule='Escaped', format_regexp_skip_unmatched=0 FORMAT Regexp;"
```

テーブルからデータを `SELECT` して、`Regex` 形式がファイルからデータをどのように解析したかを確認できます:

```sql title="Query"
SELECT * FROM imp_regex_table;
```

```text title="Response"
┌─id─┬─array───┬─string─┬───────date─┐
│  1 │ [1,2,3] │ str1   │ 2020-01-01 │
│  2 │ [1,2,3] │ str2   │ 2020-01-02 │
│  3 │ [1,2,3] │ str3   │ 2020-01-03 │
└────┴─────────┴────────┴────────────┘
```


## フォーマット設定 {#format-settings}

`Regexp`フォーマットを使用する際は、以下の設定を使用できます：

- `format_regexp` — [String](/sql-reference/data-types/string.md)。[re2](https://github.com/google/re2/wiki/Syntax)形式の正規表現を含みます。
- `format_regexp_escaping_rule` — [String](/sql-reference/data-types/string.md)。以下のエスケープルールがサポートされています：
  - CSV（[CSV](/interfaces/formats/CSV)と同様）
  - JSON（[JSONEachRow](/interfaces/formats/JSONEachRow)と同様）
  - Escaped（[TSV](/interfaces/formats/TabSeparated)と同様）
  - Quoted（[Values](/interfaces/formats/Values)と同様）
  - Raw（サブパターンを全体として抽出、エスケープルールなし、[TSVRaw](/interfaces/formats/TabSeparated)と同様）

- `format_regexp_skip_unmatched` — [UInt8](/sql-reference/data-types/int-uint.md)。`format_regexp`式がインポートされたデータと一致しない場合に例外をスローするかどうかを定義します。`0`または`1`に設定できます。
