---
'sidebar_label': 'Общее Postgres'
'description': 'Настройте любой экземпляр Postgres в качестве источника для ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/generic'
'title': 'Общее руководство по настройке источника Postgres'
'doc_type': 'guide'
---


# Руководство по настройке источника Generic Postgres

:::info

Если вы используете одного из поддерживаемых провайдеров (в боковом меню), пожалуйста, обратитесь к конкретному руководству для этого провайдера.

:::

ClickPipes поддерживает версии Postgres 12 и выше.

## Включение логической репликации {#enable-logical-replication}

1. Чтобы включить репликацию на вашей инстанции Postgres, необходимо убедиться, что следующие параметры установлены:

```sql
wal_level = logical
```
   Чтобы проверить это, вы можете выполнить следующую SQL-команду:
```sql
SHOW wal_level;
```

   Результат должен быть `logical`. Если нет, выполните:
```sql
ALTER SYSTEM SET wal_level = logical;
```

2. Кроме того, рекомендуется установить следующие параметры на инстанции Postgres:
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

3. Если вы внесли какие-либо изменения в конфигурацию, как упомянуто выше, вам НЕОБХОДИМО ПЕРЕЗАГРУЗИТЬ инстанцию Postgres, чтобы изменения вступили в силу.

## Создание пользователя с разрешениями и публикацией {#creating-a-user-with-permissions-and-publication}

Давайте создадим нового пользователя для ClickPipes с необходимыми разрешениями, подходящими для CDC, и также создадим публикацию, которую мы будем использовать для репликации.

Для этого вы можете подключиться к вашей инстанции Postgres и выполнить следующие SQL-команды:
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;

-- Create a publication. We will use this when creating the pipe
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

:::note

Убедитесь, что вы заменили `clickpipes_user` и `clickpipes_password` на желаемое имя пользователя и пароль.

:::

## Включение подключений в pg_hba.conf для пользователя ClickPipes {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

Если вы обслуживаете систему самостоятельно, вам необходимо разрешить подключения для пользователя ClickPipes с IP-адресов ClickPipes, выполнив следующие шаги. Если вы используете управляемый сервис, вы можете сделать то же самое, следуя документации провайдера.

1. Внесите необходимые изменения в файл `pg_hba.conf`, чтобы разрешить подключения к пользователю ClickPipes с IP-адресов ClickPipes. Пример записи в файле `pg_hba.conf` может выглядеть так:
```response
host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
```

2. Перезагрузите инстанцию PostgreSQL, чтобы изменения вступили в силу:
```sql
SELECT pg_reload_conf();
```

## Увеличение `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

Это рекомендуемое изменение конфигурации, чтобы гарантировать, что большие транзакции/коммиты не приведут к удалению слота репликации.

Вы можете увеличить параметр `max_slot_wal_keep_size` для вашей инстанции PostgreSQL до более высокого значения (не менее 100 ГБ или `102400`), обновив файл `postgresql.conf`.

```sql
max_slot_wal_keep_size = 102400
```

Вы можете перезагрузить инстанцию Postgres, чтобы изменения вступили в силу:
```sql
SELECT pg_reload_conf();
```

:::note

Для лучшей рекомендации по этому значению вы можете обратиться к команде ClickPipes.

:::

## Что дальше? {#whats-next}

Теперь вы можете [создать ваш ClickPipe](../index.md) и начать прием данных из вашей инстанции Postgres в ClickHouse Cloud.
Не забудьте записать данные подключения, которые вы использовали при настройке вашей инстанции Postgres, так как они понадобятся вам в процессе создания ClickPipe.
