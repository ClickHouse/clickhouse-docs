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

## 説明 {#description}

`Regex` フォーマットは、指定された正規表現に従って、インポートされたデータの各行をパースします。

**使用方法**

[format_regexp](/operations/settings/settings-formats.md/#format_regexp) 設定で指定された正規表現が、インポートされたデータの各行に適用されます。正規表現内のサブパターンの数は、インポートされるデータセット内の列数と同じである必要があります。

インポートされるデータの各行は、改行文字 `'\n'` または DOS 形式の改行 `"\r\n"` で区切られている必要があります。

マッチした各サブパターンの内容は、[format_regexp_escaping_rule](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) 設定に従い、対応するデータ型のパース方法で処理されます。

正規表現が行にマッチせず、かつ [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) が 1 に設定されている場合、その行は何の通知もなくスキップされます。そうでない場合は、例外がスローされます。

## 使用例 {#example-usage}

`data.tsv` というファイルがあるとします。

```text title="data.tsv"
id: 1 array: [1,2,3] string: str1 date: 2020-01-01
id: 2 array: [1,2,3] string: str2 date: 2020-01-02
id: 3 array: [1,2,3] string: str3 date: 2020-01-03
```

および `imp_regex_table` テーブル：

```sql
CREATE TABLE imp_regex_table (id UInt32, array Array(UInt32), string String, date Date) ENGINE = Memory;
```

先ほどのファイルのデータを、次のクエリで上記のテーブルに挿入します。

```bash
$ cat data.tsv | clickhouse-client  --query "INSERT INTO imp_regex_table SETTINGS format_regexp='id: (.+?) array: (.+?) string: (.+?) date: (.+?)', format_regexp_escaping_rule='Escaped', format_regexp_skip_unmatched=0 FORMAT Regexp;"
```

これで、テーブルからデータを `SELECT` して、`Regex` フォーマットでファイル内のデータがどのように解析されたかを確認できます。

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

`Regexp` フォーマットを使用する場合、次の設定を使用できます。

- `format_regexp` — [String](/sql-reference/data-types/string.md)。[re2](https://github.com/google/re2/wiki/Syntax) 形式の正規表現を指定します。
- `format_regexp_escaping_rule` — [String](/sql-reference/data-types/string.md)。次のエスケープ規則がサポートされています。

  - CSV（[CSV](/interfaces/formats/CSV) と同様）
  - JSON（[JSONEachRow](/interfaces/formats/JSONEachRow) と同様）
  - Escaped（[TSV](/interfaces/formats/TabSeparated) と同様）
  - Quoted（[Values](/interfaces/formats/Values) と同様）
  - Raw（サブパターンを全体として抽出し、エスケープ規則は適用されません。[TSVRaw](/interfaces/formats/TabSeparated) と同様）

- `format_regexp_skip_unmatched` — [UInt8](/sql-reference/data-types/int-uint.md)。`format_regexp` 式がインポートされたデータにマッチしない場合に例外をスローするかどうかを制御します。`0` または `1` に設定できます。
