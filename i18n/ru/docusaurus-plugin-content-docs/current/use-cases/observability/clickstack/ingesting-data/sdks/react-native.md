---
slug: /use-cases/observability/clickstack/sdks/react-native
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'React Native SDK для ClickStack - стек наблюдаемости ClickHouse'
title: 'React Native'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

React Native SDK для ClickStack позволяет инструментировать ваше React Native‑приложение
для отправки событий в ClickStack. Это позволяет просматривать сетевые запросы
мобильного приложения и исключения вместе с событиями бэкенд‑сервисов на единой временной шкале.

В данном руководстве интегрируются:

- **XHR/Fetch‑запросы**

## Приступаем к работе {#getting-started}

### Установка через npm

Используйте следующую команду, чтобы установить [пакет ClickStack React Native](https://www.npmjs.com/package/@hyperdx/otel-react-native).

```shell
npm install @hyperdx/otel-react-native
```


### Инициализируйте ClickStack

Инициализируйте библиотеку как можно раньше в жизненном цикле приложения:

```javascript
import { HyperDXRum } from '@hyperdx/otel-react-native';

HyperDXRum.init({
  service: 'my-rn-app',
  apiKey: '<ВАШ_КЛЮЧ_API_ПРИЁМА>',
  tracePropagationTargets: [/api.myapp.domain/i], // Укажите для связывания трассировок между фронтендом и бэкенд-запросами
});
```


### Добавление информации о пользователе или метаданных (необязательно)

Добавление информации о пользователе позволит выполнять поиск и фильтрацию
сеансов и событий в HyperDX. Эту функцию можно вызывать в любой момент в ходе
клиентского сеанса. Текущий клиентский сеанс и все события, отправленные после
вызова, будут связаны с указанной информацией о пользователе.

`userEmail`, `userName` и `teamName` будут отображаться в интерфейсе сеансов с
соответствующими значениями, но их можно не указывать. Можно задать любые
другие дополнительные значения и использовать их для поиска событий.

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
отредактируйте файл `metro.config.js`, чтобы Metro использовал пакеты,
ориентированные на браузер. Например:

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

В следующем примере показано, как проинструментировать навигацию:

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
