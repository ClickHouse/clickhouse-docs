---
description: 'Moose Stack を使い、型安全なスキーマとローカル開発環境をコードファーストで構築しながら ClickHouse 上での開発を始める'
sidebar_label: 'Moose OLAP (TypeScript / Python)'
sidebar_position: 25
slug: /interfaces/third-party/moose-olap
title: 'Moose OLAP を使った ClickHouse 上での開発'
keywords: ['Moose']
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Moose OLAP を使った ClickHouse 開発

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap) は、Typescript と Python でリアルタイム分析向けのバックエンドを構築するためのオープンソース開発者向けツールキットである [Moose Stack](https://docs.fiveonefour.com/moose) の中核モジュールです。

Moose OLAP は、ClickHouse 向けにネイティブに実装された、開発者にとって扱いやすい抽象化や ORM ライクな機能を提供します。



## Moose OLAPの主な機能 {#key-features}

- **コードとしてのスキーマ**: TypeScriptまたはPythonでClickHouseテーブルを定義し、型安全性とIDEの自動補完機能を利用
- **型安全なクエリ**: 型チェックと自動補完のサポートによりSQLクエリを記述
- **ローカル開発**: 本番環境に影響を与えることなく、ローカルのClickHouseインスタンスで開発とテストを実施
- **マイグレーション管理**: スキーマ変更をバージョン管理し、コードを通じてマイグレーションを管理
- **リアルタイムストリーミング**: ストリーミング取り込みのためにClickHouseとKafkaまたはRedpandaを連携する組み込みサポート
- **REST API**: ClickHouseテーブルとビューの上に完全にドキュメント化されたREST APIを簡単に生成


## 5分以内で始める {#getting-started}

最新のインストールおよび入門ガイドについては、[Moose Stackドキュメント](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse)を参照してください。

または、このガイドに従って、既存のClickHouseまたはClickHouse Cloudデプロイメント上でMoose OLAPを5分以内にセットアップして実行できます。

### 前提条件 {#prerequisites}

- **Node.js 20+** または **Python 3.12+** - TypeScriptまたはPython開発に必要
- **Docker Desktop** - ローカル開発環境用
- **macOS/Linux** - WindowsはWSL2経由で動作

<VerticalStepper headerLevel="h3">

### Mooseをインストールする {#step-1-install-moose}

Moose CLIをシステムにグローバルインストールします:

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### プロジェクトをセットアップする {#step-2-set-up-project}

#### オプションA: 既存のClickHouseデプロイメントを使用する {#option-a-use-own-clickhouse}

**重要**: 本番環境のClickHouseには一切影響しません。これは、ClickHouseテーブルから派生したデータモデルを使用して、新しいMoose OLAPプロジェクトを初期化するだけです。


```bash
# TypeScript
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language typescript
```


# Python

moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language python

````

ClickHouse接続文字列は以下の形式で指定します：

```bash
https://username:password@host:port/?database=database_name
````

#### オプションB：ClickHouse Playgroundを使用 {#option-b-use-clickhouse-playground}

ClickHouseをまだセットアップしていない場合は、ClickHouse PlaygroundでMoose OLAPを試すことができます。


```bash
# TypeScript
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language typescript
```


# Python

moose init my-project --from-remote [https://explorer:@play.clickhouse.com:443/?database=default](https://explorer:@play.clickhouse.com:443/?database=default) --language python

```

### 依存関係のインストール {#step-3-install-dependencies}
```


```bash
# TypeScript
cd my-project
npm install
```


# Python

cd my-project
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

````

次のように表示されます：`Successfully generated X models from ClickHouse tables`

### 生成されたモデルを確認する {#step-4-explore-models}

Moose CLIは、既存のClickHouseテーブルからTypeScriptインターフェースまたはPython Pydanticモデルを自動生成します。

`app/index.ts`ファイルで新しいデータモデルを確認してください。

### 開発を開始する {#step-5-start-development}

開発サーバーを起動して、コード定義から本番環境のすべてのテーブルが自動的に再現されたローカルClickHouseインスタンスを起動します：

```bash
moose dev
````

**重要**：本番環境のClickHouseには影響しません。ローカル開発環境が作成されます。

### ローカルデータベースにデータを投入する {#step-6-seed-database}

ローカルClickHouseインスタンスにデータを投入します：

#### 自分のClickHouseから {#from-own-clickhouse}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### ClickHouse playgroundから {#from-clickhouse-playground}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### Moose OLAPで構築する {#step-7-building-with-moose-olap}

テーブルがコードで定義されたことで、WebアプリケーションのORMデータモデルと同様のメリット、つまり分析データ上にAPIやマテリアライズドビューを構築する際の型安全性と自動補完が得られます。次のステップとして、以下を試すことができます：

- [Moose API](https://docs.fiveonefour.com/moose/apis)を使用したREST APIの構築
- [Moose Workflows](https://docs.fiveonefour.com/moose/workflows)または[Moose Streaming](https://docs.fiveonefour.com/moose/workflows)を使用したデータの取り込みまたは変換
- [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary)と[Moose Migrate](https://docs.fiveonefour.com/moose/migrate)を使用した本番環境への移行の検討

</VerticalStepper>


## ヘルプとコミュニティ {#get-help-stay-connected}

- **リファレンスアプリケーション**: オープンソースのリファレンスアプリケーション [Area Code](https://github.com/514-labs/area-code) をご確認ください。専用インフラストラクチャを必要とする、機能豊富でエンタープライズ対応のアプリケーションに必要なすべての構成要素を含むスターターリポジトリです。User Facing AnalyticsとOperational Data Warehouseの2つのサンプルアプリケーションが用意されています。
- **Slackコミュニティ**: サポートやフィードバックについては、[Slack](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg)でMoose Stackのメンテナーにお問い合わせください
- **チュートリアル動画**: Moose Stackの機能に関するビデオチュートリアル、デモ、詳細解説は[YouTube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw)でご覧いただけます
- **コントリビュート**: コードの確認、Moose Stackへの貢献、問題の報告は[GitHub](https://github.com/514-labs/moose)で行えます
