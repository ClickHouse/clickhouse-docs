---
slug: /development/continuous-integration
sidebar_position: 55
sidebar_label: 継続的インテグレーション (CI)
---
# 継続的インテグレーション (CI)

プルリクエストを提出すると、ClickHouseの[継続的インテグレーション (CI) システム](tests.md#test-automation)によって、コードに対していくつかの自動チェックが実行されます。
これは、リポジトリのメンテナー（ClickHouseチームのメンバー）があなたのコードを確認し、プルリクエストに`can be tested`ラベルを追加した後に発生します。
チェックの結果は、[GitHub チェックのドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)で説明されているように、GitHubプルリクエストページにリストされます。
チェックが失敗した場合は、それを修正する必要があるかもしれません。
このページでは、遭遇する可能性のあるチェックの概要と、その修正方法について説明します。

チェックの失敗があなたの変更に関連していないように見える場合、これは一時的な失敗やインフラの問題である可能性があります。
CIチェックを再起動するために、プルリクエストに空のコミットをプッシュします：

```shell
git reset
git commit --allow-empty
git push
```

何をすべきか確信が持てない場合は、メンテナーに助けを求めてください。
## マスターとのマージ {#merge-with-master}

PRがマスターにマージできるかどうかを検証します。
できない場合は、`Cannot fetch mergecommit`というメッセージで失敗します。
このチェックを修正するには、[GitHubのドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github)に記載されているように、コンフリクトを解決するか、`master`ブランチをプルリクエストブランチにマージします。
## ドキュメントチェック {#docs-check}

ClickHouseのドキュメントウェブサイトをビルドしようとします。
もしドキュメントに何か変更があった場合、失敗する可能性があります。
最も考えられる理由は、ドキュメント内のいくつかの相互リンクが間違っていることです。
チェックレポートに行き、`ERROR`および`WARNING`メッセージを探してください。
## 説明チェック {#description-check}

プルリクエストの説明が[PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md)テンプレートに準拠していることを確認します。
変更に対して変更ログカテゴリ（例：バグ修正）を指定し、[CHANGELOG.md](../whats-new/changelog/index.md)に変更を説明するユーザー向けメッセージを書かなければなりません。
## DockerHubへのプッシュ {#push-to-dockerhub}

ビルドおよびテストに使用されるDockerイメージをビルドし、それをDockerHubにプッシュします。
## マーカーチェック {#marker-check}

このチェックは、CIシステムがプルリクエストの処理を開始したことを意味します。
'pending'ステータスのときは、まだすべてのチェックが開始されていないことを意味します。
すべてのチェックが開始された後、ステータスは'success'に変更されます。
## スタイルチェック {#style-check}

`utils/check-style/check-style`を使用して、コードスタイルの単純な正規表現に基づくチェックを実行します（ローカルでも実行可能です）。
これが失敗した場合は、[コードスタイルガイド](style.md)に従ってスタイルエラーを修正してください。
#### ローカルでスタイルチェックを実行する: {#running-style-check-locally}

```sh
mkdir -p /tmp/test_output
# すべてのチェックを実行中
python3 tests/ci/style_check.py --no-push

# 指定されたチェックスクリプトを実行する (例: ./check-mypy)
docker run --rm --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output -u $(id -u ${USER}):$(id -g ${USER}) --cap-add=SYS_PTRACE --entrypoint= -w/ClickHouse/utils/check-style clickhouse/style-test ./check-mypy

# ディレクトリ内のすべてのスタイルチェックスクリプトを探す:
cd ./utils/check-style

# 重複インクルードをチェック
./check-duplicate-includes.sh

# c++フォーマットをチェック
./check-style

# blackを使用してpythonのフォーマットをチェック
./check-black

# mypyを使用してpythonの型ヒントをチェック
./check-mypy

# flake8を使用してpythonをチェック
./check-flake8

# codespellを使用してコードをチェック
./check-typos

# ドキュメントのスペルをチェック
./check-doc-aspell

# 空白をチェック
./check-whitespaces

# GitHub Actionsワークフローをチェック
./check-workflows

# サブモジュールをチェック
./check-submodules

# shellcheckを使用してシェルスクリプトをチェック
./shellcheck-run.sh
```
## ファストテスト {#fast-test}

通常、これはPRに対して最初に実行されるチェックです。
ClickHouseをビルドし、[ステートレス機能テスト](tests.md#functional-tests)のほとんどを実行しますが、一部は省略されます。
これが失敗した場合、修正されるまでさらなるチェックは開始されません。
レポートを見て、どのテストが失敗したかを確認し、[こちら](tests.md#functional-test-locally)に記載されているように、ローカルで失敗を再現してください。
#### ローカルでファストテストを実行する: {#running-fast-test-locally}

```sh
mkdir -p /tmp/test_output
mkdir -p /tmp/fasttest-workspace
cd ClickHouse
# このdockerコマンドは最小限のClickHouseビルドを行い、それに対してFastTestsを実行します
docker run --rm --cap-add=SYS_PTRACE -u $(id -u ${USER}):$(id -g ${USER}) --network=host -e FASTTEST_WORKSPACE=/fasttest-workspace -e FASTTEST_OUTPUT=/test_output -e FASTTEST_SOURCE=/ClickHouse --cap-add=SYS_PTRACE -e stage=clone_submodules --volume=/tmp/fasttest-workspace:/fasttest-workspace --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output clickhouse/fasttest
```
#### ステータスページファイル {#status-page-files}

- `runlog.out.log`は、他のすべてのログを含む一般的なログです。
- `test_log.txt`
- `submodule_log.txt`は、必要なサブモジュールのクローンとチェックアウトに関するメッセージを含みます。
- `stderr.log`
- `stdout.log`
- `clickhouse-server.log`
- `clone_log.txt`
- `install_log.txt`
- `clickhouse-server.err.log`
- `build_log.txt`
- `cmake_log.txt`は、C/C++およびLinuxフラグのチェックに関するメッセージを含みます。
#### ステータスページの列 {#status-page-columns}

- *テスト名* にはテストの名前が含まれています（パスなし、すべてのテストタイプは名前にストリップされます）。
- *テストステータス* -- _スキップ_、_成功_、または_失敗_のいずれか。
- *テスト時間、秒* -- このテストでは空です。
## ビルドチェック {#build-check}

さまざまな構成でClickHouseをビルドし、さらなるステップで使用します。
失敗したビルドを修正する必要があります。
ビルドログには、エラーを修正するのに十分な情報が含まれていることが多いですが、失敗をローカルで再現する必要があるかもしれません。
`cmake`オプションはビルドログに見つけ、`cmake`をgrepしてください。
これらのオプションを使用し、[一般的なビルドプロセス](../development/build.md)に従ってください。
### レポート詳細 {#report-details}

- **コンパイラ**: `clang-19`、オプションでターゲットプラットフォームの名前
- **ビルドタイプ**: `Debug`または`RelWithDebInfo`（cmake）。
- **サニタイザー**: `none`（サニタイザーなし）、`address`（ASan）、`memory`（MSan）、`undefined`（UBSan）、または`thread`（TSan）。
- **ステータス**: `success`または`fail`
- **ビルドログ**: ビルドおよびファイルコピーのログへのリンク、ビルドに失敗した場合に役立ちます。
- **ビルド時間**。
- **アーティファクト**: ビルド結果のファイル（`XXX`はサーバーバージョン、例えば`20.8.1.4344`）。
  - `clickhouse-client_XXX_amd64.deb`
  - `clickhouse-common-static-dbg_XXX[+asan, +msan, +ubsan, +tsan]_amd64.deb`
  - `clickhouse-common-staticXXX_amd64.deb`
  - `clickhouse-server_XXX_amd64.deb`
  - `clickhouse`: メインビルドバイナリ。
  - `clickhouse-odbc-bridge`
  - `unit_tests_dbms`: ClickHouseユニットテストを含むGoogleTestバイナリ。
  - `performance.tar.zst`: パフォーマンステスト用の特別なパッケージ。
## 特殊ビルドチェック {#special-build-check}
静的分析およびコードスタイルチェックを`clang-tidy`を使用して実行します。レポートは[ビルドチェック](#build-check)に類似しています。ビルドログに見つかったエラーを修正してください。
#### ローカルでclang-tidyを実行する: {#running-clang-tidy-locally}

便利な`packager`スクリプトがあり、docker内でclang-tidyビルドを実行します。
```sh
mkdir build_tidy
./docker/packager/packager --output-dir=./build_tidy --package-type=binary --compiler=clang-19 --debug-build --clang-tidy
```
## 機能的ステートレステスト {#functional-stateless-tests}
さまざまな構成（リリース、デバッグ、サニタイザー付きなど）でビルドされたClickHouseバイナリに対して[ステートレス機能テスト](tests.md#functional-tests)を実行します。
レポートを見て、どのテストが失敗したかを確認し、[こちら](tests.md#functional-test-locally)に記載されているように、ローカルで失敗を再現してください。
正しいビルド構成を使用して再現する必要があることに注意してください -- テストはAddressSanitizerで失敗することがありますが、Debugでは成功します。
[CIビルドチェックページ](../development/build.md#you-dont-have-to-build-clickhouse)からバイナリをダウンロードするか、ローカルでビルドします。
## 機能的ステートフルテスト {#functional-stateful-tests}

[ステートフル機能テスト](tests.md#functional-tests)を実行します。
それらは機能的ステートレステストと同じように扱います。
違いは、実行するために[clickstream dataset](../getting-started/example-datasets/metrica.md)から`hits`および`visits`テーブルが必要なことです。
## 統合テスト {#integration-tests}
[統合テスト](tests.md#integration-tests)を実行します。
## バグ修正検証チェック {#bugfix-validate-check}

新しいテスト（機能的または統合）またはマスターブランチでビルドされたバイナリで失敗するいくつかの変更テストが存在することを確認します。
このチェックは、プルリクエストに「pr-bugfix」ラベルがあるとトリガーされます。
## ストレステスト {#stress-test}
複数のクライアントから同時にステートレス機能テストを実行し、並行性に関連するエラーを検出します。これが失敗した場合：

* すべての他のテスト失敗を最初に修正してください；
* レポートを見て、サーバーログを見つけ、エラーの可能性のある原因を確認してください。
## 互換性チェック {#compatibility-check}

`clickhouse`バイナリが古いlibcバージョンを持つディストリビューションで実行されるかどうかを確認します。
これが失敗した場合は、メンテナーに助けを求めてください。
## ASTファザー {#ast-fuzzer}
ランダムに生成されたクエリを実行してプログラムエラーをキャッチします。
これが失敗した場合は、メンテナーに助けを求めてください。
## パフォーマンステスト {#performance-tests}
クエリパフォーマンスの変化を測定します。
これは実行に6時間未満かかる最も長いチェックです。
パフォーマンステストレポートの詳細については、[こちら](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)を参照してください。
