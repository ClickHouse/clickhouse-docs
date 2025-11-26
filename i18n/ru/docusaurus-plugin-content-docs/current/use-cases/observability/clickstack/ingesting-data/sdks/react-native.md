---
slug: /use-cases/observability/clickstack/sdks/react-native
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'React Native SDK для ClickStack — стек наблюдаемости ClickHouse'
title: 'React Native'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'логирование', 'интеграция', 'мониторинг приложений']
---

React Native SDK для ClickStack позволяет инструментировать ваше приложение
React Native для отправки событий в ClickStack. Это позволяет видеть сетевые
запросы мобильного приложения и исключения вместе с событиями бэкенда на единой
временной шкале.

В этом руководстве вы настроите интеграцию:

- **XHR/Fetch-запросы**



## Начало работы

### Установка через npm

С помощью следующей команды установите [пакет ClickStack React Native](https://www.npmjs.com/package/@hyperdx/otel-react-native).

```shell
npm install @hyperdx/otel-react-native
```

### Инициализируйте ClickStack

Инициализируйте библиотеку как можно раньше в жизненном цикле вашего приложения:

```javascript
import { HyperDXRum } from '@hyperdx/otel-react-native';

HyperDXRum.init({
  service: 'my-rn-app',
  apiKey: '<ВАШ_КЛЮЧ_API_ПРИЁМА>',
  tracePropagationTargets: [/api.myapp.domain/i], // Установите для связывания трассировок между фронтендом и бэкендом
});
```

### Добавление информации о пользователе или метаданных (необязательно)

Добавление информации о пользователе позволит вам искать и фильтровать сессии и события
в HyperDX. Этот метод можно вызвать в любой момент в рамках клиентской сессии.
Текущая клиентская сессия и все события, отправленные после вызова, будут связаны
с информацией о пользователе.

`userEmail`, `userName` и `teamName` заполнят интерфейс сессий соответствующими
значениями, но их можно опустить. Любые дополнительные значения могут быть
указаны и использованы для поиска событий.

```javascript
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Другие пользовательские свойства...
});
```

### Инструментирование более старых версий

Чтобы инструментировать приложения, работающие на React Native версии ниже 0.68,
отредактируйте файл `metro.config.js`, чтобы заставить Metro использовать
пакеты, предназначенные для браузера. Например:

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


## Навигация между экранами

Поддерживаются версии 5 и 6 [react-navigation](https://github.com/react-navigation/react-navigation).

Следующий пример показывает, как настроить инструментирование навигации:

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
