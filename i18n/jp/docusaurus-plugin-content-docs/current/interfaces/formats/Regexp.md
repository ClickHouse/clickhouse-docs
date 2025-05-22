---
'alias': []
'description': 'Regexp形式のドキュメント'
'input_format': true
'keywords':
- 'Regexp'
'output_format': false
'slug': '/interfaces/formats/Regexp'
'title': 'Regexp'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

`Regex` フォーマットは、提供された正規表現に従ってインポートされたデータの各行を解析します。

**使用法**

[format_regexp](/operations/settings/settings-formats.md/#format_regexp) 設定からの正規表現が、インポートされたデータの各行に適用されます。正規表現のサブパターンの数は、インポートされたデータセットのカラム数と等しくなければなりません。

インポートされたデータの行は、改行文字 `'\n'` または DOS スタイルの改行 `"\r\n"` で区切られている必要があります。

一致した各サブパターンの内容は、[format_regexp_escaping_rule](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) 設定に従って、対応するデータ型のメソッドで解析されます。

正規表現が行に一致しない場合、且つ [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) が 1 に設定されている場合、その行は静かにスキップされます。そうでない場合、例外がスローされます。

## 使用例 {#example-usage}

ファイル `data.tsv` を考えてみましょう：

```text title="data.tsv"
id: 1 array: [1,2,3] string: str1 date: 2020-01-01
id: 2 array: [1,2,3] string: str2 date: 2020-01-02
id: 3 array: [1,2,3] string: str3 date: 2020-01-03
```
テーブル `imp_regex_table` は次の通りです：

```sql
CREATE TABLE imp_regex_table (id UInt32, array Array(UInt32), string String, date Date) ENGINE = Memory;
```

次のクエリを使用して上記のファイルからデータをテーブルに挿入します：

```bash
$ cat data.tsv | clickhouse-client  --query "INSERT INTO imp_regex_table SETTINGS format_regexp='id: (.+?) array: (.+?) string: (.+?) date: (.+?)', format_regexp_escaping_rule='Escaped', format_regexp_skip_unmatched=0 FORMAT Regexp;"
```

これで、テーブルからデータを `SELECT` して、`Regex` フォーマットがファイルからのデータをどのように解析したかを確認できます：

```sql title="クエリ"
SELECT * FROM imp_regex_table;
```

```text title="レスポンス"
┌─id─┬─array───┬─string─┬───────date─┐
│  1 │ [1,2,3] │ str1   │ 2020-01-01 │
│  2 │ [1,2,3] │ str2   │ 2020-01-02 │
│  3 │ [1,2,3] │ str3   │ 2020-01-03 │
└────┴─────────┴────────┴────────────┘
```

## フォーマット設定 {#format-settings}

`Regexp` フォーマットを使用する場合、次の設定を使用できます：

- `format_regexp` — [String](/sql-reference/data-types/string.md)。 [re2](https://github.com/google/re2/wiki/Syntax) フォーマットの正規表現を含みます。
- `format_regexp_escaping_rule` — [String](/sql-reference/data-types/string.md)。次のエスケープルールがサポートされています：

  - CSV（[CSV](/interfaces/formats/CSV)に類似）
  - JSON（[JSONEachRow](/interfaces/formats/JSONEachRow)に類似）
  - Escaped（[TSV](/interfaces/formats/TabSeparated)に類似）
  - Quoted（[Values](/interfaces/formats/Values)に類似）
  - Raw（サブパターンをまるごと抽出し、エスケープルールなし、[TSVRaw](/interfaces/formats/TabSeparated)に類似）

- `format_regexp_skip_unmatched` — [UInt8](/sql-reference/data-types/int-uint.md)。 `format_regexp` の式がインポートされたデータに一致しない場合に例外をスローする必要性を定義します。 `0` または `1` に設定できます。
