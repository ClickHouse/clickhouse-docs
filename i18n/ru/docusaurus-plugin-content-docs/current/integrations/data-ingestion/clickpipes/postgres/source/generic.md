---
sidebar_label: 'Произвольный Postgres'
description: 'Настройте любой экземпляр Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/generic
title: 'Руководство по настройке произвольного источника Postgres'
doc_type: 'guide'
keywords: ['postgres', 'clickpipes', 'logical replication', 'pg_hba.conf', 'wal level']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# Универсальное руководство по настройке источника Postgres {#generic-postgres-source-setup-guide}

:::info

Если вы используете одного из поддерживаемых провайдеров (в боковом меню), обратитесь к соответствующему руководству по этому провайдеру.

:::

ClickPipes поддерживает Postgres версий 12 и выше.

## Включение логической репликации {#enable-logical-replication}

1. Чтобы включить репликацию на вашем экземпляре Postgres, необходимо убедиться, что заданы следующие настройки:

    ```sql
    wal_level = logical
    ```
   Чтобы это проверить, выполните следующую SQL-команду:
    ```sql
    SHOW wal_level;
    ```

   Результат должен быть `logical`. Если это не так, выполните:
    ```sql
    ALTER SYSTEM SET wal_level = logical;
    ```

2. Кроме того, рекомендуется задать на экземпляре Postgres следующие настройки:
    ```sql
    max_wal_senders > 1
    max_replication_slots >= 4
    ```
   Чтобы их проверить, выполните следующие SQL-команды:
    ```sql
    SHOW max_wal_senders;
    SHOW max_replication_slots;
    ```

   Если значения не соответствуют рекомендованным, выполните следующие SQL-команды, чтобы их задать:
    ```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
    ```
3. Если вы внесли какие-либо изменения в конфигурацию, как описано выше, вам НЕОБХОДИМО ПЕРЕЗАПУСТИТЬ экземпляр Postgres, чтобы изменения вступили в силу.

## Создание пользователя с правами доступа и публикацией {#creating-a-user-with-permissions-and-publication}

Подключитесь к вашему экземпляру Postgres под учетной записью администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте на уровне схемы доступ только для чтения пользователю, созданному на предыдущем шаге. В следующем примере показаны права для схемы `public`. Повторите эти команды для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Предоставьте пользователю привилегии репликации:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. Создайте [публикацию](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Настоятельно рекомендуется включать в публикацию только необходимые таблицы, чтобы избежать дополнительной нагрузки на производительность.

   :::warning
   Любая таблица, включённая в публикацию, должна либо иметь определённый **первичный ключ**, _либо_ иметь настроенную **replica identity** со значением `FULL`. См. раздел [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) для рекомендаций по определению области действия публикаций.
   :::

   - Чтобы создать публикацию для определённых таблиц:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - Чтобы создать публикацию для всех таблиц в определённой схеме:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   Публикация `clickpipes` будет содержать набор событий изменений, сгенерированных указанными таблицами, и позже будет использоваться для приёма потока репликации.

## Разрешение подключений в pg_hba.conf для пользователя ClickPipes {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

Если вы развертываете всё самостоятельно, вам необходимо разрешить подключения к пользователю ClickPipes с IP-адресов ClickPipes, выполнив описанные ниже шаги. Если вы используете управляемый сервис, вы можете сделать то же самое, следуя документации провайдера.

1. Внесите необходимые изменения в файл `pg_hba.conf`, чтобы разрешить подключения к пользователю ClickPipes с IP-адресов ClickPipes. Пример записи в файле `pg_hba.conf` будет выглядеть так:
    ```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
    ```

2. Перезагрузите экземпляр PostgreSQL, чтобы изменения вступили в силу:
    ```sql
    SELECT pg_reload_conf();
    ```

## Увеличение `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

Это рекомендованное изменение конфигурации, которое позволяет предотвратить удаление слота репликации из‑за крупных транзакций и коммитов.

Вы можете увеличить параметр `max_slot_wal_keep_size` для вашего экземпляра PostgreSQL до большего значения (как минимум 100 ГБ или `102400`), обновив файл `postgresql.conf`.

```sql
max_slot_wal_keep_size = 102400
```

Вы можете перезапустить экземпляр Postgres, чтобы изменения вступили в силу:

```sql
SELECT pg_reload_conf();
```

:::note

Для более точного подбора этого значения вы можете связаться с командой ClickPipes.

:::


## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать приём данных из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке экземпляра Postgres, — они понадобятся вам при создании ClickPipe.