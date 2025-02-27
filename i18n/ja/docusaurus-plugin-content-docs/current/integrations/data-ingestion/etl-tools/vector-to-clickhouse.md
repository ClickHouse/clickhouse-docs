---
sidebar_label: ベクター
sidebar_position: 220
slug: /integrations/vector
description: Vectorを使用してClickHouseにログファイルをテールする方法
---

# VectorとClickHouseの統合

ログをリアルタイムで分析できることは、プロダクションアプリケーションにとって重要です。ClickHouseがログデータのストレージと分析に優れているかどうか、考えたことはありますか？ そのヒントとして、<a href="https://eng.uber.com/logging/" target="_blank">Uberの体験</a>をチェックしてください。彼らはログインフラをELKからClickHouseに移行しました。

このガイドでは、一般的なデータパイプラインである<a href="https://vector.dev/docs/about/what-is-vector/" target="_blank">Vector</a>を使用して、Nginxのログファイルをテールし、それをClickHouseに送信する方法を示します。以下のステップは、任意のタイプのログファイルにも似ているはずです。ClickHouseが動作していること、そしてVectorがインストールされていることを前提として進めます（まだ開始する必要はありません）。

## 1. データベースとテーブルの作成 {#1-create-a-database-and-table}

ログイベントを格納するテーブルを定義しましょう。

1. 新しいデータベース名`nginxdb`を作成します：
    ```sql
    CREATE DATABASE IF NOT EXISTS nginxdb
    ```

2. 初めに、ログ全体のイベントを一つの文字列として挿入します。明らかにこれはログデータの分析を行うには良い形式ではありませんが、以下の***マテリアライズドビュー***を利用して解決します。
    ```sql
    CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
        message String
    )
    ENGINE = MergeTree()
    ORDER BY tuple()
    ```
    :::note
    現時点では主キーの必要はありませんので、**ORDER BY**は**tuple()**に設定されています。
    :::


## 2. Nginxの設定 {#2--configure-nginx}

Nginxについてあまり時間をかけたくはありませんが、詳細を隠すことも望んでいないので、このステップではNginxロギングの設定に関する十分な情報を提供します。

1. 以下の`access_log`プロパティは、/**var/log/nginx/my_access.log**に**combined**形式でログを送信します。この値は、`nginx.conf`ファイルの`http`セクション内に配置します：
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

2. `nginx.conf`を修正した場合は、必ずNginxを再起動してください。

3. Webサーバーのページを訪問して、アクセスログ内にいくつかのログイベントを生成します。**combined**形式のログは以下の形式を持っています：
    ```bash
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

## 3. Vectorの設定 {#3-configure-vector}

Vectorは、ログ、メトリック、およびトレース（**ソース**と呼ばれる）を収集、変換、および多数の異なるベンダー（**シンク**と呼ばれる）にルーティングします。ClickHouseとの互換性も標準で提供されています。ソースとシンクは、**vector.toml**という設定ファイルで定義されます。

1. 以下の**vector.toml**は、**my_access.log**の末尾をテールする**file**タイプの**source**を定義し、また、上で定義した**access_logs**テーブルを**sink**として定義します：
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

2. 上記の設定を用いてVectorを起動します。<a href="https://vector.dev/docs/" target="_blank">Vectorのドキュメントを訪問</a>して、ソースとシンクを定義する方法の詳細をご覧ください。

3. アクセスログがClickHouseに挿入されていることを確認します。次のクエリを実行すると、テーブル内のアクセスログが表示されます：
    ```sql
    SELECT * FROM nginxdb.access_logs
    ```
    <img src={require('./images/vector_01.png').default} class="image" alt="ログを表示" />


## 4. ログの解析 {#4-parse-the-logs}

ClickHouseにログがあるのは素晴らしいですが、各イベントを単一の文字列として保存することは多くのデータ分析を許可しません。マテリアライズドビューを使ってログイベントを解析する方法を見てみましょう。

1. **マテリアライズドビュー**（略してMV）は、既存のテーブルに基づく新しいテーブルであり、既存のテーブルに挿入が行われると、新しいデータもマテリアライズドビューに追加されます。**access_logs**内のログイベントの解析された表現を含むMVを定義する方法を見てみましょう。以下のようになります：
    ```bash
    192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

    ClickHouseには文字列を解析するためのさまざまな関数がありますが、まずは**splitByWhitespace**を見てみましょう - この関数は、空白に基づいて文字列を解析し、それぞれのトークンを配列で返します。次のコマンドを実行してデモを示します：
    ```sql
    SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    レスポンスはほぼ希望通りの結果になっていることに注目してください！いくつかの文字列には余分な文字が含まれており、ユーザーエージェント（ブラウザの詳細）は解析する必要がありませんが、次のステップで解決します：
    ```text
    ["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
    ```

2. **splitByWhitespace**と同様に、**splitByRegexp**関数を使用すれば、正規表現に基づいて文字列を配列に分割できます。次のコマンドを実行すると、二つの文字列が返されます。
    ```sql
    SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    返された二つ目の文字列が、ログから正常に解析されたユーザーエージェントであることに注目してください：
    ```text
    ["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
    ```

3. 最終的な**CREATE MATERIALIZED VIEW**コマンドを見てみる前に、データをクリーンアップするために使用される関数をいくつか見てみましょう。例えば、`RequestMethod`は**"GET**という形で不要な二重引用符が付いています。次に、以下の**trim**関数を実行して、二重引用符を削除します：
    ```sql
    SELECT trim(LEADING '"' FROM '"GET')
    ```

4. 時間の文字列には先頭の角括弧があり、またClickHouseが日付に解析できる形式ではありません。しかし、区切り文字をコロン（**:**）からカンマ（**,**）に変更すると、解析がうまくいきます：
    ```sql
    SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
    ```

5. これでマテリアライズドビューを定義する準備が整いました。私たちの定義には**POPULATE**が含まれており、これにより**access_logs**内の既存の行がすぐに処理されて挿入されます。以下のSQL文を実行します：
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

6. 正常に動作したか確認します。アクセスログが適切にカラムに解析されているのが見ることができます：
    ```sql
    SELECT * FROM nginxdb.access_logs_view
    ```
    <img src={require('./images/vector_02.png').default} class="image" alt="ログを表示" />

    :::note
    上記のレッスンではデータを二つのテーブルに保存しましたが、初期の`nginxdb.access_logs`テーブルを**Null**テーブルエンジンを使用するように変更すれば、解析されたデータは`nginxdb.access_logs_view`テーブルに残りますが、元のデータはテーブルには保存されません。
    :::


**まとめ：** Vectorを使用することで、シンプルなインストールとクイック設定のみで、NginxサーバーからClickHouseのテーブルへログを送信できるようになりました。巧妙なマテリアライズドビューを使用することで、そのログをカラムに解析して、より簡単に分析できるようにすることができます。

## 関連コンテンツ {#related-content}

- ブログ: [2023年にClickHouseを使った可観測性ソリューションの構築 - パート1 - ログ](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- ブログ: [Fluent Bitを用いたNginxログをClickHouseに送信](https://clickhouse.com/blog/nginx-logs-to-clickhouse-fluent-bit)
- ブログ: [Fluent Bitを用いたKubernetesログをClickHouseに送信](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit)
