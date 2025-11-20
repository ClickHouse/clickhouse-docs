---
sidebar_label: '概要'
slug: /integrations/dbt
sidebar_position: 1
description: 'ユーザーは dbt を使用して ClickHouse 内のデータを変換およびモデリングできます'
title: 'dbt と ClickHouse の連携'
keywords: ['dbt', 'data transformation', 'analytics engineering', 'SQL modeling', 'ELT pipeline']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_integration'
  - website: 'https://github.com/ClickHouse/dbt-clickhouse'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# dbtとClickHouseの統合 {#integrate-dbt-clickhouse}

<ClickHouseSupportedBadge />


## dbt-clickhouse アダプター {#dbt-clickhouse-adapter}

**dbt**（data build tool）は、アナリティクスエンジニアがSELECT文を記述するだけで、データウェアハウス内のデータを変換できるようにするツールです。dbtは、これらのSELECT文をテーブルやビューの形式でデータベース内のオブジェクトとして実体化し、[Extract Load and Transform (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform)のT（Transform）を実行します。ユーザーはSELECT文で定義されたモデルを作成できます。

dbt内では、これらのモデルを相互参照し、階層化することで、より高レベルの概念を構築できます。モデルを接続するために必要な定型的なSQLは自動的に生成されます。さらに、dbtはモデル間の依存関係を識別し、有向非巡回グラフ（DAG）を使用して適切な順序でモデルが作成されることを保証します。

dbtは[ClickHouseがサポートするアダプター](https://github.com/ClickHouse/dbt-clickhouse)を通じてClickHouseと互換性があります。

<TOCInline toc={toc} maxHeadingLevel={2} />


## サポートされている機能 {#supported-features}

サポートされている機能の一覧:

- [x] テーブルのマテリアライゼーション
- [x] ビューのマテリアライゼーション
- [x] インクリメンタルマテリアライゼーション
- [x] マイクロバッチインクリメンタルマテリアライゼーション
- [x] マテリアライズドビューのマテリアライゼーション(MATERIALIZED VIEWの`TO`形式を使用、実験的機能)
- [x] シード
- [x] ソース
- [x] ドキュメント生成
- [x] テスト
- [x] スナップショット
- [x] ほとんどのdbt-utilsマクロ(現在はdbt-coreに含まれています)
- [x] エフェメラルマテリアライゼーション
- [x] 分散テーブルのマテリアライゼーション(実験的機能)
- [x] 分散インクリメンタルマテリアライゼーション(実験的機能)
- [x] コントラクト
- [x] ClickHouse固有のカラム設定(Codec、TTLなど)
- [x] ClickHouse固有のテーブル設定(インデックス、プロジェクションなど)

dbt-core 1.9までのすべての機能がサポートされています。dbt-core 1.10で追加された機能も近日中に追加する予定です。

このアダプターは[dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview)内での使用にはまだ対応していませんが、近日中に利用可能になる予定です。詳細についてはサポートまでお問い合わせください。


## 概念 {#concepts}

dbtはモデルという概念を導入しています。これは、複数のテーブルを結合する可能性のあるSQL文として定義されます。モデルは複数の方法で「マテリアライズ」することができます。マテリアライゼーションは、モデルのSELECTクエリに対するビルド戦略を表します。マテリアライゼーションの背後にあるコードは、SELECTクエリをラップして新しいリレーションを作成したり既存のリレーションを更新したりするための定型SQLです。

dbtは4種類のマテリアライゼーションを提供しています:

- **view**(デフォルト): モデルはデータベース内のビューとして構築されます。
- **table**: モデルはデータベース内のテーブルとして構築されます。
- **ephemeral**: モデルはデータベース内に直接構築されず、代わりに共通テーブル式として依存モデルに取り込まれます。
- **incremental**: モデルは最初にテーブルとしてマテリアライズされ、その後の実行では、dbtが新しい行を挿入し、変更された行をテーブル内で更新します。

追加の構文と句により、基礎となるデータが変更された場合にこれらのモデルをどのように更新すべきかが定義されます。dbtは一般的に、パフォーマンスが懸念事項になるまではviewマテリアライゼーションから始めることを推奨しています。tableマテリアライゼーションは、モデルのクエリ結果をテーブルとして保存することで、ストレージの増加を代償にクエリ時のパフォーマンス向上を提供します。incrementalアプローチはこれをさらに発展させ、基礎データへの後続の更新をターゲットテーブルに反映できるようにします。

ClickHouseの[現在のアダプター](https://github.com/silentsokolov/dbt-clickhouse)は、**materialized view**、**dictionary**、**distributed table**、および**distributed incremental**マテリアライゼーションもサポートしています。このアダプターはdbtの[スナップショット](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)と[シード](https://docs.getdbt.com/docs/building-a-dbt-project/seeds)もサポートしています。

### サポートされているマテリアライゼーションの詳細 {#details-about-supported-materializations}

| タイプ                        | サポート状況 | 詳細                                                                                                                          |
| --------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| viewマテリアライゼーション        | YES        | [ビュー](https://clickhouse.com/docs/en/sql-reference/table-functions/view/)を作成します。                                            |
| tableマテリアライゼーション       | YES        | [テーブル](https://clickhouse.com/docs/en/operations/system-tables/tables/)を作成します。サポートされているエンジンのリストは以下を参照してください。 |
| incrementalマテリアライゼーション | YES        | テーブルが存在しない場合は作成し、その後は更新のみを書き込みます。                                                         |
| ephemeralマテリアライゼーション      | YES        | ephemeral/CTEマテリアライゼーションを作成します。このモデルはdbt内部のものであり、データベースオブジェクトは作成しません             |

以下はClickHouseの[実験的機能](https://clickhouse.com/docs/en/beta-and-experimental-features)です:

| タイプ                                    | サポート状況        | 詳細                                                                                                                                                                                                                                         |
| --------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Materialized Viewマテリアライゼーション       | YES、実験的 | [マテリアライズドビュー](https://clickhouse.com/docs/en/materialized-view)を作成します。                                                                                                                                                                |
| Distributed tableマテリアライゼーション       | YES、実験的 | [分散テーブル](https://clickhouse.com/docs/en/engines/table-engines/special/distributed)を作成します。                                                                                                                                        |
| Distributed incrementalマテリアライゼーション | YES、実験的 | 分散テーブルと同じ考え方に基づくincrementalモデルです。すべての戦略がサポートされているわけではありません。詳細は[こちら](https://github.com/ClickHouse/dbt-clickhouse?tab=readme-ov-file#distributed-incremental-materialization)を参照してください。 |
| Dictionaryマテリアライゼーション              | YES、実験的 | [ディクショナリ](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary)を作成します。                                                                                                                                                |


## dbtとClickHouseアダプターのセットアップ {#setup-of-dbt-and-the-clickhouse-adapter}

### dbt-coreとdbt-clickhouseのインストール {#install-dbt-core-and-dbt-clickhouse}

dbtはコマンドラインインターフェース（CLI）をインストールするための複数のオプションを提供しており、詳細は[こちら](https://docs.getdbt.com/dbt-cli/install/overview)に記載されています。dbtとdbt-clickhouseの両方をインストールするには`pip`の使用を推奨します。

```sh
pip install dbt-core dbt-clickhouse
```

### ClickHouseインスタンスの接続情報をdbtに提供する {#provide-dbt-with-the-connection-details-for-our-clickhouse-instance}

`~/.dbt/profiles.yml`ファイルで`clickhouse-service`プロファイルを設定し、schema、host、port、user、passwordのプロパティを指定します。接続設定オプションの完全なリストは[機能と設定](/integrations/dbt/features-and-configurations)ページで確認できます：

```yaml
clickhouse-service:
  target: dev
  outputs:
    dev:
      type: clickhouse
      schema: [default] # dbtモデル用のClickHouseデータベース

      # オプション
      host: [localhost]
      port: [8123] # secureとdriverの設定に応じて8123、8443、9000、9440がデフォルト
      user: [default] # すべてのデータベース操作用のユーザー
      password: [<empty string>] # ユーザーのパスワード
      secure: True # TLS（ネイティブプロトコル）またはHTTPS（httpプロトコル）を使用
```

### dbtプロジェクトの作成 {#create-a-dbt-project}

このプロファイルを既存のプロジェクトで使用するか、以下のコマンドで新しいプロジェクトを作成できます：

```sh
dbt init project_name
```

`project_name`ディレクトリ内で、`dbt_project.yml`ファイルを更新し、ClickHouseサーバーに接続するためのプロファイル名を指定します。

```yaml
profile: "clickhouse-service"
```

### 接続のテスト {#test-connection}

CLIツールで`dbt debug`を実行し、dbtがClickHouseに接続できるかを確認します。レスポンスに`Connection test: [OK connection ok]`が含まれていることを確認し、接続が成功したことを確認してください。

dbtをClickHouseで使用する方法の詳細については、[ガイドページ](/integrations/dbt/guides)をご覧ください。

### モデルのテストとデプロイ（CI/CD） {#testing-and-deploying-your-models-ci-cd}

dbtプロジェクトをテストおよびデプロイする方法は多数あります。dbtは[ベストプラクティスワークフロー](https://docs.getdbt.com/best-practices/best-practice-workflows#pro-tips-for-workflows)と[CIジョブ](https://docs.getdbt.com/docs/deploy/ci-jobs)に関する提案を提供しています。いくつかの戦略について説明しますが、これらの戦略は特定のユースケースに合わせて大幅に調整する必要がある場合があることに留意してください。

#### シンプルなデータテストとユニットテストを使用したCI/CD {#ci-with-simple-data-tests-and-unit-tests}

CIパイプラインを開始する簡単な方法の1つは、ジョブ内でClickHouseクラスターを実行し、そのクラスターに対してモデルを実行することです。モデルを実行する前に、このクラスターにデモデータを挿入できます。[seed](https://docs.getdbt.com/reference/commands/seed)を使用して、本番データのサブセットでステージング環境を構築することもできます。

データが挿入されたら、[データテスト](https://docs.getdbt.com/docs/build/data-tests)と[ユニットテスト](https://docs.getdbt.com/docs/build/unit-tests)を実行できます。

CDステップは、本番ClickHouseクラスターに対して`dbt build`を実行するだけで済む場合があります。

#### より完全なCI/CDステージ：最新データを使用し、影響を受けるモデルのみをテスト {#more-complete-ci-stage}

一般的な戦略の1つは、[Slim CI](https://docs.getdbt.com/best-practices/best-practice-workflows#run-only-modified-models-to-test-changes-slim-ci)ジョブを使用することです。この方法では、変更されたモデル（およびその上流・下流の依存関係）のみが再デプロイされます。このアプローチは、本番実行からのアーティファクト（すなわち[dbtマニフェスト](https://docs.getdbt.com/reference/artifacts/manifest-json)）を使用して、プロジェクトの実行時間を短縮し、環境間でスキーマのドリフトが発生しないようにします。

開発環境を同期させ、古いデプロイメントに対してモデルを実行することを避けるために、[clone](https://docs.getdbt.com/reference/commands/clone)または[defer](https://docs.getdbt.com/reference/node-selection/defer)を使用できます。


テスト環境（いわゆるステージング環境）には、プロダクション環境の運用に影響を与えないよう、専用の ClickHouse クラスターまたはサービスを使用することを推奨します。テスト環境の再現性を高めるためには、プロダクションデータのサブセットを使用するとともに、環境間でスキーマドリフトが発生しないような形で dbt を実行することが重要です。

- テストで最新データが不要な場合は、プロダクションデータのバックアップをステージング環境にリストアできます。
- テストで最新データが必要な場合は、[`remoteSecure()` table function](/sql-reference/table-functions/remote) と更新可能なマテリアライズドビューを組み合わせて使用し、任意の頻度でデータを挿入できます。別の選択肢として、オブジェクトストレージを中間ストレージとして使用し、プロダクションサービスから定期的にデータを書き出し、その後オブジェクトストレージのテーブル関数または ClickPipes（継続的インジェスト用）を使用してステージング環境にインポートする方法もあります。

CI テスト用に専用環境を用意すると、プロダクション環境に影響を与えることなく手動テストを実施することもできます。例えば、この環境を BI ツールの接続先としてテストに利用することができます。

デプロイメント（つまり CD ステップ）については、プロダクションデプロイメントで生成されたアーティファクトを使用し、変更のあったモデルのみを更新することを推奨します。これには、dbt アーティファクト用の中間ストレージとしてオブジェクトストレージ（例：S3）をセットアップする必要があります。セットアップが完了したら、`dbt build --select state:modified+ --state path/to/last/deploy/state.json` のようなコマンドを実行することで、プロダクションでの前回実行以降の変更に基づき、必要最小限のモデルのみを選択的に再ビルドできます。



## よくある問題のトラブルシューティング {#troubleshooting-common-issues}

### 接続 {#troubleshooting-connections}

dbtからClickHouseへの接続で問題が発生した場合は、以下の条件が満たされていることを確認してください:

- エンジンは[サポートされているエンジン](/integrations/dbt/features-and-configurations#supported-table-engines)のいずれかである必要があります。
- データベースにアクセスするための適切な権限が必要です。
- データベースのデフォルトのテーブルエンジンを使用していない場合は、モデル設定でテーブルエンジンを指定する必要があります。

### 長時間実行される操作について {#understanding-long-running-operations}

特定のClickHouseクエリにより、一部の操作が予想よりも長くかかる場合があります。どのクエリに時間がかかっているかをより詳しく把握するには、[ログレベル](https://docs.getdbt.com/reference/global-configs/logs#log-level)を`debug`に上げてください。これにより、各クエリで使用された時間が出力されます。例えば、dbtコマンドに`--log-level debug`を追加することで実現できます。


## 制限事項 {#limitations}

現在のdbt用ClickHouseアダプターには、ユーザーが認識しておくべきいくつかの制限事項があります：

- このプラグインはClickHouseバージョン25.3以降を必要とする構文を使用しています。それ以前のバージョンのClickHouseではテストを行っていません。また、現在Replicatedテーブルのテストも行っていません。
- `dbt-adapter`の異なる実行を同時に行うと、内部的に同じ操作に対して同じテーブル名を使用する可能性があるため、衝突が発生する場合があります。詳細については、issue [#420](https://github.com/ClickHouse/dbt-clickhouse/issues/420)を参照してください。
- このアダプターは現在、[INSERT INTO SELECT](https://clickhouse.com/docs/sql-reference/statements/insert-into#inserting-the-results-of-select)を使用してモデルをテーブルとして実体化します。これは、実行を再度行った場合、事実上データの重複を意味します。非常に大規模なデータセット（ペタバイト規模）では、実行時間が極端に長くなり、一部のモデルが実用的でなくなる可能性があります。パフォーマンスを向上させるには、ビューを`materialized: materialization_view`として実装することでClickHouse Materialized Viewsを使用してください。さらに、可能な限り`GROUP BY`を活用して、クエリによって返される行数を最小限に抑えることを目指してください。ソースの行数を維持したまま単に変換するモデルよりも、データを集約するモデルを優先してください。
- Distributedテーブルを使用してモデルを表現するには、ユーザーは各ノード上で基礎となるレプリケートされたテーブルを手動で作成する必要があります。Distributedテーブルは、これらの上に作成することができます。このアダプターはクラスターの作成を管理しません。
- dbtがデータベース内にリレーション（テーブル/ビュー）を作成する際、通常は`{{ database }}.{{ schema }}.{{ table/view id }}`として作成します。ClickHouseにはスキーマの概念がありません。そのため、このアダプターは`{{schema}}.{{ table/view id }}`を使用します。ここで`schema`はClickHouseデータベースを指します。
- Ephemeralモデル/CTEは、ClickHouseのinsert文で`INSERT INTO`の前に配置された場合は機能しません。https://github.com/ClickHouse/ClickHouse/issues/30323を参照してください。これはほとんどのモデルに影響を与えないはずですが、モデル定義やその他のSQL文でephemeralモデルを配置する場所には注意が必要です。<!-- TODO review this limitation, looks like the issue was already closed and the fix was introduced in 24.10 -->


## Fivetran {#fivetran}

`dbt-clickhouse`コネクタは[Fivetran transformations](https://fivetran.com/docs/transformations/dbt)でも利用可能で、`dbt`を使用してFivetranプラットフォーム内で直接シームレスな統合と変換機能を提供します。
