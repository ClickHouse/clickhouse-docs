---
sidebar_label: 'Embeddable'
slug: /integrations/embeddable
keywords: ['clickhouse', 'Embeddable', 'подключить', 'интегрировать', 'ui']
description: 'Embeddable — это инструментарий для разработчиков для создания быстрых, интерактивных, полностью настраиваемых аналитических интерфейсов непосредственно в вашем приложении.'
title: 'Подключение Embeddable к ClickHouse'
doc_type: 'guide'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Подключение Embeddable к ClickHouse {#connecting-embeddable-to-clickhouse}

<CommunityMaintainedBadge/>

В [Embeddable](https://embeddable.com/) вы определяете [Data Models](https://docs.embeddable.com/data-modeling/introduction) и [Components](https://docs.embeddable.com/development/introduction) в коде (который хранится в вашем собственном репозитории) и используете наш **SDK**, чтобы сделать их доступными для вашей команды в мощном **no-code‑конструкторе** Embeddable.

В результате вы получаете возможность предоставлять быстрые, интерактивные клиентские аналитические возможности прямо в вашем продукте: спроектированные вашей продуктовой командой, реализованные вашей инженерной командой и поддерживаемые командами, работающими с клиентами и данными. Именно так, как и должно быть.

Встроенная безопасность на уровне строк гарантирует, что каждый пользователь видит только те данные, к которым у него есть доступ. А два уровня полностью настраиваемого кэширования позволяют обеспечивать быструю, масштабируемую аналитику в режиме реального времени.

## 1. Соберите сведения о подключении {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Создайте тип подключения к ClickHouse {#2-create-a-clickhouse-connection-type}

Вы добавляете подключение к базе данных с помощью API Embeddable. Это подключение используется для подключения к вашему сервису ClickHouse. Вы можете добавить подключение с помощью следующего вызова API:

```javascript
// из соображений безопасности это *никогда* не должно вызываться на клиентской стороне
fetch('https://api.embeddable.com/api/v1/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}` /* храните API-ключ в безопасности */,
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

Ответ:
Status 201 { errorMessage: null }
```

Выше приведено действие `CREATE`, но доступны все операции `CRUD`.

Значение `apiKey` можно найти, нажав &quot;**Publish**&quot; на одном из ваших дашбордов Embeddable.

Поле `name` — это уникальное имя для идентификации этого подключения.

* По умолчанию ваши модели данных будут искать подключение с именем &quot;default&quot;, но вы можете указать для моделей другие имена `data_source`, чтобы подключать разные модели данных к разным подключениям (просто укажите имя data&#95;source в модели).

Параметр `type` указывает Embeddable, какой драйвер использовать.

* Здесь вам нужно использовать `clickhouse`, но вы можете подключить несколько разных источников данных к одному рабочему пространству Embeddable, поэтому можете использовать и другие, такие как: `postgres`, `bigquery`, `mongodb` и т. д.

Поле `credentials` — это объект JavaScript, содержащий необходимые учетные данные, которые ожидает драйвер.

* Они надежно шифруются и используются только для выборки именно тех данных, которые вы описали в своих моделях данных.
  Embeddable настоятельно рекомендует создать для каждого подключения пользователя базы данных только для чтения (Embeddable будет только читать из вашей базы данных, а не записывать).

Чтобы поддерживать подключение к разным базам данных для prod, qa, test и т. д. (или поддерживать разные базы данных для разных клиентов), вы можете привязать каждое подключение к определённой среде (см. [Environments API](https://docs.embeddable.com/data/environments)).
