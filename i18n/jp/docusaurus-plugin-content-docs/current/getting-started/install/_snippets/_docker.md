# Docker を使用して ClickHouse をインストールする \\{#install-clickhouse-using-docker\\}

[Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/) のガイドを、
便宜上、以下に再掲します。提供されている Docker イメージは、
公式の ClickHouse deb パッケージを使用しています。

Docker pull コマンド:

```bash
docker pull clickhouse/clickhouse-server
```


## バージョン \\{#versions\\}

- `latest` タグは、最新の安定ブランチの最新リリースを指します。
- `22.2` のようなブランチタグは、対応するブランチの最新リリースを指します。
- `22.2.3` や `22.2.3.5` のようなフルバージョンタグは、対応するリリースを指します。
- `head` タグは、デフォルトブランチへの最新コミットからビルドされます。
- 各タグにはオプションで `-alpine` の接尾辞が付き、`alpine` をベースにビルドされていることを表します。

### 互換性 \\{#compatibility\\}

- amd64 イメージには [SSE3 命令](https://en.wikipedia.org/wiki/SSE3) のサポートが必要です。
  事実上、2005 年以降のほぼすべての x86 CPU は SSE3 をサポートしています。
- arm64 イメージには [ARMv8.2-A アーキテクチャ](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A) のサポートに加えて、
  Load-Acquire RCpc レジスタのサポートが必要です。このレジスタは ARMv8.2-A ではオプションですが、
  [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A) では必須です。Graviton >=2、Azure、GCP の各インスタンスでサポートされています。
  サポートされていないデバイスの例としては、Raspberry Pi 4 (ARMv8.0-A) や Jetson AGX Xavier/Orin (ARMv8.2-A) があります。
- ClickHouse 24.11 以降、Ubuntu イメージはベースイメージとして `ubuntu:22.04` を使用するようになりました。これは、
  [パッチ](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468) を含む Docker バージョン `20.10.10` 以上を必要とします。
  回避策としては、代わりに `docker run --security-opt seccomp=unconfined` を使用することもできますが、セキュリティ上のリスクがあります。

## このイメージの使い方 \\{#how-to-use-image\\}

### サーバーインスタンスを起動する \\{#start-server-instance\\}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

デフォルトでは、ClickHouse には Docker ネットワーク経由でのみアクセスできます。以下のネットワーク関連のセクションを参照してください。

デフォルトでは、上記のサーバーインスタンスは、パスワードなしの `default` ユーザーとして実行されます。


### ネイティブクライアントを使って接続する \\{#connect-to-it-from-native-client\\}

```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server
# OR
docker exec -it some-clickhouse-server clickhouse-client
```

ClickHouse クライアントの詳細については、[ClickHouse client](/interfaces/cli) を参照してください。


### curl で接続する \\{#connect-to-it-using-curl\\}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

HTTP インターフェイスの詳細については、[ClickHouse HTTP Interface](/interfaces/http) を参照してください。


### コンテナの停止と削除 \\{#stopping-removing-container\\}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```


### ネットワーキング \\{#networking\\}

:::note
あらかじめ定義されているユーザー `default` は、パスワードが設定されていない限りネットワークにアクセスできません。
下記の「起動時に default データベースとユーザーを作成する方法」および「`default` ユーザーの管理」を参照してください。
:::

Docker コンテナ上で動作している ClickHouse を外部に公開するには、ホスト側ポートを使用してコンテナ内の特定ポートを[マッピング](https://docs.docker.com/config/containers/container-networking/)します：

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

あるいはコンテナに `--network=host` を指定して [ホストポートを直接使用](https://docs.docker.com/network/host/) させる方法もあります
（ネットワークパフォーマンスをより高めることも可能です）:

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
上記の例の `default` ユーザーは、localhost からのリクエストに対してのみ利用可能です。
:::


### ボリューム \\{#volumes\\}

永続化を行うために、通常はコンテナ内に次のフォルダをマウントします:

* `/var/lib/clickhouse/` - ClickHouse がデータを保存するメインフォルダ
* `/var/log/clickhouse-server/` - ログ

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

次のパスもマウントすることを検討してください:

* `/etc/clickhouse-server/config.d/*.xml` - サーバー設定の調整用ファイル
* `/etc/clickhouse-server/users.d/*.xml` - ユーザー設定の調整用ファイル
* `/docker-entrypoint-initdb.d/` - データベース初期化スクリプトを配置するフォルダー（後述）。


## Linux capabilities \\{#linear-capabilities\\}

ClickHouse には、複数の [Linux capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html) の有効化を必要とする高度な機能があります。

これらは必須ではなく、次の [Docker コマンドライン引数](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities) を使用して有効化できます。

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

詳細は [&quot;Docker における CAP&#95;IPC&#95;LOCK および CAP&#95;SYS&#95;NICE ケーパビリティの設定&quot;](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker) を参照してください。


## 設定 \\{#configuration\\}

コンテナは [HTTP インターフェイス](https://clickhouse.com/docs/interfaces/http_interface/) 用にポート 8123 を、[ネイティブクライアント](https://clickhouse.com/docs/interfaces/tcp/) 用にポート 9000 を公開します。

ClickHouse の設定はファイル &quot;config.xml&quot;（[ドキュメント](https://clickhouse.com/docs/operations/configuration_files/)）で定義されます。

### カスタム設定でサーバーインスタンスを起動する \\{#start-server-instance-with-custom-config\\}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```


### 任意のユーザーでサーバーを起動する \\{#start-server-custom-user\\}

```bash
# $PWD/data/clickhouse should exist and be owned by current user
docker run --rm --user "${UID}:${GID}" --name some-clickhouse-server --ulimit nofile=262144:262144 -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

ローカルディレクトリをマウントしてこのイメージを使用する場合、適切なファイル所有権を維持するためにユーザーを指定する必要があります。`--user` 引数を使用し、コンテナ内に `/var/lib/clickhouse` と `/var/log/clickhouse-server` をマウントしてください。そうしないと、コンテナイメージがエラーとなり起動しません。


### root でサーバーを起動する \\{#start-server-from-root\\}

ユーザーネームスペースが有効になっている場合、root でサーバーを起動することが有効です。
その場合は、次を実行します。

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```


### 起動時にデフォルトのデータベースとユーザーを作成する方法 \\{#how-to-create-default-db-and-user\\}

コンテナの起動時にユーザー（デフォルトでは `default` という名前のユーザーが使用されます）とデータベースを作成したい場合には、環境変数 `CLICKHOUSE_DB`、`CLICKHOUSE_USER`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`、`CLICKHOUSE_PASSWORD` を使用して設定できます。

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```


#### `default` ユーザーの管理 \\{#managing-default-user\\}

`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` のいずれも設定されていない場合、`default` ユーザーはデフォルトではネットワークアクセスが無効化されています。

環境変数 `CLICKHOUSE_SKIP_USER_SETUP` を 1 に設定することで、`default` ユーザーを安全でない状態で利用可能にする方法があります。

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```


## このイメージを拡張する方法 \\{#how-to-extend-image\\}

このイメージを元にした派生イメージで追加の初期化処理を行うには、`/docker-entrypoint-initdb.d` 配下に `*.sql`、`*.sql.gz`、または `*.sh` スクリプトを 1 つ以上追加します。エントリポイントが `initdb` を呼び出した後、そのディレクトリ内にあるすべての `*.sql` ファイルを実行し、実行可能な `*.sh` スクリプトを実行し、実行可能でない `*.sh` スクリプトは読み込んで（source して）、サービスを起動する前にさらに初期化処理を行います。

:::note
`/docker-entrypoint-initdb.d` 配下のスクリプトは、ファイル名の**アルファベット順**で実行されます。スクリプト間に依存関係がある場合（たとえば、あるスクリプトで作成したテーブルを参照するビューを別のスクリプトで作成する必要がある場合など）、ファイル名が正しい順序になるように付けてください。
:::

また、初期化中に clickhouse-client で使用される環境変数 `CLICKHOUSE_USER` と `CLICKHOUSE_PASSWORD` を指定することもできます。

たとえば、別のユーザーとデータベースを追加するには、次の内容を `/docker-entrypoint-initdb.d/init-db.sh` に追加します。

```bash
#!/bin/bash
set -e

clickhouse client -n <<-EOSQL
    CREATE DATABASE docker;
    CREATE TABLE docker.docker (x Int32) ENGINE = Log;
EOSQL
```
