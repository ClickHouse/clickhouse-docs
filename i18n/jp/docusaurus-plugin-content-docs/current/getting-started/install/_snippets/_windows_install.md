# WindowsにWSLを使ってClickHouseをインストールする

## 要件 {#requirements}

:::note
WindowsにClickHouseをインストールするには、WSL (Windows Subsystem for Linux) が必要です。
:::

<VerticalStepper>

## WSLをインストールする {#install-wsl}

管理者としてWindows PowerShellを開き、次のコマンドを実行します:

```bash
wsl --install
```

新しいUNIXのユーザー名とパスワードを入力するように求められます。希望するユーザー名とパスワードを入力した後、次のようなメッセージが表示されます:

```bash
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 5.15.133.1-microsoft-WSL2 x86_64)
```

## curlを使用してスクリプト経由でClickHouseをインストールする {#install-clickhouse-via-script-using-curl}

次のコマンドを実行して、curlを使用してスクリプト経由でClickHouseをインストールします:

```bash
curl https://clickhouse.com/ | sh
```

スクリプトが正常に実行されると、次のメッセージが表示されます:

```bash
Successfully downloaded the ClickHouse binary, you can run it as:
  ./clickhouse
```

## clickhouse-localを起動する {#start-clickhouse-local}

`clickhouse-local`は、ClickHouseの強力なSQL構文を使用して、ローカルおよびリモートファイルを処理することを可能にし、設定の必要がありません。テーブルデータは一時的な場所に保存されるため、`clickhouse-local`を再起動すると、以前に作成したテーブルは利用できなくなります。

次のコマンドを実行して [clickhouse-local](/operations/utilities/clickhouse-local) を起動します:

```bash
./clickhouse
```

## clickhouse-serverを起動する {#start-clickhouse-server}

データを永続的に保存したい場合は、`clickhouse-server`を実行する必要があります。次のコマンドを使用してClickHouseサーバーを起動できます:

```bash
./clickhouse server
```

## clickhouse-clientを起動する {#start-clickhouse-client}

サーバーが起動したら、新しいターミナルウィンドウを開き、次のコマンドを実行して`clickhouse-client`を起動します:

```bash
./clickhouse client
```

次のような内容が表示されます:

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

テーブルデータは現在のディレクトリに保存され、ClickHouseサーバーを再起動した後でも利用可能です。必要に応じて、`-C config.xml`を追加のコマンドライン引数として`./clickhouse server`に渡し、設定ファイルで詳細な設定を提供できます。利用可能な設定はすべて [here](/operations/server-configuration-parameters/settings) と
[example configuration file template](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml) にドキュメント化されています。

これでClickHouseにSQLコマンドを送信する準備が整いました！

</VerticalStepper>
