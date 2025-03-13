---
sidebar_label: 正規表現とテンプレート
sidebar_position: 3
slug: /integrations/data-formats/templates-regexp
---


# ClickHouseでのテンプレートと正規表現を使用したカスタムテキストデータのインポートとエクスポート

私たちはしばしばカスタムテキストフォーマットのデータを扱う必要があります。これは、非標準フォーマット、無効なJSON、または壊れたCSVかもしれません。CSVやJSONのような標準パーサーはすべてのケースで機能しないかもしれません。しかし、ClickHouseはここで強力なテンプレートと正規表現フォーマットで私たちをサポートしてくれます。

## テンプレートに基づくインポート {#importing-based-on-a-template}
以下の[ログファイル](assets/error.log)からデータをインポートしたいと仮定しましょう。

```bash
head error.log
```
```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

このデータをインポートするために[テンプレート](/interfaces/formats.md/#format-template)フォーマットを使用できます。入力データの各行の値プレースホルダーを持つテンプレート文字列を定義する必要があります：

```response
<time> [error] client: <ip>, server: <host> "<request>"
```

データをインポートするためのテーブルを作成しましょう：
```sql
CREATE TABLE error_log
(
    `time` DateTime,
    `ip` String,
    `host` String,
    `request` String
)
ENGINE = MergeTree
ORDER BY (host, request, time)
```

指定されたテンプレートを使用してデータをインポートするには、テンプレート文字列をファイルに保存する必要があります（この場合は[row.template](assets/row.template)）：

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

ここでは、カラム名とエスケープ規則を`${name:escaping}`フォーマットで定義します。この部分では、CSV、JSON、Escaped、Quotedなどの複数のオプションが利用可能で、[それぞれのエスケープルール](/interfaces/formats.md/#format-template)を実装します。

これで、データをインポートする際に、`format_template_row`設定オプションの引数としてこのファイルを使用できます（*注意、テンプレートとデータファイルには **余分な** `\n` シンボルがファイルの末尾にあってはいけません*）：

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

そして、データがテーブルにロードされていることを確認できます：

```sql
SELECT
    request,
    count(*)
FROM error_log
GROUP BY request
```
```response
┌─request──────────────────────────────────────────┬─count()─┐
│ GET /img/close.png HTTP/1.1                      │     176 │
│ GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1 │     172 │
│ GET /phone/images/icon_01.png HTTP/1.1           │     139 │
│ GET /apple-touch-icon-precomposed.png HTTP/1.1   │     161 │
│ GET /apple-touch-icon.png HTTP/1.1               │     162 │
│ GET /apple-touch-icon-120x120.png HTTP/1.1       │     190 │
└──────────────────────────────────────────────────┴─────────┘
```

### ホワイトスペースをスキップ {#skipping-whitespaces}
テンプレートの区切り文字の間のホワイトスペースをスキップできる[TemplateIgnoreSpaces](/interfaces/formats.md/#templateignorespaces)を使用することを検討してください：
```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```

## テンプレートを使用したデータのエクスポート {#exporting-data-using-templates}

私たちはまた、テンプレートを使用して任意のテキスト形式にデータをエクスポートすることもできます。この場合、2つのファイルを作成する必要があります：

[結果セットテンプレート](assets/output.results)は、全体の結果セットのレイアウトを定義します：

```response
== 上位10のIP ==
${data}
--- ${rows_read:XML} 行が ${time:XML} で読み込まれました ---
```

ここで、`rows_read`と`time`は、各リクエストに対して利用可能なシステムメトリックです。`data`は生成された行を示し（`${data}` はこのファイルの最初のプレースホルダーとして常に来るべきです）、[**行テンプレートファイル**](assets/output.rows)に定義されたテンプレートに基づいています：

```response
${ip:Escaped} によって ${total:Escaped} リクエストが生成されました
```

これらのテンプレートを使用して、次のクエリをエクスポートしましょう：

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
FORMAT Template SETTINGS format_template_resultset = 'output.results',
                         format_template_row = 'output.rows';

== 上位10のIP ==

9.8.4.6 によって 3 リクエストが生成されました
9.5.1.1 によって 3 リクエストが生成されました
2.4.8.9 によって 3 リクエストが生成されました
4.8.8.2 によって 3 リクエストが生成されました
4.5.4.4 によって 3 リクエストが生成されました
3.3.6.4 によって 2 リクエストが生成されました
8.9.5.9 によって 2 リクエストが生成されました
2.5.1.8 によって 2 リクエストが生成されました
6.8.3.6 によって 2 リクエストが生成されました
6.6.3.5 によって 2 リクエストが生成されました

--- 1000 行が 0.001380604 で読み込まれました ---
```

### HTMLファイルへのエクスポート {#exporting-to-html-files}
テンプレートベースの結果は、[`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md)句を使用してファイルにエクスポートすることもできます。指定された[結果セット](assets/html.results)と[行](assets/html.row)フォーマットに基づいてHTMLファイルを生成してみましょう：

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
INTO OUTFILE 'out.html'
FORMAT Template
SETTINGS format_template_resultset = 'html.results',
         format_template_row = 'html.row'
```

### XMLへのエクスポート {#exporting-to-xml}

テンプレートフォーマットは、XMLを含むあらゆる想像可能なテキストフォーマットファイルを生成するために使用できます。適切なテンプレートを配置してエクスポートを行ってください。

さらに、メタデータを含む標準XML結果を取得するために[XML](/interfaces/formats.md/#xml)フォーマットの使用を検討してください：

```sql
SELECT *
FROM error_log
LIMIT 3
FORMAT XML
```
```xml
<?xml version='1.0' encoding='UTF-8' ?>
<result>
	<meta>
		<columns>
			<column>
				<name>time</name>
				<type>DateTime</type>
			</column>
			...
		</columns>
	</meta>
	<data>
		<row>
			<time>2023-01-15 13:00:01</time>
			<ip>3.5.9.2</ip>
			<host>example.com</host>
			<request>GET /apple-touch-icon-120x120.png HTTP/1.1</request>
		</row>
		...
	</data>
	<rows>3</rows>
	<rows_before_limit_at_least>1000</rows_before_limit_at_least>
	<statistics>
		<elapsed>0.000745001</elapsed>
		<rows_read>1000</rows_read>
		<bytes_read>88184</bytes_read>
	</statistics>
</result>
```

## 正規表現に基づくデータのインポート {#importing-data-based-on-regular-expressions}

[Regexp](/interfaces/formats.md/#data-format-regexp)フォーマットは、入力データがより複雑な方法で解析する必要がある場合に対処します。今回は、ファイル名とプロトコルをキャプチャして、それらを別々のカラムに保存するために私たちの[error.log](assets/error.log)例ファイルを解析しましょう。まず、新しいテーブルを準備しましょう：

```sql
CREATE TABLE error_log
(
    `time` DateTime,
    `ip` String,
    `host` String,
    `file` String,
    `protocol` String
)
ENGINE = MergeTree
ORDER BY (host, file, time)
```

次に、正規表現に基づいてデータをインポートできます：

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS
  format_regexp = '(.+?) \\[error\\]  client: (.+), server: (.+?) "GET .+?([^/]+\\.[^ ]+) (.+?)"'
FORMAT Regexp
```

ClickHouseは、各キャプチャグループからその順序に基づいて関連するカラムにデータを挿入します。データを確認してみましょう：

```sql
SELECT * FROM error_log LIMIT 5
```
```response
┌────────────────time─┬─ip──────┬─host────────┬─file─────────────────────────┬─protocol─┐
│ 2023-01-15 13:00:01 │ 3.5.9.2 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:01:40 │ 3.7.2.5 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:16:49 │ 9.2.9.2 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:21:38 │ 8.8.5.3 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:31:27 │ 9.5.8.4 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
└─────────────────────┴─────────┴─────────────┴──────────────────────────────┴──────────┘
```

デフォルトでは、ClickHouseは不一致の行がある場合にエラーを発生させます。不一致の行をスキップしたい場合は、[format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched)オプションを使って有効にできます：

```sql
SET format_regexp_skip_unmatched = 1;
```

## その他のフォーマット {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするために、多くのフォーマット（テキストおよびバイナリ）のサポートを導入しています。以下の記事で、他のフォーマットやそれらとの作業方法を探ってみてください：

- [CSVおよびTSVフォーマット](csv-tsv.md)
- [Parquet](parquet.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- **正規表現とテンプレート**
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQLフォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)をチェックしてみてください。これは、Clickhouseサーバーを必要とせずにローカル/リモートファイルを扱うためのポータブルなフル機能ツールです。
