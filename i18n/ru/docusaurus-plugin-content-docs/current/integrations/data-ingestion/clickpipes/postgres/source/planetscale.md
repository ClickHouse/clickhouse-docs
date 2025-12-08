---
sidebar_label: 'PlanetScale для Postgres'
description: 'Настройка PlanetScale для Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/planetscale
title: 'Руководство по настройке PlanetScale для Postgres в качестве источника'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';

# Руководство по настройке источника данных PlanetScale for Postgres {#planetscale-for-postgres-source-setup-guide}

:::info
В настоящее время PlanetScale for Postgres находится в [программе раннего доступа](https://planetscale.com/postgres).
:::

## Поддерживаемые версии Postgres {#supported-postgres-versions}

ClickPipes поддерживает Postgres, начиная с версии 12.

## Включение логической репликации {#enable-logical-replication}

1. Чтобы включить репликацию в вашем инстансе Postgres, необходимо убедиться, что задан следующий параметр:

    ```sql
    wal_level = logical
    ```
   Чтобы это проверить, выполните следующую SQL-команду:
    ```sql
    SHOW wal_level;
    ```

   По умолчанию в выводе должно быть `logical`. Если это не так, войдите в консоль PlanetScale, перейдите в `Cluster configuration->Parameters` и прокрутите до раздела `Write-ahead log`, чтобы изменить значение.

<Image img={planetscale_wal_level_logical} alt="Настройка wal_level в консоли PlanetScale" size="md" border/>

:::warning
Изменение этого параметра в консоли PlanetScale ПРИВЕДЕТ к перезапуску.
:::

2. Дополнительно рекомендуется увеличить значение `max_slot_wal_keep_size` по сравнению с его значением по умолчанию — 4 ГБ. Это также настраивается через консоль PlanetScale: перейдите в `Cluster configuration->Parameters`, затем прокрутите до раздела `Write-ahead log`. Чтобы подобрать новое значение, ознакомьтесь с рекомендациями [здесь](../faq#recommended-max_slot_wal_keep_size-settings).

<Image img={planetscale_max_slot_wal_keep_size} alt="Настройка max_slot_wal_keep_size в консоли PlanetScale" size="md" border/>

## Создание пользователя с правами доступа и публикацией {#creating-a-user-with-permissions-and-publication}

Создадим нового пользователя для ClickPipes с необходимыми правами доступа, подходящими для CDC,
а также создадим публикацию, которую будем использовать для репликации.

Для этого вы можете подключиться к вашему экземпляру PlanetScale Postgres, используя пользователя по умолчанию `postgres.&lt;...&gt;`, и выполнить следующие SQL-команды:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
-- Возможно, потребуется предоставить эти разрешения дополнительным схемам в зависимости от переносимых таблиц
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Предоставить пользователю права на репликацию
  ALTER USER clickpipes_user REPLICATION;

-- Создать публикацию. Она будет использоваться при создании пайплайна
-- При добавлении новых таблиц в ClickPipe их также необходимо вручную добавить в публикацию. 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, <...>;
```

:::note
Обязательно замените `clickpipes_user` и `clickpipes_password` на выбранные вами имя пользователя и пароль.
:::

## Особенности и ограничения {#caveats}
1. Для подключения к PlanetScale Postgres к имени пользователя, созданному выше, необходимо добавить текущую ветку. Например, если созданный пользователь назывался `clickpipes_user`, фактическое имя пользователя, указываемое при создании ClickPipe, должно быть `clickpipes_user`.`branch`, где `branch` — это `id` текущей [ветки](https://planetscale.com/docs/postgres/branching) PlanetScale Postgres. Чтобы быстро определить это значение, вы можете посмотреть на имя пользователя `postgres`, под которым вы создавали этого пользователя ранее, — часть после точки и будет идентификатором ветки.
2. Не используйте порт `PSBouncer` (сейчас `6432`) для CDC-конвейеров, подключающихся к PlanetScale Postgres, необходимо использовать стандартный порт `5432`. Любой из портов может использоваться только для конвейеров, выполняющих только начальную загрузку (initial-load only).
3. Убедитесь, что вы подключаетесь только к основной (primary) инстанции, так как [подключение к репликам](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas) в настоящее время не поддерживается. 

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать приём данных из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при его настройке, так как они понадобятся вам при создании ClickPipe.
