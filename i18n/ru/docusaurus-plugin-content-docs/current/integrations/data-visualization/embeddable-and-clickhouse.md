---
'sidebar_label': 'Embeddable'
'slug': '/integrations/embeddable'
'keywords':
- 'clickhouse'
- 'Embeddable'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Embeddable — это инструмент для разработчиков, который позволяет создавать
  быстрые, интерактивные и полностью настраиваемые аналитические функции прямо в вашем
  приложении.'
'title': 'Подключение Embeddable к ClickHouse'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Embeddable к ClickHouse

<CommunityMaintainedBadge/>

В [Embeddable](https://embeddable.com/) вы определяете [Модели Данных](https://docs.embeddable.com/data-modeling/introduction) и [Компоненты](https://docs.embeddable.com/development/introduction) в коде (хранящемся в вашем собственном репозитории кода) и используете наш **SDK**, чтобы сделать их доступными для вашей команды в мощном **безкодовом конструкторе** Embeddable.

Конечный результат — это возможность предоставлять быстрые, интерактивные аналитические данные для клиентов непосредственно в вашем продукте; разработанные вашей командой продукта; построенные вашей инженерной командой; поддерживаемые командами, работающими с клиентами, и командами данных. Именно так это и должно быть.

Встроенная безопасность на уровне строк означает, что каждый пользователь видит только те данные, которые ему разрешено видеть. А два уровня полностью настраиваемого кэширования позволяют предоставлять быстрые, реалистичные аналитические данные в масштабах.

## 1. Соберите данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Создайте тип подключения к ClickHouse {#2-create-a-clickhouse-connection-type}

Вы добавляете подключение к базе данных, используя API Embeddable. Это подключение используется для соединения с вашим сервисом ClickHouse. Вы можете добавить подключение, используя следующий вызов API:

```javascript
// for security reasons, this must *never* be called from your client-side
fetch('https://api.embeddable.com/api/v1/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}` /* keep your API Key secure */,
  },
  body: JSON.stringify({
    name: 'my-clickhouse-db',
    type: 'clickhouse',
    credentials: {
      host: 'my.clickhouse.host',
      user: 'clickhouse_user',
      port: 8443,
      password: '*****',
    },
  }),
});

Response:
Status 201 { errorMessage: null }
```

Выше представлено действие `CREATE`, но все операции `CRUD` также доступны.

`apiKey` можно найти, нажав "**Опубликовать**" на одной из ваших панелей управления Embeddable.

`name` — это уникальное имя для идентификации этого соединения.
- По умолчанию ваши модели данных будут искать соединение с именем "default", но вы можете предоставить вашим моделям разные имена `data_source`, чтобы поддерживать соединение различных моделей данных с разными соединениями (просто укажите имя data_source в модели).

`type` указывает Embeddable, какой драйвер использовать.

- Здесь вы захотите использовать `clickhouse`, но вы можете подключить несколько различных источников данных к одному рабочему пространству Embeddable, так что вы можете использовать и другие, такие как: `postgres`, `bigquery`, `mongodb` и т.д.

`credentials` — это объект JavaScript, содержащий необходимые учетные данные, ожидаемые драйвером.
- Эти данные надежно зашифрованы и используются только для извлечения именно тех данных, которые вы описали в своих моделях данных.
Embeddable настоятельно рекомендует создавать пользователя базы данных с правами только для чтения для каждого подключения (Embeddable всегда будет только читать из вашей базы данных, не записывая в нее).

Чтобы поддерживать соединение с разными базами данных для prod, qa, test и т.д. (или чтобы поддерживать разные базы данных для разных клиентов), вы можете назначить каждое соединение окружению (см. [Environments API](https://docs.embeddable.com/data/environments)).
