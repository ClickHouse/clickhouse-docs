---
'sidebar_label': 'Vector'
'sidebar_position': 220
'slug': '/integrations/vector'
'description': 'Vector を使用して ClickHouse にログファイルを取り込む方法'
'title': 'Vector と ClickHouse の統合'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouseとVectorの統合

<CommunityMaintainedBadge/>

リアルタイムでログを分析できることは、生産アプリケーションにとって非常に重要です。ClickHouseがログデータの保存と分析に優れているかどうか、考えたことはありますか？ ELKからClickHouseへのログインフラの移行に関する<a href="https://eng.uber.com/logging/" target="_blank">Uberの経験</a>をチェックしてみてください。

このガイドでは、人気のデータパイプライン<a href="https://vector.dev/docs/about/what-is-vector/" target="_blank">Vector</a>を使用して、Nginxのログファイルをテールし、それをClickHouseに送信する方法を示します。以下のステップは、任意の種類のログファイルをテールする際にも似ています。すでにClickHouseが稼働しており、Vectorがインストールされていると仮定します（まだ起動する必要はありません）。

## 1. データベースとテーブルの作成 {#1-create-a-database-and-table}

ログイベントを保存するためのテーブルを定義します：

1. 新しいデータベース `nginxdb` から始めます：
```sql
CREATE DATABASE IF NOT EXISTS nginxdb
```

2. 初めは、全ログイベントを単一の文字列として挿入します。明らかにこれはログデータの分析に適した形式ではありませんが、***マテリアライズドビュー***を使用してその部分を後で解決します。
```sql
CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
    message String
)
ENGINE = MergeTree()
ORDER BY tuple()
```
    :::note
    現時点では主キーは本当に必要ありませんので、**ORDER BY**は**tuple()**に設定されています。
    :::

## 2. Nginxの構成 {#2--configure-nginx}

Nginxの詳細をあまり説明するつもりはありませんが、すべての詳細を隠すつもりもありませんので、このステップではNginxのログ設定を行うために十分な詳細を提供します。

1. 次の `access_log` プロパティは、**combined**形式でログを `/var/log/nginx/my_access.log` に送信します。この値は、`nginx.conf` ファイルの `http` セクションに入ります：
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

2. `nginx.conf` を変更した場合は、必ずNginxを再起動してください。

3. ウェブサーバーのページを訪問して、アクセスログにいくつかのログイベントを生成します。**combined**形式のログは次のような形式を持っています：
```bash
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

## 3. Vectorの構成 {#3-configure-vector}

Vectorは、ログ、メトリクス、およびトレース（**ソース**と呼ばれます）を収集、変換し、多くの異なるベンダー（**シンク**と呼ばれます）にルーティングします。ClickHouseとの標準的な互換性があります。ソースとシンクは、**vector.toml**という設定ファイルで定義します。

1. 次の **vector.toml** は、**my_access.log** の末尾をテールする **file**タイプの**ソース**を定義し、上記で定義した **access_logs** テーブルを **シンク**として定義しています：
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

2. 上記の設定を使用してVectorを起動します。ソースとシンクの定義については<a href="https://vector.dev/docs/" target="_blank">Vectorのドキュメント</a>を参照してください。

3. アクセスログがClickHouseに挿入されているかどうかを確認します。次のクエリを実行すると、テーブルにアクセスログが表示されるはずです：
```sql
SELECT * FROM nginxdb.access_logs
```
    <Image img={vector01} size="lg" border alt="テーブル形式でClickHouseのログを表示" />

## 4. ログの解析 {#4-parse-the-logs}

ClickHouseにログがあるのは素晴らしいことですが、各イベントを単一の文字列として保存すると、あまりデータ分析ができません。マテリアライズドビューを使用してログイベントを解析する方法を見てみましょう。

1. **マテリアライズドビュー**（MVの略）は、既存のテーブルに基づく新しいテーブルであり、既存のテーブルに挿入が行われると、新しいデータもマテリアライズドビューに追加されます。**access_logs**にログイベントの解析された表現を含むMVを定義する方法を見てみましょう、言い換えれば：
```bash
192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

    ClickHouseには文字列を解析するためのさまざまな関数がありますが、初めに見てみるべきは**splitByWhitespace**です。これは、空白で文字列を解析し、各トークンを配列として返します。デモンストレーションのために、次のコマンドを実行します：
```sql
SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

    返答は私たちが欲しいものにかなり近いことに気付いてください！いくつかの文字列には余分な文字があり、ユーザーエージェント（ブラウザの詳細）は解析する必要がありませんでしたが、次のステップでそれを解決します：
```text
["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
```

2. **splitByWhitespace**に似て、**splitByRegexp**関数は正規表現に基づいて文字列を配列に分割します。次のコマンドを実行すると、2つの文字列が返されます。
```sql
SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

    返された2番目の文字列は、ログから正常に解析されたユーザーエージェントです：
```text
["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
```

3. 最終的な**CREATE MATERIALIZED VIEW**コマンドを確認する前に、データをクリーンアップするために使用されるいくつかの関数を見てみましょう。たとえば、`RequestMethod` は **"GET** という不要な二重引用符を持っています。次の **trim** 関数を実行すると、二重引用符を削除できます：
```sql
SELECT trim(LEADING '"' FROM '"GET')
```

4. 時間文字列には先頭に角括弧があり、ClickHouseが日付に解析できる形式でもありません。しかし、区切り文字をコロン（**:**）からカンマ（**,**）に変更すれば、解析がうまくいきます：
```sql
SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
```

5. マテリアライズドビューを定義する準備が整いました。私たちの定義には **POPULATE** が含まれており、これにより **access_logs** の既存の行がすぐに処理されて挿入されます。次のSQL文を実行します：
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

6. 正常に機能したことを確認します。アクセスログがきれいにカラムに解析されて表示されるはずです：
```sql
SELECT * FROM nginxdb.access_logs_view
```
    <Image img={vector02} size="lg" border alt="解析されたClickHouseのログをテーブル形式で表示" />

    :::note
    上記のレッスンではデータを2つのテーブルに保存しましたが、最初の `nginxdb.access_logs` テーブルを **Null** テーブルエンジンを使用するように変更することもできます - 解析されたデータは依然として `nginxdb.access_logs_view` テーブルに入りますが、生のデータはテーブルに保存されません。
    :::

**まとめ：** シンプルなインストールと迅速な設定を必要とするVectorを使用することで、NginxサーバーからClickHouseのテーブルにログを送信できます。巧妙なマテリアライズドビューを使用することで、これらのログをカラムに解析し、より簡単に分析できるようになります。
