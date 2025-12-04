---
description: 'ClickHouse の継続的インテグレーション (CI) システムの概要'
sidebar_label: '継続的インテグレーション (CI)'
sidebar_position: 55
slug: /development/continuous-integration
title: '継続的インテグレーション (CI)'
doc_type: 'reference'
---

# 継続的インテグレーション (CI) {#continuous-integration-ci}

プルリクエストを作成すると、ClickHouse の [継続的インテグレーション (CI) システム](tests.md#test-automation) によって、あなたのコードに対していくつかの自動チェックが実行されます。
これは、リポジトリのメンテナー (ClickHouse チームのメンバー) があなたのコードを確認し、プルリクエストに `can be tested` ラベルを追加した後に行われます。
チェック結果は、[GitHub のチェックに関するドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)で説明されているように、GitHub のプルリクエストページに一覧表示されます。
いずれかのチェックが失敗した場合、それを修正する必要があるかもしれません。
このページでは、遭遇しうるチェックの概要と、それらを修正するためにできることを説明します。

チェックの失敗が自分の変更内容とは無関係に見える場合、一時的な失敗やインフラ上の問題である可能性があります。
CI チェックを再実行するには、空のコミットをプッシュしてプルリクエストを更新します。

```shell
git reset
git commit --allow-empty
git push
```

どうすればよいか分からない場合は、メンテナーに相談してください。

## master とのマージ {#merge-with-master}

PR が master にマージ可能であることを確認します。
マージできない場合は、`Cannot fetch mergecommit` というメッセージとともに失敗します。
このチェックを通すには、[GitHub のドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github)に記載されている手順に従ってコンフリクトを解消するか、git を使用して `master` ブランチをプルリクエストのブランチにマージしてください。

## Docs check {#docs-check}

ClickHouse ドキュメントサイトのビルドを実行します。
ドキュメント内で何かを変更した場合、失敗することがあります。
最も多い原因は、ドキュメント内のクロスリンクに誤りがあることです。
チェックレポートを開き、`ERROR` および `WARNING` メッセージを探してください。

## 説明チェック {#description-check}

プルリクエストの説明文が、テンプレート [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md) に従っていることを確認します。
今回の変更に対して変更履歴カテゴリ（例: Bug Fix）を指定し、[CHANGELOG.md](../whats-new/changelog/index.md) 用に、その変更内容を説明するユーザー向けメッセージを記述する必要があります。

## Docker image {#docker-image}

ClickHouse server および keeper 用の Docker イメージをビルドし、正しくビルドできることを検証します。

### Official docker library tests {#official-docker-library-tests}

[official Docker library](https://github.com/docker-library/official-images/tree/master/test#alternate-config-files) に含まれるテストを実行し、`clickhouse/clickhouse-server` Docker イメージが正しく動作することを検証します。

新しいテストを追加するには、`ci/jobs/scripts/docker_server/tests/$test_name` ディレクトリを作成し、その中に `run.sh` スクリプトを配置します。

テストの詳細については、[CI jobs scripts documentation](https://github.com/ClickHouse/ClickHouse/tree/master/ci/jobs/scripts/docker_server) を参照してください。

## マーカー確認 {#marker-check}

このチェックは、CI システムがプルリクエストの処理を開始したことを意味します。
ステータスが `pending` の場合は、すべてのチェックがまだ開始されていないことを意味します。
すべてのチェックが開始されると、ステータスは `success` に変更されます。

## スタイルチェック {#style-check}

コードベースに対してさまざまなスタイルチェックを実行します。

Style Check ジョブで実行される基本的なチェックは次のとおりです。

##### cpp {#cpp}

[`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) スクリプト（ローカルでも実行可能）を使用して、単純な正規表現ベースのコードスタイルチェックを行います。\
失敗した場合は、[コードスタイルガイド](style.md) に従ってスタイル上の問題を修正してください。

##### codespell, aspell {#codespell}

文法ミスや綴りの誤りをチェックします。

##### mypy {#mypy}

Python コードに対して静的型チェックを実行します。

### スタイルチェックジョブをローカルで実行する {#running-style-check-locally}

*Style Check* ジョブ全体は、Docker コンテナ内でローカルに実行できます:

```sh
python -m ci.praktika run "Style check"
```

特定のチェック（例：*cpp* チェック）を実行するには：

```sh
python -m ci.praktika run "Style check" --test cpp
```

これらのコマンドは `clickhouse/style-test` の Docker イメージを取得して、コンテナ環境でジョブを実行します。
Python 3 と Docker 以外に必要な依存関係はありません。

## Fast test {#fast-test}

通常、これは PR に対して最初に実行されるチェックです。
ClickHouse をビルドし、一部を除くほとんどの [stateless functional tests](tests.md#functional-tests) を実行します。
これが失敗すると、問題が修正されるまで後続のチェックは実行されません。
どのテストが失敗したかを確認するにはレポートを参照し、その後[こちら](/development/tests#running-a-test-locally)で説明されているとおりにローカルでその失敗を再現します。

#### Fast test をローカルで実行する: {#running-fast-test-locally}

```sh
python -m ci.praktika run "Fast test" [--test テスト名]
```

これらのコマンドは `clickhouse/fast-test` の Docker イメージを取得し、コンテナ化された環境でジョブを実行します。
Python 3 と Docker 以外の依存関係は必要ありません。

## ビルドチェック {#build-check}

以降の手順で利用するために、さまざまな構成で ClickHouse をビルドします。

### ローカルでのビルドの実行 {#running-builds-locally}

ビルドは、次のコマンドを使用して CI 環境に近い形でローカル実行できます。

```bash
python -m ci.praktika run "<ビルドジョブ名>"
```

Python 3 と Docker 以外に必要な依存関係はありません。

#### 利用可能なビルドジョブ {#available-build-jobs}

ビルドジョブ名は CI レポートに表示されるものと完全に同一です。

**AMD64 ビルド:**

* `Build (amd_debug)` - シンボル付きデバッグビルド
* `Build (amd_release)` - 最適化されたリリースビルド
* `Build (amd_asan)` - Address Sanitizer ビルド
* `Build (amd_tsan)` - Thread Sanitizer ビルド
* `Build (amd_msan)` - Memory Sanitizer ビルド
* `Build (amd_ubsan)` - Undefined Behavior Sanitizer ビルド
* `Build (amd_binary)` - Thin LTO なしのクイックリリースビルド
* `Build (amd_compat)` - 旧システム向け互換ビルド
* `Build (amd_musl)` - musl libc を使用したビルド
* `Build (amd_darwin)` - macOS ビルド
* `Build (amd_freebsd)` - FreeBSD ビルド

**ARM64 ビルド:**

* `Build (arm_release)` - ARM64 向け最適化リリースビルド
* `Build (arm_asan)` - ARM64 Address Sanitizer ビルド
* `Build (arm_coverage)` - カバレッジ計測付き ARM64 ビルド
* `Build (arm_binary)` - Thin LTO なしの ARM64 クイックリリースビルド
* `Build (arm_darwin)` - macOS ARM64 ビルド
* `Build (arm_v80compat)` - ARMv8.0 互換ビルド

**その他のアーキテクチャ:**

* `Build (ppc64le)` - PowerPC 64-bit Little Endian
* `Build (riscv64)` - RISC-V 64-bit
* `Build (s390x)` - IBM System/390 64-bit
* `Build (loongarch64)` - LoongArch 64-bit

ジョブが成功すると、ビルド結果は `<repo_root>/ci/tmp/build` ディレクトリで利用可能になります。

**注意:** クロスコンパイルを使用する「Other Architectures」カテゴリ以外のビルドでは、指定した `BUILD_JOB_NAME` どおりのビルドを生成するために、ローカルマシンのアーキテクチャがビルドタイプと一致している必要があります。

#### 例 {#example-run-local}

ローカルでデバッグビルドを実行するには:

```bash
python -m ci.praktika run "Build (amd_debug)"
```

上記の方法がうまくいかない場合は、ビルドログに出力されている cmake オプションを使用し、[一般的なビルド手順](../development/build.md)に従ってください。
## Functional stateless tests {#functional-stateless-tests}

さまざまな構成（release、debug、sanitizer 有効など）でビルドされた ClickHouse バイナリに対して [stateless functional tests](tests.md#functional-tests) を実行します。
どのテストが失敗しているかをレポートで確認し、[こちら](/development/tests#functional-tests) に記載の手順に従ってローカルでその失敗を再現してください。
再現には正しいビルド構成を使用する必要がある点に注意してください。あるテストは AddressSanitizer 下では失敗しても、Debug では成功する場合があります。
[CI build checks page](/install/advanced) からバイナリをダウンロードするか、ローカルでビルドしてください。

## 結合テスト {#integration-tests}

[結合テスト](tests.md#integration-tests)を実行します。

## バグ修正検証チェック {#bugfix-validate-check}

新しいテスト（機能テストまたは統合テスト）が追加されているか、あるいは master ブランチからビルドしたバイナリで失敗するように既存のテストが変更されているかを確認します。
このチェックは、プルリクエストに「pr-bugfix」ラベルが付与されたときにトリガーされます。

## ストレステスト {#stress-test}

複数のクライアントからステートレスなファンクショナルテストを同時に実行し、同時実行に起因するエラーを検出します。これが失敗した場合は、次を行います。

    * まず他のすべてのテスト失敗を修正する
    * レポートを確認してサーバーログの場所を特定し、エラーの原因となり得る事項がないか確認する

## 互換性チェック {#compatibility-check}

古い libc バージョンのディストリビューション上で `clickhouse` バイナリが動作するかどうかを確認します。
失敗した場合は、メンテナーにサポートを依頼してください。

## AST fuzzer {#ast-fuzzer}

プログラムエラーを検出するために、ランダムに生成したクエリを実行します。
失敗した場合は、メンテナーに助けを求めてください。

## パフォーマンス テスト {#performance-tests}

クエリのパフォーマンスの変化を測定します。
これは最も時間のかかるテストで、実行にはおよそ 6 時間弱を要します。
パフォーマンス テスト レポートの詳細な説明は[こちら](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)にあります。
