---
slug: /development/continuous-integration
sidebar_position: 55
sidebar_label: 継続的インテグレーション (CI)
---


# 継続的インテグレーション (CI)

プルリクエストを提出すると、ClickHouseの[継続的インテグレーション (CI) system](tests.md#test-automation)によってあなたのコードに対していくつかの自動チェックが実行されます。
これは、リポジトリのメンテナ（ClickHouseチームの誰か）があなたのコードを確認し、プルリクエストに `can be tested` ラベルを追加した後に行われます。
チェックの結果は、[GitHubチェックのドキュメンテーション](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)で説明されているように、GitHubのプルリクエストページにリストされます。
チェックに失敗した場合は、修正が必要となる場合があります。
このページでは、遭遇する可能性があるチェックの概要と、それを修正するためにできることを説明します。

チェックの失敗があなたの変更に関連していないように見える場合、一時的な失敗またはインフラの問題である可能性があります。
CIチェックを再起動するために、プルリクエストに空のコミットをプッシュしてください：

```shell
git reset
git commit --allow-empty
git push
```

何をすべきか不明な場合は、メンテナに援助を求めてください。

## マスタとのマージ {#merge-with-master}

PRがマスターにマージできるかどうかを確認します。
できない場合は `Cannot fetch mergecommit` というメッセージで失敗します。
このチェックを修正するには、[GitHubのドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github)に記載されているようにコンフリクトを解決するか、`master`ブランチをあなたのプルリクエストブランチにマージしてください。

## ドキュメントチェック {#docs-check}

ClickHouseのドキュメントウェブサイトをビルドしようとします。
ドキュメントに何か変更を加えた場合、失敗する可能性があります。
最も考えられる理由は、ドキュメント内のいくつかのクロスリンクが間違っていることです。
チェックレポートに移動し、`ERROR`および`WARNING`メッセージを探してください。

## 説明チェック {#description-check}

プルリクエストの説明がテンプレート[PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md)に準拠していることを確認します。
変更のためのチャンジログカテゴリー（例：バグ修正）を指定し、変更を説明するユーザーフレンドリーなメッセージを[CHANGELOG.md](../whats-new/changelog/index.md)に記載する必要があります。

## DockerHubへのプッシュ {#push-to-dockerhub}

ビルドとテストに使用されるDockerイメージをビルドし、それをDockerHubにプッシュします。

## マーカーチェック {#marker-check}

このチェックは、CIシステムがプルリクエストの処理を開始したことを意味します。
'pending'ステータスの場合、すべてのチェックがまだ開始されていないことを意味します。
すべてのチェックが開始されると、ステータスは'success'に変更されます。

## スタイルチェック {#style-check}

[`utils/check-style/check-style`](https://github.com/ClickHouse/ClickHouse/blob/master/utils/check-style/check-style)バイナリを使用して、コードスタイルの簡単な正規表現ベースのチェックを実行します（ローカルで実行することもできます）。
失敗した場合は、[コードスタイルガイド](style.md)に従ってスタイルエラーを修正してください。

#### ローカルでのスタイルチェックの実行: {#running-style-check-locally}

```sh
mkdir -p /tmp/test_output

# すべてのチェックを実行中
python3 tests/ci/style_check.py --no-push


# 指定されたチェックスクリプトを実行（例：./check-mypy）
docker run --rm --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output -u $(id -u ${USER}):$(id -g ${USER}) --cap-add=SYS_PTRACE --entrypoint= -w/ClickHouse/utils/check-style clickhouse/style-test ./check-mypy


# ディレクトリ内のすべてのスタイルチェックスクリプトを見つける：
cd ./utils/check-style


# 重複したインクルードをチェック
./check-duplicate-includes.sh


# C++フォーマットをチェック
./check-style


# blackでPythonフォーマットをチェック
./check-black


# mypyでPython型ヒントをチェック
./check-mypy


# flake8でPythonをチェック
./check-flake8


# codespellでコードをチェック
./check-typos


# ドキュメントのスペルをチェック
./check-doc-aspell


# ホワイトスペースをチェック
./check-whitespaces


# GitHub Actionsのワークフローをチェック
./check-workflows


# サブモジュールをチェック
./check-submodules


# shellcheckでシェルスクリプトをチェック
./shellcheck-run.sh
```

## ファストテスト {#fast-test}

通常、これはPRのために最初に実行されるチェックです。
ClickHouseをビルドし、ほとんどの[無状態関数テスト](tests.md#functional-tests)を実行しますが、一部を省略します。
失敗した場合、修正されるまで他のチェックは開始されません。
どのテストが失敗しているかを報告で確認し、その失敗をローカルで再現する方法については、[こちら](https://development/tests#running-a-test-locally)を参照してください。

#### ローカルでのファストテストの実行: {#running-fast-test-locally}

```sh
mkdir -p /tmp/test_output
mkdir -p /tmp/fasttest-workspace
cd ClickHouse

# このdockerコマンドは最小限のClickHouseビルドを実行し、FastTestsをそれに対して実行します
docker run --rm --cap-add=SYS_PTRACE -u $(id -u ${USER}):$(id -g ${USER})  --network=host -e FASTTEST_WORKSPACE=/fasttest-workspace -e FASTTEST_OUTPUT=/test_output -e FASTTEST_SOURCE=/ClickHouse --cap-add=SYS_PTRACE -e stage=clone_submodules --volume=/tmp/fasttest-workspace:/fasttest-workspace --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output clickhouse/fasttest
```

#### ステータスページファイル {#status-page-files}

- `runlog.out.log`は、すべての他のログを含む一般的なログです。
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

#### ステータスページ列 {#status-page-columns}

- *テスト名*には、テストの名前が含まれており（パスなしで、例：すべての種類のテストは名前にストリップされます）。
- *テストステータス* -- _スキップ_、_成功_、または_失敗_のいずれか。
- *テスト時間、秒* -- このテストでは空になります。


## ビルドチェック {#build-check}

さまざまな構成でClickHouseをビルドし、さらなるステップで使用します。
ビルドが失敗した場合は、それを修正する必要があります。
ビルドログにはエラーを修正するのに十分な情報が含まれていることが多いですが、ローカルで失敗を再現する必要があるかもしれません。
`cmake`オプションはビルドログの中にあり、`cmake`でgrepできます。
これらのオプションを使用し、[一般的なビルドプロセス](../development/build.md)に従ってください。

### レポート詳細 {#report-details}

- **コンパイラ**: `clang-19`、オプションでターゲットプラットフォームの名前
- **ビルドタイプ**: `Debug`または`RelWithDebInfo`（cmake）。
- **サニタイザー**: `none`（サニタイザーなし）、`address`（ASan）、`memory`（MSan）、`undefined`（UBSan）、または`thread`（TSan）。
- **ステータス**: `success`または`fail`
- **ビルドログ**: ビルドおよびファイルコピーのログへのリンク、ビルドが失敗した場合に便利です。
- **ビルド時間**。
- **アーティファクト**: ビルド成果物ファイル（`XXX`はサーバーバージョン、例：`20.8.1.4344`）。
  - `clickhouse-client_XXX_amd64.deb`
  - `clickhouse-common-static-dbg_XXX[+asan, +msan, +ubsan, +tsan]_amd64.deb`
  - `clickhouse-common-staticXXX_amd64.deb`
  - `clickhouse-server_XXX_amd64.deb`
  - `clickhouse`: メインのビルドバイナリ。
  - `clickhouse-odbc-bridge`
  - `unit_tests_dbms`: ClickHouseユニットテストを含むGoogleTestバイナリ。
  - `performance.tar.zst`: パフォーマンステスト用の特別なパッケージ。


## 特殊ビルドチェック {#special-build-check}
`clang-tidy`を使用して静的解析およびコードスタイルチェックを実行します。レポートは[ビルドチェック](#build-check)に似ています。ビルドログ内で見つかったエラーを修正してください。

#### ローカルでclang-tidyを実行する: {#running-clang-tidy-locally}

clang-tidyビルドをdockerで実行する便利な`packager`スクリプトがあります
```sh
mkdir build_tidy
./docker/packager/packager --output-dir=./build_tidy --package-type=binary --compiler=clang-19 --debug-build --clang-tidy
```

## 無状態関数テスト {#functional-stateless-tests}
さまざまな構成でビルドされたClickHouseバイナリに対して[無状態関数テスト](tests.md#functional-tests)を実行します -- リリース、デバッグ、サニタイザー付きなど。
報告書を見てどのテストが失敗しているかを確認し、その失敗をローカルで再現する方法については[こちら](https://development/tests#functional-tests)を参照してください。
正しいビルド構成を使用して再現する必要があることに注意してください -- テストはAddressSanitizerの下で失敗するかもしれませんが、Debugでは成功するかもしれません。
[CIビルドチェックページ](/install#install-a-ci-generated-binary)からバイナリをダウンロードするか、ローカルでビルドしてください。

## 有状態関数テスト {#functional-stateful-tests}

[有状態関数テスト](tests.md#functional-tests)を実行します。
これらは無状態関数テストと同様の方法で扱います。
違いは、それらは[clickstream dataset](../getting-started/example-datasets/metrica.md)の `hits` と `visits` テーブルを必要とすることです。

## 統合テスト {#integration-tests}
[統合テスト](tests.md#integration-tests)を実行します。

## バグ修正検証チェック {#bugfix-validate-check}

新しいテスト（無状態または統合）または変更されたテストが、マスターブランチでビルドされたバイナリとともに失敗するかどうかを確認します。
このチェックは、プルリクエストに「pr-bugfix」ラベルが付いたときにトリガーされます。

## ストレステスト {#stress-test}
複数のクライアントから無状態関数テストを同時に実行して、同時実行に関連するエラーを検出します。失敗した場合：

    * まず他のすべてのテストの失敗を修正してください；
    * 報告書を見てサーバーログを探し、エラーの可能性のある原因を調べてください。

## 互換性チェック {#compatibility-check}

`clickhouse`バイナリが古いlibcバージョンを持つディストリビューションで実行できるかどうかを確認します。
失敗した場合は、メンテナに援助を求めてください。

## ASTファズテスト {#ast-fuzzer}
ランダムに生成されたクエリを実行してプログラムエラーをキャッチします。
失敗した場合は、メンテナに援助を求めてください。

## パフォーマンステスト {#performance-tests}
クエリ性能の変化を測定します。
これは実行に6時間未満を要する最も長いチェックです。
パフォーマンステストレポートの詳細は[こちら](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)で説明されています。
