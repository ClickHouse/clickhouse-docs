---
sidebar_label: 'Универсальный Postgres'
description: 'Настройка любого экземпляра Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/generic
title: 'Руководство по настройке универсального источника Postgres'
doc_type: 'guide'
keywords: ['postgres', 'clickpipes', 'logical replication', 'pg_hba.conf', 'wal level']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# Общее руководство по настройке источника Postgres \{#generic-postgres-source-setup-guide\}

:::info

Если вы используете одного из поддерживаемых провайдеров (см. боковую панель), обратитесь к соответствующему руководству по этому провайдеру.

:::

ClickPipes поддерживает Postgres версии 12 и новее.

## Включение логической репликации \{#enable-logical-replication\}

1. Чтобы включить репликацию в вашем экземпляре Postgres, необходимо убедиться, что установлены следующие параметры:

    ```sql
    wal_level = logical
    ```
   Чтобы проверить это, выполните следующую SQL-команду:
    ```sql
    SHOW wal_level;
    ```

   В выводе должно быть значение `logical`. Если это не так, выполните:
    ```sql
    ALTER SYSTEM SET wal_level = logical;
    ```

2. Дополнительно рекомендуется установить в экземпляре Postgres следующие параметры:
    ```sql
    max_wal_senders > 1
    max_replication_slots >= 4
    ```
   Чтобы проверить это, выполните следующие SQL-команды:
    ```sql
    SHOW max_wal_senders;
    SHOW max_replication_slots;
    ```

   Если значения не соответствуют рекомендуемым, выполните следующие SQL-команды, чтобы задать их:
    ```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
    ```
3. Если вы внесли какие-либо изменения в конфигурацию, как указано выше, вам НЕОБХОДИМО ПЕРЕЗАПУСТИТЬ экземпляр Postgres, чтобы изменения вступили в силу.

## Создание пользователя с правами доступа и публикацией \{#creating-a-user-with-permissions-and-publication\}

Подключитесь к вашему экземпляру Postgres под пользователем с правами администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте на уровне схемы доступ только на чтение пользователю, созданному на предыдущем шаге. В следующем примере показаны права для схемы `public`. Повторите эти команды для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Предоставьте пользователю права на репликацию:

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. Создайте [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Настоятельно рекомендуем включать в публикацию только те таблицы, которые вам необходимы, чтобы избежать лишних накладных расходов и снижения производительности.

   :::warning
   Для любой таблицы, включённой в публикацию, должен быть определён **первичный ключ** _или_ для неё должна быть настроена **replica identity** со значением `FULL`. См. раздел [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) для рекомендаций по выбору области публикаций.
   :::

   - Чтобы создать публикацию для конкретных таблиц:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - Чтобы создать публикацию для всех таблиц в определённой схеме:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   Публикация `clickpipes` будет содержать набор событий изменений, формируемых из указанных таблиц, и позже будет использоваться для приёма потока репликации.

## Включение подключений в pg_hba.conf для пользователя ClickPipes \{#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user\}

Если вы управляете базой самостоятельно, вам нужно разрешить подключения к пользователю ClickPipes с IP-адресов ClickPipes, выполнив шаги ниже. Если вы используете управляемый сервис, вы можете сделать то же самое, следуя документации провайдера.

1. Внесите необходимые изменения в файл `pg_hba.conf`, чтобы разрешить подключения к пользователю ClickPipes с IP-адресов ClickPipes. Пример записи в файле `pg_hba.conf` будет выглядеть так:
    ```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
    ```

2. Перезагрузите экземпляр PostgreSQL, чтобы изменения вступили в силу:
    ```sql
    SELECT pg_reload_conf();
    ```

## Увеличьте `max_slot_wal_keep_size` \{#increase-max_slot_wal_keep_size\}

Это рекомендуемое изменение конфигурации, чтобы крупные транзакции/коммиты не приводили к удалению слота репликации.

Вы можете увеличить параметр `max_slot_wal_keep_size` для вашего экземпляра PostgreSQL до более высокого значения (как минимум 100GB или `102400`), обновив файл `postgresql.conf`.

```sql
max_slot_wal_keep_size = 102400
```

Вы можете перезагрузить экземпляр сервера Postgres, чтобы изменения вступили в силу:

```sql
SELECT pg_reload_conf();
```

:::note

За более точной рекомендацией по выбору этого значения вы можете обратиться к команде ClickPipes.

:::


## Что дальше? \{#whats-next\}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся при создании ClickPipe.