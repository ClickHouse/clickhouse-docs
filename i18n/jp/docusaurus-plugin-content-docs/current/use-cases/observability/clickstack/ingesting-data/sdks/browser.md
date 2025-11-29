---
slug: /use-cases/observability/clickstack/sdks/browser
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'ClickStack 向けブラウザ SDK - ClickHouse Observability Stack'
title: 'ブラウザ JS'
doc_type: 'guide'
keywords: ['ClickStack', 'browser-sdk', 'javascript', 'session-replay', 'frontend']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack ブラウザ SDK を使用すると、フロントエンドアプリケーションをインストルメントし、
イベントを ClickStack に送信できます。これにより、単一のタイムライン上で、
バックエンドイベントと並べてネットワークリクエストや例外を確認できます。

さらに、セッションリプレイデータを自動的に取得して相関付けることで、
ユーザーがアプリケーション利用中に画面上で何を見ていたのかを
視覚的に追いながらデバッグできます。

このガイドでは、次の内容を統合します:

* **コンソールログ**
* **セッションリプレイ**
* **XHR/Fetch/Websocket リクエスト**
* **例外**


## はじめに {#getting-started}

<br/>

<Tabs groupId="install">
<TabItem value="package_import" label="パッケージインポート" default>

**パッケージインポートによるインストール（推奨）**

次のコマンドを使用して、[ブラウザ用パッケージ](https://www.npmjs.com/package/@hyperdx/browser) をインストールします。

```shell
npm install @hyperdx/browser
```

**ClickStack を初期化する**

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // フロントエンドからバックエンドへのリクエストにトレースを関連付けるために設定します
    consoleCapture: true, // console.log などのコンソールログを収集します（デフォルトは false）
    advancedNetworkCapture: true, // HTTP リクエスト/レスポンスのヘッダーとボディをすべて収集します（デフォルトは false）
});
```

</TabItem>
<TabItem value="script_tag" label="スクリプトタグ">

**スクリプトタグによるインストール（代替手段）**

npm でインストールする代わりに、スクリプトタグ経由でスクリプトを読み込んでインストールすることもできます。
これによりグローバル変数 `HyperDX` が定義され、npm パッケージと同様の方法で利用できます。

サイトが現在バンドラーを使用してビルドされていない場合に推奨されます。

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // フロントエンドからバックエンドへのリクエストにトレースを関連付けるために設定します
  });
</script>
```

</TabItem>
</Tabs>

### オプション {#options}

- `apiKey` - あなたの ClickStack インジェスト API key。
- `service` - イベントが HyperDX UI 上で表示される際のサービス名。
- `tracePropagationTargets` - HTTP リクエストに対して照合する正規表現パターンのリストです。フロントエンドとバックエンドのトレースを関連付けるために使用され、パターンのいずれかに一致したすべてのリクエストに追加の `traceparent` ヘッダーが付与されます。これはバックエンドの API ドメイン（例: `api.yoursite.com`）に設定してください。
- `consoleCapture` - （オプション）すべてのコンソールログを取得します（デフォルトは `false`）。
- `advancedNetworkCapture` - （オプション）リクエスト/レスポンスのヘッダーおよびボディを完全に取得します（デフォルトは `false`）。
- `url` - （オプション）self-hosted 環境でのみ必要となる OpenTelemetry collector の URL。
- `maskAllInputs` - （オプション）セッションリプレイで、すべての入力フィールドをマスクするかどうか（デフォルトは `false`）。
- `maskAllText` - （オプション）セッションリプレイで、すべてのテキストをマスクするかどうか（デフォルトは `false`）。
- `disableIntercom` - （オプション）Intercom 連携を無効にするかどうか（デフォルトは `false`）
- `disableReplay` - （オプション）セッションリプレイを無効にするかどうか（デフォルトは `false`）

## 追加の設定 {#additional-configuration}

### ユーザー情報またはメタデータを付与する {#attach-user-information-or-metadata}

ユーザー情報を付与すると、HyperDX UI 内でセッションやイベントを検索・フィルタリングできるようになります。これはクライアントセッション中の任意のタイミングで呼び出せます。現在のクライアントセッションと、その呼び出し以降に送信されるすべてのイベントは、指定したユーザー情報と関連付けられます。

`userEmail`、`userName`、`teamName` は、対応する値でセッション UI に表示されますが、省略することもできます。それ以外にも任意の追加値を指定し、イベントの検索に利用することが可能です。

```javascript
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // その他のカスタムプロパティ...
});
```


### React のエラーバウンダリで発生したエラーを自動捕捉する {#auto-capture-react-error-boundary-errors}

React を使用している場合は、エラーバウンダリコンポーネントを `attachToReactErrorBoundary` 関数に渡すことで、そのエラーバウンダリ内で発生したエラーを自動的に捕捉できます。

```javascript
// ErrorBoundaryをインポートします（例としてreact-error-boundaryを使用）
import { ErrorBoundary } from 'react-error-boundary';

// ErrorBoundaryコンポーネントにフックし、そのすべてのインスタンス内で
// 発生するエラーをキャプチャします。
HyperDX.attachToReactErrorBoundary(ErrorBoundary);
```


### カスタムアクションの送信 {#send-custom-actions}

特定のアプリケーションイベント（例: サインアップ、フォーム送信など）を明示的に追跡するには、イベント名と任意のイベントメタデータを引数として `addAction` 関数を呼び出します。

例:

```javascript
HyperDX.addAction('Form-Completed', {
  formId: 'signup-form',
  formName: 'Signup Form',
  formType: 'signup',
});
```


### ネットワークキャプチャを動的に有効にする {#enable-network-capture-dynamically}

ネットワークキャプチャを動的に有効または無効にするには、必要に応じて `enableAdvancedNetworkCapture` または `disableAdvancedNetworkCapture` 関数を呼び出してください。

```javascript
HyperDX.enableAdvancedNetworkCapture();
```


### CORS リクエスト向けのリソースタイミングを有効化する {#enable-resource-timing-for-cors-requests}

フロントエンドアプリケーションが別ドメインに API リクエストを送信する場合、
任意で、リクエストに `Timing-Allow-Origin` [ヘッダー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin) を付与するように設定できます。これにより、ClickStack は [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming) を通じて、そのリクエストに対する DNS ルックアップやレスポンスのダウンロードなどのきめ細かなリソースタイミング情報を取得できるようになります。

`express` と `cors` パッケージを使用している場合、次のスニペットを使用してこのヘッダーを有効にできます。

```javascript
var cors = require('cors');
var onHeaders = require('on-headers');

// ... その他すべての処理

app.use(function (req, res, next) {
  onHeaders(res, function () {
    var allowOrigin = res.getHeader('Access-Control-Allow-Origin');
    if (allowOrigin) {
      res.setHeader('Timing-Allow-Origin', allowOrigin);
    }
  });
  next();
});
app.use(cors());
```
