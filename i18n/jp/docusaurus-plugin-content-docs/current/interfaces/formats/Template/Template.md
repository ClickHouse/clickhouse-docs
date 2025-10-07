---
'alias': []
'description': 'Templateフォーマットに関するDocumentation'
'input_format': true
'keywords':
- 'Template'
'output_format': true
'slug': '/interfaces/formats/Template'
'title': 'テンプレート'
'doc_type': 'guide'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

他の標準フォーマットが提供するよりも多くのカスタマイズが必要な場合、 
`Template`フォーマットは、ユーザーが値のためのプレースホルダーを持つ独自のカスタムフォーマット文字列を指定し、データのエスケープルールを指定できるようにします。

以下の設定を使用します：

| 設定                                                                                                  | 説明                                                                                                                |
|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                            | 行のフォーマット文字列を含むファイルへのパスを指定します。                                                     |
| [`format_template_resultset`](#format_template_resultset)                                                | 行のフォーマット文字列を含むファイルへのパスを指定します。                                                      |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | 最後の行を除く各行の後に印刷される（または期待される）デリミタを指定します（デフォルトは`\n`） |
| `format_template_row_format`                                                                             | 行のためのフォーマット文字列を指定します [インライン](#inline_specification)。                                                      |                                                                           
| `format_template_resultset_format`                                                                       | 結果セットのフォーマット文字列を指定します [インライン](#inline_specification)。                                                   |
| 他のフォーマットの一部の設定（例えば、`JSON`エスケープを使用する際の`output_format_json_quote_64bit_integers`） |                                                                                                                            |

## 設定とエスケープルール {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

設定`format_template_row`は、次の構文を持つ行のフォーマット文字列を含むファイルへのパスを指定します：

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

ここで：

| 構文の部分 | 説明                                                                                                       |
|------------|-------------------------------------------------------------------------------------------------------------------|
| `delimiter_i`  | 値の間のデリミタ（`$`記号は`$$`としてエスケープできます）                                                    |
| `column_i`     | 値を選択または挿入するカラムの名前またはインデックス（空の場合、そのカラムはスキップされます） |
| `serializeAs_i` | カラム値のためのエスケープルール。                                                                           |

次のエスケープルールがサポートされています：

| エスケープルール        | 説明                              |
|----------------------|------------------------------------------|
| `CSV`, `JSON`, `XML` | 同名のフォーマットに類似 |
| `Escaped`            | `TSV`に類似                         |
| `Quoted`             | `Values`に類似                      |
| `Raw`                | エスケープなし、`TSVRaw`に類似    |   
| `None`               | エスケープルールなし - 注記を参照        |

:::note
エスケープルールが省略された場合、`None`が使用されます。`XML`は出力のみに適しています。
:::

例を見てみましょう。次のフォーマット文字列を与えられた場合：

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

次の値が印刷されます（`SELECT`を使用する場合）または期待されます（`INPUT`を使用する場合）、 
カラム`Search phrase:`, `, count:`, `, ad price: $`および`;`デリミタの間にそれぞれ：

- `s`（エスケープルール`Quoted`付き）
- `c`（エスケープルール`Escaped`付き）
- `p`（エスケープルール`JSON`付き）

例えば：

- `INSERT`する場合、以下の行は期待されるテンプレートと一致し、カラム`Search phrase`, `count`, `ad price`に値`bathroom interior design`, `2166`, `$3`を読み込みます。
- `SELECT`する場合、以下の行が出力され、値`bathroom interior design`, `2166`, `$3`がすでにカラム`Search phrase`, `count`, `ad price`に格納されていると仮定します。  

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

設定`format_template_rows_between_delimiter`は、各行の後（最後の行を除く）に印刷される（または期待される）行間のデリミタを指定します（デフォルトは`\n`）。

### format_template_resultset {#format_template_resultset}

設定`format_template_resultset`は、結果セットのフォーマット文字列を含むファイルへのパスを指定します。

結果セットのフォーマット文字列は行のフォーマット文字列と同じ構文を持ちます。 
接頭辞、接尾辞および追加情報の印刷方法を指定でき、以下のプレースホルダーをカラム名の代わりに含みます：

- `data` は、`format_template_row`フォーマットで分離されたデータのある行を示し、`format_template_rows_between_delimiter`で区切られます。このプレースホルダーは、フォーマット文字列内で最初のプレースホルダーである必要があります。
- `totals` は、`format_template_row`フォーマットでの合計値を持つ行（WITH TOTALSを使用する場合）。
- `min` は、`format_template_row`フォーマットでの最小値を持つ行（極値が1に設定されている場合）。
- `max` は、`format_template_row`フォーマットでの最大値を持つ行（極値が1に設定されている場合）。
- `rows` は、出力行の合計数です。
- `rows_before_limit` は、LIMITがない場合にあったはずの最小行数。クエリにLIMITが含まれている場合のみ出力されます。クエリにGROUP BYが含まれている場合、`rows_before_limit_at_least`はLIMITがない場合の正確な行数です。
- `time` は、リクエストの実行時間（秒単位）です。
- `rows_read` は、読み取られた行の数です。
- `bytes_read` は、読み取られたバイト数（非圧縮）です。

プレースホルダー`data`, `totals`, `min`および`max`はエスケープルールを指定してはいけません（または`None`を明示的に指定する必要があります）。残りのプレースホルダーには任意のエスケープルールを指定できます。

:::note
`format_template_resultset`設定が空の文字列である場合、`${data}`がデフォルトの値として使用されます。
:::

挿入クエリでは、接頭辞または接尾辞がある場合は、一部のカラムやフィールドをスキップすることができます（例を参照）。

### インライン仕様 {#inline_specification}

しばしば、フォーマット構成をデプロイすることは困難あるいは不可能ですが、 
（`format_template_row`, `format_template_resultset`によって設定される）、すべてのノードにクラスタ内のテンプレートフォーマットを指定することです。 
さらに、フォーマットが非常に単純であるため、ファイル内に置く必要がない場合があります。

この場合、`format_template_row_format`（`format_template_row`用）および`format_template_resultset_format`（`format_template_resultset`用）を使用して、 
ファイル内のパスではなく、クエリ内で直接テンプレート文字列を設定できます。

:::note
フォーマット文字列およびエスケープシーケンスのルールは次のものと同じです：
- [`format_template_row`](#format_template_row)を使用する場合の`format_template_row_format`。
- [`format_template_resultset`](#format_template_resultset)を使用する場合の`format_template_resultset_format`。
:::

## 使用例 {#example-usage}

`Template`フォーマットを使用してデータを選択する例と挿入する例を見てみましょう。

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

`PageViews`, `UserID`, `Duration`および`Sign`のプレースホルダー内は、テーブル内のカラム名です。 行の`Useless field`の後、および接尾辞の`\nTotal rows:`の後の値は無視されます。
入力データ内のすべてのデリミタは、指定されたフォーマット文字列内のデリミタと厳密に一致する必要があります。

### インライン仕様 {#in-line-specification}

マークダウンテーブルを手動でフォーマットするのに疲れましたか？ この例では、`Template`フォーマットとインライン仕様設定を使用して、あるシンプルなタスク - `system.formats`テーブルからいくつかのClickHouseフォーマットの名前を`SELECT`し、それらをマークダウンテーブルとしてフォーマットする方法を見てみます。 これは`Template`フォーマットと`format_template_row_format`および`format_template_resultset_format`設定を使って簡単に達成できます。

前の例では、結果セットおよび行フォーマット文字列を別々のファイルに指定し、それらのファイルへのパスを`format_template_resultset`および`format_template_row`設定を使用してそれぞれ指定しました。 ここでは、私たちのテンプレートがわずか数個の`|`と`-`から成り、マークダウンテーブルを作成するのが単純なため、インラインでそれを行います。 結果セットのテンプレート文字列を設定`format_template_resultset_format`を使用して指定します。 テーブルヘッダーを作成するために、`${data}`の前に`|ClickHouse Formats|\n|---|\n`を追加しました。 `format_template_row_format`設定を使用して、行のテンプレート文字列`` |`{0:XML}`| ``を指定します。 `Template`フォーマットは、与えられたフォーマットを持つ行をプレースホルダー`${data}`に挿入します。 この例では、カラムは1つだけですが、もっと追加したい場合は、行テンプレート文字列に`{1:XML}`, `{2:XML}`...などを追加して、適切なエスケープルールを選択することができます。この例では、エスケープルール`XML`を選びました。 

```sql title="Query"
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

見てください！ 私たちは、マークダウンテーブルを作成するために手動で追加する必要のあるすべての`|`や`-`を追加する手間を省きました：

```response title="Response"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
