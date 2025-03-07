---
sidebar_label: Генеративный Postgres
description: Настройте любой экземпляр Postgres в качестве источника для ClickPipes
slug: /integrations/clickpipes/postgres/source/generic
---


# Руководство по настройке источника Generative Postgres

:::info

Если вы используете одного из поддерживаемых провайдеров (в боковой панели), пожалуйста, обратитесь к специфическому руководству для этого провайдера.

:::


ClickPipes поддерживает версии Postgres 12 и выше.

## Включение логической репликации {#enable-logical-replication}

1. Чтобы включить репликацию на вашем экземпляре Postgres, необходимо убедиться, что установлены следующие параметры:

    ```sql
    wal_level = logical
    ```
   Чтобы проверить это, вы можете выполнить следующую SQL-команду:
    ```sql
    SHOW wal_level;
    ```

   Вывод должен быть `logical`. Если это не так, выполните:
    ```sql
    ALTER SYSTEM SET wal_level = logical;
    ```

2. Дополнительно рекомендуется установить следующие параметры на экземпляре Postgres:
    ```sql
    max_wal_senders > 1
    max_replication_slots >= 4
    ```
   Чтобы проверить это, вы можете выполнить следующие SQL-команды:
    ```sql
    SHOW max_wal_senders;
    SHOW max_replication_slots;
    ```

   Если значения не соответствуют рекомендуемым, вы можете выполнить следующие SQL-команды для их установки:
    ```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
    ```
3. Если вы внесли какие-либо изменения в конфигурацию, как указано выше, вам НУЖНО ПЕРЕЗАПУСТИТЬ экземпляр Postgres, чтобы изменения вступили в силу.


## Создание пользователя с разрешениями и публикацией {#creating-a-user-with-permissions-and-publication}

Давайте создадим нового пользователя для ClickPipes с необходимыми разрешениями, подходящими для CDC, и также создадим публикацию, которую мы будем использовать для репликации.

Для этого подключитесь к вашему экземпляру Postgres и выполните следующие SQL-команды:
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Предоставьте разрешение на репликацию пользователю
  ALTER USER clickpipes_user REPLICATION;

-- Создать публикацию. Мы будем использовать это при создании канала
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```
:::note

Убедитесь, что вы заменили `clickpipes_user` и `clickpipes_password` на желаемое имя пользователя и пароль.

:::


## Включение подключений в pg_hba.conf к пользователю ClickPipes {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

Если вы управляете самостоятельно, вам необходимо разрешить подключения к пользователю ClickPipes из IP-адресов ClickPipes, следуя указанным ниже шагам. Если вы используете управляемый сервис, вы можете сделать то же самое, следуя документации провайдера.

1. Внесите необходимые изменения в файл `pg_hba.conf`, чтобы разрешить подключения к пользователю ClickPipes из IP-адресов ClickPipes. Пример записи в файле `pg_hba.conf` будет выглядеть так:
    ```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
    ```

2. Перезагрузите экземпляр PostgreSQL, чтобы изменения вступили в силу:
    ```sql
    SELECT pg_reload_conf();
    ```


## Увеличение `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

Это рекомендуемое изменение конфигурации, чтобы гарантировать, что большие транзакции/коммиты не вызовут удаление слота репликации.

Вы можете увеличить параметр `max_slot_wal_keep_size` для вашего экземпляра PostgreSQL до более высокого значения (не менее 100 ГБ или `102400`), обновив файл `postgresql.conf`.

```sql
max_slot_wal_keep_size = 102400
```

Вы можете перезагрузить экземпляр Postgres, чтобы изменения вступили в силу:
```sql
SELECT pg_reload_conf();
```

:::note

Для лучшей рекомендации этого значения вы можете обратиться в команду ClickPipes.

:::

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать интеграцию данных из вашего экземпляра Postgres в ClickHouse Cloud.
Не забудьте зафиксировать данные подключения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам в процессе создания ClickPipe.
