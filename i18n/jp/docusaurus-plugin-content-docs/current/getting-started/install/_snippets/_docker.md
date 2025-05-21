# Dockerを使用してClickHouseをインストールする

[Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/)のガイドを便利のために以下に再現します。利用可能なDockerイメージは公式のClickHouse debパッケージを使用しています。

Docker pullコマンド：

```bash
docker pull clickhouse/clickhouse-server
```

## バージョン {#versions}

- `latest` タグは、最新の安定したブランチの最新リリースを指します。
- `22.2` のようなブランチタグは、対応するブランチの最新リリースを指します。
- `22.2.3` や `22.2.3.5` のようなフルバージョンタグは、対応するリリースを指します。
- `head` タグは、デフォルトブランチの最新のコミットから構築されます。
- 各タグには、`-alpine` サフィックスを追加して `alpine` の上に構築されていることを示すオプションがあります。

### 互換性 {#compatibility}

- amd64イメージは、[SSE3命令](https://en.wikipedia.org/wiki/SSE3)のサポートを必要とします。2005年以降のほぼすべてのx86 CPUはSSE3をサポートしています。
- arm64イメージは、[ARMv8.2-Aアーキテクチャ](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A)のサポートを必要とし、さらにLoad-Acquire RCpcレジスタを必要とします。このレジスタはARMv8.2-Aバージョンではオプションですが、[ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A)では必須です。Graviton >=2、AzureおよびGCPインスタンスでサポートされています。サポートされていないデバイスの例としては、Raspberry Pi 4 (ARMv8.0-A)やJetson AGX Xavier/Orin (ARMv8.2-A)があります。
- ClickHouse 24.11以降、Ubuntuイメージは `ubuntu:22.04` をベースイメージとして使用するようになりました。dockerバージョン >= `20.10.10`が必要で、[パッチ](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468)が含まれています。回避策として、`docker run --security-opt seccomp=unconfined`を使用することもできますが、これはセキュリティ上の影響があります。

## このイメージの使用方法 {#how-to-use-image}

### サーバーインスタンスの起動 {#start-server-instance}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

デフォルトでは、ClickHouseはDockerネットワークを介してのみアクセス可能です。以下のネットワーキングセクションを参照してください。

上記のサーバーインスタンスは、パスワードなしで `default` ユーザーとして実行されることがデフォルトです。

### ネイティブクライアントからの接続 {#connect-to-it-from-native-client}

```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server

# または
docker exec -it some-clickhouse-server clickhouse-client
```

ClickHouseクライアントに関する詳細は[ClickHouseクライアント](/interfaces/cli)を参照してください。

### curlを使用した接続 {#connect-to-it-using-curl}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

HTTPインターフェースに関する詳細は[ClickHouse HTTPインターフェース](/interfaces/http)を参照してください。

### コンテナの停止 / 削除 {#stopping-removing-container}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```

### ネットワーキング {#networking}

:::note
事前定義されたユーザー `default` は、パスワードが設定されていない限りネットワークアクセスができません。
以下の「デフォルトデータベースとユーザーの作成方法」と「`default` ユーザーの管理」を参照してください。
:::

Dockerで実行しているClickHouseを、ホストのポートを使用して[特定のポートをマッピング](https://docs.docker.com/config/containers/container-networking/)することで公開できます：

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

また、`--network=host`を使用してコンテナが[ホストのポートを直接使用できるように](https://docs.docker.com/network/host/)することもできます（これにより、ネットワークパフォーマンスが向上します）：

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
上記の例のデフォルトユーザーはローカルホストのリクエストでのみ使用可能です。
:::

### ボリューム {#volumes}

通常、持続性を得るためにコンテナ内部に以下のフォルダーをマウントしたい場合があります。

- `/var/lib/clickhouse/` - ClickHouseがデータを格納する主要なフォルダー
- `/var/log/clickhouse-server/` - ログ

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

以下もマウントしたい場合があります：

- `/etc/clickhouse-server/config.d/*.xml` - サーバー設定調整用のファイル
- `/etc/clickhouse-server/users.d/*.xml` - ユーザー設定調整用のファイル
- `/docker-entrypoint-initdb.d/` - データベース初期化スクリプト用のフォルダー（以下参照）。

## Linux機能 {#linear-capabilities}

ClickHouseには、いくつかの[Linux機能](https://man7.org/linux/man-pages/man7/capabilities.7.html)を有効にする必要がある高度な機能があります。

これらはオプションであり、以下の[dockerコマンドライン引数](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities)を使用して有効にできます：

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

詳細については、["DockerでのCAP_IPC_LOCKおよびCAP_SYS_NICE機能の設定"](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)を参照してください。

## 設定 {#configuration}

コンテナは、[HTTPインターフェース](https://clickhouse.com/docs/interfaces/http_interface/)用のポート8123と、[ネイティブクライアント](https://clickhouse.com/docs/interfaces/tcp/)用のポート9000を公開します。

ClickHouseの設定は「config.xml」というファイルで表されます（[ドキュメント](https://clickhouse.com/docs/operations/configuration_files/)）。

### カスタム設定でサーバーインスタンスを起動する {#start-server-instance-with-custom-config}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```

### カスタムユーザーとしてサーバーを起動する {#start-server-custom-user}

```bash

# $PWD/data/clickhouse が存在し、現在のユーザーが所有している必要があります
docker run --rm --user "${UID}:${GID}" --name some-clickhouse-server --ulimit nofile=262144:262144 -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

ローカルディレクトリをマウントしたイメージを使用する場合、適切なファイル所有権を維持するためにユーザーを指定することをお勧めします。`--user`引数を使用し、`/var/lib/clickhouse`および`/var/log/clickhouse-server`をコンテナ内にマウントします。そうしないと、イメージがエラーを出して起動しません。

### rootからサーバーを起動する {#start-server-from-root}

ユーザー名前空間が有効になっている場合、rootからサーバーを起動することは便利です。これを行うには、次のように実行します。

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

### デフォルトのデータベースとユーザーを開始時に作成する方法 {#how-to-create-default-db-and-user}

時折、コンテナ起動時にユーザー（デフォルトで利用されるユーザー名は`default`）とデータベースを作成したい場合があります。これを環境変数 `CLICKHOUSE_DB`、`CLICKHOUSE_USER`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`、`CLICKHOUSE_PASSWORD`を使用して行うことができます：

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```

#### `default` ユーザーの管理 {#managing-default-user}

ユーザー `default` は、`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` のいずれも設定されていない場合、デフォルトでネットワークアクセスが無効になります。

環境変数 `CLICKHOUSE_SKIP_USER_SETUP` を1に設定することで、`default` ユーザーを不安全に利用可能にする方法があります：

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```

## このイメージを拡張する方法 {#how-to-extend-image}

このイメージから派生したイメージで追加の初期化を実行するには、`/docker-entrypoint-initdb.d`の下に1つ以上の `*.sql`、`*.sql.gz`、または `*.sh` スクリプトを追加します。エントリーポイントが `initdb` を呼び出すと、すべての `*.sql` ファイルが実行され、実行可能な `*.sh` スクリプトが実行され、非実行可能な `*.sh` スクリプトがソースされて、サービスを開始する前にさらに初期化が行われます。  
また、初期化中にclickhouse-clientで使用される環境変数 `CLICKHOUSE_USER` と `CLICKHOUSE_PASSWORD`を提供することもできます。

たとえば、別のユーザーとデータベースを追加するには、次の内容を `/docker-entrypoint-initdb.d/init-db.sh` に追加します：

```bash
#!/bin/bash
set -e

clickhouse client -n <<-EOSQL
    CREATE DATABASE docker;
    CREATE TABLE docker.docker (x Int32) ENGINE = Log;
EOSQL
```
