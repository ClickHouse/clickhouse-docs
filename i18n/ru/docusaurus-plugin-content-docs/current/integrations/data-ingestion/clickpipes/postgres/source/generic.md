---
sidebar_label: 'Генерический Postgres'
description: 'Настройте любую инстанс Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/generic
title: 'Руководство по настройке генератического источника Postgres'
---


# Руководство по настройке генератического источника Postgres

:::info

Если вы используете одного из поддерживаемых провайдеров (в боковом меню), пожалуйста, обратитесь к конкретному руководству для этого провайдера.

:::

ClickPipes поддерживает версии Postgres 12 и выше.

## Включение логической репликации {#enable-logical-replication}

1. Для включения репликации на вашем инстансе Postgres необходимо убедиться, что установлены следующие настройки:

    ```sql
    wal_level = logical
    ```
   Чтобы это проверить, вы можете выполнить следующую SQL-команду:
    ```sql
    SHOW wal_level;
    ```

   Результат должен быть `logical`. Если нет, выполните:
    ```sql
    ALTER SYSTEM SET wal_level = logical;
    ```

2. Кроме того, рекомендуется установить следующие настройки на инстансе Postgres:
    ```sql
    max_wal_senders > 1
    max_replication_slots >= 4
    ```
   Чтобы проверить это, вы можете выполнить следующие SQL-команды:
    ```sql
    SHOW max_wal_senders;
    SHOW max_replication_slots;
    ```

   Если значения не совпадают с рекомендуемыми, вы можете выполнить следующие SQL-команды, чтобы установить их:
    ```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
    ```
3. Если вы внесли какие-либо изменения в конфигурацию, как указано выше, вам НЕОБХОДИМО ПЕРЕЗАПУСТИТЬ инстанс Postgres, чтобы изменения вступили в силу.


## Создание пользователя с разрешениями и публикацией {#creating-a-user-with-permissions-and-publication}

Давайте создадим нового пользователя для ClickPipes с необходимыми разрешениями, подходящими для CDC, и также создадим публикацию, которую мы будем использовать для репликации.

Для этого вы можете подключиться к вашему инстансу Postgres и выполнить следующие SQL-команды:
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Дать разрешение на репликацию пользователю
  ALTER USER clickpipes_user REPLICATION;

-- Создать публикацию. Мы будем использовать это при создании канала
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```
:::note

Убедитесь, что вы заменили `clickpipes_user` и `clickpipes_password` на желаемое имя пользователя и пароль.

:::


## Включение подключений в pg_hba.conf для пользователя ClickPipes {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

Если вы самостоятельно обслуживаете, вам необходимо разрешить подключения к пользователю ClickPipes с IP-адресов ClickPipes, следуя приведенным ниже шагам. Если вы используете управляемый сервис, вы можете сделать то же самое, следуя документации провайдера.

1. Внесите необходимые изменения в файл `pg_hba.conf`, чтобы разрешить подключения к пользователю ClickPipes с IP-адресов ClickPipes. Пример записи в файле `pg_hba.conf` будет выглядеть следующим образом:
    ```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
    ```

2. Перезагрузите экземпляр PostgreSQL, чтобы изменения вступили в силу:
    ```sql
    SELECT pg_reload_conf();
    ```


## Увеличить `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

Это рекомендованное изменение конфигурации, чтобы гарантировать, что большие транзакции/коммиты не вызовут удаление слота репликации.

Вы можете увеличить параметр `max_slot_wal_keep_size` для вашего экземпляра PostgreSQL до более высокого значения (не менее 100GB или `102400`), обновив файл `postgresql.conf`.

```sql
max_slot_wal_keep_size = 102400
```

Вы можете перезагрузить инстанс Postgres, чтобы изменения вступили в силу:
```sql
SELECT pg_reload_conf();
```

:::note

Для получения лучших рекомендаций по этому значению вы можете обратиться в команду ClickPipes.

:::

## Что дальше? {#whats-next}

Теперь вы можете [создать ваш ClickPipe](../index.md) и начать прием данных из вашего инстанса Postgres в ClickHouse Cloud. Не забудьте записать данные подключения, которые вы использовали при настройке вашего инстанса Postgres, так как они понадобятся вам во время процесса создания ClickPipe.
