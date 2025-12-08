---
sidebar_label: '概要'
slug: /integrations/dbt
sidebar_position: 1
description: 'ユーザーは dbt を使用して ClickHouse のデータを変換およびモデリングできます'
title: 'dbt と ClickHouse の連携'
keywords: ['dbt', 'データ変換', 'アナリティクスエンジニアリング', 'SQL モデリング', 'ELT パイプライン']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_integration'
  - website: 'https://github.com/ClickHouse/dbt-clickhouse'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# dbt と ClickHouse の連携 {#integrate-dbt-clickhouse}

<ClickHouseSupportedBadge/>

## dbt-clickhouse アダプター {#dbt-clickhouse-adapter}

**dbt** (data build tool) は、アナリティクスエンジニアが単に SELECT ステートメントを書くことで、データウェアハウス内のデータを変換できるようにするツールです。dbt は、これらの SELECT ステートメントをテーブルやビューといったデータベース内のオブジェクトとしてマテリアライズし、[Extract Load and Transform (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform) における T の部分を担います。ユーザーは、SELECT ステートメントによって定義されたモデルを作成できます。

dbt 内では、これらのモデルを相互参照してレイヤー化することで、より高レベルな概念を構築できます。モデル同士を接続するために必要な定型的な SQL は自動的に生成されます。さらに dbt は、モデル間の依存関係を特定し、有向非巡回グラフ (DAG) を用いて、適切な順序でモデルが作成されるようにします。

dbt は、[ClickHouse 公認アダプター](https://github.com/ClickHouse/dbt-clickhouse) を通じて ClickHouse と連携して動作します。

<TOCInline toc={toc}  maxHeadingLevel={2} />

## サポートされている機能 {#supported-features}

サポート対象機能一覧:
- [x] テーブルマテリアライゼーション
- [x] ビューマテリアライゼーション
- [x] 増分マテリアライゼーション
- [x] マイクロバッチ増分マテリアライゼーション
- [x] マテリアライズドビューによるマテリアライゼーション（`TO` 形式の MATERIALIZED VIEW を使用、実験的）
- [x] シード
- [x] ソース
- [x] ドキュメント生成
- [x] テスト
- [x] スナップショット
- [x] ほとんどの dbt-utils マクロ（現在は dbt-core に含まれています）
- [x] エフェメラルマテリアライゼーション
- [x] 分散テーブルマテリアライゼーション（実験的）
- [x] 分散増分マテリアライゼーション（実験的）
- [x] コントラクト
- [x] ClickHouse 固有のカラム設定（Codec、TTL など）
- [x] ClickHouse 固有のテーブル設定（インデックス、プロジェクションなど）

dbt-core 1.10 までのすべての機能がサポートされています。これには `--sample` フラグや、将来のリリースに向けて修正されたすべての非推奨に関する警告が含まれます。dbt 1.10 で導入された **カタログ連携**（例: Iceberg）は、このアダプターではまだネイティブにサポートされていませんが、回避策は利用可能です。詳細については [Catalog Support セクション](/integrations/dbt/features-and-configurations#catalog-support) を参照してください。

このアダプターは現時点ではまだ [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview) 内では利用できませんが、近いうちに利用可能にする予定です。詳細についてはサポートまでお問い合わせください。

## 概念 {#concepts}

dbt は「モデル (model)」という概念を導入します。これは、複数のテーブルを結合することもある SQL 文として定義されます。モデルは複数の方法で「マテリアライズ」できます。マテリアライゼーションは、そのモデルの SELECT クエリに対するビルド戦略を表します。マテリアライゼーションを実装するコードは、SELECT クエリをラップして新しいリレーションを作成したり、既存のリレーションを更新したりするための定型的な SQL です。

dbt は 4 種類のマテリアライゼーションを提供します:

* **view** (デフォルト): モデルはデータベース内の view として構築されます。
* **table**: モデルはデータベース内の table として構築されます。
* **ephemeral**: モデル自体はデータベース内に直接構築されず、代わりに依存するモデル内で共通テーブル式 (CTE) として取り込まれます。
* **incremental**: 初回はモデルを table としてマテリアライズし、その後の実行では、dbt が新規行の挿入と変更行の更新のみを table に対して行います。

追加の構文や句によって、基盤となるデータが変更された場合に、これらのモデルをどのように更新すべきかが定義されます。dbt では一般的に、パフォーマンスが問題になるまでは view マテリアライゼーションから始めることを推奨しています。table マテリアライゼーションは、モデルのクエリ結果を table として保持することで、ストレージ使用量の増加と引き換えにクエリ時のパフォーマンスを向上させます。incremental アプローチはこれをさらに発展させ、基盤となるデータへのその後の更新をターゲット table に取り込めるようにします。

ClickHouse 向けの[現在のアダプタ](https://github.com/silentsokolov/dbt-clickhouse)は、**materialized view**、**dictionary**、**distributed table**、および **distributed incremental** マテリアライゼーションもサポートします。また、このアダプタは dbt の[スナップショット](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)および [seeds](https://docs.getdbt.com/docs/building-a-dbt-project/seeds) もサポートします。

### サポートされているマテリアライゼーションの詳細 {#details-about-supported-materializations}

| Type                        | Supported? | Details                                                                                                                          |
|-----------------------------|-----------|----------------------------------------------------------------------------------------------------------------------------------|
| view materialization        | はい      | [view](https://clickhouse.com/docs/en/sql-reference/table-functions/view/) を作成します。                                         |
| table materialization       | はい      | [table](https://clickhouse.com/docs/en/operations/system-tables/tables/) を作成します。サポートされているエンジンの一覧については、以下を参照してください。 |
| incremental materialization | はい      | table が存在しない場合は作成し、その後は更新分のみを書き込みます。                                                                 |
| ephemeral materialized      | はい      | ephemeral/CTE マテリアライゼーションを作成します。このモデルは dbt の内部専用であり、データベースオブジェクトは作成しません。      |

以下は ClickHouse における[実験的機能](https://clickhouse.com/docs/en/beta-and-experimental-features)です:

| Type                                    | Supported?        | Details                                                                                                                                                                                                                                         |
|-----------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Materialized View materialization       | はい（実験的）    | [マテリアライズドビュー](https://clickhouse.com/docs/en/materialized-view) を作成します。                                                                                                                                                       |
| Distributed table materialization       | はい（実験的）    | [distributed table](https://clickhouse.com/docs/en/engines/table-engines/special/distributed) を作成します。                                                                                                                                    |
| Distributed incremental materialization | はい（実験的）    | distributed table と同じ考え方に基づく incremental モデルです。すべての戦略がサポートされているわけではない点に注意してください。詳細については[こちら](https://github.com/ClickHouse/dbt-clickhouse?tab=readme-ov-file#distributed-incremental-materialization)を参照してください。 |
| Dictionary materialization              | はい（実験的）    | [dictionary](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary) を作成します。                                                                                                                                            |

## dbt と ClickHouse アダプターのセットアップ {#setup-of-dbt-and-the-clickhouse-adapter}

### dbt-core と dbt-clickhouse のインストール {#install-dbt-core-and-dbt-clickhouse}

dbt のコマンドラインインターフェイス (CLI) のインストール方法にはいくつかの選択肢があり、詳細は[こちら](https://docs.getdbt.com/dbt-cli/install/overview)に記載されています。dbt と dbt-clickhouse の両方をインストールするには、`pip` の利用を推奨します。

```sh
pip install dbt-core dbt-clickhouse
```


### ClickHouse インスタンスへの接続情報を dbt に提供する {#provide-dbt-with-the-connection-details-for-our-clickhouse-instance}

`~/.dbt/profiles.yml` ファイル内で `clickhouse-service` プロファイルを構成し、`schema`、`host`、`port`、`user`、`password` プロパティを指定します。接続構成オプションの全一覧は、[機能と設定](/integrations/dbt/features-and-configurations) ページに記載されています。

```yaml
clickhouse-service:
  target: dev
  outputs:
    dev:
      type: clickhouse
      schema: [ default ] # dbtモデル用ClickHouseデータベース

      # オプション
      host: [ localhost ]
      port: [ 8123 ]  # secureおよびdriverの設定に応じてデフォルト値は8123、8443、9000、9440 
      user: [ default ] # 全データベース操作用ユーザー
      password: [ <empty string> ] # ユーザーパスワード
      secure: True  # TLS(ネイティブプロトコル)またはHTTPS(httpプロトコル)を使用
```


### dbt プロジェクトを作成する {#create-a-dbt-project}

これで、このプロファイルを既存のいずれかのプロジェクトで使用することも、次のコマンドで新しいプロジェクトを作成することもできます。

```sh
dbt init project_name
```

`project_name` ディレクトリ内の `dbt_project.yml` ファイルを編集し、ClickHouse サーバーへの接続に使用するプロファイル名を指定します。

```yaml
profile: 'clickhouse-service'
```


### 接続テスト {#test-connection}

CLI で `dbt debug` を実行し、dbt が ClickHouse に接続できるかどうかを確認します。レスポンスに `Connection test: [OK connection ok]` が含まれていることを確認し、接続が成功していることを確かめてください。

ClickHouse と dbt の連携方法の詳細については、[ガイドページ](/integrations/dbt/guides) を参照してください。

### モデルのテストとデプロイ (CI/CD) {#testing-and-deploying-your-models-ci-cd}

dbt プロジェクトをテストおよびデプロイする方法は多数あります。dbt では、[ベストプラクティスとされるワークフロー](https://docs.getdbt.com/best-practices/best-practice-workflows#pro-tips-for-workflows) や [CI ジョブ](https://docs.getdbt.com/docs/deploy/ci-jobs) に関するいくつかの提案を提示しています。ここではいくつかの戦略について説明しますが、これらの戦略はユースケースに合わせて大幅な調整が必要になる場合がある点に注意してください。

#### シンプルなデータテストおよびユニットテストによる CI/CD {#ci-with-simple-data-tests-and-unit-tests}

CI パイプラインを手軽に立ち上げる方法の 1 つは、ジョブ内で ClickHouse クラスターを起動し、そのクラスターに対してモデルを実行することです。モデルを実行する前に、このクラスターにデモデータを挿入できます。[seed](https://docs.getdbt.com/reference/commands/seed) を使って、本番データのサブセットをステージング環境に投入することもできます。

データを挿入したら、[データテスト](https://docs.getdbt.com/docs/build/data-tests) と [ユニットテスト](https://docs.getdbt.com/docs/build/unit-tests) を実行できます。

CD ステップは、本番の ClickHouse クラスターに対して `dbt build` を実行するだけのシンプルなものにできます。

#### より完全な CI/CD ステージ: 最新データを使用し、影響を受けたモデルのみをテストする {#more-complete-ci-stage}

一般的な戦略として、変更されたモデル（およびその上流・下流の依存関係）のみを再デプロイする [Slim CI](https://docs.getdbt.com/best-practices/best-practice-workflows#run-only-modified-models-to-test-changes-slim-ci) ジョブを使用する方法があります。このアプローチでは、本番環境での実行から得られるアーティファクト（[dbt manifest](https://docs.getdbt.com/reference/artifacts/manifest-json) など）を利用して、プロジェクトの実行時間を短縮しつつ、環境間でスキーマドリフトが発生しないようにします。

開発環境を同期させ、古いデプロイに対してモデルを実行してしまうことを避けるために、[clone](https://docs.getdbt.com/reference/commands/clone) や [defer](https://docs.getdbt.com/reference/node-selection/defer) を利用することができます。

本番環境の運用に影響を与えないよう、テスト環境（いわゆるステージング環境）には専用の ClickHouse クラスターまたはサービスを使用することを推奨します。テスト環境が本番環境を適切に反映したものとなるよう、本番データのサブセットを使用し、かつ環境間でスキーマドリフトが発生しないような形で dbt を実行することが重要です。

- テストで最新データが不要な場合は、本番データのバックアップをステージング環境に復元することができます。
- テストで最新データが必要な場合は、[`remoteSecure()` テーブル関数](/sql-reference/table-functions/remote) とリフレッシャブルmaterialized view を組み合わせて、任意の頻度でデータを挿入できます。別の選択肢として、オブジェクトストレージを中間ストレージとして利用し、本番サービスから定期的にデータを書き出してから、オブジェクトストレージテーブル関数や ClickPipes（継続的なインジェスト用）を使用してステージング環境にインポートすることも可能です。

CI テスト用に専用の環境を用意すると、本番環境に影響を与えずに手動テストを実施することもできます。例えば、この環境を BI ツールの接続先としてテストに利用することができます。

デプロイ（つまり CD ステップ）の際には、本番デプロイ時のアーティファクトを使用して、変更のあったモデルのみを更新することを推奨します。そのためには、dbt のアーティファクト用にオブジェクトストレージ（例：S3）を中間ストレージとして設定しておく必要があります。このセットアップが完了したら、`dbt build --select state:modified+ --state path/to/last/deploy/state.json` のようなコマンドを実行することで、本番での前回の実行からの変更に基づいて、必要最小限のモデルのみを選択的に再構築できます。

## よくある問題のトラブルシューティング {#troubleshooting-common-issues}

### 接続 {#troubleshooting-connections}

dbt から ClickHouse へ接続する際に問題が発生する場合は、次の条件を満たしていることを確認してください。

- エンジンは[サポートされているエンジン](/integrations/dbt/features-and-configurations#supported-table-engines)のいずれかである必要があります。
- データベースにアクセスするための十分な権限を持っている必要があります。
- データベースのデフォルトのテーブルエンジンを使用していない場合は、モデルの設定でテーブルエンジンを指定する必要があります。

### 長時間実行される処理について {#understanding-long-running-operations}

一部の処理は、特定の ClickHouse クエリが原因で、想定より長時間かかる場合があります。どのクエリの処理時間が長くなっているかをより詳しく把握するには、[ログレベル](https://docs.getdbt.com/reference/global-configs/logs#log-level)を `debug` に引き上げてください。これにより、各クエリに要した時間が出力されます。たとえば、dbt コマンドに `--log-level debug` を付与して実行することで実現できます。

## 制限事項 {#limitations}

現在の dbt 向け ClickHouse アダプターには、ユーザーが認識しておくべきいくつかの制限事項があります。

- このプラグインは、ClickHouse バージョン 25.3 以降を必要とする構文を使用します。古いバージョンの ClickHouse についてはテストしていません。また、現在は Replicated テーブルについてもテストしていません。
- `dbt-adapter` を同時に実行した場合、内部的に同じ操作に対して同じテーブル名を使用する可能性があるため、複数の実行が衝突する場合があります。詳細については、issue [#420](https://github.com/ClickHouse/dbt-clickhouse/issues/420) を参照してください。
- アダプターは現在、[INSERT INTO SELECT](https://clickhouse.com/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) を使用してモデルをテーブルとしてマテリアライズします。これは、実行を再度行った場合に、事実上データが重複することを意味します。非常に大規模なデータセット（PB 規模）の場合、実行時間が極めて長くなり、一部のモデルは実用的でなくなる可能性があります。パフォーマンスを向上させるには、ビューを `materialized: materialization_view` として実装し、ClickHouse のマテリアライズドビューを使用してください。さらに、可能な限り `GROUP BY` を活用して、任意のクエリが返す行数を最小限に抑えるようにしてください。ソースの行数を維持したまま単に変換するモデルよりも、データを要約するモデルを優先してください。
- Distributed テーブルを使用してモデルを表現するには、ユーザーが各ノード上に基礎となる Replicated テーブルを手動で作成する必要があります。その上に Distributed テーブルを作成できます。アダプターはクラスターの作成を管理しません。
- dbt がデータベースにリレーション（テーブル/ビュー）を作成する場合、通常は `{{ database }}.{{ schema }}.{{ table/view id }}` の形式で作成します。ClickHouse にはスキーマの概念がありません。そのためアダプターは `{{schema}}.{{ table/view id }}` を使用し、ここで `schema` は ClickHouse のデータベースを意味します。
- dbt でエフェメラルモデル/CTE を ClickHouse の INSERT 文中の `INSERT INTO` より前に配置すると動作しません。https://github.com/ClickHouse/ClickHouse/issues/30323 を参照してください。これはほとんどのモデルには影響しないはずですが、エフェメラルモデルをモデル定義やその他の SQL 文のどこに配置するかについては注意が必要です。 <!-- TODO review this limitation, looks like the issue was already closed and the fix was introduced in 24.10 -->

## Fivetran {#fivetran}

`dbt-clickhouse` コネクタは [Fivetran transformations](https://fivetran.com/docs/transformations/dbt) でも利用でき、Fivetran プラットフォーム内で `dbt` を使用してシームレスに統合および変換を実行できます。