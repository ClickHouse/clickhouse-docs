---
slug: /use-cases/observability/clickstack/example-datasets/session-replay-demo
title: 'セッションリプレイのデモ'
sidebar_position: 4
pagination_prev: null
pagination_next: null
description: 'ClickStack のセッションリプレイ向けに Web アプリケーションを計装する方法を示すインタラクティブなデモアプリケーション'
doc_type: 'guide'
keywords: ['clickstack', 'セッションリプレイ', 'ブラウザー SDK', 'デモ', 'オブザーバビリティ', '計装']
---

import Image from '@theme/IdealImage';
import api_key from '@site/static/images/clickstack/api-key.png';
import demo_app from '@site/static/images/clickstack/session-replay/demo-app.png';
import session_replay from '@site/static/images/clickstack/session-replay/session-replay.png';
import replay_search from '@site/static/images/clickstack/session-replay/replay-search-view.png';

:::note[TL;DR]
このガイドでは、ClickStack Browser SDK を使用してセッションリプレイ用に Web アプリケーションに計測（インストルメンテーション）を行う手順を説明します。他の事前生成データを読み込むサンプルデータセットとは異なり、このデモでは、実際の操作を通じてセッションデータを生成できるインタラクティブなアプリケーションを提供します。

所要時間：10〜15分
:::


## 概要 \{#overview\}

[session replay デモアプリケーション](https://github.com/ClickHouse/clickstack-session-replay-demo) は、vanilla JavaScript で構築されたドキュメント閲覧用アプリケーションです。セッションリプレイのインストルメンテーションをどれほど最小限に抑えられるかを示しており、1 つの script タグと 1 回の初期化呼び出しだけで、すべてのユーザー操作を自動的に取得できます。

このリポジトリには 2 つのブランチが含まれています:

- **`main`** — すべてインストルメンテーション済みで、すぐに利用可能なブランチ
- **`pre-instrumented`** — インストルメンテーションのないクリーンなバージョンで、どこに追加すべきかを示すコードコメント付きのブランチ

このガイドでは、まず `main` ブランチを使ってセッションリプレイの動作を確認し、その後インストルメンテーションコードを順に解説し、同じパターンを自分のアプリケーションに適用できるようにします。

セッションリプレイの概要と、それが ClickStack にどのように組み込まれているかについては、[Session Replay](/use-cases/observability/clickstack/session-replay) 機能ページを参照してください。

## 前提条件 \{#prerequisites\}

- Docker および Docker Compose がインストールされていること
- ポート 3000、4317、4318、8080 が利用可能であること

## デモを実行する \{#running-the-demo\}

<VerticalStepper headerLevel="h3">

### リポジトリをクローンする \{#clone-repository\}

```shell
git clone https://github.com/ClickHouse/clickstack-session-replay-demo
cd clickstack-session-replay-demo
```

### ClickStack を起動する \{#start-clickstack\}

```shell
docker-compose up -d clickstack
```

### API キーを取得する \{#get-api-key\}

1. [http://localhost:8080](http://localhost:8080) で HyperDX を開きます
2. 必要に応じてアカウントを作成するかログインします
3. **Team Settings → API Keys** に移動します
4. **インジェスト API key** をコピーします

<Image img={api_key} alt="ClickStack API Key"/>

5. 環境変数として設定します:

```shell
export CLICKSTACK_API_KEY='your-api-key-here'
```

### デモアプリケーションを起動する \{#start-demo-app\}

```shell
docker-compose --profile demo up demo-app
```

:::note
`CLICKSTACK_API_KEY` 変数をエクスポートしたのと同じターミナルでこのコマンドを実行してください。
:::

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、アプリを操作します。トピックを検索したり、カテゴリでフィルタしたり、コード例を表示したり、項目をブックマークしたりしてみてください。

<Image img={demo_app} alt="セッションリプレイのデモアプリ"/>

すべての操作は ClickStack Browser SDK によって自動的に収集されます。

### セッションリプレイを表示する \{#view-session-replay\}

[http://localhost:8080](http://localhost:8080) の HyperDX に戻り、左側のサイドバーから **Client Sessions** に移動します。

<Image img={replay_search} alt="セッションリプレイの検索"/>

セッションが一覧表示され、各セッションの継続時間とイベント数が確認できるはずです。▶️ ボタンをクリックしてリプレイします。

<Image img={session_replay} alt="セッションリプレイ"/>

**Highlighted** モードと **All Events** モードを切り替えて、タイムラインに表示される詳細度を調整します。

</VerticalStepper>

## インストルメンテーション \{#instrumentation\}

このデモアプリケーションは、セッションリプレイを有効化するために必要なコードがいかに少なくて済むかを示しています。アプリケーション側で行う追加は、次の 2 点だけです。

**1. SDK を組み込む（`app/public/index.html`）：**

```html
<script src="https://unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
```

**2. ClickStack の初期化 (`app/public/js/app.js`):**

```javascript
window.HyperDX.init({
  url: 'http://localhost:4318',
  apiKey: window.CLICKSTACK_API_KEY,
  service: 'clickhouse-session-replay-demo',
  consoleCapture: true,
  advancedNetworkCapture: true,
});
```

それ以外の部分はすべて標準的なアプリケーションコードです。SDK がユーザー操作、コンソールログ、ネットワークリクエスト、エラーを自動的にすべて収集するため、追加の計装は不要です。


### 自分で試してみる \{#try-it-yourself\}

アプリにゼロからインスツルメンテーションを行うには、`pre-instrumented` ブランチに切り替えてください。

```shell
git checkout pre-instrumented
```

このブランチには、ClickStack のインストルメンテーションが一切含まれていない同じアプリケーションが含まれています。`app/public/index.html` と `app/public/js/app.js` のコードコメントに、上記 2 つのコードスニペットをどこに追加するかが正確に示されています。追加したら、デモアプリを再起動してください。以降、行った操作が ClickStack 上に表示され始めます。


## トラブルシューティング \{#troubleshooting\}

### HyperDX にセッションが表示されない \{#sessions-not-appearing\}

1. ブラウザのコンソールにエラーが出力されていないか確認します
2. ClickStack が起動していることを確認します: `docker-compose ps`
3. API キーが設定されていることを確認します: `echo $CLICKSTACK_API_KEY`
4. Client Sessions ビューで時間範囲を調整します（**Last 15 minutes** を選択してみてください）
5. ブラウザをハードリロードします: `Cmd+Shift+R` (Mac) または `Ctrl+Shift+R` (Windows/Linux)

### 401 Unauthorized エラー \{#401-errors\}

API キーが正しく設定されていません。次の点を確認してください。

1. ターミナルで環境変数としてエクスポートしていること: `export CLICKSTACK_API_KEY='your-key'`
2. そのキーをエクスポートした**同じターミナル**でデモアプリを起動していること
3. HyperDX UI から取得したキーを使っていること（ランダムに生成された文字列ではないこと）

## クリーンアップ \{#cleanup\}

サービスを停止します：

```bash
docker-compose down
```

全データの削除:

```bash
docker-compose down -v
```


## 詳細情報 \{#learn-more\}

- [Session Replay](/use-cases/observability/clickstack/session-replay) — 機能概要、SDK オプション、およびプライバシー制御機能
- [Browser SDK Reference](/use-cases/observability/clickstack/sdks/browser) — SDK オプションの一覧と詳細な設定方法
- [ClickStack Getting Started](/use-cases/observability/clickstack/getting-started) — ClickStack をデプロイして、最初のデータを取り込む手順
- [All Sample Datasets](/use-cases/observability/clickstack/sample-datasets) — その他のサンプルデータセットとガイド