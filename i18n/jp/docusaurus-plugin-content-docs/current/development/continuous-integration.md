---
description: 'ClickHouse の継続的インテグレーション (CI) システムの概要'
sidebar_label: '継続的インテグレーション (CI)'
sidebar_position: 55
slug: /development/continuous-integration
title: '継続的インテグレーション (CI)'
doc_type: 'reference'
---



# 継続的インテグレーション (CI)

プルリクエストを送信すると、ClickHouse の[継続的インテグレーション (CI) システム](tests.md#test-automation)によって、そのコードに対していくつかの自動チェックが実行されます。
これは、リポジトリメンテナー (ClickHouse チームのメンバー) がコードを確認し、そのプルリクエストに `can be tested` ラベルを付与した後に実行されます。
チェックの結果は、[GitHub のチェックに関するドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)で説明されているとおり、GitHub のプルリクエストページに一覧表示されます。
いずれかのチェックが失敗している場合、修正が必要になることがあります。
このページでは、遭遇する可能性のあるチェックの概要と、それらを修正するためにできることを説明します。

チェックの失敗が変更内容と無関係に見える場合、一時的な失敗やインフラストラクチャの問題である可能性があります。
CI チェックを再実行するには、空のコミットを push してプルリクエストを更新してください。

```shell
git reset
git commit --allow-empty
git push
```

どうすればよいか分からない場合は、メンテナーに助けを求めてください。


## masterとのマージ {#merge-with-master}

PRがmasterにマージ可能かどうかを検証します。
マージできない場合は、`Cannot fetch mergecommit`というメッセージで失敗します。
このチェックを修正するには、[GitHubドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github)に記載されている手順に従ってコンフリクトを解決するか、gitを使用して`master`ブランチをプルリクエストブランチにマージしてください。


## Docs check {#docs-check}

ClickHouseドキュメントウェブサイトのビルドを試行します。
ドキュメントに変更を加えた場合、ビルドが失敗することがあります。
最も可能性の高い原因は、ドキュメント内の相互参照リンクが正しくないことです。
チェックレポートを確認し、`ERROR`および`WARNING`メッセージを探してください。


## 説明のチェック {#description-check}

プルリクエストの説明がテンプレート [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md) に準拠しているか確認してください。
変更内容に対して変更履歴のカテゴリ(例:Bug Fix)を指定し、[CHANGELOG.md](../whats-new/changelog/index.md) 用にユーザーが理解できる変更内容の説明メッセージを記述する必要があります。


## Dockerイメージ {#docker-image}

ClickHouseサーバーとkeeperのDockerイメージをビルドし、正しくビルドされることを検証します。

### 公式Dockerライブラリテスト {#official-docker-library-tests}

[公式Dockerライブラリ](https://github.com/docker-library/official-images/tree/master/test#alternate-config-files)のテストを実行し、`clickhouse/clickhouse-server` Dockerイメージが正しく動作することを検証します。

新しいテストを追加するには、ディレクトリ`ci/jobs/scripts/docker_server/tests/$test_name`とスクリプト`run.sh`を作成してください。

テストの詳細については、[CIジョブスクリプトドキュメント](https://github.com/ClickHouse/ClickHouse/tree/master/ci/jobs/scripts/docker_server)を参照してください。


## マーカーチェック {#marker-check}

このチェックは、CIシステムがプルリクエストの処理を開始したことを示します。
ステータスが「pending」の場合、まだすべてのチェックが開始されていないことを意味します。
すべてのチェックが開始されると、ステータスは「success」に変わります。


## スタイルチェック {#style-check}

コードベースに対して様々なスタイルチェックを実行します。

スタイルチェックジョブの基本的なチェック項目:

##### cpp {#cpp}

[`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) スクリプトを使用して、正規表現ベースのシンプルなコードスタイルチェックを実行します(ローカルでも実行可能)。  
チェックが失敗した場合は、[コードスタイルガイド](style.md)に従ってスタイルの問題を修正してください。

##### codespell、aspell {#codespell}

文法上の誤りやタイプミスをチェックします。

##### mypy {#mypy}

Pythonコードの静的型チェックを実行します。

### スタイルチェックジョブをローカルで実行する {#running-style-check-locally}

_スタイルチェック_ジョブ全体は、次のコマンドでDockerコンテナ内でローカル実行できます:

```sh
python -m ci.praktika run "Style check"
```

特定のチェック(例: _cpp_チェック)を実行する場合:

```sh
python -m ci.praktika run "Style check" --test cpp
```

これらのコマンドは`clickhouse/style-test` Dockerイメージを取得し、コンテナ化された環境でジョブを実行します。
Python 3とDocker以外の依存関係は必要ありません。


## 高速テスト {#fast-test}

通常、これはプルリクエストに対して最初に実行されるチェックです。
ClickHouseをビルドし、[ステートレス機能テスト](tests.md#functional-tests)の大部分を実行しますが、一部は省略されます。
失敗した場合、修正されるまで以降のチェックは開始されません。
レポートを確認してどのテストが失敗したかを確認し、[こちら](/development/tests#running-a-test-locally)に記載されている手順に従ってローカルで失敗を再現してください。

#### 高速テストをローカルで実行する: {#running-fast-test-locally}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

これらのコマンドは`clickhouse/fast-test` Dockerイメージを取得し、コンテナ化された環境でジョブを実行します。
Python 3とDocker以外の依存関係は必要ありません。


## ビルドチェック {#build-check}

後続のステップで使用するために、さまざまな構成でClickHouseをビルドします。

### ローカルでのビルド実行 {#running-builds-locally}

以下のコマンドを使用して、CI環境に類似したローカル環境でビルドを実行できます:

```bash
python -m ci.praktika run "<BUILD_JOB_NAME>"
```

Python 3とDocker以外の依存関係は必要ありません。

#### 利用可能なビルドジョブ {#available-build-jobs}

ビルドジョブ名は、CIレポートに表示される名称と完全に一致します:

**AMD64ビルド:**

- `Build (amd_debug)` - シンボル付きデバッグビルド
- `Build (amd_release)` - 最適化されたリリースビルド
- `Build (amd_asan)` - Address Sanitizerビルド
- `Build (amd_tsan)` - Thread Sanitizerビルド
- `Build (amd_msan)` - Memory Sanitizerビルド
- `Build (amd_ubsan)` - Undefined Behavior Sanitizerビルド
- `Build (amd_binary)` - Thin LTOなしの高速リリースビルド
- `Build (amd_compat)` - 旧システム向け互換性ビルド
- `Build (amd_musl)` - musl libcを使用したビルド
- `Build (amd_darwin)` - macOSビルド
- `Build (amd_freebsd)` - FreeBSDビルド

**ARM64ビルド:**

- `Build (arm_release)` - ARM64最適化リリースビルド
- `Build (arm_asan)` - ARM64 Address Sanitizerビルド
- `Build (arm_coverage)` - カバレッジ計測機能付きARM64ビルド
- `Build (arm_binary)` - Thin LTOなしのARM64高速リリースビルド
- `Build (arm_darwin)` - macOS ARM64ビルド
- `Build (arm_v80compat)` - ARMv8.0互換性ビルド

**その他のアーキテクチャ:**

- `Build (ppc64le)` - PowerPC 64ビット リトルエンディアン
- `Build (riscv64)` - RISC-V 64ビット
- `Build (s390x)` - IBM System/390 64ビット
- `Build (loongarch64)` - LoongArch 64ビット

ジョブが成功すると、ビルド結果は`<repo_root>/ci/tmp/build`ディレクトリで利用可能になります。

**注意:** 「その他のアーキテクチャ」カテゴリに含まれないビルド(クロスコンパイルを使用)の場合、`BUILD_JOB_NAME`で指定されたビルドを生成するには、ローカルマシンのアーキテクチャがビルドタイプと一致している必要があります。

#### 例 {#example-run-local}

ローカルでデバッグビルドを実行するには:

```bash
python -m ci.praktika run "Build (amd_debug)"
```


上記の方法がうまくいかない場合は、ビルドログのcmakeオプションを使用して、[一般的なビルドプロセス](../development/build.md)に従ってください。

## Functional stateless tests {#functional-stateless-tests}

リリース、デバッグ、サニタイザー付きなど、さまざまな構成でビルドされたClickHouseバイナリに対して[ステートレス機能テスト](tests.md#functional-tests)を実行します。
レポートを確認してどのテストが失敗したかを特定し、[こちら](/development/tests#functional-tests)の説明に従ってローカル環境で失敗を再現してください。
再現には正しいビルド構成を使用する必要があります。テストはAddressSanitizerでは失敗してもDebugでは成功する場合があることに注意してください。
[CIビルドチェックページ](/install/advanced)からバイナリをダウンロードするか、ローカルでビルドしてください。


## 統合テスト {#integration-tests}

[統合テスト](tests.md#integration-tests)を実行します。


## バグ修正検証チェック {#bugfix-validate-check}

masterブランチでビルドされたバイナリで、新しいテスト（機能テストまたは統合テスト）または変更されたテストが失敗することを確認します。
このチェックは、プルリクエストに「pr-bugfix」ラベルが付いている場合にトリガーされます。


## ストレステスト {#stress-test}

複数のクライアントから並行してステートレス機能テストを実行し、同時実行に関連するエラーを検出します。失敗した場合:

    * まず他のすべてのテスト失敗を修正する
    * レポートを確認してサーバーログを見つけ、エラーの原因となる可能性のある事項を確認する


## 互換性チェック {#compatibility-check}

古いlibcバージョンのディストリビューションで`clickhouse`バイナリが実行できることを確認します。
失敗した場合は、メンテナーに支援を求めてください。


## AST fuzzer {#ast-fuzzer}

ランダムに生成されたクエリを実行してプログラムエラーを検出します。
失敗した場合は、メンテナーに支援を求めてください。


## パフォーマンステスト {#performance-tests}

クエリパフォーマンスの変化を測定します。
これは最も時間のかかるチェックで、実行に約6時間を要します。
パフォーマンステストレポートの詳細については、[こちら](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)を参照してください。
