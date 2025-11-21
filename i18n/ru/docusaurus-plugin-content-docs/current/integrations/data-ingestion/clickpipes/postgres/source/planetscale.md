---
sidebar_label: 'PlanetScale для Postgres'
description: 'Настройка PlanetScale для Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/planetscale
title: 'Руководство по настройке источника PlanetScale для Postgres'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'загрузка данных', 'синхронизация в реальном времени']
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника данных PlanetScale for Postgres

:::info
В настоящее время PlanetScale for Postgres находится в режиме [раннего доступа](https://planetscale.com/postgres).
:::



## Поддерживаемые версии Postgres {#supported-postgres-versions}

ClickPipes поддерживает Postgres версии 12 и новее.


## Включение логической репликации {#enable-logical-replication}

1. Чтобы включить репликацию в вашем экземпляре Postgres, необходимо убедиться, что заданы следующие параметры:

   ```sql
   wal_level = logical
   ```

   Чтобы проверить это, выполните следующую SQL-команду:

   ```sql
   SHOW wal_level;
   ```

   По умолчанию результат должен быть `logical`. Если это не так, войдите в консоль PlanetScale, перейдите в `Cluster configuration->Parameters` и прокрутите вниз до раздела `Write-ahead log`, чтобы изменить этот параметр.

<Image
  img={planetscale_wal_level_logical}
  alt='Настройка wal_level в консоли PlanetScale'
  size='md'
  border
/>

:::warning
Изменение этого параметра в консоли PlanetScale ПРИВЕДЕТ к перезапуску.
:::

2. Кроме того, рекомендуется увеличить значение параметра `max_slot_wal_keep_size` с его значения по умолчанию 4 ГБ. Это также выполняется через консоль PlanetScale: перейдите в `Cluster configuration->Parameters` и прокрутите вниз до раздела `Write-ahead log`. Чтобы определить новое значение, обратитесь к информации [здесь](../faq#recommended-max_slot_wal_keep_size-settings).

<Image
  img={planetscale_max_slot_wal_keep_size}
  alt='Настройка max_slot_wal_keep_size в консоли PlanetScale'
  size='md'
  border
/>


## Создание пользователя с правами доступа и публикацией {#creating-a-user-with-permissions-and-publication}

Создадим нового пользователя для ClickPipes с необходимыми правами доступа для CDC,
а также создадим публикацию, которую будем использовать для репликации.

Для этого подключитесь к вашему экземпляру PlanetScale Postgres, используя пользователя по умолчанию `postgres.<...>`, и выполните следующие SQL-команды:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
-- Возможно, потребуется предоставить эти права доступа для дополнительных схем в зависимости от переносимых таблиц
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Предоставляем пользователю права на репликацию
  ALTER USER clickpipes_user REPLICATION;

-- Создаём публикацию. Она будет использоваться при создании канала
-- При добавлении новых таблиц в ClickPipe их также необходимо будет вручную добавить в публикацию.
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, <...>;
```

:::note
Обязательно замените `clickpipes_user` и `clickpipes_password` на желаемые имя пользователя и пароль.
:::


## Ограничения {#caveats}

1. Для подключения к PlanetScale Postgres необходимо добавить текущую ветку к имени пользователя, созданному выше. Например, если созданный пользователь имел имя `clickpipes_user`, то фактическое имя пользователя, указываемое при создании ClickPipe, должно быть `clickpipes_user`.`branch`, где `branch` — это идентификатор текущей [ветки](https://planetscale.com/docs/postgres/branching) PlanetScale Postgres. Чтобы быстро определить это значение, можно обратиться к имени пользователя `postgres`, которое использовалось для создания пользователя ранее — часть после точки будет идентификатором ветки.
2. Не используйте порт `PSBouncer` (в настоящее время `6432`) для CDC-конвейеров, подключающихся к PlanetScale Postgres — необходимо использовать стандартный порт `5432`. Для конвейеров, выполняющих только начальную загрузку, можно использовать любой из портов.
3. Убедитесь, что вы подключаетесь только к основному экземпляру — [подключение к экземплярам-репликам](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas) в настоящее время не поддерживается.


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать загружать данные из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся при создании ClickPipe.
