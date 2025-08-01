---
alias:
- 'TSV'
description: 'TSVフォーマットのドキュメント'
input_format: true
keywords:
- 'TabSeparated'
- 'TSV'
output_format: true
slug: '/interfaces/formats/TabSeparated'
title: 'TabSeparated'
---




| Input | Output | Alias  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |

## 説明 {#description}

TabSeparatedフォーマットでは、データは行単位で書き込まれます。各行はタブで区切られた値を含みます。各値の後にはタブが続きますが、行の最後の値の後には行末が続きます。厳密にUnixの行末がどこでも仮定されます。最後の行にも終了時に行末が含まれている必要があります。値はテキストフォーマットで書かれ、引用符で囲まれることはなく、特殊文字はエスケープされます。

このフォーマットは `TSV` という名前でも利用可能です。

`TabSeparated` フォーマットは、カスタムプログラムやスクリプトを使用してデータを処理するのに便利です。HTTPインターフェースやコマンドラインクライアントのバッチモードでデフォルトで使用されます。このフォーマットでは、異なるDBMS間でデータを転送することも可能です。例えば、MySQLからダンプを取得し、ClickHouseにアップロードすることができますし、その逆も可能です。

`TabSeparated` フォーマットは、合計値を出力すること（WITH TOTALSを使用する場合）や、極端な値を出力すること（'extremes' が 1 に設定されている場合）をサポートしています。これらのケースでは、合計値と極端な値がメインデータの後に出力されます。メイン結果、合計値、および極端な値は、空行によって互いに区切られています。例：

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

整数は10進形式で書かれます。数字には先頭に追加の "+" が含まれることがあります（解析時には無視され、フォーマット時には記録されません）。非負の数字には負の符号を含むことはできません。読み取り時には、空文字列をゼロとして解析したり（符号付き型の場合）、単にマイナス符号だけの文字列をゼロとして解析したりすることが許可されています。対応するデータ型に収まらない数字は、エラーメッセージなしで別の数字として解析される場合があります。

浮動小数点数は10進形式で書かれ、点が小数点として使用されます。指数表記がサポートされており、'inf', '+inf', '-inf', 'nan' もサポートされています。浮動小数点数のエントリは、小数点で始まったり終わったりすることがあります。フォーマット時には、浮動小数点数で精度が失われる場合があります。解析時には、最も近いマシンで表現可能な数値を厳密に読む必要はありません。

日付はYYYY-MM-DD形式で書かれ、同じ形式で解析されますが、任意の文字が区切りに使用されます。時間を含む日付は `YYYY-MM-DD hh:mm:ss` 形式で書かれ、同じ形式で解析されますが、任意の文字が区切りに使用されます。これらはすべて、クライアントまたはサーバーが起動したときのシステムのタイムゾーンで発生します（どちらがデータをフォーマットするかに依存します）。時間を含む日付については、夏時間は指定されていません。したがって、ダンプが夏時間中の時間を含んでいる場合、ダンプはデータと一意に一致せず、解析は2つの時間のうちの1つを選択します。読み取り操作中、無効な日付や時間を含む日付は自然にオーバーフローとして解析されるか、またはnullの日付および時間として解析され、エラーメッセージは表示されません。

例外として、時間を含む日付の解析はUnixタイムスタンプ形式でもサポートされており、その形式はちょうど10桁の10進数から構成される必要があります。結果はタイムゾーンに依存しません。形式 `YYYY-MM-DD hh:mm:ss` と `NNNNNNNNNN` は自動的に区別されます。

文字列はバックスラッシュでエスケープされた特殊文字で出力されます。出力に使用されるエスケープシーケンスは次のとおりです： `\b`, `\f`, `\r`, `\n`, `\t`, `\0`, `\'`, `\\` 。解析も `\a`, `\v`, および `\xHH`（16進エスケープシーケンス）や任意の `\c` シーケンスをサポートしており、ここで `c` は任意の文字です（これらのシーケンスは `c` に変換されます）。したがって、データの読み取りは、行末を `\n` または `\` として書き込むか、行末としてもサポートされる形式をサポートしています。例えば、単語間にスペースではなく行末がある文字列 `Hello world` は、以下のいずれかのバリエーションで解析可能です：

```text
Hello\nworld

Hello\
world
```

2番目のバリエーションは、MySQLがタブ区切りのダンプを作成するときにこれを使用するため、サポートされています。

TabSeparatedフォーマットでデータを渡す際にエスケープする必要がある最小限の文字セットは、タブ、行末（LF）、およびバックスラッシュです。

エスケープされるシンボルのセットは小さく、出力結果が壊れるような文字列値に遭遇することがあります。

配列は、角括弧内のカンマ区切りの値のリストとして書かれます。配列内の数値項目は通常どおりフォーマットされます。`Date` および `DateTime` 型は単一の引用符で書かれます。文字列は、上記と同じエスケープルールに従って単一の引用符で書かれます。

[NULL](/sql-reference/syntax.md)は、設定 [format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) に従ってフォーマットされます（デフォルト値は `\N` です）。

入力データでは、ENUM値は名前またはIDとして表現できます。まず、入力値をENUM名に一致させようとします。失敗した場合、入力値が数値であれば、その数値をENUM IDに一致させようとします。入力データがENUM IDのみを含む場合、ENUMの解析を最適化するために設定 [input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number) を有効にすることを推奨します。

[Nested](/sql-reference/data-types/nested-data-structures/index.md) 構造の各要素は配列として表されます。

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
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSVフォーマットにおけるカスタムNULL表示。                                                                                                                                                                                                      | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | TSV入力の空フィールドをデフォルト値として扱います。複雑なデフォルト式には [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) も有効にする必要があります。 | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | TSV形式で挿入されたENUM値をENUMインデックスとして扱います。                                                                                                                                                                                     | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | TSVフォーマットでスキーマを推測するために、いくつかの調整とヒューリスティックを使用します。無効にすると、すべてのフィールドが文字列として推測されます。                                                                                                                             | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | trueに設定されている場合、TSV出力フォーマットの行の終わりは `\r\n` となり、 `\n` にはなりません。                                                                                                                                                            | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | trueに設定されている場合、TSV入力フォーマットの行の終わりは `\r\n` となり、 `\n` にはなりません。                                                                                                                                                             | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | データの先頭で指定した行数をスキップします。                                                                                                                                                                                       | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | TSVフォーマットで名称と型を自動的に検出します。                                                                                                                                                                                | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | データの末尾でトレーリング空行をスキップします。                                                                                                                                                                                                  | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | TSVフォーマットで変則的なカラム数を許可し、余分なカラムを無視し、不足しているカラムにはデフォルト値を使用します。                                                                                                                                | `false` |
