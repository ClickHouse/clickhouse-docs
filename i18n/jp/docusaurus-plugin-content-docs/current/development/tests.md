---
description: 'ClickHouseのテストおよびテストスイートの実行方法ガイド'
sidebar_label: 'テスト'
sidebar_position: 40
slug: '/development/tests'
title: 'ClickHouseのテスト'
---

# Testing ClickHouse

## Functional Tests {#functional-tests}

Functional testsは最もシンプルで使いやすいテストです。
ほとんどのClickHouseの機能はfunctional testsを使用してテストでき、テスト可能なClickHouseコードの変更に対しては必須です。

各functional testは、実行中のClickHouseサーバーに1つ以上のクエリを送り、結果をリファレンスと比較します。

テストは`queries`ディレクトリにあります。
サブディレクトリは2つあり、`stateless`と`stateful`です。
- Stateless testsは事前にロードされたテストデータなしでクエリを実行します - テスト自体内で小さな合成データセットをその場で作成することがよくあります。
- Stateful testsはClickHouseからの事前にロードされたテストデータを必要とし、一般公開されています。[stateful test in continuous integration](continuous-integration.md#functional-stateful-tests)を参照してください。

各テストは、`.sql`と`.sh`の2つのタイプのいずれかです。
- `.sql`テストは、`clickhouse-client`にパイプされるシンプルなSQLスクリプトです。
- `.sh`テストは、自身で実行されるスクリプトです。

SQLテストは一般的に`.sh`テストよりも望まれます。
純粋なSQLからは動作しない機能をテストする必要がある場合のみ、`.sh`テストを使用するべきです。例えば、`clickhouse-client`に入力データをパイプする場合や、`clickhouse-local`をテストする場合です。

:::note
`DateTime`型と`DateTime64`型をテストする際の一般的な間違いは、サーバーが特定のタイムゾーン（例："UTC"）を使用していると仮定することです。これは事実ではなく、CIテストの実行中のタイムゾーンは故意にランダム化されています。テスト値に対してタイムゾーンを明示的に指定するのが最も簡単な回避策です。例:`toDateTime64(val, 3, 'Europe/Amsterdam')`。
:::

### Running a Test Locally {#running-a-test-locally}

ClickHouseサーバーをローカルで開始し、デフォルトポート（9000）でリッスンします。
例えば、テスト`01428_hash_set_nan_key`を実行するには、リポジトリフォルダーに移動し、次のコマンドを実行します。

```sh
PATH=<path to clickhouse-client>:$PATH tests/clickhouse-test 01428_hash_set_nan_key
```

テスト結果（`stderr`および`stdout`）は、テスト自体の隣にあるファイル`01428_hash_set_nan_key.[stderr|stdout]`に書き込まれます（`queries/0_stateless/foo.sql`の場合、出力は`queries/0_stateless/foo.stdout`にあります）。

`tests/clickhouse-test --help`を参照して、`clickhouse-test`のすべてのオプションを確認してください。
すべてのテストを実行するか、テスト名のフィルタを提供することでテストのサブセットを実行できます：`./clickhouse-test substring`。
テストを並行して実行するためのオプションや、ランダム順序で実行するオプションもあります。

### Adding a New Test {#adding-a-new-test}

新しいテストを追加するには、まず`queries/0_stateless`ディレクトリに`.sql`または`.sh`ファイルを作成します。
次に、`clickhouse-client < 12345_test.sql > 12345_test.reference`または`./12345_test.sh > ./12345_test.reference`を使用して、対応する`.reference`ファイルを生成します。

テストは、事前に自動で作成されるデータベース`test`内で、テーブルを作成、削除、選択するのみとしてください。
一時テーブルを使用することは問題ありません。

CIと同じ環境をローカルにセットアップするには、テスト設定をインストールします（これによりZookeeperのモック実装が使用され、一部の設定が調整されます）。

```sh
cd <repository>/tests/config
sudo ./install.sh
```

:::note
テストは次の条件を満たさなければなりません：
- 最小限であること：必要最小限のテーブル、カラム、および複雑さを作成するのみ
- 迅速であること：数秒を超えないこと（できればサブセカンドで）
- 正確かつ決定論的であること：テスト機能が正しく動作しない場合にのみ失敗する
- 隔離されている/ステートレスであること：環境やタイミングに依存しない
- 包括的であること：ゼロ、null、空のセット、例外（負のテスト、構文`-- { serverError xyz }`や`-- { clientError xyz }`を使用）などのコーナーケースをカバーする
- テストの最後にテーブルをクリーンアップすること（残り物があれば）
- 他のテストが同じものをテストしないことを確認すること（つまり、最初にgrepすること）。
:::

### Restricting test runs {#restricting-test-runs}

テストには、CIでの実行コンテキストを制限するための0個以上の _tags_ を持たせることができます。

`.sql`テストの場合、タグは最初の行にSQLコメントとして置かれます。

```sql
-- Tags: no-fasttest, no-replicated-database
-- no-fasttest: <provide_a_reason_for_the_tag_here>
-- no-replicated-database: <provide_a_reason_here>

SELECT 1
```

`.sh`テストの場合、タグは2行目のコメントとして書かれます。

```bash
#!/usr/bin/env bash

# Tags: no-fasttest, no-replicated-database

# - no-fasttest: <provide_a_reason_for_the_tag_here>

# - no-replicated-database: <provide_a_reason_here>
```

利用可能なタグのリスト：

|タグ名 | 説明 | 使用例 |
|---|---|---|
| `disabled`|  テストは実行されません ||
| `long` | テストの実行時間は1分から10分に延長されます ||
| `deadlock` | テストは長時間ループで実行されます ||
| `race` | `deadlock`と同じ。`deadlock`を優先してください ||
| `shard` | サーバーは`127.0.0.*`をリッスンする必要があります ||
| `distributed` | `shard`と同じ。`shard`を優先してください ||
| `global` | `shard`と同じ。`shard`を優先してください ||
| `zookeeper` | テストを実行するためにZookeeperまたはClickHouse Keeperが必要です | テストは`ReplicatedMergeTree`を使用します |
| `replica` | `zookeeper`と同じ。`zookeeper`を優先してください ||
| `no-fasttest`|  [Fast test](continuous-integration.md#fast-test)の下でテストは実行されません | テストはFast testで無効にされている`MySQL`テーブルエンジンを使用します |
| `no-[asan, tsan, msan, ubsan]` | [sanitizers](#sanitizers)を使用したビルドでテストを無効にします | テストはQEMUで実行されますが、sanitizersでは動作しません |
| `no-replicated-database` |||
| `no-ordinary-database` |||
| `no-parallel` | このテストと並行して他のテストを無効にします | テストは`system`テーブルから読み取るため、無変則が崩れる可能性があります |
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

上記の設定に加えて、特定のClickHouse機能の使用を定義するために、`system.build_options`から`USE_*`フラグを使用できます。
例えば、テストがMySQLテーブルを使用する場合、`use-mysql`タグを追加するべきです。

### Specifying limits for random settings {#specifying-limits-for-random-settings}

テストは、テスト実行中にランダム化可能な設定の最小および最大許容値を指定できます。

`.sh`テストの場合、制限はタグの隣の行や、タグが指定されていない場合の2行目にコメントとして書かれます。

```bash
#!/usr/bin/env bash

# Tags: no-fasttest

# Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
```

`.sql`テストの場合、タグはタグの隣の行や最初の行にSQLコメントとして置かれます。

```sql
-- Tags: no-fasttest
-- Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
SELECT 1
```

制限が一つのみを指定する必要がある場合、もう一つには`None`を使用できます。

### Choosing the Test Name {#choosing-the-test-name}

テスト名は、5桁のプレフィックスで始まり、続いて説明的な名前が付きます。例えば`00422_hash_function_constexpr.sql`のように。
プレフィックスを選択するには、ディレクトリに既に存在する最大のプレフィックスを見つけ、それを1増やします。

```sh
ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
```

その間に、同じ数値のプレフィックスを持つ他のテストが追加される場合がありますが、これは問題なく、後で変更する必要はありません。

### Checking for an Error that Must Occur {#checking-for-an-error-that-must-occur}

時には、誤ったクエリに対してサーバーエラーが発生することをテストしたいことがあります。このための特別な注釈をSQLテストでサポートしています。次の形式です。

```sql
select x; -- { serverError 49 }
```

このテストは、サーバーが未知のカラム`x`についてエラーコード49を返すことを保証します。
エラーがない場合や、エラーが異なる場合、テストは失敗します。
クライアント側でエラーが発生することを確認するには、`clientError`注釈を使用してください。

エラーメッセージの特定の表現を確認しないでください。それは将来的に変更される可能性があり、テストが不必要に壊れることになります。
エラーコードのみを確認します。
既存のエラーコードがあなたのニーズに合わない場合は、新しいものを追加することを検討してください。

### Testing a Distributed Query {#testing-a-distributed-query}

functional testsで分散クエリを使用する場合は、サーバーが自身をクエリするために`127.0.0.{1..2}`アドレスを持つ`remote`テーブル関数を活用できます。または、`test_shard_localhost`のようなサーバー構成ファイル内の事前定義されたテストクラスタを使用することもできます。
テスト名に`shard`または`distributed`という言葉を追加して、CIで正しい構成で実行されるようにしてください。サーバーは分散クエリをサポートするように構成されています。

### Working with Temporary Files {#working-with-temporary-files}

時にはシェルテストで作業するためにその場でファイルを作成する必要があります。
いくつかのCIチェックがテストを並行して実行するため、スクリプト内でユニークな名前なしで一時ファイルを作成または削除すると、FlakyなどのCIチェックが失敗する可能性があります。
これを回避するために、環境変数`$CLICKHOUSE_TEST_UNIQUE_NAME`を使用して、一時ファイルにそのテストにユニークな名前を付けるべきです。
これにより、セットアップ中に作成したりクリーンアップ中に削除するファイルが、そのテストでのみ使用されているものであり、並行して実行されている他のテストによるものではないことが保証されます。

## Known Bugs {#known-bugs}

再現可能なバグが知られている場合、準備されたfunctional testsを`tests/queries/bugs`ディレクトリに配置します。
これらのテストは、バグが修正されたときに`tests/queries/0_stateless`に移動されます。

## Integration Tests {#integration-tests}

Integration testsは、クラスタ構成でClickHouseをテストし、MySQL、Postgres、MongoDBなどの他のサーバーとの相互作用をテストすることを可能にします。
ネットワーク分割、パケット破損などをエミュレートするのに便利です。
これらのテストはDockerの下で実行され、さまざまなソフトウェアを持つ複数のコンテナを作成します。

これらのテストを実行する方法については、`tests/integration/README.md`を参照してください。

ClickHouseとサードパーティのドライバとの統合はテストされていないことに注意してください。
また、現在のところ、JDBCおよびODBCドライバとの統合テストもありません。

## Unit Tests {#unit-tests}

Unit testsは、ClickHouse全体をテストしたいのではなく、単一の孤立したライブラリまたはクラスをテストしたいときに便利です。
テストのビルドを有効または無効にするには、`ENABLE_TESTS` CMakeオプションを使用します。
Unit tests（および他のテストプログラム）は、コード全体の`tests`サブディレクトリにあります。
Unit testsを実行するには、`ninja test`と入力します。
一部のテストは`gtest`を使用しますが、テスト失敗時に非ゼロの終了コードを返す単なるプログラムもあります。

コードがすでにfunctional testsでカバーされている場合、unit testsを持つ必要はありません（functional testsは通常、はるかにシンプルに使用できます）。

個々のgtestチェックを直接実行可能ファイルを呼び出して実行できます。例えば：

```bash
$ ./src/unit_tests_dbms --gtest_filter=LocalAddress*
```

## Performance Tests {#performance-tests}

Performance testsは、合成クエリに対してClickHouseのいくつかの孤立した部分のパフォーマンスを測定および比較することを可能にします。
Performance testsは`tests/performance/`にあります。
各テストは、テストケースの説明を含む`.xml`ファイルによって表されます。
テストは`docker/test/performance-comparison`ツールを使用して実行されます。呼び出しについてはREADMEファイルを参照してください。

各テストは、一度に1つ以上のクエリ（パラメータの組み合わせを含む可能性があります）をループ内で実行します。

特定のシナリオでClickHouseのパフォーマンスを向上させることを望んでおり、改善が単純なクエリで観察可能な場合は、パフォーマンステストを書くことが強く推奨されます。
また、比較的孤立していてあまり obscure でないSQL関数を追加および変更するときも、パフォーマンステストを書くことが推奨されます。
テスト中に`perf top`や他の`perf`ツールを使用することが常に意味を持ちます。

## Test Tools and Scripts {#test-tools-and-scripts}

`tests`ディレクトリ内の一部のプログラムは準備されたテストではなく、テストツールです。
例えば、`Lexer`のためのツール`src/Parsers/tests/lexer`は、標準入力のトークン化を行い、色付きの結果を標準出力に書き込みます。
これらの種のツールをコードの例や探求、手動テストのために使用できます。

## Miscellaneous Tests {#miscellaneous-tests}

`tests/external_models`には機械学習モデルのテストがあります。
これらのテストは更新されず、統合テストに移動する必要があります。

クオラム挿入に対する別のテストがあります。
このテストは、Separate serversでClickHouseクラスターを実行し、ネットワーク分割、パケット破損（ClickHouseノード間、ClickHouseとZookeeper間、ClickHouseサーバーとクライアント間など）、`kill -9`、`kill -STOP`、`kill -CONT`などのさまざまな障害ケースをエミュレートします。この後、すべての確認された挿入が書き込まれ、拒否された挿入がされなかったことをチェックします。

クオラムテストは、ClickHouseがオープンソースとされる前に、別のチームによって書かれました。
このチームはもはやClickHouseのメンテナンスを行っていません。
テストは偶然にもJavaで書かれました。
これらの理由から、クオラムテストは再記述され、統合テストに移動する必要があります。

## Manual Testing {#manual-testing}

新しい機能を開発しているときは、手動でテストすることも理にかなっています。
以下の手順で行うことができます：

ClickHouseをビルドします。ターミナルからClickHouseを実行します：ディレクトリを`programs/clickhouse-server`に変更し、`./clickhouse-server`を実行します。これにより、デフォルトで現在のディレクトリから設定（`config.xml`、`users.xml`および`config.d`および`users.d`ディレクトリ内のファイル）が使用されます。ClickHouseサーバーに接続するには、`programs/clickhouse-client/clickhouse-client`を実行します。

すべてのclickhouseツール（サーバー、クライアントなど）は、`clickhouse`という単一のバイナリへのシンボリックリンクに過ぎません。
このバイナリは`programs/clickhouse`にあります。
すべてのツールも、`clickhouse tool`のように呼び出すことができます。

もしくは、ClickHouseパッケージをインストールすることもできます：ClickHouseリポジトリからの安定版リリース、もしくはClickHouseソースのルートで`./release`を使って自身用のパッケージをビルドできます。
その後、`sudo clickhouse start`（またはサーバーを停止するには`sudo clickhouse stop`）でサーバーを開始します。
ログは`/etc/clickhouse-server/clickhouse-server.log`にあります。

システムにClickHouseがすでにインストールされている場合、新しい`clickhouse`バイナリをビルドし、既存のバイナリを置き換えることができます。

```bash
$ sudo clickhouse stop
$ sudo cp ./clickhouse /usr/bin/
$ sudo clickhouse start
```

また、システムのclickhouse-serverを停止し、同じ設定でログがターミナルに出力されるように独自のClickHouseサーバーを実行できます。

```bash
$ sudo clickhouse stop
$ sudo -u clickhouse /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

gdbを使った例：

```bash
$ sudo -u clickhouse gdb --args /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

システムのclickhouse-serverがすでに実行中で停止したくない場合は、`config.xml`内のポート番号を変更するか（または`config.d`ディレクトリ内のファイルで上書きし）、適切なデータパスを提供して実行できます。

`clickhouse`バイナリはほとんど依存関係がなく、さまざまなLinuxディストリビューションで動作します。
サーバーで変更を迅速かつ簡単にテストするには、単に新しくビルドされた`clickhouse`バイナリをサーバーに`scp`し、上記の例のように実行できます。

## Build Tests {#build-tests}

Build testsは、さまざまな代替構成といくつかの外国システムでビルドが壊れていないことを確認するために使用されます。
これらのテストは自動化されています。

例：
- Darwin x86_64のためのクロスコンパイル（macOS）
- FreeBSD x86_64のためのクロスコンパイル
- Linux AArch64のためのクロスコンパイル
- システムパッケージからのライブラリを使用してUbuntuでビルド（推奨されません）
- ライブラリの共有リンクを使用してビルド（推奨されません）

例えば、システムパッケージを使用したビルドは悪いプラクティスです。なぜなら、システムが持っているパッケージの正確なバージョンを保証できないからです。
しかし、これはDebianのメンテナンスにとって非常に必要です。
このため、少なくともこのビルドバリアントをサポートする必要があります。
別の例：共有リンクは、一般的に問題の源ですが、一部の愛好家には必要です。

すべてのビルドバリアントですべてのテストを実行できるわけではありませんが、さまざまなビルドバリアントが壊れていないことを少なくとも確認したいと考えています。
この目的で、ビルドテストを使用します。

また、コンパイルに時間がかかりすぎるか、RAMを過剰に必要とする翻訳単位がないこともテストしています。

さらに、大きすぎるスタックフレームがないこともテストしています。

## Testing for Protocol Compatibility {#testing-for-protocol-compatibility}

ClickHouseのネットワークプロトコルを拡張する際に、古いclickhouse-clientが新しいclickhouse-serverと動作すること、新しいclickhouse-clientが古いclickhouse-serverと動作することを手動でテストします（対応するパッケージのバイナリを実行することで）。

私たちはまた、統合テストで自動的にいくつかのケースをテストします：
- 古いバージョンのClickHouseによって書き込まれたデータが新しいバージョンによって正常に読み込めるかどうか。
- 異なるClickHouseバージョンでのクラスター内で分散クエリが正常に動作するかどうか。

## Help from the Compiler {#help-from-the-compiler}

主要なClickHouseコード（`src`ディレクトリにあります）は、`-Wall -Wextra -Werror`でビルドされ、いくつかの追加の警告が有効化されています。
ただし、これらのオプションはサードパーティのライブラリには有効化されていません。

Clangにはさらに役立つ警告が多数あり、これらを`-Weverything`で検索し、デフォルトビルド用に選択できます。

私たちは常にClangを使用してClickHouseをビルドしており、開発や生産のために使用します。
あなた自身のマシンでデバッグモードでビルドができるが（ノートパソコンのバッテリーを節約するため）、コンパイラは`-O3`でのビルドにおいてより多くの警告を生成できることに注意してください。理由は、制御フローと手続き間解析がより良く行われるからです。
デバッグモードでClangでビルドする際には、デバッグバージョンの`libc++`が使用され、実行時のエラーをより多くキャッチできるようになります。

## Sanitizers {#sanitizers}

:::note
ローカルで実行する際に、ClickHouseサーバーまたはクライアントが起動時にクラッシュする場合、アドレス空間配置のランダマイズを無効にする必要があるかもしれません：`sudo sysctl kernel.randomize_va_space=0`
:::

### Address sanitizer {#address-sanitizer}

私たちは、ASan下で機能テスト、統合テスト、ストレステスト、ユニットテストをコミットごとに実行しています。

### Thread sanitizer {#thread-sanitizer}

私たちは、TSan下で機能テスト、統合テスト、ストレステスト、ユニットテストをコミットごとに実行しています。

### Memory sanitizer {#memory-sanitizer}

私たちは、MSan下で機能テスト、統合テスト、ストレステスト、ユニットテストをコミットごとに実行しています。

### Undefined behaviour sanitizer {#undefined-behaviour-sanitizer}

私たちは、UBSan下で機能テスト、統合テスト、ストレステスト、ユニットテストをコミットごとに実行しています。
いくつかのサードパーティライブラリのコードはUBに対してsanitizeされていません。

### Valgrind (Memcheck) {#valgrind-memcheck}

以前はValgrind下で夜間に機能テストを実行していましたが、現在はこれを行っていません。
複数の時間がかかります。
現在、`re2`ライブラリに1つの既知の偽陽性があります。詳細は[この記事](https://research.swtch.com/sparse)を参照してください。

## Fuzzing {#fuzzing}

ClickHouseのファジングは、[libFuzzer](https://llvm.org/docs/LibFuzzer.html)とランダムSQLクエリの両方を使用して実装されています。
すべてのファジングテストはサニタイザー（AddressとUndefined）で実行する必要があります。

LibFuzzerはライブラリコードの孤立したファジングテストに使用されます。
ファジングプログラムはテストの一部として実装され、"_fuzzer"という名前の接尾辞が付けられます。
ファジングの例は`src/Parsers/fuzzers/lexer_fuzzer.cpp`にあります。
LibFuzzer固有の構成、辞書、およびコーパスは`tests/fuzz`に保存されています。
ユーザー入力を処理するすべての機能に対してファジングテストを書くことを推奨します。

ファジングプログラムはデフォルトではビルドされません。
ファジングプログラムをビルドするには、`-DENABLE_FUZZING=1`および`-DENABLE_TESTS=1`の両方のオプションを設定する必要があります。
ファジングプログラムをビルド中にJemallocを無効にすることを推奨します。
ClickHouseファジングをGoogle OSS-Fuzzに統合するために使用される構成は、`docker/fuzz`にあります。

また、ランダムなSQLクエリを生成し、サーバーがそれを実行中にクラッシュしないことを確認するための単純なファジングテストも使用します。
このテストは`00746_sql_fuzzy.pl`にあります。
このテストは継続的に（夜間およびそれ以降）実行するべきです。

さらに、ASTに基づく高度なクエリファジングプログラムを使用して、大量のコーナーケースを発見できるようにしています。
それは、クエリAST内でのランダムな順列と置換を行います。
それは、前のテストからのASTノードを覚えて次のテストのファジングに使用します。処理中のランダム順序で。
このファジングプログラムについての詳細は、[このブログ記事](https://clickhouse.com/blog/fuzzing-click-house)で学ぶことができます。

## Stress test {#stress-test}

ストレステストは、ファジングの別のケースです。
各functional testを単一のサーバーでランダムな順序で並行実行します。
テストの結果はチェックされません。

次のことが確認されます：
- サーバーがクラッシュせず、デバッグまたはサニタイザーのトラップがトリガーされないこと；
- デッドロックがないこと；
- データベース構造が一貫していること；
- テスト後、サーバーは正常に停止し、例外なしで再起動できること。

5つの異なるバリエーションがあります（Debug、ASan、TSan、MSan、UBSan）。

## Thread Fuzzer {#thread-fuzzer}

Thread Fuzzer（Thread Sanitizerと混同しないでください）は、スレッドの実行順序をランダム化する別の種類のファジングで、さらに特殊なケースを見つけるのに役立ちます。

## Security Audit {#security-audit}

私たちのセキュリティチームは、セキュリティの観点からClickHouseの能力を基本的にレビューしました。

## Static Analyzers {#static-analyzers}

私たちは、コミットごとに`clang-tidy`を実行しています。
`clang-static-analyzer`のチェックも有効です。
`clang-tidy`は、一部のスタイルチェックにも使用されます。

私たちは`clang-tidy`、`Coverity`、`cppcheck`、`PVS-Studio`、`tscancode`、`CodeQL`を評価しました。
使用のための指示は`tests/instructions/`ディレクトリにあります。

`CLion`をIDEとして使用する場合、すぐに利用できる`clang-tidy`のチェックを活用できます。

また、シェルスクリプトの静的分析には`shellcheck`を使用しています。

## Hardening {#hardening}

デバッグビルドでは、ユーザーレベルの割り当てのASLRを行うカスタムアロケータを使用しています。

さらに、割り当て後に読み取り専用であることが期待されるメモリ領域も手動で保護しています。

デバッグビルドでは、呼び出される危険な（時代遅れ、不安全、スレッドセーフでない）関数が呼び出されないように、libcのカスタマイズも含めています。

デバッグアサーションは広範に使用されています。

デバッグビルドでは、「論理エラー」コードの例外がスローされると、プログラムが早期に終了します。
これにより、リリースビルドで例外を使用できますが、デバッグビルドではアサーションとして扱われます。

デバッグビルドにはjemallocのデバッグバージョンが使用されます。
デバッグビルドにはlibc++のデバッグバージョンが使用されます。

## Runtime Integrity Checks {#runtime-integrity-checks}

ディスク上に保存されるデータはチェックサムが付与されています。
MergeTreeテーブルのデータは、三つの方法で同時にチェックサムが付与されています（圧縮データブロック、非圧縮データブロック、ブロック全体の合計チェックサム）。
クライアントとサーバー間またはサーバー間でネットワークを通じて転送されるデータにもチェックサムが付与されています。
レプリケーションはレプリカ上のビット同一のデータを保証します。

これはハードウェアの故障（ストレージ媒体のビット劣化、サーバーのRAMのビット反転、ネットワークコントローラのRAMのビット反転、ネットワークスイッチのRAMのビット反転、クライアントのRAMのビット反転、回線上のビット反転）から保護するために必要です。
ビット反転は一般的であり、ECC RAMやTCPチェックサムがある場合でも発生する可能性が高いことに注意してください（ペタバイトのデータを処理している何千ものサーバーを実行している場合）。
[このビデオ（ロシア語）](https://www.youtube.com/watch?v=ooBAQIe0KlQ)。

ClickHouseは、運用エンジニアが故障したハードウェアを見つけるのに役立つ診断を提供します。

\* そしてそれは遅くありません。

## Code Style {#code-style}

コードスタイルルールは[こちら](style.md)に記載されています。

一般的なスタイル違反をチェックするために、`utils/check-style`スクリプトを使用できます。

コードのスタイルを強制するために、`clang-format`を使用できます。
ファイル`.clang-format`はソースのルートにあります。
それはほとんど私たちの実際のコードスタイルに対応しています。
しかし、既存のファイルに対して`clang-format`を適用することは推奨されません。なぜならフォーマットが悪化するからです。
代わりに、clangのソースリポジトリ内にある`clang-format-diff`ツールを使用できます。

また、コードを再フォーマットするために`uncrustify`ツールを試すこともできます。
設定はソースのルートにある`uncrustify.cfg`にあります。
これは`clang-format`よりもテストされていません。

`CLion`には独自のコードフォーマッタがあり、私たちのコードスタイルのために調整する必要があります。

私たちはまた、コード内のタイプミスを見つけるために`codespell`を使用しています。
これも自動化されています。

## Test Coverage {#test-coverage}

私たちはテストカバレッジを追跡していますが、functional testsのみに対して、かつclickhouse-serverのみに対して行います。
これは日次で実行されます。

## Tests for Tests {#tests-for-tests}

フレークテストのチェックが自動化されています。
すべての新しいテストを100回（functional testsの場合）または10回（integration testsの場合）実行します。
少なくとも1回でもテストが失敗した場合、それはフレークと見なされます。

## Test Automation {#test-automation}

私たちは[GitHub Actions](https://github.com/features/actions)を使用してテストを実行します。

ビルドジョブとテストは、コミットごとにSandboxで実行されます。
結果として得られるパッケージとテスト結果はGitHubに公開され、直接リンクでダウンロードできます。
アーティファクトは数ヶ月保存されます。
GitHubでプルリクエストを送信すると、「テスト可能」とタグ付けされ、私たちのCIシステムがClickHouseパッケージ（リリース、デバッグ、アドレスサニタイザー付きなど）をあなたのためにビルドします。
