---
description: 'Moose Stack を使った ClickHouse 開発の入門。型安全なスキーマとローカル開発環境により、ClickHouse 上でコードファーストに構築するアプローチです'
sidebar_label: 'Moose OLAP (TypeScript / Python)'
sidebar_position: 25
slug: /interfaces/third-party/moose-olap
title: 'Moose OLAP を使用した ClickHouse 上での開発'
keywords: ['Moose']
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Moose OLAP を用いた ClickHouse 上での開発

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap) は、TypeScript と Python でリアルタイム分析バックエンドを構築するためのオープンソース開発者向けツールキットである [Moose Stack](https://docs.fiveonefour.com/moose) の中核モジュールです。 

Moose OLAP は、ClickHouse 向けにネイティブ実装された、開発者フレンドリーな抽象化と ORM 風の機能を提供します。



## Moose OLAPの主な機能 {#key-features}

- **コードとしてのスキーマ**: TypeScriptまたはPythonでClickHouseテーブルを定義し、型安全性とIDEの自動補完機能を利用できます
- **型安全なクエリ**: 型チェックと自動補完のサポートを備えたSQLクエリを記述できます
- **ローカル開発**: 本番環境に影響を与えることなく、ローカルのClickHouseインスタンスで開発とテストを実行できます
- **マイグレーション管理**: スキーマ変更をバージョン管理し、コードを通じてマイグレーションを管理できます
- **リアルタイムストリーミング**: ストリーミングデータ取り込みのためにClickHouseをKafkaまたはRedpandaと連携させる組み込みサポートを提供します
- **REST API**: ClickHouseテーブルとビューの上に、完全にドキュメント化されたREST APIを簡単に生成できます


## 5分以内で始める {#getting-started}

最新のインストールおよび入門ガイドについては、[Moose Stackドキュメント](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse)を参照してください。

または、このガイドに従って、既存のClickHouseまたはClickHouse Cloudデプロイメント上でMoose OLAPを5分以内に起動できます。

### 前提条件 {#prerequisites}

- **Node.js 20+** または **Python 3.12+** - TypeScriptまたはPythonでの開発に必要
- **Docker Desktop** - ローカル開発環境用
- **macOS/Linux** - WindowsはWSL2経由で動作します

<VerticalStepper headerLevel="h3">

### Mooseのインストール {#step-1-install-moose}

Moose CLIをシステムにグローバルインストールします:

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### プロジェクトのセットアップ {#step-2-set-up-project}

#### オプションA: 既存のClickHouseデプロイメントを使用 {#option-a-use-own-clickhouse}

**重要**: 本番環境のClickHouseには一切変更を加えません。これは、ClickHouseテーブルから派生したデータモデルを使用して、新しいMoose OLAPプロジェクトを初期化するだけです。


```bash
# TypeScript
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language typescript
```


# Python

moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language python

````

ClickHouse接続文字列は以下の形式で指定してください:

```bash
https://username:password@host:port/?database=database_name
````

#### オプションB: ClickHouse Playgroundを使用する {#option-b-use-clickhouse-playground}

ClickHouseをまだセットアップしていない場合は、ClickHouse PlaygroundでMoose OLAPをお試しください。


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

開発サーバーを起動すると、コード定義から本番環境のすべてのテーブルが自動的に再現されたローカルClickHouseインスタンスが立ち上がります：

```bash
moose dev
````

**重要**：本番環境のClickHouseには影響しません。ローカル開発環境が作成されます。

### ローカルデータベースにデータを投入する {#step-6-seed-database}

ローカルClickHouseインスタンスにデータを投入します：

#### 独自のClickHouseから {#from-own-clickhouse}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### ClickHouse playgroundから {#from-clickhouse-playground}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### Moose OLAPを使用した構築 {#step-7-building-with-moose-olap}

テーブルをコードで定義したことで、WebアプリケーションのORMデータモデルと同様の利点が得られます。分析データ上にAPIやマテリアライズドビューを構築する際に、型安全性と自動補完機能を活用できます。次のステップとして、以下を試すことができます：

- [Moose API](https://docs.fiveonefour.com/moose/apis)を使用したREST APIの構築
- [Moose Workflows](https://docs.fiveonefour.com/moose/workflows)または[Moose Streaming](https://docs.fiveonefour.com/moose/workflows)を使用したデータの取り込みまたは変換
- [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary)と[Moose Migrate](https://docs.fiveonefour.com/moose/migrate)を使用した本番環境への移行

</VerticalStepper>


## ヘルプの取得とコミュニティへの参加 {#get-help-stay-connected}

- **リファレンスアプリケーション**: オープンソースのリファレンスアプリケーション [Area Code](https://github.com/514-labs/area-code) をご確認ください。特殊なインフラストラクチャを必要とする、機能豊富なエンタープライズ対応アプリケーションに必要なすべての構成要素を含むスターターリポジトリです。ユーザー向け分析と運用データウェアハウスの2つのサンプルアプリケーションが用意されています。
- **Slackコミュニティ**: サポートやフィードバックについては、[Slack](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg) で Moose Stack のメンテナーと連絡を取ることができます
- **チュートリアル動画**: Moose Stack の機能に関するビデオチュートリアル、デモ、詳細解説は [Youtube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw) でご覧いただけます
- **貢献**: コードの確認、Moose Stack への貢献、問題の報告は [GitHub](https://github.com/514-labs/moose) で行えます
