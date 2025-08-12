---
description: 'ClickHouseの継続的インテグレーションシステムの概要'
sidebar_label: '継続的インテグレーション（CI）'
sidebar_position: 55
slug: '/development/continuous-integration'
title: '継続的インテグレーション（CI）'
---

# 継続的インテグレーション (CI)

プルリクエストを送信すると、ClickHouse の [継続的インテグレーション (CI) システム](tests.md#test-automation) によってコードの自動チェックが実行されます。
これは、リポジトリのメンテナがあなたのコードを確認し、プルリクエストに `can be tested` ラベルを追加した後に行われます。
チェックの結果は、[GitHub チェックのドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks) に記載されているように、GitHub プルリクエストページにリストされます。
チェックが失敗した場合は、それを修正する必要があるかもしれません。
このページでは、遭遇する可能性のあるチェックの概要と、それを修正するためにできることについて説明します。

チェックの失敗があなたの変更に関連していないように見える場合、それは一時的な失敗やインフラストラクチャの問題である可能性があります。
CI チェックを再起動するためには、プルリクエストに空のコミットをプッシュしてください：

```shell
git reset
git commit --allow-empty
git push
```

何をすべきか分からない場合は、メンテナに助けを求めてください。

## マスターへのマージ {#merge-with-master}

PRがマスターにマージできるかどうかを確認します。
できない場合は、`Cannot fetch mergecommit` というメッセージで失敗します。
このチェックを修正するには、[GitHub のドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github)に記載されているように、競合を解決するか、`master` ブランチをプルリクエストブランチにマージします。

## ドキュメントチェック {#docs-check}

ClickHouse ドキュメントサイトのビルドを試みます。
ドキュメントに何か変更があった場合、失敗する可能性があります。
最も可能性の高い理由は、ドキュメント内のいくつかのクロスリンクが正しくないことです。
チェックレポートに行き、`ERROR` および `WARNING` メッセージを探してください。

## 説明チェック {#description-check}

プルリクエストの説明が [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md) テンプレートに従っているかどうかを確認します。
変更に対して変更履歴のカテゴリを指定する必要があります (例えば、バグ修正)、および [CHANGELOG.md](../whats-new/changelog/index.md) に変更を説明するユーザー向けのメッセージを書く必要があります。

## DockerHub へのプッシュ {#push-to-dockerhub}

ビルドとテストに使用する docker イメージをビルドし、それを DockerHub にプッシュします。

## マーカー チェック {#marker-check}

このチェックは、CI システムがプルリクエストの処理を開始したことを意味します。
「pending」ステータスは、すべてのチェックがまだ開始されていないことを示します。
すべてのチェックが開始されると、ステータスが「success」に変更されます。

## スタイル チェック {#style-check}

コードベースに対してさまざまなスタイルチェックを実行します。

スタイルチェックジョブの基本チェック：

##### cpp {#cpp}
[`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) スクリプトを使用して、単純な正規表現ベースのコードスタイルチェックを行います (このスクリプトはローカルでも実行できます)。  
失敗した場合は、[コードスタイルガイド](style.md)に従ってスタイルの問題を修正してください。

##### codespell, aspell {#codespell}
文法の間違いやタイポをチェックします。

##### mypy {#mypy}
Python コードの静的型チェックを実行します。

### スタイル チェック ジョブをローカルで実行する {#running-style-check-locally}

_Style Check_ ジョブ全体を以下のコマンドで Docker コンテナ内でローカルに実行できます：

```sh
python -m ci.praktika run "Style check"
```

特定のチェック (例: _cpp_ チェック) を実行するには：
```sh
python -m ci.praktika run "Style check" --test cpp
```

これらのコマンドは `clickhouse/style-test` Docker イメージをプルし、コンテナ化された環境内でジョブを実行します。
Python 3 と Docker 以外の依存関係は必要ありません。

## ファストテスト {#fast-test}

通常、これは PR のために最初に実行されるチェックです。
ClickHouse をビルドし、ほとんどの [ステートレスな機能テスト](tests.md#functional-tests) を実行し、いくつかを省略します。
失敗した場合、それが修正されるまで追加のチェックは開始されません。
どのテストが失敗したかを報告書で確認し、[こちら](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report) の説明に従ってローカルで失敗を再現してください。

#### ローカルでファストテストを実行する： {#running-fast-test-locally}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

これらのコマンドは `clickhouse/fast-test` Docker イメージをプルし、コンテナ化された環境内でジョブを実行します。
Python 3 と Docker 以外の依存関係は必要ありません。

## ビルド チェック {#build-check}

さまざまな構成で ClickHouse をビルドし、次のステップで使用します。
失敗したビルドを修正する必要があります。
ビルドログにはエラーを修正するための十分な情報が含まれていることがよくありますが、失敗をローカルで再現する必要があるかもしれません。
`cmake` オプションはビルドログに見つけることができ、`cmake` で `grep` します。
これらのオプションを使用して、[一般的なビルドプロセス](../development/build.md)に従ってください。

### レポート詳細 {#report-details}

- **コンパイラ**: `clang-19`、ターゲットプラットフォームの名前をオプションとして指定できます
- **ビルドタイプ**: `Debug` または `RelWithDebInfo` (cmake)。
- **サニタイザー**: `none` (サニタイザーなし)、`address` (ASan)、`memory` (MSan)、`undefined` (UBSan)、または `thread` (TSan)。
- **ステータス**: `success` または `fail`
- **ビルドログ**: ビルドおよびファイルコピーのログへのリンク。ビルドに失敗した場合に役立ちます。
- **ビルド時間**。
- **アーティファクト**: ビルド結果ファイル (`XXX` はサーバーバージョン、例: `20.8.1.4344`)。
  - `clickhouse-client_XXX_amd64.deb`
  - `clickhouse-common-static-dbg_XXX[+asan, +msan, +ubsan, +tsan]_amd64.deb`
  - `clickhouse-common-staticXXX_amd64.deb`
  - `clickhouse-server_XXX_amd64.deb`
  - `clickhouse`: メインビルドバイナリ。
  - `clickhouse-odbc-bridge`
  - `unit_tests_dbms`: ClickHouse ユニットテストを持つ GoogleTest バイナリ。
  - `performance.tar.zst`: パフォーマンステスト用の特別なパッケージ。


## 特別ビルドチェック {#special-build-check}
静的分析およびコードスタイルチェックを `clang-tidy` を使用して実行します。レポートは [ビルドチェック](#build-check) に類似しています。ビルドログで見つかったエラーを修正してください。

#### ローカルで clang-tidy を実行する： {#running-clang-tidy-locally}

Docker で clang-tidy ビルドを実行する便利な `packager` スクリプトがあります。
```sh
mkdir build_tidy
./docker/packager/packager --output-dir=./build_tidy --package-type=binary --compiler=clang-19 --debug-build --clang-tidy
```

## 機能的ステートレス テスト {#functional-stateless-tests}
さまざまな構成でビルドされた ClickHouse バイナリのための [ステートレスな機能テスト](tests.md#functional-tests) を実行します -- リリース、デバッグ、サニタイザー付きなど。
どのテストが失敗したかを報告書で確認し、[こちら](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report) の説明に従ってローカルで失敗を再現してください。
正しいビルド構成を使用して再現する必要があります。アドレスサニタイザーでは失敗するテストも、デバッグでは合格する可能性があります。
[CI ビルドチェックページ](/install/advanced) からバイナリをダウンロードするか、ローカルでビルドしてください。

## 機能的ステートフル テスト {#functional-stateful-tests}

[状態を持つ機能テスト](tests.md#functional-tests)を実行します。
それらは機能的ステートレス テストと同じ方法で扱います。
違いは、`hits` および `visits` テーブルが [clickstream データセット](../getting-started/example-datasets/metrica.md)から必要であることです。

## 統合テスト {#integration-tests}
[integration tests](tests.md#integration-tests)を実行します。

## バグ修正検証チェック {#bugfix-validate-check}

新しいテスト (機能または統合) があるか、マスターブランチでビルドされたバイナリで失敗する変更されたテストがあるかどうかを確認します。
このチェックは、プルリクエストに「pr-bugfix」ラベルが付けられるとトリガーされます。

## ストレステスト {#stress-test}
複数のクライアントから同時にステートレスな機能テストを実行し、並行性に関連するエラーを検出します。失敗した場合：

    * 最初に他のすべてのテストの失敗を修正します；
    * レポートを見てサーバーログを見つけ、それらのエラーの可能性のある原因を確認します。

## 互換性チェック {#compatibility-check}

`clickhouse` バイナリが古い libc バージョンを持つディストリビューションで実行できるかどうかを確認します。
失敗した場合は、メンテナに助けを求めてください。

## AST ファザー {#ast-fuzzer}
プログラムエラーをキャッチするためにランダムに生成されたクエリを実行します。
失敗した場合は、メンテナに助けを求めてください。

## パフォーマンステスト {#performance-tests}
クエリパフォーマンスの変化を測定します。
これは約 6 時間かかる最も長いチェックです。
パフォーマンステストの報告は、[こちら](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report) に詳しく説明されています。
