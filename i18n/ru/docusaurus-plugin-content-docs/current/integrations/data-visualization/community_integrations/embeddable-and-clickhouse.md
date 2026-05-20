---
sidebar_label: 'Embeddable'
slug: /integrations/embeddable
keywords: ['clickhouse', 'Embeddable', 'подключение', 'интеграция', 'ui']
description: 'Embeddable — это инструментарий для разработчиков, который позволяет создавать быстрые, интерактивные и полностью настраиваемые аналитические интерфейсы прямо в приложении.'
title: 'Подключение Embeddable к ClickHouse'
doc_type: 'руководство'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Подключение Embeddable к ClickHouse \{#connecting-embeddable-to-clickhouse\}

<CommunityMaintainedBadge />

В [Embeddable](https://embeddable.com/) вы определяете [модели данных](https://docs.embeddable.com/data-modeling/introduction) и [компоненты](https://docs.embeddable.com/development/introduction) в коде (который хранится в вашем собственном репозитории) и используете наш **SDK**, чтобы сделать их доступными для вашей команды в мощном no-code-конструкторе Embeddable.

В результате вы получаете возможность предоставлять быструю интерактивную клиентскую аналитику прямо в своем продукте; спроектированную вашей продуктовой командой; реализованную инженерной командой; поддерживаемую командами, работающими с клиентами, и специалистами по данным. Именно так, как и должно быть.

Встроенное разграничение доступа на уровне строк означает, что каждый пользователь видит только те данные, к которым ему разрешен доступ. А два уровня полностью настраиваемого кэширования позволяют предоставлять быструю аналитику в реальном времени в любом масштабе.

## 1. Подготовьте данные для подключения \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. Создайте тип подключения к ClickHouse \{#2-create-a-clickhouse-connection-type\}

Добавьте подключение к базе данных с помощью Embeddable API. Это подключение используется для подключения к вашему сервису ClickHouse. Вы можете добавить подключение, выполнив следующий вызов API:

```javascript title="Query"
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
```

```text title="Response"
Status 201 { errorMessage: null }
```

Выше показано действие `CREATE`, но доступны все операции `CRUD`.

`apiKey` можно найти, нажав &quot;**Publish**&quot; на одной из панелей мониторинга Embeddable.

`name` — это уникальное имя для идентификации этого подключения.

* По умолчанию ваши модели данных будут искать подключение с именем &quot;default&quot;, но вы можете указать для своих моделей другие имена `data_source`, чтобы разные модели данных подключались к разным подключениям (просто укажите имя data&#95;source в модели)

`type` сообщает Embeddable, какой драйвер использовать

* Здесь следует использовать `clickhouse`, но к одной рабочей области Embeddable можно подключить несколько разных источников данных, поэтому вы также можете использовать другие, например: `postgres`, `bigquery`, `mongodb` и т. д.

`credentials` — это объект JavaScript, содержащий учетные данные, необходимые драйверу

* Они надежно зашифрованы и используются только для получения именно тех данных, которые вы описали в своих моделях данных.
  Embeddable настоятельно рекомендует создать для каждого подключения пользователя базы данных с правами только для чтения (Embeddable будет только читать данные из вашей базы данных, но не записывать их).

Чтобы поддерживать подключение к разным базам данных для prod, qa, test и т. д. (или использовать разные базы данных для разных клиентов), вы можете назначить каждое подключение определенной среде (см. [Environments API](https://docs.embeddable.com/data/environments)).