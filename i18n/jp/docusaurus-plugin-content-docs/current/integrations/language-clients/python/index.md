---
keywords: ['clickhouse', 'python', 'client', 'connect', 'integrate']
slug: /integrations/python
description: 'Python から ClickHouse に接続するための ClickHouse Connect プロジェクトスイート'
title: 'Python と ClickHouse Connect の連携'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-connect'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# はじめに {#introduction}

ClickHouse Connect は、幅広い Python アプリケーションとの相互運用性を提供する中核となるデータベースドライバーです。

- 主なインターフェイスは、パッケージ `clickhouse_connect.driver` 内の `Client` オブジェクトです。このコアパッケージには、ClickHouse サーバーとの通信に使用される各種ヘルパークラスやユーティリティ関数、および INSERT クエリや SELECT クエリを高度に管理するための「コンテキスト」実装も含まれます。
- `clickhouse_connect.datatypes` パッケージは、実験的でないすべての ClickHouse データ型に対するベース実装とサブクラスを提供します。主な機能は、ClickHouse データを ClickHouse の「Native」バイナリカラム形式にシリアライズ／デシリアライズすることであり、ClickHouse とクライアントアプリケーション間の最も効率的なデータ転送を実現するために使用されます。
- `clickhouse_connect.cdriver` パッケージ内の Cython/C クラスは、最も一般的なシリアライズおよびデシリアライズ処理の一部を最適化し、純粋な Python に比べて大幅に高いパフォーマンスを実現します。
- パッケージ `clickhouse_connect.cc_sqlalchemy` には [SQLAlchemy](https://www.sqlalchemy.org/) ダイアレクトが含まれており、`datatypes` および `dbi` パッケージの上に構築されています。この実装は、`JOIN`（`INNER`、`LEFT OUTER`、`FULL OUTER`、`CROSS`）を伴う `SELECT` クエリ、`WHERE` 句、`ORDER BY`、`LIMIT`/`OFFSET`、`DISTINCT` 操作、`WHERE` 条件付きの軽量な `DELETE` 文、テーブルリフレクション、および基本的な DDL 操作（`CREATE TABLE`、`CREATE`/`DROP DATABASE`）など、SQLAlchemy Core の機能をサポートします。高度な ORM 機能や高度な DDL 機能はサポートしませんが、ClickHouse の OLAP 指向データベースに対するほとんどの分析ワークロードに適した堅牢なクエリ機能を提供します。
- コアドライバーおよび [ClickHouse Connect SQLAlchemy](sqlalchemy.md) 実装は、ClickHouse を Apache Superset に接続するための推奨方法です。`ClickHouse Connect` データベース接続、または `clickhousedb` SQLAlchemy ダイアレクトの接続文字列を使用してください。

本ドキュメントの内容は、clickhouse-connect リリース 0.9.2 時点の情報に基づいています。

:::note
公式の ClickHouse Connect Python ドライバーは、ClickHouse サーバーとの通信に HTTP プロトコルを使用します。これにより HTTP ロードバランサーの利用が可能となり、ファイアウォールやプロキシを伴うエンタープライズ環境でも適切に動作しますが、ネイティブな TCP ベースプロトコルと比較すると、圧縮率とパフォーマンスがやや劣り、クエリのキャンセルのような一部の高度な機能はサポートされません。ユースケースによっては、ネイティブな TCP ベースプロトコルを使用する [Community Python drivers](/interfaces/third-party/client-libraries.md) の利用を検討してもよいでしょう。
:::



## 要件と互換性 {#requirements-and-compatibility}

|       Python |   |        プラットフォーム¹ |   |      ClickHouse |    | SQLAlchemy² |   | Apache Superset |   |  Pandas |   | Polars |   |
|-------------:|:--|------------------------:|:--|----------------:|:---|------------:|:--|----------------:|:--|--------:|:--|-------:|:--|
| 2.x, &lt;3.9 | ❌ |           Linux (x86) | ✅ |       &lt;25.x³ | 🟡 |  &lt;1.4.40 | ❌ |         &lt;1.4 | ❌ | &ge;1.5 | ✅ |    1.x | ✅ |
|        3.9.x | ✅ |   Linux (Aarch64) | ✅ |           25.x³ | 🟡 |  &ge;1.4.40 | ✅ |           1.4.x | ✅ |     2.x | ✅ |        |   |
|       3.10.x | ✅ |           macOS (x86) | ✅ |    25.3.x (LTS) | ✅  |     &ge;2.x | ✅ |           1.5.x | ✅ |         |   |        |   |
|       3.11.x | ✅ |           macOS (ARM) | ✅ | 25.6.x (Stable) | ✅  |             |   |           2.0.x | ✅ |         |   |        |   |
|       3.12.x | ✅ |               Windows | ✅ | 25.7.x (Stable) | ✅  |             |   |           2.1.x | ✅ |         |   |        |   |
|       3.13.x | ✅ |                       |   |    25.8.x (LTS) | ✅  |             |   |           3.0.x | ✅ |         |   |        |   |
|              |   |                       |   | 25.9.x (Stable) | ✅  |             |   |                 |   |         |   |        |   |

¹ClickHouse Connect は、表に記載されているプラットフォームで明示的にテストされています。加えて、優れた [`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/) プロジェクトでサポートされているすべてのアーキテクチャ向けに、未テストのバイナリホイール（C 最適化付き）もビルドされています。さらに、ClickHouse Connect は純粋な Python 実装としても動作するため、ソースからインストールすれば、最近の Python 環境であれば基本的にどこでも動作するはずです。

²SQLAlchemy のサポートは Core 機能（クエリ、基本的な DDL）に限られます。ORM 機能はサポートされていません。詳細は [SQLAlchemy 統合サポート](sqlalchemy.md) ドキュメントを参照してください。

³ClickHouse Connect は、公式にサポートされる範囲外のバージョンでも、一般的には問題なく動作します。



## インストール {#installation}

ClickHouse Connect を [PyPI](https://pypi.org/project/clickhouse-connect/) から pip でインストールします:

`pip install clickhouse-connect`

ClickHouse Connect はソースコードからインストールすることもできます:
* [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-connect) を `git clone` します
* （オプション）`pip install cython` を実行して、C/Cython 最適化をビルドおよび有効化します
* プロジェクトのルートディレクトリに `cd` し、`pip install .` を実行します



## サポートポリシー {#support-policy}

問題を報告する前に、ClickHouse Connect を最新バージョンに更新してください。問題は [GitHub プロジェクト](https://github.com/ClickHouse/clickhouse-connect/issues)で起票してください。ClickHouse Connect の今後のリリースは、リリース時点でアクティブにサポートされている ClickHouse のバージョンと互換性があることを想定しています。ClickHouse サーバーのアクティブサポート対象バージョンは[こちら](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)で確認できます。どの ClickHouse サーバーバージョンを使用すべきか不明な場合は、[こちら](https://clickhouse.com/docs/knowledgebase/production#how-to-choose-between-clickhouse-releases)のディスカッションを参照してください。CI のテストマトリクスでは、最新の 2 つの LTS リリースと最新の 3 つの安定版リリースに対してテストを実施しています。ただし、HTTP プロトコルを使用していることや、ClickHouse リリース間の破壊的変更が最小限であることから、ClickHouse Connect は公式にサポートされる範囲外のサーバーバージョンとも一般的には良好に動作しますが、一部の高度なデータ型との互換性が異なる場合があります。



## 基本的な使い方

### 接続情報を取得する

<ConnectionDetails />

### 接続を確立する

ClickHouse への接続例を 2 つ示します:

* localhost 上の ClickHouse サーバーへの接続
* ClickHouse Cloud サービスへの接続

#### ClickHouse Connect クライアントインスタンスを使用して、localhost 上の ClickHouse サーバーに接続します:

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```

#### ClickHouse Connect クライアントインスタンスを使用して ClickHouse Cloud サービスに接続します:

:::tip
先ほど取得した接続情報を使用してください。ClickHouse Cloud サービスでは TLS が必要となるため、ポート 8443 を使用してください。
:::

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```

### データベースを操作する

ClickHouse の SQL コマンドを実行するには、クライアントの `command` メソッドを使用します。

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

バッチデータを挿入するには、クライアントの `insert` メソッドに行と値を表す二次元配列を渡して使用します。

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

ClickHouse SQL を使ってデータを取得するには、クライアントの `query` メソッドを使用します。


```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
print(result.result_rows)
# 出力: [(2000, -50.9035)]
```
