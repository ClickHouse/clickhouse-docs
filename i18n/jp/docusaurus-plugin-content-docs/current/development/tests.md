---
description: 'ClickHouse のテスト方法とテストスイートの実行ガイド'
sidebar_label: 'テスト'
sidebar_position: 40
slug: /development/tests
title: 'ClickHouse のテスト'
doc_type: 'guide'
---

# ClickHouse のテスト {#testing-clickhouse}

## 機能テスト {#functional-tests}

機能テストは最もシンプルで扱いやすいテストです。
ClickHouse の機能のほとんどは機能テストで検証でき、この方法でテスト可能な ClickHouse のコード変更については、機能テストの実行が必須です。

各機能テストは、起動中の ClickHouse サーバーに 1 つまたは複数のクエリを送信し、その結果を期待される参照結果と比較します。

テストは `./tests/queries` ディレクトリに配置されています。

各テストは `.sql` と `.sh` の 2 種類のいずれかです。

* `.sql` テストは、`clickhouse-client` にパイプされる単純な SQL スクリプトです。
* `.sh` テストは、単体で実行されるスクリプトです。

一般的には、`.sh` テストよりも SQL テストを使用することを推奨します。
SQL だけでは検証できない機能、たとえば入力データを `clickhouse-client` にパイプする場合や `clickhouse-local` をテストする場合などにのみ、`.sh` テストを使用してください。

:::note
`DateTime` および `DateTime64` のデータ型をテストする際のよくある誤りは、サーバーが特定のタイムゾーン（例: &quot;UTC&quot;）を使用していると想定してしまうことです。実際にはそうではなく、CI テスト実行時のタイムゾーンは意図的にランダム化されています。最も簡単な回避策は、テスト値に対してタイムゾーンを明示的に指定することです。例: `toDateTime64(val, 3, 'Europe/Amsterdam')`。
:::

### ローカルでテストを実行する {#running-a-test-locally}

ClickHouse サーバーをローカルで起動し、デフォルトポート（9000）で待ち受けるようにします。
たとえばテスト `01428_hash_set_nan_key` を実行するには、リポジトリのフォルダーに移動して次のコマンドを実行します。

```sh
PATH=<path to clickhouse-client>:$PATH tests/clickhouse-test 01428_hash_set_nan_key
```

テスト結果（`stderr` および `stdout`）は、テストファイルと同じディレクトリに作成される `01428_hash_set_nan_key.[stderr|stdout]` というファイルに書き出されます（たとえば `queries/0_stateless/foo.sql` の場合、出力は `queries/0_stateless/foo.stdout` に書き出されます）。

`clickhouse-test` の全オプションについては `tests/clickhouse-test --help` を参照してください。
すべてのテストを実行することも、テスト名に対するフィルターを指定して一部のテストのみを実行することもできます: `./clickhouse-test substring`。
テストを並列で実行したり、ランダムな順序で実行したりするオプションもあります。

### 新しいテストの追加 {#adding-a-new-test}

新しいテストを追加するには、まず `queries/0_stateless` ディレクトリに `.sql` または `.sh` ファイルを作成します。
次に、`clickhouse-client < 12345_test.sql > 12345_test.reference` または `./12345_test.sh > ./12345_test.reference` を使用して、対応する `.reference` ファイルを生成します。

テストでは、事前に自動的に作成されるデータベース `test` 内のテーブルに対してのみ、作成、削除、SELECT などの操作を行うようにしてください。
一時テーブルを使用しても問題ありません。

CI と同じ環境をローカルでセットアップするには、テスト用の設定をインストールしてください（これらは Zookeeper のモック実装を使用し、いくつかの設定を調整します）。

```sh
cd <repository>/tests/config
sudo ./install.sh
```

:::note
テストは次のようであるべきです

* 最小限であること: 必要最小限のテーブル・カラムおよび複雑さのみを作成すること
* 高速であること: 数秒以内（望ましくは 1 秒未満）で完了すること
* 正確かつ決定的であること: テスト対象の機能が動作していない場合にのみ失敗すること
* 分離されステートレスであること: 実行環境やタイミングに依存しないこと
* 網羅的であること: 0、null、空集合、例外（負のテストには `-- { serverError xyz }` および `-- { clientError xyz }` 構文を使用）などのコーナーケースをカバーすること
* テストの最後にテーブルをクリーンアップすること（取り残しがある場合に備えて）
* 他のテストが同じ内容をテストしていないことを確認すること（つまり、まず grep して確認する）
  :::

### テスト実行の制限 {#restricting-test-runs}

テストには 0 個以上の *タグ* を付けることができ、CI 上でどのコンテキストで実行されるかを制御できます。

`.sql` テストでは、タグは 1 行目に SQL コメントとして記述します:

```sql
-- Tags: no-fasttest, no-replicated-database
-- no-fasttest: <provide_a_reason_for_the_tag_here>
-- no-replicated-database: <provide_a_reason_here>

SELECT 1
```

`.sh` のテストでは、タグは 2 行目のコメントとして記述します。

```bash
#!/usr/bin/env bash
# Tags: no-fasttest, no-replicated-database
# - no-fasttest: <provide_a_reason_for_the_tag_here>
# - no-replicated-database: <provide_a_reason_here>
```

利用可能なタグの一覧は次のとおりです:

| Tag name                          | What it does                                               | Usage example                                    |
| --------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `disabled`                        | テストは実行されません                                                |                                                  |
| `long`                            | テストの実行時間が 1 分から 10 分に延長されます                                |                                                  |
| `deadlock`                        | テストが長時間ループで実行されます                                          |                                                  |
| `race`                            | `deadlock` と同じです。`deadlock` を優先して使用してください                  |                                                  |
| `shard`                           | サーバーが `127.0.0.*` をリッスンする必要があります                           |                                                  |
| `distributed`                     | `shard` と同じです。`shard` を優先して使用してください                        |                                                  |
| `global`                          | `shard` と同じです。`shard` を優先して使用してください                        |                                                  |
| `zookeeper`                       | テストの実行に Zookeeper または ClickHouse Keeper が必要です              | テストで `ReplicatedMergeTree` を使用します                |
| `replica`                         | `zookeeper` と同じです。`zookeeper` を優先して使用してください                |                                                  |
| `no-fasttest`                     | [Fast test](continuous-integration.md#fast-test) では実行されません | テストで Fast test では無効化されている `MySQL` テーブルエンジンを使用します |
| `fasttest-only`                   | [Fast test](continuous-integration.md#fast-test) のみで実行されます |                                                  |
| `no-[asan, tsan, msan, ubsan]`    | [sanitizers](#sanitizers) を有効にしたビルドではテストを実行しません            | テストは sanitizers と互換性のない QEMU 上で実行されます            |
| `no-replicated-database`          |                                                            |                                                  |
| `no-ordinary-database`            |                                                            |                                                  |
| `no-parallel`                     | このテストと他のテストを並行実行しないようにします                                  | テストは `system` テーブルを読み取り、不変条件が壊れる可能性があります         |
| `no-parallel-replicas`            |                                                            |                                                  |
| `no-debug`                        |                                                            |                                                  |
| `no-stress`                       |                                                            |                                                  |
| `no-polymorphic-parts`            |                                                            |                                                  |
| `no-random-settings`              |                                                            |                                                  |
| `no-random-merge-tree-settings`   |                                                            |                                                  |
| `no-backward-compatibility-check` |                                                            |                                                  |
| `no-cpu-x86_64`                   |                                                            |                                                  |
| `no-cpu-aarch64`                  |                                                            |                                                  |
| `no-cpu-ppc64le`                  |                                                            |                                                  |
| `no-s3-storage`                   |                                                            |                                                  |

上記の設定に加えて、特定の ClickHouse 機能を使用するかどうかを指定するために、`system.build_options` の `USE_*` フラグを使用できます。
たとえば、テストで MySQL テーブルを使用する場合は、タグ `use-mysql` を追加する必要があります。

### ランダム設定の制限の指定 {#specifying-limits-for-random-settings}

テストでは、テスト実行中にランダム化される可能性がある設定について、許可される最小値と最大値を指定できます。

`.sh` テストでは、制限はタグの隣の行、またはタグが指定されていない場合は 2 行目のコメントとして記述します:

```bash
#!/usr/bin/env bash
# Tags: no-fasttest
# Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
```

`.sql` テストでは、タグは対象行の直後の行か、先頭行に SQL コメントとして記述します。

```sql
-- Tags: no-fasttest
-- Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
SELECT 1
```

片方の上限だけを指定する場合は、もう一方には `None` を指定できます。

### テスト名の決め方 {#choosing-the-test-name}

テストの名前は、`00422_hash_function_constexpr.sql` のように、5桁のプレフィックスの後に内容を表す名前を付けます。
プレフィックスを決めるには、ディレクトリ内で既に存在する最大のプレフィックスを確認し、その値に 1 を加えてください。

```sh
ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
```

その間に、同じ数値プレフィックスを持つ別のテストが追加されることもありますが、それでも問題はなく、そのままで構いません。後から変更する必要はありません。

### 必ず発生するエラーの確認 {#checking-for-an-error-that-must-occur}

誤ったクエリに対してサーバーエラーが発生することを確認したい場合があります。そのために、SQL テストでは次の形式の特別なアノテーションをサポートしています。

```sql
SELECT x; -- { serverError 49 }
```

このテストは、サーバーが未知のカラム `x` に関するコード 49 のエラーを返すことを確認するものです。
エラーが発生しない場合、または別のエラーが返ってきた場合、テストは失敗します。
クライアント側でエラーが発生することを確認したい場合は、代わりに `clientError` アノテーションを使用してください。

エラーメッセージの特定の文言はチェックしないでください。将来変更される可能性があり、そのたびにテストが不要に壊れてしまいます。
エラーコードのみを確認してください。
既存のエラーコードが要件に対して十分に厳密でない場合は、新しいエラーコードの追加を検討してください。

### 分散クエリのテスト {#testing-a-distributed-query}

機能テストで分散クエリを使用したい場合、サーバー自身に対してクエリを実行するために、アドレス `127.0.0.{1..2}` を指定した `remote` テーブル関数を利用できます。または、サーバー設定ファイル内であらかじめ定義された `test_shard_localhost` のようなテスト用クラスタを使用することもできます。
テスト名には必ず `shard` または `distributed` という単語を含めてください。そうすることで、サーバーが分散クエリをサポートするように設定されている正しい構成で、CI 上でテストが実行されるようになります。

### 一時ファイルの扱い {#working-with-temporary-files}

シェルテストの中で、その場でファイルを作成して利用する必要が生じる場合があります。
一部の CI チェックではテストが並列に実行されることに注意してください。そのため、一意ではない名前でスクリプト内から一時ファイルを作成または削除していると、`Flaky` などの CI チェックが失敗する原因になります。
これを回避するには、環境変数 `$CLICKHOUSE_TEST_UNIQUE_NAME` を使用して、一時ファイルに実行中のテストに固有の名前を付けてください。
そうすることで、セットアップ中に作成したりクリーンアップ中に削除したりしているファイルが、そのテストだけで使用されているものであり、並列で実行中の他のテストで使用されているファイルではないことを保証できます。

## 既知のバグ {#known-bugs}

機能テストで簡単に再現できる既知のバグがある場合、そのバグに対応する機能テストを `tests/queries/bugs` ディレクトリに配置します。
これらのテストは、バグが修正され次第 `tests/queries/0_stateless` に移動されます。

## 統合テスト {#integration-tests}

統合テストでは、クラスタ構成での ClickHouse のテストや、MySQL、Postgres、MongoDB など他のサーバーとの ClickHouse の連携をテストできます。
ネットワーク分断やパケットロスなどをエミュレートするのに有用です。
これらのテストは Docker 上で実行され、さまざまなソフトウェアを含む複数のコンテナを作成します。

これらのテストの実行方法については `tests/integration/README.md` を参照してください。

なお、ClickHouse とサードパーティ製ドライバーの連携はテスト対象に含まれていません。
また、現時点では公式 JDBC / ODBC ドライバーとの連携に関する統合テストもありません。

## ユニットテスト {#unit-tests}

ユニットテストは、ClickHouse 全体ではなく、特定のライブラリやクラス単体をテストしたい場合に有用です。
テストのビルドは、`ENABLE_TESTS` という CMake オプションで有効または無効にできます。
ユニットテスト（およびその他のテストプログラム）は、コード内の `tests` サブディレクトリに配置されています。
ユニットテストを実行するには、`ninja test` と入力します。
一部のテストは `gtest` を使用しますが、単にテスト失敗時に非ゼロの終了コードを返すだけのプログラムもあります。

コードがすでに機能テストでカバーされている場合は、必ずしもユニットテストを用意する必要はありません（機能テストの方が、通常ははるかに簡単に扱えます）。

個別の gtest チェックは、実行ファイルを直接呼び出すことで実行できます。例えば、次のようにします。

```bash
$ ./src/unit_tests_dbms --gtest_filter=LocalAddress*
```

## パフォーマンステスト {#performance-tests}

パフォーマンステストを使用すると、ClickHouse の一部の要素を切り出し、シンセティックなクエリに対するパフォーマンスを測定・比較できます。
パフォーマンステストは `tests/performance/` に配置されています。
各テストは、テストケースの説明を含む `.xml` ファイルで表されます。
テストは `docker/test/performance-comparison` ツールで実行します。実行方法については README ファイルを参照してください。

各テストでは、1つまたは複数のクエリ（パラメータの組み合わせを含む場合があります）をループで実行します。

特定のシナリオで ClickHouse のパフォーマンスを改善したい場合で、その改善がシンプルなクエリで観測できるのであれば、パフォーマンステストを作成することを強く推奨します。
また、比較的独立していてそれほど特殊でない SQL 関数を追加または変更する場合にも、パフォーマンステストを作成することを推奨します。
テストの実行中には、常に `perf top` などの `perf` ツールを使用することが有用です。

## テストツールとスクリプト {#test-tools-and-scripts}

`tests` ディレクトリ内の一部のプログラムは、事前に用意されたテストではなく、テスト用ツールです。
たとえば、`Lexer` には `src/Parsers/tests/lexer` というツールがあり、これは標準入力をトークナイズし、結果を色付けして標準出力に書き出すだけのものです。
この種のツールは、コード例として利用できるほか、動作の調査や手動テストにも利用できます。

## その他のテスト {#miscellaneous-tests}

`tests/external_models` には機械学習モデル向けのテストがあります。
これらのテストはメンテナンスされておらず、インテグレーションテストに移行する必要があります。

クォーラムインサート用の個別のテストがあります。
このテストでは、ClickHouse クラスターを別々のサーバー上で実行し、さまざまな障害ケースをシミュレートします。ネットワーク分断、パケットドロップ（ClickHouse ノード間、ClickHouse と ZooKeeper 間、ClickHouse サーバーとクライアント間など）、`kill -9`、`kill -STOP`、`kill -CONT` といったものです。[Jepsen](https://aphyr.com/tags/Jepsen) に似ています。その後、このテストは、ACK されたすべての挿入が書き込まれており、拒否されたすべての挿入が書き込まれていないことを検証します。

クォーラムテストは、ClickHouse がオープンソース化される前に別のチームによって作成されました。
このチームは現在 ClickHouse に関わっていません。
テストは不運にも Java で実装されています。
これらの理由により、クォーラムテストは書き直してインテグレーションテストに移動する必要があります。

## 手動テスト {#manual-testing}

新しい機能を開発した場合、その機能を手動でもテストするのは妥当です。
次の手順で行うことができます。

ClickHouse をビルドします。ターミナルから ClickHouse を実行するには、`programs/clickhouse-server` ディレクトリに移動し、`./clickhouse-server` を実行します。デフォルトでは、カレントディレクトリ内の設定ファイル（`config.xml`、`users.xml`、および `config.d` と `users.d` ディレクトリ内のファイル）を使用します。ClickHouse サーバーに接続するには、`programs/clickhouse-client/clickhouse-client` を実行します。

すべての clickhouse ツール（server、client など）は、`clickhouse` という名前の 1 つのバイナリへのシンボリックリンクであることに注意してください。
このバイナリは `programs/clickhouse` にあります。
すべてのツールは `clickhouse-tool` の代わりに `clickhouse tool` として呼び出すこともできます。

別の方法として、ClickHouse パッケージをインストールすることもできます。ClickHouse リポジトリから安定版リリースをインストールするか、ClickHouse ソースのルートで `./release` を実行して自分でパッケージをビルドします。
その後、`sudo clickhouse start` でサーバーを起動します（`sudo clickhouse stop` で停止します）。
ログは `/etc/clickhouse-server/clickhouse-server.log` を確認してください。

既にシステムに ClickHouse がインストールされている場合は、新しい `clickhouse` バイナリをビルドして、既存のバイナリを置き換えることができます。

```bash
$ sudo clickhouse stop
$ sudo cp ./clickhouse /usr/bin/
$ sudo clickhouse start
```

また、システムの clickhouse-server サービスを停止し、同じ設定を用いつつログをターミナルに出力するようにした clickhouse-server を手動で起動することもできます。

```bash
$ sudo clickhouse stop
$ sudo -u clickhouse /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

gdb を使った例:

```bash
$ sudo -u clickhouse gdb --args /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

もしシステムの clickhouse-server がすでに稼働していて停止したくない場合は、`config.xml` 内のポート番号を変更する（または `config.d` ディレクトリ内のファイルで上書きする）ことで、適切なデータパスを指定したうえで起動できます。

`clickhouse` バイナリにはほとんど依存関係がなく、幅広い Linux ディストリビューションで動作します。
サーバー上で変更内容を簡易的にテストしたい場合は、新しくビルドした `clickhouse` バイナリを `scp` でサーバーにコピーし、上記の例のように実行するだけで十分です。

## ビルドテスト {#build-tests}

ビルドテストにより、さまざまな代替構成や一部の異なるシステム環境で、ビルドが破綻していないことを確認できます。
これらのテストも自動化されています。

例:
- Darwin x86_64 (macOS) 向けクロスコンパイル
- FreeBSD x86_64 向けクロスコンパイル
- Linux AArch64 向けクロスコンパイル
- システムパッケージ由来のライブラリを用いた Ubuntu 上でのビルド（非推奨）
- ライブラリを共有リンク（共有ライブラリリンク）でビルド（非推奨）

たとえば、システムパッケージを使ってビルドするのは望ましいプラクティスではありません。システムにどのバージョンのパッケージが入っているかを保証できないためです。
しかし、Debian メンテナにはこれがどうしても必要です。
このため、少なくともこのビルド形態をサポートせざるを得ません。
別の例として、共有リンクはトラブルの一般的な原因ですが、一部の有志には必要とされています。

すべてのビルドバリアントで全テストを実行することはできませんが、少なくともさまざまなビルドバリアントが壊れていないことは確認したいと考えています。
そのためにビルドテストを使用します。

また、コンパイルに時間がかかりすぎたり、過大な RAM を要求したりするような翻訳単位が存在しないこともテストします。

さらに、スタックフレームが過度に大きくないこともテストします。

## プロトコル互換性のテスト {#testing-for-protocol-compatibility}

ClickHouse のネットワークプロトコルを拡張する際には、古い clickhouse-client が新しい clickhouse-server で動作すること、および新しい clickhouse-client が古い clickhouse-server で動作することを、（対応するパッケージに含まれるバイナリを実行するだけで）手動でテストします。

また、次のようなケースの一部は統合テストで自動的に検証します:
- 古いバージョンの ClickHouse によって書き込まれたデータを、新しいバージョンの ClickHouse で正常に読み取れるかどうか。
- 異なる ClickHouse バージョンが混在するクラスタで分散クエリが正しく動作するかどうか。

## コンパイラからの助け {#help-from-the-compiler}

メインの ClickHouse コード（`src` ディレクトリ内にあるもの）は、`-Wall -Wextra -Werror` に加えて、いくつかの追加の警告を有効にしてビルドされています。
ただし、これらのオプションはサードパーティライブラリには有効化されていません。

Clang にはさらに有用な警告が多数あり、`-Weverything` を指定して一覧を確認し、その中からデフォルトビルドで有効にするものを選ぶことができます。

ClickHouse のビルドには、開発環境・本番環境のどちらでも常に clang を使用します。
自分のマシンでは（ノート PC のバッテリーを節約するために）デバッグモードでビルドしてかまいませんが、制御フローや関数間解析がより最適化されるため、`-O3` でビルドしたほうがコンパイラはより多くの警告を生成できることに注意してください。
clang でデバッグモードのビルドを行う場合、実行時により多くのエラーを検出できるように、`libc++` のデバッグ版が使用されます。

## サニタイザ {#sanitizers}

:::note
ローカルで実行した際にプロセス（ClickHouse サーバーまたはクライアント）が起動時にクラッシュする場合、アドレス空間配置のランダム化を無効にする必要があるかもしれません: `sudo sysctl kernel.randomize_va_space=0`
:::

### Address sanitizer {#address-sanitizer}

ASan を有効にして、機能テスト・結合テスト・ストレステスト・ユニットテストをコミットごとに実行しています。

### Thread sanitizer {#thread-sanitizer}

TSan を有効にして、機能テスト・結合テスト・ストレステスト・ユニットテストをコミットごとに実行しています。

### Memory sanitizer {#memory-sanitizer}

MSan を有効にして、機能テスト・結合テスト・ストレステスト・ユニットテストをコミットごとに実行しています。

### Undefined behaviour sanitizer {#undefined-behaviour-sanitizer}

UBSan を有効にして、機能テスト・結合テスト・ストレステスト・ユニットテストをコミットごとに実行しています。
一部のサードパーティライブラリのコードは、UB サニタイズの対象になっていません。

### Valgrind (memcheck) {#valgrind-memcheck}

以前は Valgrind を使って機能テストを一晩かけて実行していましたが、現在は行っていません。
この処理には数時間を要します。
現在、`re2` ライブラリに 1 件の既知の誤検知があり、[この記事](https://research.swtch.com/sparse)を参照してください。

## ファジング {#fuzzing}

ClickHouse のファジングは、[libFuzzer](https://llvm.org/docs/LibFuzzer.html) とランダムな SQL クエリの両方を用いて実装されています。
すべてのファジングテストは、サニタイザ（Address と Undefined）を有効にした状態で実行する必要があります。

LibFuzzer は、ライブラリコードに対する個別のファジングテスト（fuzzer）に使用されます。
fuzzer はテストコードの一部として実装されており、名前に "_fuzzer" という接尾辞が付きます。
fuzzer の例は `src/Parsers/fuzzers/lexer_fuzzer.cpp` にあります。
LibFuzzer 固有の設定、辞書、およびコーパスは `tests/fuzz` に保存されています。
ユーザー入力を扱うすべての機能について、ファジングテストを作成することを推奨します。

fuzzer はデフォルトではビルドされません。
fuzzer をビルドするには、`-DENABLE_FUZZING=1` と `-DENABLE_TESTS=1` の両方のオプションを指定する必要があります。
fuzzer をビルドするときは Jemalloc を無効にすることを推奨します。
ClickHouse のファジングを Google OSS-Fuzz に統合するための設定は `docker/fuzz` にあります。

また、単純なファジングテストを用いてランダムな SQL クエリを生成し、サーバーがそれらを実行してもクラッシュしないことを確認しています。
これは `00746_sql_fuzzy.pl` にあります。
このテストは継続的に（夜通し、あるいはそれ以上の期間）実行する必要があります。

さらに、多数のコーナーケースを検出できる、高度な AST ベースのクエリ fuzzer も使用しています。
これはクエリの AST に対してランダムな順列および置換を行います。
以前のテストから AST ノードを記憶しておき、それらを後続テストのファジングに使用しつつ、ランダムな順序で処理します。
この fuzzer の詳細については、[このブログ記事](https://clickhouse.com/blog/fuzzing-click-house)を参照してください。

## ストレステスト {#stress-test}

ストレステストは、ファジングの一種です。
単一のサーバー上で、すべての機能テストをランダムな順序で並列に実行します。
テスト結果そのものは検証しません。

次の点が検証されます:
- サーバーがクラッシュせず、デバッグ用トラップやサニタイザーのトラップが発生しないこと。
- デッドロックが発生しないこと。
- データベース構造の整合性が保たれていること。
- テスト後にサーバーが正常に停止でき、その後も例外なく再起動できること。

Debug、ASan、TSan、MSan、UBSan の 5 種類の実行形態があります。

## スレッドファザー {#thread-fuzzer}

Thread Fuzzer（Thread Sanitizer と混同しないでください）は、スレッドの実行順序をランダム化する別種のファジング手法です。
これにより、さらに多くの特殊なケースを検出するのに役立ちます。

## セキュリティ監査 {#security-audit}

当社のセキュリティチームは、セキュリティの観点から ClickHouse の機能について基本的な評価を実施しました。

## 静的解析ツール {#static-analyzers}

`clang-tidy` を各コミットごとに実行しています。
`clang-static-analyzer` のチェックも有効にしています。
`clang-tidy` は一部のスタイルチェックにも使用しています。

`clang-tidy`、`Coverity`、`cppcheck`、`PVS-Studio`、`tscancode`、`CodeQL` を評価済みです。
使用方法については `tests/instructions/` ディレクトリを参照してください。

IDE として `CLion` を使用している場合は、一部の `clang-tidy` チェックをそのまま利用できます。

シェルスクリプトの静的解析には `shellcheck` も使用しています。

## ハードニング {#hardening}

デバッグビルドでは、ユーザーレベルのメモリアロケーションに対して ASLR を行うカスタムアロケータを使用しています。

また、割り当て後に読み取り専用であることが想定されるメモリ領域を手動で保護しています。

デバッグビルドでは、さらに「有害」（古い・安全でない・スレッドセーフでない）関数が呼び出されないことを保証する、`libc` のカスタマイズも行っています。

デバッグアサーションを広範に使用しています。

デバッグビルドでは、「logical error」コード（バグを意味する）を持つ例外がスローされた場合、プログラムを即座に異常終了させます。
これにより、リリースビルドでは例外を使用しつつ、デバッグビルドではそれをアサーションとして扱うことができます。

デバッグビルドでは、`jemalloc` のデバッグ版を使用しています。
デバッグビルドでは、`libc++` のデバッグ版を使用しています。

## 実行時の整合性チェック {#runtime-integrity-checks}

ディスク上に保存されるデータにはチェックサムが計算されています。
MergeTree テーブル内のデータは、3 つの方法（圧縮されたデータブロック、非圧縮のデータブロック、ブロック全体にわたる合計チェックサム）で同時にチェックサムが計算されます*。
クライアントとサーバー間、あるいはサーバー間でネットワーク経由で転送されるデータにもチェックサムが計算されています。
レプリケーションにより、レプリカ間でビットレベルまで同一のデータが保証されます。

こうした仕組みは、故障したハードウェアからデータを保護するために不可欠です（ストレージ媒体上でのビットロット、サーバーの RAM におけるビット反転、ネットワークコントローラーの RAM におけるビット反転、ネットワークスイッチの RAM におけるビット反転、クライアントの RAM におけるビット反転、通信線上でのビット反転など）。
ビット反転はよく発生する現象であり、ECC RAM を使用していても、また TCP チェックサムが存在していても発生し得ることに注意してください（毎日ペタバイト級のデータを処理するサーバーを何千台も運用している場合など）。
[動画（ロシア語）はこちら](https://www.youtube.com/watch?v=ooBAQIe0KlQ)。

ClickHouse は、運用担当エンジニアが故障したハードウェアを特定するのに役立つ診断機能を提供します。

\* しかも遅くありません。

## コードスタイル {#code-style}

コードスタイルのルールは[こちら](style.md)に記載されています。

よくあるスタイル違反をチェックするには、`utils/check-style` スクリプトを使用できます。

コードを所定のスタイルに自動整形するには、`clang-format` を使用できます。
`.clang-format` ファイルはソースのルートにあります。
実際のコードスタイルをほぼ反映した内容になっています。
ただし、既存ファイルに対して `clang-format` を適用することは推奨されません。フォーマットがかえって悪化するためです。
代わりに、`clang` のソースリポジトリにある `clang-format-diff` ツールを使用できます。

別の方法として、コードを再フォーマットするために `uncrustify` ツールを試すこともできます。
設定はソースのルートにある `uncrustify.cfg` にあります。
ただし、こちらは `clang-format` ほど十分にはテストされていません。

`CLion` には独自のコードフォーマッタがあり、当プロジェクトのコードスタイルに合わせてチューニングする必要があります。

また、コード内のタイポを検出するために `codespell` も使用しています。
これも自動化されています。

## テストカバレッジ {#test-coverage}

テストカバレッジも、機能テストかつ clickhouse-server を対象とするものに限って計測しています。
これは日次で実施しています。

## テスト用のテスト {#tests-for-tests}

不安定なテストを検出するための自動チェックが行われます。
すべての新しいテストは、機能テストの場合は 100 回、統合テストの場合は 10 回実行されます。
少なくとも 1 回でも失敗したテストは、不安定なテスト（flaky）と見なされます。

## テストの自動化 {#test-automation}

[GitHub Actions](https://github.com/features/actions) を使ってテストを実行しています。

ビルドジョブとテストは、各コミットごとにサンドボックス環境で実行されます。
生成されたパッケージとテスト結果は GitHub に公開され、直接リンクからダウンロードできます。
アーティファクトは数か月間保存されます。
GitHub でプルリクエストを送信すると、それに「can be tested」というタグを付け、CI システムが ClickHouse パッケージ（release、debug、address sanitizer 有効版など）をビルドします。
