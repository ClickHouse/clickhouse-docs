---
description: 'Moose Stack を使い始めましょう - 型安全なスキーマとローカル開発を活用した、ClickHouse 上でのコードファーストな開発アプローチ'
sidebar_label: 'Moose OLAP（TypeScript / Python）'
sidebar_position: 25
slug: /interfaces/third-party/moose-olap
title: 'Moose OLAP を使った ClickHouse 上での開発'
keywords: ['Moose']
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Moose OLAP を使用した ClickHouse 上での開発 {#developing-on-clickhouse-with-moose-olap}

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap) は、TypeScript と Python でリアルタイム分析バックエンドを構築するためのオープンソースの開発者向けツールキットである [Moose Stack](https://docs.fiveonefour.com/moose) の中核モジュールです。

Moose OLAP は、ClickHouse にネイティブ対応した、開発者フレンドリーな抽象化と ORM ライクな機能を提供します。

## Moose OLAP の主な機能 {#key-features}

- **コードとしてのスキーマ**: 型安全性と IDE の自動補完を活用しながら、TypeScript または Python で ClickHouse のテーブルを定義できます
- **型安全なクエリ**: 型チェックと自動補完のサポート付きで SQL クエリを記述できます
- **ローカル開発**: 本番環境に影響を与えることなく、ローカルの ClickHouse インスタンスに対して開発およびテストを実行できます
- **マイグレーション管理**: スキーマ変更をバージョン管理し、コードからマイグレーションを管理できます
- **リアルタイムストリーミング**: ClickHouse を Kafka や Redpanda と組み合わせたストリーミング取り込みをネイティブにサポートします
- **REST API**: ClickHouse のテーブルおよびビューの上に、完全にドキュメント化された REST API を容易に生成できます

## 5 分以内で始める {#getting-started}

最新かつ最適なインストール手順と Getting Started ガイドについては、[Moose Stack ドキュメント](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse)を参照してください。

または、このガイドに従って、既存の ClickHouse または ClickHouse Cloud のデプロイメント上で Moose OLAP を 5 分以内に起動して利用を開始できます。

### 前提条件 {#prerequisites}

- **Node.js 20+** または **Python 3.12+** - TypeScript または Python 開発に必須
- **Docker Desktop** - ローカル開発環境用
- **macOS/Linux** - Windows は WSL2 経由で動作

<VerticalStepper headerLevel="h3">

### Moose のインストール {#step-1-install-moose}

Moose CLI をシステム全体にグローバルインストールします:

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### プロジェクトのセットアップ {#step-2-set-up-project}

#### オプション A: 既存の ClickHouse デプロイメントを使用する {#option-a-use-own-clickhouse}

**重要**: 本番環境の ClickHouse には一切変更を加えません。これは、ClickHouse テーブルから派生したデータモデルを含む新しい Moose OLAP プロジェクトを初期化するだけです。

```bash
# TypeScript 用 {#typescript}
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language typescript

# Python 用 {#python}
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language python
```

ClickHouse の接続文字列は次の形式である必要があります:

```bash
https://username:password@host:port/?database=database_name
```

#### オプション B: ClickHouse Playground を使用する {#option-b-use-clickhouse-playground}

まだ ClickHouse を稼働させていない場合は、ClickHouse Playground を使って Moose OLAP を試してみてください。

```bash
# TypeScript 用 {#typescript}
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language typescript

# Python 用 {#python}
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language python
```

### 依存関係のインストール {#step-3-install-dependencies}

```bash
# TypeScript 用 {#typescript}
cd my-project
npm install

# Python 用 {#python}
cd my-project
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

次のようなメッセージが表示されるはずです: `Successfully generated X models from ClickHouse tables`

### 生成されたモデルの確認 {#step-4-explore-models}

Moose CLI は、既存の ClickHouse テーブルから TypeScript のインターフェースまたは Python の Pydantic モデルを自動生成します。

`app/index.ts` ファイルで新しいデータモデルを確認してください。

### 開発の開始 {#step-5-start-development}

開発サーバーを起動して、コード定義から本番テーブルをすべて自動再現したローカルの ClickHouse インスタンスを立ち上げます:

```bash
moose dev
```

**重要**: 本番環境の ClickHouse には一切変更を加えません。これはローカル開発環境を作成するだけです。

### ローカルデータベースへのシード {#step-6-seed-database}

ローカルの ClickHouse インスタンスにデータをシードします:

#### 自身の ClickHouse から {#from-own-clickhouse}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### ClickHouse Playground から {#from-clickhouse-playground}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### Moose OLAP を用いた構築 {#step-7-building-with-moose-olap}

コード内でテーブルを定義できたので、Web アプリの ORM データモデルと同様に、分析データの上に API やマテリアライズドビューを構築する際に、型安全性とオートコンプリートといった利点を得られます。次のステップとして、例えば以下を試すことができます:
* [Moose API](https://docs.fiveonefour.com/moose/apis) を使って REST API を構築する
* [Moose Workflows](https://docs.fiveonefour.com/moose/workflows) や [Moose Streaming](https://docs.fiveonefour.com/moose/workflows) を使ってデータを取り込んだり変換したりする
* [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary) と [Moose Migrate](https://docs.fiveonefour.com/moose/migrate) を使用して本番環境への移行を検討する

</VerticalStepper>

## サポートを受けてつながり続ける {#get-help-stay-connected}

- **リファレンスアプリケーション**: オープンソースのリファレンスアプリケーション [Area Code](https://github.com/514-labs/area-code) を確認してください。これは、専用のインフラストラクチャを必要とする、豊富な機能を備えたエンタープライズ対応アプリケーション向けに、必要な構成要素がすべてそろったスターターリポジトリです。サンプルアプリケーションとして、User Facing Analytics と Operational Data Warehouse の 2 つが用意されています。
- **Slack コミュニティ**: サポートやフィードバックのために、Moose Stack のメンテナーと [Slack 上で](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg) つながりましょう。
- **チュートリアル動画**: Moose Stack の機能に関する動画チュートリアル、デモ、詳細解説は [YouTube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw) で視聴できます。
- **コントリビュート**: コードを参照し、Moose Stack へのコントリビュートや Issue の報告を [GitHub](https://github.com/514-labs/moose) から行ってください。