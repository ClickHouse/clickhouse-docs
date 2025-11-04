---
'sidebar_label': '概要'
'slug': '/integrations/dbt'
'sidebar_position': 1
'description': 'ユーザーはdbtを使用してClickHouse内のデータを変換・モデル化できます'
'title': 'dbtとClickHouseの統合'
'doc_type': 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Integrating dbt and ClickHouse {#integrate-dbt-clickhouse}

<ClickHouseSupportedBadge/>

## The dbt-clickhouse Adapter {#dbt-clickhouse-adapter}
**dbt** (データビルドツール)は、アナリティクスエンジニアがデータウェアハウス内のデータを単にSELECT文を書くことで変換できるようにします。dbtは、これらのSELECT文をデータベース内のテーブルやビューという形でオブジェクトに具現化する作業を行い、[Extract Load and Transform (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform)のTを実行します。ユーザーはSELECT文によって定義されたモデルを作成できます。

dbt内では、これらのモデルを相互参照およびレイヤー化して、より高レベルの概念を構築することができます。モデルを接続するために必要なボイラープレートSQLは自動的に生成されます。さらに、dbtはモデル間の依存関係を特定し、有向非巡回グラフ（DAG）を使用して適切な順序で作成されることを保証します。

dbtは[ClickHouse対応アダプタ](https://github.com/ClickHouse/dbt-clickhouse)を介してClickHouseと互換性があります。私たちは、公開されているIMDBデータセットに基づいたシンプルな例を用いてClickHouseとの接続プロセスを説明します。また、現在のコネクタのいくつかの制限も強調します。

<TOCInline toc={toc}  maxHeadingLevel={2} />

## Supported features {#supported-features}

**サポートされる機能**
- [x] テーブルの具現化
- [x] ビューの具現化
- [x] 増分具現化
- [x] マイクロバッチ増分具現化
- [x] マテリアライズドビューの具現化（`TO`形式のMATERIALIZED VIEWを使用、実験的）
- [x] シード
- [x] ソース
- [x] ドキュメント生成
- [x] テスト
- [x] スナップショット
- [x] 多くのdbt-utilsマクロ（現在はdbt-coreに含まれています）
- [x] 一時的な具現化
- [x] 分散テーブル具現化（実験的）
- [x] 分散増分具現化（実験的）
- [x] 契約

## Concepts {#concepts}

dbtはモデルの概念を導入します。これは、SQL文として定義され、多くのテーブルを結合する可能性があります。モデルは、いくつかの方法で「具現化」できます。具現化は、モデルのSELECTクエリに対するビルド戦略を表します。具現化の背後にあるコードは、SELECTクエリを新しい関係を作成するための文でラップするボイラープレートSQLです。

dbtは4種類の具現化を提供します：

* **view**（デフォルト）：モデルはデータベース内でビューとして構築されます。
* **table**：モデルはデータベース内でテーブルとして構築されます。
* **ephemeral**：モデルはデータベース内で直接構築されず、代わりに依存モデルとして共通テーブル式として引き込まれます。
* **incremental**：モデルは最初にテーブルとして具現化され、その後の実行でdbtが新しい行を挿入し、テーブル内の変更された行を更新します。

追加の構文や句は、基盤となるデータが変更された場合にこれらのモデルがどのように更新されるべきかを定義します。dbtは通常、パフォーマンスが懸念されるまでビュー具現化から始めることを推奨しています。テーブル具現化は、モデルのクエリの結果をテーブルとして捉えることにより、クエリ時間のパフォーマンスを向上させますが、ストレージの増加を伴います。増分アプローチは、さらなる基本データのアップデートをターゲットテーブルにキャプチャできるようにするために、これをさらに進展させます。

現在の[アダプタ](https://github.com/silentsokolov/dbt-clickhouse)は、ClickHouseで**マテリアライズドビュー**、**辞書**、**分散テーブル**、および**分散増分**具現化もサポートしています。また、アダプタはdbtの[スナップショット](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)や[シード](https://docs.getdbt.com/docs/building-a-dbt-project/seeds)もサポートしています。

### Details about supported materializations {#details-about-supported-materializations}

| タイプ                        | サポートされていますか？ | 詳細                                                                                                                          |
|-----------------------------|------------|----------------------------------------------------------------------------------------------------------------------------------|
| ビュー具現化                | YES        | [ビュー](https://clickhouse.com/docs/en/sql-reference/table-functions/view/)を作成します。                                            |
| テーブル具現化              | YES        | [テーブル](https://clickhouse.com/docs/en/operations/system-tables/tables/)を作成します。サポートされているエンジンのリストは以下です。 |
| 増分具現化                  | YES        | 存在しない場合はテーブルを作成し、更新のみを書き込みます。                                                                         |
| 一時的マテリアライズ        | YES        | 一時的/CTE具現化を作成します。このモデルはdbtに内部的であり、データベースオブジェクトは作成しません。                            |

次の機能はClickHouseでの[実験的機能](https://clickhouse.com/docs/en/beta-and-experimental-features)です：

| タイプ                                    | サポートされていますか？        | 詳細                                                                                                                                                                                                                                         |
|-----------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| マテリアライズドビュー具現化           | YES, Experimental | [マテリアライズドビュー](https://clickhouse.com/docs/en/materialized-view)を作成します。                                                                                                                                                    |
| 分散テーブル具現化                     | YES, Experimental | [分散テーブル](https://clickhouse.com/docs/en/engines/table-engines/special/distributed)を作成します。                                                                                                                                     |
| 分散増分具現化                         | YES, Experimental | 分散テーブルと同じアイデアに基づいた増分モデルです。すべての戦略がサポートされているわけではありません。詳細については[こちら](https://github.com/ClickHouse/dbt-clickhouse?tab=readme-ov-file#distributed-incremental-materialization)を参照してください。                     |
| 辞書具現化                             | YES, Experimental | [辞書](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary)を作成します。                                                                                                                                              |

## Setup of dbt and the ClickHouse adapter {#setup-of-dbt-and-the-clickhouse-adapter}

### Install dbt-core and dbt-clickhouse {#install-dbt-core-and-dbt-clickhouse}

```sh
pip install dbt-clickhouse
```

### Provide dbt with the connection details for our ClickHouse instance. {#provide-dbt-with-the-connection-details-for-our-clickhouse-instance}
`~/.dbt/profiles.yml`ファイルで`clickhouse`プロファイルを設定し、ユーザー、パスワード、スキーマホストプロパティを提供します。接続設定オプションの完全なリストは、[機能と設定](/integrations/dbt/features-and-configurations)ページで入手可能です：
```yaml
clickhouse:
  target: dev
  outputs:
    dev:
      type: clickhouse
      schema: <target_schema>
      host: <host>
      port: 8443 # use 9440 for native
      user: default
      password: <password>
      secure: True
```

### Create a dbt project {#create-a-dbt-project}

```sh
dbt init project_name
```

`project_name`ディレクトリ内で、ClickHouseサーバーに接続するためのプロファイル名を指定するように`dbt_project.yml`ファイルを更新します。

```yaml
profile: 'clickhouse'
```

### Test connection {#test-connection}
CLIツールで`dbt debug`を実行して、dbtがClickHouseに接続できるかどうかを確認します。レスポンスに`Connection test: [OK connection ok]`が含まれていることを確認し、接続が成功したことを示します。

次の例ではdbt CLIの使用を前提としています。このアダプタはまだ[dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview)内で使用できませんが、すぐに利用可能になることを期待しています。詳細についてはサポートにお問い合わせください。

dbtはCLIインストールのためにいくつかのオプションを提供しています。[こちら](https://docs.getdbt.com/dbt-cli/install/overview)で説明されている手順に従ってください。この段階ではdbt-coreのみをインストールします。両方のdbtとdbt-clickhouseのインストールには`pip`の使用を推奨します。

```bash
pip install dbt-clickhouse
```

ClickHouseでdbtを使用する方法については、[ガイドページ](/integrations/dbt/guides)にアクセスしてください。

## Troubleshooting Connections {#troubleshooting-connections}

dbtからClickHouseへの接続に問題が発生した場合、以下の基準が満たされていることを確認してください：

- エンジンは[サポートされているエンジン](/integrations/dbt/features-and-configurations#supported-table-engines)のいずれかである必要があります。
- データベースにアクセスするための十分な権限が必要です。
- データベースのデフォルトテーブルエンジンを使用していない場合は、モデル設定でテーブルエンジンを指定する必要があります。

## Limitations {#limitations}

現在のClickHouseアダプタには、ユーザーが知っておくべきいくつかの制限があります：

1. アダプタは現在、モデルをテーブルとして`INSERT TO SELECT`を使用して具現化します。これは実質的にデータの重複を意味します。非常に大きなデータセット（PB）は、極めて長い実行時間を引き起こし、いくつかのモデルを実行不可能にします。クエリによって返される行数を最小限に抑えることを目指し、可能な限りGROUP BYを利用してください。単にソースの行数を保持しながら変換を行うモデルよりも、データを要約するモデルを好んで使用してください。
2. モデルを表現するために分散テーブルを使用するには、ユーザーが各ノードで基盤となるレプリケーテッドテーブルを手動で作成する必要があります。その後、これらのテーブルの上に分散テーブルを作成できます。アダプタはクラスタの作成を管理しません。
3. dbtがデータベース内に関係（テーブル/ビュー）を作成するとき、通常は`{{ database }}.{{ schema }}.{{ table/view id }}`として作成します。ClickHouseはスキーマの概念を持っていません。したがって、アダプタは`{{schema}}.{{ table/view id }}`を使用し、`schema`はClickHouseデータベースです。
4. 一時的モデル/CTEはClickHouseのINSERT文の`INSERT INTO`の前に配置されると機能しません。詳細については、https://github.com/ClickHouse/ClickHouse/issues/30323を参照してください。これはほとんどのモデルには影響しないはずですが、一時的モデルがモデル定義や他のSQL文でどこに配置されるかには注意が必要です。 <!-- TODO review this limitation, looks like the issue was already closed and the fix was introduced in 24.10 -->

Further Information

以前のガイドはdbt機能の表面に触れるに過ぎません。ユーザーは優れた[dbtドキュメント](https://docs.getdbt.com/docs/introduction)を読むことを推奨します。

アダプタの追加設定については[こちら](https://github.com/silentsokolov/dbt-clickhouse#model-configuration)を参照してください。

## Fivetran {#fivetran}

`dbt-clickhouse`コネクタは、[Fivetranの変換](https://fivetran.com/docs/transformations/dbt)でも利用可能で、`dbt`を使用してFivetranプラットフォーム内のシームレスな統合および変換機能を提供します。
