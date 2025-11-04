---
'description': 'ClickHouseの上に型安全なスキーマとローカル開発を使用して構築するためのコードファーストアプローチであるMoose Stackを始めましょう'
'sidebar_label': 'Moose OLAP (TypeScript / Python)'
'sidebar_position': 25
'slug': '/interfaces/third-party/moose-olap'
'title': 'ClickHouse上でのMoose OLAP開発'
'keywords':
- 'Moose'
'doc_type': 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouseでのMoose OLAPの開発

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap)は、リアルタイム分析バックエンドをTypescriptとPythonで構築するためのオープンソース開発者ツールキットである[Moose Stack](https://docs.fiveonefour.com/moose)のコアモジュールです。

Moose OLAPは、ClickHouseにネイティブに構築された開発者フレンドリーな抽象化とORMのような機能を提供します。

## Moose OLAPの主な機能 {#key-features}

- **コードとしてのスキーマ**: 型安全性とIDEのオートコンプリートを備えたTypeScriptまたはPythonでClickHouseテーブルを定義
- **型安全なクエリ**: 型チェックとオートコンプリートサポートを備えたSQLクエリを記述
- **ローカル開発**: 本番環境に影響を与えずにローカルのClickHouseインスタンスに対して開発およびテスト
- **マイグレーション管理**: スキーマ変更のバージョン管理とコーディングを介したマイグレーション管理
- **リアルタイムストリーミング**: ストリーミング取り込みのためにClickHouseとKafkaまたはRedpandaをペアリングするための組み込みサポート
- **REST API**: ClickHouseテーブルとビューの上に完全に文書化されたREST APIを簡単に生成

## 5分以内での始め方 {#getting-started}

最新のインストールガイドおよび開始ガイドについては、[Moose Stackドキュメント](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse)を参照してください。

または、既存のClickHouseまたはClickHouse Cloudデプロイメントで5分以内にMoose OLAPをセットアップするためにこのガイドに従ってください。

### 前提条件 {#prerequisites}

- **Node.js 20+** または **Python 3.12+** - TypeScriptまたはPythonの開発に必要
- **Docker Desktop** - ローカル開発環境用
- **macOS/Linux** - WindowsはWSL2経由で動作します

<VerticalStepper headerLevel="h3">

### Mooseをインストール {#step-1-install-moose}

Moose CLIをシステムにグローバルにインストール：

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### プロジェクトを設定 {#step-2-set-up-project}

#### オプションA: 自分の既存のClickHouseデプロイメントを使用 {#option-a-use-own-clickhouse}

**重要**: あなたの本番ClickHouseは影響を受けません。これは、ClickHouseテーブルから派生したデータモデルを持つ新しいMoose OLAPプロジェクトを初期化するだけです。

```bash

# TypeScript
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language typescript


# Python
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language python
```

あなたのClickHouse接続文字列は次の形式である必要があります：

```bash
https://username:password@host:port/?database=database_name
```

#### オプションB: ClickHouseプレイグラウンドを使用 {#option-b-use-clickhouse-playground}

ClickHouseがまだ動作していませんか？ClickHouseプレイグラウンドを使用してMoose OLAPを試してみてください！

```bash

# TypeScript
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language typescript


# Python
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language python
```

### 依存関係をインストール {#step-3-install-dependencies}

```bash

# TypeScript
cd my-project
npm install


# Python
cd my-project
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

次のメッセージが表示されるはずです: `Successfully generated X models from ClickHouse tables`

### 生成されたモデルを探索する {#step-4-explore-models}

Moose CLIは、既存のClickHouseテーブルから自動的にTypeScriptインターフェースまたはPython Pydanticモデルを生成します。

新しいデータモデルを`app/index.ts`ファイルで確認してください。

### 開発を開始 {#step-5-start-development}

開発サーバーを起動して、すべての本番テーブルが自動的にコード定義から再現されたローカルClickHouseインスタンスをスピンアップします：

```bash
moose dev
```

**重要**: あなたの本番ClickHouseは影響を受けません。これはローカル開発環境を作成します。

### ローカルデータベースをシード {#step-6-seed-database}

ローカルClickHouseインスタンスにデータをシードします：

#### 自分のClickHouseから {#from-own-clickhouse}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### ClickHouseプレイグラウンドから {#from-clickhouse-playground}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### Moose OLAPでのビルディング {#step-7-building-with-moose-olap}

コードでテーブルを定義したので、APIおよびMaterialized Viewを分析データの上に構築する際にORMデータモデルの利点と同様の型安全性とオートコンプリートを得ることができます。次のステップとして、以下を試してみることができます：
* [Moose API](https://docs.fiveonefour.com/moose/apis)を使用してREST APIを構築
* [Moose Workflows](https://docs.fiveonefour.com/moose/workflows)または[Moose Streaming](https://docs.fiveonefour.com/moose/workflows)を使用してデータを取り込みまたは変換
* [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary)と[Moose Migrate](https://docs.fiveonefour.com/moose/migrate)で本番へ移行することを検討

</VerticalStepper>

## ヘルプを得てつながる {#get-help-stay-connected}
- **リファレンスアプリケーション**: オープンソースのリファレンスアプリケーション、[Area Code](https://github.com/514-labs/area-code)をチェックしてください。特化したインフラを必要とする機能が豊富でエンタープライズ向けのアプリケーションに必要なすべてのビルディングブロックを持つスターターレポです。ユーザーフェイシングアナリティクスとオペレーショナルデータウェアハウスの2つのサンプルアプリケーションがあります。
- **Slackコミュニティ**: Moose Stackメンテイナーと[Slack](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg)でつながり、サポートとフィードバックを得る
- **チュートリアルを見る**: Moose Stackの機能に関するビデオチュートリアル、デモ、詳細な説明を[Youtube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw)で見る
- **貢献する**: コードをチェックし、Moose Stackに貢献し、[GitHub](https://github.com/514-labs/moose)で問題を報告
