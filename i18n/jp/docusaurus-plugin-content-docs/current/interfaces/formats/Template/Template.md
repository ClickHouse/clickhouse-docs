---
title: Template
slug: /interfaces/formats/Template
keywords: [テンプレート]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

他の標準フォーマットが提供するよりもカスタマイズが必要な場合に、
`テンプレート` フォーマットは、ユーザーが値のプレースホルダーを持つ独自のカスタムフォーマット文字列を指定し、データのエスケープルールを指定できるようにします。

以下の設定を使用します：

| 設定                                                                                                  | 説明                                                                                                                |
|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                            | 行のフォーマット文字列を含むファイルへのパスを指定します。                                                     |
| [`format_template_resultset`](#format_template_resultset)                                                | 行のフォーマット文字列を含むファイルへのパスを指定します。                                                      |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | 最後の行を除くすべての行の後に印刷される（または期待される）行の区切り文字を指定します（デフォルトは `\n`）。 |
| `format_template_row_format`                                                                             | 行のフォーマット文字列を指定します [インライン](#inline_specification)。                                                     |
| `format_template_resultset_format`                                                                       | 結果セットのフォーマット文字列を指定します [インライン](#inline_specification)。                                                   |
| 他のフォーマットの一部の設定 (例: `JSON` エスケープを使用する際の `output_format_json_quote_64bit_integers`) |                                                                                                                            |

## 設定とエスケープルール {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

設定 `format_template_row` は、以下の構文で行のフォーマット文字列を含むファイルへのパスを指定します：

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

ここで：

| 構文の部分     | 説明                                                                                                       |
|----------------|-------------------------------------------------------------------------------------------------------------------|
| `delimiter_i`  | 値の間の区切り文字（`$` シンボルは `$$` としてエスケープできます）                                                    |
| `column_i`     | 値を選択または挿入するカラムの名前またはインデックス（空の場合、そのカラムはスキップされます） |
|`serializeAs_i` | カラム値に対するエスケープルール。                                                                           |

次のエスケープルールがサポートされています：

| エスケープルール        | 説明                              |
|----------------------|------------------------------------------|
| `CSV`, `JSON`, `XML` | 同名のフォーマットに似ています |
| `Escaped`            | `TSV` に似ています                         |
| `Quoted`             | `Values` に似ています                      |
| `Raw`                | エスケープなし、`TSVRaw` に似ています    |
| `None`               | エスケープルールなし - 以下の注意を参照        |

:::note
エスケープルールが省略された場合、`None` が使用されます。 `XML` は出力専用です。
:::

以下のフォーマット文字列を考えてみましょう：

```text
検索フレーズ: ${s:Quoted}, カウント: ${c:Escaped}, 広告価格: $$${p:JSON};
```

次の値が印刷されます（`SELECT` を使用する場合）または期待されます（`INPUT` を使用する場合）。
それぞれ `検索フレーズ:`, `, カウント:`, `, 広告価格: $` と `;` の区切り文字間に：

- `s` （エスケープルール `Quoted`）
- `c` （エスケープルール `Escaped`）
- `p` （エスケープルール `JSON`）

例えば：

- `INSERT` 時に、以下の行が期待されるテンプレートに一致し、カラム `検索フレーズ`、`カウント`、`広告価格` に値 `bathroom interior design`, `2166`, `$3` を読み込みます。
- `SELECT` 時に、以下の行が出力され、値 `bathroom interior design`, `2166`, `$3` がすでに `検索フレーズ`、`カウント`、`広告価格` のカラムの下にテーブルに格納されていると仮定します。

```yaml
検索フレーズ: 'bathroom interior design', カウント: 2166, 広告価格: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

設定 `format_template_rows_between_delimiter` は、最後の行を除くすべての行の後に印刷される（または期待される）行間の区切り文字を指定します（デフォルトは `\n`）。

### format_template_resultset {#format_template_resultset}

設定 `format_template_resultset` は、結果セットのフォーマット文字列を含むファイルへのパスを指定します。

結果セットのフォーマット文字列は、行のフォーマット文字列と同じ構文を持っています。
それは、接頭辞、接尾辞を指定し、追加情報を印刷する方法を含むことを可能にし、以下のプレースホルダーをカラム名の代わりに含みます：

- `data` は、`format_template_row` フォーマットのデータがある行で、`format_template_rows_between_delimiter` で区切られています。このプレースホルダーは、フォーマット文字列の最初のプレースホルダーでなければなりません。
- `totals` は、合計値の行を `format_template_row` フォーマットで示します（`WITH TOTALS` を使用する場合）。
- `min` は、最小値の行を `format_template_row` フォーマットで示します（エクストリームが 1 に設定されている場合）。
- `max` は、最大値の行を `format_template_row` フォーマットで示します（エクストリームが 1 に設定されている場合）。
- `rows` は、出力行の合計数です。
- `rows_before_limit` は、LIMIT なしで存在していたであろう最小行数です。クエリが LIMIT を含む場合のみ出力されます。クエリが GROUP BY を含む場合、`rows_before_limit_at_least` は、LIMIT なしで存在していたであろう正確な行数です。
- `time` は、リクエストの実行時間（秒単位）です。
- `rows_read` は、読み取られた行の数です。
- `bytes_read` は、読み取られたバイト数（非圧縮）です。

プレースホルダー `data`、`totals`、`min` および `max` は、エスケープルールが指定されないか（または `None` が明示的に指定される必要があります）。残りのプレースホルダーは、エスケープルールを指定することができます。

:::note
`format_template_resultset` 設定が空文字列の場合、`${data}` がデフォルト値として使用されます。
:::

挿入クエリのフォーマットは、接頭辞または接尾辞を指定することで、いくつかのカラムまたはフィールドをスキップできます（例を参照）。

### インライン仕様 {#inline_specification}

フォーマット構成（`format_template_row`、`format_template_resultset` によって設定される）は、クラスタ内のすべてのノードにディレクトリに配置するのが困難または不可能な場合があります。
さらに、フォーマットが非常に簡単でファイルに配置する必要がない場合もあります。

これらのケースでは、`format_template_row_format`（`format_template_row` 用）および `format_template_resultset_format`（`format_template_resultset` 用）を使用して、テンプレート文字列を直接クエリに設定できます。
ファイルへのパスではなく、それを含むファイルへのパスを設定するのではなく、直接渡します。

:::note
フォーマット文字列とエスケープシーケンスに関するルールは以下の通りです：
- [`format_template_row`](#format_template_row) を使用する場合、`format_template_row_format` で。
- [`format_template_resultset`](#format_template_resultset) を使用する場合、`format_template_resultset_format` で。
:::

## 使用例 {#example-usage}

`テンプレート` フォーマットの使用法として、データを選択する場合とデータを挿入する場合の 2 つの例を見てみましょう。

### データの選択 {#selecting-data}

``` sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase ORDER BY c DESC LIMIT 5 FORMAT テンプレート SETTINGS
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
  <table border="1"> <caption>最大</caption>
    ${max}
  </table>
  <b>処理した行数 ${rows_read:XML} 行、${time:XML} 秒で</b>
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
  <table border="1"> <caption>最大</caption>
    <tr> <td></td> <td>8873898</td> </tr>
  </table>
  <b>処理した行数 3095973 行、0.1569913 秒で</b>
 </body>
</html>
```

### データの挿入 {#inserting-data}

``` text
一部のヘッダー
ページビュー: 5, ユーザーID: 4324182021466249494, 無意味なフィールド: hello, 持続時間: 146, サイン: -1
ページビュー: 6, ユーザーID: 4324182021466249494, 無意味なフィールド: world, 持続時間: 185, サイン: 1
合計行数: 2
```

``` sql
INSERT INTO UserActivity SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format'
FORMAT テンプレート
```

```text title="/some/path/resultset.format"
一部のヘッダー\n${data}\n合計行数: ${:CSV}\n
```

```text title="/some/path/row.format"
ページビュー: ${PageViews:CSV}, ユーザーID: ${UserID:CSV}, 無意味なフィールド: ${:CSV}, 持続時間: ${Duration:CSV}, サイン: ${Sign:CSV}
```

`PageViews`、`UserID`、`Duration` および `Sign` はプレースホルダー内でテーブルのカラムの名前です。行の `無意味なフィールド` と接尾辞の `\n合計行数:` 以降の値は無視されます。
入力データのすべての区切り文字は、指定されたフォーマット文字列の区切り文字と厳密に同一でなければなりません。

### インライン仕様 {#in-line-specification}

マークダウンテーブルを手動でフォーマットすることに疲れましたか？この例では、`テンプレート` フォーマットとインライン仕様設定を使用して、`system.formats` テーブルからいくつかの ClickHouse フォーマットの名前を取得し、マークダウンテーブルとしてフォーマットする簡単なタスクを達成する方法を見てみましょう。これは、`テンプレート` フォーマットと設定 `format_template_row_format` および `format_template_resultset_format` を使用して簡単に達成できます。

以前の例では、結果セットと行のフォーマット文字列を別々のファイルに指定し、それぞれのファイルパスを `format_template_resultset` および `format_template_row` 設定を使用して指定しました。ここでは、テンプレートが簡単で、マークダウンテーブルを作成するための `|` と `-` しか含まれていないため、インラインで指定します。結果セットのテンプレート文字列は、`format_template_resultset_format` 設定を使用して指定します。テーブルヘッダーを作成するために、`${data}` の前に `|ClickHouse Formats|\n|---|\n` を追加しました。また、`format_template_row_format` 設定を使用して、行のテンプレート文字列 `` |`{0:XML}`| `` を指定します。`Template` フォーマットは、指定されたフォーマットで行をプレースホルダー `${data}` に挿入します。この例ではカラムは 1 つだけですが、追加したい場合は、行のテンプレート文字列に `{1:XML}`、`{2:XML}`... などを追加できます。適切なエスケープルールを選択してください。この例では、`XML` エスケープルールを使用しています。

```sql title="クエリ"
WITH formats AS
(
 SELECT * FROM system.formats
 ORDER BY rand()
 LIMIT 5
)
SELECT * FROM formats
FORMAT テンプレート
SETTINGS
 format_template_row_format='|`${0:XML}`|',
 format_template_resultset_format='|ClickHouse Formats|\n|---|\n${data}\n'
```

見てください！あらかじめ `|` と `-` を手動で追加する手間が省けました：

```response title="応答"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
