---
sidebar_label: 'ベクター'
sidebar_position: 220
slug: /integrations/vector
description: 'Vectorを使用してClickHouseにログファイルを流す方法'
title: 'ClickHouseとのベクター統合'
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# ClickHouseとのベクター統合

<CommunityMaintainedBadge/>

リアルタイムでログを分析できることは、プロダクションアプリケーションにとって重要です。ClickHouseがログデータの保存と分析に優れているか疑問に思ったことはありませんか？ <a href="https://eng.uber.com/logging/" target="_blank">Uberの経験</a>をチェックして、ELKからClickHouseへのログインフラストラクチャの移行を見てみましょう。

このガイドでは、人気のデータパイプライン<a href="https://vector.dev/docs/about/what-is-vector/" target="_blank">Vector</a>を使用して、Nginxのログファイルを追尾し、それをClickHouseに送信する方法を示します。以下のステップは、任意のタイプのログファイルを追尾する場合でも似ています。すでにClickHouseが稼働しており、Vectorがインストールされていると仮定します (まだ起動する必要はありません)。

## 1. データベースとテーブルを作成する {#1-create-a-database-and-table}

ログイベントを保存するためのテーブルを定義しましょう：

1. 新しいデータベース`nginxdb`から始めます：
    ```sql
    CREATE DATABASE IF NOT EXISTS nginxdb
    ```

2. 初めに、ログイベント全体を1つの文字列として挿入します。これはログデータの分析には最適な形式ではありませんが、後で***マテリアライズドビュー***を使用してその部分を解決するつもりです。
    ```sql
    CREATE TABLE IF NOT EXISTS nginxdb.access_logs (
        message String
    )
    ENGINE = MergeTree()
    ORDER BY tuple()
    ```
    :::note
    現時点で主キーは必要ないので、**ORDER BY**は**tuple()**に設定されています。
    :::


## 2. Nginxを構成する {#2--configure-nginx}

Nginxについてあまり多くの時間をかけたくないですが、すべての詳細を隠したくもないので、このステップではNginxログを構成するのに十分な詳細を提供します。

1. 以下の`access_log`プロパティは、ログを**combined**フォーマットで`/var/log/nginx/my_access.log`に送信します。この値は、`nginx.conf`ファイルの`http`セクションに入れます：
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

3. ウェブサーバーのページにアクセスして、アクセスログにいくつかのログイベントを生成します。**combined**フォーマットのログは、以下の形式を持っています：
    ```bash
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

## 3. Vectorを構成する {#3-configure-vector}

Vectorは、ログ、メトリクス、トレース（**ソース**として言及）を収集、変換、ルーティングし、さまざまなベンダー（**シンク**として言及）に送信します。ClickHouseとのアウト・オブ・ザ・ボックスの互換性があります。ソースとシンクは、**vector.toml**という設定ファイルで定義されます。

1. 次の**vector.toml**は、**my_access.log**の最後を追尾する**file**タイプの**source**を定義し、上記で定義された**access_logs**テーブルを**sink**として定義します：
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

2. 上記の設定を使用してVectorを起動します。詳細なソースとシンクの定義については<a href="https://vector.dev/docs/" target="_blank">Vectorのドキュメント</a>をご覧ください。

3. アクセスログがClickHouseに挿入されているか確認します。次のクエリを実行すると、テーブルにアクセスログが表示されるはずです：
    ```sql
    SELECT * FROM nginxdb.access_logs
    ```
    <Image img={vector01} size="lg" border alt="テーブル形式でClickHouseのログを表示" />


## 4. ログを解析する {#4-parse-the-logs}

ClickHouseにログが保管されているのは素晴らしいですが、各イベントを単一の文字列として保存することは多くのデータ分析を行うには不十分です。マテリアライズドビューを使用してログイベントを解析する方法を見てみましょう。

1. **マテリアライズドビュー**（略してMV）は、既存のテーブルに基づいた新しいテーブルであり、既存のテーブルに挿入が行われると、新しいデータもマテリアライズドビューに追加されます。ログイベントを**access_logs**で解析した表現を含むMVを定義する方法を見てみましょう。言い換えれば：
    ```bash
    192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

    ClickHouseには文字列を解析するためのさまざまな関数がありますが、まずは**splitByWhitespace**に注目しましょう - これは空白で文字列を解析し、各トークンを配列に返します。実演するために、次のコマンドを実行します：
    ```sql
    SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    応答は私たちが求めるものにかなり近いことに注意してください！いくつかの文字列には余分な文字が含まれており、ユーザーエージェント（ブラウザの詳細）は解析する必要がありませんでしたが、それは次のステップで解決します：
    ```text
    ["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
    ```

2. **splitByWhitespace**と似ている**splitByRegexp**関数は、正規表現に基づいて文字列を配列に分割します。次のコマンドを実行すると、2つの文字列が返されます。
    ```sql
    SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    返された2番目の文字列が、ログから正常に解析されたユーザーエージェントであることに注意してください：
    ```text
    ["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
    ```

3. 最終的な**CREATE MATERIALIZED VIEW**コマンドを確認する前に、データをクリーンアップするために使用される他のいくつかの関数を見てみましょう。例えば、`RequestMethod`は**"GET**の前に不要なダブルクオートがあります。このダブルクオートを削除する**trim**関数を実行します：
    ```sql
    SELECT trim(LEADING '"' FROM '"GET')
    ```

4. 時間の文字列には先頭に角括弧があり、ClickHouseが日付として解析できるフォーマットではありません。しかし、区切り文字をコロン（**:**）からコンマ（**,**）に変更すると、解析がうまくいくことが分かります：
    ```sql
    SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
    ```

5. マテリアライズドビューを定義する準備が整いました。定義には**POPULATE**が含まれており、これは**access_logs**の既存行がすぐに処理されて挿入されることを意味します。次のSQL文を実行します：
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

6. 正常に機能したか確認します。アクセスログがカラムに分かりやすく解析された形で表示されるはずです：
    ```sql
    SELECT * FROM nginxdb.access_logs_view
    ```
    <Image img={vector02} size="lg" border alt="テーブル形式で解析されたClickHouseのログを表示" />

    :::note
    上記のレッスンは、データを2つのテーブルに保存しましたが、最初の`nginxdb.access_logs`テーブルを**Null**テーブルエンジンを使用するように変更することができます。解析されたデータはまだ`nginxdb.access_logs_view`テーブルに入りますが、生データはテーブルに保存されません。
    :::


**まとめ:** 簡単なインストールと迅速な構成だけで、Vectorを使用してNginxサーバーからClickHouseのテーブルにログを送信できます。また、巧妙なマテリアライズドビューを使用することで、これらのログをカラムに解析して分析を容易にします。

## 関連コンテンツ {#related-content}

- ブログ: [2023年のClickHouseによる可観測性ソリューションの構築 - パート1 - ログ](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- ブログ: [Fluent Bitを使用してNginxのログをClickHouseに送信する](https://clickhouse.com/blog/nginx-logs-to-clickhouse-fluent-bit)
- ブログ: [Fluent Bitを使用してKubernetesのログをClickHouseに送信する](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit)
