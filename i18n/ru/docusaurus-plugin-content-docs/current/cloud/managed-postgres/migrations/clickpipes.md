---
slug: /cloud/managed-postgres/migrations/clickpipes
sidebar_label: 'ClickPipes'
title: 'Миграция данных PostgreSQL с помощью источника данных в ClickPipes'
description: 'Узнайте, как перенести базу данных PostgreSQL в ClickHouse Managed Postgres с помощью ClickPipes.'
keywords: ['postgres', 'postgresql', 'логическая репликация', 'миграция', 'ClickPipes', 'Managed Postgres', 'источник данных', 'импорт']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import advancedSettings from '@site/static/images/managed-postgres/pgpg/advancedsettings.png';
import initialLoad from '@site/static/images/managed-postgres/pgpg/initialload.png';
import migrationForm from '@site/static/images/managed-postgres/pgpg/migrationform.png';
import migrationList from '@site/static/images/managed-postgres/pgpg/migrationlist.png';
import nextExport from '@site/static/images/managed-postgres/pgpg/nextexport.png';
import nextImport from '@site/static/images/managed-postgres/pgpg/nextimport.png';
import overview from '@site/static/images/managed-postgres/pgpg/overview.png';
import psqlExport from '@site/static/images/managed-postgres/pgpg/psqlexport.png';
import psqlImport from '@site/static/images/managed-postgres/pgpg/psqlimport.png';
import serviceCard from '@site/static/images/managed-postgres/pgpg/servicecard.png';
import startImport from '@site/static/images/managed-postgres/pgpg/startimport.png';
import tablePicker from '@site/static/images/managed-postgres/pgpg/tablepicker.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.migration-guide-clickhouse-cloud-beta" />

Теперь ClickHouse Cloud предлагает ClickPipes для миграции внешней базы данных PostgreSQL в сервис Managed Postgres. Эта встроенная интеграция упрощает подключение к исходной базе данных, экспорт схемы, импорт в Managed Postgres и настройку непрерывной репликации.

## Предварительные требования \{#prerequisites\}

* Доступ к исходной базе данных PostgreSQL с пользователем, имеющим права на репликацию. Следуйте руководству по настройке для вашего источника:
  * [Amazon RDS Postgres](/integrations/clickpipes/postgres/source/rds)
  * [Amazon Aurora Postgres](/integrations/clickpipes/postgres/source/aurora)
  * [Supabase Postgres](/integrations/clickpipes/postgres/source/supabase)
  * [Google Cloud SQL Postgres](/integrations/clickpipes/postgres/source/google-cloudsql)
  * [Azure Flexible Server for Postgres](/integrations/clickpipes/postgres/source/azure-flexible-server-postgres)
  * [Neon Postgres](/integrations/clickpipes/postgres/source/neon-postgres)
  * [Crunchy Bridge Postgres](/integrations/clickpipes/postgres/source/crunchy-postgres)
  * [TimescaleDB](/integrations/clickpipes/postgres/source/timescale)
  * [Универсальный источник Postgres](/integrations/clickpipes/postgres/source/generic) для любого другого провайдера или самостоятельно размещённого экземпляра
* Сервис ClickHouse Managed Postgres в качестве цели миграции. Если у вас его ещё нет, см. [краткое руководство](../quickstart).
* На локальной машине должны быть установлены `pg_dump` и `psql`. Оба входят в стандартный набор клиентских инструментов PostgreSQL.

## Что нужно учесть перед миграцией \{#considerations\}

* **Распространение DDL**: непрерывная репликация (CDC) фиксирует операции DML и `ADD COLUMN`. Другие изменения DDL, такие как `DROP COLUMN` и `ALTER COLUMN`, не передаются и их нужно применять вручную в целевой базе данных.

:::note
Если во время миграции возникнут проблемы, проверьте [FAQ по миграциям Managed Postgres](/cloud/managed-postgres/migrations/faq) — там собраны распространённые ошибки и способы их устранения.
:::

## Шаг 1: Подключитесь к исходной базе данных \{#step-1-connect\}

Откройте [консоль ClickHouse Cloud](https://clickhouse.cloud) и выберите свой сервис Managed Postgres.

<Image img={serviceCard} alt="Карточка сервиса Managed Postgres в списке сервисов ClickHouse Cloud" size="lg" border />

На левой боковой панели нажмите **Источники данных**.

<Image img={overview} alt="Пункт Источники данных на боковой панели сервиса Managed Postgres" size="lg" border />

Нажмите **Start import**.

<Image img={startImport} alt="Страница Источники данных с кнопкой Start import" size="lg" border />

Заполните параметры подключения к исходной базе данных PostgreSQL: host, port, username, password и имя базы данных. Включите **TLS**, если это требуется для исходной базы данных.

Если вам требуется приватное подключение к исходной базе данных, вы можете выбрать **SSH tunneling** и указать необходимые параметры SSH. Это позволит миграции безопасно подключаться к базам данных, которые недоступны из публичной сети.

Выберите метод ингестии:

* **Первоначальная загрузка + CDC** — копирует существующие данные, а затем поддерживает синхронизацию целевой системы с последующими изменениями.
* **Только первоначальная загрузка** — разовое копирование без дальнейшей репликации.
* **Только CDC** — пропускает первоначальное копирование и реплицирует только новые изменения, начиная с этого момента.

<Image img={migrationForm} alt="Шаг 1: форма подключения к исходной базе данных с вариантами метода ингестии" size="lg" border />

Нажмите **Next**.

## Шаг 2: Экспортируйте схему базы данных \{#step-2-export-schema\}

Мастер покажет команду `pg_dump`, уже заполненную данными вашего исходного подключения. Выполните её в терминале:

<Image img={nextExport} alt="Шаг 2: команда pg_dump для экспорта схемы" size="lg" border />

```shell
pg_dump \
  -h <source_host> \
  -U <source_user> \
  -d <source_database> \
  --schema-only \
  -f pg.sql
```

В текущем каталоге будет создан файл `pg.sql`.

<Image img={psqlExport} alt="Вывод терминала после запуска pg_dump" size="lg" border />

Нажмите **Далее**.

## Шаг 3: Импортируйте схему в сервис Managed Postgres \{#step-3-import-schema\}

Выберите целевую базу данных в раскрывающемся списке или нажмите **Create a new database**, чтобы создать новую.

Мастер покажет команду `psql` для применения дампа схемы к сервису Managed Postgres. Выполните её в терминале:

<Image img={nextImport} alt="Шаг 3: команда psql для импорта схемы" size="lg" border />

```shell
psql \
  -h <target_host> \
  -p 5432 \
  -U <target_user> \
  -d <target_database> \
  -f pg.sql
```

<Image img={psqlImport} alt="Вывод в терминале после запуска импорта схемы из psql" size="lg" border />

Нажмите **Next**.

## Шаг 4: Настройка параметров ингестии \{#step-4-ingestion-settings\}

Укажите публикацию для логической репликации. Если оставить это поле пустым, публикация будет создана автоматически.

Разверните **Расширенные параметры репликации**, чтобы настроить пропускную способность:

| Параметр                                        | По умолчанию | Описание                                                |
| ----------------------------------------------- | ------------ | ------------------------------------------------------- |
| Интервал синхронизации (секунды)                | 10           | Как часто опрашивается слот репликации                  |
| Параллельные потоки для первоначальной загрузки | 4            | Количество потоков для этапа пакетной загрузки          |
| Размер батча при выборке                        | 100,000      | Число строк, получаемых за один батч репликации         |
| Количество строк в снимке на партицию           | 100000       | Размер партиции для снимков больших таблиц              |
| Количество таблиц в снимке параллельно          | 1            | Число таблиц, для которых одновременно создаются снимки |

<Image img={advancedSettings} alt="Шаг 4: форма настроек ингестии с публикацией и расширенными параметрами репликации" size="lg" border />

Нажмите **Next**.

## Шаг 5: Выберите таблицы \{#step-5-select-tables\}

Выберите таблицы, которые хотите реплицировать. Таблицы сгруппированы по схемам. Выберите отдельные таблицы или разверните схему, чтобы выбрать все таблицы в ней.

<Image img={tablePicker} alt="Шаг 5: выбор таблиц с группировкой по схемам и кнопкой «Создать миграцию»" size="lg" border />

Нажмите **Создать миграцию**.

## Мониторинг миграции \{#monitor\}

После создания миграции она появится в разделе **Источники данных** со статусом **Выполняется**.

<Image img={migrationList} alt="Список источников данных с выполняющейся миграцией" size="lg" border />

Нажмите на миграцию, чтобы открыть подробное представление. На вкладке **Таблицы** отображается ход первоначальной загрузки для каждой таблицы, включая количество обработанных строк, партиции и среднее время на партицию. На вкладке **Метрики** после запуска CDC отображаются задержка репликации и пропускная способность.

<Image img={initialLoad} alt="Подробное представление миграции со статистикой первоначальной загрузки по каждой таблице" size="lg" border />

## Действия после миграции \{#post-migration\}

После завершения первоначальной загрузки и, если используется CDC, когда отставание репликации близко к нулю:

**Проверьте количество строк.** Выборочно проверьте критически важные таблицы в исходной и целевой системах перед переключением трафика:

```sql
SELECT COUNT(*) FROM public.orders;
```

**Остановите запись в исходной системе.** Приостановите запись со стороны приложения. Чтобы перевести систему в режим только для чтения на время переключения:

```sql
ALTER DATABASE <source_db> SET default_transaction_read_only = on;
```

**Убедитесь, что репликация завершена.** Сравните последнюю строку в исходном и целевом экземплярах:

```sql
-- Run on both source and target
SELECT MAX(id), MAX(updated_at) FROM public.orders;
```

**Сбросьте последовательности.** Синхронизируйте последовательности с текущими максимальными значениями в каждой таблице:

```sql
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN
        SELECT
            n.nspname AS schema_name,
            c.relname AS table_name,
            a.attname AS column_name,
            pg_get_serial_sequence(format('%I.%I', n.nspname, c.relname), a.attname) AS seq_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_attribute a ON a.attrelid = c.oid
        WHERE c.relkind = 'r'
            AND a.attnum > 0
            AND NOT a.attisdropped
            AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    LOOP
        IF r.seq_name IS NOT NULL THEN
            EXECUTE format(
                'SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I.%I), 0) + 1, false)',
                r.seq_name, r.column_name, r.schema_name, r.table_name
            );
        END IF;
    END LOOP;
END $$;
```

**Переключите трафик приложения.** Перенаправьте операции чтения и записи на ваш сервис Managed Postgres и отслеживайте ошибки, нарушения ограничений и состояние репликации.

**Очистка.**  После переключения и подтверждения того, что новый сервис работает штатно, удалите миграцию из раздела **Источники данных**. Если вы использовали CDC, удалите слот репликации в исходной базе данных, чтобы освободить ресурсы:

```sql
SELECT pg_drop_replication_slot('<slot_name>');
```

## Дальнейшие шаги \{#next-steps\}

* [Краткое руководство по Managed Postgres](../quickstart)
* [Параметры подключения к Managed Postgres](../connection)
* [Часто задаваемые вопросы о ClickPipes Postgres](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)