---
description: 'Moose Stack の概要 — 型安全なスキーマとローカル開発環境を活用した、ClickHouse 上へのコードファーストな構築手法'
sidebar_label: 'Moose OLAP (TypeScript / Python)'
sidebar_position: 25
slug: /interfaces/third-party/moose-olap
title: 'Moose OLAP を用いた ClickHouse 上での開発'
keywords: ['Moose']
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Moose OLAP を使った ClickHouse 上での開発

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap) は、TypeScript と Python でリアルタイム分析バックエンドを構築するためのオープンソース開発者向けツールキットである [Moose Stack](https://docs.fiveonefour.com/moose) の中核モジュールです。 

Moose OLAP は、ClickHouse 向けにネイティブ実装された、開発者フレンドリーな抽象化と ORM のような機能を提供します。



## Moose OLAP の主な機能 {#key-features}

- **コードとしてのスキーマ定義**: 型安全性と IDE の補完機能を活かしながら、ClickHouse テーブルを TypeScript または Python で定義できます
- **型安全なクエリ**: 型チェックと補完機能付きで SQL クエリを記述できます
- **ローカル開発**: 本番環境に影響を与えることなく、ローカルの ClickHouse インスタンスに対して開発およびテストを行えます
- **マイグレーション管理**: スキーマ変更をバージョン管理し、コードからマイグレーションを管理できます
- **リアルタイムストリーミング**: ClickHouse と Kafka または Redpanda を組み合わせて、ストリーミングでデータを取り込むためのサポートが組み込まれています
- **REST API**: ClickHouse のテーブルやビューの上に、完全にドキュメント化された REST API を容易に生成できます



## 5分以内で始める {#getting-started}

最新のインストールおよび入門ガイドについては、[Moose Stackドキュメント](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse)を参照してください。

または、このガイドに従って、既存のClickHouseまたはClickHouse Cloudデプロイメント上でMoose OLAPを5分以内に起動できます。

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

**重要**: 本番環境のClickHouseには影響しません。ClickHouseテーブルから派生したデータモデルを使用して、新しいMoose OLAPプロジェクトを初期化するだけです。


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

開発サーバーを起動して、コード定義から本番環境のテーブルをすべて自動的に再現したローカルClickHouseインスタンスを立ち上げます：

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

### Moose OLAPで構築する {#step-7-building-with-moose-olap}

テーブルがコードで定義されたことで、Webアプリケーションのデータモデルと同様のメリット、つまり分析データ上にAPIやマテリアライズドビューを構築する際の型安全性と自動補完が得られます。次のステップとして、以下を試すことができます：

- [Moose API](https://docs.fiveonefour.com/moose/apis)でREST APIを構築する
- [Moose Workflows](https://docs.fiveonefour.com/moose/workflows)または[Moose Streaming](https://docs.fiveonefour.com/moose/workflows)でデータを取り込む、または変換する
- [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary)と[Moose Migrate](https://docs.fiveonefour.com/moose/migrate)で本番環境への移行を検討する

</VerticalStepper>


## サポートを受けてつながりを維持する {#get-help-stay-connected}
- **リファレンスアプリケーション**: オープンソースのリファレンスアプリケーション [Area Code](https://github.com/514-labs/area-code) を参照してください。特殊なインフラストラクチャを必要とする、機能が豊富でエンタープライズ対応のアプリケーション向けに必要なビルディングブロックがすべて揃ったスターター用リポジトリです。サンプルアプリケーションは 2 つあります: ユーザー向けアナリティクスとオペレーショナルデータウェアハウスです。
- **Slack コミュニティ**: サポートやフィードバックのために、Moose Stack のメンテナーと [Slack 上で](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg) つながりましょう。
- **チュートリアルを見る**: Moose Stack の機能についての動画チュートリアル、デモ、詳細な解説を [YouTube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw) で視聴できます。
- **コントリビュート**: コードを確認し、Moose Stack へのコントリビュートや課題報告を [GitHub](https://github.com/514-labs/moose) で行ってください。
