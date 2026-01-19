---
sidebar_label: 'PlanetScale для Postgres'
description: 'Настройка PlanetScale для Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/planetscale
title: 'Руководство по настройке PlanetScale для Postgres в качестве источника'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
integration:
   - support_level: 'основной'
   - category: 'clickpipes'
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';

# Руководство по настройке источника данных PlanetScale for Postgres \{#planetscale-for-postgres-source-setup-guide\}

:::info
В настоящее время PlanetScale for Postgres находится в [программе раннего доступа](https://planetscale.com/postgres).
:::

## Поддерживаемые версии Postgres \{#supported-postgres-versions\}

ClickPipes поддерживает Postgres, начиная с версии 12.

## Включение логической репликации \{#enable-logical-replication\}

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

## Создание пользователя с правами доступа и публикацией \{#creating-a-user-with-permissions-and-publication\}

Подключитесь к экземпляру PlanetScale Postgres, используя пользователя по умолчанию `postgres.<...>`, и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. Выдайте пользователю, созданному на предыдущем шаге, права только на чтение на уровне схемы. В следующем примере показаны права для схемы `public`. Повторите эти команды для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Выдайте пользователю привилегии репликации:

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. Создайте [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Настоятельно рекомендуется включать в публикацию только необходимые таблицы, чтобы избежать лишних накладных расходов на производительность.

   :::warning
   Любая таблица, включённая в публикацию, должна либо иметь определённый **primary key**, _либо_ для неё должна быть настроена **replica identity** со значением `FULL`. См. раздел [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) для рекомендаций по выбору области публикаций.
   :::

   - Чтобы создать публикацию для отдельных таблиц:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - Чтобы создать публикацию для всех таблиц в определённой схеме:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   Публикация `clickpipes` будет содержать набор событий изменений, сгенерированных из указанных таблиц, и впоследствии будет использоваться для приёма потока репликации.

## Особенности и ограничения \{#caveats\}
1. Для подключения к PlanetScale Postgres к имени пользователя, созданному выше, необходимо добавить текущую ветку. Например, если созданный пользователь назывался `clickpipes_user`, фактическое имя пользователя, указываемое при создании ClickPipe, должно быть `clickpipes_user`.`branch`, где `branch` — это `id` текущей [ветки](https://planetscale.com/docs/postgres/branching) PlanetScale Postgres. Чтобы быстро определить это значение, вы можете посмотреть на имя пользователя `postgres`, под которым вы создавали этого пользователя ранее, — часть после точки и будет идентификатором ветки.
2. Не используйте порт `PSBouncer` (сейчас `6432`) для CDC-конвейеров, подключающихся к PlanetScale Postgres, необходимо использовать стандартный порт `5432`. Любой из портов может использоваться только для конвейеров, выполняющих только начальную загрузку (initial-load only).
3. Убедитесь, что вы подключаетесь только к основной (primary) инстанции, так как [подключение к репликам](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas) в настоящее время не поддерживается. 

## Что дальше? \{#whats-next\}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать приём данных из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при его настройке, так как они понадобятся вам при создании ClickPipe.