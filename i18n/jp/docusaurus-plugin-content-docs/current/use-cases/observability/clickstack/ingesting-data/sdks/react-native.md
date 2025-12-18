---
slug: /use-cases/observability/clickstack/sdks/react-native
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack 用 React Native SDK - ClickHouse Observability スタック'
title: 'React Native'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'ログ記録', '連携', 'アプリケーション監視']
---

ClickStack React Native SDK を使用すると、React Native アプリケーションを計装し、イベントを ClickStack に送信できます。これにより、モバイルアプリのネットワークリクエストや例外を、バックエンドのイベントと同じタイムライン上で並べて確認できます。

このガイドで扱う統合対象:

- **XHR/Fetch リクエスト**

## はじめに {#getting-started}

### npm でインストール {#install-via-npm}

次のコマンドを実行して、[ClickStack React Native パッケージ](https://www.npmjs.com/package/@hyperdx/otel-react-native) をインストールします。

```shell
npm install @hyperdx/otel-react-native
```

### ClickStack の初期化 {#initialize-clickstack}

アプリケーションのライフサイクルの、できるだけ早い段階でライブラリを初期化してください。

```javascript
import { HyperDXRum } from '@hyperdx/otel-react-native';

HyperDXRum.init({
  service: 'my-rn-app',
  apiKey: '<YOUR_INGESTION_API_KEY>',
  tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
});
```

### ユーザー情報またはメタデータを付与する（任意） {#attach-user-information-metadata}

ユーザー情報を付与すると、HyperDX 内でセッションやイベントを検索・フィルタリングできるようになります。これはクライアントセッション中の任意のタイミングで呼び出すことができます。現在のクライアントセッションおよびその呼び出し以降に送信されるすべてのイベントは、そのユーザー情報と関連付けられます。

`userEmail`、`userName`、`teamName` は、対応する値をセッション UI に表示するために使用されますが、省略することもできます。その他の任意の追加値も指定でき、イベントの検索に利用できます。

```javascript
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```

### 旧バージョンを計装する {#instrument-lower-versions}

バージョン 0.68 未満の React Native で動作しているアプリケーションを計装するには、
`metro.config.js` ファイルを編集して、metro にブラウザ向けパッケージを強制的に
使用させます。例:

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

[react-navigation](https://github.com/react-navigation/react-navigation) のバージョン 5 および 6 がサポートされています。

次の例では、ナビゲーションを計装する方法を示します。

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
