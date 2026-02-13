---
slug: /cloud/managed-postgres/migrations/logical-replication
sidebar_label: 'Логическая репликация'
title: 'Миграция данных PostgreSQL с использованием логической репликации'
description: 'Узнайте, как выполнить миграцию данных PostgreSQL в ClickHouse Managed Postgres с помощью логической репликации'
keywords: ['postgres', 'postgresql', 'логическая репликация', 'миграция', 'передача данных', 'managed postgres']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import createPgForMigrate from '@site/static/images/managed-postgres/pg_dump_restore/create-pg-for-migration.png';
import sourceReplicationSetup from '@site/static/images/managed-postgres/logical_replication/source-setup.png';
import targetInitialSetup from '@site/static/images/managed-postgres/logical_replication/target-initial-setup.png';
import migrationResult from '@site/static/images/managed-postgres/logical_replication/migration-result.png';
import sourceSetup from '@site/static/images/managed-postgres/pg_dump_restore/source-setup.png';


# Переход на Managed Postgres с использованием логической репликации \{#logical-replication-migration\}

В этом руководстве приведены пошаговые инструкции по переносу вашей базы данных PostgreSQL на ClickHouse Managed Postgres с использованием встроенной в Postgres логической репликации.

<PrivatePreviewBadge />

## Предварительные требования \{#migration-logical-replication-prerequisites\}

* Доступ к исходной базе данных PostgreSQL.
* `psql`, `pg_dump` и `pg_restore`, установленные на вашей локальной машине. Они нужны для создания пустых таблиц в целевой базе данных. Обычно эти утилиты входят в дистрибутив PostgreSQL. Если их нет, вы можете скачать их с [официального сайта PostgreSQL](https://www.postgresql.org/download/).
* Ваша исходная база данных должна быть доступна из ClickHouse Managed Postgres. Убедитесь, что необходимые правила брандмауэра или настройки групп безопасности позволяют такое подключение. Вы можете получить egress IP вашего экземпляра Managed Postgres, выполнив:

```shell
dig +short <your-managed-postgres-hostname>
```


## Настройка \{#migration-logical-replication-setup\}

Чтобы логическая репликация работала, необходимо правильно настроить исходную базу данных. Основные требования:

- В исходной базе данных параметр `wal_level` должен быть установлен в значение `logical`.
- В исходной базе данных параметр `max_replication_slots` должен быть установлен как минимум в `1`.
- Для RDS (который используется в этом руководстве в качестве примера) необходимо убедиться, что в группе параметров значение `rds.logical_replication` установлено в `1`.
- Пользователь исходной базы данных должен иметь привилегию `REPLICATION`. В случае RDS вам нужно выполнить:
    ```sql
    GRANT rds_replication TO <your-username>;
    ```
- Роль, которую вы используете для целевой базы данных, должна иметь права на запись на объекты целевой базы данных:
    ```sql
    GRANT USAGE ON SCHEMA <schema_i> TO subscriber_user;
    GRANT CREATE ON DATABASE destination_db TO subscriber_user;
    GRANT pg_create_subscription TO subscriber_user;

    -- Предоставление прав на таблицы
    GRANT INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA <schema_i> TO subscriber_user;
    ```

Убедитесь, что исходная база данных настроена следующим образом:

<Image img={sourceReplicationSetup} alt="Настройка репликации исходной базы данных PostgreSQL" size="md" border />

## Дамп только схемы исходной базы данных \{#migration-logical-replication-schema-dump\}

Перед настройкой логической репликации необходимо создать схему в целевой базе данных ClickHouse Managed Postgres. Мы можем сделать это, создав дамп только схемы исходной базы данных с помощью утилиты `pg_dump`:

```shell
pg_dump \
    -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
    -s \
    --format directory \
    -f rds-dump
```

Здесь:

* Замените `<user>`, `<password>`, `<host>`, `<port>` и `<database>` на учетные данные вашей исходной базы данных.
* `-s` указывает, что нам нужен дамп только схемы.
* `--format directory` указывает, что нам нужен дамп в формате каталога, совместимом с `pg_restore`.
* `-f rds-dump` указывает выходной каталог для файлов дампа. Обратите внимание, что этот каталог будет создан автоматически и не должен существовать заранее.

В нашем случае у нас есть две таблицы — `events` и `users`. В `events` миллион строк, а в `users` — тысяча строк.

<Image img={sourceSetup} alt="Исходная схема таблиц PostgreSQL" size="xl" border />


### Создайте экземпляр Managed Postgres \{#migration-pgdump-pg-restore-create-pg\}

Сначала убедитесь, что у вас развернут экземпляр Managed Postgres, желательно в том же регионе, что и источник. Вы можете следовать краткому руководству [здесь](../quickstart#create-postgres-database). Вот что мы развернём в рамках этого руководства:

<Image img={createPgForMigrate} alt="Создание экземпляра ClickHouse Managed Postgres" size="md" border />

## Восстановление схемы в ClickHouse Managed Postgres \{#migration-logical-replication-restore-schema\}

Теперь, когда у нас есть дамп схемы, мы можем восстановить его в экземпляре ClickHouse Managed Postgres с помощью `pg_restore`:

```shell
pg_restore \
    -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
    --verbose \
    rds-dump
```

Здесь:

* Замените `<user>`, `<password>`, `<host>`, `<port>` и `<database>` на учетные данные целевой базы данных ClickHouse Managed Postgres.
* `--verbose` обеспечивает подробный вывод во время процесса восстановления.
  Эта команда создаст все таблицы, индексы, представления и другие объекты схемы в целевой базе данных, но без каких‑либо данных.

В нашем случае после выполнения этой команды у нас есть две таблицы, и обе пустые:

<Image img={targetInitialSetup} alt="Начальная настройка целевой ClickHouse Managed Postgres" size="xl" border />


## Настройка логической репликации \{#migration-logical-replication-setup-replication\}

После того как схема подготовлена, можно настроить логическую репликацию из исходной базы данных в целевую базу данных ClickHouse Managed Postgres. Для этого необходимо создать публикацию на исходной базе данных и подписку на целевой базе данных.

### Создайте публикацию в исходной базе данных \{#migration-logical-replication-create-publication\}

Подключитесь к исходной базе данных PostgreSQL и создайте публикацию, которая включает таблицы, которые нужно реплицировать.

```sql
CREATE PUBLICATION <pub_name> FOR TABLE table1, table2...;
```

:::info
Создание публикации с параметром FOR ALL TABLES может привести к дополнительным сетевым издержкам, если в базе много таблиц. Рекомендуется указывать только те таблицы, которые вы хотите реплицировать.
:::


### Создайте подписку в целевой базе данных ClickHouse Managed Postgres \{#migration-logical-replication-create-subscription\}

Затем подключитесь к целевой базе данных ClickHouse Managed Postgres и создайте подписку на публикацию в исходной базе данных.

```sql
CREATE SUBSCRIPTION demo_rds_subscription
CONNECTION 'postgresql://<user>:<password>@<host>:<port>/<database>'
PUBLICATION <pub_name_you_entered_above>;
```

Это автоматически создаст слот репликации в исходной базе данных и запустит репликацию данных из указанных таблиц в целевую базу данных. В зависимости от объёма данных этот процесс может занять некоторое время.

В нашем случае после настройки подписки данные начали поступать:

<Image img={migrationResult} alt="Результат миграции после логической репликации" size="xl" border />

Новые строки, добавленные в исходную базу данных, теперь будут реплицироваться в целевую базу данных ClickHouse Managed Postgres практически в режиме реального времени.


## Ограничения и соображения \{#migration-logical-replication-caveats\}

- Логическая репликация передаёт только изменения данных (INSERT, UPDATE, DELETE). Изменения схемы (например, ALTER TABLE) необходимо обрабатывать отдельно.
- Убедитесь, что сетевое соединение между исходной и целевой базами данных стабильно, чтобы избежать прерываний репликации.
- Отслеживайте задержку репликации, чтобы гарантировать, что целевая база данных не отстаёт от исходной. Установка подходящего значения параметра `max_slot_wal_keep_size` на исходной базе данных может помочь управлять ростом слота репликации и предотвратить чрезмерное потребление дискового пространства.
- В зависимости от сценария использования имеет смысл настроить мониторинг и оповещения для процесса репликации.

## Следующие шаги \{#migration-pgdump-pg-restore-next-steps\}

Поздравляем! Вы успешно перенесли базу данных PostgreSQL в ClickHouse Managed Postgres с помощью pg_dump и pg_restore. Теперь вы готовы исследовать возможности Managed Postgres и его интеграцию с ClickHouse. Вот 10‑минутное краткое руководство, которое поможет вам начать:

- [Краткое руководство по Managed Postgres](../quickstart)