# Docker を使用して ClickHouse をインストールする

[Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/) のガイドを、
利便性のために以下に掲載します。提供されている Docker イメージは、
公式の ClickHouse deb パッケージを使用しています。

Docker pull コマンド:

```bash
docker pull clickhouse/clickhouse-server
```


## バージョン {#versions}

- `latest`タグは、最新の安定ブランチの最新リリースを指します。
- `22.2`のようなブランチタグは、対応するブランチの最新リリースを指します。
- `22.2.3`や`22.2.3.5`のような完全バージョンタグは、対応するリリースを指します。
- `head`タグは、デフォルトブランチの最新コミットからビルドされます。
- 各タグには、`alpine`上にビルドされていることを示すオプションの`-alpine`サフィックスがあります。

### 互換性 {#compatibility}

- amd64イメージは[SSE3命令](https://en.wikipedia.org/wiki/SSE3)のサポートが必要です。
  2005年以降のほぼすべてのx86 CPUはSSE3をサポートしています。
- arm64イメージは[ARMv8.2-Aアーキテクチャ](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A)のサポートと、
  さらにLoad-Acquire RCpcレジスタが必要です。このレジスタはARMv8.2-Aではオプションですが、
  [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A)では必須です。Graviton >=2、AzureおよびGCPインスタンスでサポートされています。
  サポートされていないデバイスの例として、Raspberry Pi 4（ARMv8.0-A）やJetson AGX Xavier/Orin（ARMv8.2-A）があります。
- ClickHouse 24.11以降、Ubuntuイメージはベースイメージとして`ubuntu:22.04`を使用するようになりました。これには[パッチ](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468)を含むDockerバージョン >= `20.10.10`が必要です。回避策として`docker run --security-opt seccomp=unconfined`を使用することもできますが、これにはセキュリティ上の影響があります。


## このイメージの使用方法 {#how-to-use-image}

### サーバーインスタンスの起動 {#start-server-instance}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

デフォルトでは、ClickHouseはDockerネットワーク経由でのみアクセス可能です。ネットワーク設定については、以下のセクションを参照してください。

デフォルトでは、上記のサーバーインスタンスはパスワードなしの`default`ユーザーで実行されます。

### ネイティブクライアントから接続する {#connect-to-it-from-native-client}


```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server
# OR
docker exec -it some-clickhouse-server clickhouse-client
```

ClickHouseクライアントの詳細については、[ClickHouseクライアント](/interfaces/cli)を参照してください。

### curlを使用した接続 {#connect-to-it-using-curl}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

HTTPインターフェースの詳細については、[ClickHouse HTTPインターフェース](/interfaces/http)を参照してください。

### コンテナの停止と削除 {#stopping-removing-container}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```

### ネットワーク設定 {#networking}

:::note
事前定義されたユーザー`default`は、パスワードが設定されていない限りネットワークアクセスができません。
以下の「起動時にデフォルトデータベースとユーザーを作成する方法」および「`default`ユーザーの管理」を参照してください。
:::

Docker内で実行されているClickHouseを公開するには、コンテナ内部のポートをホストポートに[マッピング](https://docs.docker.com/config/containers/container-networking/)します:

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

または、`--network=host`を使用してコンテナが[ホストポートを直接使用](https://docs.docker.com/network/host/)できるようにします
(これによりネットワークパフォーマンスの向上も実現できます):

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
上記の例のユーザーdefaultは、localhostからのリクエストに対してのみ利用可能です。
:::

### ボリューム {#volumes}

通常、永続性を実現するために、コンテナ内に以下のフォルダをマウントすることが推奨されます:

- `/var/lib/clickhouse/` - ClickHouseがデータを保存するメインフォルダ
- `/var/log/clickhouse-server/` - ログ

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

以下もマウントすることを検討してください:

- `/etc/clickhouse-server/config.d/*.xml` - サーバー設定の調整ファイル
- `/etc/clickhouse-server/users.d/*.xml` - ユーザー設定の調整ファイル
- `/docker-entrypoint-initdb.d/` - データベース初期化スクリプトのフォルダ(以下を参照)


## Linux ケーパビリティ {#linear-capabilities}

ClickHouse には、複数の [Linux ケーパビリティ](https://man7.org/linux/man-pages/man7/capabilities.7.html)を有効にする必要がある高度な機能があります。

これらはオプションであり、以下の [docker コマンドライン引数](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities)を使用して有効にできます:

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

詳細については、["Docker での CAP_IPC_LOCK および CAP_SYS_NICE ケーパビリティの設定"](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker)を参照してください。


## 設定 {#configuration}

コンテナは、[HTTPインターフェース](https://clickhouse.com/docs/interfaces/http_interface/)用にポート8123を、[ネイティブクライアント](https://clickhouse.com/docs/interfaces/tcp/)用にポート9000を公開します。

ClickHouseの設定は「config.xml」ファイルで定義されます([ドキュメント](https://clickhouse.com/docs/operations/configuration_files/))

### カスタム設定でサーバーインスタンスを起動する {#start-server-instance-with-custom-config}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```

### カスタムユーザーとしてサーバーを起動する {#start-server-custom-user}


```bash
# $PWD/data/clickhouse は存在し、現在のユーザーが所有している必要があります
docker run --rm --user "${UID}:${GID}" --name some-clickhouse-server --ulimit nofile=262144:262144 -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

ローカルディレクトリをマウントしてイメージを使用する場合、適切なファイル所有権を維持するためにユーザーを指定することをお勧めします。`--user` 引数を使用し、コンテナ内に `/var/lib/clickhouse` と `/var/log/clickhouse-server` をマウントしてください。これを行わない場合、イメージがエラーを出力して起動しません。

### rootからサーバーを起動する {#start-server-from-root}

ユーザー名前空間が有効になっている場合、rootからサーバーを起動すると便利です。
これを行うには、次のコマンドを実行します:

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

### 起動時にデフォルトのデータベースとユーザーを作成する方法 {#how-to-create-default-db-and-user}

コンテナの起動時にユーザー(デフォルトでは `default` という名前のユーザーが使用されます)とデータベースを作成したい場合があります。これは環境変数 `CLICKHOUSE_DB`、`CLICKHOUSE_USER`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`、`CLICKHOUSE_PASSWORD` を使用して実行できます:

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```

#### `default` ユーザーの管理 {#managing-default-user}

`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` のいずれも設定されていない場合、ユーザー `default` はデフォルトでネットワークアクセスが無効になっています。

環境変数 `CLICKHOUSE_SKIP_USER_SETUP` を 1 に設定することで、`default` ユーザーを安全でない状態で利用可能にすることができます:

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```


## このイメージを拡張する方法 {#how-to-extend-image}

このイメージから派生したイメージで追加の初期化を実行するには、`/docker-entrypoint-initdb.d`配下に1つ以上の`*.sql`、`*.sql.gz`、または`*.sh`スクリプトを追加します。エントリーポイントが`initdb`を呼び出した後、サービスを開始する前に、そのディレクトリ内で見つかったすべての`*.sql`ファイルを実行し、実行可能なすべての`*.sh`スクリプトを実行し、実行不可能なすべての`*.sh`スクリプトをソースとして読み込んで、さらなる初期化を行います。  
また、初期化中にclickhouse-clientで使用される環境変数`CLICKHOUSE_USER`と`CLICKHOUSE_PASSWORD`を指定することもできます。

例えば、別のユーザーとデータベースを追加するには、`/docker-entrypoint-initdb.d/init-db.sh`に以下を追加します:

```bash
#!/bin/bash
set -e

clickhouse client -n <<-EOSQL
    CREATE DATABASE docker;
    CREATE TABLE docker.docker (x Int32) ENGINE = Log;
EOSQL
```
