



# ClickHouseをDockerでインストールする

以下に便利なように[Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/)のガイドを再現しました。利用可能なDockerイメージは、公式のClickHouse debパッケージを利用しています。

Dockerプルコマンド：

```bash
docker pull clickhouse/clickhouse-server
```

## バージョン {#versions}

- `latest`タグは、最新の安定ブランチの最新リリースを指します。
- `22.2`のようなブランチタグは、対応するブランチの最新リリースを指します。
- `22.2.3`や`22.2.3.5`のようなフルバージョンタグは、対応するリリースを指します。
- `head`タグは、デフォルトブランチの最新コミットからビルドされています。
- 各タグには、`-alpine`のオプションサフィックスが付いており、`alpine`の上に構築されていることを示しています。

### 互換性 {#compatibility}

- amd64イメージは、[SSE3命令](https://en.wikipedia.org/wiki/SSE3)のサポートが必要です。2005年以降のほぼすべてのx86 CPUはSSE3をサポートしています。
- arm64イメージは、[ARMv8.2-Aアーキテクチャ](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A)のサポートが必要であり、さらにLoad-Acquire RCpcレジスタも必要です。このレジスタはARMv8.2-Aバージョンではオプションであり、[ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A)では必須です。Graviton >=2、AzureおよびGCPインスタンスでサポートされています。サポートされていないデバイスの例には、Raspberry Pi 4 (ARMv8.0-A)やJetson AGX Xavier/Orin (ARMv8.2-A)があります。
- ClickHouse 24.11以降、Ubuntuイメージは`ubuntu:22.04`をベースイメージとして使用するようになりました。これは、[パッチ](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468)を含むdockerバージョン>= `20.10.10`を必要とします。ワークアラウンドとして、`docker run --security-opt seccomp=unconfined`を代わりに使用することができますが、これはセキュリティに影響を与える可能性があります。

## このイメージの使用方法 {#how-to-use-image}

### サーバーインスタンスを起動する {#start-server-instance}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

デフォルトでは、ClickHouseはDockerネットワークを介してのみアクセス可能です。ネットワーキングセクションを参照してください。

デフォルトで、上記のサーバーインスタンスはパスワードなしで`default`ユーザーとして実行されます。

### ネイティブクライアントから接続する {#connect-to-it-from-native-client}

```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server

# OR
docker exec -it some-clickhouse-server clickhouse-client
```

ClickHouseクライアントの詳細については[ClickHouse client](/interfaces/cli)を参照してください。

### curlを使用して接続する {#connect-to-it-using-curl}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

HTTPインターフェイスの詳細については[ClickHouse HTTP Interface](/interfaces/http)を参照してください。

### コンテナの停止/削除 {#stopping-removing-container}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```

### ネットワーキング {#networking}

:::note
事前定義されたユーザー`default`は、パスワードが設定されていない場合、ネットワークアクセスを持っていません。
「起動時にデフォルトデータベースとユーザーを作成する方法」と「defaultユーザーの管理」を参照してください。
:::

Dockerで実行されているClickHouseを、ホストポートを使用して[特定のポートをマッピングすることによって](https://docs.docker.com/config/containers/container-networking/)公開できます：

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

または、`--network=host`を使用してコンテナが[ホストポートを直接使用できるようにすることによって](https://docs.docker.com/network/host/)（これにより、より良いネットワークパフォーマンスも得られます）：

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
上記の例のユーザー`default`は、localhostからのリクエストにのみ利用可能です。
:::

### ボリューム {#volumes}

通常、持続性を確保するためにコンテナ内に以下のフォルダーをマウントしたい場合があります：

- `/var/lib/clickhouse/` - ClickHouseがデータを保存する主要フォルダー
- `/var/log/clickhouse-server/` - ログ

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

また、以下をマウントしたい場合があります：

- `/etc/clickhouse-server/config.d/*.xml` - サーバー設定調整のファイル
- `/etc/clickhouse-server/users.d/*.xml` - ユーザー設定調整のファイル
- `/docker-entrypoint-initdb.d/` - データベース初期化スクリプトが格納されたフォルダー（下記参照）。

## Linuxの機能 {#linear-capabilities}

ClickHouseにはいくつかの高度な機能があり、いくつかの[Linux機能](https://man7.org/linux/man-pages/man7/capabilities.7.html)を有効にする必要があります。

これらはオプションであり、次の[dockerコマンドライン引数](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities)を使用して有効にできます：

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

詳しくは、["DockerでのCAP_IPC_LOCKおよびCAP_SYS_NICE機能の設定"](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)を参照してください。

## 設定 {#configuration}

コンテナは、[HTTPインターフェイス](https://clickhouse.com/docs/interfaces/http_interface/)用のポート8123と、[ネイティブクライアント](https://clickhouse.com/docs/interfaces/tcp/)用のポート9000を公開します。

ClickHouseの設定は、"config.xml"というファイルで表現されています（[ドキュメント](https://clickhouse.com/docs/operations/configuration_files/)）。

### カスタム設定でサーバーインスタンスを起動する {#start-server-instance-with-custom-config}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```

### カスタムユーザーとしてサーバーを起動する {#start-server-custom-user}

ローカルディレクトリをマウントしたイメージを使用する場合、適切なファイル所有権を維持するためにユーザーを指定することをお勧めします。`--user`引数を使用し、コンテナ内に`/var/lib/clickhouse`および`/var/log/clickhouse-server`をマウントします。そうしないと、イメージは不満を言い、起動しません。

### ルートからサーバーを起動する {#start-server-from-root}

ルートからサーバーを起動することは、ユーザー名前空間が有効な場合に便利です。
そのためには、次のように実行します：

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

### 起動時にデフォルトのデータベースとユーザーを作成する方法 {#how-to-create-default-db-and-user}

時々、コンテナの起動時にユーザー（デフォルトでは`default`というユーザーが使用されます）とデータベースを作成したい場合があります。これを環境変数`CLICKHOUSE_DB`、`CLICKHOUSE_USER`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`、`CLICKHOUSE_PASSWORD`を使用して行うことができます：

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```

#### defaultユーザーの管理 {#managing-default-user}

ユーザー`default`は、`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、または`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`が設定されていない場合、デフォルトでネットワークアクセスが無効になっています。

環境変数`CLICKHOUSE_SKIP_USER_SETUP`を1に設定することで、`default`ユーザーを不安定に利用可能にする方法があります：

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```

## このイメージを拡張する方法 {#how-to-extend-image}

このイメージから派生したイメージで追加の初期化を実行するには、`/docker-entrypoint-initdb.d`に1つ以上の`*.sql`、`*.sql.gz`、または`*.sh`スクリプトを追加します。エントリポイントが`initdb`を呼び出した後、任意の`*.sql`ファイルを実行し、任意の実行可能な`*.sh`スクリプトを実行し、そのディレクトリに見つかった実行不可能な`*.sh`スクリプトをソースして、サービスの起動前にさらに初期化を行います。  
また、初期化中にclickhouse-clientで使用される環境変数`CLICKHOUSE_USER`および`CLICKHOUSE_PASSWORD`を提供できます。

例えば、別のユーザーとデータベースを追加する場合、`/docker-entrypoint-initdb.d/init-db.sh`に以下を追加します：
