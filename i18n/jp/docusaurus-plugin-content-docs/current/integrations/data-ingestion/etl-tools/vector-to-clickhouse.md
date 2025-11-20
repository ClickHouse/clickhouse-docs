---
sidebar_label: 'Vector'
sidebar_position: 220
slug: /integrations/vector
description: 'Vector を使用してログファイルをテールして ClickHouse に取り込む方法'
title: 'Vector と ClickHouse の連携'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://vector.dev/'
keywords: ['vector', 'log collection', 'observability', 'data ingestion', 'pipeline']
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# VectorとClickHouseの統合

<PartnerBadge />

本番環境のアプリケーションでは、ログをリアルタイムで分析できることが非常に重要です。
ClickHouseは、優れた圧縮性能(ログに対して最大[170倍](https://clickhouse.com/blog/log-compression-170x))と大量のデータを高速に集計する能力により、ログデータの保存と分析に優れています。

このガイドでは、人気のデータパイプライン[Vector](https://vector.dev/docs/about/what-is-vector/)を使用してNginxログファイルをテーリングし、ClickHouseに送信する方法を説明します。
以下の手順は、あらゆる種類のログファイルのテーリングにも同様に適用できます。

**前提条件:**

- ClickHouseが既に稼働していること
- Vectorがインストールされていること

<VerticalStepper headerLevel="h2">


## データベースとテーブルの作成 {#1-create-a-database-and-table}

ログイベントを格納するテーブルを定義します:

1. まず、`nginxdb`という名前の新しいデータベースを作成します:

```sql
CREATE DATABASE IF NOT EXISTS nginxdb
```

2. ログイベント全体を単一の文字列として挿入します。これはログデータの分析を行うには適切な形式ではありませんが、その部分については後ほど**_マテリアライズドビュー_**を使用して解決します。

```sql
CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
  message String
)
ENGINE = MergeTree()
ORDER BY tuple()
```

:::note
まだプライマリキーが不要なため、**ORDER BY**は**tuple()**(空のタプル)に設定されています。
:::


## Nginxの設定 {#2--configure-nginx}

このステップでは、Nginxのログ設定方法について説明します。

1. 以下の`access_log`プロパティは、**combined**形式でログを`/var/log/nginx/my_access.log`に送信します。
   この値は`nginx.conf`ファイルの`http`セクションに配置します:

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

2. `nginx.conf`を変更した場合は、必ずNginxを再起動してください。

3. Webサーバー上のページにアクセスして、アクセスログにログイベントを生成します。
   **combined**形式のログは以下のようになります:

```bash
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```


## Vectorの設定 {#3-configure-vector}

Vectorは、ログ、メトリクス、トレース（**ソース**と呼ばれる）を収集、変換し、ClickHouseとの標準互換性を含む多数のベンダー（**シンク**と呼ばれる）にルーティングします。
ソースとシンクは、**vector.toml**という名前の設定ファイルで定義されます。

1. 以下の**vector.toml**ファイルは、**my_access.log**の末尾を追跡する**file**タイプの**ソース**を定義し、上記で定義した**access_logs**テーブルを**シンク**として定義します。

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

2. 上記の設定を使用してVectorを起動します。ソースとシンクの定義の詳細については、Vectorの[ドキュメント](https://vector.dev/docs/)を参照してください。

3. 以下のクエリを実行して、アクセスログがClickHouseに挿入されていることを確認します。テーブルにアクセスログが表示されます。

```sql
SELECT * FROM nginxdb.access_logs
```

<Image
  img={vector01}
  size='lg'
  border
  alt='ClickHouseログをテーブル形式で表示'
/>


## ログの解析 {#4-parse-the-logs}

ClickHouseにログを格納することは有用ですが、各イベントを単一の文字列として保存するだけでは、十分なデータ分析を行うことができません。
次に、[マテリアライズドビュー](/materialized-view/incremental-materialized-view)を使用してログイベントを解析する方法を見ていきます。

**マテリアライズドビュー**は、SQLのインサートトリガーと同様に機能します。ソーステーブルにデータ行が挿入されると、マテリアライズドビューはこれらの行を変換し、結果をターゲットテーブルに挿入します。
マテリアライズドビューを設定することで、**access_logs**内のログイベントの解析済み表現を構成できます。
このようなログイベントの例を以下に示します:

```bash
192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

ClickHouseには、上記の文字列を解析するためのさまざまな関数があります。[`splitByWhitespace`](/sql-reference/functions/splitting-merging-functions#splitByWhitespace)関数は、文字列を空白文字で分割し、各トークンを配列として返します。
実際に試すには、次のコマンドを実行してください:

```sql title="Query"
SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

```text title="Response"
["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
```

いくつかの文字列には余分な文字が含まれており、ユーザーエージェント(ブラウザの詳細情報)は解析する必要がありませんでしたが、結果の配列は必要なものにほぼ近い形になっています。

`splitByWhitespace`と同様に、[`splitByRegexp`](/sql-reference/functions/splitting-merging-functions#splitByRegexp)関数は、正規表現に基づいて文字列を配列に分割します。
次のコマンドを実行すると、2つの文字列が返されます。

```sql
SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

返された2番目の文字列が、ログから正常に解析されたユーザーエージェントであることに注目してください:

```text
["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
```

最終的な`CREATE MATERIALIZED VIEW`コマンドを見る前に、データをクリーンアップするために使用されるいくつかの関数を確認しましょう。
例えば、`RequestMethod`の値は`"GET`であり、不要な二重引用符が含まれています。
[`trimBoth`(エイリアス`trim`)](/sql-reference/functions/string-functions#trimBoth)関数を使用して、二重引用符を削除できます:

```sql
SELECT trim(LEADING '"' FROM '"GET')
```

時刻文字列には先頭に角括弧があり、またClickHouseが日付として解析できる形式でもありません。
しかし、区切り文字をコロン(**:**)からスペース(**␣**)に変更すると、解析が正常に機能します:

```sql
SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
```


これでマテリアライズドビューを定義する準備が整いました。
以下の定義には`POPULATE`が含まれており、**access_logs**内の既存の行が即座に処理され挿入されることを意味します。
次のSQL文を実行してください:

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

次に、正常に動作したことを確認します。
アクセスログが列に適切に解析されて表示されるはずです:

```sql
SELECT * FROM nginxdb.access_logs_view
```

<Image
  img={vector02}
  size='lg'
  border
  alt='解析されたClickHouseログをテーブル形式で表示'
/>

:::note
上記の例ではデータを2つのテーブルに保存していますが、最初の`nginxdb.access_logs`テーブルを[`Null`](/engines/table-engines/special/null)テーブルエンジンを使用するように変更することもできます。
解析されたデータは引き続き`nginxdb.access_logs_view`テーブルに格納されますが、生データはテーブルに保存されません。
:::

</VerticalStepper>

> シンプルなインストールと迅速な設定のみを必要とするVectorを使用することで、NginxサーバーからClickHouseのテーブルにログを送信できます。マテリアライズドビューを使用することで、これらのログを列に解析し、より簡単に分析を行うことができます。
