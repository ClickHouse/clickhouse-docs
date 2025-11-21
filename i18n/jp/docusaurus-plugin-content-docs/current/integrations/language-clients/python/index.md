---
keywords: ['clickhouse', 'python', 'client', 'connect', 'integrate']
slug: /integrations/python
description: 'Python と ClickHouse を接続するための ClickHouse Connect プロジェクト群'
title: 'ClickHouse Connect による Python 連携'
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

ClickHouse Connectは、幅広いPythonアプリケーションとの相互運用性を提供するコアデータベースドライバです。

- メインインターフェースは、`clickhouse_connect.driver`パッケージ内の`Client`オブジェクトです。このコアパッケージには、ClickHouseサーバーとの通信に使用される各種ヘルパークラスとユーティリティ関数、およびINSERTクエリとSELECTクエリの高度な管理のための「コンテキスト」実装も含まれています。
- `clickhouse_connect.datatypes`パッケージは、すべての非実験的なClickHouseデータ型の基本実装とサブクラスを提供します。その主な機能は、ClickHouseとクライアントアプリケーション間で最も効率的なデータ転送を実現するために使用される、ClickHouse「Native」バイナリカラム形式へのClickHouseデータのシリアライズとデシリアライズです。
- `clickhouse_connect.cdriver`パッケージ内のCython/Cクラスは、最も一般的なシリアライズとデシリアライズの一部を最適化し、純粋なPythonと比較して大幅にパフォーマンスを向上させます。
- `clickhouse_connect.cc_sqlalchemy`パッケージには、`datatypes`および`dbi`パッケージをベースに構築された[SQLAlchemy](https://www.sqlalchemy.org/)ダイアレクトがあります。この実装は、`JOIN`（`INNER`、`LEFT OUTER`、`FULL OUTER`、`CROSS`）を含む`SELECT`クエリ、`WHERE`句、`ORDER BY`、`LIMIT`/`OFFSET`、`DISTINCT`操作、`WHERE`条件付きの軽量な`DELETE`文、テーブルリフレクション、および基本的なDDL操作（`CREATE TABLE`、`CREATE`/`DROP DATABASE`）を含むSQLAlchemy Coreの機能をサポートしています。高度なORM機能や高度なDDL機能はサポートしていませんが、ClickHouseのOLAP指向データベースに対するほとんどの分析ワークロードに適した堅牢なクエリ機能を提供します。
- コアドライバと[ClickHouse Connect SQLAlchemy](sqlalchemy.md)実装は、ClickHouseをApache Supersetに接続するための推奨方法です。`ClickHouse Connect`データベース接続、または`clickhousedb` SQLAlchemyダイアレクト接続文字列を使用してください。

このドキュメントは、clickhouse-connectリリース0.9.2時点のものです。

:::note
公式のClickHouse Connect PythonドライバはClickHouseサーバーとの通信にHTTPプロトコルを使用します。これによりHTTPロードバランサーのサポートが可能になり、ファイアウォールやプロキシを使用するエンタープライズ環境でも適切に動作しますが、ネイティブのTCPベースプロトコルと比較して圧縮率とパフォーマンスがわずかに低く、クエリキャンセルなどの一部の高度な機能のサポートがありません。一部のユースケースでは、ネイティブのTCPベースプロトコルを使用する[コミュニティPythonドライバ](/interfaces/third-party/client-libraries.md)のいずれかの使用を検討することができます。
:::


## 要件と互換性 {#requirements-and-compatibility}

|       Python |     |       プラットフォーム¹ |     |      ClickHouse |     | SQLAlchemy² |     | Apache Superset |     |  Pandas |     | Polars |     |
| -----------: | :-- | --------------: | :-- | --------------: | :-- | ----------: | :-- | --------------: | :-- | ------: | :-- | -----: | :-- |
| 2.x, &lt;3.9 | ❌  |     Linux (x86) | ✅  |       &lt;25.x³ | 🟡  |  &lt;1.4.40 | ❌  |         &lt;1.4 | ❌  | &ge;1.5 | ✅  |    1.x | ✅  |
|        3.9.x | ✅  | Linux (Aarch64) | ✅  |           25.x³ | 🟡  |  &ge;1.4.40 | ✅  |           1.4.x | ✅  |     2.x | ✅  |        |     |
|       3.10.x | ✅  |     macOS (x86) | ✅  |    25.3.x (LTS) | ✅  |     &ge;2.x | ✅  |           1.5.x | ✅  |         |     |        |     |
|       3.11.x | ✅  |     macOS (ARM) | ✅  | 25.6.x (Stable) | ✅  |             |     |           2.0.x | ✅  |         |     |        |     |
|       3.12.x | ✅  |         Windows | ✅  | 25.7.x (Stable) | ✅  |             |     |           2.1.x | ✅  |         |     |        |     |
|       3.13.x | ✅  |                 |     |    25.8.x (LTS) | ✅  |             |     |           3.0.x | ✅  |         |     |        |     |
|              |     |                 |     | 25.9.x (Stable) | ✅  |             |     |                 |     |         |     |        |     |

¹ClickHouse Connectは、記載されているプラットフォームに対して明示的にテストされています。さらに、優れた[`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/)プロジェクトがサポートするすべてのアーキテクチャ向けに、未テストのバイナリホイール(C最適化付き)がビルドされています。また、ClickHouse Connectは純粋なPythonとしても実行できるため、ソースインストールは最新のPythonインストール環境であれば動作するはずです。

²SQLAlchemyのサポートはCore機能(クエリ、基本的なDDL)に限定されています。ORM機能はサポートされていません。詳細については、[SQLAlchemy統合サポート](sqlalchemy.md)のドキュメントを参照してください。

³ClickHouse Connectは、公式にサポートされている範囲外のバージョンでも一般的に正常に動作します。


## インストール {#installation}

[PyPI](https://pypi.org/project/clickhouse-connect/)からpipを使用してClickHouse Connectをインストールします:

`pip install clickhouse-connect`

ClickHouse Connectはソースからもインストールできます:

- [GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-connect)を`git clone`します。
- (オプション)`pip install cython`を実行してC/Cython最適化をビルドおよび有効化します
- プロジェクトのルートディレクトリに`cd`で移動し、`pip install .`を実行します


## サポートポリシー {#support-policy}

問題を報告する前に、ClickHouse Connectを最新バージョンに更新してください。問題は[GitHubプロジェクト](https://github.com/ClickHouse/clickhouse-connect/issues)に報告してください。ClickHouse Connectの今後のリリースは、リリース時点でアクティブサポート対象となっているClickHouseバージョンとの互換性を保つことを意図しています。アクティブサポート対象のClickHouseサーバーバージョンは[こちら](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)で確認できます。使用するClickHouseサーバーのバージョンが不明な場合は、[こちら](https://clickhouse.com/docs/knowledgebase/production#how-to-choose-between-clickhouse-releases)のディスカッションをお読みください。当社のCIテストマトリックスは、最新の2つのLTSリリースと最新の3つの安定版リリースに対してテストを実施しています。ただし、HTTPプロトコルの使用とClickHouseリリース間の破壊的変更が最小限であることから、ClickHouse Connectは公式サポート範囲外のサーバーバージョンでも一般的に正常に動作しますが、特定の高度なデータ型との互換性は異なる場合があります。


## 基本的な使用方法 {#basic-usage}

### 接続情報の収集 {#gather-your-connection-details}

<ConnectionDetails />

### 接続の確立 {#establish-a-connection}

ClickHouseへの接続例を2つ示します:

- localhostのClickHouseサーバーへの接続
- ClickHouse Cloudサービスへの接続

#### ClickHouse Connectクライアントインスタンスを使用してlocalhostのClickHouseサーバーに接続する: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```

#### ClickHouse Connectクライアントインスタンスを使用してClickHouse Cloudサービスに接続する: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
先ほど収集した接続情報を使用してください。ClickHouse CloudサービスではTLSが必須のため、ポート8443を使用します。
:::

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```

### データベースとの対話 {#interact-with-your-database}

ClickHouse SQLコマンドを実行するには、クライアントの`command`メソッドを使用します:

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

バッチデータを挿入するには、行と値の二次元配列を指定してクライアントの`insert`メソッドを使用します:

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

ClickHouse SQLを使用してデータを取得するには、クライアントの`query`メソッドを使用します:


```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
print(result.result_rows)
# 出力: [(2000, -50.9035)]
```
