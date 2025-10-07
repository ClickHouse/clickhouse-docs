---
'sidebar_label': '正規表現とテンプレート'
'sidebar_position': 3
'slug': '/integrations/data-formats/templates-regexp'
'title': 'ClickHouseにおけるテンプレートと正規表現を使用したカスタムテキストデータのインポートとエクスポート'
'description': 'ClickHouseでカスタムテキストをテンプレートと正規表現を使用してインポートおよびエクスポートする方法を説明するページ'
'doc_type': 'guide'
---


# カスタムテキストデータのインポートとエクスポート（テンプレートと正規表現を使用） 

私たちはしばしばカスタムテキストフォーマットのデータを扱う必要があります。それは非標準フォーマット、無効なJSON、または壊れたCSVである可能性があります。CSVやJSONのような標準パーサーは、すべてのケースで機能するわけではありません。しかし、ClickHouseは強力なテンプレートと正規表現形式を提供しているため、私たちはここで問題を解決できます。

## テンプレートに基づくインポート {#importing-based-on-a-template}
次の [ログファイル](assets/error.log) からデータをインポートしたいとしましょう：

```bash
head error.log
```
```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

このデータをインポートするために、[テンプレート](/interfaces/formats.md/#format-template)形式を使用できます。入力データの各行の値プレースホルダーを含むテンプレート文字列を定義する必要があります：

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

与えられたテンプレートを使用してデータをインポートするには、まずテンプレート文字列をファイル ([row.template](assets/row.template)) に保存する必要があります：

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

`${name:escaping}`形式でカラムの名前とエスケープルールを定義します。ここで、CSV、JSON、エスケープされたもの、または引用符で囲まれたものなど、[それぞれのエスケープルール](/interfaces/formats.md/#format-template)を実装する複数のオプションがあります。

次に、データをインポートする際に `format_template_row` 設定オプションの引数としてこのファイルを使用できます（*ファイルの最後に**余分な `\n` シンボルが**あってはいけません*）：

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
テンプレート内の区切り文字間のホワイトスペースをスキップする [TemplateIgnoreSpaces](/interfaces/formats.md/#templateignorespaces) を使用することを考慮してください：
```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```

## テンプレートを使用したデータのエクスポート {#exporting-data-using-templates}

また、テンプレートを使用して任意のテキストフォーマットにデータをエクスポートすることもできます。この場合、2つのファイルを作成する必要があります：

[結果セットテンプレート](assets/output.results) は、全体の結果セットのレイアウトを定義します：

```response
== Top 10 IPs ==
${data}
--- ${rows_read:XML} rows read in ${time:XML} ---
```

ここでは、`rows_read` と `time` は各リクエストに対して利用可能なシステムメトリックです。`data` は生成された行を示し（`${data}` はこのファイルの最初のプレースホルダーとして常に置く必要があります）、これは [**行テンプレートファイル**](assets/output.rows) に定義されたテンプレートに基づいています：

```response
${ip:Escaped} generated ${total:Escaped} requests
```

次に、これらのテンプレートを使用して次のクエリをエクスポートしましょう：

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
テンプレートベースの結果は、[`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md) 句を使用してファイルにエクスポートすることもできます。与えられた [resultset](assets/html.results) と [row](assets/html.row) フォーマットに基づいてHTMLファイルを生成しましょう：

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

テンプレート形式を使用して、XMLを含むありとあらゆるテキストフォーマットファイルを生成できます。関連するテンプレートを配置し、エクスポートを行ってください。

メタデータを含む標準XML結果を取得するために、[XML](/interfaces/formats.md/#xml)形式の使用も検討してください：

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

[Regexp](/interfaces/formats.md/#data-format-regexp)形式は、入力データをより複雑な方法で解析する必要がある場合に対応します。今回は、ファイル名とプロトコルをキャプチャしてそれらを別々のカラムに保存するために、私たちの [error.log](assets/error.log) サンプルファイルを解析しましょう。まず、これを準備するための新しいテーブルを作成します：

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

ClickHouseは、各キャプチャグループのデータをその順序に基づいて関連するカラムに挿入します。データを確認してみましょう：

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

デフォルトでは、ClickHouseは一致しない行がある場合にエラーを発生させます。一致しない行をスキップしたい場合は、[format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched)オプションを使用して有効にしてください：

```sql
SET format_regexp_skip_unmatched = 1;
```

## その他のフォーマット {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするために、多くのフォーマット（テキストおよびバイナリ）のサポートを導入しています。以下の記事で、より多くのフォーマットやそれらとの作業方法を探求してください：

- [CSVおよびTSVフォーマット](csv-tsv.md)
- [Parquet](parquet.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- **正規表現とテンプレート**
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQLフォーマット](sql.md)

また、Clickhouseサーバーを必要とせずにローカル/リモートファイルで作業するためのポータブルフル機能ツール [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) も確認してください。
