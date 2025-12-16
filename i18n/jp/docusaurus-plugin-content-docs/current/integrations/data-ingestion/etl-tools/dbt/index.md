---
sidebar_label: '概要'
slug: /integrations/dbt
sidebar_position: 1
description: 'dbt を使用して ClickHouse のデータを変換およびモデリングできます'
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

**dbt** (data build tool) は、アナリティクスエンジニアが `SELECT` 文を書くことで、データウェアハウス内のデータを変換できるようにするツールです。dbt は、これらの `SELECT` 文をテーブルやビューといったデータベースオブジェクトとしてマテリアライズし、[Extract Load and Transform (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform) における T の処理を実行します。`SELECT` 文で定義されたモデルを作成できます。

dbt 内では、これらのモデルを相互参照・レイヤー化することで、より高レベルな概念を構築できます。モデル同士を接続するために必要な定型的な SQL は自動生成されます。さらに dbt は、モデル間の依存関係を特定し、有向非巡回グラフ (DAG) を用いて、モデルが適切な順序で作成されるようにします。

dbt は [ClickHouse がサポートするアダプター](https://github.com/ClickHouse/dbt-clickhouse) を通じて ClickHouse と連携できます。

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
- [x] Docs の生成
- [x] Tests
- [x] Snapshots
- [x] ほとんどの dbt-utils マクロ（現在は dbt-core に同梱）
- [x] Ephemeral materialization
- [x] Distributed table materialization（実験的）
- [x] Distributed incremental materialization（実験的）
- [x] Contracts
- [x] ClickHouse 固有のカラム設定（Codec、TTL など）
- [x] ClickHouse 固有のテーブル設定（indexes、projections など）

`--sample` フラグを含め、dbt-core 1.10 までのすべての機能がサポートされており、今後のリリースに向けたすべての非推奨警告にも対応済みです。dbt 1.10 で導入された **Catalog 統合**（例: Iceberg）は、アダプターでまだネイティブサポートされていませんが、回避策が利用可能です。詳細は [Catalog Support セクション](/integrations/dbt/features-and-configurations#catalog-support)を参照してください。

このアダプターは、現時点では [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview) 内ではまだ利用できませんが、近いうちに利用可能にする予定です。詳細についてはサポートまでお問い合わせください。

## dbt のコンセプトとサポートされるマテリアライゼーション {#concepts-and-supported-materializations}

dbt では model という概念を導入します。これは、多くのテーブルを結合することもある SQL 文として定義されます。model は複数の方法で「マテリアライズ」できます。マテリアライゼーションは、model の SELECT クエリに対するビルド戦略を表します。マテリアライゼーションの背後にあるコードは、`SELECT` クエリを別の文でラップして新しいリレーションを作成する、あるいは既存のリレーションを更新するための定型的な SQL です。

dbt では 5 種類のマテリアライゼーションを提供しており、すべてが `dbt-clickhouse` でサポートされています：

* **view**（デフォルト）：model はデータベース内の view としてビルドされます。ClickHouse では、これは [view](/sql-reference/statements/create/view) としてビルドされます。
* **table**：model はデータベース内の table としてビルドされます。ClickHouse では、これは [table](/sql-reference/statements/create/table) としてビルドされます。
* **ephemeral**：model はデータベース内に直接ビルドされず、代わりに依存する model 内に CTE（Common Table Expressions）として取り込まれます。
* **incremental**：model は最初に table としてマテリアライズされ、その後の実行では、dbt が新しい行を挿入し、変更された行を table 内で更新します。
* **materialized view**：model はデータベース内の materialized view としてビルドされます。ClickHouse では、これは [materialized view](/sql-reference/statements/create/view#materialized-view) としてビルドされます。

追加の構文や句によって、基盤となるデータが変更された場合に、これらの model をどのように更新するかを定義します。一般的に dbt では、パフォーマンスが問題になるまでは view マテリアライゼーションから始めることを推奨しています。table マテリアライゼーションは、model のクエリ結果を table として保持することで、ストレージ使用量が増加する代わりにクエリ時のパフォーマンスを改善します。incremental アプローチはこれをさらに発展させ、基盤データへの後続の更新がターゲットの table に取り込まれるようにします。

ClickHouse 向けの[現在の adapter](https://github.com/silentsokolov/dbt-clickhouse) は、**dictionary**、**distributed table**、および **distributed incremental** マテリアライゼーションもサポートしています。また、この adapter は dbt の [snapshots](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) と [seeds](https://docs.getdbt.com/docs/building-a-dbt-project/seeds) もサポートしています。

次の機能は `dbt-clickhouse` における[実験的機能](https://clickhouse.com/docs/en/beta-and-experimental-features)です：

| Type                                    | Supported?        | Details                                                                                                                                                                                                                                         |
|-----------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Materialized View materialization       | はい（実験的）     | [materialized view](https://clickhouse.com/docs/en/materialized-view) を作成します。                                                                                                                                                            |
| Distributed table materialization       | はい（実験的）     | [distributed table](https://clickhouse.com/docs/en/engines/table-engines/special/distributed) を作成します。                                                                                                                                    |
| Distributed incremental materialization | はい（実験的）     | distributed table と同じ考え方に基づく incremental model です。すべての戦略がサポートされているわけではない点に注意してください。詳細は[こちら](https://github.com/ClickHouse/dbt-clickhouse?tab=readme-ov-file#distributed-incremental-materialization)を参照してください。 |
| Dictionary materialization              | はい（実験的）     | [dictionary](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary) を作成します。                                                                                                                                            |

## dbt と ClickHouse アダプターのセットアップ {#setup-of-dbt-and-the-clickhouse-adapter}

### dbt-core と dbt-clickhouse をインストールする {#install-dbt-core-and-dbt-clickhouse}

dbt にはコマンドラインインターフェイス (CLI) のインストール方法がいくつかあり、詳細は[こちら](https://docs.getdbt.com/dbt-cli/install/overview)に記載されています。`pip` を使用して dbt と dbt-clickhouse の両方をインストールすることをお勧めします。

```sh
pip install dbt-core dbt-clickhouse
```


### dbt に ClickHouse インスタンスへの接続情報を提供します。 {#provide-dbt-with-the-connection-details-for-our-clickhouse-instance}

`~/.dbt/profiles.yml` ファイル内で `clickhouse-service` プロファイルを設定し、schema、host、port、user、password の各プロパティを指定します。接続構成オプションの全一覧は、[Features and configurations](/integrations/dbt/features-and-configurations) ページで確認できます。

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

これで、このプロファイルは既存のプロジェクトで使用することも、次のコマンドを使って新しいプロジェクトを作成することもできます。

```sh
dbt init project_name
```

`project_name` ディレクトリ内の `dbt_project.yml` ファイルを更新し、ClickHouse サーバーに接続するためのプロファイル名を指定してください。

```yaml
profile: 'clickhouse-service'
```


### 接続テスト {#test-connection}

CLI ツールで `dbt debug` を実行し、dbt が ClickHouse に接続できるかどうかを確認します。レスポンスに `Connection test: [OK connection ok]` が含まれていることを確認し、接続が正常に確立されていることを確認します。

dbt を ClickHouse と連携して使用する方法の詳細は、[ガイドページ](/integrations/dbt/guides) を参照してください。

### モデルのテストとデプロイ（CI/CD） {#testing-and-deploying-your-models-ci-cd}

dbt プロジェクトをテストおよびデプロイする方法は数多く存在します。dbt では、[ベストプラクティスに沿ったワークフロー](https://docs.getdbt.com/best-practices/best-practice-workflows#pro-tips-for-workflows)や [CI ジョブ](https://docs.getdbt.com/docs/deploy/ci-jobs)に関するいくつかの提案を提供しています。ここではいくつかの戦略について説明しますが、これらの戦略は特定のユースケースに適合させるために大幅な調整が必要になる場合があることに留意してください。

#### シンプルなデータテストとユニットテストを用いた CI/CD {#ci-with-simple-data-tests-and-unit-tests}

CI パイプラインを手早く立ち上げる簡単な方法の一つは、ジョブ内で ClickHouse クラスターを起動し、そのクラスターに対してモデルを実行することです。モデルを実行する前に、このクラスターにデモデータを挿入できます。[seed](https://docs.getdbt.com/reference/commands/seed) を使用して、本番データのサブセットをステージング環境に投入することもできます。

データが挿入されたら、[data tests](https://docs.getdbt.com/docs/build/data-tests) と [unit tests](https://docs.getdbt.com/docs/build/unit-tests) を実行できます。

CD のステップは、本番の ClickHouse クラスターに対して `dbt build` を実行するだけの、非常にシンプルなものにできます。

#### より網羅的な CI/CD ステージ: 最新データを使い、影響を受けたモデルのみをテストする {#more-complete-ci-stage}

一般的な戦略の 1 つは、変更されたモデル（およびその上流・下流の依存関係）のみを再デプロイする [Slim CI](https://docs.getdbt.com/best-practices/best-practice-workflows#run-only-modified-models-to-test-changes-slim-ci) ジョブを使用することです。このアプローチでは、本番環境での dbt 実行から生成されたアーティファクト（例: [dbt manifest](https://docs.getdbt.com/reference/artifacts/manifest-json)）を利用して、プロジェクトの実行時間を短縮し、環境間でスキーマドリフトが発生しないようにします。

開発環境を同期させ、古いデプロイに対してモデルを実行してしまうことを避けるために、[clone](https://docs.getdbt.com/reference/commands/clone) や [defer](https://docs.getdbt.com/reference/node-selection/defer) を使用できます。

本番環境の運用への影響を避けるため、テスト環境（すなわちステージング環境）には専用の ClickHouse クラスターまたはサービスを使用することを推奨します。テスト環境が本番環境を適切に反映したものとなるようにするには、本番データのサブセットを使用し、かつ環境間でスキーマドリフトを防ぐ形で dbt を実行することが重要です。

- テストに最新のデータが不要な場合は、本番データのバックアップをステージング環境にリストアすることができます。
- テストに最新のデータが必要な場合は、[`remoteSecure()` table function](/sql-reference/table-functions/remote) とリフレッシャブルmaterialized view を組み合わせて、希望する頻度でデータを挿入できます。別の選択肢として、オブジェクトストレージを中間層として使用し、本番サービスから定期的にデータを書き出しておき、その後オブジェクトストレージの table function または ClickPipes（継続的なインジェスト用）を使用してステージング環境にインポートする方法もあります。

CI テスト用に専用環境を用意すると、本番環境に影響を与えずに手動テストを実施できるようにもなります。例えば、この環境を BI ツールの接続先としてテストを行いたい場合などです。

デプロイメント（すなわち CD ステップ）では、変更されたモデルのみを更新するために、本番デプロイからのアーティファクトを使用することを推奨します。これを行うには、dbt アーティファクトの中間ストレージとしてオブジェクトストレージ（例: S3）をセットアップする必要があります。セットアップ後は、`dbt build --select state:modified+ --state path/to/last/deploy/state.json` のようなコマンドを実行して、本番環境の前回の実行以降に変更された内容に基づき、必要最小限のモデルだけを選択的に再ビルドできます。

## よくある問題の解決方法 {#troubleshooting-common-issues}

### 接続 {#troubleshooting-connections}

dbt から ClickHouse に接続する際に問題が発生する場合は、次の要件が満たされていることを確認してください。

- 使用しているエンジンが[サポートされているエンジン](/integrations/dbt/features-and-configurations#supported-table-engines)のいずれかであること。
- データベースにアクセスするための十分な権限があること。
- データベースのデフォルトのテーブルエンジンを使用していない場合は、モデルの
  設定でテーブルエンジンを指定していること。

### 長時間実行される処理の理解 {#understanding-long-running-operations}

一部の処理は、特定の ClickHouse クエリが原因で想定より長く時間がかかる場合があります。どのクエリに時間がかかっているかを詳しく把握するには、[log level](https://docs.getdbt.com/reference/global-configs/logs#log-level) を `debug` に引き上げます。これにより、各クエリに要した時間が出力されます。たとえば、dbt コマンドに `--log-level debug` を付与することで設定できます。

## 制限事項 {#limitations}

現在の dbt 向け ClickHouse adapter には、認識しておくべきいくつかの制限があります。

- このプラグインは、ClickHouse 25.3 以降を必要とする構文を使用します。古いバージョンの ClickHouse についてはテストしていません。また、現時点では Replicated テーブルについてもテストしていません。
- `dbt-adapter` を同時に実行すると、内部的に同じ操作に対して同じテーブル名を使用することがあるため、実行同士が衝突する可能性があります。詳細については Issue [#420](https://github.com/ClickHouse/dbt-clickhouse/issues/420) を参照してください。
- この adapter は現在、[INSERT INTO SELECT](https://clickhouse.com/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) を使用してモデルをテーブルとしてマテリアライズします。これは、再度実行された場合に実質的にデータが重複することを意味します。非常に大きなデータセット（PB 規模）の場合、実行時間が極端に長くなり、一部のモデルは現実的でなくなります。パフォーマンスを改善するには、`materialized: materialization_view` として view を実装し、ClickHouse の materialized view を使用してください。さらに、可能な限り `GROUP BY` を活用して、任意のクエリから返される行数を最小限に抑えることを目指してください。ソースの行数を維持したまま単に変換を行うモデルよりも、データを集約して要約するモデルを優先してください。
- モデルを表現するために分散テーブルを使用する場合は、各ノード上に基盤となる Replicated テーブルを手動で作成する必要があります。その上に分散テーブルを作成できます。adapter はクラスターの作成を管理しません。
- dbt がデータベース内にリレーション（テーブル/VIEW）を作成する場合、通常は `{{ database }}.{{ schema }}.{{ table/view id }}` のように作成します。ClickHouse にはスキーマという概念がありません。そのため adapter は `{{schema}}.{{ table/view id }}` を使用し、ここで `schema` は ClickHouse のデータベースを指します。
- ephemeral モデルや CTE は、ClickHouse の INSERT 文で `INSERT INTO` より前に配置された場合には動作しません。詳細は https://github.com/ClickHouse/ClickHouse/issues/30323 を参照してください。これはほとんどのモデルには影響しないはずですが、モデル定義やその他の SQL 文において、ephemeral モデルをどこに配置するかには注意が必要です。 <!-- TODO review this limitation, looks like the issue was already closed and the fix was introduced in 24.10 -->

## Fivetran {#fivetran}

`dbt-clickhouse` コネクタは [Fivetran transformations](https://fivetran.com/docs/transformations/dbt) でも利用でき、Fivetran プラットフォーム内で `dbt` を用いたシームレスな統合および変換を直接実行できます。