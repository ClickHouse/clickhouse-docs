---
slug: /use-cases/observability/clickstack/sdks/react-native
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: '用于 ClickStack 的 React Native SDK - ClickHouse 可观测性栈'
title: 'React Native'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', '日志记录', '集成', '应用监控']
---

ClickStack React Native SDK 允许你在 React Native 应用中进行埋点，将事件发送到
ClickStack。这样，你就可以在同一时间轴上，将移动端的网络请求和异常与后端事件一起查看。

本指南集成：

- **XHR/Fetch 请求**

## 快速入门 {#getting-started}

### 通过 NPM 安装 {#install-via-npm}

使用以下命令安装 [ClickStack React Native 包](https://www.npmjs.com/package/@hyperdx/otel-react-native)。

```shell
npm install @hyperdx/otel-react-native
```

### 初始化 ClickStack {#initialize-clickstack}

尽可能在应用程序生命周期的最早阶段初始化该库：

```javascript
import { HyperDXRum } from '@hyperdx/otel-react-native';

HyperDXRum.init({
  service: 'my-rn-app',
  apiKey: '<YOUR_INGESTION_API_KEY>',
  tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
});
```

### 附加用户信息或元数据（可选） {#attach-user-information-metadata}

附加用户信息可以让你在 HyperDX 中搜索和筛选会话及事件。此方法可以在客户端会话的任意时间调用。当前客户端会话以及调用之后发送的所有事件都会与该用户信息关联。

`userEmail`、`userName` 和 `teamName` 会在会话 UI 中显示相应的值，但它们是可选的。你还可以指定任意其他字段，并用于搜索事件。

```javascript
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```

### 为低版本进行埋点 {#instrument-lower-versions}

要为运行在 React Native 0.68 以下版本上的应用进行埋点，
请编辑你的 `metro.config.js` 文件，将 metro 强制配置为使用浏览器专用的包。例如：

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

## 视图导航 {#view-navigation}

支持 [react-navigation](https://github.com/react-navigation/react-navigation) 版本 5 和 6。

以下示例演示如何对导航进行埋点：

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
