---
alias: ['TSV']
description: 'TSVフォーマットのドキュメント'
input_format: true
keywords: ['TabSeparated', 'TSV']
output_format: true
slug: /interfaces/formats/TabSeparated
title: 'TabSeparated'
---

| 入力 | 出力 | エイリアス  |
|------|------|-------------|
| ✔    | ✔    | `TSV`      |

## 説明 {#description}

TabSeparatedフォーマットでは、データは行単位で書き込まれます。各行はタブで区切られた値を含みます。各値の後にはタブが続きますが、行の最後の値の後には改行が続きます。厳密にはUnixの改行がどこでも想定されます。最後の行にも必ず改行が含まれていなければなりません。値は引用符で囲まれることなく、テキスト形式で書かれ、特殊文字はエスケープされて扱われます。

このフォーマットは`TSV`という名前でも利用できます。

`TabSeparated`フォーマットは、カスタムプログラムやスクリプトを使用してデータを処理するのに便利です。HTTPインターフェースとコマンドラインクライアントのバッチモードでデフォルトで使用されます。この形式は異なるDBMS間でデータを転送することも可能です。例えば、MySQLからダンプを取得し、ClickHouseにアップロードしたり、その逆も可能です。

`TabSeparated`フォーマットは、合計値（WITH TOTALSを使用する場合）や極値（'extremes'が1に設定されている場合）を出力することをサポートしています。この場合、合計値と極値はメインデータの後に出力されます。メイン結果、合計値、および極値は、空行で互いに区切られています。例：

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

整数は10進形式で書かれます。数値は冒頭に追加の「+」記号を持つことができます（解析時には無視され、フォーマット時には記録されません）。非負の数値には負号を含むことはできません。読み取る際、空の文字列をゼロとして解析することや、（符号付きの場合）単にマイナス符号からなる文字列をゼロとして解析することも許可されています。対応するデータ型に収まらない数値は、エラーメッセージなしで異なる数値として解析される場合があります。

浮動小数点数は10進形式で書かれます。小数点は小数点区切り記号として使用されます。指数表記もサポートされており、'inf'、'+inf'、'-inf'、'nan'が利用可能です。浮動小数点数の項目は、小数点で始まったり終わったりする場合があります。
フォーマット時には、浮動小数点数の精度が失われることがあります。
解析時には、最も近い機械的に表現可能な数値を読み取ることが必須ではありません。

日付はYYYY-MM-DD形式で書かれ、同じ形式で解析されますが、任意の文字が区切り文字として使用されることがあります。
日時付きの日付は、`YYYY-MM-DD hh:mm:ss`形式で書かれ、同じ形式で解析されますが、任意の文字が区切り文字として使用されます。
これらすべては、データをフォーマットするクライアントまたはサーバーが起動したときのシステムタイムゾーンで行われます。日時付きの日付では、サマータイムは指定されていません。したがって、ダンプがサマータイム中の時刻を持つ場合、ダンプはデータと明確に一致せず、解析では2つの時刻のいずれかが選択されます。
読み取り操作を行う際に、不正な日付や日時を持つ日付は、自然なオーバーフローまたはnullの日付や時刻として解析されることがあり、エラーメッセージは表示されません。

例外として、日時付きの日付はUnixタイムスタンプ形式でも解析がサポートされますが、これは正確に10桁の10進数でなければなりません。結果はタイムゾーンに依存しません。`YYYY-MM-DD hh:mm:ss`形式と`NNNNNNNNNN`形式は自動的に区別されます。

文字列はバックスラッシュでエスケープされた特殊文字を含む形で出力されます。出力のために次のエスケープシーケンスが使用されます：`\b`、`\f`、`\r`、`\n`、`\t`、`\0`、`\'`、`\\`。解析では、`\a`、`\v`、および`\xHH`（16進エスケープシーケンス）および任意の`\c`シーケンス（ここで`c`は任意の文字）もサポートされており、これらのシーケンスは`c`に変換されます。したがって、データの読み取りは、改行が`\n`または`\`として書かれる場合、または改行として書かれる場合の形式をサポートします。例えば、単語間にスペースの代わりに改行を持つ文字列`Hello world`は、以下のいずれかのバリエーションで解析できます：

```text
Hello\nworld

Hello\
world
```

2つ目のバリエーションは、MySQLがタブ区切りダンプを書き出す際に使用するためサポートされています。

TabSeparatedフォーマットでデータを渡す際にエスケープが必要な最小限の文字セット：タブ、改行（LF）、およびバックスラッシュ。

エスケープされる記号のセットは非常に限られています。出力時に端末が壊れてしまう文字列値に遭遇することは簡単です。

配列は角括弧内のカンマ区切り値のリストとして書かれます。配列の数値項目は通常通りフォーマットされます。`Date`および`DateTime`型は単一引用符で書かれます。文字列も同じエスケープルールの単一引用符で書かれます。

[NULL](/sql-reference/syntax.md)は設定 [format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) に従ってフォーマットされます（デフォルト値は`\N`です）。

入力データ内では、ENUM値は名前またはIDとして示されることがあります。最初に、入力値をENUM名にマッチさせようとします。失敗すると、入力値が数値であれば、この数値をENUM IDにマッチさせようとします。
入力データがENUM IDのみを含む場合は、ENUMの解析を最適化するために設定 [input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)を有効にすることをお勧めします。

[Nested](/sql-reference/data-types/nested-data-structures/index.md)構造の各要素は配列として表されます。

例えば：

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

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                          | 説明                                                                                                                                                                                                                                    | デフォルト |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSVフォーマットにおけるカスタムNULL表現。                                                                                                                                                                                                      | `\N`        |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | TSV入力内の空フィールドをデフォルト値として扱う。複雑なデフォルト式の場合は、設定 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) も有効にする必要があります。 | `false`     |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | TSVフォーマット内の挿入されたENUM値をENUMインデックスとして扱う。                                                                                                                                                                          | `false`     |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | TSVフォーマットのスキーマ推論のために、いくつかの調整とヒューリスティックを使用する。無効にすると、すべてのフィールドは文字列として推論されます。                                                                                                           | `true`      |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | 真に設定されている場合、TSV出力フォーマットの改行は`\r\n`ではなく`\n`になります。                                                                                                                                                    | `false`     |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | 真に設定されている場合、TSV入力フォーマットの改行は`\r\n`ではなく`\n`になります。                                                                                                                                                     | `false`     |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | データの最初に指定された行数をスキップします。                                                                                                                                                                                             | `0`        |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | TSVフォーマットで名前と型のヘッダを自動的に検出します。                                                                                                                                                                                  | `true`      |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | データの最後のトレーリング空行をスキップします。                                                                                                                                                                                        | `false`     |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | TSVフォーマット内で変動数のカラムを許可し、余分なカラムを無視し、欠落したカラムにデフォルト値を使用します。                                                                                                                                        | `false`     |
