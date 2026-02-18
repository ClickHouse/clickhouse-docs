# Docker を使用して ClickHouse をインストールする \{#install-clickhouse-using-docker\}

[Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/) のガイドを、
参考のために以下に再掲します。提供されている Docker イメージは、
ClickHouse 用の公式 deb パッケージを利用しています。

Docker pull コマンド:

```bash
docker pull clickhouse/clickhouse-server
```


## バージョン \{#versions\}

- `latest` タグは、最新の安定ブランチにおける最新リリースを指します。
- `22.2` のようなブランチタグは、対応するブランチの最新リリースを指します。
- `22.2.3` や `22.2.3.5` のようなフルバージョンタグは、対応するリリースを指します。
- `head` タグは、デフォルトブランチの最新コミットからビルドされたものです。
- 各タグには、オプションで末尾に `-alpine` を付けたバリアントがあり、そのイメージが `alpine` ベースでビルドされていることを示します。

### 互換性 \{#compatibility\}

- amd64 イメージには [SSE3 命令](https://en.wikipedia.org/wiki/SSE3) のサポートが必要です。
  事実上、2005 年以降のほぼすべての x86 CPU は SSE3 をサポートしています。
- arm64 イメージには [ARMv8.2-A アーキテクチャ](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A) のサポートと、
  さらに Load-Acquire RCpc レジスタが必要です。このレジスタは ARMv8.2-A ではオプションであり、
  [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A) では必須です。Graviton >=2、Azure、GCP インスタンスでサポートされています。
  非対応デバイスの例としては、Raspberry Pi 4 (ARMv8.0-A) や Jetson AGX Xavier/Orin (ARMv8.2-A) があります。
- ClickHouse 24.11 以降、Ubuntu イメージはベースイメージとして `ubuntu:22.04` を使用し始めました。これは
  [パッチ](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468) を含む docker バージョン >= `20.10.10`
  を必要とします。回避策として、代わりに `docker run --security-opt seccomp=unconfined` を使用できますが、セキュリティ上の影響があります。

## このイメージの使い方 \{#how-to-use-image\}

### サーバーインスタンスの起動 \{#start-server-instance\}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

デフォルトでは、ClickHouse には Docker ネットワーク経由でのみアクセスできます。ネットワーク設定については、以下のセクションを参照してください。

デフォルトでは、上記のサーバーインスタンスは、パスワードなしの `default` ユーザーとして実行されます。


### ネイティブクライアントを使って接続する \{#connect-to-it-from-native-client\}

```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server
# OR
docker exec -it some-clickhouse-server clickhouse-client
```

ClickHouse クライアントの詳細については、[ClickHouse クライアント](/interfaces/cli) を参照してください。


### curl で接続する \{#connect-to-it-using-curl\}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

HTTP インターフェースの詳細については、[ClickHouse HTTP Interface](/interfaces/http) を参照してください。


### コンテナの停止および削除 \{#stopping-removing-container\}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```


### ネットワーキング \{#networking\}

:::note
事前定義されたユーザー `default` は、パスワードが設定されていない限りネットワークにアクセスできません。
下記の「起動時に default データベースとユーザーを作成する方法」と「`default` ユーザーの管理」を参照してください。
:::

Docker コンテナで稼働している ClickHouse を公開するには、コンテナ内部のポートをホスト側のポートに[特定のポートをマッピング](https://docs.docker.com/config/containers/container-networking/)します。

```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

または、`--network=host` を使用してコンテナに[ホストポートを直接利用](https://docs.docker.com/network/host/)させることで
（ネットワークパフォーマンスをさらに向上させることもできます）：

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
上記の例で設定しているデフォルトユーザーは、localhost からのリクエストに対してのみ有効です
:::


### ボリューム \{#volumes\}

データの永続化を確保するために、通常はコンテナ内に次のディレクトリをマウントします。

* `/var/lib/clickhouse/` - ClickHouse がデータを保存するメインディレクトリ
* `/var/log/clickhouse-server/` - ログ

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

次のディレクトリもマウントすることを検討してください:

* `/etc/clickhouse-server/config.d/*.xml` - サーバー設定を調整するためのファイル
* `/etc/clickhouse-server/users.d/*.xml` - ユーザー設定を調整するためのファイル
* `/docker-entrypoint-initdb.d/` - データベース初期化スクリプトを格納したディレクトリ（以下を参照）。


## Linux ケーパビリティ \{#linear-capabilities\}

ClickHouse には高度な機能がいくつかあり、その一部を利用するには複数の [Linux ケーパビリティ](https://man7.org/linux/man-pages/man7/capabilities.7.html) を有効化する必要があります。

これらは必須ではありませんが、次の [Docker のコマンドライン引数](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities) を使用して有効化できます。

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

詳細については [&quot;Docker での CAP&#95;IPC&#95;LOCK と CAP&#95;SYS&#95;NICE ケーパビリティの設定&quot;](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker) を参照してください。


## 設定 \{#configuration\}

コンテナは、[HTTP インターフェイス](https://clickhouse.com/docs/interfaces/http_interface/) 用にポート 8123 を、[ネイティブクライアント](https://clickhouse.com/docs/interfaces/tcp/) 用にポート 9000 を公開します。

ClickHouse の設定は「config.xml」ファイルによって定義されます（[ドキュメント](https://clickhouse.com/docs/operations/configuration_files/)）。

### カスタム構成でサーバーインスタンスを起動する \{#start-server-instance-with-custom-config\}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```


### カスタムユーザーでサーバーを起動する \{#start-server-custom-user\}

```bash
# $PWD/data/clickhouse should exist and be owned by current user
docker run --rm --user "${UID}:${GID}" --name some-clickhouse-server --ulimit nofile=262144:262144 -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

ローカルディレクトリをマウントしてイメージを使用する場合、適切なファイル所有権を維持するためにユーザーを指定しておくことをお勧めします。`--user` 引数を使用し、コンテナ内に `/var/lib/clickhouse` と `/var/log/clickhouse-server` をマウントしてください。これを行わないと、イメージがエラーとなり起動しません。


### ルートからサーバーを起動する \{#start-server-from-root\}

ユーザーネームスペースが有効になっている場合、root ユーザーとしてサーバーを起動するのが便利です。
そのためには、次を実行します:

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```


### 起動時に default データベースとユーザーを作成する方法 \{#how-to-create-default-db-and-user\}

コンテナの起動時に、ユーザー（既定では `default` という名前のユーザーが使用されます）とデータベースを作成したい場合があります。これは、環境変数 `CLICKHOUSE_DB`、`CLICKHOUSE_USER`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`、`CLICKHOUSE_PASSWORD` を設定することで行えます。

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```


#### `default` ユーザーの管理 \{#managing-default-user\}

`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` のいずれも設定されていない場合、`default` ユーザーへのネットワーク経由でのアクセスはデフォルトで無効化されています。

環境変数 `CLICKHOUSE_SKIP_USER_SETUP` を 1 に設定することで、`default` ユーザーをセキュアではない形で利用可能にする方法もあります。

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```


## このイメージを拡張する方法 \{#how-to-extend-image\}

このイメージを基にした派生イメージで追加の初期化処理を行うには、`/docker-entrypoint-initdb.d` 配下に 1 つ以上の `*.sql`、`*.sql.gz`、または `*.sh` スクリプトを追加します。entrypoint が `initdb` を呼び出した後、そのディレクトリ内で見つかった `*.sql` ファイルをすべて実行し、実行可能な `*.sh` スクリプトをすべて実行し、実行不可の `*.sh` スクリプトはすべて source コマンドで読み込んで、サービスを起動する前にさらに初期化を行います。

:::note
`/docker-entrypoint-initdb.d` 配下のスクリプトは、ファイル名の **アルファベット順** に実行されます。スクリプト同士に依存関係がある場合（たとえば、`VIEW` を作成するスクリプトは、参照されるテーブルを作成するスクリプトの後に実行する必要があるなど）、ファイル名が正しい順序でソートされるようにしてください。
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
