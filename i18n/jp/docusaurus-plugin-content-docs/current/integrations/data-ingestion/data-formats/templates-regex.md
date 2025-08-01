---
sidebar_label: 'Regexp とテンプレート'
sidebar_position: 3
slug: '/integrations/data-formats/templates-regexp'
title: 'テンプレートと正規表現を使用して ClickHouse でカスタムテキストデータをインポートおよびエクスポートする方法'
description: 'テンプレートと正規表現を使用して ClickHouse でカスタムテキストデータをインポートおよびエクスポートする方法を説明したページ'
---





# テンプレートと正規表現を使用したClickHouseにおけるカスタムテキストデータのインポートおよびエクスポート

私たちはしばしばカスタムテキスト形式のデータを扱う必要があります。それは非標準形式、無効なJSON、または破損したCSVである可能性があります。CSVやJSONのような標準パーサーは、すべてのケースで機能しない場合があります。しかし、ClickHouseには強力なテンプレートと正規表現フォーマットが用意されています。

## テンプレートに基づいたインポート {#importing-based-on-a-template}
次の [ログファイル](assets/error.log) からデータをインポートしたいと仮定します：

```bash
head error.log
```
```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

このデータをインポートするために、[テンプレート](/interfaces/formats.md/#format-template)フォーマットを使用できます。入力データの各行に対して値のプレースホルダーを持つテンプレート文字列を定義する必要があります：

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

指定されたテンプレートを使用してデータをインポートするには、テンプレート文字列をファイルに保存する必要があります（この場合は [row.template](assets/row.template)）:

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

`${name:escaping}` の形式で、カラム名とエスケープルールを定義します。ここではCSV、JSON、Escaped、Quotedなどの複数のオプションが利用可能です。これらはそれぞれの [エスケープルール](/interfaces/formats.md/#format-template) を実装しています。

次に、データをインポートする際に `format_template_row` 設定オプションの引数として指定されたファイルを使用できます（*注意：テンプレートファイルとデータファイルには**追加の `\n` シンボルがないことを確認してください*）：

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

そして、データがテーブルにロードされたことを確認できます：

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

### ホワイトスペースのスキップ {#skipping-whitespaces}
テンプレート内の区切り文字間のホワイトスペースをスキップするために、[TemplateIgnoreSpaces](/interfaces/formats.md/#templateignorespaces) の使用を検討してください:
```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```

## テンプレートを使用したデータのエクスポート {#exporting-data-using-templates}

テンプレートを使用して任意のテキスト形式にデータをエクスポートすることもできます。この場合、2つのファイルを作成する必要があります。

[結果セットテンプレート](assets/output.results)は、全体の結果セットのレイアウトを定義します：

```response
== トップ10 IP ==
${data}
--- ${rows_read:XML} 行が ${time:XML} に読み取られました ---
```

ここで、`rows_read` と `time` は各リクエストに対して利用可能なシステムメトリックです。一方、`data` は生成された行を示します（`${data}` はこのファイルの最初のプレースホルダーとして常に来るべきです）、[**行テンプレートファイル**](assets/output.rows) に基づいています：

```response
${ip:Escaped} が生成した ${total:Escaped} リクエスト
```

これらのテンプレートを使用して次のクエリをエクスポートしましょう：

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
FORMAT Template SETTINGS format_template_resultset = 'output.results',
                         format_template_row = 'output.rows';

== トップ10 IP ==

9.8.4.6 が生成した 3 リクエスト
9.5.1.1 が生成した 3 リクエスト
2.4.8.9 が生成した 3 リクエスト
4.8.8.2 が生成した 3 リクエスト
4.5.4.4 が生成した 3 リクエスト
3.3.6.4 が生成した 2 リクエスト
8.9.5.9 が生成した 2 リクエスト
2.5.1.8 が生成した 2 リクエスト
6.8.3.6 が生成した 2 リクエスト
6.6.3.5 が生成した 2 リクエスト

--- 1000 行が 0.001380604 に読み取られました ---
```

### HTMLファイルへのエクスポート {#exporting-to-html-files}
テンプレートベースの結果は、[`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md) 句を使用してファイルにエクスポートすることもできます。指定された [resultset](assets/html.results) および [row](assets/html.row) フォーマットに基づいてHTMLファイルを生成しましょう：

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

テンプレートフォーマットを使用して、想像できるすべてのテキスト形式ファイルを生成することができます。XMLを含む。関連するテンプレートを配置し、エクスポートを行ってください。

また、標準的なXML結果を含むメタデータを取得するために、[XML](/interfaces/formats.md/#xml) フォーマットを使用することも検討してください：

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

## 正規表現に基づいたデータのインポート {#importing-data-based-on-regular-expressions}

[Regexp](/interfaces/formats.md/#data-format-regexp)フォーマットは、入力データをより複雑な方法で解析する必要がある場合に対応します。今回は、ファイル名とプロトコルをキャプチャして、それらを別のカラムに保存するために[error.log](assets/error.log)の例ファイルを解析します。まず、新しいテーブルを準備しましょう：

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

ClickHouseは、各キャプチャグループのデータをその順序に基づいて関連するカラムに挿入します。それではデータを確認しましょう：

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

デフォルトでは、ClickHouseは不一致の行がある場合にエラーを発生させます。不一致の行をスキップしたい場合は、[format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched)オプションを使用して有効にします：

```sql
SET format_regexp_skip_unmatched = 1;
```

## その他の形式 {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするために、テキスト形式とバイナリ形式のサポートを導入しています。以下の記事で、さらに多くの形式とその操作方法を探索してください：

- [CSVおよびTSV形式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- **正規表現とテンプレート**
- [ネイティブおよびバイナリ形式](binary.md)
- [SQL形式](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を確認してください - ClickHouseサーバーを必要とせずにローカルまたはリモートファイルに作用するための、ポータブルなフル機能のツールです。

