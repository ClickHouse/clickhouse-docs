---
sidebar_label: '正規表現とテンプレート'
sidebar_position: 3
slug: /integrations/data-formats/templates-regexp
title: 'ClickHouse におけるテンプレートと正規表現を使用したカスタムテキストデータのインポートとエクスポート'
description: 'ClickHouse でテンプレートと正規表現を使用してカスタムテキストデータをインポートおよびエクスポートする方法を説明するページ'
doc_type: 'guide'
keywords: ['data formats', 'templates', 'regex', 'custom formats', 'parsing']
---



# ClickHouse における Template と Regex を用いたカスタムテキストデータのインポートとエクスポート

非標準形式、不正な JSON、壊れた CSV など、カスタムテキスト形式のデータを扱わなければならない場面は多くあります。こうしたすべてのケースで、CSV や JSON といった標準パーサーがそのまま使えるとは限りません。そこで ClickHouse では、強力な Template 形式と Regex 形式により、これらの課題に対応しています。



## テンプレートに基づくインポート {#importing-based-on-a-template}

次の[ログファイル](assets/error.log)からデータをインポートする場合を考えます:

```bash
head error.log
```

```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

このデータをインポートするには、[Template](/interfaces/formats/Template)形式を使用できます。入力データの各行に対して、値のプレースホルダーを含むテンプレート文字列を定義する必要があります:

```response
<time> [error] client: <ip>, server: <host> "<request>"
```

データをインポートするためのテーブルを作成しましょう:

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

指定したテンプレートを使用してデータをインポートするには、テンプレート文字列をファイルに保存する必要があります(この例では[row.template](assets/row.template)):

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

`${name:escaping}`形式でカラム名とエスケープルールを定義します。CSV、JSON、Escaped、Quotedなど、[それぞれのエスケープルール](/interfaces/formats/Template)を実装する複数のオプションが利用可能です。

これで、データをインポートする際に`format_template_row`設定オプションの引数として指定したファイルを使用できます(_注意: テンプレートファイルとデータファイルはファイルの末尾に余分な`\n`記号を**含めないでください**_):

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

そして、データがテーブルに読み込まれたことを確認できます:

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

### 空白文字のスキップ {#skipping-whitespaces}

テンプレート内の区切り文字間の空白文字をスキップできる[TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces)の使用を検討してください:

```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```


## テンプレートを使用したデータのエクスポート {#exporting-data-using-templates}

テンプレートを使用して、任意のテキスト形式にデータをエクスポートすることもできます。この場合、2つのファイルを作成する必要があります:

結果セット全体のレイアウトを定義する[結果セットテンプレート](assets/output.results):

```response
== Top 10 IPs ==
${data}
--- ${rows_read:XML} rows read in ${time:XML} ---
```

ここで、`rows_read`と`time`は各リクエストで利用可能なシステムメトリクスです。`data`は生成された行を表し（`${data}`は常にこのファイルの最初のプレースホルダーとして配置する必要があります）、[**行テンプレートファイル**](assets/output.rows)で定義されたテンプレートに基づいています:

```response
${ip:Escaped} generated ${total:Escaped} requests
```

それでは、これらのテンプレートを使用して次のクエリをエクスポートしましょう:

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
FORMAT Template SETTINGS format_template_resultset = 'output.results',
                         format_template_row = 'output.rows';

== Top 10 IPs ==

9.8.4.6 generated 3 requests
9.5.1.1 generated 3 requests
2.4.8.9 generated 3 requests
4.8.8.2 generated 3 requests
4.5.4.4 generated 3 requests
3.3.6.4 generated 2 requests
8.9.5.9 generated 2 requests
2.5.1.8 generated 2 requests
6.8.3.6 generated 2 requests
6.6.3.5 generated 2 requests

--- 1000 rows read in 0.001380604 ---
```

### HTMLファイルへのエクスポート {#exporting-to-html-files}

テンプレートベースの結果は、[`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md)句を使用してファイルにエクスポートすることもできます。指定された[結果セット](assets/html.results)と[行](assets/html.row)形式に基づいてHTMLファイルを生成しましょう:

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

テンプレート形式は、XMLを含むあらゆる想定可能なテキスト形式ファイルの生成に使用できます。関連するテンプレートを配置してエクスポートを実行するだけです。

また、メタデータを含む標準的なXML結果を取得するには、[XML](/interfaces/formats/XML)形式の使用も検討してください:

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

[Regexp](/interfaces/formats/Regexp)フォーマットは、入力データをより複雑な方法で解析する必要がある高度なケースに対応します。[error.log](assets/error.log)のサンプルファイルを解析しますが、今回はファイル名とプロトコルをキャプチャして別々のカラムに保存します。まず、そのための新しいテーブルを準備しましょう:

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

次に、正規表現に基づいてデータをインポートできます:

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS
  format_regexp = '(.+?) \\[error\\]  client: (.+), server: (.+?) "GET .+?([^/]+\\.[^ ]+) (.+?)"'
FORMAT Regexp
```

ClickHouseは各キャプチャグループからのデータを、その順序に基づいて対応するカラムに挿入します。データを確認してみましょう:

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

デフォルトでは、ClickHouseは一致しない行がある場合にエラーを発生させます。一致しない行をスキップする場合は、[format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched)オプションを使用して有効にしてください:

```sql
SET format_regexp_skip_unmatched = 1;
```


## その他のフォーマット {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームに対応するため、テキスト形式とバイナリ形式の両方で多数のフォーマットをサポートしています。以下の記事で、その他のフォーマットと使用方法の詳細をご確認ください:

- [CSVおよびTSV形式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- **正規表現とテンプレート**
- [ネイティブおよびバイナリ形式](binary.md)
- [SQL形式](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)もご確認ください。これはClickHouseサーバーを必要とせず、ローカル/リモートファイルを操作できるポータブルでフル機能を備えたツールです。
