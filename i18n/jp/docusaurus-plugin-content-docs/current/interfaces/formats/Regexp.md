---
alias: []
description: 'Regexp形式に関するドキュメント'
input_format: true
keywords: ['Regexp']
output_format: false
slug: /interfaces/formats/Regexp
title: 'Regexp'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

`Regex`形式は、提供された正規表現に基づいてインポートされたデータの各行を解析します。

**使用法**

[format_regexp](/operations/settings/settings-formats.md/#format_regexp)設定からの正規表現は、インポートされたデータの各行に適用されます。正規表現内のサブパターンの数は、インポートされたデータセットのカラムの数と等しくなければなりません。

インポートされたデータの行は、改行文字 `'\n'` または DOSスタイルの改行 `"\r\n"` で区切られている必要があります。

各マッチしたサブパターンの内容は、[format_regexp_escaping_rule](/operations/settings/settings-formats.md/#format_regexp_escaping_rule)設定に基づき、対応するデータ型のメソッドで解析されます。

正規表現が行と一致しない場合、かつ [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) が1に設定されていると、その行は静かにスキップされます。それ以外の場合は、例外がスローされます。

## 使用例 {#example-usage}

`data.tsv`というファイルを考えます：

```text title="data.tsv"
id: 1 array: [1,2,3] string: str1 date: 2020-01-01
id: 2 array: [1,2,3] string: str2 date: 2020-01-02
id: 3 array: [1,2,3] string: str3 date: 2020-01-03
```

とテーブル `imp_regex_table`：

```sql
CREATE TABLE imp_regex_table (id UInt32, array Array(UInt32), string String, date Date) ENGINE = Memory;
```

上記ファイルのデータをテーブルに挿入するために、次のクエリを使用します：

```bash
$ cat data.tsv | clickhouse-client  --query "INSERT INTO imp_regex_table SETTINGS format_regexp='id: (.+?) array: (.+?) string: (.+?) date: (.+?)', format_regexp_escaping_rule='Escaped', format_regexp_skip_unmatched=0 FORMAT Regexp;"
```

テーブルからデータを `SELECT` して、`Regex`形式がファイルからデータをどのように解析したかを確認できます：

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

## 形式設定 {#format-settings}

`Regexp`形式を扱う場合、次の設定を使用できます：

- `format_regexp` — [String](/sql-reference/data-types/string.md)。 [re2](https://github.com/google/re2/wiki/Syntax)形式の正規表現を含みます。
- `format_regexp_escaping_rule` — [String](/sql-reference/data-types/string.md)。以下のエスケープルールがサポートされています：

  - CSV（[CSV](/interfaces/formats/CSV)に似ています）
  - JSON（[JSONEachRow](/interfaces/formats/JSONEachRow)に似ています）
  - Escaped（[TSV](/interfaces/formats/TabSeparated)に似ています）
  - Quoted（[Values](/interfaces/formats/Values)に似ています）
  - Raw（サブパターンをそのまま抽出し、エスケープルールなし、[TSVRaw](/interfaces/formats/TabSeparated)に似ています）

- `format_regexp_skip_unmatched` — [UInt8](/sql-reference/data-types/int-uint.md)。 `format_regexp`式がインポートされたデータと一致しない場合に例外をスローする必要性を定義します。 `0`または`1`に設定できます。
