---
sidebar_label: 'Vector'
sidebar_position: 220
slug: /integrations/vector
description: 'Vector でログファイルをテールして ClickHouse に取り込む方法'
title: 'Vector と ClickHouse の連携'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://vector.dev/'
keywords: ['vector', 'ログ収集', '可観測性', 'データインジェスト', 'パイプライン']
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Vector と ClickHouse の統合 \\{#integrating-vector-with-clickhouse\\}

<PartnerBadge />

本番環境のアプリケーションでは、ログをリアルタイムに分析できることが極めて重要です。
ClickHouse は、優れた圧縮率（ログでは最大 [170x](https://clickhouse.com/blog/log-compression-170x)）と、大量データを高速に集計できる性能により、ログデータの保存と分析に特に優れています。

このガイドでは、広く利用されているデータパイプラインである [Vector](https://vector.dev/docs/about/what-is-vector/) を使用して Nginx のログファイルをテールし、ClickHouse に送信する方法を説明します。
以下の手順は、任意の種類のログファイルをテールする場合にもほぼ同様に適用できます。

**前提条件:**

* ClickHouse がすでに稼働していること
* Vector がインストールされていること

<VerticalStepper headerLevel="h2">

## データベースとテーブルを作成する \\{#1-create-a-database-and-table\\}

ログイベントを保存するためのテーブルを定義します。

1. まず、`nginxdb` という名前の新しいデータベースを作成します:

```sql
CREATE DATABASE IF NOT EXISTS nginxdb
```

2. ログイベント全体を1つの文字列として挿入します。もちろん、この形式はログデータを分析するのに適したものではありませんが、その点は後ほど***マテリアライズドビュー***を使って解決していきます。

```sql
CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
  message String
)
ENGINE = MergeTree()
ORDER BY tuple()
```

:::note
**ORDER BY** は、まだ主キーが不要なため、空のタプルである **tuple()** に設定されています。
:::

## Nginx を構成する \\{#2--configure-nginx\\}

このステップでは、Nginx のログ出力を構成する方法を説明します。

1. 次の `access_log` プロパティは、ログを **combined** 形式で `/var/log/nginx/my_access.log` に出力します。
   この値は `nginx.conf` ファイルの `http` セクションに記述します：

```bash
http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  access_log  /var/log/nginx/my_access.log combined;
  sendfile        on;
  keepalive_timeout  65;
  include /etc/nginx/conf.d/*.conf;
}
```

2. `nginx.conf` を変更した場合は、必ず Nginx を再起動してください。

3. Web サーバー上のページにアクセスして、アクセスログにログイベントをいくつか生成してください。
   **combined** 形式のログは次のようになります。

```bash
 192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
 192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
 192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
 ```

## Vector を設定する \\{#3-configure-vector\\}

Vector はログ、メトリクス、トレース（**sources** と呼ばれます）を収集・変換・ルーティングし、ClickHouse を含む多数の異なるベンダー（**sinks** と呼ばれます）へ送信します。
Source と sink は **vector.toml** という名前の設定ファイルで定義します。

1. 次の **vector.toml** ファイルでは、**my_access.log** の末尾を tail する **file** 型の **source** と、上で定義した **access_logs** テーブルを **sink** として定義しています。

```bash
[sources.nginx_logs]
type = "file"
include = [ "/var/log/nginx/my_access.log" ]
read_from = "end"

[sinks.clickhouse]
type = "clickhouse"
inputs = ["nginx_logs"]
endpoint = "http://clickhouse-server:8123"
database = "nginxdb"
table = "access_logs"
skip_unknown_fields = true
```

2. 上記の構成を使用して Vector を起動します。ソースおよびシンクの定義についての詳細は、Vector の[ドキュメント](https://vector.dev/docs/)を参照してください。

3. 次のクエリを実行して、アクセスログが ClickHouse に取り込まれていることを確認します。テーブル内にアクセスログが表示されるはずです。

```sql
SELECT * FROM nginxdb.access_logs
```

<Image img={vector01} size="lg" border alt="テーブル形式で ClickHouse のログを表示する" />

## ログをパースする \\{#4-parse-the-logs\\}

ログを ClickHouse に保存できるのは有用ですが、各イベントを 1 つの文字列として保存するだけでは、十分なデータ分析は行えません。
次に、[マテリアライズドビュー](/materialized-view/incremental-materialized-view) を使用してログイベントをどのようにパースするかを見ていきます。

**マテリアライズドビュー** は、SQL における INSERT トリガーと同様に機能します。ソーステーブルにデータ行が挿入されると、マテリアライズドビューはそれらの行を変換し、その結果をターゲットテーブルに挿入します。
マテリアライズドビューを設定して、**access_logs** 内のログイベントのパース済み表現を生成できます。
そのようなログイベントの 1 つの例を以下に示します。

```bash
192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

ClickHouse には、上記の文字列を解析するためのさまざまな関数があります。[`splitByWhitespace`](/sql-reference/functions/splitting-merging-functions#splitByWhitespace) 関数は、文字列を空白文字で分割し、各トークンを配列で返します。
動作を確認するには、次のコマンドを実行します。

```sql title="Query"
SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

```text title="Response"
["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
```

いくつかの文字列には余分な文字が含まれており、ユーザーエージェント（ブラウザ情報）は解析する必要はありませんでしたが、
結果として得られた配列は、必要なものにかなり近い形になっています。

`splitByWhitespace` と同様に、[`splitByRegexp`](/sql-reference/functions/splitting-merging-functions#splitByRegexp) 関数は、正規表現に基づいて文字列を配列に分割します。
次のコマンドを実行します。2 つの文字列が返されます。

```sql
SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

2 番目に返される文字列が、ログから正常に解析されたユーザーエージェントであることに注目してください。

```text
["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
```

最終的な `CREATE MATERIALIZED VIEW` コマンドを見る前に、データをクリーンアップするために使用する、いくつかの関数をさらに確認しておきます。
たとえば、`RequestMethod` の値は先頭に不要な二重引用符が付いた `"GET` になっています。
この二重引用符を削除するには、[`trimBoth`（エイリアス `trim`）](/sql-reference/functions/string-functions#trimBoth) 関数を使用できます。

```sql
SELECT trim(LEADING '"' FROM '"GET')
```

時刻文字列は先頭に角括弧が付いており、ClickHouse が日付として解析できる形式にもなっていません。
しかし、区切り文字をコロン（**:**）からカンマ（**,**）に変更すると、問題なく解析できるようになります:

```sql
SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
```

これでマテリアライズドビューを定義する準備が整いました。
以下の定義には `POPULATE` 句が含まれており、これは **access_logs** に既に存在する行がすぐに処理され、その場で挿入されることを意味します。
次の SQL ステートメントを実行してください:

```sql
CREATE MATERIALIZED VIEW nginxdb.access_logs_view
(
  RemoteAddr String,
  Client String,
  RemoteUser String,
  TimeLocal DateTime,
  RequestMethod String,
  Request String,
  HttpVersion String,
  Status Int32,
  BytesSent Int64,
  UserAgent String
)
ENGINE = MergeTree()
ORDER BY RemoteAddr
POPULATE AS
WITH
  splitByWhitespace(message) as split,
  splitByRegexp('\S \d+ "([^"]*)"', message) as referer
SELECT
  split[1] AS RemoteAddr,
  split[2] AS Client,
  split[3] AS RemoteUser,
  parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM split[4]), ':', ' ')) AS TimeLocal,
  trim(LEADING '"' FROM split[6]) AS RequestMethod,
  split[7] AS Request,
  trim(TRAILING '"' FROM split[8]) AS HttpVersion,
  split[9] AS Status,
  split[10] AS BytesSent,
  trim(BOTH '"' from referer[2]) AS UserAgent
FROM
  (SELECT message FROM nginxdb.access_logs)
```

続いて、正しく動作しているか確認します。
アクセスログが列ごとにきれいにパースされて表示されるはずです:

```sql
SELECT * FROM nginxdb.access_logs_view
```

<Image img={vector02} size="lg" border alt="パース済みの ClickHouse ログをテーブル形式で表示" />

:::note
上記のレッスンではデータを 2 つのテーブルに保存しましたが、最初の `nginxdb.access_logs` テーブルを [`Null`](/engines/table-engines/special/null) テーブルエンジンを使用するように変更することもできます。
パース済みデータは変わらず `nginxdb.access_logs_view` テーブルに格納されますが、生のデータはテーブルには保存されません。
:::
</VerticalStepper>

> シンプルなインストールと短時間の設定だけで利用できる Vector を使うと、Nginx サーバーからのログを ClickHouse のテーブルに送信できます。マテリアライズドビューを使用すれば、それらのログを列にパースして、より簡単に分析できるようにできます。
