---
sidebar_label: Vector
sidebar_position: 220
slug: /integrations/vector
description: ClickHouseにログファイルを取り込む方法を示します。
---

import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';


# ClickHouseとのVectorの統合

リアルタイムでログを分析できることは、プロダクションアプリケーションにとって極めて重要です。ClickHouseがログデータの保存と分析に適しているかどうか考えたことはありますか？ <a href="https://eng.uber.com/logging/" target="_blank">Uberの経験</a>を見て、自社のログインフラストラクチャをELKからClickHouseに移行した事例をご覧ください。

このガイドでは、人気のデータパイプライン<a href="https://vector.dev/docs/about/what-is-vector/" target="_blank">Vector</a>を使用して、Nginxのログファイルをテールし、ClickHouseに送信する方法を示します。以下の手順は、あらゆる種類のログファイルをテールする場合にも似ています。すでにClickHouseが稼働中で、Vectorがインストールされていると仮定しますが、まだ起動する必要はありません。

## 1. データベースとテーブルを作成する {#1-create-a-database-and-table}

ログイベントを保存するためのテーブルを定義しましょう：

1. `nginxdb`という新しいデータベースから始めます：
    ```sql
    CREATE DATABASE IF NOT EXISTS nginxdb
    ```

2. まず、ログイベント全体を単一の文字列として挿入します。これは明らかにログデータの分析には適した形式ではありませんが、以下で***マテリアライズドビュー***を使用して、その部分を解決します。
    ```sql
    CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
        message String
    )
    ENGINE = MergeTree()
    ORDER BY tuple()
    ```
    :::note
    現在、主キーの必要はないため、**ORDER BY**は**tuple()**に設定されています。
    :::


## 2. Nginxを設定する {#2--configure-nginx}

Nginxについて多くの時間を費やして説明するつもりはありませんが、全ての詳細を隠すつもりもありません。このステップでは、Nginxのログ設定を行うための十分な詳細を提供します。

1. 次の`access_log`プロパティは、ログを`/var/log/nginx/my_access.log`に**combined**形式で送信します。この値は、`nginx.conf`ファイルの`http`セクションに追加します：
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

2. `nginx.conf`を変更した場合は、Nginxを再起動してください。

3. ウェブサーバのページにアクセスして、アクセスログにいくつかのログイベントを生成します。**combined**形式のログは、次の形式になります：
    ```bash
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

## 3. Vectorを設定する {#3-configure-vector}

Vectorは、ログ、メトリクス、およびトレース（**ソース**と呼ばれます）を収集、変換、およびルーティングし、多くの異なるベンダー（**シンク**と呼ばれます）に送信します。ClickHouseとの互換性も組み込みであります。ソースとシンクは、**vector.toml**という設定ファイルに定義されています。

1. 次の**vector.toml**は、**my_access.log**ファイルの末尾をテールする**file**タイプの**ソース**を定義し、上記で定義した**access_logs**テーブルを**シンク**として定義しています：
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

2. 上記の設定を使用してVectorを起動します。 <a href="https://vector.dev/docs/" target="_blank">Vectorのドキュメントを訪れて</a>、ソースとシンクの定義に関する詳細を確認してください。

3. ClickHouseにアクセスログが挿入されていることを確認します。次のクエリを実行すると、テーブルにアクセスログが表示されるはずです：
    ```sql
    SELECT * FROM nginxdb.access_logs
    ```
    <img src={vector01} class="image" alt="ログを表示" />


## 4. ログを解析する {#4-parse-the-logs}

ClickHouseにログが保存されるのは素晴らしいことですが、各イベントを単一の文字列として保存すると、あまりデータ分析ができません。マテリアライズドビューを使用してログイベントを解析する方法を見てみましょう。

1. **マテリアライズドビュー**（MVの略）は、既存のテーブルに基づく新しいテーブルであり、既存のテーブルに対して挿入が行われると、新しいデータもマテリアライズドビューに追加されます。以下のように、**access_logs**のログイベントの解析された表現を含むMVを定義する方法を見てみましょう：
    ```bash
    192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

    ClickHouseには、文字列を解析するためのさまざまな関数がありますが、まずは**splitByWhitespace** - 空白で文字列を解析し、各トークンを配列として返す関数を見てみましょう。以下のコマンドを実行してみてください：
    ```sql
    SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    返された結果が私たちが望んでいるものに非常に近いことに注意してください！いくつかの文字列には余分な文字がありますが、ユーザーエージェント（ブラウザの詳細）は解析する必要がなかったので、次のステップで解決します：
    ```text
    ["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
    ```

2. **splitByWhitespace**と同様に、**splitByRegexp**関数は、正規表現に基づいて文字列を配列に分割します。次のコマンドを実行すると、二つの文字列が返されます。
    ```sql
    SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    返された二つ目の文字列は、ログから成功裏に解析されたユーザーエージェントです：
    ```text
    ["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
    ```

3. 最終的な**CREATE MATERIALIZED VIEW**コマンドを見る前に、データクリーンアップに使用されるいくつかの他の関数を確認しましょう。例えば、`RequestMethod`は**"GET**ですが、不要なダブルクォーテーションが付いています。以下の**trim**関数を実行すると、ダブルクォーテーションを削除できます：
    ```sql
    SELECT trim(LEADING '"' FROM '"GET')
    ```

4. 時間文字列には先頭に角括弧があり、ClickHouseが日付として解析できない形式です。ただし、区切りをコロン（**:**）からカンマ（**,**）に変更すると、解析がうまく機能します：
    ```sql
    SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
    ```

5. これでマテリアライズドビューを定義する準備が整いました。当社の定義には**POPULATE**が含まれており、これは**access_logs**内の既存の行をすぐに処理し挿入することを意味します。次のSQL文を実行します：
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

6. 実行されたかどうかを確認します。アクセスログがきれいに列に解析されているのがわかります：
    ```sql
    SELECT * FROM nginxdb.access_logs_view
    ```
    <img src={vector02} class="image" alt="ログを表示" />

    :::note
    上のレッスンでは、データを二つのテーブルに保存しましたが、最初の`nginxdb.access_logs`テーブルを**Null**テーブルエンジンとして使用するように変更すれば、解析されたデータは依然として`nginxdb.access_logs_view`テーブルに入りますが、生データはテーブルには保存されません。
    :::


**要約:** Vectorを使用することで、インストールと簡単な構成だけで、NginxサーバからClickHouseのテーブルにログを送信できます。巧妙なマテリアライズドビューを使用することで、分析を容易にするためにこれらのログを列に解析できます。

## 関連コンテンツ {#related-content}

- ブログ: [2023年にClickHouseを使用した可観測性ソリューションの構築 - パート1 - ログ](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- ブログ: [Fluent Bitを使用してNginxログをClickHouseに送信](https://clickhouse.com/blog/nginx-logs-to-clickhouse-fluent-bit)
- ブログ: [Fluent Bitを使用してKubernetesログをClickHouseに送信](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit)
