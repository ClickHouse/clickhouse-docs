---
sidebar_label: 'Embeddable'
slug: /integrations/embeddable
keywords: ['clickhouse', 'Embeddable', 'connect', 'integrate', 'ui']
description: 'Embeddable — это инструментарий для разработчиков, позволяющий создавать быстрые, интерактивные и полностью настраиваемые аналитические решения прямо в вашем приложении.'
title: 'Подключение Embeddable к ClickHouse'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Embeddable к ClickHouse

<CommunityMaintainedBadge/>

В [Embeddable](https://embeddable.com/) вы определяете [Data Models](https://docs.embeddable.com/data-modeling/introduction) и [Components](https://docs.embeddable.com/development/introduction) в коде (который хранится в вашем собственном репозитории) и используете наш **SDK**, чтобы сделать их доступными для вашей команды в мощном **no-code‑конструкторе** Embeddable.

В результате вы получаете возможность предоставлять быстрые, интерактивные, клиентские аналитические отчёты прямо в вашем продукте: спроектированные вашей продуктовой командой, разработанные вашей инженерной командой и поддерживаемые командами, работающими с клиентами и данными. Именно так, как и должно быть.

Встроенная построчная защита данных (row-level security) гарантирует, что каждый пользователь видит только те данные, к которым у него есть доступ. А два уровня полностью настраиваемого кэширования позволяют предоставлять быструю аналитику в режиме реального времени и в больших масштабах.



## 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. Создание подключения к ClickHouse {#2-create-a-clickhouse-connection-type}

Подключение к базе данных добавляется через Embeddable API. Это подключение используется для соединения с вашим сервисом ClickHouse. Добавить подключение можно с помощью следующего вызова API:

```javascript
// из соображений безопасности это *никогда* не должно вызываться на стороне клиента
fetch('https://api.embeddable.com/api/v1/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}` /* храните ваш API-ключ в безопасности */,
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

Приведенный выше пример демонстрирует операцию `CREATE`, но доступны все операции `CRUD`.

Значение `apiKey` можно найти, нажав «**Publish**» на одной из ваших панелей Embeddable.

Параметр `name` — это уникальное имя для идентификации данного подключения.

- По умолчанию модели данных ищут подключение с именем «default», но вы можете указать для своих моделей различные имена `data_source`, чтобы подключать разные модели данных к разным подключениям (просто укажите имя data_source в модели)

Параметр `type` указывает Embeddable, какой драйвер использовать

- Здесь следует использовать `clickhouse`, но вы можете подключить несколько различных источников данных к одному рабочему пространству Embeddable, поэтому можете использовать и другие драйверы, такие как `postgres`, `bigquery`, `mongodb` и т. д.

Параметр `credentials` — это объект JavaScript, содержащий необходимые учетные данные, ожидаемые драйвером

- Они надежно шифруются и используются только для получения именно тех данных, которые вы описали в своих моделях данных.
  Embeddable настоятельно рекомендует создавать пользователя базы данных с правами только на чтение для каждого подключения (Embeddable только читает данные из вашей базы данных, но не записывает их).

Чтобы поддерживать подключение к различным базам данных для prod, qa, test и т. д. (или для поддержки различных баз данных для разных клиентов), вы можете назначить каждое подключение определенному окружению (см. [Environments API](https://docs.embeddable.com/data/environments)).
