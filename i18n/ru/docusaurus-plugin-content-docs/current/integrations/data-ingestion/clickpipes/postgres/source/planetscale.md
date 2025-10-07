---
'sidebar_label': 'Planetscale для Postgres'
'description': 'Настройте PlanetScale для Postgres в качестве источника для ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/planetscale'
'title': 'PlanetScale для настройки источника Postgres'
'doc_type': 'guide'
---
import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';


# Настройка источника PlanetScale для Postgres

:::info
PlanetScale для Postgres в настоящее время находится в [раннем доступе](https://planetscale.com/postgres).
:::

## Поддерживаемые версии Postgres {#supported-postgres-versions}

ClickPipes поддерживает версии Postgres 12 и выше.

## Включение логической репликации {#enable-logical-replication}

1. Для включения репликации на вашем экземпляре Postgres необходимо убедиться, что установлены следующие настройки:

```sql
wal_level = logical
```
   Чтобы проверить это, вы можете выполнить следующую SQL-команду:
```sql
SHOW wal_level;
```

   По умолчанию вывод должен быть `logical`. Если это не так, пожалуйста, войдите в консоль PlanetScale и перейдите в `Конфигурация кластера->Параметры`, прокрутите вниз до `Write-ahead log`, чтобы изменить это.

<Image img={planetscale_wal_level_logical} alt="Регулировка wal_level в консоли PlanetScale" size="md" border/>

:::warning
Изменение этого в консоли PlanetScale ПРИВЕДЕТ к перезапуску.
:::

2. Кроме того, рекомендуется увеличить настройку `max_slot_wal_keep_size` с ее значения по умолчанию 4 ГБ. Это также делается через консоль PlanetScale, перейдя в `Конфигурация кластера->Параметры`, а затем прокрутив вниз до `Write-ahead log`. Чтобы помочь определить новое значение, пожалуйста, посмотрите [здесь](../faq#recommended-max_slot_wal_keep_size-settings).

<Image img={planetscale_max_slot_wal_keep_size} alt="Регулировка max_slot_wal_keep_size в консоли PlanetScale" size="md" border/>

## Создание пользователя с разрешениями и публикацией {#creating-a-user-with-permissions-and-publication}

Давайте создадим нового пользователя для ClickPipes с необходимыми разрешениями, подходящими для CDC, и также создадим публикацию, которую мы будем использовать для репликации.

Для этого вы можете подключиться к своему экземпляру PlanetScale Postgres, используя пользователя по умолчанию `postgres.<...>`, и выполнить следующие SQL-команды:
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
-- You may need to grant these permissions on more schemas depending on the tables you're moving
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;

-- Create a publication. We will use this when creating the pipe
-- When adding new tables to the ClickPipe, you'll need to manually add them to the publication as well. 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, <...>;
```
:::note
Не забудьте заменить `clickpipes_user` и `clickpipes_password` на желаемое имя пользователя и пароль.
:::

## Ограничения {#caveats}
1. Чтобы подключиться к PlanetScale Postgres, текущая ветка должна быть добавлена к имени пользователя, созданному выше. Например, если созданный пользователь называется `clickpipes_user`, фактическое имя пользователя, предоставленное во время создания ClickPipe, должно быть `clickpipes_user`.`branch`, где `branch` относится к "id" текущей ветки PlanetScale Postgres [ветвление](https://planetscale.com/docs/postgres/branching). Чтобы быстро определить это, вы можете обратиться к имени пользователя пользователя `postgres`, которого вы использовали для создания пользователя ранее, часть после точки будет идентификатором ветки.
2. Не используйте порт `PSBouncer` (в настоящее время `6432`) для трубопроводов CDC, подключающихся к PlanetScale Postgres, должен использоваться обычный порт `5432`. Любой порт может использоваться только для начальных трубопроводов загрузки.
3. Пожалуйста, убедитесь, что вы подключаетесь только к основному экземпляру, [подключение к репликам](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas) в настоящее время не поддерживается.

## Что делать дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать прием данных из вашего экземпляра Postgres в ClickHouse Cloud.
Не забудьте записать данные для подключения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам во время процесса создания ClickPipe.