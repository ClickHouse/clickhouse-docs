# ClickHouse CLI を使用した ClickHouse のインストール \{#install-clickhouse-using-the-clickhouse-cli\}

ClickHouse CLI (`clickhousectl`) を使用すると、ローカルの ClickHouse バージョンのインストールや管理、サーバーの起動、クエリの実行を行えます。

<VerticalStepper>
  ## ClickHouse CLI をインストールする \{#install-the-cli\}

  ```bash
  curl https://clickhouse.com/cli | sh
  ```

  利便性のため、`chctl` エイリアスも自動的に作成されます。

  ## ClickHouse をインストールする \{#cli-install-clickhouse\}

  ClickHouse の最新の安定版をインストールします。

  ```bash
  clickhousectl local install stable
  ```

  特定のバージョンをインストールすることもできます。

  ```bash
  clickhousectl local install lts             # 最新の LTS リリース
  clickhousectl local install 25.6            # 最新の 25.6.x.x
  clickhousectl local install 25.6.1.1        # 完全一致のバージョン
  ```

  ## clickhouse-server を起動する \{#cli-start-clickhouse-server\}

  ```bash
  clickhousectl local server start
  ```

  サーバーはバックグラウンドで実行されます。起動していることを確認するには、次を実行します。

  ```bash
  clickhousectl local server list
  ```

  ## clickhouse-client を起動する \{#cli-start-clickhouse-client\}

  ```bash
  clickhousectl local client
  ```

  次のような表示になります。

  ```response
  ClickHouse client version 24.5.1.117 (official build).
  Connecting to localhost:9000 as user default.
  Connected to ClickHouse server version 24.5.1.

  local-host :)
  ```

  これで、ClickHouse に SQL コマンドを送信する準備が整いました。

  :::tip
  [Quick Start](/get-started/quick-start) では、テーブルの作成やデータの挿入手順を順を追って説明しています。
  :::
</VerticalStepper>