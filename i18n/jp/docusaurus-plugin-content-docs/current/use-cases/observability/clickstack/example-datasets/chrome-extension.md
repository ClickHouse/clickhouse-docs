---
slug: /use-cases/observability/clickstack/example-datasets/chrome-extension
title: 'Chrome拡張機能'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: 'HyperDX Chrome拡張機能を使用して、任意のWebサイトで ClickStack のセッションリプレイと RUM を有効にします'
doc_type: 'guide'
keywords: ['ClickStack', 'Chrome拡張機能', 'セッションリプレイ', 'ブラウザ SDK', 'RUM', 'オブザーバビリティ', 'HyperDX']
---

import Image from '@theme/IdealImage';
import extension_config from '@site/static/images/clickstack/chrome-extension/extension-config.png';

:::note[TL;DR]
このガイドでは、[HyperDX Chrome拡張機能](https://github.com/kyreddie/hyperdx-chrome-extension) を使用して、任意のWebサイトに ClickStack Browser SDK を組み込む方法を紹介します。対象アプリケーションのソースコードを変更する必要はありません。拡張機能を一度設定すれば、あとはサイトを閲覧するだけで、ClickStack でセッションリプレイを確認できます。

所要時間: 10〜15分
:::

## 概要 \{#overview\}

[HyperDX Chrome拡張機能](https://github.com/kyreddie/hyperdx-chrome-extension) は、アクセスしたページに [@hyperdx/browser](https://github.com/hyperdxio/hyperdx-js) SDK を注入します。コードベースを変更せずに、サイト上でセッションリプレイ、RUM、またはトレース伝播をデバッグしたい場合に役立ちます。たとえば、サードパーティ製アプリケーション、本番ビルド、または厳格な Content Security Policy (CSP) が設定されたローカル開発サーバーなどです。

SDK は拡張機能内に同梱されているため (約 480 KB) 、ページ側で実行時に CDN からスクリプトを読み込む必要はありません。この拡張機能は、まず外部の `chrome-extension://` スクリプトの注入を試み、CSP によって拡張機能由来のスクリプトがブロックされた場合は、インライン注入にフォールバックします。

制御可能なデモアプリケーションを計装する [Session Replay Demo](session-replay.md) とは異なり、この方法は Chrome で開く**任意の** URL で機能します。通常のユーザーとしてサイトを操作することで、セッションデータを生成できます。

セッションリプレイの概要と、それが ClickStack の中でどのような位置づけにあるかについては、[Session Replay](/use-cases/observability/clickstack/session-replay) の機能ページを参照してください。

## 前提条件 \{#prerequisites\}

* Google Chrome または Chromium ベースのブラウザー (Edge、Brave など)
* ClickStack をローカルで実行する場合は、[Docker](https://docs.docker.com/get-docker/) がインストールされていること
* ポート 4317、4318、8080 が使用可能であること (ローカルの ClickStack 向け)

## デモを実行する \{#running-the-demo\}

<VerticalStepper headerLevel="h3">
  ### 拡張機能のリポジトリをクローンする \{#clone-extension\}

  ```shell
  git clone https://github.com/kyreddie/hyperdx-chrome-extension
  cd hyperdx-chrome-extension
  ```

  ### 拡張機能をインストールする \{#install-extension\}

  1. Chrome を開き、`chrome://extensions` にアクセスします。
  2. **デベロッパー モード** を有効にします (右上) 。
  3. **パッケージ化されていない拡張機能を読み込む** をクリックします。
  4. クローンした `hyperdx-chrome-extension` ディレクトリを選択します。

  拡張機能はツールバーに **HyperDX Browser Extension** として表示されます。

  ### ClickStack を起動する \{#start-clickstack\}

  すでに ClickStack または HyperDX のインジェスト endpoint がある場合は、[拡張機能を設定する](#configure-extension) に進んでください。

  ローカルの ClickStack スタックでは、OpenTelemetry Collector を起動します。`{{CLICKHOUSE_ENDPOINT}}` と `{{CLICKHOUSE_PASSWORD}}` を ClickHouse の接続情報に置き換えてください。

  ```shell
  export CLICKHOUSE_ENDPOINT={{CLICKHOUSE_ENDPOINT}}
  export CLICKHOUSE_PASSWORD={{CLICKHOUSE_PASSWORD}}

  docker run \
    -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
    -e CLICKHOUSE_USER=default \
    -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
    -p 8080:8080 \
    -p 4317:4317 \
    -p 4318:4318 \
    clickhouse/clickstack-otel-collector:latest
  ```

  UI が動作していることを確認するには、[http://localhost:8080](http://localhost:8080) で HyperDX を開きます。

  ClickHouse と HyperDX UI を含む完全なローカルデプロイについては、[ClickStack の Getting Started](/use-cases/observability/clickstack/getting-started/oss) を参照してください。

  ### API key を取得する \{#get-api-key\}

  ローカルの ClickStack では API key が不要な場合があります。その場合、`http://localhost:4318` 上のセルフホスト collector にテレメトリーを送信するときは、拡張機能のフィールドを空欄のままにしてください。

  ClickStack Cloud または HyperDX Cloud へのインジェストでは、HyperDX を開き、**Team Settings → API Keys** に移動して、**インジェスト API key** をコピーします。

  ### 拡張機能を設定する \{#configure-extension\}

  Chrome のツールバーで **HyperDX Browser Extension** アイコンをクリックし、設定を入力します。

  | フィールド                            | ローカル ClickStack の例                    | 注記                                                            |
  | -------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
  | **Enable HyperDX Monitoring**    | On                                    | インジェクション全体を制御するマスタートグル                                        |
  | **Service Name**                 | `my-frontend-app`                     | 必須 — ClickStack 内でサービスを識別します                                  |
  | **API Key**                      | *(空欄)*                                | Cloud へのインジェストでは必須。セルフホスト構成によっては任意                            |
  | **Collector URL**                | `http://localhost:4318`               | OTLP HTTP endpoint。Cloud のデフォルトは `https://in-otel.hyperdx.io` |
  | **Environment**                  | `development`                         | 任意 — `deployment.environment` リソース attribute を設定します           |
  | **Trace Propagation Targets**    | `/api\.myapp\.domain/i, /localhost/i` | 任意 — トレース header 伝播用の JavaScript 正規表現パターン (カンマ区切り)            |
  | **Only inject on matching URLs** | Off                                   | 計装するサイトを制限する場合に有効化します                                         |
  | **Capture console logs**         | Off                                   | ブラウザーの console logs を転送する場合に有効化します                            |
  | **Advanced network capture**     | Off                                   | 詳細なネットワークリクエストの取得を有効化します                                      |

  **Save Configuration** をクリックし、計装したいタブを再読み込みします。

  <Image img={extension_config} alt="ローカル ClickStack 設定を含む HyperDX Chrome 拡張機能の設定ポップアップ" size="sm" />

  上のスクリーンショットは、一般的なローカル設定を示しています。監視が有効で、サービス名が設定され、collector は `http://localhost:4318` を指し、トレース伝播は API と localhost の URL のみに制限されています。

  ### サイトを閲覧してセッションを生成する \{#browse-site\}

  Chrome で任意の Web サイトまたはローカルアプリケーションを開きます。たとえば、フロントエンド開発サーバーなら [http://localhost:3000](http://localhost:3000) です。

  通常どおりページを操作してください。リンクをクリックし、フォームを送信し、error をトリガーし、ビュー間を移動します。設定が有効であれば、拡張機能はページの読み込みごとに Browser SDK を自動的に挿入します。

  ### セッションリプレイを表示する \{#view-session-replay\}

  [http://localhost:8080](http://localhost:8080) の HyperDX に戻り、左サイドバーから **Client Sessions** に移動します。

  セッションが duration とイベント数とともに表示されるはずです。▶️ ボタンをクリックしてリプレイします。

  **Highlighted** モードと **All Events** モードを切り替えて、タイムライン上の詳細レベルを調整します。
</VerticalStepper>

## URL フィルタリング \{#url-filtering\}

デフォルトでは、監視が有効な間、拡張機能はアクセスしたすべてのページに SDK を挿入します。挿入対象を特定のサイトのみに制限するには、**一致する URL にのみ挿入** をオンにし、パターンを 1 行に 1 つずつ追加します (またはカンマ区切りで追加します) 。

| パターン                       | 一致対象                           |
| -------------------------- | ------------------------------ |
| `http://homedepot.com/*`   | `homedepot.com` で HTTP のみ      |
| `*://homedepot.com/*`      | `homedepot.com` で HTTP と HTTPS |
| `*://*.homedepot.com/*`    | `www.homedepot.com` などのサブドメイン  |
| `https://localhost:3000/*` | ポート 3000 のローカル開発サーバー           |

URL パターンを保存したら、タブを再読み込みしてください。

## インジェクションを確認する \{#verify-injection\}

監視対象のページで DevTools を開き (**Console** タブ) 、ページを再読み込みして、次の点を確認します。

```text
[HyperDX Extension] Configuration valid, injecting HyperDX
[HyperDX Extension] Injected via extension scripts
[HyperDX Extension] HyperDX initialized
```

拡張機能オリジンのスクリプトがCSPによってブロックされた場合、拡張機能はフォールバックメッセージをログに出力し、インライン挿入で再試行します。

## トラブルシューティング \{#troubleshooting\}

<details>
  <summary>HyperDX にセッションが表示されない</summary>

  1. ブラウザーのコンソールで `[HyperDX Extension]` のログメッセージやエラーを確認します
  2. **Enable HyperDX Monitoring** がオンになっており、**Service Name** が設定されていることを確認します
  3. ClickStack が実行中で、collector の URL が正しいことを確認します (例: `http://localhost:4318`)
  4. Client Sessions ビューで時間範囲を調整します (**過去 15 分間** を試してください)
  5. ブラウザーをハードリフレッシュします: `Cmd+Shift+R` (Mac) または `Ctrl+Shift+R` (Windows/Linux)
</details>

<details>
  <summary>`chrome-extension://invalid/` エラー </summary>

  `chrome://extensions` で拡張機能を再読み込みしてから、タブをハードリフレッシュしてください。これは、タブを開いたまま拡張機能が更新または再読み込みされた場合に発生します。
</details>

<details>
  <summary>サイトでインジェクションされない</summary>

  1. 監視が有効になっており、サービス名が設定されていることを確認します
  2. **Only inject on matching URLs** がオンの場合は、現在のページ URL がパターンのいずれかに一致していることを確認します
  3. 一部のサイトでは、CSP によって拡張機能オリジンからのインジェクションとインラインスクリプトのインジェクションの両方がブロックされるため、そのページではインジェクションできない場合があります
  4.
</details>

<details>
  <summary>コンソールに `HyperDX: Missing apiKey` と表示される </summary>

  API key フィールドが空の場合は想定どおりの動作です。クラウド endpoint を使用している場合は HyperDX でインジェスト API key を追加し、セルフホストの collector が認証なしのローカルトラフィックを受け入れる場合は無視してください。
</details>

## プライバシー \{#privacy\}

この拡張機能は、アクセスしたページにオブザーバビリティのコードを挿入します。デバッグが許可されているサイトでのみ使用してください。API キーを共有したり、バージョン管理システムにコミットしたりしないでください。

## 詳しくはこちら \{#learn-more\}

* [Session Replay](/use-cases/observability/clickstack/session-replay) — 機能の概要、SDK オプション、プライバシー制御
* [Browser SDK Reference](/use-cases/observability/clickstack/sdks/browser) — SDK の全オプションと高度な設定
* [Session Replay Demo](session-replay.md) — ソースコードからデモアプリケーションを計装する
* [ClickStack はじめに](/use-cases/observability/clickstack/getting-started) — ClickStack をデプロイし、最初のデータを取り込む
* [GitHub の HyperDX Chrome 拡張機能](https://github.com/kyreddie/hyperdx-chrome-extension) — ソースコードと Issue Tracker