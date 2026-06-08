---
slug: /cloud/managed-postgres/migrations/overview
sidebar_label: 'Обзор'
title: 'Миграция данных в ClickHouse Managed Postgres'
description: 'Сравните четыре варианта миграции в ClickHouse Managed Postgres и выберите тот, который соответствует вашей исходной базе данных и требованиям к времени простоя.'
keywords: ['managed postgres', 'migration', 'postgres migration', 'clickpipes', 'peerdb', 'pg_dump', 'pg_restore', 'logical replication']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

# Миграция данных в Managed Postgres \{#managed-postgres-data-migration\}

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.migration-overview-beta" />

Перенести данные в Managed Postgres можно четырьмя разными способами. Выбор
зависит от того, нужна ли вам непрерывная репликация, из какого источника вы
переносите данные и какой простой приложение может допустить во время
переключения.

| Method                                                                                  | Непрерывная репликация (CDC) | Где выполняется                     | Лучше всего подходит для                                                       |
| --------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------- | ------------------------------------------------------------------------------ |
| [ClickPipes](/cloud/managed-postgres/migrations/clickpipes)                             | Да                           | консоль ClickHouse Cloud            | Большинства миграций — пошаговый мастер с начальной загрузкой и CDC из коробки |
| [PeerDB](/cloud/managed-postgres/migrations/peerdb)                                     | Да                           | Самостоятельное размещение (Docker) | Источников и сценариев, не поддерживаемых в интерфейсе ClickPipes              |
| [pg&#95;dump and pg&#95;restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore) | Нет                          | Ваш локальный компьютер             | Разового переноса небольших или статичных наборов данных, где допустим простой |
| [логическая репликация](/cloud/managed-postgres/migrations/logical-replication)           | Да                           | Исходный и целевой Postgres         | Прямого управления встроенной репликацией Postgres без сторонних инструментов  |

## ClickPipes \{#clickpipes\}

[ClickPipes](/cloud/managed-postgres/migrations/clickpipes) — рекомендуемый
способ для большинства миграций. Он полностью работает в консоли ClickHouse Cloud
и пошагово помогает подключиться к источнику, экспортировать и импортировать
схему, а также запустить начальную загрузку с CDC или без него. Готовые коннекторы
для источников поддерживают Amazon RDS, Aurora, Supabase, Google Cloud SQL, Azure
Flexible Server, Neon, Crunchy Bridge, TimescaleDB и любой стандартный экземпляр
Postgres.

## PeerDB \{#peerdb\}

[PeerDB](/cloud/managed-postgres/migrations/peerdb) — это инструмент для самостоятельного выполнения миграции, который запускается через Docker. Используйте его, если ваш исходный источник или рабочий процесс не подходят для мастера ClickPipes — например, когда нужно автоматизировать создание peer для множества баз данных или выполнять миграцию полностью внутри собственной сети.
PeerDB не переносит индексы, ограничения или триггеры автоматически; их нужно заново создать на целевой стороне после загрузки данных.

## pg_dump and pg_restore \{#pg-dump-pg-restore\}

[pg&#95;dump and pg&#95;restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore)
создают снимок исходной системы и восстанавливают его на целевой. Непрерывной
репликации нет, поэтому запись в исходную систему нужно остановить на время дампа
и восстановления. Это подходящий вариант для небольших или статических наборов данных, а также
для непродукционных сред, где допустимо окно обслуживания.

## Логическая репликация \{#logical-replication\}

[Логическая репликация](/cloud/managed-postgres/migrations/logical-replication)
использует встроенные механизмы публикаций и подписок Postgres для потоковой передачи изменений
из исходной базы данных в целевую. Вы самостоятельно настраиваете `wal_level`, слоты репликации и
привилегию `REPLICATION` — без каких-либо сторонних инструментов-посредников.
Выбирайте этот вариант, если вам нужен полный контроль над механизмами репликации
или если в вашей среде нельзя использовать внешние инструменты миграции.

## После миграции \{#after-migration\}

После начала переноса данных воспользуйтесь [проверкой данных](/cloud/managed-postgres/migrations/data-validation),
чтобы убедиться, что количество строк и содержимое совпадают в исходной и целевой
системах, прежде чем переключать трафик приложения. В разделе [FAQ по миграциям](/cloud/managed-postgres/migrations/faq)
описаны распространённые ошибки и действия по восстановлению.

## Миграция из Supabase \{#supabase\}

Если вы переходите с Supabase, см. [пошаговое руководство по миграции из Supabase в Managed Postgres](https://github.com/iskakaushik/supa-auth-migrate/blob/main/MIGRATION.md).