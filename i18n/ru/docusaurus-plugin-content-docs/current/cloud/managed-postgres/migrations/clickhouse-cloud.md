---
slug: /cloud/managed-postgres/migrations/clickhouse-cloud
sidebar_label: 'ClickHouse Cloud'
title: 'Миграция данных PostgreSQL с помощью Data sources в ClickHouse Cloud'
description: 'Узнайте, как перенести базу данных PostgreSQL в ClickHouse Managed Postgres с помощью встроенного мастера импорта в разделе Data sources в ClickHouse Cloud.'
keywords: ['postgres', 'postgresql', 'логическая репликация', 'миграция', 'перенос данных', 'managed postgres', 'data sources', 'импорт']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import advancedSettings from '@site/static/images/managed-postgres/pgpg/advancedsettings.png';
import alterRole from '@site/static/images/managed-postgres/pgpg/alterrole.png';
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

# Миграция на Managed Postgres с помощью ClickHouse Cloud \{#migrate-managed-postgres\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migration-guide-clickhouse-cloud" />

В ClickHouse Cloud есть встроенный мастер импорта, который переносит вашу внешнюю базу данных PostgreSQL в сервис Managed Postgres. Мастер в рамках пяти пошаговых этапов выполняет подключение к источнику, экспорт и импорт схема, настройку репликации и выбор таблиц.

## Предварительные требования \{#prerequisites\}

* Доступ к исходной базе данных PostgreSQL под пользователем, у которого есть права на репликацию.
* Сервис ClickHouse Managed Postgres в качестве целевой среды для миграции. Если у вас его ещё нет, см. [краткое руководство](../quickstart).
* `pg_dump` и `psql`, установленные на локальной машине. Оба входят в стандартный набор клиентских инструментов PostgreSQL.

## Что нужно учесть перед миграцией \{#considerations\}

* **Распространение DDL**: непрерывная репликация (CDC) фиксирует операции DML и `ADD COLUMN`. Другие изменения DDL, такие как `DROP COLUMN` и `ALTER COLUMN`, не распространяются и должны применяться вручную на целевой стороне.
* **Ограничения внешних ключей**: чтобы проверки внешних ключей не блокировали ингестию, вы временно установите `session_replication_role = replica` для целевой роли. Это рассматривается ниже, в шаге 3.

## Шаг 1: Подключитесь к исходной базе данных \{#step-1-connect\}

Откройте [консоль ClickHouse Cloud](https://clickhouse.cloud) и выберите свой сервис Managed Postgres.

<Image img={serviceCard} alt="Карточка сервиса Managed Postgres в списке сервисов ClickHouse Cloud" size="lg" border />

На левой боковой панели нажмите **Data sources**.

<Image img={overview} alt="Пункт Data sources на боковой панели сервиса Managed Postgres" size="lg" border />

Нажмите **Start import**.

<Image img={startImport} alt="Страница Data sources с кнопкой Start import" size="lg" border />

Заполните данные для подключения к исходной базе данных PostgreSQL: хост, порт, имя пользователя, пароль и имя базы данных. Включите **TLS**, если это требуется для вашего источника.

Если вам требуется частное подключение к исходной базе данных, вы можете использовать **SSH tunneling** и указать необходимые SSH-параметры. Это позволит миграции безопасно подключаться к базам данных, недоступным из публичной сети.

Выберите метод ингестии:

* **Initial load + CDC** — копирует существующие данные, а затем поддерживает синхронизацию целевой системы с последующими изменениями.
* **Initial load only** — однократное копирование без дальнейшей репликации.
* **CDC only** — пропускает начальное копирование и реплицирует только новые изменения, начиная с этого момента.

<Image img={migrationForm} alt="Шаг 1: форма подключения к исходной базе данных с настройками метода ингестии" size="lg" border />

Нажмите **Next**.

## Шаг 2: Экспортируйте схема базы данных \{#step-2-export-schema\}

Мастер показывает команду `pg_dump`, уже заполненную данными подключения к исходной базе данных. Выполните её в терминале:

<Image img={nextExport} alt="Шаг 2: команда pg_dump для экспорта схема" size="lg" border />

```shell
pg_dump \
  -h <source_host> \
  -U <source_user> \
  -d <source_database> \
  --schema-only \
  -f pg.sql
```

В текущем каталоге будет создан файл `pg.sql`.

<Image img={psqlExport} alt="Вывод в терминале после выполнения pg_dump" size="lg" border />

Нажмите **Next**.

## Шаг 3: Импортируйте схема в сервис Managed Postgres \{#step-3-import-schema\}

Выберите целевую базу данных в раскрывающемся списке или нажмите **Создать новую базу данных**, чтобы создать её.

Мастер отобразит команду `psql` для применения дампа схема к сервису Managed Postgres. Запустите её в терминале:

<Image img={nextImport} alt="Шаг 3: команда psql для импорта схема" size="lg" border />

```shell
psql \
  -h <target_host> \
  -p 5432 \
  -U <target_user> \
  -d <target_database> \
  -f pg.sql
```

<Image img={psqlImport} alt="Вывод в терминале после импорта схемы с помощью psql" size="lg" border />

После применения схемы задайте для целевой роли значение `replica` параметра `session_replication_role`, чтобы ограничения внешних ключей не блокировали ингестию:

```sql
ALTER ROLE <target_role> SET session_replication_role TO 'replica';
```

<Image img={alterRole} alt="Команда ALTER ROLE, устанавливающая для session_replication_role значение replica" size="lg" border />

Нажмите **Next**.

## Шаг 4: Настройте параметры ингестии \{#step-4-ingestion-settings\}

Укажите публикацию, которую нужно использовать для логической репликации. Если оставить это поле пустым, публикация будет создана автоматически.

Разверните **дополнительные параметры репликации**, чтобы настроить производительность:

| Параметр                                             | По умолчанию | Описание                                                     |
| ---------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| Интервал синхронизации (в секундах)                  | 10           | Как часто опрашивается слот репликации                       |
| Параллельные потоки для начальной загрузки           | 4            | Количество потоков на этапе пакетной загрузки                |
| Размер пакета извлечения                             | 100,000      | Количество строк, извлекаемых за один пакет репликации       |
| Количество строк в снимке на партицию                | 100000       | Размер партиции для снимков больших таблиц                   |
| Количество таблиц для параллельного создания снимков | 1            | Количество таблиц, для которых снимки создаются одновременно |

<Image img={advancedSettings} alt="Шаг 4: форма параметров ингестии с публикацией и дополнительными параметрами репликации" size="lg" border />

Нажмите **Next**.

## Шаг 5: Выберите таблицы \{#step-5-select-tables\}

Выберите таблицы, которые хотите реплицировать. Таблицы сгруппированы по схема. Выберите отдельные таблицы или разверните схема, чтобы выбрать все таблицы в ней.

<Image img={tablePicker} alt="Шаг 5: средство выбора таблиц, сгруппированных по схема, с кнопкой &#x22;Создать миграцию&#x22;" size="lg" border />

Нажмите **Создать миграцию**.

## Отслеживание миграции \{#monitor\}

После создания миграции вы увидите её в списке **Data sources** со статусом **Running**.

<Image img={migrationList} alt="Список Data sources с миграцией в статусе Running" size="lg" border />

Нажмите на миграцию, чтобы открыть подробную страницу. На вкладке **Tables** отображается ход начальной загрузки для каждой таблицы, включая обработанные строки, партиции и среднее время на партицию. На вкладке **Metrics** после начала CDC отображаются задержка репликации и пропускная способность.

<Image img={initialLoad} alt="Подробная страница миграции со статистикой начальной загрузки по таблицам" size="lg" border />

## Действия после миграции \{#post-migration\}

После завершения первоначальной загрузки и, если используется CDC, когда задержка репликации близка к нулю:

**Сверьте количество строк.** Выборочно проверьте критически важные таблицы в исходной и целевой системах перед переключением трафика:

```sql
SELECT COUNT(*) FROM public.orders;
```

**Остановите запись в исходную систему.** Приостановьте запись со стороны приложения. Чтобы принудительно перевести систему в режим «только чтение» на время переключения:

```sql
ALTER DATABASE <source_db> SET default_transaction_read_only = on;
```

**Убедитесь, что репликация завершена.** Сравните последнюю строку на источнике и в целевой системе:

```sql
-- Run on both source and target
SELECT MAX(id), MAX(updated_at) FROM public.orders;
```

**Снова включите ограничения и восстановите роль репликации.** Примените все индексы, ограничения и триггеры, которые вы отложили во время импорта, затем сбросьте целевую роль:

```sql
ALTER ROLE <target_role> SET session_replication_role TO 'origin';
```

**Сбросьте последовательности.** Приведите последовательности в соответствие с текущими максимальными значениями в каждой таблице:

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

**Переключите трафик приложения.** Направьте операции чтения и записи на ваш сервис Managed Postgres и отслеживайте ошибки, нарушения ограничений целостности и состояние репликации.

**Выполните очистку.**  После переключения и подтверждения того, что новый сервис работает нормально, удалите миграцию из раздела **Data sources**. Если вы использовали CDC, удалите слот репликации в исходном источнике, чтобы освободить ресурсы:

```sql
SELECT pg_drop_replication_slot('<slot_name>');
```

## Следующие шаги \{#next-steps\}

* [Краткое руководство по Managed Postgres](../quickstart)
* [Параметры подключения к Managed Postgres](../connection)
* [FAQ по ClickPipes Postgres](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)