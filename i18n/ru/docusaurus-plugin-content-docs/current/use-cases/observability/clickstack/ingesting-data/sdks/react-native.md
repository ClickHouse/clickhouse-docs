---
slug: /use-cases/observability/clickstack/sdks/react-native
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'React Native SDK для ClickStack — стек наблюдаемости ClickHouse'
title: 'React Native'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

React Native SDK для ClickStack позволяет добавить инструментацию в ваше
приложение React Native для отправки событий в ClickStack. Это дает
возможность просматривать сетевые запросы мобильного приложения и исключения
вместе с событиями бэкенда в единой временной шкале.

В этом руководстве рассматривается интеграция:

- **Запросов XHR/Fetch**



## Начало работы {#getting-started}

### Установка через NPM {#install-via-npm}

Используйте следующую команду для установки [пакета ClickStack React Native](https://www.npmjs.com/package/@hyperdx/otel-react-native).

```shell
npm install @hyperdx/otel-react-native
```

### Инициализация ClickStack {#initialize-clickstack}

Инициализируйте библиотеку как можно раньше в жизненном цикле приложения:

```javascript
import { HyperDXRum } from "@hyperdx/otel-react-native"

HyperDXRum.init({
  service: "my-rn-app",
  apiKey: "<YOUR_INGESTION_API_KEY>",
  tracePropagationTargets: [/api.myapp.domain/i] // Укажите для связывания трассировок от фронтенда с бэкенд-запросами
})
```

### Добавление информации о пользователе или метаданных (необязательно) {#attach-user-information-metadata}

Добавление информации о пользователе позволит вам выполнять поиск и фильтрацию сессий и событий
в HyperDX. Этот метод можно вызвать в любой момент во время клиентской сессии. Текущая
клиентская сессия и все события, отправленные после вызова, будут связаны
с информацией о пользователе.

Параметры `userEmail`, `userName` и `teamName` заполнят интерфейс сессий
соответствующими значениями, но их можно опустить. Любые другие дополнительные значения можно
указать и использовать для поиска событий.

```javascript
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name
  // Другие пользовательские свойства...
})
```

### Инструментирование более ранних версий {#instrument-lower-versions}

Для инструментирования приложений, работающих на версиях React Native ниже 0.68,
отредактируйте файл `metro.config.js`, чтобы заставить metro использовать пакеты,
специфичные для браузера. Например:

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


## Навигация по представлениям {#view-navigation}

Поддерживаются версии 5 и 6 библиотеки [react-navigation](https://github.com/react-navigation/react-navigation).

В следующем примере показано, как инструментировать навигацию:

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
