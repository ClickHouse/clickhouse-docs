---
{}
---




# ClickHouseをDockerでインストールする

便利のために、[Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/)のガイドを以下に再現します。利用可能なDockerイメージは、公式のClickHouse debパッケージを使用しています。

Docker pullコマンド：

```bash
docker pull clickhouse/clickhouse-server
```

## バージョン {#versions}

- `latest`タグは、最新の安定ブランチの最新リリースを指します。
- `22.2`のようなブランチタグは、対応するブランチの最新リリースを指します。
- `22.2.3`や`22.2.3.5`のようなフルバージョンタブは、対応するリリースを指します。
- `head`タグは、デフォルトブランチに対する最新のコミットから構築されています。
- 各タグには、`-alpine`というオプションのサフィックスがあり、これは`alpine`の上に構築されていることを示します。

### 互換性 {#compatibility}

- amd64イメージは、[SSE3命令](https://en.wikipedia.org/wiki/SSE3)のサポートを必要とします。2005年以降のほぼすべてのx86 CPUはSSE3をサポートしています。
- arm64イメージは、[ARMv8.2-Aアーキテクチャ](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A)のサポートを必要とし、さらにLoad-Acquire RCpcレジスタを必要とします。このレジスタはARMv8.2-Aバージョンではオプションであり、[ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A)では必須です。Graviton >=2、Azure、およびGCPインスタンスでサポートされています。サポートされていないデバイスの例には、Raspberry Pi 4 (ARMv8.0-A)やJetson AGX Xavier/Orin (ARMv8.2-A)があります。
- ClickHouse 24.11以降、Ubuntuイメージは`ubuntu:22.04`をベースイメージとして使用し始めました。これは、[パッチ](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468)を含むdockerバージョン>= `20.10.10`を必要とします。回避策として、`docker run --security-opt seccomp=unconfined`を使用できますが、セキュリティ上の影響があります。

## このイメージの使い方 {#how-to-use-image}

### サーバーインスタンスの起動 {#start-server-instance}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

デフォルトでは、ClickHouseはDockerネットワーク経由でのみアクセス可能です。以下のネットワーキングセクションを参照してください。

デフォルトでは、上記のサーバーインスタンスは、パスワードなしで`default`ユーザーとして実行されます。

### ネイティブクライアントからの接続 {#connect-to-it-from-native-client}

```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server

# または
docker exec -it some-clickhouse-server clickhouse-client
```

ClickHouseクライアントに関する詳細情報は、[ClickHouseクライアント](/interfaces/cli)を参照してください。

### curlを使用して接続 {#connect-to-it-using-curl}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

HTTPインターフェイスに関する詳細情報は、[ClickHouse HTTPインターフェイス](/interfaces/http)を参照してください。

### コンテナの停止 / 削除 {#stopping-removing-container}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```

### ネットワーキング {#networking}

:::note
あらかじめ定義されたユーザー`default`は、パスワードが設定されていない限りネットワークアクセスを持ちません。
以下の「デフォルトデータベースとユーザーの作成方法」および「`default`ユーザーの管理」を参照してください。
:::

Dockerで実行しているClickHouseを公開するには、ホストポートを使用してコンテナ内部の特定のポートを[マッピング](https://docs.docker.com/config/containers/container-networking/)します。

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

または、コンテナが[ホストポートを直接使用する](https://docs.docker.com/network/host/)ことを許可し、`--network=host`を使用します（これによりネットワークパフォーマンスが向上します）：

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
上記の例のデフォルトユーザーは、ローカルホストのリクエストのみに使用可能です。
:::

### ボリューム {#volumes}

通常、永続性を達成するために、以下のフォルダーをコンテナ内にマウントすることをお勧めします：

- `/var/lib/clickhouse/` - ClickHouseがデータを格納するメインフォルダー
- `/var/log/clickhouse-server/` - ログ

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

また、次のものをマウントすることを考慮するかもしれません：

- `/etc/clickhouse-server/config.d/*.xml` - サーバー設定の調整ファイル
- `/etc/clickhouse-server/users.d/*.xml` - ユーザー設定の調整ファイル
- `/docker-entrypoint-initdb.d/` - データベース初期化スクリプトのフォルダー（下記参照）。

## Linuxの機能 {#linear-capabilities}

ClickHouseには、いくつかの[Linux機能](https://man7.org/linux/man-pages/man7/capabilities.7.html)を有効にする必要がある高度な機能があります。

これらはオプションであり、次の[dockerコマンドライン引数](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities)を使用して有効にできます：

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

詳細については、["DockerでのCAP_IPC_LOCKおよびCAP_SYS_NICE機能の設定"](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)を参照してください。

## 設定 {#configuration}

コンテナは、[HTTPインターフェイス](https://clickhouse.com/docs/interfaces/http_interface/)用にポート8123を、[ネイティブクライアント](https://clickhouse.com/docs/interfaces/tcp/)用にポート9000を公開しています。

ClickHouseの設定は、"config.xml"というファイルで表されます（[ドキュメンテーション](https://clickhouse.com/docs/operations/configuration_files/)）。

### カスタム設定でサーバーインスタンスを起動する {#start-server-instance-with-custom-config}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```

### カスタムユーザーとしてサーバーを起動する {#start-server-custom-user}

```bash

# $PWD/data/clickhouseが存在し、現在のユーザーが所有している必要があります
docker run --rm --user "${UID}:${GID}" --name some-clickhouse-server --ulimit nofile=262144:262144 -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

ローカルディレクトリをマウントしたイメージを使用する場合、適切なファイル所有権を維持するためにユーザーを指定する必要があるでしょう。`--user`引数を使用して、コンテナ内で`/var/lib/clickhouse`と`/var/log/clickhouse-server`をマウントします。さもなければ、イメージがエラーを出して起動しません。

### rootからサーバーを起動する {#start-server-from-root}

ルートからサーバーを起動することは、ユーザー名前空間が有効な場合に便利です。
そのために次のように実行します：

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

### スタート時にデフォルトデータベースとユーザーを作成する方法 {#how-to-create-default-db-and-user}

コンテナの起動時に、ユーザー（デフォルトでは`default`という名前のユーザー）がデータベースを作成したい場合があります。環境変数`CLICKHOUSE_DB`、`CLICKHOUSE_USER`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`、および`CLICKHOUSE_PASSWORD`を使用して行うことができます：

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```

#### `default`ユーザーの管理 {#managing-default-user}

ユーザー`default`は、`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、または`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`が設定されていない場合、デフォルトでネットワークアクセスが無効になっています。

環境変数`CLICKHOUSE_SKIP_USER_SETUP`を1に設定することで、`default`ユーザーを安全でなく利用可能にする方法もあります：

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```

## このイメージを拡張する方法 {#how-to-extend-image}

このイメージから派生したイメージで追加の初期化を行うには、`/docker-entrypoint-initdb.d`の下に1つ以上の`*.sql`、`*.sql.gz`、または`*.sh`スクリプトを追加します。エントリポイントが`initdb`を呼び出すと、そのディレクトリにある`*.sql`ファイルが実行され、実行可能な`*.sh`スクリプトが実行され、非実行可能な`*.sh`スクリプトがソースされて、サービスが開始される前に更なる初期化が行われます。  
また、初期化中にclickhouse-clientに使用される環境変数`CLICKHOUSE_USER`と`CLICKHOUSE_PASSWORD`を提供できます。

例えば、別のユーザーとデータベースを追加するには、`/docker-entrypoint-initdb.d/init-db.sh`に以下を追加します：

```bash
#!/bin/bash
set -e

clickhouse client -n <<-EOSQL
    CREATE DATABASE docker;
    CREATE TABLE docker.docker (x Int32) ENGINE = Log;
EOSQL
```
