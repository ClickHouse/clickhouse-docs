---
slug: /cloud/managed-postgres/migrations/pg_dump-pg_restore
sidebar_label: 'pg_dump и pg_restore'
title: 'Миграция данных PostgreSQL с помощью pg_dump и pg_restore'
description: 'Узнайте, как перенести данные PostgreSQL в ClickHouse Managed Postgres с помощью pg_dump и pg_restore'
keywords: ['postgres', 'postgresql', 'pg_dump', 'pg_restore', 'миграция', 'передача данных', 'Managed Postgres']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import createPgForMigrate from '@site/static/images/managed-postgres/pg_dump_restore/create-pg-for-migration.png';
import sourceSetup from '@site/static/images/managed-postgres/pg_dump_restore/source-setup.png';
import dumpCommand from '@site/static/images/managed-postgres/pg_dump_restore/dump-command.png';
import restoreCommand from '@site/static/images/managed-postgres/pg_dump_restore/restore-command.png';
import targetSetup from '@site/static/images/managed-postgres/pg_dump_restore/target-setup.png';


# Миграция в Managed Postgres с использованием pg_dump и pg_restore \{#pg-dump-pg-restore\}

В этом руководстве приводятся пошаговые инструкции по переносу вашей базы данных PostgreSQL в ClickHouse Managed Postgres с использованием утилит `pg_dump` и `pg_restore`.

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="pg_dump-pg_restore" />

## Предварительные требования \{#migration-pgdump-pg-restore-prerequisites\}

- Доступ к исходной базе данных PostgreSQL.
- `pg_dump` и `pg_restore`, установленные на вашем локальном компьютере. Как правило, они входят в стандартную установку PostgreSQL. Если нет, вы можете скачать их с [официального сайта PostgreSQL](https://www.postgresql.org/download/).

## Настройка \{#migration-pgdump-pg-restore-setup\}

Чтобы пройти все шаги, будем использовать пример базы данных RDS Postgres в качестве исходной базы данных. Что-то вроде этого:

<Image img={sourceSetup} alt="Схема исходной базы данных PostgreSQL" size="xl" border />

Вот с чем мы работаем:

- Две таблицы — `events` и `users`. `events` содержит миллион строк, а `users` — тысячу строк.
- У `events` есть индекс.
- Представление поверх таблицы `events`.
- Пара последовательностей

## Создайте дамп исходной базы данных \{#migration-pgdump-pg-restore-dump\}

Теперь давайте используем `pg_dump`, чтобы создать файл дампа вышеописанных объектов. Это простая команда:

```shell
pg_dump \
  -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
  --format directory \
  -f rds-dump
```

Здесь:

* Замените `<user>`, `<password>`, `<host>`, `<port>` и `<database>` на параметры подключения к вашей исходной базе данных. Большинство провайдеров Postgres предоставляют строку подключения, которую можно использовать напрямую.
* `--format directory` указывает, что нам нужен дамп в формате каталога, который подходит для `pg_restore`.
* `-f rds-dump` задает выходной каталог для файлов дампа. Обратите внимание, что этот каталог будет создан автоматически и не должен существовать заранее.
* Вы также можете распараллелить процесс создания дампа, добавив флаг `--jobs`, за которым следует количество параллельных заданий, которые вы хотите запустить. Для получения дополнительной информации обратитесь к [документации по pg&#95;dump](https://www.postgresql.org/docs/current/app-pgdump.html).

:::tip
Вы можете один раз выполнить этот процесс, чтобы оценить, сколько времени он займет и каков будет размер файла дампа.
:::

Ниже показано, как выглядит выполнение этой команды:

<Image img={dumpCommand} alt="Выполнение команды pg_dump" size="xl" border />


## Перенесите дамп в ClickHouse Managed Postgres \{#migration-pgdump-pg-restore-restore\}

Теперь, когда у нас есть файл с дампом, мы можем восстановить его в наш экземпляр ClickHouse Managed Postgres с помощью утилиты `pg_restore`. 

### Создайте экземпляр Managed Postgres \{#migration-pgdump-pg-restore-create-pg\}

Сначала убедитесь, что у вас настроен экземпляр Managed Postgres, желательно в том же регионе, что и источник. Вы можете воспользоваться кратким руководством [здесь](../quickstart#create-postgres-database). Вот что мы развернём для этого руководства:

<Image img={createPgForMigrate} alt="Создание экземпляра ClickHouse Managed Postgres" size="md" border />

### Восстановление дампа \{#migration-pgdump-pg-restore-restore-dump\}

Теперь, вернувшись на наш локальный компьютер, мы можем использовать команду `pg_restore`, чтобы восстановить дамп в наш управляемый экземпляр Postgres:

```shell
pg_restore \
  -d 'postgresql://<user>:<password>@<pg_clickhouse_host>:5432/<database>' \
  --verbose \
  rds-dump
```

Вы можете получить строку подключения для экземпляра Managed Postgres в консоли ClickHouse Cloud; это очень просто, как показано [здесь](../connection).

Здесь также есть несколько флагов, на которые стоит обратить внимание:

* `--verbose` обеспечивает детализированный вывод в ходе процесса восстановления.
* Вы также можете использовать флаг `--jobs`, чтобы распараллелить процесс восстановления. Для получения дополнительных сведений обратитесь к [документации по pg&#95;restore](https://www.postgresql.org/docs/current/app-pgrestore.html).

В нашем случае это выглядит так:

<Image img={restoreCommand} alt="Выполнение команды pg_restore" size="xl" border />


## Проверка миграции \{#migration-pgdump-pg-restore-verify\}

После завершения процесса восстановления вы можете подключиться к своему экземпляру Managed Postgres и убедиться, что все ваши данные и объекты были успешно перенесены. Для подключения и выполнения запросов вы можете использовать любой PostgreSQL-клиент.
Вот как выглядит наш Managed Postgres после миграции:

<Image img={targetSetup} alt="Конфигурация целевой базы данных Managed Postgres" size="xl" border />

Мы видим, что у нас сохранены все таблицы, индексы, представления и последовательности, а также совпадает количество записей.

## Соображения \{#migration-pgdump-pg-restore-considerations\}

- Убедитесь, что версии PostgreSQL для исходной и целевой баз данных совместимы.
Использование версии pg_dump, более старой, чем версия исходного сервера, может привести к отсутствию некоторых функций или проблемам при восстановлении. В идеале используйте ту же или более новую мажорную версию pg_dump, чем у исходной базы данных.
- Создание дампа и восстановление больших баз данных может занять значительное время.
Планируйте это заранее, чтобы минимизировать простой, и по возможности рассмотрите использование параллельных операций дампа и восстановления (--jobs), если они поддерживаются.
- Обратите внимание, что pg_dump / pg_restore не реплицируют все объекты, связанные с базой данных, и рабочее состояние сервера.
К ним относятся роли и членство в ролях, слоты репликации (replication slots), конфигурация на уровне сервера (например, postgresql.conf, pg_hba.conf), табличные пространства и статистика выполнения (runtime statistics).

## Дальнейшие шаги \{#migration-pgdump-pg-restore-next-steps\}

Поздравляем! Вы успешно мигрировали свою базу данных PostgreSQL в ClickHouse Managed Postgres с помощью pg_dump и pg_restore. Теперь вы готовы изучать возможности Managed Postgres и его интеграцию с ClickHouse. Ниже приведено краткое руководство на 10 минут, которое поможет вам начать работу:

- [Краткое руководство по Managed Postgres](../quickstart)