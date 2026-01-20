---
slug: /cloud/managed-postgres/extensions
sidebar_label: 'Расширения'
title: 'Расширения PostgreSQL'
description: 'Доступные расширения PostgreSQL в ClickHouse Managed Postgres'
keywords: ['расширения postgres', 'postgis', 'pgvector', 'pg_cron', 'расширения postgresql']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

Управляемый Postgres включает отобранный набор расширений, позволяющих расширить возможности вашей базы данных. Ниже приведен список доступных расширений и их версий.


## Установка расширений \{#installing-extensions\}

Чтобы установить расширение, подключитесь к своей базе данных и выполните:

```sql
CREATE EXTENSION extension_name;
```

Чтобы увидеть, какие расширения установлены сейчас:

```sql
SELECT * FROM pg_extension;
```

Чтобы просмотреть список всех доступных расширений и их версий:

```sql
SELECT * FROM pg_available_extensions;
```


## Доступные расширения \{#available-extensions\}

| Расширение | Версия | Описание |
|-----------|---------|-------------|
| `h3` | 4.2.3 | Привязки H3 для PostgreSQL |
| `h3_postgis` | 4.2.3 | Интеграция H3 с PostGIS |
| `hll` | 2.19 | Тип для хранения данных HyperLogLog |
| `hypopg` | 1.4.2 | Гипотетические индексы для PostgreSQL |
| `ip4r` | 2.4 | Типы индексов диапазонов для IPv4 и IPv6 |
| `mysql_fdw` | 1.2 | Обёртка внешних данных для выполнения запросов к серверу MySQL |
| `orafce` | 4.16 | Функции и операторы, эмулирующие подмножество функций и пакетов из Oracle RDBMS |
| `pg_clickhouse` | 0.1 | Интерфейсы для выполнения запросов к базам данных ClickHouse из PostgreSQL |
| `pg_cron` | 1.6 | Планировщик заданий для PostgreSQL |
| `pg_hint_plan` | 1.8.0 | Подсказки оптимизатору для PostgreSQL |
| `pg_ivm` | 1.13 | Инкрементальное обслуживание представлений в PostgreSQL |
| `pg_partman` | 5.3.1 | Расширение для управления секционированными таблицами по времени или ID |
| `pg_repack` | 1.5.3 | Реорганизация таблиц в базах данных PostgreSQL с минимальными блокировками |
| `pg_similarity` | 1.0 | Поддержка запросов по схожести |
| `pgaudit` | 18.0 | Обеспечивает функциональность аудита |
| `pglogical` | 2.4.6 | Логическая репликация PostgreSQL |
| `pgrouting` | 4.0.0 | Расширение pgRouting |
| `pgtap` | 1.3.4 | Модульное тестирование для PostgreSQL |
| `plpgsql_check` | 2.8 | Расширенная проверка функций plpgsql |
| `postgis` | 3.6.1 | Пространственные типы и функции геометрии и географии PostGIS |
| `postgis_raster` | 3.6.1 | Растровые типы и функции PostGIS |
| `postgis_sfcgal` | 3.6.1 | Функции PostGIS SFCGAL |
| `postgis_tiger_geocoder` | 3.6.1 | Прямой и обратный геокодер PostGIS tiger |
| `postgis_topology` | 3.6.1 | Пространственные типы и функции топологии PostGIS |
| `address_standardizer` | 3.6.1 | Используется для разбора адреса на составные элементы. Обычно применяется на этапе нормализации адреса при геокодировании. |
| `address_standardizer_data_us` | 3.6.1 | Пример набора данных Address Standardizer US |
| `prefix` | 1.2.0 | Модуль Prefix Range для PostgreSQL |
| `semver` | 0.41.0 | Тип данных семантического версионирования |
| `unit` | 7 | Расширение для работы с единицами СИ |
| `vector` | 0.8.1 | Векторный тип данных и методы доступа ivfflat и hnsw |

## Расширение pg_clickhouse \{#pg-clickhouse\}

Расширение `pg_clickhouse` предустановлено на каждом управляемом экземпляре Postgres. Оно позволяет выполнять запросы к базам данных ClickHouse непосредственно из PostgreSQL, обеспечивая единый слой запросов как для транзакций, так и для аналитики.

Подробные инструкции по настройке и использованию см. в [документации по pg_clickhouse](/integrations/pg_clickhouse).