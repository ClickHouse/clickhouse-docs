---
title : TabSeparated
slug: /interfaces/formats/TabSeparated
keywords : [TabSeparated, TSV]
input_format: true
output_format: true
alias: ['TSV']
---

| 入力 | 出力 | エイリアス  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |

## 説明 {#description}

TabSeparatedフォーマットでは、データは行単位で書き込まれます。各行にはタブで区切られた値が含まれます。各値はタブの後に続きますが、行の最後の値の後には改行が付きます。厳密にUnix形式の改行がどこでも想定されます。最後の行も終わりに改行を含む必要があります。値はテキスト形式で書かれ、引用符で囲まれず、特殊文字はエスケープされます。

このフォーマットは`TSV`という名前でも利用可能です。

`TabSeparated`フォーマットは、カスタムプログラムやスクリプトを使用してデータを処理するのに便利です。HTTPインタフェースやコマンドラインクライアントのバッチモードでデフォルトで使用されます。このフォーマットは、異なるDBMS間でデータを転送することも可能です。たとえば、MySQLからダンプを取得し、それをClickHouseにアップロードすることができますし、その逆も可能です。

`TabSeparated`フォーマットは、合計値（WITH TOTALSを使用する場合）や極端な値（'extremes'が1に設定されている場合）の出力をサポートしています。これらの場合、合計値と極端な値は主要なデータの後に出力されます。主要な結果、合計値、および極端な値は互いに空行で区切られます。例:

``` sql
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

## データフォーマッティング {#tabseparated-data-formatting}

整数は10進形式で書かれます。数字の先頭に余分な「+」文字を含めることができます（解析時には無視され、フォーマット時には記録されません）。非負の数字には負号を含むことはできません。読み込み時には、空の文字列をゼロとして解析したり、（符号付き型の場合）ただのマイナス符号からなる文字列をゼロとして解析することが許可されます。対応するデータ型に収まらない数字は、エラーメッセージなしで異なる数値として解析される場合があります。

浮動小数点数は10進形式で書かれます。小数点は小数の区切りとして使用されます。指数形式もサポートされており、'inf'、'+inf'、'-inf'、および'nan'もサポートされています。浮動小数点数の値は小数点で始まったり終わったりすることがあります。書式設定の際に浮動小数点数の精度が失われる場合があります。解析の際には、出力可能な最も近い数値を厳密に読み取る必要はありません。

日付はYYYY-MM-DD形式で書かれ、同じ形式で解析されますが、任意の文字を区切りとして使用できます。時刻を含む日付は`YYYY-MM-DD hh:mm:ss`形式で書かれ、同じ形式で解析されますが、任意の文字を区切りとして使用します。これらは、クライアントまたはサーバーがデータをフォーマットする際に起動した時のシステムのタイムゾーンで行われます。時刻を含む日付については、DST（夏時間）は指定されていません。したがって、ダンプに夏時間中の時刻が含まれている場合、そのダンプはデータと完全に一致せず、解析では二つの時刻のうちの一つが選択されます。読み取り操作中は、不正な日付や時刻を含む日付も自然オーバーフローまたはnullの日付および時刻として解析され、エラーメッセージは表示されません。

例外として、時刻を含む日付は、正確に10桁の10進数で構成される場合にUnixタイムスタンプ形式でも解析がサポートされています。この結果は、タイムゾーンに依存しません。形式`YYYY-MM-DD hh:mm:ss`と`NNNNNNNNNN`は自動的に区別されます。

文字列はバックスラッシュエスケープされた特殊文字で出力されます。出力に使用されるエスケープシーケンスは次の通りです: `\b`, `\f`, `\r`, `\n`, `\t`, `\0`, `\'`, `\\`。解析では、`\a`、`\v`、および`\xHH`（16進エスケープシーケンス）や任意の`\c`シーケンスもサポートされており、ここで`c`は任意の文字です（これらのシーケンスは`c`に変換されます）。したがって、データの読み取りは、行末を`\n`または`\`として書き込むことができるフォーマットをサポートします。たとえば、単語の間にスペースの代わりに改行がある`Hello world`という文字列は、以下のいずれかの変種で解析できます。

``` text
Hello\nworld

Hello\
world
```

二番目の変種は、MySQLがタブ区切りのダンプを書く際に使用するためサポートされています。

TabSeparatedフォーマットでデータを渡す際にエスケープする必要のある最小限の文字のセット: タブ、行末 (LF)、およびバックスラッシュ。

エスケープされるのは限られた記号のみです。出力時に端末が壊れるような文字列値に出くわすことが簡単にあります。

配列は角括弧内のカンマ区切りの値のリストとして書かれます。配列の数値項目は通常通りフォーマットされます。`Date`および`DateTime`型は単一引用符で囲まれます。文字列は上記と同じエスケープルールで単一引用符で囲まれます。

[NULL](/sql-reference/syntax.md)は設定[format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)に従ってフォーマットされます（デフォルト値は`\N`です）。

入力データにおいて、ENUM値は名前またはIDとして表現できます。まず、入力値がENUM名に一致するか試みます。失敗した場合、入力値が数値であれば、この数値がENUM IDに一致するかを試みます。入力データがENUM IDのみを含む場合、ENUM解析を最適化するために設定[input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)を有効にすることが推奨されます。

[Nested](/sql-reference/data-types/nested-data-structures/index.md)構造の各要素は配列として表現されます。

例えば：

``` sql
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

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                          | 説明                                                                                                                                                                                                                                    | デフォルト |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSVフォーマットにおけるカスタムNULL表現。                                                                                                                                                                                                      | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | TSV入力の空のフィールドをデフォルト値として扱う。複雑なデフォルト式については、[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)も有効にする必要があります。 | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | TSVフォーマットで挿入されたENUM値をENUMインデックスとして扱う。                                                                                                                                                                                     | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | TSVフォーマットでスキーマを推測するための一部の調整やヒューリスティックを使用する。無効にすると、すべてのフィールドが文字列として推測されます。                                                                                                                             | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | これがtrueに設定されると、TSV出力フォーマットの行末は`\r\n`となります。                                                                                                                                                            | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | これがtrueに設定されると、TSV入力フォーマットの行末は`\r\n`となります。                                                                                                                                                             | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | データの先頭で指定された行数をスキップします。                                                                                                                                                                                       | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | TSVフォーマットの名前と型を持つヘッダーを自動的に検出します。                                                                                                                                                                                | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | データの最後にある末尾の空行をスキップします。                                                                                                                                                                                                  | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | TSVフォーマットで可変数のカラムを許可し、追加のカラムを無視し、欠落しているカラムにはデフォルト値を使用します。                                                                                                                                | `false` |
