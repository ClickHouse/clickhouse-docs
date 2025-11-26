---
slug: /use-cases/observability/clickstack/sdks/browser
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'ClickStack 用ブラウザ SDK - ClickHouse オブザーバビリティ スタック'
title: 'ブラウザ JS'
doc_type: 'guide'
keywords: ['ClickStack', 'browser-sdk', 'javascript', 'session-replay', 'frontend']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack ブラウザー SDK を使用すると、フロントエンドアプリケーションに計測コードを組み込み、
イベントを ClickStack に送信できます。これにより、ネットワーク
リクエストや例外をバックエンドのイベントと並べて、単一のタイムライン上で確認できます。

さらに、セッションリプレイデータを自動的に収集して相関付けるため、
ユーザーがアプリケーションを使用していた際に画面上で何を見ていたかを視覚的に追跡し、
デバッグできます。

このガイドでは、次の内容を統合します:

* **コンソールログ**
* **セッションリプレイ**
* **XHR/Fetch/WebSocket リクエスト**
* **例外**


## はじめに {#getting-started}

<br/>

<Tabs groupId="install">
<TabItem value="package_import" label="Package Import" default>

**パッケージインポートでインストールする（推奨）**

以下のコマンドを使用して [browser パッケージ](https://www.npmjs.com/package/@hyperdx/browser) をインストールします。

```shell
npm install @hyperdx/browser
```

**ClickStack の初期化**

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // フロントエンドからバックエンドへのリクエストにトレースを関連付けるための設定
    consoleCapture: true, // console ログを取得する（デフォルトは false）
    advancedNetworkCapture: true, // HTTP リクエスト／レスポンスのヘッダーおよびボディ全体を取得する（デフォルトは false）
});
```

</TabItem>
<TabItem value="script_tag" label="Script Tag">

**Script タグでインストールする（代替手段）**

NPM でインストールする代わりに、Script タグを使用してスクリプトを読み込んでインストールすることもできます。これにより、`HyperDX` グローバル変数が利用可能になり、NPM パッケージと同様に使用できます。

サイトが現在バンドラーを使用して構築されていない場合に推奨されます。

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // フロントエンドからバックエンドへのリクエストにトレースを関連付けるための設定
  });
</script>
```

</TabItem>
</Tabs>

### オプション {#options}

- `apiKey` - ClickStack のインジェスト API key。
- `service` - HyperDX UI 上でイベントが表示されるサービス名。
- `tracePropagationTargets` - フロントエンドとバックエンドのトレースを関連付けるために HTTP リクエストと照合する正規表現パターンのリスト。いずれかのパターンに一致するすべてのリクエストに追加の `traceparent` ヘッダーを付与します。バックエンド API のドメイン（例: `api.yoursite.com`）を設定してください。
- `consoleCapture` - （オプション）すべての console ログを取得するかどうか（デフォルトは `false`）。
- `advancedNetworkCapture` - （オプション）リクエスト／レスポンスのヘッダーおよびボディ全体を取得するかどうか（デフォルトは `false`）。
- `url` - （オプション）OpenTelemetry コレクターの URL。セルフホスト環境でのみ必要です。
- `maskAllInputs` - （オプション）セッションリプレイで、すべての入力フィールドをマスクするかどうか（デフォルトは `false`）。
- `maskAllText` - （オプション）セッションリプレイで、すべてのテキストをマスクするかどうか（デフォルトは `false`）。
- `disableIntercom` - （オプション）Intercom 連携を無効化するかどうか（デフォルトは `false`）
- `disableReplay` - （オプション）セッションリプレイを無効化するかどうか（デフォルトは `false`）



## 追加の設定

### ユーザー情報またはメタデータの紐付け

ユーザー情報を紐付けると、HyperDX UI 内でセッションやイベントを検索・フィルタリングできるようになります。これはクライアントセッション中の任意のタイミングで呼び出すことができます。現在のクライアントセッションおよび、その呼び出し以降に送信されるすべてのイベントは、紐付けたユーザー情報と関連付けられます。

`userEmail`、`userName`、`teamName` は、対応する値をセッション UI に表示しますが、省略することもできます。その他の追加フィールドも指定でき、イベント検索に利用できます。

```javascript
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // その他のカスタムプロパティ...
});
```

### React エラーバウンダリ内のエラーを自動的にキャプチャする

React を使用している場合、エラーバウンダリ内で発生したエラーを自動的にキャプチャするには、
エラーバウンダリコンポーネントを `attachToReactErrorBoundary` 関数に渡します。

```javascript
// ErrorBoundaryをインポートします(例としてreact-error-boundaryを使用)
import { ErrorBoundary } from 'react-error-boundary';

// ErrorBoundaryコンポーネントにフックし、そのインスタンス内で
// 発生するエラーをキャプチャします。
HyperDX.attachToReactErrorBoundary(ErrorBoundary);
```

### カスタムアクションを送信する

特定のアプリケーションイベント（例：サインアップ、送信など）を明示的に追跡するには、イベント名と任意のイベントメタデータを指定して `addAction` 関数を呼び出します。

例：

```javascript
HyperDX.addAction('Form-Completed', {
  formId: 'signup-form',
  formName: 'Signup Form',
  formType: 'signup',
});
```

### ネットワークキャプチャを動的に有効化する

ネットワークキャプチャを動的に有効または無効にするには、必要に応じて `enableAdvancedNetworkCapture` または `disableAdvancedNetworkCapture` 関数を呼び出してください。

```javascript
HyperDX.enableAdvancedNetworkCapture();
```

### CORS リクエスト向けのリソースタイミングを有効化する

フロントエンドアプリケーションが別ドメインに対して API リクエストを送信する場合、
任意でリクエストに `Timing-Allow-Origin`[ヘッダー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin) を付与して有効化できます。これにより、ClickStack は DNS ルックアップやレスポンスのダウンロードなど、そのリクエストに関するきめ細かな
リソースタイミング情報を、[`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming) を通じて取得できるようになります。

`express` と `cors` パッケージを使用している場合は、次のスニペットでヘッダーを有効化できます。

```javascript
var cors = require('cors');
var onHeaders = require('on-headers');

// ... all your stuff

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
