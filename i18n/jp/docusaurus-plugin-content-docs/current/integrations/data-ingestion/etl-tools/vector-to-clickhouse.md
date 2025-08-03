---
sidebar_label: 'Vector'
sidebar_position: 220
slug: '/integrations/vector'
description: 'How to tail a log file into ClickHouse using Vector'
title: 'Integrating Vector with ClickHouse'
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Integrating Vector with ClickHouse

<CommunityMaintainedBadge/>

リアルタイムでログを分析できることは、プロダクションアプリケーションにとって重要です。ClickHouseがログデータの保存と分析に適しているかどうか考えたことがありますか？<a href="https://eng.uber.com/logging/" target="_blank">Uberの体験</a>をチェックして、彼らがログインフラをELKからClickHouseに変換した方法を確認してください。

このガイドでは、人気のデータパイプライン<a href="https://vector.dev/docs/about/what-is-vector/" target="_blank">Vector</a>を使用して、Nginxのログファイルを監視し、ClickHouseに送信する方法を示します。以下の手順は、任意のタイプのログファイルを監視する場合でも似ています。すでにClickHouseが稼働しており、Vectorがインストールされていると仮定します（ただし、まだ起動する必要はありません）。

## 1. データベースとテーブルを作成する {#1-create-a-database-and-table}

ログイベントを保存するためのテーブルを定義しましょう：

1. `nginxdb`という名前の新しいデータベースから始めます：
    ```sql
    CREATE DATABASE IF NOT EXISTS nginxdb
    ```

2. まず、ログイベント全体を1つの文字列として挿入します。明らかに、これはログデータの分析にはあまり良いフォーマットではありませんが、***materialized views***を使用してその部分を解決します。
    ```sql
    CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
        message String
    )
    ENGINE = MergeTree()
    ORDER BY tuple()
    ```
    :::note
    主キーはまだ必要ないため、**ORDER BY**は**tuple()**に設定されています。
    :::


## 2. Nginxを設定する {#2--configure-nginx}

Nginxについてあまり多くの時間を費やしたくありませんが、すべての詳細を隠したくもありません。このステップでは、Nginxのログ設定を行うのに十分な情報を提供します。

1. 次の`access_log`プロパティは、ログを**combined**フォーマットで`/var/log/nginx/my_access.log`に送信します。この値は`nginx.conf`ファイルの`http`セクションに入ります：
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

2. `nginx.conf`を変更する必要がある場合は、Nginxを再起動してください。

3. ウェブサーバー上のページにアクセスして、アクセスログにいくつかのログイベントを生成します。**combined**フォーマットのログは次の形式を持ちます：
    ```bash
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

## 3. Vectorを設定する {#3-configure-vector}

Vectorは、ログ、メトリック、トレース（**sources**と呼ばれる）を収集、変換、ルーティングし、ClickHouseとの標準的な互換性を持つ多くの異なるベンダー（**sinks**と呼ばれる）に送信します。ソースとシンクは、**vector.toml**という名前の設定ファイルで定義されます。

1. 次の**vector.toml**は、**my_access.log**の末尾を監視する**file**タイプの**source**を定義し、上記で定義した**access_logs**テーブルを**sink**として定義します：
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

2. 上記の設定を使用してVectorを起動します。ソースとシンクを定義するための詳細については<a href="https://vector.dev/docs/" target="_blank">Vectorドキュメントを訪問してください</a>。

3. アクセスログがClickHouseに挿入されていることを確認します。次のクエリを実行すると、テーブル内にアクセスログが表示されるはずです：
    ```sql
    SELECT * FROM nginxdb.access_logs
    ```
    <Image img={vector01} size="lg" border alt="View ClickHouse logs in table format" />


## 4. ログを解析する {#4-parse-the-logs}

ClickHouseにログが保存されているのは素晴らしいことですが、各イベントを単一の文字列として保存すると、データ分析はあまり行えません。ここでは、マテリアライズドビューを使用してログイベントを解析する方法を見ていきます。

1. **materialized view**（MV）は、既存のテーブルに基づいて新しいテーブルであり、既存のテーブルに挿入が行われると、新しいデータもマテリアライズドビューに追加されます。**access_logs**内のログイベントの解析された表現を含むMVを定義する方法を見てみましょう：
    ```bash
    192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

    ClickHouseには、文字列を解析するためのさまざまな関数がありますが、まずは**splitByWhitespace**を見てみましょう - これは、文字列を空白で解析し、それぞれのトークンを配列として返します。これを実演するために、次のコマンドを実行します：
    ```sql
    SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    返された結果は、私たちが欲しい形に非常に近いことに気づくでしょう！いくつかの文字列には余分な文字が含まれ、ユーザーエージェント（ブラウザの詳細）は解析する必要がありませんが、それについては次のステップで解決します：
    ```text
    ["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
    ```

2. **splitByWhitespace**と同様に、**splitByRegexp**関数は、正規表現に基づいて文字列を配列に分割します。次のコマンドを実行すると、2つの文字列が返されます。
    ```sql
    SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    返された2つ目の文字列は、ログからユーザーエージェントが正常に解析されたことを示します：
    ```text
    ["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
    ```

3. 最後の**CREATE MATERIALIZED VIEW**コマンドを見る前に、データをクリーンアップするために使用されるいくつかの関数を見てみましょう。例えば、`RequestMethod`は**"GET**という不要な二重引用符が含まれています。次の**trim**関数を実行して二重引用符を取り除きます：
    ```sql
    SELECT trim(LEADING '"' FROM '"GET')
    ```

4. 時間文字列には先頭に角括弧があり、ClickHouseが日付に解析できる形式になっていません。しかし、セパレーターをコロン（**:**）からコンマ（**,**）に変更すれば、解析がうまくいきます：
    ```sql
    SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
    ```

5. これでマテリアライズドビューを定義する準備が整いました。定義には**POPULATE**が含まれており、これは**access_logs**の既存の行がすぐに処理されて挿入されることを意味します。次のSQL文を実行します：
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

6. 正しく機能したか確認します。アクセスログが列に正しく解析されていることを確認してください：
    ```sql
    SELECT * FROM nginxdb.access_logs_view
    ```
    <Image img={vector02} size="lg" border alt="View parsed ClickHouse logs in table format" />

    :::note
    上記のレッスンではデータを2つのテーブルに保存しましたが、最初の`nginxdb.access_logs`テーブルを**Null**テーブルエンジンを使用するように変更しても、解析されたデータは`nginxdb.access_logs_view`テーブルに届きますが、生データはテーブルに保存されません。
    :::


**まとめ：** 簡単なインストールと迅速な設定だけで使用できるVectorを使用することで、NginxサーバーからClickHouseのテーブルにログを送信できます。巧妙なマテリアライズドビューを用いることで、それらのログを列に解析し、より簡単に分析できるようになります。

## 関連コンテンツ {#related-content}

- ブログ: [2023年にClickHouseで可観測性ソリューションを構築する - パート1 - ログ](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- ブログ: [Fluent Bitを使用してNginxログをClickHouseに送信する](https://clickhouse.com/blog/nginx-logs-to-clickhouse-fluent-bit)
- ブログ: [Fluent Bitを使用してKubernetesログをClickHouseに送信する](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit)
