


# WindowsにWSLを使ってClickHouseをインストールする

## 要件 {#requirements}

:::note
WindowsにClickHouseをインストールするには、WSL (Windows Subsystem for Linux) が必要です。
:::

<VerticalStepper>

## WSLをインストールする {#install-wsl}

管理者としてWindows PowerShellを開き、次のコマンドを実行します：

```bash
wsl --install
```

新しいUNIXのユーザー名とパスワードを入力するよう促されます。希望のユーザー名とパスワードを入力すると、次のようなメッセージが表示されるはずです：

```bash
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 5.15.133.1-microsoft-WSL2 x86_64)
```

## curlを使用したスクリプト経由でClickHouseをインストールする {#install-clickhouse-via-script-using-curl}

次のコマンドを実行して、curlを使用してスクリプト経由でClickHouseをインストールします：

```bash
curl https://clickhouse.com/ | sh
```

スクリプトが正常に実行されると、次のメッセージが表示されます：

```bash
Successfully downloaded the ClickHouse binary, you can run it as:
  ./clickhouse
```

## clickhouse-localを起動する {#start-clickhouse-local}

`clickhouse-local`を使用すると、ClickHouseの強力なSQL構文を利用してローカルおよびリモートファイルを処理できます。設定をする必要はありません。テーブルデータは一時的な場所に保存されるため、`clickhouse-local`を再起動した後は以前に作成したテーブルは利用できなくなります。

次のコマンドを実行して[clickhouse-local](/operations/utilities/clickhouse-local)を起動します：

```bash
./clickhouse
```

## clickhouse-serverを起動する {#start-clickhouse-server}

データを永続化したい場合は、`clickhouse-server`を実行する必要があります。次のコマンドを使用してClickHouseサーバーを起動できます：

```bash
./clickhouse server
```

## clickhouse-clientを起動する {#start-clickhouse-client}

サーバーが起動した状態で、新しいターミナルウィンドウを開き、次のコマンドを実行して`clickhouse-client`を起動します：

```bash
./clickhouse client
```

次のようなものが表示されます：

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

テーブルデータは現在のディレクトリに保存され、ClickHouseサーバーの再起動後も利用可能です。必要に応じて、`./clickhouse server`にオプションのコマンドライン引数として`-C config.xml`を渡し、設定ファイルにさらなる設定を提供できます。利用可能なすべての設定は[こちら](/operations/server-configuration-parameters/settings)と[サンプル設定ファイルテンプレート](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に文書化されています。

これで、ClickHouseにSQLコマンドを送信する準備が整いました！

</VerticalStepper>
