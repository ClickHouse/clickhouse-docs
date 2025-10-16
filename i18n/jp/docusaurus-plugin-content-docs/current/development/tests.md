---
'description': 'ClickHouseのテストとテストスイートの実行に関するガイド'
'sidebar_label': 'Testing'
'sidebar_position': 40
'slug': '/development/tests'
'title': 'Testing ClickHouse'
'doc_type': 'guide'
---



# ClickHouseのテスト

## 機能テスト {#functional-tests}

機能テストは最もシンプルで便利です。
ClickHouseのほとんどの機能は機能テストでテスト可能であり、そのようにテストできるClickHouseコードの変更に対しては必ず使用する必要があります。

各機能テストは、実行中のClickHouseサーバーに1つまたは複数のクエリを送信し、結果を参照と比較します。

テストは `./tests/queries` ディレクトリに配置されています。

各テストは、`.sql`または`.sh`のいずれかのタイプです。
- `.sql` テストは、`clickhouse-client` にパイプされるシンプルなSQLスクリプトです。
- `.sh` テストは、独自に実行されるスクリプトです。

SQL テストは一般的に `.sh` テストよりも好まれます。
SQL から純粋に実行できない機能（たとえば、`clickhouse-client` にデータをパイプすることや `clickhouse-local` をテストすること）をテストする必要がある場合にのみ `.sh` テストを使用するべきです。

:::note
`DateTime` や `DateTime64` データ型をテストする際の一般的な間違いは、サーバーが特定のタイムゾーン（例："UTC"）を使用していると仮定することです。これは当てはまりません。CIテストの実行中はタイムゾーンが意図的にランダム化されています。テスト値のタイムゾーンを明示的に指定することで最も簡単に対処できます。例: `toDateTime64(val, 3, 'Europe/Amsterdam')`。
:::

### ローカルでテストを実行する {#running-a-test-locally}

ClickHouseサーバーをローカルで起動し、デフォルトポート（9000）でリッスンします。
たとえば、テスト `01428_hash_set_nan_key` を実行するには、リポジトリフォルダに移動して次のコマンドを実行します。

```sh
PATH=<path to clickhouse-client>:$PATH tests/clickhouse-test 01428_hash_set_nan_key
```

テスト結果（`stderr` および `stdout`）は、テスト自体の隣にある `01428_hash_set_nan_key.[stderr|stdout]` ファイルに書き込まれます（`queries/0_stateless/foo.sql` の場合、出力は `queries/0_stateless/foo.stdout` にあります）。

すべての `clickhouse-test` オプションについては、`tests/clickhouse-test --help` を参照してください。
すべてのテストを実行するか、テスト名のフィルターを提供してサブセットのテストを実行することができます: `./clickhouse-test substring`。
テストを並行して実行したり、ランダムに実行したりするオプションもあります。

### 新しいテストを追加する {#adding-a-new-test}

新しいテストを追加するには、まず `queries/0_stateless` ディレクトリに `.sql` または `.sh` ファイルを作成します。
次に、`clickhouse-client < 12345_test.sql > 12345_test.reference` または `./12345_test.sh > ./12345_test.reference` を使用して対応する `.reference` ファイルを生成します。

テストは、事前に自動的に作成されるデータベース `test` でテーブルを作成、削除、選択、などのみを行うべきです。
一時テーブルを使用することは問題ありません。

CI と同じ環境をローカルで設定するには、テスト構成（Zookeeperのモック実装を使用し、いくつかの設定を調整します）をインストールします。

```sh
cd <repository>/tests/config
sudo ./install.sh
```

:::note
テストは次の条件を満たすべきです:
- 最小限であること: 必要なテーブル、カラム、複雑さを最小限に作成すること。
- 速い: 数秒（できればサブ秒）以上かからないこと。
- 正確で決定論的であること: テスト対象の機能が機能しない場合のみ失敗すること。
- 隔離されていること/ステートレスであること: 環境やタイミングに依存しないこと。
- 徹底的であること: ゼロ、ヌル、空のセット、例外（負のテストには `-- { serverError xyz }` および `-- { clientError xyz }` 文法を使用）のような隅々のケースをカバーすること。
- テスト終了時にテーブルをクリーンアップすること（残り物がないか確認すること）。
- 他のテストが同じことをテストしていないことを確認すること（最初にgrepすること）。
:::

### テストの実行制限 {#restricting-test-runs}

テストは、CIでテストが実行される条件を指定する _tags_ を持つことができます。

`.sql` テストのタグは、最初の行にSQLコメントとして配置されます:

```sql
-- Tags: no-fasttest, no-replicated-database
-- no-fasttest: <provide_a_reason_for_the_tag_here>
-- no-replicated-database: <provide_a_reason_here>

SELECT 1
```

`.sh` テストのタグは、2行目にコメントとして記述されます:

```bash
#!/usr/bin/env bash

# Tags: no-fasttest, no-replicated-database

# - no-fasttest: <provide_a_reason_for_the_tag_here>

# - no-replicated-database: <provide_a_reason_here>
```

利用可能なタグのリスト:

| タグ名 | 何をするか | 使用例 |
|---|---|---|
| `disabled`| テストは実行されません ||
| `long` | テストの実行時間が1から10分に拡張されます ||
| `deadlock` | テストは長時間ループで実行されます ||
| `race` | `deadlock`と同じです。`deadlock`を優先してください ||
| `shard` | サーバーが `127.0.0.*` をリッスンする必要があります ||
| `distributed` | `shard`と同じです。`shard`を優先してください ||
| `global` | `shard`と同じです。`shard`を優先してください ||
| `zookeeper` | テストは、実行するためにZookeeperまたはClickHouse Keeperを必要とします | テストは `ReplicatedMergeTree` を使用します |
| `replica` | `zookeeper`と同じです。`zookeeper`を優先してください ||
| `no-fasttest`| [Fast test](continuous-integration.md#fast-test)ではテストが実行されません | テストはFast testで無効な `MySQL` テーブルエンジンを使用します |
| `fasttest-only`| [Fast test](continuous-integration.md#fast-test)でのみ実行されるテストです ||
| `no-[asan, tsan, msan, ubsan]` | [sanitizers](#sanitizers)を持つビルドではテストを無効にします | テストは、sanitizersと動作しないQEMUで実行されます |
| `no-replicated-database` |||
| `no-ordinary-database` |||
| `no-parallel` | このテストと並行して他のテストを実行しないようにします | テストは `system` テーブルから読み込み、不変条件が破られる可能性があります |
| `no-parallel-replicas` |||
| `no-debug` |||
| `no-stress` |||
| `no-polymorphic-parts` |||
| `no-random-settings` |||
| `no-random-merge-tree-settings` |||
| `no-backward-compatibility-check` |||
| `no-cpu-x86_64` |||
| `no-cpu-aarch64` |||
| `no-cpu-ppc64le` |||
| `no-s3-storage` |||

上記の設定に加えて、`system.build_options` から `USE_*` フラグを使用して特定のClickHouse機能の使用を定義できます。
たとえば、テストがMySQLテーブルを使用する場合は、`use-mysql` タグを追加する必要があります。

### ランダム設定の制限を指定する {#specifying-limits-for-random-settings}

テストは、テスト実行中にランダム化される可能性のある設定の最小および最大許可値を指定できます。

`.sh` テストの制限は、タグの隣の行またはタグが指定されていない場合の2行目にコメントとして記述されます:

```bash
#!/usr/bin/env bash

# Tags: no-fasttest

# Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
```

`.sql` テストの場合、タグがある行の隣の行または最初の行に、SQLコメントとしてタグが配置されます:

```sql
-- Tags: no-fasttest
-- Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
SELECT 1
```

1つの制限のみを指定する必要がある場合は、他の1つには `None` を使用できます。

### テスト名の選択 {#choosing-the-test-name}

テストの名前は、5桁のプレフィックスで始まり、その後に説明的な名前（例: `00422_hash_function_constexpr.sql`）が続きます。
プレフィックスを選択するには、ディレクトリ内に既に存在する最大のプレフィックスを見つけて、それに1を加えます。

```sh
ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
```

その間に、同じ数値のプレフィックスを持つ他のテストが追加される可能性がありますが、これは問題ありません。後で変更する必要はありません。

### 必要なエラーの検出 {#checking-for-an-error-that-must-occur}

時には、不正なクエリに対してサーバーエラーが発生することをテストしたい場合があります。これはSQLテストで特別な注釈をサポートしており、次の形式で記述します:

```sql
SELECT x; -- { serverError 49 }
```

このテストは、サーバーが不明なカラム `x` に関するエラーコード49を返すことを確保します。
エラーが発生しない場合やエラーが異なる場合、テストは失敗します。
クライアント側でエラーが発生することを確認したい場合は、`clientError` 注釈を使用します。

エラーメッセージの特定の文言を確認しないでください。将来的に変更される可能性があり、テストが無駄に失敗することになります。
エラーコードのみを確認してください。
既存のエラーコードが必要な精度に達していない場合、新しいエラーコードの追加を検討してください。

### 分散クエリのテスト {#testing-a-distributed-query}

機能テストで分散クエリを使用したい場合は、サーバーが自分自身をクエリするために `127.0.0.{1..2}` アドレスで `remote` テーブル関数を活用することができます。また、`test_shard_localhost` のようなサーバー構成ファイル内で定義されたテストクラスターを使用することもできます。
テスト名に `shard` または `distributed` の単語を追加することを忘れないでください。そうすれば、CIで適切な構成で実行され、サーバーが分散クエリをサポートするように設定されます。

### 一時ファイルでの作業 {#working-with-temporary-files}

シェルテストでは、操作するために動的にファイルを作成する必要がある場合があります。
一部のCIチェックがテストを並行して実行するので、一意の名前なしで一時ファイルを作成または削除している場合、CIチェックの一部（たとえば、Flaky）が失敗する可能性があります。
これを回避するためには、環境変数 `$CLICKHOUSE_TEST_UNIQUE_NAME` を使用して、実行中のテストに固有の名前を一時ファイルに付ける必要があります。
そうすれば、セットアップ中に作成したファイルやクリーンアップ中に削除するファイルが、そのテストでのみ使用されているファイルであり、並行して実行されている他のテストのファイルではないことが保証されます。

## 既知のバグ {#known-bugs}

機能テストによって簡単に再現できる既知のバグがある場合には、あらかじめ準備された機能テストを `tests/queries/bugs` ディレクトリに配置します。
これらのテストは、バグが修正されたときに `tests/queries/0_stateless` に移動されます。

## 統合テスト {#integration-tests}

統合テストは、クラスタ構成のClickHouseのテストや、MySQL、Postgres、MongoDBなどの他のサーバーとのClickHouseの相互作用をテストします。
これらは、ネットワークの分割、パケットのドロップなどをエミュレートするのに役立ちます。
これらのテストはDockerの下で実行され、さまざまなソフトウェアを持つ複数のコンテナを作成します。

これらのテストを実行する方法については、`tests/integration/README.md` を参照してください。

ClickHouseとサードパーティのドライバとの統合はテストされないので注意してください。
また、現在、JDBCおよびODBCドライバとの統合テストはありません。

## 単体テスト {#unit-tests}

単体テストは、ClickHouse全体ではなく、単一の孤立したライブラリやクラスをテストしたい場合に有用です。
`ENABLE_TESTS` CMakeオプションを使用してテストのビルドを有効または無効にできます。
単体テスト（およびその他のテストプログラム）は、コード全体で `tests` サブディレクトリにあります。
単体テストを実行するには、`ninja test` と入力します。
一部のテストは `gtest` を使用していますが、他のテストは単にテスト失敗時に非ゼロの終了コードを返すプログラムです。

機能テストでコードが既にカバーされている場合は、単体テストが必ずしも必要ではありません（機能テストの方が通常はずっと使いやすいです）。

個々のgtestチェックを直接実行ファイルを呼び出すことで実行できます。たとえば:

```bash
$ ./src/unit_tests_dbms --gtest_filter=LocalAddress*
```

## パフォーマンステスト {#performance-tests}

パフォーマンステストは、合成クエリにおけるClickHouseの特定の孤立した部分のパフォーマンスを測定および比較することを可能にします。
パフォーマンステストは `tests/performance/` に配置されています。
各テストはテストケースの説明を持つ `.xml` ファイルで表されます。
テストは `docker/test/performance-comparison` ツールで実行されます。呼び出し方法についてはREADMEファイルを確認してください。

各テストはループ内で1つまたは複数のクエリ（パラメータの組み合わせを含む可能性があります）を実行します。

シナリオのパフォーマンスを向上させたい場合や、改善が単純なクエリで確認できる場合は、パフォーマンステストを書くことを強くお勧めします。
また、比較的孤立していてあまり知られていないSQL関数を追加または変更する際にもパフォーマンステストを書くことをお勧めします。
テスト中に `perf top` や他の `perf` ツールを使用することは常に意味があります。

## テストツールとスクリプト {#test-tools-and-scripts}

`tests` ディレクトリ内のいくつかのプログラムは準備されたテストではなく、テストツールです。
たとえば、`Lexer` には、stdinのトークン化を行い、色付けされた結果をstdoutに書き込むツール `src/Parsers/tests/lexer` があります。
このようなツールをコードの例として使用したり、探索や手動テストに利用したりできます。

## その他のテスト {#miscellaneous-tests}

`tests/external_models` には機械学習モデルのテストがあります。
これらのテストは更新されておらず、統合テストに移行する必要があります。

クオーラム挿入用の別のテストがあります。
このテストはClickHouseクラスターを別のサーバーで実行し、さまざまな障害ケースをエミュレートします：ネットワーク分割、パケットのドロップ（ClickHouseノード間、ClickHouseとZooKeeper間、ClickHouseサーバーとクライアント間など）、`kill -9`、`kill -STOP`、および `kill -CONT` など、[Jepsen](https://aphyr.com/tags/Jepsen) のように。テストは、すべての確認済み挿入が書き込まれ、すべての拒否された挿入が書き込まれていないことを確認します。

クオーラムテストは、ClickHouseがオープンソース化される前に別のチームによって書かれました。
このチームはもはやClickHouseで作業していません。
テストは偶然Javaで書かれました。
これらの理由から、クオーラムテストは再記述され、統合テストに移動する必要があります。

## 手動テスト {#manual-testing}

新しい機能を開発する際は、それを手動でもテストするのが合理的です。
以下の手順で行うことができます:

ClickHouseをビルドします。ターミナルからClickHouseを実行します: `programs/clickhouse-server` にディレクトリを変更し、`./clickhouse-server` で実行します。デフォルトで、現在のディレクトリからの設定（`config.xml`、`users.xml`、および `config.d` および `users.d` ディレクトリ内のファイル）を使用します。ClickHouseサーバーに接続するには、`programs/clickhouse-client/clickhouse-client` を実行します。

すべてのClickHouseツール（サーバー、クライアントなど）は、`clickhouse` という名前の単一のバイナリへのシンボリックリンクであることに注意してください。
このバイナリは `programs/clickhouse` で見つけることができます。
すべてのツールは、`clickhouse tool` としても呼び出すことができます。

また、ClickHouseパッケージをインストールできます。ClickHouseリポジトリからの安定版リリース、またはClickHouseソースのルートにある `./release` で自分用のパッケージをビルドできます。
その後、`sudo clickhouse start`（またはサーバーを停止するには `stop`）でサーバを起動します。
ログは `/etc/clickhouse-server/clickhouse-server.log` にあります。

すでにシステムにClickHouseがインストールされている場合、既存のバイナリを置き換えるために新しい `clickhouse` バイナリをビルドできます:

```bash
$ sudo clickhouse stop
$ sudo cp ./clickhouse /usr/bin/
$ sudo clickhouse start
```

また、システムのclickhouse-serverを停止して、同じ構成で自分のものを実行することができますが、ターミナルにロギングします:

```bash
$ sudo clickhouse stop
$ sudo -u clickhouse /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

gdbを使った例:

```bash
$ sudo -u clickhouse gdb --args /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

システムのclickhouse-serverがすでに実行中で停止したくない場合、`config.xml` のポート番号を変更する（または `config.d` ディレクトリ内のファイルでオーバーライドする）、適切なデータパスを提供し、それを実行できます。

`clickhouse` バイナリはほとんど依存関係がなく、広範囲のLinuxディストリビューションで動作します。
サーバー上での変更を迅速にテストするには、単純に自分がビルドしたばかりの `clickhouse` バイナリをサーバーに `scp` し、上記の例のように実行することができます。

## ビルドテスト {#build-tests}

ビルドテストは、さまざまな代替構成や外国のシステムでビルドが壊れていないことを確認するためのものです。
これらのテストも自動化されています。

例:
- Darwin x86_64（macOS）用にクロスコンパイルする
- FreeBSD x86_64用にクロスコンパイルする
- Linux AArch64用にクロスコンパイルする
- システムパッケージのライブラリを使用してUbuntu上にビルドする（推奨されていません）
- 共有リンクのライブラリを使用してビルドする（推奨されていません）

たとえば、システムパッケージでビルドすることは悪い実践です。なぜなら、システムが持つパッケージの正確なバージョンを保証できないからです。
しかし、これはDebianのメンテナーによって本当に必要です。
そのため、少なくともこのビルドのバリアントをサポートする必要があります。
もう1つの例：共有リンクは一般的な問題の原因ですが、一部の熱心なユーザーに必要です。

すべてのビルドバリアントでテストを実行することはできませんが、さまざまなビルドバリアントが壊れていないことを確認したいと考えています。
この目的のためにビルドテストを使用します。

コンパイルするのに時間がかかりすぎる翻訳ユニットや、RAMを過剰に消費するトランスレーションユニットがないことも確認します。

また、過度に大きなスタックフレームがないこともテストします。

## プロトコル互換性のテスト {#testing-for-protocol-compatibility}

ClickHouseネットワークプロトコルを拡張する際に、古いclickhouse-clientが新しいclickhouse-serverで動作し、新しいclickhouse-clientが古いclickhouse-serverで動作することを手動でテストします（対応するパッケージからバイナリを実行するだけです）。

いくつかのケースを自動的に統合テストでテストします:
- 古いバージョンのClickHouseで書き込まれたデータが新しいバージョンで正常に読み取れるか
- 異なるClickHouseバージョンを持つクラスタ内で分散クエリが機能するかどうか

## コンパイラからのヘルプ {#help-from-the-compiler}

主要なClickHouseコード（`src` ディレクトリにある）は、`-Wall -Wextra -Werror` を使用してビルドされ、いくつかの追加の警告が有効になっています。
ただし、これらのオプションはサードパーティのライブラリには適用されていません。

Clangにはさらに便利な警告があります。 `-Weverything` で検索して、デフォルトビルドでいくつかを選択できます。

私たちは開発と生産の両方のためにClickHouseをビルドするために常にclangを使用します。
自分のマシンでデバッグモードでビルドを行うことができます（ノートパソコンのバッテリーを節約するために）。
ただし、コンパイラは、より良い制御フローと手続き間分析により、`-O3` でより多くの警告を生成できることに注意してください。
デバッグモードでclangを使ってビルドする際には、ランタイムエラーをより多くキャッチできるように、デバッグ版の `libc++` が使用されます。

## Sanitizers {#sanitizers}

:::note
プロセス（ClickHouseサーバーまたはクライアント）がローカルで起動時にクラッシュする場合は、アドレス空間レイアウトのランダム化を無効にする必要があります: `sudo sysctl kernel.randomize_va_space=0`
:::

### アドレスサニタイザー {#address-sanitizer}

機能テスト、統合テスト、ストレステスト、単体テストは、コミットごとにASanで実行されます。

### スレッドサニタイザー {#thread-sanitizer}

機能テスト、統合テスト、ストレステスト、単体テストは、コミットごとにTSanで実行されます。

### メモリサニタイザー {#memory-sanitizer}

機能テスト、統合テスト、ストレステスト、単体テストは、コミットごとにMSanで実行されます。

### 未定義動作サニタイザー {#undefined-behaviour-sanitizer}

機能テスト、統合テスト、ストレステスト、単体テストは、コミットごとにUBSanで実行されます。
いくつかのサードパーティのライブラリのコードは、UBサニタイザーではサニタイズされていません。

### Valgrind（メモリチェック） {#valgrind-memcheck}

以前はValgrindで機能テストを一晩実行していましたが、もう行っていません。
数時間かかります。
現在、`re2`ライブラリに既知の偽陽性が1つあります。詳細は[この記事](https://research.swtch.com/sparse)を参照してください。

## ファジング {#fuzzing}

ClickHouseのファジングは、[libFuzzer](https://llvm.org/docs/LibFuzzer.html) とランダムSQLクエリの両方を使用して実装されています。
すべてのファジングテストは、サニタイザー（アドレスと未定義）で実行する必要があります。

LibFuzzerはライブラリコードの孤立したファジングテストに使用されます。
ファズテストはテストコードの一部として実装され、"_fuzzer"の名前の後続があります。
ファジングの例は `src/Parsers/fuzzers/lexer_fuzzer.cpp` で見つけることができます。
LibFuzzer固有の設定、辞書、コーパスは `tests/fuzz` に保存されています。
ユーザー入力を扱う任意の機能に対してファズテストを作成することをお勧めします。

ファズテストはデフォルトでビルドされません。
ファズをビルドするには、`-DENABLE_FUZZING=1` と `-DENABLE_TESTS=1` の両方のオプションを設定する必要があります。
ファズをビルドする際はJemallocを無効にすることをお勧めします。
ClickHouseのファジングをGoogle OSS-Fuzzに統合するために使用される構成は、`docker/fuzz` にあります。

ランダムなSQLクエリを生成し、サーバーがそれらを実行しても死なないことを確認するための簡単なファジングテストも使用しています。
このテストは `00746_sql_fuzzy.pl` にあります。
このテストは継続的に（晩やそれ以上）実行する必要があります。

我々は、巨額の隅々のケースを見つけることができる高度なASTベースのクエリファザを使用しています。
これは、クエリAST内でランダムな順列や置換を行います。
以前のテストからASTノードを記憶して、テストをランダムな順序で処理する際にその後のテストのファジングに使用します。
このファジングテストの詳細については、[このブログ記事](https://clickhouse.com/blog/fuzzing-click-house)を参照してください。

## ストレッサーテスト {#stress-test}

ストレッサーテストは、別のファジングの一形態です。
すべての機能テストを、単一のサーバーでランダムな順序で並行して実行します。
テストの結果は確認されません。

確認される内容:
- サーバーがクラッシュしないこと、デバッグまたはサニタイザーのトラップがトリガーされないこと。
- デッドロックがないこと。
- データベース構造が一貫性があること。
- テスト後にサーバーが正常に停止し、例外なく再起動できること。

5つのバリアントがあります（Debug、ASan、TSan、MSan、UBSan）。

## スレッドファザ {#thread-fuzzer}

スレッドファザ（スレッドサニタイザーと混同しないでください）は、スレッド実行順序をランダム化することができる別の種類のファジングです。
これは、さらに特別なケースを見つけるのに役立ちます。

## セキュリティ監査 {#security-audit}

私たちのセキュリティチームは、セキュリティの観点からClickHouseの機能についての基本的なレビューを行いました。

## 静的解析ツール {#static-analyzers}

私たちは、コミットごとに `clang-tidy` を実行します。
`clang-static-analyzer` のチェックも有効です。
`clang-tidy` は一部のスタイルチェックにも使用されます。

`clang-tidy`、`Coverity`、`cppcheck`、`PVS-Studio`、`tscancode`、`CodeQL` を評価しました。
使用方法についての指示は `tests/instructions/` ディレクトリにあります。

`CLion`をIDEとして使用している場合は、標準でいくつかの `clang-tidy` チェックを活用できます。

シェルスクリプトの静的解析には `shellcheck` を使用しています。

## ハードニング {#hardening}

デバッグビルドでは、ユーザーレベルの割り当てにASLRを実行するカスタムアロケーターを使用しています。

割り当て後に読み取り専用が予想されるメモリ領域を手動で保護します。

デバッグビルドでは、呼び出される危険な（古い、セキュリティ的に不安定、スレッドセーフでない）関数がないことを確保し、libcのカスタマイズを含めています。

デバッグアサーションは広範囲に使用されています。

デバッグビルドでは、「論理エラー」コードの例外がスローされると（バグを示唆）、プログラムは早期に終了します。
これにより、リリースビルドでは例外を使用できるが、デバッグビルドではアサーションになります。

デバッグビルドにはJemallocのデバッグ版が使用されます。
デバッグビルドにはlibc++のデバッグ版も使用されます。

## ランタイム整合性チェック {#runtime-integrity-checks}

ディスクに保存されたデータにはチェックサムが含まれています。
MergeTreeテーブル内のデータは、同時に3つの方法でチェックサムが含まれています（圧縮データブロック、非圧縮データブロック、およびブロック全体の合計チェックサム）。
クライアントとサーバー間またはサーバー間で転送されるデータもチェックサムが含まれています。
レプリケーションはレプリカ上でビット同一のデータを保証します。

これは、故障したハードウェア（ストレージメディアのビット腐食、サーバーのRAM内のビットフリップ、ネットワークコントローラーのRAMのビットフリップ、ネットワークスイッチのRAMのビットフリップ、クライアントのRAMのビットフリップ、ワイヤ上のビットフリップ）から保護する必要があります。
ビットフリップは一般的であり、ECC RAMやTCPチェックサムが存在する場合でも発生する可能性が高いことに注意してください（ペタバイトのデータを処理するサーバーを数千台実行している場合、発生する可能性が高いです）。
[このビデオ（ロシア語）](https://www.youtube.com/watch?v=ooBAQIe0KlQ)をご覧ください。

ClickHouseは、運用エンジニアが故障したハードウェアを特定するのに役立つ診断を提供します。

\* そして、これは遅くない。

## コードスタイル {#code-style}

コードスタイルのルールは[こちら](style.md)に記載されています。

一般的なスタイル違反をチェックするには、`utils/check-style` スクリプトを使用できます。

コードの正しいスタイルを強制するために、`clang-format` を使用できます。
ファイル `.clang-format` はソースのルートにあります。
これは主に私たちの実際のコードスタイルに対応しています。
ただし、既存のファイルに `clang-format` を適用することは推奨されません。フォーマットが悪化します。
`clang-format-diff` ツールを使用することで、clangソースリポジトリで見つけることができます。

代わりに、コードを再フォーマットするために `uncrustify` ツールを使用することもできます。
設定はソースのルートの `uncrustify.cfg` にあります。
これは `clang-format` よりも十分にテストされていません。

`CLion` は、私たちのコードスタイルに合わせて調整する必要がある独自のコードフォーマッターを持っています。

私たちはまた、コード内の誤字を見つけるために `codespell` を使用します。
これは自動化されています。

## テストカバレッジ {#test-coverage}

私たちは、機能テストに対してのみ、ClickHouseサーバー向けのテストカバレッジを追跡しています。
これは日次ベースで実施されています。

## テストのためのテスト {#tests-for-tests}

フレークテストのための自動化されたチェックがあります。
新しいテストを100回（機能テストの場合）または10回（統合テストの場合）実行します。
1回でもテスト失敗があれば、それはフレークテストと見なされます。

## テスト自動化 {#test-automation}

私たちは、[GitHub Actions](https://github.com/features/actions) を使用してテストを実行します。

ビルドジョブとテストは、コミットごとにサンドボックスで実行されます。
結果として得られたパッケージとテスト結果はGitHubに公開され、直接リンクでダウンロードできます。
アーティファクトは数ヶ月間保存されます。
GitHubでプルリクエストを送信すると、「テスト可能」とタグ付けされ、CIシステムがあなたのためにClickHouseパッケージ（リリース、デバッグ、アドレスサニタイザー付きなど）をビルドします。
