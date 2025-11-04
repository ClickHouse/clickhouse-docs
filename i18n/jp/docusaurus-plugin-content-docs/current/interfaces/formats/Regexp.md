---
'alias': []
'description': 'Regexp 形式のドキュメント'
'input_format': true
'keywords':
- 'Regexp'
'output_format': false
'slug': '/interfaces/formats/Regexp'
'title': 'Regexp'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

`Regex` フォーマットは、提供された正規表現に従ってインポートされたデータの各行を解析します。

**使用法**

[format_regexp](/operations/settings/settings-formats.md/#format_regexp) 設定からの正規表現は、インポートされたデータの各行に適用されます。正規表現のサブパターンの数は、インポートされたデータセットのカラム数と等しくなければなりません。

インポートされたデータの行は、改行文字 `'\n'` または DOS スタイルの改行 `"\r\n"` で区切る必要があります。

一致した各サブパターンの内容は、[format_regexp_escaping_rule](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) 設定に従って、対応するデータ型のメソッドで解析されます。

正規表現が行と一致しない場合、かつ [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) が 1 に設定されていると、その行は静かにスキップされます。それ以外の場合は、例外がスローされます。

## 使用例 {#example-usage}

ファイル `data.tsv` を考慮してください：

```text title="data.tsv"
id: 1 array: [1,2,3] string: str1 date: 2020-01-01
id: 2 array: [1,2,3] string: str2 date: 2020-01-02
id: 3 array: [1,2,3] string: str3 date: 2020-01-03
```
およびテーブル `imp_regex_table`：

```sql
CREATE TABLE imp_regex_table (id UInt32, array Array(UInt32), string String, date Date) ENGINE = Memory;
```

次のクエリを使用して、前述のファイルからのデータを上記のテーブルに挿入します：

```bash
$ cat data.tsv | clickhouse-client  --query "INSERT INTO imp_regex_table SETTINGS format_regexp='id: (.+?) array: (.+?) string: (.+?) date: (.+?)', format_regexp_escaping_rule='Escaped', format_regexp_skip_unmatched=0 FORMAT Regexp;"
```

テーブルからデータを `SELECT` して、`Regex` フォーマットがファイルからデータをどのように解析したかを確認できます：

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

`Regexp` フォーマットで作業する際に、以下の設定を使用できます：

- `format_regexp` — [文字列](/sql-reference/data-types/string.md)。 [re2](https://github.com/google/re2/wiki/Syntax) フォーマットの正規表現を含みます。
- `format_regexp_escaping_rule` — [文字列](/sql-reference/data-types/string.md)。以下のエスケープルールがサポートされています：

  - CSV ( [CSV](/interfaces/formats/CSV) と類似)
  - JSON ( [JSONEachRow](/interfaces/formats/JSONEachRow) と類似)
  - エスケープ ( [TSV](/interfaces/formats/TabSeparated) と類似)
  - クオート ( [Values](/interfaces/formats/Values) と類似)
  - 生 (サブパターンをそのまま抽出、エスケープルールなし、 [TSVRaw](/interfaces/formats/TabSeparated) と類似)

- `format_regexp_skip_unmatched` — [UInt8](/sql-reference/data-types/int-uint.md)。 `format_regexp` 式がインポートされたデータと一致しない場合に例外をスローする必要があるかどうかを定義します。 `0` または `1` に設定できます。
