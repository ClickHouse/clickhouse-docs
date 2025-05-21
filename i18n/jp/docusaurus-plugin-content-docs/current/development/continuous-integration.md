description: 'ClickHouse の継続的インテグレーションシステムの概要'
sidebar_label: '継続的インテグレーション (CI)'
sidebar_position: 55
slug: /development/continuous-integration
title: '継続的インテグレーション (CI)'
```


# 継続的インテグレーション (CI)

プルリクエストを送信すると、ClickHouse の [継続的インテグレーション (CI) システム](tests.md#test-automation)によって、自動的にコードのチェックが実行されます。  
これは、リポジトリのメンテナがあなたのコードを審査し、プルリクエストに `can be tested` ラベルを追加した後に行われます。  
チェックの結果は、[GitHub チェックのドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)に記載されているように、GitHub プルリクエストページにリストされます。  
チェックが失敗した場合、修正が必要かもしれません。  
このページでは、遭遇する可能性のあるチェックの概要と、それを修正するための方法を紹介します。

もしチェックの失敗があなたの変更に関連していないと思われる場合、それは一時的な失敗かインフラストラクチャの問題かもしれません。  
プルリクエストに空のコミットをプッシュして CI チェックを再起動します：

```shell
git reset
git commit --allow-empty
git push
```

どうすればよいかわからない場合は、メンテナに助けを求めてください。

## マスターとのマージ {#merge-with-master}

PR が master にマージできるかを検証します。  
できない場合、`Cannot fetch mergecommit` というメッセージと共に失敗します。  
このチェックを修正するには、[GitHub のドキュメント](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github)に記載されているように、競合を解決するか、`master` ブランチをプルリクエストのブランチにマージします。  

## ドキュメントチェック {#docs-check}

ClickHouse ドキュメントサイトをビルドしようとします。  
ドキュメント内で何かを変更した場合、失敗する可能性があります。  
最も考えられる理由は、ドキュメント内のいくつかのクロスリンクが間違っていることです。  
チェックレポートに移動し、`ERROR` と `WARNING` メッセージを探してください。

## 説明チェック {#description-check}

プルリクエストの説明がテンプレート [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md) に準拠しているかを確認します。  
変更に対するチェンジログカテゴリ（例：バグ修正）を指定し、[CHANGELOG.md](../whats-new/changelog/index.md) に対策を説明するユーザーフレンドリーメッセージを書く必要があります。

## DockerHub へのプッシュ {#push-to-dockerhub}

ビルドとテストに使用される Docker イメージをビルドし、それを DockerHub にプッシュします。

## マーカー確認 {#marker-check}

このチェックは、CI システムがプルリクエストの処理を開始したことを意味します。  
'pending' 状態である場合、すべてのチェックがまだ開始されていないことを意味します。  
すべてのチェックが開始されると、状態が 'success' に変わります。

## スタイルチェック {#style-check}

コードベースに対してさまざまなスタイルチェックを実施します。

スタイルチェックジョブの基本チェック：

##### cpp {#cpp}
[`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) スクリプトを使用して、単純な正規表現ベースのコードスタイルチェックを実施します（このスクリプトはローカルでも実行可能です）。  
失敗した場合は、[コーディングスタイルガイド](style.md) に従ってスタイルの問題を修正してください。

##### codespell, aspell {#codespell}
文法ミスやタイポをチェックします。

##### mypy {#mypy}
Python コードの静的型チェックを実施します。

### スタイルチェックジョブをローカルで実行する {#running-style-check-locally}

_スタイルチェック_ ジョブ全体は、次のコマンドでローカルで Docker コンテナ内で実行できます：

```sh
python -m ci.praktika run "Style check"
```

特定のチェック（例：_cpp_ チェック）を実行するには：
```sh
python -m ci.praktika run "Style check" --test cpp
```

これらのコマンドは、`clickhouse/style-test` Docker イメージをプルし、コンテナ化された環境でジョブを実行します。  
Python 3 と Docker 以外の依存関係は必要ありません。

## ファストテスト {#fast-test}

通常、これは PR に対して最初に実行されるチェックです。  
ClickHouse をビルドし、[ステートレス関数テスト](tests.md#functional-tests)のほとんどを実行しますが、いくつかは省略します。  
失敗した場合、修正されるまでさらにチェックは開始されません。  
どのテストが失敗したかをレポートで確認し、その後、[こちら](https://development/tests#running-a-test-locally)に記載されている手順に従ってローカルで再現します。

#### ファストテストをローカルで実行する: {#running-fast-test-locally}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

これらのコマンドは、`clickhouse/fast-test` Docker イメージをプルし、コンテナ化された環境でジョブを実行します。  
Python 3 と Docker 以外の依存関係は必要ありません。

## ビルドチェック {#build-check}

さまざまな構成で ClickHouse をビルドし、更なるステップに使用します。  
失敗したビルドは修正する必要があります。  
ビルドログにはエラーを修正するのに十分な情報が含まれていることが多いですが、ローカルで失敗を再現する必要があるかもしれません。  
`cmake` オプションはビルドログにありますので、`cmake` で検索してください。  
これらのオプションを使用し、[一般的なビルドプロセス](../development/build.md)に従ってください。

### レポートの詳細 {#report-details}

- **コンパイラ**: `clang-19`、オプションでターゲットプラットフォームの名前
- **ビルドタイプ**: `Debug` または `RelWithDebInfo`（cmake）。
- **サニタイザー**: `none`（サニタイザーなし）、`address`（ASan）、`memory`（MSan）、`undefined`（UBSan）、または `thread`（TSan）。
- **ステータス**: `success` または `fail`
- **ビルドログ**: ビルドとファイルコピーのログへのリンク、ビルドが失敗した場合に便利です。
- **ビルド時間**。
- **アーティファクト**: ビルド結果ファイル（`XXX`はサーバーバージョン、例：`20.8.1.4344`）。
  - `clickhouse-client_XXX_amd64.deb`
  - `clickhouse-common-static-dbg_XXX[+asan, +msan, +ubsan, +tsan]_amd64.deb`
  - `clickhouse-common-staticXXX_amd64.deb`
  - `clickhouse-server_XXX_amd64.deb`
  - `clickhouse`: メインビルドバイナリ。
  - `clickhouse-odbc-bridge`
  - `unit_tests_dbms`: ClickHouse のユニットテストを含む GoogleTest バイナリ。
  - `performance.tar.zst`: パフォーマンステスト用の特別パッケージ。

## 特別ビルドチェック {#special-build-check}

`clang-tidy` を使用して静的分析とコードスタイルチェックを実施します。ビルドログに類似したレポートが生成されます。ビルドログで見つかったエラーを修正してください。

#### clang-tidy をローカルで実行する {#running-clang-tidy-locally}

便利な `packager` スクリプトがあり、Docker で clang-tidy ビルドを実行します：
```sh
mkdir build_tidy
./docker/packager/packager --output-dir=./build_tidy --package-type=binary --compiler=clang-19 --debug-build --clang-tidy
```

## ステートレス関数テスト {#functional-stateless-tests}

様々な構成でビルドされた ClickHouse バイナリのために [ステートレス関数テスト](tests.md#functional-tests) を実行します。  
どのテストが失敗したかをレポートで確認し、その後、[こちら](https://development/tests#functional-tests)に記載されている手順に従ってローカルで再現します。  
正しいビルド構成を使用する必要がありますので、AddressSanitizer の下では失敗するが Debug では合格するかもしれません。  
[CI ビルドチェックページ](/install/advanced) からバイナリをダウンロードするか、ローカルでビルドします。

## ステートフル関数テスト {#functional-stateful-tests}

[ステートフル関数テスト](tests.md#functional-tests)を実行します。  
ステートレス関数テストと同じ方法で扱ってください。  
違いは、実行するために [clickstream データセット](../getting-started/example-datasets/metrica.md) の `hits` と `visits` テーブルが必要なことです。

## 統合テスト {#integration-tests}

[統合テスト](tests.md#integration-tests)を実行します。

## バグ修正検証チェック {#bugfix-validate-check}

新しいテスト（関数または統合）または、マスターブランチでビルドされたバイナリで失敗している変更されたテストが存在するかチェックします。  
このチェックはプルリクエストが "pr-bugfix" ラベルを持っている場合にトリガーされます。

## ストレステスト {#stress-test}

複数のクライアントから同時にステートレス関数テストを実行して、同時実行に関連するエラーを検出します。失敗した場合は：

* まず、他のすべてのテストの失敗を修正します。
* レポートを確認してサーバーログを見つけ、エラーの可能性のある原因を確認します。

## 互換性チェック {#compatibility-check}

`clickhouse` バイナリが古い libc バージョンのディストリビューションで動作するかを確認します。  
失敗した場合、メンテナに助けを求めてください。

## AST ファザー {#ast-fuzzer}

ランダムに生成されたクエリを実行して、プログラムのエラーをキャッチします。  
失敗した場合、メンテナに助けを求めてください。

## パフォーマンステスト {#performance-tests}

クエリパフォーマンスの変化を測定します。  
これは、実行に約 6 時間かかる最も長いチェックです。  
パフォーマンステストレポートの詳細については、[こちら](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)を参照してください。
