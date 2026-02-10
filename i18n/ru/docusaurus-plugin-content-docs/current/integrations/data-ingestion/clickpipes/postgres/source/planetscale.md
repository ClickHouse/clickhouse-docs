---
sidebar_label: 'PlanetScale для Postgres'
description: 'Настройка PlanetScale для Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/planetscale
title: 'Руководство по настройке источника PlanetScale для Postgres'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в режиме реального времени']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника PlanetScale for Postgres \{#planetscale-for-postgres-source-setup-guide\}

:::info
PlanetScale for Postgres в настоящее время находится на этапе [раннего доступа](https://planetscale.com/postgres).
:::

## Поддерживаемые версии Postgres \{#supported-postgres-versions\}

ClickPipes поддерживает Postgres версии 12 и выше.

## Включение логической репликации \{#enable-logical-replication\}

1. Чтобы включить репликацию на вашем экземпляре Postgres, необходимо убедиться, что установлен следующий параметр:

    ```sql
    wal_level = logical
    ```
   Чтобы проверить это, выполните следующую SQL-команду:
    ```sql
    SHOW wal_level;
    ```

   По умолчанию вывод должен быть `logical`. Если это не так, войдите в консоль PlanetScale, перейдите в `Cluster configuration->Parameters` и прокрутите до раздела `Write-ahead log`, чтобы изменить его.

<Image img={planetscale_wal_level_logical} alt="Настройка wal_level в консоли PlanetScale" size="md" border/>

:::warning
Изменение этого параметра в консоли PlanetScale ПРИВЕДЁТ к перезагрузке.
:::

2. Также рекомендуется увеличить значение параметра `max_slot_wal_keep_size` с значения по умолчанию 4 ГБ. Это также выполняется через консоль PlanetScale: перейдите в `Cluster configuration->Parameters`, а затем прокрутите до `Write-ahead log`. Чтобы определить новое значение, ознакомьтесь с рекомендациями [здесь](../faq#recommended-max_slot_wal_keep_size-settings).

<Image img={planetscale_max_slot_wal_keep_size} alt="Настройка max_slot_wal_keep_size в консоли PlanetScale" size="md" border/>

## Создание пользователя с правами доступа и публикацией \{#creating-a-user-with-permissions-and-publication\}

Подключитесь к экземпляру PlanetScale Postgres, используя пользователя по умолчанию `postgres.<...>`, и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. Предоставьте на уровне схемы доступ только для чтения пользователю, созданному на предыдущем шаге. В следующем примере показаны права доступа для схемы `public`. Повторите эти команды для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Предоставьте пользователю привилегии репликации:

    ```sql
    ALTER USER clickpipes_user WITH REPLICATION;
    ```

4. Создайте [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Настоятельно рекомендуем включать в публикацию только необходимые таблицы, чтобы избежать лишних накладных расходов на производительность.

   :::warning
   Любая таблица, включённая в публикацию, должна либо иметь определённый **первичный ключ**, _либо_ её **replica identity** должна быть настроена на `FULL`. См. раздел [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) для рекомендаций по выбору области публикаций.
   :::

   - Чтобы создать публикацию для конкретных таблиц:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - Чтобы создать публикацию для всех таблиц в конкретной схеме:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   Публикация `clickpipes` будет содержать набор событий изменений, сгенерированных из указанных таблиц, и затем будет использоваться для приёма потока репликации.

## Ограничения \{#caveats\}

1. Для подключения к PlanetScale Postgres к имени пользователя, созданному выше, необходимо добавить текущую ветку. Например, если созданный пользователь назывался `clickpipes_user`, фактическое имя пользователя, которое нужно указать при создании ClickPipe, должно быть `clickpipes_user`.`branch`, где `branch` — это значение "id" текущей [ветки](https://planetscale.com/docs/postgres/branching) PlanetScale Postgres. Чтобы быстро его определить, вы можете посмотреть на имя пользователя `postgres`, которого вы использовали для создания пользователя ранее: часть после точки и будет идентификатором ветки.
2. Не используйте порт `PSBouncer` (в настоящее время `6432`) для CDC-конвейеров, подключающихся к PlanetScale Postgres — необходимо использовать обычный порт `5432`. Любой из этих портов может использоваться только для конвейеров, выполняющих первоначальную загрузку (initial-load only).
3. Убедитесь, что вы подключаетесь только к основному (primary) экземпляру, так как [подключение к репликам](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas) в настоящее время не поддерживается. 

## Что дальше? \{#whats-next\}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся вам для создания ClickPipe.