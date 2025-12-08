---
keywords: ['clickhouse', 'python', 'client', 'connect', 'integrate']
slug: /integrations/python
description: 'ClickHouse Connect プロジェクトスイートによる、Python から ClickHouse への接続'
title: 'ClickHouse Connect を使用した Python との連携'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-connect'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# Introduction {#introduction}

ClickHouse Connect は、幅広い Python アプリケーションとの相互運用性を提供する中核となるデータベースドライバーです。

- メインインターフェースは、パッケージ `clickhouse_connect.driver` に含まれる `Client` オブジェクトです。このコアパッケージには、ClickHouse サーバーとの通信に使用される各種ヘルパークラスおよびユーティリティ関数に加え、INSERT および SELECT クエリを高度に制御するための「コンテキスト」実装も含まれています。
- パッケージ `clickhouse_connect.datatypes` は、すべての非実験的な ClickHouse データ型向けのベース実装とサブクラスを提供します。その主な機能は、ClickHouse データを ClickHouse の「Native」バイナリ列指向フォーマットにシリアル化および逆シリアル化することであり、これにより ClickHouse とクライアントアプリケーション間の最も効率的なデータ転送を実現します。
- パッケージ `clickhouse_connect.cdriver` 内の Cython/C クラスは、最も一般的なシリアル化および逆シリアル化処理の一部を最適化し、純粋な Python 実装と比べて大幅に高いパフォーマンスを実現します。
- パッケージ `clickhouse_connect.cc_sqlalchemy` には、`datatypes` および `dbi` パッケージを基盤として構築された [SQLAlchemy](https://www.sqlalchemy.org/) ダイアレクトがあります。この実装は、`JOIN`（`INNER`、`LEFT OUTER`、`FULL OUTER`、`CROSS`）、`WHERE` 句、`ORDER BY`、`LIMIT`/`OFFSET`、`DISTINCT` 操作、`WHERE` 条件付きの軽量な `DELETE` 文、テーブルリフレクション、基本的な DDL 操作（`CREATE TABLE`、`CREATE`/`DROP DATABASE`）を含む SQLAlchemy Core の機能をサポートします。高度な ORM 機能や高度な DDL 機能はサポートしていませんが、ClickHouse の OLAP 指向データベースに対する多くの分析ワークロードに適した堅牢なクエリ機能を提供します。
- コアドライバーおよび [ClickHouse Connect SQLAlchemy](sqlalchemy.md) 実装は、ClickHouse を Apache Superset に接続するための推奨方法です。`ClickHouse Connect` データベース接続、または `clickhousedb` SQLAlchemy ダイアレクトの接続文字列を使用してください。

本ドキュメントは、clickhouse-connect リリース 0.9.2 時点の内容です。

:::note
公式の ClickHouse Connect Python ドライバーは、ClickHouse サーバーとの通信に HTTP プロトコルを使用します。これにより HTTP ロードバランサーの利用が可能となり、ファイアウォールやプロキシが存在するエンタープライズ環境でも適切に動作しますが、ネイティブな TCP ベースプロトコルと比べて圧縮効率とパフォーマンスがわずかに低く、クエリキャンセルのような一部の高度な機能はサポートされません。ユースケースによっては、ネイティブな TCP ベースプロトコルを使用する [Community Python drivers](/interfaces/third-party/client-libraries.md) の利用を検討してください。
:::

## 動作要件と互換性 {#requirements-and-compatibility}

|       Python |   |       プラットフォーム¹ |   |      ClickHouse |    | SQLAlchemy² |   | Apache Superset |   |  Pandas |   | Polars |   |
|-------------:|:--|----------------:|:--|----------------:|:---|------------:|:--|----------------:|:--|--------:|:--|-------:|:--|
| 2.x, &lt;3.9 | ❌ |     Linux (x86) | ✅ |       &lt;25.x³ | 🟡 |  &lt;1.4.40 | ❌ |         &lt;1.4 | ❌ | &ge;1.5 | ✅ |    1.x | ✅ |
|        3.9.x | ✅ | Linux (Aarch64) | ✅ |           25.x³ | 🟡 |  &ge;1.4.40 | ✅ |           1.4.x | ✅ |     2.x | ✅ |        |   |
|       3.10.x | ✅ |     macOS (x86) | ✅ |    25.3.x (LTS) | ✅  |     &ge;2.x | ✅ |           1.5.x | ✅ |         |   |        |   |
|       3.11.x | ✅ |     macOS (ARM) | ✅ | 25.6.x (Stable) | ✅  |             |   |           2.0.x | ✅ |         |   |        |   |
|       3.12.x | ✅ |         Windows | ✅ | 25.7.x (Stable) | ✅  |             |   |           2.1.x | ✅ |         |   |        |   |
|       3.13.x | ✅ |                 |   |    25.8.x (LTS) | ✅  |             |   |           3.0.x | ✅ |         |   |        |   |
|              |   |                 |   | 25.9.x (Stable) | ✅  |             |   |                 |   |         |   |        |   |

¹ClickHouse Connect は上記に列挙したプラットフォームに対して明示的にテストされています。さらに、優れた [`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/) プロジェクトでサポートされているすべてのアーキテクチャ向けに、テストされていないバイナリ wheel（C による最適化あり）もビルドされています。最後に、ClickHouse Connect は純粋な Python 実装としても動作するため、ソースからのインストールは比較的新しい Python 環境であればどれでも動作すると考えられます。

²SQLAlchemy のサポートは Core 機能（クエリ、基本的な DDL）に限定されています。ORM 機能はサポートされていません。詳細については [SQLAlchemy 連携サポート](sqlalchemy.md) ドキュメントを参照してください。

³ClickHouse Connect は、公式にサポートされている範囲外のバージョンでも概ね問題なく動作します。

## インストール {#installation}

pip を使って [PyPI](https://pypi.org/project/clickhouse-connect/) から ClickHouse Connect をインストールします：

`pip install clickhouse-connect`

ClickHouse Connect はソースからインストールすることもできます：

* `git clone` を使って [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-connect) をクローンします
* （オプション）C/Cython の最適化をビルドして有効にするために `pip install cython` を実行します
* `cd` コマンドでプロジェクトのルートディレクトリに移動し、`pip install .` を実行します

## サポートポリシー {#support-policy}

問題を報告する前に、必ず ClickHouse Connect を最新バージョンに更新してください。問題は [GitHub のプロジェクト](https://github.com/ClickHouse/clickhouse-connect/issues)に起票してください。ClickHouse Connect の将来のリリースは、リリース時点で積極的にサポートされている ClickHouse バージョンとの互換性を保つことを想定しています。ClickHouse サーバーの積極的サポート対象バージョンは[こちら](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)で確認できます。どのバージョンの ClickHouse サーバーを使用すべきか判断に迷う場合は、[こちらのディスカッション](https://clickhouse.com/docs/knowledgebase/production#how-to-choose-between-clickhouse-releases)を参照してください。CI のテストマトリクスでは、最新の 2 つの LTS リリースと最新の 3 つの安定版リリースに対してテストを実行しています。ただし、HTTP プロトコルの性質と、ClickHouse のリリース間で破壊的変更が最小限に抑えられていることから、ClickHouse Connect は公式にサポートされる範囲外のサーバーバージョンでも概ね良好に動作しますが、一部の高度なデータ型との互換性は変動する可能性があります。

## 基本的な使い方 {#basic-usage}

### 接続情報を確認する {#gather-your-connection-details}

<ConnectionDetails />

### 接続を確立する {#establish-a-connection}

ClickHouse への接続方法として、次の 2 つの例を示します。

- localhost 上で動作している ClickHouse サーバーに接続する場合
- ClickHouse Cloud サービスに接続する場合

#### ClickHouse Connect クライアント インスタンスを使用して localhost 上の ClickHouse サーバーに接続する: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```

#### ClickHouse Connect クライアントインスタンスを使用して ClickHouse Cloud サービスに接続します: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
先ほど収集した接続情報を使用してください。ClickHouse Cloud サービスでは TLS が必須となるため、ポート 8443 を使用してください。
:::

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```

### データベースを操作する {#interact-with-your-database}

ClickHouse の SQL コマンドを実行するには、クライアントの `command` メソッドを使用します。

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

バッチデータを挿入するには、行と値の二次元配列をクライアントの `insert` メソッドに渡して使用します。

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

ClickHouse SQL を使用してデータを取得するには、クライアントの `query` メソッドを使用してください。

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
print(result.result_rows)
# 出力: [(2000, -50.9035)] {#output-2000-509035}
```
