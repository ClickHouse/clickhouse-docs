---
alias: []
description: 'Template フォーマットのドキュメント'
input_format: true
keywords: ['Template']
output_format: true
slug: /interfaces/formats/Template
title: 'Template'
doc_type: 'guide'
---

| Input | Output | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 \{#description\}

他の標準フォーマットでは対応できない、より高度なカスタマイズが必要な場合に、  
`Template` フォーマットを使用すると、値のプレースホルダーを含む独自のカスタムフォーマット文字列と、  
データに対するエスケープルールをユーザーが指定できます。

このフォーマットでは、次の設定を使用します:

| 設定                                                                                                     | 説明                                                                                                                         |
|----------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                            | 行のフォーマット文字列を含むファイルへのパスを指定します。                                                                   |
| [`format_template_resultset`](#format_template_resultset)                                                | 結果セットのフォーマット文字列を含むファイルへのパスを指定します。                                                           |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | 行と行の間の区切り文字を指定します。これは最後の行を除く各行の後に出力（または入力として期待）されます（デフォルトは `\n`）。 |
| `format_template_row_format`                                                                             | 行のフォーマット文字列を[インライン](#inline_specification)で指定します。                                                   |                                                                           
| `format_template_resultset_format`                                                                       | 結果セットのフォーマット文字列を[インライン](#inline_specification)で指定します。                                           |
| 他のフォーマットの一部の設定（例: `JSON` エスケープを使用する場合の `output_format_json_quote_64bit_integers` |                                                                                                                              |

## 設定とエスケープ規則 \{#settings-and-escaping-rules\}

### format&#95;template&#95;row \{#format_template_row\}

`format_template_row` 設定は、次の構文で行用のフォーマット文字列が記述されたファイルへのパスを指定します。

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

Where:

| Part of syntax  | Description                                     |
| --------------- | ----------------------------------------------- |
| `delimiter_i`   | 値同士の区切り文字（`$` 記号は `$$` としてエスケープ可能）              |
| `column_i`      | 値を選択または挿入する対象となる列の名前またはインデックス（空の場合、その列はスキップされる） |
| `serializeAs_i` | 列の値に対するエスケープ規則。                                 |

サポートされているエスケープ規則は次のとおりです。

| Escaping Rule        | Description            |
| -------------------- | ---------------------- |
| `CSV`, `JSON`, `XML` | 同名のフォーマットと同様           |
| `Escaped`            | `TSV` と同様              |
| `Quoted`             | `Values` と同様           |
| `Raw`                | エスケープなしで、`TSVRaw` と同様  |
| `None`               | エスケープ規則なし（詳細は下記の注記を参照） |

:::note
エスケープ規則が省略された場合、`None` が使用されます。`XML` は出力にのみ適しています。
:::

例を見てみましょう。次のフォーマット文字列が与えられているとします。

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

以下の値は（`SELECT` を使用している場合は）出力され、（`INPUT` を使用している場合は）入力として期待されます。
それぞれ、カラム `Search phrase:`, `, count:`, `, ad price: $` と `;` の区切り文字の間に対応します。

* `s`（エスケープルール `Quoted`）
* `c`（エスケープルール `Escaped`）
* `p`（エスケープルール `JSON`）

例:

* `INSERT` を行う場合、下記の行は期待されるテンプレートに一致しており、カラム `Search phrase`, `count`, `ad price` にそれぞれ値 `bathroom interior design`, `2166`, `$3` を読み込みます。
* `SELECT` を行う場合、下記の行は、値 `bathroom interior design`, `2166`, `$3` がすでにテーブル内のカラム `Search phrase`, `count`, `ad price` に保存されていると仮定したときの出力例です。

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format&#95;template&#95;rows&#95;between&#95;delimiter \{#format_template_rows_between_delimiter\}

`format_template_rows_between_delimiter` 設定は、行と行の間に出力（または入力として期待）される区切り文字列を指定します。最後の行を除くすべての行の後に出力され、デフォルトは `\n` です。

### format&#95;template&#95;resultset \{#format_template_resultset\}

`format_template_resultset` 設定は、結果セット用のフォーマット文字列を含むファイルへのパスを指定します。

結果セット用のフォーマット文字列は、行用のフォーマット文字列と同じ構文を持ちます。
これにより、接頭辞や接尾辞、追加情報の出力方法を指定でき、列名の代わりに次のプレースホルダを使用します。

* `data` は、`format_template_row` フォーマットで表現されたデータ行で、`format_template_rows_between_delimiter` で区切られます。このプレースホルダは、フォーマット文字列内の先頭に配置する必要があります。
* `totals` は、`format_template_row` フォーマットで表現された合計値の行です（WITH TOTALS 使用時）。
* `min` は、`format_template_row` フォーマットで表現された最小値の行です（extremes が 1 に設定されている場合）。
* `max` は、`format_template_row` フォーマットで表現された最大値の行です（extremes が 1 に設定されている場合）。
* `rows` は、出力行の総数です。
* `rows_before_limit` は、LIMIT がなかった場合に存在していたであろう行数の下限値です。LIMIT を含むクエリでのみ出力されます。クエリに GROUP BY が含まれている場合、rows&#95;before&#95;limit&#95;at&#95;least は LIMIT がなかった場合に存在していた行数の正確な値になります。
* `time` は、リクエストの実行時間（秒）です。
* `rows_read` は、読み取られた行数です。
* `bytes_read` は、読み取られた（非圧縮の）バイト数です。

`data`、`totals`、`min`、`max` の各プレースホルダには、エスケープ規則を指定してはいけません（または明示的に `None` を指定する必要があります）。残りのプレースホルダには任意のエスケープ規則を指定できます。

:::note
`format_template_resultset` 設定が空文字列の場合、デフォルト値として `${data}` が使用されます。
:::

挿入クエリでは、先頭または末尾を省略する場合（例を参照）、一部の列やフィールドをスキップできるフォーマットを利用できます。

### インライン指定 \{#inline_specification\}

クラスター内のすべてのノード上のディレクトリに、テンプレートフォーマットの設定（`format_template_row`、`format_template_resultset` で設定）をデプロイすることが困難、あるいは不可能な場合がよくあります。  
さらに、そのフォーマットが非常に単純で、ファイルとして配置する必要がない場合もあります。

このような場合には、`format_template_row_format`（`format_template_row` 用）および `format_template_resultset_format`（`format_template_resultset` 用）を使用して、ファイルへのパスではなく、テンプレート文字列そのものをクエリ内で直接指定できます。

:::note
フォーマット文字列およびエスケープシーケンスに関するルールは、次と同じです。
- `format_template_row_format` を使用する場合は [`format_template_row`](#format_template_row)。
- `format_template_resultset_format` を使用する場合は [`format_template_resultset`](#format_template_resultset)。
:::

## 使用例 \{#example-usage\}

まずは `Template` 形式の利用例として、データの選択と挿入の 2 つのケースを見ていきます。

### データの選択 \{#selecting-data\}

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

### データの挿入 \{#inserting-data\}

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

プレースホルダー内の `PageViews`、`UserID`、`Duration` および `Sign` は、テーブル内の列名です。行中の `Useless field` 以降の値と、サフィックス中の `\nTotal rows:` 以降の値は無視されます。
入力データ内のすべての区切り文字は、指定されたフォーマット文字列内の区切り文字と厳密に一致している必要があります。

### インライン指定 \{#in-line-specification\}

Markdown テーブルを手作業で整形するのにうんざりしていませんか？この例では、`Template` フォーマットとインライン指定の設定を使って、簡単なタスクをどのように実現できるかを見ていきます。ここでは、`system.formats` テーブルからいくつかの ClickHouse フォーマット名を `SELECT` し、それらを Markdown テーブルとして整形します。これは、`Template` フォーマットと `format_template_row_format` および `format_template_resultset_format` 設定を使うことで容易に実現できます。

前の例では、結果セットおよび行フォーマットの文字列を別ファイルに記述し、それらファイルへのパスをそれぞれ `format_template_resultset` および `format_template_row` 設定で指定しました。ここではテンプレートがごく単純で、Markdown テーブルを作るためのいくつかの `|` と `-` だけで構成されるため、インラインで指定します。結果セットのテンプレート文字列は、`format_template_resultset_format` 設定を使って指定します。テーブルヘッダを作るために、`${data}` の前に `|ClickHouse Formats|\n|---|\n` を追加しています。行に対しては、`format_template_row_format` 設定を使用し、テンプレート文字列 ``|`{0:XML}`|`` を指定します。`Template` フォーマットは、指定したフォーマットで整形した行をプレースホルダ `${data}` に挿入します。この例ではカラムは 1 つだけですが、もし追加したい場合は、行テンプレート文字列に `{1:XML}`、`{2:XML}` ... のように追記し、適切なエスケープルールを選択すればかまいません。この例ではエスケープルールとして `XML` を使用しています。

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

ご覧のとおり、あの markdown テーブルを作るために必要な `|` や `-` を、手作業で一つずつ追加していく手間を省くことができました：

```response title="Response"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
