---
title : テンプレート
slug: /interfaces/formats/Template
keywords : [テンプレート]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

他の標準フォーマットが提供するものよりも多くのカスタマイズが必要な場合に備えて、 
`Template`フォーマットは、ユーザーが値のプレースホルダを持つカスタムフォーマット文字列を指定できるようにし、データのエスケープルールを指定することを可能にします。

以下の設定を使用します：

| 設定                                                                                                  | 説明                                                                                                                |
|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                            | 行用のフォーマット文字列が含まれるファイルへのパスを指定します。                                                     |
| [`format_template_resultset`](#format_template_resultset)                                                | 結果セット用のフォーマット文字列が含まれるファイルへのパスを指定します。                                                     |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | 行の間の区切り文字を指定し、最後の行を除くすべての行の後に印刷（または期待）されます（デフォルトは`\n`） |
| `format_template_row_format`                                                                             | 行用のフォーマット文字列を指定します [インライン](#inline_specification)。                                                     |                                                                           
| `format_template_resultset_format`                                                                       | 結果セット用のフォーマット文字列を指定します [インライン](#inline_specification)。                                                   |
| 他のフォーマットの一部設定（例:`output_format_json_quote_64bit_integers`を使用する場合の`JSON`エスケープ） |                                                                                                                            |

## 設定とエスケープルール {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

設定`format_template_row`は、以下の構文を持つ行用のフォーマット文字列が含まれるファイルへのパスを指定します：

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

ここで：

| 構文の一部 | 説明                                                                                                       |
|----------------|-------------------------------------------------------------------------------------------------------------------|
| `delimiter_i`  | 値の間の区切り文字（`$`記号は`$$`としてエスケープできます）                                                    |
| `column_i`     | 選択または挿入される値を持つカラムの名前またはインデックス（空の場合、そのカラムはスキップされます） |
|`serializeAs_i` | カラム値のエスケープルール。                                                                           |

以下のエスケープルールがサポートされています：

| エスケープルール        | 説明                              |
|----------------------|------------------------------------------|
| `CSV`, `JSON`, `XML` | 同名フォーマットに類似 |
| `Escaped`            | `TSV`に類似                         |
| `Quoted`             | `Values`に類似                      |
| `Raw`                | エスケープなし、`TSVRaw`に類似    |   
| `None`               | エスケープルールなし - 以下の注を参照        |

:::note
エスケープルールが省略された場合、`None`が使用されます。`XML`は出力専用です。
:::

次の例を見てみましょう。以下のフォーマット文字列が与えられた場合：

```text
検索フレーズ: ${s:Quoted}, カウント: ${c:Escaped}, 広告価格: $$${p:JSON};
```

次の値が印刷されます（`SELECT`を使用する場合）または期待されます（`INPUT`を使用する場合）、
それぞれの区切り文字`検索フレーズ:`, `, カウント:`, `, 広告価格: $` と `;` の間で：

- `s`（エスケープルール`Quoted`で）
- `c`（エスケープルール`Escaped`で）
- `p`（エスケープルール`JSON`で）

例えば：

- `INSERT`している場合、以下の行は期待されるテンプレートと一致し、値`bathroom interior design`, `2166`, `$3`をそれぞれのカラム`検索フレーズ`, `カウント`, `広告価格`に読み込みます。
- `SELECT`している場合、以下の行が出力され、前提として値`bathroom interior design`, `2166`, `$3`はすでに`検索フレーズ`, `カウント`, `広告価格`のカラムに格納されています。  

```yaml
検索フレーズ: 'bathroom interior design', カウント: 2166, 広告価格: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

設定`format_template_rows_between_delimiter`は、各行の後、最後の行を除いて印刷（または期待）される行の間の区切り文字を指定します（デフォルトは`\n`）。

### format_template_resultset {#format_template_resultset}

設定`format_template_resultset`は、結果セット用のフォーマット文字列が含まれるファイルへのパスを指定します。 

結果セット用のフォーマット文字列は、行用のフォーマット文字列と同じ構文を持ちます。 
プレフィックス、サフィックスを指定し、追加情報を印刷する方法を含むことができ、次のプレースホルダをカラム名の代わりに含みます：

- `data`は、`format_template_row`形式のデータ行であり、`format_template_rows_between_delimiter`で区切られています。このプレースホルダはフォーマット文字列の最初のプレースホルダである必要があります。
- `totals`は、`format_template_row`形式の合計値を持つ行（`WITH TOTALS`を使用する場合）。
- `min`は、`format_template_row`形式の最小値を持つ行（エクストリームが1に設定されている場合）。
- `max`は、`format_template_row`形式の最大値を持つ行（エクストリームが1に設定されている場合）。
- `rows`は出力行の総数です。
- `rows_before_limit`は、LIMITなしで存在したであろう最小行数です。クエリにLIMITが含まれている場合のみ出力されます。クエリにGROUP BYが含まれている場合、`rows_before_limit_at_least`はLIMITなしで存在したであろう正確な行数です。
- `time`はリクエストの実行時間（秒）です。
- `rows_read`は読み込まれた行数です。
- `bytes_read`は読み込まれたバイト数（非圧縮）です。

プレースホルダ`data`, `totals`, `min`および`max`にはエスケープルールを指定してはならず（または`None`を明示的に指定しなければなりません）。残りのプレースホルダには任意のエスケープルールを指定できます。

:::note
`format_template_resultset`設定が空文字列の場合、`${data}`がデフォルト値として使用されます。
:::

挿入クエリでは、プレフィックスまたはサフィックスがある場合、いくつかのカラムまたはフィールドをスキップすることが可能です（例参照）。

### インライン仕様 {#inline_specification}

フォーマット設定をデプロイすることはしばしば困難であったり不可能な場合があります。
（`format_template_row`, `format_template_resultset`によって設定された）テンプレートフォーマットのために、クラスターのすべてのノードにディレクトリを使用するさまざまな設定。 
さらに、フォーマットが非常に単純であるため、ファイルに配置する必要がないこともあります。

このような場合、`format_template_row_format`（`format_template_row`の場合）および`format_template_resultset_format`（`format_template_resultset`の場合）を使用して、
フォーマット文字列をクエリ内に直接設定できます。
ファイルを含んでいるパスとしてではなく。

:::note
フォーマット文字列およびエスケープシーケンスのルールは、以下のものと同じです：
- [`format_template_row`](#format_template_row)を使用する場合の`format_template_row_format`。
- [`format_template_resultset`](#format_template_resultset)を使用する場合の`format_template_resultset_format`。
:::

## 例の使用法 {#example-usage}

`Template`フォーマットを使用する方法の2つの例を見てみましょう。最初にデータを選択し、次にデータを挿入します。

### データの選択 {#selecting-data}

``` sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase ORDER BY c DESC LIMIT 5 FORMAT Template SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format', format_template_rows_between_delimiter = '\n    '
```

```text title="/some/path/resultset.format"
<!DOCTYPE HTML>
<html> <head> <title>検索フレーズ</title> </head>
 <body>
  <table border="1"> <caption>検索フレーズ</caption>
    <tr> <th>検索フレーズ</th> <th>カウント</th> </tr>
    ${data}
  </table>
  <table border="1"> <caption>最大値</caption>
    ${max}
  </table>
  <b>${rows_read:XML} 行を処理しました ${time:XML} 秒で</b>
 </body>
</html>
```

```text title="/some/path/row.format"
<tr> <td>${0:XML}</td> <td>${1:XML}</td> </tr>
```

結果：

```html
<!DOCTYPE HTML>
<html> <head> <title>検索フレーズ</title> </head>
 <body>
  <table border="1"> <caption>検索フレーズ</caption>
    <tr> <th>検索フレーズ</th> <th>カウント</th> </tr>
    <tr> <td></td> <td>8267016</td> </tr>
    <tr> <td>bathroom interior design</td> <td>2166</td> </tr>
    <tr> <td>clickhouse</td> <td>1655</td> </tr>
    <tr> <td>spring 2014 fashion</td> <td>1549</td> </tr>
    <tr> <td>freeform photos</td> <td>1480</td> </tr>
  </table>
  <table border="1"> <caption>最大値</caption>
    <tr> <td></td> <td>8873898</td> </tr>
  </table>
  <b>3095973 行を処理しました 0.1569913 秒で</b>
 </body>
</html>
```

### データの挿入 {#inserting-data}

``` text
一部のヘッダー
ページビュー: 5, ユーザーID: 4324182021466249494, 無駄なフィールド: hello, 持続時間: 146, サイン: -1
ページビュー: 6, ユーザーID: 4324182021466249494, 無駄なフィールド: world, 持続時間: 185, サイン: 1
合計行数: 2
```

``` sql
INSERT INTO UserActivity SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format'
FORMAT Template
```

```text title="/some/path/resultset.format"
一部のヘッダー\n${data}\n合計行数: ${:CSV}\n
```

```text title="/some/path/row.format"
ページビュー: ${PageViews:CSV}, ユーザーID: ${UserID:CSV}, 無駄なフィールド: ${:CSV}, 持続時間: ${Duration:CSV}, サイン: ${Sign:CSV}
```

`PageViews`, `UserID`, `Duration`および`Sign`は、プレースホルダ内のテーブルのカラム名です。`無駄なフィールド`の後の値と`\n合計行数:`の後の値は無視されます。
入力データ内のすべての区切り文字は、指定されたフォーマット文字列の区切り文字と厳密に等しい必要があります。

### インライン仕様 {#in-line-specification}

Markdownテーブルを手動でフォーマットするのに疲れましたか？この例では、`Template`フォーマットとインライン仕様設定を使用して、`system.formats`テーブルからいくつかのClickHouseフォーマットの名前を`SELECT`し、それらをMarkdownテーブルとしてフォーマットする方法を見ていきます。これを達成するのは簡単で、`Template`フォーマットと設定`format_template_row_format`および`format_template_resultset_format`を使用します。

前の例では、結果セットと行のフォーマット文字列を別々のファイルに指定し、それらのファイルへのパスをそれぞれ`format_template_resultset`および`format_template_row`設定を使用して指定しました。ここでは、テンプレートが単純であり、Markdownテーブルを作成するためにいくつかの`|`と`-`だけで構成されているため、インラインで指定します。結果セットのテンプレート文字列は、設定`format_template_resultset_format`を使用して`${data}`の前に`|ClickHouse Formats|\n|---|\n`を追加することによって指定します。行のテンプレート文字列として、設定`format_template_row_format`を使用して`` |`${0:XML}`| ``を指定します。`Template`フォーマットは、指定されたフォーマットで行を`${data}`プレースホルダに挿入します。この例では、カラムは1つだけですが、もっと追加したい場合は、行のテンプレート文字列に`{1:XML}`、`{2:XML}`などを追加して、適切なエスケープルールを選択できます。この例では、エスケープルール`XML`を選択しています。 

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

見てください！手動であの`|`や`-`をすべて追加する手間を省きました：

```response title="レスポンス"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
