---
sidebar_label: '概要'
slug: /integrations/dbt
sidebar_position: 1
description: 'dbt を使用して ClickHouse のデータを変換およびモデリングできます'
title: 'dbt と ClickHouse の連携'
keywords: ['dbt', 'データ変換', 'アナリティクス・エンジニアリング', 'SQL モデリング', 'ELT パイプライン']
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

**dbt**（data build tool）は、アナリティクスエンジニアが `SELECT` 文を書くことで、データウェアハウス内のデータを変換できるようにします。dbt は、これらの `SELECT` 文をテーブルやビューという形のデータベースオブジェクトとしてマテリアライズし、[Extract, Load, and Transform (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform) のうち T（Transform）の役割を担います。`SELECT` 文で定義されたモデルを作成することができます。

dbt では、これらのモデルを相互参照したりレイヤリングしたりすることで、より高レベルなモデルや概念を構築できます。モデル同士を接続するために必要な定型的な SQL は自動生成されます。さらに dbt は、モデル間の依存関係を特定し、有向非巡回グラフ（DAG）を用いて、適切な順序で作成されることを保証します。

dbt は、[ClickHouse がサポートするアダプター](https://github.com/ClickHouse/dbt-clickhouse) を通じて ClickHouse と連携できます。

<TOCInline toc={toc}  maxHeadingLevel={2} />

## サポートされている機能 {#supported-features}

サポートされている機能の一覧:

- [x] Table materialization
- [x] View materialization
- [x] Incremental materialization
- [x] Microbatch incremental materialization
- [x] Materialized View materializations（`TO` 形式の MATERIALIZED VIEW を使用、実験的）
- [x] Seeds
- [x] Sources
- [x] Docs generate
- [x] Tests
- [x] Snapshots
- [x] ほとんどの dbt-utils マクロ（現在は dbt-core に同梱）
- [x] Ephemeral materialization
- [x] Distributed table materialization（実験的）
- [x] Distributed incremental materialization（実験的）
- [x] Contracts
- [x] ClickHouse 固有のカラム設定（Codec、TTL など）
- [x] ClickHouse 固有のテーブル設定（索引、プロジェクションなど）

`--sample` フラグを含め、dbt-core 1.10 までのすべての機能がサポートされており、将来のリリースに向けたすべての非推奨警告も解消済みです。dbt 1.10 で導入された **Catalog integrations**（例: Iceberg）は、アダプターでネイティブサポートされていませんが、回避策は利用可能です。詳細は [Catalog Support セクション](/integrations/dbt/features-and-configurations#catalog-support)を参照してください。

このアダプターは、現時点では [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview) 内では利用できませんが、近いうちに利用可能にする予定です。詳細については、サポートまでお問い合わせください。

## dbt のコンセプトとサポートされるマテリアライゼーション {#concepts-and-supported-materializations}

dbt は「モデル」という概念を導入します。これは、複数のテーブルを結合することもある SQL 文として定義されます。モデルは複数の方法で「マテリアライズ」できます。マテリアライゼーションは、そのモデルの SELECT クエリに対するビルド戦略を表します。マテリアライゼーションの裏側にあるコードは、SELECT クエリを別の文でラップして、新しいリレーションを作成するか既存のリレーションを更新するための定型的な SQL です。

dbt は 5 種類のマテリアライゼーションを提供しており、すべて `dbt-clickhouse` でサポートされています:

* **view** (デフォルト): モデルはデータベース内の view としてビルドされます。ClickHouse では、これは [view](/sql-reference/statements/create/view) として作成されます。
* **table**: モデルはデータベース内の table としてビルドされます。ClickHouse では、これは [table](/sql-reference/statements/create/table) として作成されます。
* **ephemeral**: モデルはデータベース内に直接はビルドされず、その代わりに依存するモデル内に CTE（Common Table Expressions）として組み込まれます。
* **incremental**: モデルは最初に table としてマテリアライズされ、その後の実行では、dbt が新しい行を挿入し、変更された行を table 内で更新します。
* **materialized view**: モデルはデータベース内の materialized view としてビルドされます。ClickHouse では、これは [materialized view](/sql-reference/statements/create/view#materialized-view) として作成されます。

追加の構文や句によって、基盤となるデータが変更された場合に、これらのモデルをどのように更新するかが定義されます。一般的に dbt は、パフォーマンスが問題になるまでは view マテリアライゼーションから始めることを推奨しています。table マテリアライゼーションは、モデルのクエリ結果を table として保持することで、ストレージ使用量の増加と引き換えにクエリ時のパフォーマンスを向上させます。incremental アプローチはこれをさらに発展させ、基盤となるデータへの後続の更新をターゲットの table に取り込めるようにします。

ClickHouse 向けの[現行のアダプタ](https://github.com/silentsokolov/dbt-clickhouse)は、**dictionary**、**distributed table**、**distributed incremental** のマテリアライゼーションもサポートしています。アダプタはさらに、dbt の [snapshots](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) と [seeds](https://docs.getdbt.com/docs/building-a-dbt-project/seeds) もサポートしています。

以下は `dbt-clickhouse` における[実験的機能](https://clickhouse.com/docs/en/beta-and-experimental-features)です:

| Type                                    | Supported?           | Details                                                                                                                                                                                                                                         |
|-----------------------------------------|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Materialized View materialization       | はい（Experimental） | [materialized view](https://clickhouse.com/docs/en/materialized-view) を作成します。                                                                                                                                                            |
| Distributed table materialization       | はい（Experimental） | [distributed table](https://clickhouse.com/docs/en/engines/table-engines/special/distributed) を作成します。                                                                                                                                    |
| Distributed incremental materialization | はい（Experimental） | distributed table と同じ考え方に基づく incremental モデルです。すべての strategy がサポートされているわけではない点に注意してください。詳細は[こちら](https://github.com/ClickHouse/dbt-clickhouse?tab=readme-ov-file#distributed-incremental-materialization)を参照してください。 |
| Dictionary materialization              | はい（Experimental） | [dictionary](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary) を作成します。                                                                                                                                            |

## dbt と ClickHouse アダプターのセットアップ {#setup-of-dbt-and-the-clickhouse-adapter}

### dbt-core と dbt-clickhouse をインストールする {#install-dbt-core-and-dbt-clickhouse}

dbt にはコマンドラインインターフェイス (CLI) のインストール方法がいくつかあり、詳細は[こちら](https://docs.getdbt.com/dbt-cli/install/overview)に記載されています。dbt と dbt-clickhouse の両方をインストールするには、`pip` を使用することを推奨します。

```sh
pip install dbt-core dbt-clickhouse
```


### dbt に ClickHouse インスタンスへの接続情報を設定します。 {#provide-dbt-with-the-connection-details-for-our-clickhouse-instance}

`~/.dbt/profiles.yml` ファイル内で `clickhouse-service` プロファイルを設定し、schema、host、port、user、password の各プロパティを指定します。利用可能な接続設定オプションの一覧は、[機能と設定](/integrations/dbt/features-and-configurations) ページを参照してください。

```yaml
clickhouse-service:
  target: dev
  outputs:
    dev:
      type: clickhouse
      schema: [ default ] # ClickHouse database for dbt models

      # Optional
      host: [ localhost ]
      port: [ 8123 ]  # Defaults to 8123, 8443, 9000, 9440 depending on the secure and driver settings 
      user: [ default ] # User for all database operations
      password: [ <empty string> ] # Password for the user
      secure: True  # Use TLS (native protocol) or HTTPS (http protocol)
```


### dbt プロジェクトを作成する {#create-a-dbt-project}

これで、このプロファイルを既存のいずれかのプロジェクトで使用するか、次のコマンドを実行して新しいプロジェクトを作成できます。

```sh
dbt init project_name
```

`project_name` ディレクトリ内の `dbt_project.yml` ファイルを更新し、ClickHouse サーバーへの接続に使用するプロファイル名を指定します。

```yaml
profile: 'clickhouse-service'
```


### 接続テスト {#test-connection}

dbt CLI で `dbt debug` を実行し、dbt が ClickHouse に接続できるかどうかを確認します。出力に `Connection test: [OK connection ok]` が含まれていれば、接続が成功していることを示しています。

ClickHouse と組み合わせた dbt の使い方について詳しくは、[ガイドページ](/integrations/dbt/guides) を参照してください。

### モデルのテストとデプロイ (CI/CD) {#testing-and-deploying-your-models-ci-cd}

dbt プロジェクトをテストおよびデプロイする方法には、さまざまなパターンがあります。dbt では、[ベストプラクティスに沿ったワークフロー](https://docs.getdbt.com/best-practices/best-practice-workflows#pro-tips-for-workflows)や [CI ジョブ](https://docs.getdbt.com/docs/deploy/ci-jobs)に関する推奨事項が提供されています。ここではいくつかの戦略について説明しますが、実際のユースケースに適合させるには大きく調整する必要がある場合があることに留意してください。

#### シンプルなデータテストとユニットテストを用いた CI/CD {#ci-with-simple-data-tests-and-unit-tests}

CI パイプラインを始動させる簡単な方法の 1 つは、ジョブ内で ClickHouse クラスターを立ち上げ、そのクラスターに対してモデルを実行することです。モデルを実行する前に、このクラスターにデモデータを投入しておけます。[seed](https://docs.getdbt.com/reference/commands/seed) を使用して、本番データのサブセットをステージング環境に投入することもできます。

データが投入されたら、[data tests](https://docs.getdbt.com/docs/build/data-tests) と [unit tests](https://docs.getdbt.com/docs/build/unit-tests) を実行できます。

CD ステップは、本番の ClickHouse クラスターに対して `dbt build` を実行するだけ、という非常にシンプルなものにできます。

#### より完全な CI/CD ステージ: 最新データを使用し、影響を受けたモデルのみをテストする {#more-complete-ci-stage}

よく使われる戦略の 1 つは、変更されたモデル（およびその上流・下流の依存関係）のみを再デプロイする [Slim CI](https://docs.getdbt.com/best-practices/best-practice-workflows#run-only-modified-models-to-test-changes-slim-ci) ジョブを使用することです。このアプローチでは、本番実行からのアーティファクト（つまり [dbt manifest](https://docs.getdbt.com/reference/artifacts/manifest-json)）を使用して、プロジェクトの実行時間を短縮し、環境間でスキーマドリフトが発生しないようにします。

開発環境を同期状態に保ち、古いデプロイメントに対してモデルを実行してしまうことを避けるために、[clone](https://docs.getdbt.com/reference/commands/clone) や [defer](https://docs.getdbt.com/reference/node-selection/defer) を使用できます。

テスト環境（いわゆるステージング環境）には専用の ClickHouse クラスターまたはサービスを使用し、本番環境の運用への影響を避けることを推奨します。テスト環境が本番環境を適切に代表するものとなるようにするには、本番データのサブセットを使用するとともに、環境間でスキーマドリフトが発生しないような形で dbt を実行することが重要です。

- テストに最新データが不要な場合は、本番データのバックアップをステージング環境にリストアできます。
- テストに最新データが必要な場合は、[`remoteSecure()` table function](/sql-reference/table-functions/remote) とリフレッシャブルmaterialized view を組み合わせて、必要な頻度でデータを挿入できます。別の選択肢としては、オブジェクトストレージを中間ストレージとして使用し、本番サービスから定期的にデータを書き出し、その後オブジェクトストレージの table function や ClickPipes（継続的なインジェスト用）を使用してステージング環境にインポートする方法があります。

CI テスト用に専用環境を用意すると、本番環境に影響を与えることなく手動テストを実施することもできます。例えば、この環境を BI ツールの接続先としてテストに利用することが考えられます。

デプロイメント（つまり CD ステップ）については、本番デプロイメントのアーティファクトを使用して、変更されたモデルのみを更新することを推奨します。これには、dbt アーティファクト用の中間ストレージとしてオブジェクトストレージ（例: S3）を設定する必要があります。設定が完了したら、`dbt build --select state:modified+ --state path/to/last/deploy/state.json` のようなコマンドを実行して、本番での前回の実行以降に変更された内容に基づき、必要最小限のモデルだけを選択的に再ビルドできます。

## よくある問題のトラブルシューティング {#troubleshooting-common-issues}

### 接続 {#troubleshooting-connections}

dbt から ClickHouse への接続で問題が発生する場合は、次の要件を満たしていることを確認してください。

- エンジンは、[サポートされているエンジン](/integrations/dbt/features-and-configurations#supported-table-engines) のいずれかである必要があります。
- データベースにアクセスするための十分な権限を持っている必要があります。
- データベースのデフォルトのテーブルエンジンを使用していない場合は、モデル構成でテーブルエンジンを指定する必要があります。

### 長時間実行される処理を理解する {#understanding-long-running-operations}

一部の処理は、特定の ClickHouse クエリが原因で予想以上に時間がかかる場合があります。どのクエリに時間がかかっているかを詳しく把握するには、[log level](https://docs.getdbt.com/reference/global-configs/logs#log-level) を `debug` に引き上げてください。これにより、各クエリに要した時間が出力されます。たとえば、dbt コマンドに `--log-level debug` を指定することで有効にできます。

## 制限事項 {#limitations}

現在の dbt 用 ClickHouse adapter には、認識しておくべき制限がいくつかあります。

- このプラグインは、ClickHouse バージョン 25.3 以降を必要とする構文を使用します。ClickHouse のそれ以前のバージョンはテストしていません。また、現在は Replicated テーブルもテストしていません。
- `dbt-adapter` を同時に実行すると、内部的に同じ操作に対して同じテーブル名を使用するため、実行同士が衝突する可能性があります。詳細については、issue [#420](https://github.com/ClickHouse/dbt-clickhouse/issues/420) を参照してください。
- この adapter は現在、モデルを [INSERT INTO SELECT](https://clickhouse.com/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) を用いてテーブルとして materialize します。これは、再度実行した場合に事実上データが重複することを意味します。非常に大きなデータセット（PB 級）の場合、実行時間が極端に長くなり、一部のモデルは現実的でなくなります。パフォーマンスを向上させるには、`materialized: materialization_view` として view を実装し、ClickHouse の materialized view を利用してください。さらに、可能な限り `GROUP BY` を利用して、任意のクエリから返される行数を最小化するようにしてください。ソースの行数を維持したまま単に変換を行うモデルよりも、データを集約・要約するモデルを優先してください。
- モデルを表現するために Distributed テーブル（分散テーブル）を使用する場合は、各ノード上に基盤となる Replicated テーブルを手動で作成する必要があります。その上に Distributed テーブルを作成できます。この adapter はクラスターの作成を管理しません。
- dbt がデータベース内にリレーション（table/view）を作成する場合、通常は `{{ database }}.{{ schema }}.{{ table/view id }}` のように作成します。ClickHouse には schema の概念がありません。そのため、この adapter は `{{schema}}.{{ table/view id }}` を使用し、ここでの `schema` は ClickHouse のデータベースを指します。
- ephemeral モデル / CTE は、ClickHouse の INSERT 文内で `INSERT INTO` より前に配置した場合は動作しません。https://github.com/ClickHouse/ClickHouse/issues/30323 を参照してください。これはほとんどのモデルには影響しないはずですが、ephemeral モデルをモデル定義やその他の SQL 文のどこに配置するかには注意が必要です。 <!-- TODO この制限事項を再確認すること。issue はすでにクローズされ、24.10 で修正が導入されたように見える -->

## Fivetran {#fivetran}

`dbt-clickhouse` コネクタは [Fivetran transformations](https://fivetran.com/docs/transformations/dbt) でも利用可能であり、Fivetran プラットフォーム上で `dbt` を用いたシームレスな統合および変換を直接実行できます。