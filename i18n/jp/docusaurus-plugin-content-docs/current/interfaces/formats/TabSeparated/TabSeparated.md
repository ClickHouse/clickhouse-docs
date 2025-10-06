---
'alias':
- 'TSV'
'description': 'TSV形式に関するDocumentation'
'input_format': true
'keywords':
- 'TabSeparated'
- 'TSV'
'output_format': true
'slug': '/interfaces/formats/TabSeparated'
'title': 'TabSeparated'
'doc_type': 'reference'
---


| Input | Output | Alias  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |

## 説明 {#description}

TabSeparated 形式では、データは行ごとに書き込まれます。各行はタブで区切られた値を含んでいます。各値の後にはタブが付いており、行の最後の値の後は改行コードが付いています。厳密な Unix の改行コードがどこでも想定されています。最後の行にも末尾に改行コードが含まれている必要があります。値はテキスト形式で書かれ、引用符で囲まれず、特殊文字はエスケープされます。

この形式は `TSV` という名前でも利用可能です。

`TabSeparated` 形式は、カスタムプログラムやスクリプトを使用してデータを処理するのに便利です。HTTP インターフェースおよびコマンドラインクライアントのバッチモードでデフォルトで使用されています。この形式は、異なる DBMS 間でデータを転送することも可能です。例えば、MySQL からダンプを取得し、それを ClickHouse にアップロードすることもできますし、その逆も可能です。

`TabSeparated` 形式は、合計値（WITH TOTALSを使用した場合）および極値（'extremes'が1に設定されている場合）を出力することをサポートしています。この場合、合計値と極値は主データの後に出力されます。主要な結果、合計値、および極値は互いに空行で区切られます。例：

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

## データ形式 {#tabseparated-data-formatting}

整数は10進数形式で書き込まれます。数字は先頭に "+" 文字を含むことができます（解析時には無視され、フォーマット時には記録されません）。非負の数には負の符号を含めることはできません。読み取り時には、空の文字列をゼロとして解析することが許可されています。また、（符号付き型用に）単にマイナス符号から成る文字列をゼロとして解析することも許可されています。対応するデータ型に収まらない数字は、異なる数字として解析されることがあり、エラーメッセージは表示されません。

浮動小数点数は10進数形式で書き込まれます。小数点は小数点区切り記号として使用されます。指数表記および 'inf', '+inf', '-inf', 'nan' もサポートされています。浮動小数点数の入力は、小数点で始まったり終わったりすることがあります。
フォーマット中に浮動小数点数の精度が失われることがあります。
解析中には、最も近い機械表現可能な数を正確に読み取る必要はありません。

日付は YYYY-MM-DD 形式で書かれ、同じ形式で解析されますが、任意の文字を区切り文字として使用できます。
日時を含む日付は `YYYY-MM-DD hh:mm:ss` 形式で書かれ、同じ形式で解析されますが、任意の文字を区切り文字として使用できます。
すべてはクライアントまたはサーバーがデータをフォーマットする時点でのシステムタイムゾーンで行われます。日時を含む日付については、夏時間は明示されていません。したがって、ダンプが夏時間中の時刻を含む場合、ダンプはデータと明確に一致せず、解析によって二つの時刻のいずれかが選択されます。
読み取り操作中に、不正な日付や日時は自然なオーバーフローまたはヌル日付・ヌル時刻として解析されることがあり、エラーメッセージは表示されません。

例外として、日時を持つ日付は、正確に10桁の10進数から成るUnixタイムスタンプ形式でも解析されます。結果はタイムゾーンに依存しません。`YYYY-MM-DD hh:mm:ss` と `NNNNNNNNNN` 形式は自動的に区別されます。

文字列はバックスラッシュでエスケープされた特殊文字で出力されます。出力に使用されるエスケープシーケンスは次の通りです： `\b`, `\f`, `\r`, `\n`, `\t`, `\0`, `\'`, `\\`。解析もシーケンス `\a`, `\v`, および `\xHH`（16進エスケープシーケンス）と任意の `\c` シーケンスをサポートします。ここで `c` は任意の文字です（これらのシーケンスは`c`に変換されます）。したがって、データの読み取りは、改行を `\n` または `\` として、または改行として書き込むことができる形式をサポートしています。例えば、単語間のスペースの代わりに改行がある `Hello world` という文字列は、以下のいずれかのバリエーションで解析できます：

```text
Hello\nworld

Hello\
world
```

2番目のバリエーションは、MySQLがタブ区切りのダンプを書き込む際にこれを使用するためサポートされています。

TabSeparated 形式でデータを渡す際にエスケープする必要のある最小限の文字のセット：タブ、改行（LF）、およびバックスラッシュです。

エスケープされる記号は少数です。端末の出力で壊れてしまう文字列値に簡単に出くわすことがあります。

配列は、角カッコ内のカンマ区切りの値のリストとして書かれます。配列内の数値項目は通常通りにフォーマットされます。`Date` および `DateTime`型はシングルクォートで書かれます。文字列は上記と同じエスケープ規則に従ってシングルクォートで書かれます。

[NULL](/sql-reference/syntax.md)は設定 [format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) に従ってフォーマットされます（デフォルト値は `\N` です）。

入力データ内では、ENUM 値は名前またはIDとして表現できます。最初に、入力値を ENUM 名と一致させることを試みます。失敗した場合、入力値が数字であればこの数字を ENUM ID と一致させることを試みます。
入力データが ENUM ID のみを含む場合、ENUM 解析を最適化するために設定 [input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number) を有効にすることが推奨されます。

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

次の tsv ファイル `football.tsv` を使用します：

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

### データの読み取り {#reading-data}

`TabSeparated` 形式を使用してデータを読み取ります：

```sql
SELECT *
FROM football
FORMAT TabSeparated
```

出力はタブ区切り形式になります：

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

## 形式設定 {#format-settings}

| 設定                                                                                                                                                          | 説明                                                                                                                                                                                                                                    | デフォルト |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSV 形式におけるカスタム NULL 表現。                                                                                                                                                                                                      | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | TSV 入力の空フィールドをデフォルト値とみなす。複雑なデフォルト表現に対しては [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) を有効にする必要があります。 | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | TSV 形式で挿入された ENUM 値を ENUM インデックスとして扱う。                                                                                                                                                                                     | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | TSV 形式でスキーマを推測するためにいくつかの調整とヒューリスティックを使用。無効にすると、すべてのフィールドが文字列として推測されます。                                                                                                                             | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | これが true に設定されている場合、TSV 出力形式の行の終わりは `\r\n` になります。                                                                                                                                                            | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | これが true に設定されている場合、TSV 入力形式の行の終わりは `\r\n` になります。                                                                                                                                                             | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | データの最初に指定された行数をスキップします。                                                                                                                                                                                       | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | TSV 形式で名前と型を持つヘッダーを自動的に検出します。                                                                                                                                                                                | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | データの最後の空行をスキップします。                                                                                                                                                                                                  | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | TSV 形式で可変数のカラムを許可し、追加のカラムを無視し、欠損カラムにはデフォルト値を使用します。                                                                                                                                | `false` |
