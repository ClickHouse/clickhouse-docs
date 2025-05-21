---
alias: []
description: 'テンプレート形式のドキュメント'
input_format: true
keywords: ['Template']
output_format: true
slug: /interfaces/formats/Template
title: 'テンプレート'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

他の標準的な形式が提供する以上のカスタマイズが必要な場合に、  
`Template` 形式では、ユーザーが値のプレースホルダーを含む独自のカスタム形式文字列を指定したり、  
データのエスケープルールを指定したりすることができます。

次の設定を使用します:

| 設定                                                                                                   | 説明                                                                                                                  |
|---------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                           | 行の形式文字列を含むファイルのパスを指定します。                                                                     |
| [`format_template_resultset`](#format_template_resultset)                                               | 行の形式文字列を含むファイルのパスを指定します。                                                                    |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                     | 行間の区切り文字を指定します。これは、最後の行を除くすべての行の後に印刷（または期待）されます（デフォルトは `\n`）   |
| `format_template_row_format`                                                                            | 行のための形式文字列を指定します [インライン](#inline_specification)。                                                |                                                                           
| `format_template_resultset_format`                                                                      | 結果セットの形式文字列を指定します [インライン](#inline_specification)。                                              |
| 他の形式のいくつかの設定（例: `output_format_json_quote_64bit_integers` を使用しているときの `JSON` エスケープ）|                                                                                                                      |

## 設定とエスケープルール {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

設定 `format_template_row` は、次の構文を使用して行の形式文字列を含むファイルのパスを指定します。

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

ここで:

| 構文の部分 | 説明                                                                                                         |
|------------|-------------------------------------------------------------------------------------------------------------|
| `delimiter_i`  | 値の間の区切り文字（`$` シンボルは `$$` としてエスケープできます）                                    |
| `column_i`     | 選択または挿入するカラムの名前またはインデックス（空の場合は、カラムはスキップされます）                        |
| `serializeAs_i` | カラム値のエスケープルール。                                                                                |

サポートされているエスケープルールは次のとおりです:

| エスケープルール        | 説明                                   |
|-------------------------|---------------------------------------|
| `CSV`, `JSON`, `XML`    | 同名の形式と類似しています                |
| `Escaped`               | `TSV` と類似しています                     |
| `Quoted`                | `Values` と類似しています                 |
| `Raw`                   | エスケープなし、`TSVRaw` と類似している       |   
| `None`                  | エスケープルールなし - 以下の注釈を参照してください |

:::note
エスケープルールが省略された場合、`None` が使用されます。 `XML` は出力にのみ適しています。
:::

例を見てみましょう。次の形式文字列が与えられた場合:

```text
検索フレーズ: ${s:Quoted}, カウント: ${c:Escaped}, 広告価格: $$${p:JSON};
```

次の値が、それぞれのカラム `検索フレーズ:`、`, カウント:`、`, 広告価格: $` と `;` の区切り文字の間で印刷されたり（`SELECT` を使用する場合）、期待されます（`INPUT` を使用する場合）:

- `s` （エスケープルール `Quoted` 付き）
- `c` （エスケープルール `Escaped` 付き）
- `p` （エスケープルール `JSON` 付き）

例えば:

- `INSERT` を行う場合、以下の行は期待されるテンプレートにマッチし、値 `bathroom interior design`、`2166`、`$3` がカラム `検索フレーズ`、`カウント`、`広告価格` に読み込まれます。
- `SELECT` を行う場合、以下の行が出力され、値 `bathroom interior design`、`2166`、`$3` がすでにテーブルに `検索フレーズ`、`カウント`、`広告価格` のカラムで格納されていると仮定します。  

```yaml
検索フレーズ: 'bathroom interior design', カウント: 2166, 広告価格: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

設定 `format_template_rows_between_delimiter` は、行間の区切り文字を指定します。これは、最後の行を除くすべての行の後に印刷（または期待）されます（デフォルトは `\n`）。

### format_template_resultset {#format_template_resultset}

設定 `format_template_resultset` は、結果セットの形式文字列を含むファイルへのパスを指定します。

結果セットの形式文字列は、行の形式文字列と同じ構文を持ちます。  
プレフィックス、サフィックスを指定し、追加情報を印刷する方法を指定することができ、その形式は次のプレースホルダーを含みます（カラム名の代わりに）:

- `data` は、`format_template_row` 形式のデータを持つ行で、`format_template_rows_between_delimiter` で区切られています。このプレースホルダーは、形式文字列の最初のプレースホルダーでなければなりません。
- `totals` は（`WITH TOTALS` を使用する場合）`format_template_row` 形式の合計値を持つ行です。
- `min` は（極端が1に設定されている場合）`format_template_row` 形式の最小値を持つ行です。
- `max` は（極端が1に設定されている場合）`format_template_row` 形式の最大値を持つ行です。
- `rows` は出力行の合計数です。
- `rows_before_limit` は、LIMIT がない場合に存在するはずの最小行数です。クエリがLIMITを含む場合のみ出力されます。クエリにGROUP BYが含まれる場合は、`rows_before_limit_at_least` はLIMITのない場合に存在するはずの行数です。
- `time` は、リクエストの実行時間（秒）。
- `rows_read` は、読み取られた行の数です。
- `bytes_read` は、読み取られたバイト数（非圧縮）です。

プレースホルダー `data`、`totals`、`min` および `max` にはエスケープルールは指定できず（または `None` が明示的に指定される必要があります）。残りのプレースホルダーには任意のエスケープルールを指定できます。

:::note
`format_template_resultset` が空文字列の場合、デフォルト値として `${data}` が使用されます。
:::

挿入クエリでは、形式はプレフィックスやサフィックス（例を参照）を指定することで、いくつかのカラムやフィールドをスキップすることを許可します。

### インライン仕様 {#inline_specification}

しばしば、フォーマット設定（`format_template_row`、`format_template_resultset` で設定されたもの）をクラスター内のすべてのノードに配置することは挑戦的であるか、不可能です。  
さらに、その形式が非常に単純である場合、ファイルに配置する必要がないこともあります。

そのような場合には、`format_template_row_format`（`format_template_row` 用）や `format_template_resultset_format`（`format_template_resultset` 用）を使用して、形式文字列をクエリ内で直接設定することができます。  
ファイルへのパスではなく、形式文字列を含む。

:::note
形式文字列やエスケープシーケンスに関するルールは、以下の場合と同じです:
- `format_template_row_format` を使用しているときの [`format_template_row`](#format_template_row)。
- `format_template_resultset_format` を使用しているときの [`format_template_resultset`](#format_template_resultset)。
:::

## 使用例 {#example-usage}

`Template` 形式を使用してデータを選択する場合とデータを挿入する場合の2つの例を見てみましょう。

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
    <tr> <th>検索フレーズ</th> <th>カウント</th> </tr>
    ${data}
  </table>
  <table border="1"> <caption>最大</caption>
    ${max}
  </table>
  <b>${rows_read:XML} 行を処理し、${time:XML} 秒かかりました。</b>
 </body>
</html>
```

```text title="/some/path/row.format"
<tr> <td>${0:XML}</td> <td>${1:XML}</td> </tr>
```

結果:

```html
<!DOCTYPE HTML>
<html> <head> <title>検索フレーズ</title> </head>
 <body>
  <table border="1"> <caption>検索フレーズ</caption>
    <tr> <th>検索フレーズ</th> <th>カウント</th> </tr>
    <tr> <td></td> <td>8267016</td> </tr>
    <tr> <td>バスルームインテリアデザイン</td> <td>2166</td> </tr>
    <tr> <td>clickhouse</td> <td>1655</td> </tr>
    <tr> <td>春2014ファッション</td> <td>1549</td> </tr>
    <tr> <td>フリーフォーム写真</td> <td>1480</td> </tr>
  </table>
  <table border="1"> <caption>最大</caption>
    <tr> <td></td> <td>8873898</td> </tr>
  </table>
  <b>${rows_read:XML} 行を処理し、${time:XML} 秒かかりました。</b>
 </body>
</html>
```

### データの挿入 {#inserting-data}

```text
いくつかのヘッダー
ページビュー: 5, ユーザーID: 4324182021466249494, 無駄なフィールド: hello, デュレーション: 146, サイン: -1
ページビュー: 6, ユーザーID: 4324182021466249494, 無駄なフィールド: world, デュレーション: 185, サイン: 1
合計行: 2
```

```sql
INSERT INTO UserActivity SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format'
FORMAT Template
```

```text title="/some/path/resultset.format"
いくつかのヘッダー\n${data}\n合計行: ${:CSV}\n
```

```text title="/some/path/row.format"
ページビュー: ${PageViews:CSV}, ユーザーID: ${UserID:CSV}, 無駄なフィールド: ${:CSV}, デュレーション: ${Duration:CSV}, サイン: ${Sign:CSV}
```

`PageViews`、`UserID`、`Duration` および `Sign` のプレースホルダー内の値は、テーブル内のカラム名です。  
行内の `無駄なフィールド` 以降の値と、サフィックス内の `\n合計行:` 以降の値は無視されます。  
入力データのすべての区切り文字は、指定された形式文字列の区切り文字と厳密に等しくなければなりません。

### インライン仕様 {#inline-specification}

Markdown テーブルを手動でフォーマットするのに疲れましたか？この例では、`Template` 形式とインライン仕様設定を使用し、   
いくつかの ClickHouse 形式の名前を `system.formats` テーブルから `SELECT` して、それを Markdown テーブルとしてフォーマットするという簡単なタスクを達成する方法を見てみましょう。  
これを実現するのは、`Template` 形式と設定 `format_template_row_format` と `format_template_resultset_format` を使用することで、簡単に行えます。

前の例では、結果セットと行形式の文字列を別々のファイルに指定し、それらのファイルへのパスを `format_template_resultset` および `format_template_row` 設定を使用して指定しました。  
ここでは、インラインで行うことにします。なぜなら、私たちのテンプレートは単純で、モダンテーブルを作るための少しの `|` と `-` で成り立っているからです。  
結果セットのテンプレート文字列を設定 `format_template_resultset_format` を使用して指定します。  
テーブルヘッダーを作るために、`|ClickHouse Formats|\n|---|\n` を `${data}` の前に追加しました。  
設定 `format_template_row_format` を使用して、行のテンプレート文字列 `` |`${0:XML}`| `` を指定しています。  
`Template` 形式は、指定された形式で行を `${data}` プレースホルダーに挿入します。  
この例では、カラムは1つだけですが、もっと追加したい場合は、行のテンプレート文字列に `{1:XML}`、`{2:XML}`...などを追加し、適切なエスケープルールを選択することができます。  
この例では、エスケープルールは `XML` を選びました。 

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

見ましたか！手動であの `|` と `-` をすべて追加する手間を省きました:

```response title="レスポンス"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
