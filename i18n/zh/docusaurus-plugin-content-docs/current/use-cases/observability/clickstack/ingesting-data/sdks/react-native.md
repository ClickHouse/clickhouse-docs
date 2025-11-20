---
slug: /use-cases/observability/clickstack/sdks/react-native
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack 的 React Native SDK - ClickHouse 可观测性技术栈'
title: 'React Native'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

ClickStack React Native SDK 允许你在 React Native 应用中进行埋点，
将事件发送到 ClickStack。借此，你可以在同一时间轴中同时查看
移动端的网络请求和异常，以及后端事件。

本指南集成以下内容：

- **XHR/Fetch 请求**



## 快速入门 {#getting-started}

### 通过 NPM 安装 {#install-via-npm}

使用以下命令安装 [ClickStack React Native 包](https://www.npmjs.com/package/@hyperdx/otel-react-native)。

```shell
npm install @hyperdx/otel-react-native
```

### 初始化 ClickStack {#initialize-clickstack}

在应用程序生命周期中尽早初始化该库:

```javascript
import { HyperDXRum } from "@hyperdx/otel-react-native"

HyperDXRum.init({
  service: "my-rn-app",
  apiKey: "<YOUR_INGESTION_API_KEY>",
  tracePropagationTargets: [/api.myapp.domain/i] // 设置以关联前端到后端请求的追踪链路
})
```

### 附加用户信息或元数据(可选) {#attach-user-information-metadata}

附加用户信息可让您在 HyperDX 中搜索/过滤会话和事件。
此方法可在客户端会话期间的任意时刻调用。当前客户端会话以及调用后发送的所有事件都将与用户信息关联。

`userEmail`、`userName` 和 `teamName` 将在会话 UI 中填充相应的值,但可以省略。可以指定任何其他附加值并用于搜索事件。

```javascript
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name
  // 其他自定义属性...
})
```

### 对低版本进行插桩 {#instrument-lower-versions}

要对运行在低于 0.68 版本的 React Native 上的应用程序进行插桩,
请编辑您的 `metro.config.js` 文件以强制 metro 使用浏览器特定的包。例如:

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


## 视图导航 {#view-navigation}

支持 [react-navigation](https://github.com/react-navigation/react-navigation) 版本 5 和 6。

以下示例展示了如何对导航进行埋点：

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
