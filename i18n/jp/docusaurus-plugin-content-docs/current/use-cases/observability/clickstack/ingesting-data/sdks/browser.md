---
'slug': '/use-cases/observability/clickstack/sdks/browser'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 0
'description': 'ブラウザ SDK for ClickStack - The ClickHouse 可観測性スタック'
'title': 'ブラウザ JS'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The ClickStackブラウザSDKは、フロントエンドアプリケーションを計測して、ClickStackにイベントを送信することを可能にします。これにより、ネットワークリクエストや例外をバックエンドイベントと同じタイムラインで表示できます。

さらに、セッションリプレイデータを自動的にキャプチャし、相関付けるため、ユーザーがアプリケーションを使用している際に見ていた内容を視覚的にステップスルーしてデバッグできます。

このガイドには以下の内容が含まれています：

- **コンソールログ**
- **セッションリプレイ**
- **XHR/Fetch/Websocketリクエスト**
- **例外**

## はじめに {#getting-started}

<br/>

<Tabs groupId="install">
<TabItem value="package_import" label="パッケージインポート" default>

**パッケージインポートでインストール（推奨）**

以下のコマンドを使用して、[ブラウザパッケージ](https://www.npmjs.com/package/@hyperdx/browser)をインストールします。

```shell
npm install @hyperdx/browser
```

**ClickStackを初期化する**

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
    consoleCapture: true, // Capture console logs (default false)
    advancedNetworkCapture: true, // Capture full HTTP request/response headers and bodies (default false)
});
```

</TabItem>
<TabItem value="script_tag" label="スクリプトタグ">

**スクリプトタグでインストール（代替）**

NPMを使用してインストールする代わりに、スクリプトタグを使ってスクリプトを含めてインストールすることもできます。これにより、`HyperDX`グローバル変数が公開され、NPMパッケージと同様に使用できます。

バンドラーを使用して現在サイトが構築されていない場合は、こちらが推奨されます。

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
  });
</script>
```

</TabItem>
</Tabs>

### オプション {#options}

- `apiKey` - あなたのClickStackインジェクションAPIキー。
- `service` - HyperDX UIに表示されるイベントのサービス名。
- `tracePropagationTargets` - フロントエンドとバックエンドのトレースをリンクするためのHTTPリクエストに対して照合する正規表現パターンのリスト。対応するパターンに一致するすべてのリクエストに追加の`traceparent`ヘッダーが追加されます。これはバックエンドAPIドメイン（例：`api.yoursite.com`）に設定する必要があります。
- `consoleCapture` - （オプション）すべてのコンソールログをキャプチャする（デフォルトは`false`）。
- `advancedNetworkCapture` - （オプション）フルリクエスト/レスポンスのヘッダーおよびボディをキャプチャする（デフォルトは`false`）。
- `url` - （オプション）OpenTelemetryコレクタのURL、セルフホストインスタンスの場合のみ必要です。
- `maskAllInputs` - （オプション）セッションリプレイで全ての入力フィールドをマスクするかどうか（デフォルトは`false`）。
- `maskAllText` - （オプション）セッションリプレイで全てのテキストをマスクするかどうか（デフォルトは`false`）。
- `disableIntercom` - （オプション）Intercom統合を無効にするかどうか（デフォルトは`false`）。
- `disableReplay` - （オプション）セッションリプレイを無効にするかどうか（デフォルトは`false`）。

## 追加の設定 {#additional-configuration}

### ユーザー情報またはメタデータを添付する {#attach-user-information-or-metadata}

ユーザー情報を添付することで、HyperDX UIでセッションやイベントを検索/フィルタリングできます。これはクライアントセッションの任意の時点で呼び出すことができます。現在のクライアントセッションと呼び出し後に送信されたすべてのイベントは、ユーザー情報に関連付けられます。

`userEmail`、`userName`、および`teamName`は、対応する値でセッションUIをポピュレートしますが、省略することも可能です。他の追加の値も指定可能で、イベントを検索するために使用できます。

```javascript
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```

### Reactエラー境界エラーの自動キャプチャ {#auto-capture-react-error-boundary-errors}

Reactを使用している場合、`attachToReactErrorBoundary`関数にエラー境界コンポーネントを渡すことで、Reactエラー境界内で発生するエラーを自動的にキャプチャできます。

```javascript
// Import your ErrorBoundary (we're using react-error-boundary as an example)
import { ErrorBoundary } from 'react-error-boundary';

// This will hook into the ErrorBoundary component and capture any errors that occur
// within any instance of it.
HyperDX.attachToReactErrorBoundary(ErrorBoundary);
```

### カスタムアクションを送信する {#send-custom-actions}

特定のアプリケーションイベント（例：サインアップ、送信など）を明示的に追跡するために、`addAction`関数をイベント名とオプションのイベントメタデータで呼び出すことができます。

例：

```javascript
HyperDX.addAction('Form-Completed', {
  formId: 'signup-form',
  formName: 'Signup Form',
  formType: 'signup',
});
```

### ネットワークキャプチャを動的に有効にする {#enable-network-capture-dynamically}

ネットワークキャプチャを動的に有効または無効にするには、必要に応じて`enableAdvancedNetworkCapture`または`disableAdvancedNetworkCapture`関数を呼び出すだけです。

```javascript
HyperDX.enableAdvancedNetworkCapture();
```

### CORSリクエストのためのリソースタイミングを有効にする {#enable-resource-timing-for-cors-requests}

フロントエンドアプリケーションが異なるドメインにAPIリクエストを送信する場合、オプションでリクエストに`Timing-Allow-Origin`[ヘッダー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin)を送信するように設定できます。これにより、ClickStackはリクエストの細かいリソースタイミング情報（例えば、DNSルックアップ、レスポンスダウンロードなど）を[`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)を通じてキャプチャできます。

`express`と`cors`パッケージを使用している場合、以下のスニペットを使用してヘッダーを有効にできます：

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
