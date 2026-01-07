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

TabSeparated フォーマットでは、データは行単位で書き込まれます。各行には、タブで区切られた値が含まれます。各値の後にはタブが続きますが、行の最後の値の後にはタブではなく改行コードが続きます。改行コードはいずれも Unix スタイルであることを前提とします。最後の行の末尾にも改行コードが付いていなければなりません。値はテキスト形式で、引用符で囲まず、特殊文字はエスケープして書き込まれます。

このフォーマットは `TSV` という名前でも利用可能です。

`TabSeparated` フォーマットは、独自のプログラムやスクリプトでデータを処理するのに便利です。HTTP インターフェイスおよびコマンドラインクライアントのバッチモードでは、デフォルトでこのフォーマットが使用されます。また、このフォーマットを使用すると、異なる DBMS 間でデータを転送できます。たとえば、MySQL からダンプを取得して ClickHouse にインポートしたり、その逆も可能です。

`TabSeparated` フォーマットは、合計値（WITH TOTALS を使用する場合）および極値（`extremes` が 1 に設定されている場合）の出力をサポートします。この場合、合計値と極値はメイン結果の後に出力されます。メイン結果、合計値、および極値は、互いに空行で区切られます。例:

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

## データの書式設定 {#tabseparated-data-formatting}

整数は 10 進数形式で記述されます。数値は先頭に追加の「+」記号を含むことができます（パース時には無視され、書式化時には出力されません）。非負の数値には負号を含めることはできません。読み取り時には、空文字列をゼロとしてパースすること、または（符号付き型の場合）マイナス記号だけから成る文字列をゼロとしてパースすることが許可されています。対応するデータ型に収まらない数値は、エラーを出さずに別の数値としてパースされる場合があります。

浮動小数点数は 10 進数形式で記述されます。小数点にはドットが使用されます。指数表記がサポートされており、`inf`、`+inf`、`-inf`、`nan` も使用できます。浮動小数点数の表記は、小数点で始まったり終わったりすることがあります。
書式化時には、浮動小数点数の精度が失われる可能性があります。
パース時には、機械で表現可能な最近接の数値を厳密に読み取ることは要求されません。

日付は `YYYY-MM-DD` 形式で記述され、同じ形式でパースされますが、区切り文字には任意の文字を使用できます。
時刻付きの日付は `YYYY-MM-DD hh:mm:ss` 形式で記述され、同じ形式でパースされますが、区切り文字には任意の文字を使用できます。
これらはすべて、クライアントまたはサーバー（どちらがデータをフォーマットするかによって異なる）が起動した時点のシステムタイムゾーンで処理されます。時刻付きの日付については、夏時間は指定されません。そのため、ダンプに夏時間中の時刻が含まれている場合、そのダンプはデータと一意に対応せず、パース時には 2 つの時刻のうちいずれかが選択されます。
読み取り操作では、不正な日付や時刻付きの日付も、自然なオーバーフローとして、またはヌルの日付および時刻として、エラーなしでパースされる場合があります。

例外として、時刻付き日付のパースは、ちょうど 10 桁の 10 進数字から成る場合に Unix タイムスタンプ形式でのパースもサポートされます。この結果はタイムゾーンに依存しません。`YYYY-MM-DD hh:mm:ss` 形式と `NNNNNNNNNN` 形式は自動的に区別されます。

文字列は、バックスラッシュでエスケープされた特殊文字として出力されます。出力には次のエスケープシーケンスが使用されます: `\b`、`\f`、`\r`、`\n`、`\t`、`\0`、`\'`、`\\`。パースでは、これらに加えて `\a`、`\v`、`\xHH`（16 進エスケープシーケンス）、および任意の `\c` シーケンス（ここで `c` は任意の文字であり、これらのシーケンスは `c` に変換される）もサポートされます。したがって、データの読み取りでは、改行を `\n` として、`\` として、あるいは実際の改行として記述する形式をサポートします。たとえば、単語の間をスペースではなく改行で区切った文字列 `Hello world` は、次のいずれのバリエーションとしてもパースできます。

```text
Hello\nworld

Hello\
world
```

2 番目のバリアントがサポートされているのは、MySQL がタブ区切りダンプを書き出す際にこれを使用するためです。

TabSeparated 形式でデータを渡すときにエスケープが必要となる文字の最小集合は、タブ、改行 (LF)、およびバックスラッシュです。

エスケープされる記号はごく一部だけです。そのため、端末での出力が乱れてしまうような文字列値に容易に遭遇する可能性があります。

配列は角かっこ内のカンマ区切り値のリストとして書き出されます。配列内の数値要素は通常どおりにフォーマットされます。`Date` および `DateTime` 型はシングルクォートで囲んで書き出されます。文字列は、上記と同じエスケープ規則を用いてシングルクォートで囲んで書き出されます。

[NULL](/sql-reference/syntax.md) は設定 [format&#95;tsv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) に従ってフォーマットされます (デフォルト値は `\N` です)。

入力データでは、ENUM 値は名前または id として表現できます。まず入力値を ENUM 名にマッチさせようとします。失敗し、かつ入力値が数値である場合は、この数値を ENUM id にマッチさせようとします。
入力データが ENUM id のみを含む場合は、ENUM のパースを最適化するために、設定 [input&#95;format&#95;tsv&#95;enum&#95;as&#95;number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number) を有効にすることを推奨します。

[Nested](/sql-reference/data-types/nested-data-structures/index.md) 構造の各要素は配列として表現されます。

例えば次のとおりです。

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

次の `football.tsv` という名前の TSV ファイルを使用します:

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

データを挿入します：

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparated;
```

### データの読み込み {#reading-data}

`TabSeparated` 形式でデータを読み込みます。

```sql
SELECT *
FROM football
FORMAT TabSeparated
```

出力はタブ区切り形式です:

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

| Setting                                                                                                                                                          | Description                                                                                                                                                                                                                                    | Default |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSV 形式における NULL のカスタム表現。                                                                                                                                                                                                        | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | TSV 入力で空フィールドをデフォルト値として扱います。複雑なデフォルト式を使用する場合は、[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) も有効化する必要があります。 | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | TSV 形式で挿入される enum 値を enum のインデックスとして扱います。                                                                                                                                                                           | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | TSV 形式でスキーマを推論する際に、いくつかの調整とヒューリスティクスを使用します。無効化すると、すべてのフィールドは String として推論されます。                                                                                               | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | `true` に設定すると、TSV 出力形式の行末は `\n` ではなく `\r\n` になります。                                                                                                                                                                   | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | `true` に設定すると、TSV 入力形式の行末は `\n` ではなく `\r\n` になります。                                                                                                                                                                   | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | データの先頭から指定された行数をスキップします。                                                                                                                                                                                              | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | TSV 形式で名前および型を含むヘッダーを自動検出します。                                                                                                                                                                                        | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | データ末尾の空行をスキップします。                                                                                                                                                                                                            | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | TSV 形式で列数の変動を許可し、余分な列を無視し、欠損している列にはデフォルト値を使用します。                                                                                                                                                 | `false` |
