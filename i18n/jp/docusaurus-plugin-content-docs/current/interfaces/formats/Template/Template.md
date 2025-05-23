---
'alias': []
'description': 'Template フォーマットのドキュメント'
'input_format': true
'keywords':
- 'Template'
'output_format': true
'slug': '/interfaces/formats/Template'
'title': 'テンプレート'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

他の標準形式が提供するよりも多くのカスタマイズが必要な場合、`Template`形式ではユーザーが値のプレースホルダーを含むカスタムフォーマット文字列を指定し、データに対するエスケープルールを定義できます。

以下の設定を使用します：

| 設定                                                                                                  | 説明                                                                                                                         |
|----------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                            | 行のフォーマット文字列を含むファイルへのパスを指定します。                                                                |
| [`format_template_resultset`](#format_template_resultset)                                                | 行のフォーマット文字列を含むファイルへのパスを指定します。                                                                |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | 行間の区切り文字を指定します。最後の行を除くすべての行の後に印刷（または期待）されます（デフォルトは`\n`）。              |
| `format_template_row_format`                                                                             | 行のフォーマット文字列を指定します [インライン](#inline_specification)。                                                  |
| `format_template_resultset_format`                                                                       | 結果セットのフォーマット文字列を指定します [インライン](#inline_specification)。                                            |
| 他の形式の一部の設定（例:`output_format_json_quote_64bit_integers`を使用する場合の`JSON`エスケープ） |                                                                                                                              |

## 設定とエスケープルール {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

設定`format_template_row`は、以下の構文を持つ行のフォーマット文字列を含むファイルへのパスを指定します：

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

ここで：

| 構文の一部    | 説明                                                                                                        |
|---------------|-------------------------------------------------------------------------------------------------------------|
| `delimiter_i` | 値の間の区切り文字（`$`記号は`$$`としてエスケープできます）                                               |
| `column_i`    | 選択または挿入する値のカラムの名前またはインデックス（空の場合はカラムはスキップされます）                   |
| `serializeAs_i` | カラム値に対するエスケープルール。                                                                          |

以下のエスケープルールがサポートされています：

| エスケープルール        | 説明                                 |
|-------------------------|--------------------------------------|
| `CSV`, `JSON`, `XML`    | 同名の形式に類似                    |
| `Escaped`               | `TSV`に類似                          |
| `Quoted`                | `Values`に類似                       |
| `Raw`                   | エスケープなし、`TSVRaw`に類似      |   
| `None`                  | エスケープルールなし - 以下の注意を参照 |

:::note
エスケープルールが省略された場合、`None`が使用されます。`XML`は出力のみに適しています。
:::

例を見てみましょう。以下のフォーマット文字列が与えられたとします：

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

この場合、以下の値が印刷されます（`SELECT`を使用する場合）または期待されます（`INPUT`を使用する場合）、それぞれ区切り文字`Search phrase:`, `, count:`, `, ad price: $`および`;`の間に：

- `s`（エスケープルール`Quoted`を使用）
- `c`（エスケープルール`Escaped`を使用）
- `p`（エスケープルール`JSON`を使用）

例えば：

- `INSERT`の場合、以下の行は期待されるテンプレートに一致し、`Search phrase`, `count`, `ad price`の各カラムに`bathroom interior design`, `2166`, `$3`の値を読み込みます。
- `SELECT`の場合、以下の行が出力されます。これは、`bathroom interior design`, `2166`, `$3`の値がすでにテーブルの`Search phrase`, `count`, `ad price`の各カラムに格納されていると仮定しています。

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

設定`format_template_rows_between_delimiter`は、行間の区切り文字を指定します。これは、最後の行を除くすべての行の後に印刷（または期待）されます（デフォルトは`\n`）。

### format_template_resultset {#format_template_resultset}

設定`format_template_resultset`は、結果セットのフォーマット文字列を含むファイルへのパスを指定します。

結果セットのフォーマット文字列は行のフォーマット文字列と同じ構文を持っています。 
プレフィックス、サフィックス、追加情報を印刷する方法を指定することができ、以下のプレースホルダーを含みます：

- `data`は、`format_template_row`形式のデータを持つ行で、`format_template_rows_between_delimiter`で区切られています。このプレースホルダーはフォーマット文字列内で最初のプレースホルダーである必要があります。
- `totals`は、`format_template_row`形式の合計値を持つ行です（`WITH TOTALS`を使用する場合）。
- `min`は、最小値を持つ行で、`format_template_row`形式です（極端な値が1に設定されている場合）。
- `max`は、最大値を持つ行で、`format_template_row`形式です（極端な値が1に設定されている場合）。
- `rows`は、出力行の総数です。
- `rows_before_limit`は、LIMITなしで存在したであろう最小行数です。クエリがLIMITを含む場合のみ出力されます。クエリがGROUP BYを含む場合、`rows_before_limit_at_least`は、LIMITなしで存在した正確な行数です。
- `time`は、リクエストの実行時間（秒単位）です。
- `rows_read`は、読み込まれた行の数です。
- `bytes_read`は、読み込まれたバイト数（非圧縮）です。

プレースホルダー`data`,`totals`, `min`および`max`には、エスケープルールが指定されてはならない（または`None`が明示的に指定されなければならない）。残りのプレースホルダーには、任意のエスケープルールを指定できます。

:::note
`format_template_resultset`の設定が空文字列の場合、`${data}`がデフォルト値として使用されます。
:::

挿入クエリでは、フォーマットに従って列やフィールドをスキップできます（プレフィックスまたはサフィックスを参照）。

### インライン指定 {#inline_specification}

フォーマット設定（`format_template_row`, `format_template_resultset`で設定された内容）をクラスタ内のすべてのノードにディレクトリとして展開するのが困難または不可能な場合があります。 
さらに、フォーマットが非常に単純であり、ファイルに配置する必要がないこともあります。

このような場合には、`format_template_row_format`（`format_template_row`用）および`format_template_resultset_format`（`format_template_resultset`用）を使用して、クエリ内で直接テンプレート文字列を設定できます。
ファイルへのパスではなく。

:::note
フォーマット文字列とエスケープシーケンスに関するルールは、次の場合と同じです：
- `format_template_row_format`を使用する際の[`format_template_row`](#format_template_row)。
- `format_template_resultset_format`を使用する際の[`format_template_resultset`](#format_template_resultset)。
:::

## 使用例 {#example-usage}

`Template`形式を使用する2つの例を見てみましょう。まずはデータを選択する場合、次にデータを挿入する場合です。

### データの選択 {#selecting-data}

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase ORDER BY c DESC LIMIT 5 FORMAT Template SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format', format_template_rows_between_delimiter = '\n    '
```

```text title="/some/path/resultset.format"
<!DOCTYPE HTML>
<html> <head> <title>Search phrases</title> </head>
 <body>
  <table border="1"> <caption>Search phrases</caption>
    <tr> <th>Search phrase</th> <th>Count</th> </tr>
    ${data}
  </table>
  <table border="1"> <caption>Max</caption>
    ${max}
  </table>
  <b>Processed ${rows_read:XML} rows in ${time:XML} sec</b>
 </body>
</html>
```

```text title="/some/path/row.format"
<tr> <td>${0:XML}</td> <td>${1:XML}</td> </tr>
```

結果：

```html
<!DOCTYPE HTML>
<html> <head> <title>Search phrases</title> </head>
 <body>
  <table border="1"> <caption>Search phrases</caption>
    <tr> <th>Search phrase</th> <th>Count</th> </tr>
    <tr> <td></td> <td>8267016</td> </tr>
    <tr> <td>bathroom interior design</td> <td>2166</td> </tr>
    <tr> <td>clickhouse</td> <td>1655</td> </tr>
    <tr> <td>spring 2014 fashion</td> <td>1549</td> </tr>
    <tr> <td>freeform photos</td> <td>1480</td> </tr>
  </table>
  <table border="1"> <caption>Max</caption>
    <tr> <td></td> <td>8873898</td> </tr>
  </table>
  <b>Processed 3095973 rows in 0.1569913 sec</b>
 </body>
</html>
```

### データの挿入 {#inserting-data}

```text
Some header
Page views: 5, User id: 4324182021466249494, Useless field: hello, Duration: 146, Sign: -1
Page views: 6, User id: 4324182021466249494, Useless field: world, Duration: 185, Sign: 1
Total rows: 2
```

```sql
INSERT INTO UserActivity SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format'
FORMAT Template
```

```text title="/some/path/resultset.format"
Some header\n${data}\nTotal rows: ${:CSV}\n
```

```text title="/some/path/row.format"
Page views: ${PageViews:CSV}, User id: ${UserID:CSV}, Useless field: ${:CSV}, Duration: ${Duration:CSV}, Sign: ${Sign:CSV}
```

`PageViews`, `UserID`, `Duration`および`Sign`はカラム名としてプレースホルダー内にあります。行の`Useless field`の後とサフィックスの`\nTotal rows:`の後の値は無視されます。
入力データ内のすべての区切り文字は、指定されたフォーマット文字列内の区切り文字と厳密に一致する必要があります。

### インライン指定 {#in-line-specification}

手動でMarkdownテーブルをフォーマットするのに疲れましたか？ この例では、`Template`形式とインライン指定設定を使用して、`system.formats`テーブルからいくつかのClickHouse形式の名前を`SELECT`し、Markdownテーブルとしてフォーマットするという簡単な作業を達成する方法を見てみましょう。これは、`Template`形式と設定`format_template_row_format`および`format_template_resultset_format`を使用することで簡単に実現できます。

前の例では、結果セットと行のフォーマット文字列を別々のファイルで指定し、それらのファイルへのパスをそれぞれ`format_template_resultset`および`format_template_row`設定で指定しました。ここではインラインで指定します。なぜなら、テンプレートが非常に単純であり、わずかに`|`と`-`を使ってMarkdownテーブルを作るだけだからです。設定`format_template_resultset_format`を使用して結果セットテンプレート文字列を指定します。テーブルヘッダーを作るために、`${data}`の前に`|ClickHouse Formats|\n|---|\n`を追加しました。行のテンプレート文字列に対して``|`${0:XML}`|``を指定するために、`format_template_row_format`設定を使います。`Template`形式は、与えられたフォーマットで行をプレースホルダー`${data}`に挿入します。この例ではカラムが1つのみですが、追加したい場合は `{1:XML}`, `{2:XML}`...などを行のテンプレート文字列に追加し、適切なエスケープルールを選択すればよいのです。この例では、エスケープルールを`XML`にしました。

```sql title="クエリ"
WITH formats AS
(
 SELECT * FROM system.formats
 ORDER BY rand()
 LIMIT 5
)
SELECT * FROM formats
FORMAT Template
SETTINGS
 format_template_row_format='|`${0:XML}`|',
 format_template_resultset_format='|ClickHouse Formats|\n|---|\n${data}\n'
```

見てください！ これでMarkdownテーブルを作るために手動でたくさんの`|`や`-`を追加する手間が省けました：

```response title="レスポンス"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
