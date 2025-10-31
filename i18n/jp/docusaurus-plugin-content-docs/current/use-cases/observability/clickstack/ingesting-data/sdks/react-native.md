---
'slug': '/use-cases/observability/clickstack/sdks/react-native'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 7
'description': 'React Native SDK for ClickStack - ClickHouse オブザーバビリティスタック'
'title': 'React Native'
'doc_type': 'guide'
---

The ClickStack React Native SDKを使用すると、React Nativeアプリケーションを計測してイベントをClickStackに送信することができます。これにより、モバイルネットワークリクエストや例外をバックエンドイベントと一緒に1つのタイムラインで表示することが可能になります。

このガイドは以下を統合しています：

- **XHR/Fetchリクエスト**

## 始め方 {#getting-started}

### NPMを使用してインストール {#install-via-npm}

次のコマンドを使用して[ClickStack React Nativeパッケージ](https://www.npmjs.com/package/@hyperdx/otel-react-native)をインストールします。

```shell
npm install @hyperdx/otel-react-native
```

### ClickStackを初期化 {#initialize-clickstack}

ライブラリはアプリライフサイクルの早い段階で初期化してください：

```javascript
import { HyperDXRum } from '@hyperdx/otel-react-native';

HyperDXRum.init({
  service: 'my-rn-app',
  apiKey: '<YOUR_INGESTION_API_KEY>',
  tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
});
```

### ユーザー情報またはメタデータを添付する（オプション） {#attach-user-information-metadata}

ユーザー情報を添付することで、HyperDX内のセッションやイベントを検索/フィルタリングすることができるようになります。これはクライアントセッション中の任意のポイントで呼び出すことができます。現在のクライアントセッションおよびその後に送信されるすべてのイベントは、ユーザー情報に関連付けられます。

`userEmail`、`userName`、および`teamName`は、セッションUIに対応する値で埋められますが、指定しなくても構いません。他の追加の値も指定でき、それらを使用してイベントを検索することができます。

```javascript
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```

### 低バージョンを計測する {#instrument-lower-versions}

React Nativeのバージョンが0.68未満のアプリケーションを計測するには、`metro.config.js`ファイルを編集して、メトロがブラウザ特有のパッケージを使用するように強制します。例えば：

```javascript
const defaultResolver = require('metro-resolver');

module.exports = {
  resolver: {
    resolveRequest: (context, realModuleName, platform, moduleName) => {
      const resolved = defaultResolver.resolve(
        {
          ...context,
          resolveRequest: null,
        },
        moduleName,
        platform,
      );

      if (
        resolved.type === 'sourceFile' &&
        resolved.filePath.includes('@opentelemetry')
      ) {
        resolved.filePath = resolved.filePath.replace(
          'platform\\node',
          'platform\\browser',
        );
        return resolved;
      }

      return resolved;
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
```

## ビューのナビゲーション {#view-navigation}

[react-navigation](https://github.com/react-navigation/react-navigation)バージョン5と6がサポートされています。

以下の例では、ナビゲーションを計測する方法を示しています：

```javascript
import { startNavigationTracking } from '@hyperdx/otel-react-native';

export default function App() {
  const navigationRef = useNavigationContainerRef();
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        startNavigationTracking(navigationRef);
      }}
    >
      <Stack.Navigator>...</Stack.Navigator>
    </NavigationContainer>
  );
}
```
