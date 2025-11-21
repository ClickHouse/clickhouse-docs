---
sidebar_label: 'Произвольный Postgres'
description: 'Настройка любого экземпляра Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/generic
title: 'Руководство по настройке произвольного источника Postgres'
doc_type: 'guide'
keywords: ['postgres', 'clickpipes', 'logical replication', 'pg_hba.conf', 'wal level']
---



# Общие инструкции по настройке источника данных Postgres

:::info

Если вы используете одного из поддерживаемых провайдеров (в боковой панели), обратитесь к соответствующему руководству для этого провайдера.

:::

ClickPipes поддерживает Postgres версии 12 и новее.



## Включение логической репликации {#enable-logical-replication}

1. Для включения репликации в экземпляре Postgres необходимо убедиться, что установлены следующие параметры:

   ```sql
   wal_level = logical
   ```

   Для проверки выполните следующую SQL-команду:

   ```sql
   SHOW wal_level;
   ```

   Результат должен быть `logical`. Если это не так, выполните:

   ```sql
   ALTER SYSTEM SET wal_level = logical;
   ```

2. Кроме того, рекомендуется установить в экземпляре Postgres следующие параметры:

   ```sql
   max_wal_senders > 1
   max_replication_slots >= 4
   ```

   Для проверки выполните следующие SQL-команды:

   ```sql
   SHOW max_wal_senders;
   SHOW max_replication_slots;
   ```

   Если значения не соответствуют рекомендуемым, выполните следующие SQL-команды для их установки:

   ```sql
   ALTER SYSTEM SET max_wal_senders = 10;
   ALTER SYSTEM SET max_replication_slots = 10;
   ```

3. Если вы внесли какие-либо изменения в конфигурацию, как указано выше, НЕОБХОДИМО ПЕРЕЗАПУСТИТЬ экземпляр Postgres, чтобы изменения вступили в силу.


## Создание пользователя с правами доступа и публикацией {#creating-a-user-with-permissions-and-publication}

Создадим нового пользователя для ClickPipes с необходимыми правами доступа, подходящими для CDC,
а также создадим публикацию, которую будем использовать для репликации.

Для этого подключитесь к вашему экземпляру Postgres и выполните следующие SQL-команды:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Предоставляем пользователю права на репликацию
  ALTER USER clickpipes_user REPLICATION;

-- Создаём публикацию. Она будет использоваться при создании канала
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

:::note

Обязательно замените `clickpipes_user` и `clickpipes_password` на желаемые имя пользователя и пароль.

:::


## Включение подключений в pg_hba.conf для пользователя ClickPipes {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

Если вы используете самостоятельное развёртывание, необходимо разрешить подключения к пользователю ClickPipes с IP-адресов ClickPipes, выполнив следующие шаги. Если вы используете управляемый сервис, вы можете сделать то же самое, следуя документации поставщика услуг.

1. Внесите необходимые изменения в файл `pg_hba.conf`, чтобы разрешить подключения к пользователю ClickPipes с IP-адресов ClickPipes. Пример записи в файле `pg_hba.conf` будет выглядеть следующим образом:

   ```response
   host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
   ```

2. Перезагрузите экземпляр PostgreSQL, чтобы изменения вступили в силу:
   ```sql
   SELECT pg_reload_conf();
   ```


## Увеличение `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

Это рекомендуемое изменение конфигурации, которое гарантирует, что большие транзакции/коммиты не приведут к удалению слота репликации.

Вы можете увеличить значение параметра `max_slot_wal_keep_size` для вашего экземпляра PostgreSQL до более высокого значения (минимум 100 ГБ или `102400`), обновив файл `postgresql.conf`.

```sql
max_slot_wal_keep_size = 102400
```

Вы можете перезагрузить экземпляр Postgres, чтобы изменения вступили в силу:

```sql
SELECT pg_reload_conf();
```

:::note

Для получения более точных рекомендаций по этому значению обратитесь к команде ClickPipes.

:::


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать загружать данные из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся при создании ClickPipe.
