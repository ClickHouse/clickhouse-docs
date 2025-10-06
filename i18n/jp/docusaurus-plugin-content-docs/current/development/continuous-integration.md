---
'description': 'ClickHouseの継続的インテグレーションシステムの概要'
'sidebar_label': '継続的インテグレーション (CI)'
'sidebar_position': 55
'slug': '/development/continuous-integration'
'title': '継続的インテグレーション (CI)'
'doc_type': 'reference'
---


# 継続的インテグレーション (CI)

プルリクエストを送信すると、ClickHouseの [継続的インテグレーション (CI) システム](tests.md#test-automation) による自動チェックがあなたのコードに対して実行されます。
これは、リポジトリのメンテナ（ClickHouseチームの誰か）があなたのコードを確認し、プルリクエストに `can be tested` ラベルを追加した後に行われます。
チェックの結果は、[GitHubチェックのドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)に記載されているように、GitHubのプルリクエストページに表示されます。
チェックが失敗した場合は、修正する必要があります。
このページでは、遭遇する可能性のあるチェックの概要と、それを修正するためにできることを示します。

チェックの失敗があなたの変更に関連していないように見える場合、それは一時的な失敗やインフラストラクチャの問題である可能性があります。
CIチェックを再起動するために、プルリクエストに空のコミットをプッシュします：

```shell
git reset
git commit --allow-empty
git push
```

何をすべきかわからない場合は、メンテナに助けを求めてください。

## マスターへのマージ {#merge-with-master}

PRがマスターにマージできることを確認します。
できない場合は、`Cannot fetch mergecommit` というメッセージで失敗します。
このチェックを修正するには、[GitHubのドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github)に記載されているようにコンフリクトを解決するか、gitを使用して `master` ブランチをプルリクエストブランチにマージします。

## ドキュメントチェック {#docs-check}

ClickHouseのドキュメントウェブサイトをビルドしようとします。
ドキュメントに何かを変更した場合、失敗することがあります。
最も考えられる理由は、ドキュメント内のいくつかの相互リンクが間違っていることです。
チェックレポートに移動し、`ERROR` および `WARNING` メッセージを探してください。

## 説明チェック {#description-check}

プルリクエストの説明が [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md) テンプレートに準拠していることを確認します。
変更のためのチェンジログカテゴリを指定する必要があり（例：バグ修正）、[CHANGELOG.md](../whats-new/changelog/index.md) の変更を説明するユーザーが読みやすいメッセージを書く必要があります。

## DockerHubへのプッシュ {#push-to-dockerhub}

ビルドおよびテストに使用されるDockerイメージをビルドし、それをDockerHubにプッシュします。

## マーカーチェック {#marker-check}

このチェックは、CIシステムがプルリクエストの処理を開始したことを示します。
'pending' ステータスの場合、すべてのチェックがまだ開始されていないことを意味します。
すべてのチェックが開始されると、ステータスが 'success' に変更されます。

## スタイルチェック {#style-check}

コードベースに対してさまざまなスタイルチェックを実行します。

スタイルチェックジョブの基本的なチェック：

##### cpp {#cpp}
[`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) スクリプトを使用して、単純な正規表現ベースのコードスタイルチェックを実行します（ローカルでも実行可能です）。  
失敗した場合は、[コードスタイルガイド](style.md)に従ってスタイルの問題を修正してください。

##### codespell, aspell {#codespell}
文法ミスやタイプミスをチェックします。

##### mypy {#mypy}
Pythonコードに対して静的型チェックを実行します。

### スタイルチェックジョブをローカルで実行 {#running-style-check-locally}

_スタイルチェック_ ジョブ全体をDockerコンテナでローカルに実行できます：

```sh
python -m ci.praktika run "Style check"
```

特定のチェック（例：_cpp_ チェック）を実行するには：
```sh
python -m ci.praktika run "Style check" --test cpp
```

これらのコマンドは `clickhouse/style-test` Dockerイメージをプルし、コンテナ化された環境でジョブを実行します。
Python 3とDockerを除いて、他に依存関係は必要ありません。

## ファストテスト {#fast-test}

通常、これはPRのために最初に実行されるチェックです。
ClickHouseをビルドし、いくつかを省略しながらほとんどの [ステートレス機能テスト](tests.md#functional-tests) を実行します。
これが失敗すると、修正されるまでさらなるチェックは開始されません。
どのテストが失敗しているかを確認するためにレポートを見て、[こちら](/development/tests#running-a-test-locally) に記載されているようにローカルで失敗を再現します。

#### ローカルでファストテストを実行する {#running-fast-test-locally}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

これらのコマンドは `clickhouse/fast-test` Dockerイメージをプルし、コンテナ化された環境でジョブを実行します。
Python 3とDockerを除いて、他に依存関係は必要ありません。

## ビルドチェック {#build-check}

さまざまな構成でClickHouseをビルドし、次のステップで使用します。

### ローカルでビルドを実行 {#running-builds-locally}

CIに似た環境でローカルにビルドを実行するには：

```bash
python -m ci.praktika run "<BUILD_JOB_NAME>"
```

Python 3とDockerを除いて、他に依存関係は必要ありません。

#### 利用可能なビルドジョブ {#available-build-jobs}

ビルドジョブ名は、CIレポートに表示されるものと正確に一致します：

**AMD64 ビルド:**
- `Build (amd_debug)` - シンボル付きデバッグビルド
- `Build (amd_release)` - 最適化されたリリースビルド
- `Build (amd_asan)` - アドレスサニタイザー付きビルド
- `Build (amd_tsan)` - スレッドサニタイザー付きビルド
- `Build (amd_msan)` - メモリサニタイザー付きビルド
- `Build (amd_ubsan)` - 未定義の動作サニタイザー付きビルド
- `Build (amd_binary)` - Thin LTOなしのクイックリリースビルド
- `Build (amd_compat)` - 古いシステム向けの互換性ビルド
- `Build (amd_musl)` - musl libcを使用したビルド
- `Build (amd_darwin)` - macOSビルド
- `Build (amd_freebsd)` - FreeBSDビルド

**ARM64 ビルド:**
- `Build (arm_release)` - ARM64最適化されたリリースビルド
- `Build (arm_asan)` - ARM64アドレスサニタイザー付きビルド
- `Build (arm_coverage)` - カバレッジ計測付きのARM64ビルド
- `Build (arm_binary)` - Thin LTOなしのARM64クイックリリースビルド
- `Build (arm_darwin)` - macOS ARM64ビルド
- `Build (arm_v80compat)` - ARMv8.0互換ビルド

**その他のアーキテクチャ:**
- `Build (ppc64le)` - PowerPC 64ビットリトルエンディアン
- `Build (riscv64)` - RISC-V 64ビット
- `Build (s390x)` - IBM System/390 64ビット
- `Build (loongarch64)` - LoongArch 64ビット

ジョブが成功すると、ビルド結果は `<repo_root>/ci/tmp/build` ディレクトリに保存されます。

**注意:** 「その他のアーキテクチャ」カテゴリに含まれないビルド（クロスコンパイルを使用するもの）では、ローカルマシンのアーキテクチャがビルドタイプと一致している必要があります。

#### 例 {#example-run-local}

ローカルデバッグビルドを実行するには：

```bash
python -m ci.praktika run "Build (amd_debug)"
```

上記の方法がうまくいかない場合は、ビルドログからcmakeオプションを使用し、[一般的なビルドプロセス](../development/build.md)に従ってください。
## ステートレス機能テスト {#functional-stateless-tests}

さまざまな構成でビルドされたClickHouseバイナリのための [ステートレス機能テスト](tests.md#functional-tests) を実行します。
レポートを見て、どのテストが失敗しているかを確認し、[こちら](/development/tests#functional-tests) に記載されているようにローカルで失敗を再現します。
正しいビルド構成を使用して再現する必要があることに注意してください。テストはアドレスサニタイザーの下で失敗する可能性がありますが、デバッグでは通過するかもしれません。
[CIビルドチェックページ](/install/advanced) からバイナリをダウンロードするか、ローカルでビルドしてください。

## 統合テスト {#integration-tests}

[統合テスト](tests.md#integration-tests)を実行します。

## バグ修正検証チェック {#bugfix-validate-check}

新しいテスト（機能または統合）または、マスターブランチでビルドされたバイナリに対して失敗する変更されたテストがあることを確認します。
このチェックは、プルリクエストに "pr-bugfix" ラベルが付けられたときにトリガーされます。

## ストレステスト {#stress-test}

複数のクライアントから同時にステートレス機能テストを実行し、同時実行関連のエラーを検出します。これが失敗した場合：

* 最初に他のすべてのテストの失敗を修正してください；
* レポートを見てサーバーログを見つけ、エラーの可能な原因を確認してください。

## 互換性チェック {#compatibility-check}

`clickhouse` バイナリが古いlibcバージョンを持つディストリビューションで動作することを確認します。
失敗した場合は、メンテナに助けを求めてください。

## ASTファジング {#ast-fuzzer}

ランダムに生成されたクエリを実行してプログラムエラーをキャッチします。
失敗した場合は、メンテナに助けを求めてください。

## パフォーマンステスト {#performance-tests}

クエリパフォーマンスの変化を測定します。
これは、実行にちょうど6時間未満かかる最も長いチェックです。
パフォーマンステストレポートについての詳細は [こちら](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report) に記載されています。
