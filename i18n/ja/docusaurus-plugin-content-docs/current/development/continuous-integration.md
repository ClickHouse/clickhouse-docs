---
slug: /development/continuous-integration
sidebar_position: 55
sidebar_label: 継続的インテグレーション (CI)
---

# 継続的インテグレーション (CI)

プルリクエストを送信すると、ClickHouseの[継続的インテグレーション (CI) システム](tests.md#test-automation)によって、自分のコードに対していくつかの自動チェックが実行されます。
これは、リポジトリのメンテナー（ClickHouseチームの誰か）があなたのコードを確認し、プルリクエストに「can be tested」ラベルを追加した後に行われます。
チェックの結果は、[GitHubチェックのドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)に記載されているように、GitHubのプルリクエストページで確認できます。
もしチェックが失敗した場合、修正が必要です。
このページでは、遭遇する可能性のあるチェックの概要と、それらを修正するための手順を説明します。

もしチェックの失敗があなたの変更に関連していないと思われる場合、何らかの一時的な障害やインフラの問題である可能性があります。
CIチェックを再起動するために、プルリクエストに空のコミットをプッシュしてください：

```shell
git reset
git commit --allow-empty
git push
```

対処方法が不明な場合は、メンテナーに助けを求めてください。

## マスターへのマージ {#merge-with-master}

プルリクエストがマスターにマージできるかを検証します。
できない場合は、「Cannot fetch mergecommit」というメッセージで失敗します。
このチェックを修正するには、[GitHubのドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github)に記載されているように、コンフリクトを解決するか、`master` ブランチをあなたのプルリクエストブランチにマージします。

## ドキュメントチェック {#docs-check}

ClickHouseのドキュメントウェブサイトをビルドしようとします。
ドキュメントに何か変更があった場合、失敗する可能性があります。
最も考えられる理由は、ドキュメント内のクロスリンクが間違っていることです。
チェックレポートに行き、`ERROR`および`WARNING`メッセージを探してください。

## 説明チェック {#description-check}

プルリクエストの説明がテンプレート[PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md)に準拠しているか確認します。
変更のためのチェンジログカテゴリを指定する必要があります（例：バグ修正）、および[CHANGELOG.md](../whats-new/changelog/index.md)のために変更を説明するユーザーが読めるメッセージを記述します。

## DockerHubへのプッシュ {#push-to-dockerhub}

ビルドとテストに使用されるdockerイメージをビルドし、それをDockerHubにプッシュします。

## マーカーチェック {#marker-check}

このチェックは、CIシステムがプルリクエストの処理を開始したことを意味します。
「pending」ステータスのときは、すべてのチェックがまだ開始されていないことを示します。
すべてのチェックが開始されると、ステータスは「success」に変更されます。

## スタイルチェック {#style-check}

[`utils/check-style/check-style`](https://github.com/ClickHouse/ClickHouse/blob/master/utils/check-style/check-style)バイナリを使用して、コードスタイルの単純な正規表現ベースのチェックを実行します（ローカルで実行可能です）。
失敗した場合は、[コードスタイルガイド](style.md)に従ってスタイルエラーを修正してください。

#### ローカルでスタイルチェックを実行する: {#running-style-check-locally}

```sh
mkdir -p /tmp/test_output
# すべてのチェックを実行する
python3 tests/ci/style_check.py --no-push

# 指定されたチェックスクリプトを実行する (例: ./check-mypy)
docker run --rm --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output -u $(id -u ${USER}):$(id -g ${USER}) --cap-add=SYS_PTRACE --entrypoint= -w/ClickHouse/utils/check-style clickhouse/style-test ./check-mypy

# ディレクトリ内のすべてのスタイルチェックスクリプトを見つける:
cd ./utils/check-style

# 重複インクルードをチェック
./check-duplicate-includes.sh

# C++形式をチェック
./check-style

# Blackを使ってPython形式をチェック
./check-black

# mypyを使ってPythonの型ヒントをチェック
./check-mypy

# flake8を使ってPythonをチェック
./check-flake8

# codespellを使ってコードをチェック
./check-typos

# ドキュメントのスペルをチェック
./check-doc-aspell

# ホワイトスペースをチェック
./check-whitespaces

# GitHub Actionsワークフローをチェック
./check-workflows

# サブモジュールをチェック
./check-submodules

# shellcheckを使ってシェルスクリプトをチェック
./shellcheck-run.sh
```

## ファストテスト {#fast-test}

通常、これはPRのために実行される最初のチェックです。
ClickHouseをビルドし、ほとんどの[ステートレス機能テスト](tests.md#functional-tests)を実行しますが、一部は省略されます。
失敗した場合は、それが修正されるまでさらなるチェックは開始されません。
失敗したテストを確認し、[こちら](tests.md#functional-test-locally)に記載されているように、ローカルで失敗を再現してください。

#### ローカルでファストテストを実行する: {#running-fast-test-locally}

```sh
mkdir -p /tmp/test_output
mkdir -p /tmp/fasttest-workspace
cd ClickHouse
# このdockerコマンドは、最小限のClickHouseビルドを行い、FastTestsを実行します
docker run --rm --cap-add=SYS_PTRACE -u $(id -u ${USER}):$(id -g ${USER})  --network=host -e FASTTEST_WORKSPACE=/fasttest-workspace -e FASTTEST_OUTPUT=/test_output -e FASTTEST_SOURCE=/ClickHouse --cap-add=SYS_PTRACE -e stage=clone_submodules --volume=/tmp/fasttest-workspace:/fasttest-workspace --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output clickhouse/fasttest
```

#### ステータスページファイル {#status-page-files}

- `runlog.out.log`は、すべてのログを含む一般的なログです。
- `test_log.txt`
- `submodule_log.txt`は、必要なサブモジュールのクローンおよびチェックアウトに関するメッセージを含みます。
- `stderr.log`
- `stdout.log`
- `clickhouse-server.log`
- `clone_log.txt`
- `install_log.txt`
- `clickhouse-server.err.log`
- `build_log.txt`
- `cmake_log.txt`は、C/C++およびLinuxフラグのチェックに関するメッセージを含みます。

#### ステータスページの列 {#status-page-columns}

- *テスト名*は、テストの名前を含みます（例：すべてのテストタイプは名前に切り詰められます）。
- *テスト状態* -- _Skipped_、_Success_、または_Fail_のいずれか。
- *テスト時間（秒）* -- このテストでは空です。


## ビルドチェック {#build-check}

さまざまな構成でClickHouseをビルドし、さらなるステップで使用します。
失敗したビルドを修正する必要があります。
ビルドログには、エラーを修正するための十分な情報が含まれていることが多いですが、ローカルで失敗を再現する必要があるかもしれません。
`cmake`オプションはビルドログ内に見つけることができ、`cmake`でgrepします。
これらのオプションを使用し、[一般的なビルドプロセス](../development/build.md)に従ってください。

### 報告の詳細 {#report-details}

- **コンパイラ**: `clang-19`、任意でターゲットプラットフォームの名前
- **ビルドタイプ**: `Debug`または`RelWithDebInfo`（cmake）。
- **サニタイザー**: `none`（サニタイザーなし）、`address`（ASan）、`memory`（MSan）、`undefined`（UBSan）、または`thread`（TSan）。
- **ステータス**: `success`または`fail`
- **ビルドログ**: ビルドおよびファイルコピーのログへのリンク、ビルドが失敗したときに便利です。
- **ビルド時間**。
- **アーティファクト**: ビルド結果ファイル（`XXX`はサーバーバージョンを示します、例: `20.8.1.4344`）。
  - `clickhouse-client_XXX_amd64.deb`
  - `clickhouse-common-static-dbg_XXX[+asan, +msan, +ubsan, +tsan]_amd64.deb`
  - `clickhouse-common-staticXXX_amd64.deb`
  - `clickhouse-server_XXX_amd64.deb`
  - `clickhouse`: メインのビルドバイナリ。
  - `clickhouse-odbc-bridge`
  - `unit_tests_dbms`: ClickHouse単体テストを含むGoogleTestバイナリ。
  - `performance.tar.zst`: パフォーマンステスト用の特別なパッケージ。


## 特殊ビルドチェック {#special-build-check}
`clang-tidy`を使用して静的分析およびコードスタイルチェックを実行します。報告は[ビルドチェック](#build-check)と似ています。ビルドログに見つかったエラーを修正します。

#### ローカルでclang-tidyを実行する: {#running-clang-tidy-locally}

コンビニエンスのために、clang-tidyビルドをdockerで実行する`packager`スクリプトがあります。
```sh
mkdir build_tidy
./docker/packager/packager --output-dir=./build_tidy --package-type=binary --compiler=clang-19 --debug-build --clang-tidy
```

## ステートレス機能テスト {#functional-stateless-tests}
さまざまな構成でビルドされたClickHouseバイナリに対して、[ステートレス機能テスト](tests.md#functional-tests)を実行します -- リリース、デバッグ、サニタイザー付きなど。
失敗したテストをレポートで確認し、[こちら](tests.md#functional-test-locally)に記載されているように、ローカルで失敗を再現してください。
再現するには、正しいビルド構成を使用する必要があります -- テストはAddressSanitizerで失敗するかもしれませんが、Debugでは成功するかもしれません。
[CIビルドチェックページ](../development/build.md#you-dont-have-to-build-clickhouse)からバイナリをダウンロードするか、ローカルでビルドします。

## ステートフル機能テスト {#functional-stateful-tests}

[ステートフル機能テスト](tests.md#functional-tests)を実行します。
これらは、ステートレス機能テストと同じ方法で扱います。
違いは、実行するために[clickstreamデータセット](../getting-started/example-datasets/metrica.md)から`hits`および`visits`テーブルが必要です。

## 統合テスト {#integration-tests}
[統合テスト](tests.md#integration-tests)を実行します。

## バグ修正検証チェック {#bugfix-validate-check}

新しいテスト（機能または統合テスト）があるか、またはマスターブランチでビルドされたバイナリで失敗する変更されたテストがあるかを確認します。
このチェックは、プルリクエストに「pr-bugfix」ラベルが付けられるとトリガーされます。

## ストレステスト {#stress-test}
複数のクライアントから同時にステートレス機能テストを実行し、同時実行に関連するエラーを検出します。失敗した場合：

    * まず他のすべてのテストの失敗を修正します；
    * レポートを見てサーバーログを見つけ、エラーの可能性のある原因をチェックします。

## 互換性チェック {#compatibility-check}

`clickhouse`バイナリが古いlibcバージョンのディストリビューションで動作するかを確認します。
失敗した場合は、メンテナーに助けを求めてください。

## ASTファジング {#ast-fuzzer}
ランダムに生成されたクエリを実行してプログラムエラーをキャッチします。
失敗した場合は、メンテナーに助けを求めてください。


## パフォーマンステスト {#performance-tests}
クエリパフォーマンスの変化を測定します。
これは、実行に約6時間かかる最も長いチェックです。
パフォーマンステストレポートについての詳細は、[こちら](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)に記載されています。
