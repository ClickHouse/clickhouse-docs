# WSL を使って Windows に ClickHouse をインストールする



## 要件 {#requirements}

:::note
WindowsにClickHouseをインストールするには、WSL（Windows Subsystem for Linux）が必要です。
:::

<VerticalStepper>


## WSLのインストール {#install-wsl}

Windows PowerShellを管理者として開き、次のコマンドを実行します:

```bash
wsl --install
```

新しいUNIXユーザー名とパスワードの入力が求められます。任意のユーザー名とパスワードを入力すると、次のようなメッセージが表示されます:

```bash
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 5.15.133.1-microsoft-WSL2 x86_64)
```


## curlを使用したスクリプトによるClickHouseのインストール {#install-clickhouse-via-script-using-curl}

curlを使用したスクリプトでClickHouseをインストールするには、以下のコマンドを実行します：

```bash
curl https://clickhouse.com/ | sh
```

スクリプトが正常に実行されると、以下のメッセージが表示されます：

```bash
Successfully downloaded the ClickHouse binary, you can run it as:
  ./clickhouse
```


## clickhouse-localの起動 {#start-clickhouse-local}

`clickhouse-local`を使用すると、設定不要でClickHouseの強力なSQL構文を使ってローカルファイルやリモートファイルを処理できます。テーブルデータは一時的な場所に保存されるため、`clickhouse-local`を再起動すると、以前に作成したテーブルは利用できなくなります。

[clickhouse-local](/operations/utilities/clickhouse-local)を起動するには、次のコマンドを実行します:

```bash
./clickhouse
```


## clickhouse-serverの起動 {#start-clickhouse-server}

データを永続化したい場合は、`clickhouse-server`を実行します。ClickHouseサーバーは以下のコマンドで起動できます:

```bash
./clickhouse server
```


## clickhouse-clientの起動 {#start-clickhouse-client}

サーバーが起動して実行されている状態で、新しいターミナルウィンドウを開き、以下のコマンドを実行して`clickhouse-client`を起動します：

```bash
./clickhouse client
```

次のような出力が表示されます：

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

テーブルデータはカレントディレクトリに保存され、ClickHouseサーバーの再起動後も引き続き利用可能です。必要に応じて、`./clickhouse server`に追加のコマンドライン引数として`-C config.xml`を指定し、設定ファイルで追加の設定を行うことができます。利用可能なすべての設定項目は[こちら](/operations/server-configuration-parameters/settings)および[設定ファイルテンプレートの例](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に記載されています。

これでClickHouseにSQLコマンドを送信する準備が整いました！

</VerticalStepper>
