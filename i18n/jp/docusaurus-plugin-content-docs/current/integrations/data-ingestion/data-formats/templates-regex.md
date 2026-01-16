---
sidebar_label: '正規表現とテンプレート'
sidebar_position: 3
slug: /integrations/data-formats/templates-regexp
title: 'ClickHouse でテンプレートと正規表現を使用してカスタムテキストデータをインポートおよびエクスポートする'
description: 'ClickHouse でテンプレートと正規表現を使用してカスタムテキストをインポートおよびエクスポートする方法について説明するページ'
doc_type: 'guide'
keywords: ['データ形式', 'テンプレート', '正規表現', 'カスタム形式', '解析']
---

# ClickHouse で Templates と Regex を使用してカスタムテキストデータをインポートおよびエクスポートする \\{#importing-and-exporting-custom-text-data-using-templates-and-regex-in-clickhouse\\}

独自テキスト形式のデータ、たとえば非標準的なフォーマット、不正な JSON、壊れた CSV などを扱わなければならないことはよくあります。CSV や JSON といった標準パーサーでは、こうしたすべてのケースを扱えるとは限りません。しかし ClickHouse には強力な Template フォーマットと Regex フォーマットが用意されており、これらのケースにも対応できます。

## テンプレートに基づくインポート \\{#importing-based-on-a-template\\}

次の[ログファイル](assets/error.log)からデータをインポートしたいとします。

```bash
head error.log
```

```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

このデータをインポートするには、[Template](/interfaces/formats/Template) フォーマットを使用できます。入力データの各行ごとに、値のプレースホルダーを含むテンプレート文字列を定義する必要があります。

```response
<time> [error] client: <ip>, server: <host> "<request>"
```

データを取り込むためのテーブルを作成します：

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

指定されたテンプレートを使ってデータをインポートするには、テンプレート文字列をファイルに保存する必要があります（この例では [row.template](assets/row.template) ファイル）。

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

`${name:escaping}` という形式で、カラム名とエスケープルールを定義します。ここでは CSV、JSON、Escaped、Quoted など複数のオプションが利用でき、それぞれが[対応するエスケープルール](/interfaces/formats/Template)を実装しています。

これで、データをインポートする際に `format_template_row` 設定オプションの引数として、このファイルを指定できます（*テンプレートファイルとデータファイルの末尾には、余分な `\n` 改行文字を **含めない** ように注意してください*）:

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

テーブルにデータがロードされたことを確認できます：

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

### 空白のスキップ \\{#skipping-whitespaces\\}

テンプレート内の区切り文字同士の間にある空白を無視できるようにするには、[TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces) の利用を検討してください。

```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```

## テンプレートを使用したデータのエクスポート \\{#exporting-data-using-templates\\}

テンプレートを使用して任意のテキスト形式でデータをエクスポートすることもできます。この場合は、次の 2 つのファイルを作成する必要があります。

[結果セットテンプレート](assets/output.results)、結果セット全体のレイアウトを定義します。

```response
== Top 10 IPs ==
${data}
--- ${rows_read:XML} rows read in ${time:XML} ---
```

ここで `rows_read` と `time` は、各リクエストごとに利用できるシステムメトリクスです。一方で `data` は、[**row template file**](assets/output.rows) で定義されたテンプレートに基づいて生成される行を表し（このファイルでは `${data}` は常に最初のプレースホルダーとして指定する必要があります）、

```response
${ip:Escaped} generated ${total:Escaped} requests
```

では、これらのテンプレートを使って次のクエリをエクスポートしてみましょう。

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

### HTML ファイルへのエクスポート \\{#exporting-to-html-files\\}

テンプレートベースの結果は、[`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md) 句を使用してファイルにエクスポートすることもできます。次の [resultset](assets/html.results) および [row](assets/html.row) のフォーマットに基づいて HTML ファイルを生成してみましょう。

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

### XML へのエクスポート \\{#exporting-to-xml\\}

Template フォーマットは、XML を含むあらゆるテキスト形式ファイルを生成するために使用できます。適切なテンプレートを用意してエクスポートを実行してください。

メタデータを含む標準的な XML を取得するには、[XML](/interfaces/formats/XML) フォーマットの使用も検討してください。

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

## 正規表現に基づくデータのインポート \\{#importing-data-based-on-regular-expressions\\}

[Regexp](/interfaces/formats/Regexp) フォーマットは、入力データをより複雑な方法で解析する必要がある、高度なユースケースに対応します。ここでは [error.log](assets/error.log) のサンプルファイルを解析し、今回はファイル名とプロトコルも抽出して、それぞれ別のカラムに保存します。まず、そのための新しいテーブルを準備します。

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

これで、正規表現を使ってデータをインポートできるようになりました。

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS
  format_regexp = '(.+?) \\[error\\]  client: (.+), server: (.+?) "GET .+?([^/]+\\.[^ ]+) (.+?)"'
FORMAT Regexp
```

ClickHouse はキャプチャグループの順序に応じて、それぞれ対応するカラムにデータを挿入します。データを確認してみましょう。

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

デフォルトでは、ClickHouse は一致しない行がある場合にエラーを返します。一致しない行をスキップしたい場合は、[format&#95;regexp&#95;skip&#95;unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched) オプションを有効にしてください。

```sql
SET format_regexp_skip_unmatched = 1;
```

## その他のフォーマット \\{#other-formats\\}

ClickHouse は、さまざまなシナリオやプラットフォームをカバーするために、多数のフォーマット（テキストおよびバイナリ）をサポートしています。以下の記事で、さらに多くのフォーマットとその扱い方を確認できます。

- [CSV および TSV フォーマット](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON フォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- **Regex とテンプレート**
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQL フォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) も確認してください。これは、ClickHouse サーバーを必要とせずにローカル/リモートのファイルを扱える、移植性の高いフル機能ツールです。
