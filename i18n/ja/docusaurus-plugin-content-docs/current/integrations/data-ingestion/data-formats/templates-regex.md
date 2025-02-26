---
sidebar_label: 正規表現とテンプレート
sidebar_position: 3
slug: /integrations/data-formats/templates-regexp
---

# ClickHouseにおけるテンプレートと正規表現を用いたカスタムテキストデータのインポートとエクスポート

私たちはしばしばカスタムテキスト形式のデータを扱う必要があります。これは非標準形式、不正なJSON、または壊れたCSVである可能性があります。CSVやJSONのような標準的なパーサーは、すべてのケースで機能するわけではありません。しかし、ClickHouseは強力なテンプレートおよび正規表現形式を提供しているため、ここで助けられます。

## テンプレートに基づくインポート {#importing-based-on-a-template}
以下の[ログファイル](assets/error.log)からデータをインポートしたいとしましょう。

```bash
head error.log
```
```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

このデータをインポートするために[テンプレート](/interfaces/formats.md/#format-template)形式を使用できます。入力データの各行の値プレースホルダを持つテンプレート文字列を定義する必要があります：

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

特定のテンプレートを使用してデータをインポートするには、テンプレート文字列をファイルに保存する必要があります（ここでは[row.template](assets/row.template)）：

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

カラムの名前とエスケープルールを`${name:escaping}`形式で定義します。ここでは、CSV、JSON、Escaped、Quotedなどの複数のオプションがあり、それぞれの[エスケープルールを実装しています](/interfaces/formats.md/#format-template)。

次に、データインポート時に`format_template_row`設定オプションの引数としてこのファイルを使用できます（*注意: テンプレートおよびデータファイルには、***末尾に***余分な `\n` 記号がないことが必要です*）：

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

これで、データがテーブルにロードされたことを確認できます：

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

### 空白のスキップ {#skipping-whitespaces}
テンプレート内の区切り文字間の空白をスキップすることを可能にする[TemplateIgnoreSpaces](/interfaces/formats.md/#templateignorespaces)を考慮してください：
```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```

## テンプレートを使用したデータのエクスポート {#exporting-data-using-templates}

テンプレートを使用して任意のテキスト形式にデータをエクスポートすることもできます。この場合、2つのファイルを作成する必要があります：

[結果セットテンプレート](assets/output.results)は、全体の結果セットのレイアウトを定義します：

```response
== 上位10のIP ==
${data}
--- ${rows_read:XML} 行が ${time:XML} で読み込まれました ---
```

ここで、`rows_read`と`time`は各リクエストに対して利用可能なシステムメトリクスです。`data`は生成された行を表し（`${data}`はこのファイルにおいて常に最初のプレースホルダとして来る必要があります）、[**行テンプレートファイル**](assets/output.rows)に定義されたテンプレートに基づいています：

```response
${ip:Escaped} 生成された ${total:Escaped} リクエスト
```

これで、これらのテンプレートを使用して以下のクエリをエクスポートできます：

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
FORMAT Template SETTINGS format_template_resultset = 'output.results',
                         format_template_row = 'output.rows';

== 上位10のIP ==

9.8.4.6 生成された 3 リクエスト
9.5.1.1 生成された 3 リクエスト
2.4.8.9 生成された 3 リクエスト
4.8.8.2 生成された 3 リクエスト
4.5.4.4 生成された 3 リクエスト
3.3.6.4 生成された 2 リクエスト
8.9.5.9 生成された 2 リクエスト
2.5.1.8 生成された 2 リクエスト
6.8.3.6 生成された 2 リクエスト
6.6.3.5 生成された 2 リクエスト

--- 1000 行が 0.001380604 で読み込まれました ---
```

### HTMLファイルへのエクスポート {#exporting-to-html-files}
テンプレートベースの結果は、[`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md)句を使用してファイルにエクスポートすることもできます。指定された[結果セット](assets/html.results)と[行](assets/html.row)形式に基づいてHTMLファイルを生成しましょう：

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

テンプレート形式は、XMLを含むありとあらゆるテキスト形式ファイルを生成するために使用できます。関連するテンプレートを入力し、エクスポートを行うだけです。

また、メタデータを含む標準XML結果を得るために[XML](/interfaces/formats.md/#xml)形式を使用することも検討してください：

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

[Regexp](/interfaces/formats.md/#data-format-regexp)形式は、入力データがより複雑な方法で解析される必要がある場合のためのものです。今回は、ファイル名とプロトコルを別のカラムに保存するために、[error.log](assets/error.log)の例ファイルを解析しましょう。まずは、それに向けて新しいテーブルを準備します：

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

ClickHouseは、各キャプチャグループから対応するカラムにデータを挿入します。データを確認しましょう：

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

デフォルトでは、ClickHouseは一致しない行がある場合エラーを発生させます。一致しない行をスキップしたい場合は、オプション[format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched)を使用して有効にしてください：

```sql
SET format_regexp_skip_unmatched = 1;
```

## 他の形式 {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームに対応するために、多くの形式（テキスト形式およびバイナリ形式）のサポートを導入しています。以下の記事でさらに多くの形式とそれらの取り扱い方法を探ってください：

- [CSVおよびTSV形式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- **正規表現とテンプレート**
- [Nativeおよびバイナリ形式](binary.md)
- [SQL形式](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)をチェックしてください - ClickHouseサーバーを必要とせずにローカル/リモートファイルで作業するためのポータブルなフル機能ツールです。
