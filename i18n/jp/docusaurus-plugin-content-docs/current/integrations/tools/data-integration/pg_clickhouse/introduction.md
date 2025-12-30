---
sidebar_label: 'イントロダクション'
description: 'SQL を書き換えることなく、PostgreSQL から直接 ClickHouse に対して分析クエリを実行できます'
slug: '/integrations/pg_clickhouse'
title: 'pg_clickhouse リファレンスドキュメント'
doc_type: 'landing-page'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'foreign data wrapper', 'pg_clickhouse', '拡張機能']
---

# pg_clickhouse {#pg_clickhouse}

## はじめに {#introduction}

[pg_clickhouse] はオープンソースの PostgreSQL 拡張機能であり、SQL を書き換えることなく、
PostgreSQL から直接 ClickHouse 上で分析クエリを実行できます。PostgreSQL 13 以降および
ClickHouse v23 以降をサポートしています。

[ClickPipes](/integrations/clickpipes) が ClickHouse へのデータ同期を開始したら、
pg_clickhouse を使って PostgreSQL スキーマに対して [import foreign tables] を素早く簡単に
実行できます。あとは既存の PostgreSQL クエリをそれらのテーブルに対して実行するだけで、
実行を ClickHouse 側へ委譲しつつ、既存のコードベースをそのまま維持できます。

## はじめに {#getting-started}

pg&#95;clickhouse を試す最も簡単な方法は [Docker image] を使うことです。
このイメージは、標準的な PostgreSQL の Docker イメージに pg&#95;clickhouse 拡張機能を追加したものです。

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres -c 'CREATE EXTENSION pg_clickhouse'
```

ClickHouse テーブルのインポートやクエリのプッシュダウンを始めるには、[tutorial] を参照してください。


## テストケース: TPC-H {#test-case-tpc-h}

この表は、スケーリングファクター 1 でロードした通常の PostgreSQL テーブルと、ClickHouse に接続した pg_clickhouse の間で、[TPC-H] クエリ実行性能を比較したものです。✅ はクエリ全体がプッシュダウンされたことを示し、ダッシュは 1 分時点でクエリをキャンセルしたことを示します。すべてのテストはメモリ 36 GB 搭載の MacBook Pro M4 Max 上で実行しました。

| クエリ      | プッシュダウン | pg_clickhouse | PostgreSQL |
| ---------: | :------: | ------------: | ---------: |
|  [Query 1] |     ✅    |         73ms  |     4478ms |
|  [Query 2] |          |             - |      560ms |
|  [Query 3] |     ✅    |          74ms |     1454ms |
|  [Query 4] |     ✅    |          67ms |      650ms |
|  [Query 5] |     ✅    |         104ms |      452ms |
|  [Query 6] |     ✅    |          42ms |      740ms |
|  [Query 7] |     ✅    |          83ms |      633ms |
|  [Query 8] |     ✅    |         114ms |      320ms |
|  [Query 9] |     ✅    |         136ms |     3028ms |
| [Query 10] |     ✅    |          10ms |        6ms |
| [Query 11] |     ✅    |          78ms |      213ms |
| [Query 12] |     ✅    |          37ms |     1101ms |
| [Query 13] |          |        1242ms |      967ms |
| [Query 14] |     ✅    |          51ms |      193ms |
| [Query 15] |          |         522ms |     1095ms |
| [Query 16] |          |        1797ms |      492ms |
| [Query 17] |          |           9ms |     1802ms |
| [Query 18] |          |          10ms |     6185ms |
| [Query 19] |          |         532ms |       64ms |
| [Query 20] |          |        4595ms |      473ms |
| [Query 21] |          |        1702ms |     1334ms |
| [Query 22] |          |         268ms |      257ms |

### ソースからビルドする {#compile-from-source}

#### 一般的な Unix {#general-unix}

PostgreSQL と curl の開発用パッケージにはパス内に `pg_config` と
`curl-config` が含まれているため、そのまま `make`（または
`gmake`）を実行し、続けて `make install` を実行し、最後にデータベース上で `CREATE EXTENSION http` を実行すれば十分です。

#### Debian / Ubuntu / APT {#debian--ubuntu--apt}

PostgreSQL Apt リポジトリからパッケージを取得する方法の詳細については、[PostgreSQL Apt] を参照してください。

```sh
sudo apt install \
  postgresql-server-18 \
  libcurl4-openssl-dev \
  uuid-dev \
  libssl-dev \
  make \
  cmake \
  g++
```


#### RedHat / CentOS / Yum {#redhat--centos--yum}

```sh
sudo yum install \
  postgresql-server \
  libcurl-devel \
  libuuid-devel \
  openssl-libs \
  automake \
  cmake \
  gcc
```

PostgreSQL Yum リポジトリから取得する方法の詳細については、[PostgreSQL Yum] を参照してください。


#### PGXN からインストール {#install-from-pgxn}

上記の依存関係を満たしたら、[PGXN client]（[Homebrew]、[Apt]、および `pgxnclient` という名前の Yum パッケージとして利用可能）を使用して `pg_clickhouse` をダウンロード、コンパイル、インストールします。

```sh
pgxn install pg_clickhouse
```


#### コンパイルとインストール {#compile-and-install}

ClickHouse ライブラリと `pg_clickhouse` をビルドしてインストールするには、次のコマンドを実行します。

```sh
make
sudo make install
```

{/* XXX DSO は現在無効化されています。
  デフォルトでは、`make` は `clickhouse-cpp` ライブラリを動的リンクします（動的な `clickhouse-cpp` ライブラリがまだサポートされていない macOS を除く）。ClickHouse ライブラリを `pg_clickhouse` に静的リンクするには、
  `CH_BUILD=static` を指定します:

  ```sh
  make CH_BUILD=static
  sudo make install CH_BUILD=static
  ```
  */ }

ホストに複数の PostgreSQL がインストールされている場合は、適切なバージョンの `pg_config` を明示的に指定する必要があります。

```sh
export PG_CONFIG=/usr/lib/postgresql/18/bin/pg_config
make
sudo make install
```

ホスト上で `curl-config` が PATH に含まれていない場合は、そのパスを明示的に指定できます：

```sh
export CURL_CONFIG=/opt/homebrew/opt/curl/bin/curl-config
make
sudo make install
```

次のようなエラーが発生した場合は、

```text
"Makefile", line 8: Need an operator
```

GNU make を使用する必要があります。システムによっては、
`gmake`
としてインストールされている場合があります。

```sh
gmake
gmake install
gmake installcheck
```

次のようなエラーが発生した場合:

```text
make: pg_config: Command not found
```

`pg_config` がインストールされており、パスが通っていることを確認してください。RPM などのパッケージ管理システムを使って PostgreSQL をインストールした場合は、`-devel` パッケージもインストールされていることを確認してください。必要であれば、ビルドプロセスに対して `pg_config` の場所を指定してください。

```sh
export PG_CONFIG=/path/to/pg_config
make
sudo make install
```

PostgreSQL 18 以降でカスタムのインストールプレフィックスに拡張機能をインストールするには、
`install` に `prefix` 引数だけを渡します（他の `make` ターゲットは指定しません）。

```sh
sudo make install prefix=/usr/local/extras
```

次に、以下の [`postgresql.conf` のパラメータ] にそのプレフィックスが含まれていることを確認してください。

```ini
extension_control_path = '/usr/local/extras/postgresql/share:$system'
dynamic_library_path   = '/usr/local/extras/postgresql/lib:$libdir'
```


#### テスト {#testing}

拡張機能をインストールしたら、次のコマンドでテストスイートを実行します。

```sh
make installcheck
```

次のようなエラーが発生した場合:

```text
ERROR:  must be owner of database regression
```

テストスイートは、デフォルトのスーパーユーザーである「postgres」などのスーパーユーザーを使用して実行する必要があります。

```sh
make installcheck PGUSER=postgres
```


### ロード {#loading}

`pg_clickhouse` がインストールされたら、スーパーユーザー権限で接続し、次のコマンドを実行してデータベースに追加します。

```sql
CREATE EXTENSION pg_clickhouse;
```

`pg_clickhouse` と、その関連するすべてのオブジェクトを特定のスキーマにインストールしたい場合は、次のように `SCHEMA` 句を使ってスキーマを指定します。

```sql
CREATE SCHEMA env;
CREATE EXTENSION pg_clickhouse SCHEMA env;
```


## 依存関係 {#dependencies}

`pg_clickhouse` 拡張には、[PostgreSQL] 13 以上、[libcurl]、[libuuid] が必要です。この拡張をビルドするには、C および C++ コンパイラ、[libSSL]、[GNU make]、[CMake] が必要です。

## ロードマップ {#road-map}

現在の最優先事項は、DML 機能を追加する前に、分析ワークロード向けのプッシュダウン対応を完了することです。今後のロードマップは次のとおりです。

*   まだプッシュダウンされていない残り 10 個の TPC-H クエリについて、最適な実行計画となるようにする
*   ClickBench クエリに対するプッシュダウンをテストし、修正する
*   すべての PostgreSQL 集約関数の透過的なプッシュダウンをサポートする
*   すべての PostgreSQL 関数の透過的なプッシュダウンをサポートする
*   CREATE SERVER と GUC を通じて、サーバーレベルおよびセッションレベルの ClickHouse 設定を行えるようにする
*   すべての ClickHouse データ型をサポートする
*   論理削除（lightweight DELETE）および UPDATE をサポートする
*   COPY によるバッチ挿入をサポートする
*   任意の ClickHouse クエリを実行し、その結果をテーブルとして返す関数を追加する
*   すべてがリモートデータベースを対象としている場合に、UNION クエリのプッシュダウンをサポートする

## 著者 {#authors}

*   [David E. Wheeler](https://justatheory.com/)
*   [Ildus Kurbangaliev](https://github.com/ildus)
*   [Ibrar Ahmed](https://github.com/ibrarahmad)

## 著作権 {#copyright}

*   Copyright (c) 2025, ClickHouse
*   一部 Copyright (c) 2023-2025, Ildus Kurbangaliev
*   一部 Copyright (c) 2019-2023, Adjust GmbH
*   一部 Copyright (c) 2012-2019, PostgreSQL Global Development Group

[pg_clickhouse]: https://github.com/clickHouse/pg_clickhouse
    "GitHub 上の pg_clickhouse"

[import foreign tables]: /integrations/pg_clickhouse/reference#import-foreign-schema

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse
    "最新の Docker リリース"

[tutorial]: /integrations/pg_clickhouse/tutorial "pg_clickhouse チュートリアル"

[PostgreSQL Apt]: https://wiki.postgresql.org/wiki/Apt

[PostgreSQL Yum]: https://yum.postgresql.org

[PGXN client]: https://pgxn.github.io/pgxnclient/ "PGXN Client のドキュメント"

[Homebrew]: https://formulae.brew.sh/formula/pgxnclient#default
    "Homebrew 上の PGXN client"

[Apt]: https://tracker.debian.org/pkg/pgxnclient
    "Debian Apt 上の PGXN client"

[`postgresql.conf` parameters]: https://www.postgresql.org/docs/devel/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-OTHER

[PostgreSQL]: https://www.postgresql.org "PostgreSQL: 世界で最も先進的なオープンソースリレーショナルデータベース"

[libcurl]: https://curl.se/libcurl/ "libcurl — ネットワーク転送ライブラリ"

[libuuid]: https://linux.die.net/man/3/libuuid "libuuid - DCE 互換の Universally Unique Identifier (UUID) ライブラリ"

[GNU make]: https://www.gnu.org/software/make "GNU Make"

[CMake]: https://cmake.org/ "CMake: 強力なソフトウェアビルドシステム"

[LibSSL]: https://openssl-library.org "OpenSSL ライブラリ"

[TPC-H]: https://www.tpc.org/tpch/

[Query 1]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/1.sql

[Query 2]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/2.sql

[Query 3]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/3.sql

[Query 4]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/4.sql

[Query 5]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/5.sql

[Query 6]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/6.sql

[Query 7]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/7.sql

[Query 8]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/8.sql

[Query 9]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/9.sql

[Query 10]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/10.sql

[Query 11]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/11.sql

[Query 12]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/12.sql

[Query 13]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/13.sql

[Query 14]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/14.sql

[Query 15]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/15.sql

[Query 16]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/16.sql

[Query 17]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/17.sql

[Query 18]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/18.sql

[Query 19]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/19.sql

[Query 20]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/20.sql

[Query 21]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/21.sql

[Query 22]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/22.sql