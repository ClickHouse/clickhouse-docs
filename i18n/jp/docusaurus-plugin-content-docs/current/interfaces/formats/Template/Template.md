---
alias: []
description: 'Template フォーマットに関するドキュメント'
input_format: true
keywords: ['Template']
output_format: true
slug: /interfaces/formats/Template
title: 'Template'
doc_type: 'guide'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |



## Description {#description}

他の標準フォーマットが提供する以上のカスタマイズが必要な場合、
`Template`フォーマットでは、値のプレースホルダーを含む独自のカスタムフォーマット文字列を指定し、
データのエスケープルールを設定することができます。

以下の設定を使用します:

| 設定                                                                                                  | 説明                                                                                                                |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [`format_template_row`](#format_template_row)                                                            | 行のフォーマット文字列を含むファイルへのパスを指定します。                                                     |
| [`format_template_resultset`](#format_template_resultset)                                                | 結果セットのフォーマット文字列を含むファイルへのパスを指定します                                                      |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | 行間の区切り文字を指定します。最後の行を除くすべての行の後に出力される(または期待される)区切り文字です(デフォルトは`\n`) |
| `format_template_row_format`                                                                             | 行のフォーマット文字列を[インライン](#inline_specification)で指定します。                                                     |
| `format_template_resultset_format`                                                                       | 結果セットのフォーマット文字列を[インライン](#inline_specification)で指定します。                                                   |
| 他のフォーマットの一部の設定(例:`JSON`エスケープを使用する場合の`output_format_json_quote_64bit_integers`) |                                                                                                                            |


## 設定とエスケープルール {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

`format_template_row`設定は、以下の構文で行のフォーマット文字列を含むファイルへのパスを指定します:

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

各要素の説明:

| 構文要素  | 説明                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `delimiter_i`   | 値間の区切り文字(`$`記号は`$$`としてエスケープ可能)                                                        |
| `column_i`      | 選択または挿入される値を持つカラムの名前またはインデックス(空の場合、そのカラムはスキップされます) |
| `serializeAs_i` | カラム値のエスケープルール                                                                               |

以下のエスケープルールがサポートされています:

| エスケープルール        | 説明                              |
| -------------------- | ---------------------------------------- |
| `CSV`, `JSON`, `XML` | 同名のフォーマットと同様 |
| `Escaped`            | `TSV`と同様                         |
| `Quoted`             | `Values`と同様                      |
| `Raw`                | エスケープなし、`TSVRaw`と同様    |
| `None`               | エスケープルールなし - 以下の注記を参照        |

:::note
エスケープルールが省略された場合、`None`が使用されます。`XML`は出力にのみ適しています。
:::

例を見てみましょう。以下のフォーマット文字列が与えられた場合:

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

以下の値が(`SELECT`を使用する場合は)出力され、または(`INPUT`を使用する場合は)期待されます。
それぞれ`Search phrase:`、`, count:`、`, ad price: $`、`;`の区切り文字の間に配置されます:

- `s`(エスケープルール`Quoted`)
- `c`(エスケープルール`Escaped`)
- `p`(エスケープルール`JSON`)

例:

- `INSERT`の場合、以下の行は期待されるテンプレートと一致し、値`bathroom interior design`、`2166`、`$3`をカラム`Search phrase`、`count`、`ad price`に読み込みます。
- `SELECT`の場合、以下の行が出力となります。これは値`bathroom interior design`、`2166`、`$3`がすでにテーブルのカラム`Search phrase`、`count`、`ad price`に格納されていることを前提としています。

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

`format_template_rows_between_delimiter`設定は、最後の行を除くすべての行の後に出力される(または期待される)行間の区切り文字を指定します(デフォルトは`\n`)

### format_template_resultset {#format_template_resultset}

`format_template_resultset`設定は、結果セットのフォーマット文字列を含むファイルへのパスを指定します。

結果セットのフォーマット文字列は、行のフォーマット文字列と同じ構文を持ちます。
プレフィックス、サフィックス、および追加情報を出力する方法を指定でき、カラム名の代わりに以下のプレースホルダーを含みます:

- `data`は`format_template_row`フォーマットのデータを含む行で、`format_template_rows_between_delimiter`で区切られます。このプレースホルダーはフォーマット文字列の最初のプレースホルダーでなければなりません。
- `totals`は`format_template_row`フォーマットの合計値を含む行です(WITH TOTALSを使用する場合)。
- `min`は`format_template_row`フォーマットの最小値を含む行です(extremesが1に設定されている場合)。
- `max`は`format_template_row`フォーマットの最大値を含む行です(extremesが1に設定されている場合)。
- `rows`は出力行の総数です。
- `rows_before_limit`はLIMITがない場合に存在したであろう最小行数です。クエリにLIMITが含まれる場合のみ出力されます。クエリにGROUP BYが含まれる場合、rows_before_limit_at_leastはLIMITがない場合に存在したであろう正確な行数です。
- `time`はリクエストの実行時間(秒単位)です。
- `rows_read`は読み取られた行数です。
- `bytes_read`は読み取られたバイト数(非圧縮)です。

プレースホルダー`data`、`totals`、`min`、`max`にはエスケープルールを指定してはなりません(または明示的に`None`を指定する必要があります)。残りのプレースホルダーには任意のエスケープルールを指定できます。

:::note
`format_template_resultset`設定が空文字列の場合、デフォルト値として`${data}`が使用されます。
:::


挿入クエリでは、プレフィックスまたはサフィックスがある場合、フォーマットによって一部のカラムやフィールドをスキップできます（例を参照）。

### インライン指定 {#inline_specification}

テンプレートフォーマットのフォーマット設定（`format_template_row`、`format_template_resultset`で設定）をクラスタ内のすべてのノードのディレクトリにデプロイすることが困難または不可能な場合があります。
また、フォーマットが非常に単純でファイルに配置する必要がない場合もあります。

このような場合、`format_template_row_format`（`format_template_row`用）および`format_template_resultset_format`（`format_template_resultset`用）を使用して、テンプレート文字列をファイルパスではなく、クエリ内で直接設定できます。

:::note
フォーマット文字列とエスケープシーケンスの規則は以下と同じです：

- `format_template_row_format`を使用する場合は[`format_template_row`](#format_template_row)
- `format_template_resultset_format`を使用する場合は[`format_template_resultset`](#format_template_resultset)
  :::


## 使用例 {#example-usage}

`Template`フォーマットの使用方法について、データの選択とデータの挿入の2つの例を見ていきましょう。

### データの選択 {#selecting-data}

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase ORDER BY c DESC LIMIT 5 FORMAT Template SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format', format_template_rows_between_delimiter = '\n    '
```

```text title="/some/path/resultset.format"
<!DOCTYPE HTML>
<html> <head> <title>検索フレーズ</title> </head>
 <body>
  <table border="1"> <caption>検索フレーズ</caption>
    <tr> <th>検索フレーズ</th> <th>件数</th> </tr>
    ${data}
  </table>
  <table border="1"> <caption>最大値</caption>
    ${max}
  </table>
  <b>${rows_read:XML}行を${time:XML}秒で処理</b>
 </body>
</html>
```

```text title="/some/path/row.format"
<tr> <td>${0:XML}</td> <td>${1:XML}</td> </tr>
```

結果:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>検索フレーズ</title>
  </head>
  <body>
    <table border="1">
      <caption>検索フレーズ</caption>
      <tr>
        <th>検索フレーズ</th>
        <th>件数</th>
      </tr>
      <tr>
        <td></td>
        <td>8267016</td>
      </tr>
      <tr>
        <td>bathroom interior design</td>
        <td>2166</td>
      </tr>
      <tr>
        <td>clickhouse</td>
        <td>1655</td>
      </tr>
      <tr>
        <td>spring 2014 fashion</td>
        <td>1549</td>
      </tr>
      <tr>
        <td>freeform photos</td>
        <td>1480</td>
      </tr>
    </table>
    <table border="1">
      <caption>最大値</caption>
      <tr>
        <td></td>
        <td>8873898</td>
      </tr>
    </table>
    <b>3095973行を0.1569913秒で処理</b>
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

プレースホルダー内の`PageViews`、`UserID`、`Duration`、`Sign`はテーブルのカラム名です。行内の`Useless field`の後の値と、サフィックス内の`\nTotal rows:`の後の値は無視されます。
入力データ内のすべての区切り文字は、指定されたフォーマット文字列内の区切り文字と厳密に一致する必要があります。

### インライン指定 {#in-line-specification}

マークダウンテーブルを手動でフォーマットするのに疲れていませんか？この例では、`Template`フォーマットとインライン指定設定を使用して、シンプルなタスク(`system.formats`テーブルからClickHouseフォーマットの名前を`SELECT`し、マークダウンテーブルとしてフォーマットする)を実現する方法を見ていきます。これは、`Template`フォーマットと`format_template_row_format`および`format_template_resultset_format`設定を使用することで簡単に実現できます。


前の例では、結果セットおよび行フォーマットの文字列を別ファイルで指定し、それらのファイルへのパスをそれぞれ `format_template_resultset` と `format_template_row` 設定で指定しました。ここではテンプレートが単純で、Markdown のテーブルを作るためのいくつかの `|` と `-` だけで構成されているため、インラインで指定します。結果セットのテンプレート文字列は `format_template_resultset_format` 設定を使って指定します。テーブルヘッダーを作成するために、`${data}` の前に `|ClickHouse Formats|\n|---|\n` を追加しています。行に対するテンプレート文字列 ``|`{0:XML}`|`` を指定するために、設定 `format_template_row_format` を使用します。`Template` フォーマットは、指定したフォーマットで行をプレースホルダー `${data}` に挿入します。この例では列が 1 つだけですが、列を追加したい場合は、行テンプレート文字列に `{1:XML}`、`{2:XML}` ... などを追加し、適切なエスケープ規則を選択すればよいです。この例ではエスケープ規則として `XML` を選択しています。

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

ご覧のとおり、あの Markdown テーブルを作るのに大量の `|` と `-` を手動で打ち込む手間を省けました。

```response title="Response"
|ClickHouse フォーマット|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
