---
slug: /use-cases/observability/clickstack/sdks/react-native
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack 用 React Native SDK - ClickHouse Observability Stack'
title: 'React Native'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'ロギング', '連携', 'アプリケーション監視']
---

ClickStack React Native SDK を使用すると、React Native アプリケーションを
インストルメントして、イベントを ClickStack に送信できます。これにより、
モバイルのネットワークリクエストや例外を、バックエンド側のイベントと並べて 1 つのタイムライン上で確認できます。

このガイドでは、次の内容との連携について説明します:

- **XHR/Fetch Requests**



## はじめに

### NPM 経由でインストール

次のコマンドを使用して、[ClickStack React Native パッケージ](https://www.npmjs.com/package/@hyperdx/otel-react-native) をインストールします。

```shell
npm install @hyperdx/otel-react-native
```

### ClickStack を初期化する

アプリケーションのライフサイクルの可能な限り早い段階で、このライブラリを初期化してください。

```javascript
import { HyperDXRum } from '@hyperdx/otel-react-native';

HyperDXRum.init({
  service: 'my-rn-app',
  apiKey: '<YOUR_INGESTION_API_KEY>',
  tracePropagationTargets: [/api.myapp.domain/i], // フロントエンドからバックエンドへのリクエストに対してトレースをリンクするための設定
});
```

### ユーザー情報またはメタデータを付与する（オプション）

ユーザー情報を付与すると、HyperDX 内でセッションやイベントを検索・フィルタリングできるようになります。これはクライアントセッションの任意のタイミングで呼び出せます。現在のクライアントセッションおよび、その呼び出し以降に送信されるすべてのイベントは、指定したユーザー情報と関連付けられます。

`userEmail`、`userName`、`teamName` は、対応する値がセッション UI に表示されるようになりますが、省略することもできます。その他の任意の追加値も指定でき、それらを用いてイベントを検索できます。

```javascript
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // その他のカスタムプロパティ...
});
```

### 旧バージョンでのインストルメンテーション

React Native 0.68 未満のバージョンで動作しているアプリケーションをインストルメントするには、
`metro.config.js` ファイルを編集して、Metro にブラウザー向けの
パッケージを使用するよう強制します。例:

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


## 画面ナビゲーション

[react-navigation](https://github.com/react-navigation/react-navigation) のバージョン 5 および 6 に対応しています。

次の例は、ナビゲーションを計装する方法を示しています。

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
