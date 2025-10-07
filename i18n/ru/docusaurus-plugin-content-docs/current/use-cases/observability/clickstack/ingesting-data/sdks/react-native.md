---
'slug': '/use-cases/observability/clickstack/sdks/react-native'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 7
'description': 'React Native SDK для ClickStack - Стек мониторинга ClickHouse'
'title': 'React Native'
'doc_type': 'guide'
---
ClickStack React Native SDK позволяет вам интегрировать ваше React Native приложение для отправки событий в ClickStack. Это позволяет вам видеть мобильные сетевые запросы и исключения вместе с событиями бэкенда на одной временной шкале.

Этот гид включает в себя:

- **XHR/Fetch Запросы**

## Начало работы {#getting-started}

### Установка через NPM {#install-via-npm}

Используйте следующую команду для установки [пакета ClickStack React Native](https://www.npmjs.com/package/@hyperdx/otel-react-native).

```shell
npm install @hyperdx/otel-react-native
```

### Инициализация ClickStack {#initialize-clickstack}

Инициализируйте библиотеку как можно раньше в жизненном цикле вашего приложения:

```javascript
import { HyperDXRum } from '@hyperdx/otel-react-native';

HyperDXRum.init({
  service: 'my-rn-app',
  apiKey: '<YOUR_INGESTION_API_KEY>',
  tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
});
```

### Присоединение информации о пользователе или метаданных (необязательно) {#attach-user-information-metadata}

Присоединение информации о пользователе позволит вам искать/фильтровать сессии и события в HyperDX. Это можно вызвать в любой момент во время клиентской сессии. Текущая клиентская сессия и все события, отправленные после вызова, будут ассоциированы с информацией о пользователе.

`userEmail`, `userName` и `teamName` заполнят интерфейс сессий соответствующими значениями, но могут быть опущены. Любые другие дополнительные значения могут быть указаны и использованы для поиска событий.

```javascript
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```

### Инструментирование более низких версий {#instrument-lower-versions}

Чтобы инструментировать приложения, работающие на версиях React Native ниже 0.68, отредактируйте ваш файл `metro.config.js`, чтобы заставить metro использовать специфические для браузера пакеты. Например:

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

## Навигация представлений {#view-navigation}

Поддерживаются версии [react-navigation](https://github.com/react-navigation/react-navigation) 5 и 6.

Следующий пример показывает, как инструментировать навигацию:

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