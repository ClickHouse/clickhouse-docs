---
'slug': '/use-cases/observability/clickstack/sdks/react-native'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 7
'description': 'React Native SDK 用于 ClickStack - ClickHouse 可观察性堆栈'
'title': 'React Native'
---

The ClickStack React Native SDK 允许您对您的 React Native 应用进行仪器以向 ClickStack 发送事件。这使您能够在单一时间线上查看移动网络请求和异常以及后端事件。

本指南集成了：

- **XHR/Fetch 请求**

## 开始使用 {#getting-started}

### 通过 NPM 安装 {#install-via-npm}

使用以下命令安装 [ClickStack React Native package](https://www.npmjs.com/package/@hyperdx/otel-react-native)。

```bash
npm install @hyperdx/otel-react-native
```

### 初始化 ClickStack {#initialize-clickstack}

尽早在您的应用生命周期初始化库：

```js
import { HyperDXRum } from '@hyperdx/otel-react-native';

HyperDXRum.init({
  service: 'my-rn-app',
  apiKey: '<YOUR_INGESTION_API_KEY>',
  tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
});
```

### 附加用户信息或元数据（可选） {#attach-user-information-metadata}

附加用户信息将允许您在 HyperDX 中搜索/过滤会话和事件。可以在客户端会话的任何时刻调用此操作。当前的客户端会话及其后发送的所有事件将与用户信息相关联。

`userEmail`、`userName` 和 `teamName` 将用相应的值填充会话 UI，但可以省略。任何其他额外值也可以指定并用于搜索事件。

```js
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```

### 为低版本仪器化 {#instrument-lower-versions}

要为运行在低于 0.68 的 React Native 版本的应用进行仪器，请编辑您的 `metro.config.js` 文件以强迫 metro 使用特定于浏览器的包。例如：

```js
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

以下示例演示了如何仪器化导航：

```js
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
