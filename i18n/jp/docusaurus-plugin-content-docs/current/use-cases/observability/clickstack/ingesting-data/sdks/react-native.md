---
slug: /use-cases/observability/clickstack/sdks/react-native
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack 用 React Native SDK - ClickHouse Observability Stack'
title: 'React Native'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

ClickStack React Native SDK を使用すると、React Native アプリケーションに
計測処理を組み込み、イベントを ClickStack に送信できます。これにより、モバイルのネットワークリクエストや
例外を、バックエンドのイベントと合わせて 1 つのタイムライン上で確認できます。

このガイドで統合する内容:

- **XHR/Fetch リクエスト**



## はじめに {#getting-started}

### NPMによるインストール {#install-via-npm}

以下のコマンドを使用して[ClickStack React Nativeパッケージ](https://www.npmjs.com/package/@hyperdx/otel-react-native)をインストールします。

```shell
npm install @hyperdx/otel-react-native
```

### ClickStackの初期化 {#initialize-clickstack}

アプリケーションのライフサイクルのできるだけ早い段階でライブラリを初期化します:

```javascript
import { HyperDXRum } from "@hyperdx/otel-react-native"

HyperDXRum.init({
  service: "my-rn-app",
  apiKey: "<YOUR_INGESTION_API_KEY>",
  tracePropagationTargets: [/api.myapp.domain/i] // フロントエンドからバックエンドへのリクエストのトレースをリンクするために設定
})
```

### ユーザー情報またはメタデータの付加（オプション） {#attach-user-information-metadata}

ユーザー情報を付加することで、HyperDX内でセッションやイベントを検索・フィルタリングできるようになります。この処理はクライアントセッション中のどの時点でも呼び出すことができます。現在のクライアントセッションと、この呼び出し後に送信されるすべてのイベントは、ユーザー情報と関連付けられます。

`userEmail`、`userName`、`teamName`は、セッションUIに対応する値を表示しますが、省略することもできます。その他の追加の値を指定して、イベントの検索に使用することもできます。

```javascript
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name
  // その他のカスタムプロパティ...
})
```

### 旧バージョンの計装 {#instrument-lower-versions}

React Native 0.68未満のバージョンで動作するアプリケーションを計装するには、`metro.config.js`ファイルを編集して、metroにブラウザ固有のパッケージを使用させます。例:

```javascript
const defaultResolver = require("metro-resolver")

module.exports = {
  resolver: {
    resolveRequest: (context, realModuleName, platform, moduleName) => {
      const resolved = defaultResolver.resolve(
        {
          ...context,
          resolveRequest: null
        },
        moduleName,
        platform
      )

      if (
        resolved.type === "sourceFile" &&
        resolved.filePath.includes("@opentelemetry")
      ) {
        resolved.filePath = resolved.filePath.replace(
          "platform\\node",
          "platform\\browser"
        )
        return resolved
      }

      return resolved
    }
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true
      }
    })
  }
}
```


## ビューナビゲーション {#view-navigation}

[react-navigation](https://github.com/react-navigation/react-navigation) バージョン5および6がサポートされています。

以下の例では、ナビゲーションを計装する方法を示します：

```javascript
import { startNavigationTracking } from "@hyperdx/otel-react-native"

export default function App() {
  const navigationRef = useNavigationContainerRef()
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        startNavigationTracking(navigationRef)
      }}
    >
      <Stack.Navigator>...</Stack.Navigator>
    </NavigationContainer>
  )
}
```
