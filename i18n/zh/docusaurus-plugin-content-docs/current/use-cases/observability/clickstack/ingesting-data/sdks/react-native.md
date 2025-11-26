---
slug: /use-cases/observability/clickstack/sdks/react-native
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack 的 React Native SDK - ClickHouse 可观测性栈'
title: 'React Native'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', '日志记录', '集成', '应用监控']
---

ClickStack 的 React Native SDK 可用于对 React Native 应用进行埋点，
并将事件发送到 ClickStack。这样就可以在同一条时间轴上，同时查看
移动端的网络请求与异常以及后端事件。

本指南集成：

- **XHR/Fetch 请求**



## 入门

### 通过 npm 安装

使用以下命令安装 [ClickStack React Native 包](https://www.npmjs.com/package/@hyperdx/otel-react-native)。

```shell
npm install @hyperdx/otel-react-native
```

### 初始化 ClickStack

请在应用程序生命周期的尽可能早期初始化该库：

```javascript
import { HyperDXRum } from '@hyperdx/otel-react-native';

HyperDXRum.init({
  service: 'my-rn-app', // 服务名称
  apiKey: '<YOUR_INGESTION_API_KEY>', // 您的摄取 API 密钥
  tracePropagationTargets: [/api.myapp.domain/i], // 设置以关联前端到后端请求的追踪
});
```

### 附加用户信息或元数据（可选）

附加用户信息可以让你在 HyperDX 中搜索和筛选会话与事件。你可以在客户端会话的任意时间调用此方法。当前客户端会话以及调用之后发送的所有事件都会与该用户信息关联。

`userEmail`、`userName` 和 `teamName` 会用相应的值填充会话界面，但这些字段可以省略。你也可以指定任何其他附加值，并用于搜索事件。

```javascript
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // 其他自定义属性...
});
```

### 为低版本进行埋点

要对运行在 React Native 0.68 以下版本上的应用进行埋点，
请编辑你的 `metro.config.js` 文件，强制 Metro 使用浏览器专用的
包。例如：

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


## 视图导航

支持 [react-navigation](https://github.com/react-navigation/react-navigation) 5 和 6 版本。

下面的示例展示了如何对导航进行埋点：

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
