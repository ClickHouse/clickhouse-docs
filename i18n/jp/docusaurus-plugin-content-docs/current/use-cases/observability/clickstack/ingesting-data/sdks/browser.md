---
slug: /use-cases/observability/clickstack/sdks/browser
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'ClickStack 向けブラウザ SDK - ClickHouse Observability スタック'
title: 'ブラウザ JS'
doc_type: 'guide'
keywords: ['ClickStack', 'browser-sdk', 'javascript', 'session-replay', 'frontend']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack ブラウザー SDK を使用すると、フロントエンドアプリケーションにインストルメンテーションを行い、
イベントを ClickStack に送信できるようになります。これにより、ネットワーク
リクエストや例外をバックエンドイベントと合わせて、1 つのタイムラインで確認できます。

さらに、セッションリプレイデータを自動的に取得して関連付けるため、
ユーザーがアプリケーション利用時に「何を見ていたか」を視覚的に追いながらデバッグできます。

このガイドでは次の内容を扱います:

* **コンソールログ**
* **セッションリプレイ**
* **XHR/Fetch/WebSocket リクエスト**
* **例外**


## はじめに {#getting-started}

<br />

<Tabs groupId="install">
<TabItem value="package_import" label="Package Import" default>

**パッケージインポートによるインストール（推奨）**

以下のコマンドで[browserパッケージ](https://www.npmjs.com/package/@hyperdx/browser)をインストールします。

```shell
npm install @hyperdx/browser
```

**ClickStackの初期化**

```javascript
import HyperDX from "@hyperdx/browser"

HyperDX.init({
  url: "http://localhost:4318",
  apiKey: "YOUR_INGESTION_API_KEY",
  service: "my-frontend-app",
  tracePropagationTargets: [/api.myapp.domain/i], // フロントエンドとバックエンド間のトレースをリンクするために設定
  consoleCapture: true, // コンソールログをキャプチャ（デフォルトはfalse）
  advancedNetworkCapture: true // HTTPリクエスト/レスポンスの完全なヘッダーとボディをキャプチャ（デフォルトはfalse）
})
```

</TabItem>
<TabItem value="script_tag" label="Script Tag">

**スクリプトタグによるインストール（代替方法）**

NPMによるインストールの代わりに、スクリプトタグを使用してスクリプトを読み込むこともできます。これにより`HyperDX`グローバル変数が公開され、NPMパッケージと同様に使用できます。

バンドラーを使用していないサイトの場合は、この方法を推奨します。

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: "http://localhost:4318",
    apiKey: "YOUR_INGESTION_API_KEY",
    service: "my-frontend-app",
    tracePropagationTargets: [/api.myapp.domain/i] // フロントエンドとバックエンド間のトレースをリンクするために設定
  })
</script>
```

</TabItem>
</Tabs>

### オプション {#options}

- `apiKey` - ClickStackインジェストAPIキー。
- `service` - HyperDX UIでイベントが表示される際のサービス名。
- `tracePropagationTargets` - フロントエンドとバックエンドのトレースをリンクするために、HTTPリクエストと照合する正規表現パターンのリスト。パターンに一致するすべてのリクエストに`traceparent`ヘッダーが追加されます。バックエンドAPIのドメイン（例：`api.yoursite.com`）を設定してください。
- `consoleCapture` - （オプション）すべてのコンソールログをキャプチャするかどうか（デフォルトは`false`）。
- `advancedNetworkCapture` - （オプション）リクエスト/レスポンスの完全なヘッダーとボディをキャプチャするかどうか（デフォルトはfalse）。
- `url` - （オプション）OpenTelemetryコレクターのURL。セルフホスト環境でのみ必要です。
- `maskAllInputs` - （オプション）セッションリプレイですべての入力フィールドをマスクするかどうか（デフォルトは`false`）。
- `maskAllText` - （オプション）セッションリプレイですべてのテキストをマスクするかどうか（デフォルトは`false`）。
- `disableIntercom` - （オプション）Intercom連携を無効にするかどうか（デフォルトは`false`）
- `disableReplay` - （オプション）セッションリプレイを無効にするかどうか（デフォルトは`false`）


## 追加設定 {#additional-configuration}

### ユーザー情報またはメタデータの付加 {#attach-user-information-or-metadata}

ユーザー情報を付加することで、HyperDX UIでセッションやイベントを検索・フィルタリングできるようになります。この機能はクライアントセッション中のどの時点でも呼び出すことができます。現在のクライアントセッションと、呼び出し後に送信されるすべてのイベントは、ユーザー情報に関連付けられます。

`userEmail`、`userName`、`teamName`は、セッションUIに対応する値を表示しますが、省略することもできます。その他の追加値を指定して、イベントの検索に使用することもできます。

```javascript
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name
  // その他のカスタムプロパティ...
})
```

### Reactエラーバウンダリエラーの自動キャプチャ {#auto-capture-react-error-boundary-errors}

Reactを使用している場合、エラーバウンダリコンポーネントを`attachToReactErrorBoundary`関数に渡すことで、Reactエラーバウンダリ内で発生するエラーを自動的にキャプチャできます。

```javascript
// ErrorBoundaryをインポート（例としてreact-error-boundaryを使用）
import { ErrorBoundary } from "react-error-boundary"

// これによりErrorBoundaryコンポーネントにフックし、そのすべてのインスタンス内で
// 発生するエラーをキャプチャします。
HyperDX.attachToReactErrorBoundary(ErrorBoundary)
```

### カスタムアクションの送信 {#send-custom-actions}

特定のアプリケーションイベント（例：サインアップ、送信など）を明示的に追跡するには、イベント名とオプションのイベントメタデータを指定して`addAction`関数を呼び出します。

例：

```javascript
HyperDX.addAction("Form-Completed", {
  formId: "signup-form",
  formName: "Signup Form",
  formType: "signup"
})
```

### ネットワークキャプチャの動的な有効化 {#enable-network-capture-dynamically}

ネットワークキャプチャを動的に有効化または無効化するには、必要に応じて`enableAdvancedNetworkCapture`または`disableAdvancedNetworkCapture`関数を呼び出します。

```javascript
HyperDX.enableAdvancedNetworkCapture()
```

### CORSリクエストのリソースタイミングの有効化 {#enable-resource-timing-for-cors-requests}

フロントエンドアプリケーションが異なるドメインへAPIリクエストを行う場合、オプションで`Timing-Allow-Origin`[ヘッダー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin)をリクエストと共に送信するように設定できます。これにより、ClickStackは[`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)を介して、DNSルックアップ、レスポンスダウンロードなど、リクエストの詳細なリソースタイミング情報をキャプチャできるようになります。

`express`と`cors`パッケージを使用している場合、以下のスニペットを使用してヘッダーを有効化できます：

```javascript
var cors = require("cors")
var onHeaders = require("on-headers")

// ... その他のコード

app.use(function (req, res, next) {
  onHeaders(res, function () {
    var allowOrigin = res.getHeader("Access-Control-Allow-Origin")
    if (allowOrigin) {
      res.setHeader("Timing-Allow-Origin", allowOrigin)
    }
  })
  next()
})
app.use(cors())
```
