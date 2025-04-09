---
title: TabSeparated
slug: /interfaces/formats/TabSeparated
keywords: [TabSeparated, TSV]
input_format: true
output_format: true
alias: ['TSV']
---

| 入力 | 出力 | 別名  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |

## 説明 {#description}

TabSeparated 形式では、データは行ごとに書き込まれます。各行はタブで区切られた値を含みます。各値の後にはタブが続きますが、行の最後の値の後には改行が続きます。厳密に Unix 改行が全体で想定されています。最後の行にも最後に改行を含める必要があります。値はテキスト形式で、引用符で囲まれず、特殊文字はエスケープされます。

この形式は `TSV` の名前でも利用可能です。

`TabSeparated` 形式はカスタムプログラムやスクリプトを使用してデータを処理するのに便利です。HTTP インターフェースではデフォルトで使用され、コマンドラインクライアントのバッチモードでも使用されます。この形式は異なる DBMS 間でのデータ転送も可能です。例えば、MySQL からダンプを取得して ClickHouse にアップロードすることができますし、その逆も可能です。

`TabSeparated` 形式は、合計値の出力（WITH TOTALS を使用する場合）や極値（'extremes' が 1 に設定されている場合）をサポートしています。これらの場合、合計値と極値は主データの後に出力されます。主な結果、合計値、および極値はそれぞれ空行で区切られます。例:

```sql
SELECT EventDate, count() AS c FROM test.hits GROUP BY EventDate WITH TOTALS ORDER BY EventDate FORMAT TabSeparated

2014-03-17      1406958
2014-03-18      1383658
2014-03-19      1405797
2014-03-20      1353623
2014-03-21      1245779
2014-03-22      1031592
2014-03-23      1046491

1970-01-01      8873898

2014-03-17      1031592
2014-03-23      1406958
```

## データフォーマット {#tabseparated-data-formatting}

整数は十進数形式で書かれます。数値は先頭に追加の "+" 文字を含むことができ（解析時には無視され、フォーマット時には記録されません）、非負の数は負号を含むことはできません。読み取る際には、空の文字列をゼロとして解析したり、（符号付き型の場合）単に負号だけの文字列をゼロとして解析することが許可されています。対応するデータ型に収まらない数値は、エラーメッセージなしで異なる数値として解析されることがあります。

浮動小数点数は十進数形式で書かれます。小数点は小数セパレーターとして使用されます。指数表記がサポートされており、'inf'、'+inf'、'-inf'、および 'nan' もサポートされています。浮動小数点数のエントリは、小数点で始まったり終わったりすることがあります。フォーマット中、浮動小数点数については精度が失われることがあります。解析中、最も近いマシン表現可能な数を読み取ることは厳密には要求されません。

日付は YYYY-MM-DD 形式で書かれ、同じ形式で解析されますが、任意の文字をセパレーターとして使用できます。時間を含む日付は `YYYY-MM-DD hh:mm:ss` 形式で書かれ、同じ形式で解析されますが、任意の文字をセパレーターとして使用します。これはすべて、クライアントまたはサーバーがデータをフォーマットする時点でのシステムタイムゾーンで発生します。時間を含む日付については、夏時間は指定されません。したがって、ダンプが夏時間中の時間を持っている場合、そのダンプはデータと一意に一致せず、解析では2つの時間のうちの1つが選択されます。読み取り操作中、不正な日付や時間を含む日付は、自然なオーバーフローまたはヌル日付および時間として解析されることがあり、エラーメッセージは表示されません。

例外として、時間を含む日付は Unix タイムスタンプ形式でもサポートされており、正確に10桁の十進数から成る場合に限ります。結果はタイムゾーンに依存しません。形式 `YYYY-MM-DD hh:mm:ss` と `NNNNNNNNNN` は自動的に区別されます。

文字列はバックスラッシュでエスケープされた特殊文字で出力されます。出力には次のエスケープシーケンスが使用されます: `\b`、`\f`、`\r`、`\n`、`\t`、`\0`、`\'`、`\\`。解析でも `\a`、`\v`、および `\xHH`（16進エスケープシーケンス）や任意の `\c` シーケンスがサポートされており、ここで `c` は任意の文字です（これらのシーケンスは `c` に変換されます）。したがって、データの読み取りでは、改行を `\n` または `\` として書いたり、単に改行として書いたりする形式がサポートされています。例えば、"Hello world" の間にスペースではなく改行を含む文字列は、次のいずれかの形式で解析できます:

```text
Hello\nworld

Hello\
world
```

2番目の形式は、MySQL がタブ区切りのダンプを書くときに使用するため、サポートされています。

TabSeparated 形式でデータを渡す際にエスケープが必要な最小限の文字セットは、タブ、行送り（LF）、およびバックスラッシュです。

エスケープされるシンボルのセットはわずかです。そのため、出力時にターミナルが壊れてしまう文字列の値に簡単に遭遇することがあります。

配列は角括弧で囲まれたコンマ区切りの値のリストとして書かれます。配列内の数値アイテムは通常通りフォーマットされます。`Date` および `DateTime` 型はシングルクオートで書かれます。文字列は上記と同じエスケープルールでシングルクオートで書かれます。

[NULL](/sql-reference/syntax.md) は設定 [format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) に従ってフォーマットされます（デフォルト値は `\N` です）。

入力データにおいて、ENUM 値は名前または ID として表現できます。最初に、入力値を ENUM 名に一致させようとします。失敗した場合、入力値が数値であれば、その数値を ENUM ID に一致させようとします。入力データが ENUM ID のみを含む場合、ENUM 解析を最適化するために設定 [input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number) を有効にすることが推奨されます。

[Nested](/sql-reference/data-types/nested-data-structures/index.md) 構造の各要素は配列として表現されます。

例えば:

```sql
CREATE TABLE nestedt
(
    `id` UInt8,
    `aux` Nested(
        a UInt8,
        b String
    )
)
ENGINE = TinyLog
```
```sql
INSERT INTO nestedt Values ( 1, [1], ['a'])
```
```sql
SELECT * FROM nestedt FORMAT TSV
```

```response
1  [1]    ['a']
```

## 使用例 {#example-usage}

## 形式設定 {#format-settings}

| 設定                                                                                                                                                          | 説明                                                                                                                                                                                                                                    | デフォルト |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSV 形式でのカスタム NULL 表現。                                                                                                                                                                                                      | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | TSV 入力での空白フィールドをデフォルト値として扱います。複雑なデフォルト式の場合は [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) も有効にする必要があります。 | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | TSV 形式で挿入された ENUM 値を ENUM インデックスとして扱います。                                                                                                                                                                                     | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | TSV 形式でスキーマを推測するためにいくつかの変更とヒューリスティックを使用します。無効にした場合、すべてのフィールドは文字列として推測されます。                                                                                                                             | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | true に設定されている場合、TSV 出力形式の行末は `\r\n` になります。                                                                                                                                                            | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | true に設定されている場合、TSV 入力形式の行末は `\r\n` になります。                                                                                                                                                             | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | データの先頭から指定された行数をスキップします。                                                                                                                                                                                       | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | TSV 形式で名前とタイプを持つヘッダーを自動的に検出します。                                                                                                                                                                                | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | データの最後の空行をスキップします。                                                                                                                                                                                                  | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | TSV 形式で可変数のカラムを許可し、余分なカラムを無視して欠けているカラムではデフォルト値を使用します。                                                                                                                                | `false` |
