---
alias: ['TSV']
description: 'TSV 形式のドキュメント'
input_format: true
keywords: ['TabSeparated', 'TSV']
output_format: true
slug: /interfaces/formats/TabSeparated
title: 'TabSeparated'
doc_type: 'reference'
---

| Input | Output | Alias  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |



## 説明 {#description}

TabSeparated形式では、データは行単位で書き込まれます。各行にはタブで区切られた値が含まれます。各値の後にはタブが続きますが、行の最後の値の後には改行が続きます。すべての箇所で厳密にUnix改行が想定されています。最後の行も末尾に改行を含む必要があります。値はテキスト形式で書き込まれ、引用符で囲まれることはなく、特殊文字はエスケープされます。

この形式は`TSV`という名前でも利用できます。

`TabSeparated`形式は、カスタムプログラムやスクリプトを使用したデータ処理に便利です。この形式は、HTTPインターフェースおよびコマンドラインクライアントのバッチモードでデフォルトで使用されます。また、この形式により異なるDBMS間でのデータ転送が可能になります。例えば、MySQLからダンプを取得してClickHouseにアップロードしたり、その逆を行うことができます。

`TabSeparated`形式は、合計値の出力(WITH TOTALSを使用する場合)および極値の出力('extremes'が1に設定されている場合)をサポートしています。これらの場合、合計値と極値はメインデータの後に出力されます。メイン結果、合計値、極値は空行で互いに区切られます。例:

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

整数は10進数形式で記述されます。数値の先頭に追加の「+」文字を含めることができます(解析時には無視され、フォーマット時には記録されません)。非負の数値には負の符号を含めることはできません。読み取り時には、空文字列をゼロとして解析すること、または(符号付き型の場合)マイナス記号のみで構成される文字列をゼロとして解析することが許可されています。対応するデータ型に収まらない数値は、エラーメッセージなしで別の数値として解析される場合があります。

浮動小数点数は10進数形式で記述されます。小数点にはドットが使用されます。指数表記がサポートされており、'inf'、'+inf'、'-inf'、'nan'もサポートされています。浮動小数点数のエントリは小数点で始まるか終わることができます。
フォーマット時には、浮動小数点数の精度が失われる可能性があります。
解析時には、最も近い機械表現可能な数値を読み取ることは厳密には要求されません。

日付はYYYY-MM-DD形式で記述され、同じ形式で解析されますが、区切り文字として任意の文字を使用できます。
日時は`YYYY-MM-DD hh:mm:ss`形式で記述され、同じ形式で解析されますが、区切り文字として任意の文字を使用できます。
これらはすべて、クライアントまたはサーバーが起動した時点のシステムタイムゾーンで発生します(どちらがデータをフォーマットするかによります)。日時の場合、夏時間は指定されません。そのため、ダンプに夏時間中の時刻が含まれている場合、ダンプはデータと明確に一致せず、解析は2つの時刻のいずれかを選択します。
読み取り操作中、不正な日付や日時は、エラーメッセージなしで自然なオーバーフローまたはnull日付・時刻として解析される可能性があります。

例外として、日時の解析は、正確に10桁の10進数で構成されている場合、Unixタイムスタンプ形式でもサポートされています。結果はタイムゾーンに依存しません。`YYYY-MM-DD hh:mm:ss`形式と`NNNNNNNNNN`形式は自動的に区別されます。

文字列は、バックスラッシュでエスケープされた特殊文字とともに出力されます。出力には次のエスケープシーケンスが使用されます:`\b`、`\f`、`\r`、`\n`、`\t`、`\0`、`\'`、`\\`。解析では、`\a`、`\v`、`\xHH`(16進エスケープシーケンス)、および任意の`\c`シーケンス(`c`は任意の文字)もサポートされます(これらのシーケンスは`c`に変換されます)。したがって、データの読み取りでは、改行を`\n`または`\`、または改行として記述できる形式がサポートされます。たとえば、単語間にスペースの代わりに改行がある文字列`Hello world`は、次のいずれかのバリエーションで解析できます:

```text
Hello\nworld

Hello\
world
```

2番目のバリエーションは、MySQLがタブ区切りダンプを書き込む際に使用するためサポートされています。

TabSeparated形式でデータを渡す際にエスケープする必要がある最小限の文字セット:タブ、改行(LF)、バックスラッシュ。

エスケープされるのは少数の記号のみです。ターミナルが出力時に破損させる文字列値に簡単に遭遇する可能性があります。

配列は、角括弧内のカンマ区切り値のリストとして記述されます。配列内の数値項目は通常どおりフォーマットされます。`Date`型と`DateTime`型は単一引用符で囲まれて記述されます。文字列は、上記と同じエスケープ規則で単一引用符で囲まれて記述されます。

[NULL](/sql-reference/syntax.md)は、設定[format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)に従ってフォーマットされます(デフォルト値は`\N`)。

入力データでは、ENUM値は名前またはIDとして表現できます。まず、入力値をENUM名と照合しようとします。失敗し、入力値が数値である場合、この数値をENUM IDと照合しようとします。
入力データにENUM IDのみが含まれている場合、ENUM解析を最適化するために設定[input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)を有効にすることをお勧めします。

[Nested](/sql-reference/data-types/nested-data-structures/index.md)構造の各要素は配列として表現されます。

例:

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
INSERT INTO nestedt VALUES ( 1, [1], ['a'])
```

```sql
SELECT * FROM nestedt FORMAT TSV
```

```response
1  [1]    ['a']
```


## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

以下の内容を持つ `football.tsv` という名前のTSVファイルを使用します:

```tsv
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

データを挿入します:

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparated;
```

### データの読み取り {#reading-data}

`TabSeparated` 形式を使用してデータを読み取ります:

```sql
SELECT *
FROM football
FORMAT TabSeparated
```

出力はタブ区切り形式で表示されます:

```tsv
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```


## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                  | 説明                                                                                                                                                                                                                            | デフォルト |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSVフォーマットにおけるカスタムNULL表現。                                                                                                                                                                                              | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | TSV入力の空フィールドをデフォルト値として扱います。複雑なデフォルト式の場合、[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)も有効にする必要があります。 | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | TSVフォーマットで挿入されたenum値をenumインデックスとして扱います。                                                                                                                                                                             | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | TSVフォーマットでスキーマを推論する際に、調整とヒューリスティックを使用します。無効にすると、すべてのフィールドは文字列として推論されます。                                                                                                                     | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | trueに設定すると、TSV出力フォーマットの行末が`\n`の代わりに`\r\n`になります。                                                                                                                                                    | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | trueに設定すると、TSV入力フォーマットの行末が`\n`の代わりに`\r\n`になります。                                                                                                                                                     | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | データの先頭から指定された行数をスキップします。                                                                                                                                                                               | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | TSVフォーマットで名前と型を含むヘッダーを自動的に検出します。                                                                                                                                                                        | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | データの末尾にある末尾の空行をスキップします。                                                                                                                                                                                          | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | TSVフォーマットで可変数の列を許可し、余分な列を無視し、欠落している列にはデフォルト値を使用します。                                                                                                                        | `false` |
