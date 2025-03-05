---
slug: /development/continuous-integration
sidebar_position: 55
sidebar_label: Continuous Integration (CI)
---


# Continuous Integration (CI)

プルリクエストを送信すると、ClickHouseの[継続的インテグレーション (CI) システム](tests.md#test-automation)によってあなたのコードに対していくつかの自動チェックが実行されます。  
これは、リポジトリのメンテナー（ClickHouseチームの誰か）があなたのコードを確認し、プルリクエストに`can be tested`ラベルを追加した後に行われます。  
チェックの結果は、[GitHubのチェックドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)で説明されているように、GitHubのプルリクエストページにリストされます。  
チェックが失敗した場合、修正が必要になる場合があります。  
このページでは、遭遇する可能性のあるチェックの概要と、それらを修正するためにできることを説明します。

チェック失敗があなたの変更に関連していないように見える場合、それは一時的な失敗やインフラストラクチャの問題である可能性があります。  
プルリクエストに空のコミットをプッシュしてCIチェックを再起動します：

```shell
git reset
git commit --allow-empty
git push
```

何をすべきか不明な場合は、メンテナーに助けを求めてください。

## Merge with Master {#merge-with-master}

PRがmasterにマージできるかどうかを検証します。  
できない場合、`Cannot fetch mergecommit`というメッセージとともに失敗します。  
このチェックを修正するには、[GitHubのドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github)に従ってコンフリクトを解決するか、`master`ブランチをあなたのプルリクエストブランチにマージしてください。

## Docs check {#docs-check}

ClickHouseのドキュメントウェブサイトをビルドしようとします。  
ドキュメントに何か変更があった場合、失敗することがあります。  
最も可能性が高い理由は、ドキュメント内のいくつかのクロスリンクが誤っていることです。  
チェックレポートに移動し、`ERROR`と`WARNING`メッセージを探してください。

## Description Check {#description-check}

あなたのプルリクエストの説明が[PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md)のテンプレートに従っていることをチェックします。  
変更のためのチェンジログカテゴリーを指定し（例：Bug Fix）、[CHANGELOG.md](../whats-new/changelog/index.md)に対して変更を説明するユーザーフレンドリーなメッセージを書かなければなりません。

## Push To DockerHub {#push-to-dockerhub}

ビルドとテストに使用されるdocker imagesをビルドし、次にそれらをDockerHubにプッシュします。

## Marker Check {#marker-check}

このチェックは、CIシステムがプルリクエストの処理を開始したことを意味します。  
'pending'ステータスのときは、すべてのチェックがまだ開始されていないことを意味します。  
すべてのチェックが開始された後、ステータスが'success'に変更されます。

## Style Check {#style-check}

[`utils/check-style/check-style`](https://github.com/ClickHouse/ClickHouse/blob/master/utils/check-style/check-style)バイナリを使用して、コードスタイルの簡単なregexベースのチェックを実行します（ローカルでも実行可能です）。  
失敗した場合は、[コードスタイルガイド](style.md)に従ってスタイルエラーを修正してください。

#### Running style check locally: {#running-style-check-locally}

```sh
mkdir -p /tmp/test_output

# すべてのチェックを実行
python3 tests/ci/style_check.py --no-push


# 指定されたチェックスクリプトを実行（例：./check-mypy）
docker run --rm --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output -u $(id -u ${USER}):$(id -g ${USER}) --cap-add=SYS_PTRACE --entrypoint= -w/ClickHouse/utils/check-style clickhouse/style-test ./check-mypy


# ディレクトリ内のすべてのスタイルチェックスクリプトを見つける:
cd ./utils/check-style


# 重複インクルードをチェック
./check-duplicate-includes.sh


# C++フォーマットをチェック
./check-style


# blackでpythonフォーマットをチェック
./check-black


# mypyでpython型ヒントをチェック
./check-mypy


# flake8でpythonをチェック
./check-flake8


# codespellでコードをチェック
./check-typos


# ドキュメントのスペルをチェック
./check-doc-aspell


# ホワイトスペースをチェック
./check-whitespaces


# GitHub Actionsワークフローをチェック
./check-workflows


# サブモジュールをチェック
./check-submodules


# shellcheckでシェルスクリプトをチェック
./shellcheck-run.sh
```

## Fast Test {#fast-test}

通常、これはPRに対して最初に実行されるチェックです。  
ClickHouseをビルドし、ほとんどの[ステートレス機能テスト](tests.md#functional-tests)を実行しますが、一部は省略します。  
失敗した場合、それを修正するまでさらなるチェックは開始されません。  
レポートを見てどのテストが失敗したか確認し、[こちら](./development/tests#running-a-test-locally)で説明されているようにローカルで失敗を再現してください。

#### Running Fast Test locally: {#running-fast-test-locally}

```sh
mkdir -p /tmp/test_output
mkdir -p /tmp/fasttest-workspace
cd ClickHouse

# このdockerコマンドは最小限のClickHouseビルドを実行し、FastTestsを対して走らせます
docker run --rm --cap-add=SYS_PTRACE -u $(id -u ${USER}):$(id -g ${USER})  --network=host -e FASTTEST_WORKSPACE=/fasttest-workspace -e FASTTEST_OUTPUT=/test_output -e FASTTEST_SOURCE=/ClickHouse --cap-add=SYS_PTRACE -e stage=clone_submodules --volume=/tmp/fasttest-workspace:/fasttest-workspace --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output clickhouse/fasttest
```

#### Status Page Files {#status-page-files}

- `runlog.out.log`は、すべての他のログを含む一般ログです。
- `test_log.txt`
- `submodule_log.txt`は、必要なサブモジュールのクローンとチェックアウトに関するメッセージを含みます。
- `stderr.log`
- `stdout.log`
- `clickhouse-server.log`
- `clone_log.txt`
- `install_log.txt`
- `clickhouse-server.err.log`
- `build_log.txt`
- `cmake_log.txt`は、C/C++およびLinuxフラグチェックに関するメッセージを含みます。

#### Status Page Columns {#status-page-columns}

- *テスト名*はテストの名前を含みます（パスなし、すべてのタイプのテストが名前にストリップされます）。
- *テストステータス* -- _Skipped_、_Success_、または _Fail_のいずれか。
- *テスト時間、秒* -- このテストでは空です。

## Build Check {#build-check}

さまざまな構成でClickHouseをビルドし、今後のステップに使用します。  
失敗したビルドを修正する必要があります。  
ビルドログには、エラーを修正するために十分な情報が含まれていることが多いですが、ローカルで失敗を再現する必要があるかもしれません。  
`cmake`オプションはビルドログに見つかり、`cmake`でgrepできます。  
これらのオプションを使用して、[一般的なビルドプロセス](../development/build.md)に従ってください。

### Report Details {#report-details}

- **コンパイラ**: `clang-19`、オプションとしてターゲットプラットフォームの名前
- **ビルドタイプ**: `Debug`または`RelWithDebInfo`（cmake）。
- **サニタイザー**: `none`（サニタイザーなし）、`address`（ASan）、`memory`（MSan）、`undefined`（UBSan）、または`thread`（TSan）。
- **ステータス**: `success`または`fail`
- **ビルドログ**: ビルドおよびファイルコピーのログへのリンク、ビルドに失敗した場合に便利です。
- **ビルド時間**。
- **アーティファクト**: ビルド結果ファイル（`XXX`はサーバーバージョン e.g. `20.8.1.4344`）。
  - `clickhouse-client_XXX_amd64.deb`
  - `clickhouse-common-static-dbg_XXX[+asan, +msan, +ubsan, +tsan]_amd64.deb`
  - `clickhouse-common-staticXXX_amd64.deb`
  - `clickhouse-server_XXX_amd64.deb`
  - `clickhouse`: メインのビルドバイナリ。
  - `clickhouse-odbc-bridge`
  - `unit_tests_dbms`: GoogleTestバイナリとClickHouseのユニットテスト。
  - `performance.tar.zst`: パフォーマンステスト用の特別なパッケージ。

## Special Build Check {#special-build-check}

`clang-tidy`を使用して静的分析とコードスタイルチェックを実行します。  
レポートは[ビルドチェック](#build-check)に似ています。ビルドログで見つかったエラーを修正してください。

#### Running clang-tidy locally: {#running-clang-tidy-locally}

便利な`packager`スクリプトがあります。これがdockerでclang-tidyビルドを実行します
```sh
mkdir build_tidy
./docker/packager/packager --output-dir=./build_tidy --package-type=binary --compiler=clang-19 --debug-build --clang-tidy
```

## Functional Stateless Tests {#functional-stateless-tests}

さまざまな構成でビルドされたClickHouseのバイナリに対して[ステートレス機能テスト](tests.md#functional-tests)を実行します -- リリース、デバッグ、サニタイザー付きなど。  
レポートを見てどのテストが失敗したか確認し、[こちら](./tests.md/#functional-tests-functional-tests)で説明されているようにローカルで失敗を再現してください。  
適切なビルド構成を使用して再現する必要があることに注意してください -- アドレスサニタイザーの下でテストが失敗するかもしれませんが、デバッグでは合格します。  
[CIビルドチェックページ](/install#install-a-ci-generated-binary)からバイナリをダウンロードするか、ローカルでビルドしてください。

## Functional Stateful Tests {#functional-stateful-tests}

[ステートフル機能テスト](tests.md#functional-tests)を実行します。  
これらは、ステートレス機能テストと同様に扱います。  
違いは、これらが実行するために[clickstreamデータセット](../getting-started/example-datasets/metrica.md)から`hits`と`visits`のテーブルを必要とすることです。

## Integration Tests {#integration-tests}

[統合テスト](tests.md#integration-tests)を実行します。

## Bugfix validate check {#bugfix-validate-check}

新しいテスト（機能または統合）があるか、マスターブランチでビルドされたバイナリに対して失敗する変更されたテストがあるかどうかをチェックします。  
このチェックはプルリクエストに"pr-bugfix"ラベルが付けられたときにトリガーされます。

## Stress Test {#stress-test}

いくつかのクライアントから同時にステートレス機能テストを実行して、同時実行関連のエラーを検出します。  
失敗した場合：

* まず他のすべてのテストの失敗を修正してください；
* レポートを見てサーバーログを見つけ、それらにエラーの原因となる可能性があるものがないか確認してください。

## Compatibility Check {#compatibility-check}

`clickhouse`バイナリが古いlibcバージョンを持つディストリビューションで実行できるかどうかをチェックします。  
失敗した場合は、メンテナーに助けを求めてください。

## AST Fuzzer {#ast-fuzzer}

ランダムに生成されたクエリを実行してプログラムエラーを検出します。  
失敗した場合は、メンテナーに助けを求めてください。

## Performance Tests {#performance-tests}

クエリパフォーマンスの変化を測定します。  
これは実行するのにほぼ6時間かかる最長のチェックです。  
パフォーマンステストレポートは[こちら](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)で詳細に説明されています。
