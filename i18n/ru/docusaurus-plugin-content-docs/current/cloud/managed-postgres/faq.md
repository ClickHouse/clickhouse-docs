---
slug: /cloud/managed-postgres/faq
sidebar_label: 'FAQ'
title: 'Часто задаваемые вопросы по Managed Postgres'
description: 'Часто задаваемые вопросы о ClickHouse Managed Postgres'
keywords: ['faq по managed postgres', 'вопросы по postgres', 'метрики', 'расширения', 'миграция', 'terraform']
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="faq" />


## Мониторинг и метрики \{#monitoring-and-metrics\}

### Как получить доступ к метрикам своего экземпляра Managed Postgres? \{#metrics-access\}

Вы можете отслеживать загрузку CPU, использование памяти, IOPS и хранилища непосредственно в консоли ClickHouse Cloud на вкладке **Monitoring** вашего экземпляра Managed Postgres.

:::note
Функция Query Performance Insights для детального анализа запросов появится в ближайшее время.
:::

## Резервное копирование и восстановление \{#backup-and-recovery\}

### Какие варианты резервного копирования доступны? \{#backup-options\}

Managed Postgres включает автоматические ежедневные резервные копии с непрерывным архивированием WAL, что обеспечивает возможность восстановления к определённому моменту времени (point-in-time recovery) в пределах 7‑дневного периода хранения. Резервные копии хранятся в S3.

Подробную информацию о частоте резервного копирования, сроках хранения и выполнении восстановления к определённому моменту времени см. в документации [Резервное копирование и восстановление](/cloud/managed-postgres/backup-and-restore).

## Инфраструктура и автоматизация \{#infrastructure-and-automation\}

### Доступна ли поддержка Terraform для Managed Postgres? \{#terraform-support\}

Поддержка Terraform для Managed Postgres на данный момент недоступна. Мы рекомендуем использовать консоль ClickHouse Cloud для создания и управления вашими экземплярами.

## Расширения и настройка \{#extensions-and-configuration\}

### Какие расширения поддерживаются? \{#extensions-supported\}

Managed Postgres поддерживает более 100 расширений PostgreSQL, в том числе популярные PostGIS, pgvector, pg_cron и многие другие. Полный список доступных расширений и инструкции по установке см. в разделе документации [Расширения](/cloud/managed-postgres/extensions).

### Могу ли я настраивать параметры конфигурации PostgreSQL? \{#config-customization\}

Да, вы можете изменять параметры конфигурации PostgreSQL и PgBouncer на вкладке **Settings** в консоли. Подробную информацию о доступных параметрах и способах их изменения см. в разделе [Settings](/cloud/managed-postgres/settings) документации.

:::tip
Если вам нужен параметр, который сейчас недоступен, обратитесь в [службу поддержки](https://clickhouse.com/support/program) с запросом на его добавление.
:::

## Возможности базы данных \{#database-capabilities\}

### Могу ли я создавать несколько баз данных и схем? \{#multiple-databases-schemas\}

Да. Managed Postgres предоставляет полный набор возможностей PostgreSQL, включая поддержку нескольких баз данных и схем в рамках одного экземпляра. Вы можете создавать и управлять базами данных и схемами с помощью стандартных команд PostgreSQL.

### Поддерживается ли ролевая модель управления доступом (RBAC)? \{#rbac-support\}

У вас есть полный доступ с правами суперпользователя к вашему экземпляру Managed Postgres, что позволяет создавать роли и управлять правами доступа с помощью стандартных команд PostgreSQL.

:::note
Расширенные возможности RBAC с интеграцией с консолью запланированы на этот год.
:::

## Миграция \{#migration\}

### Какие инструменты доступны для миграции на Managed Postgres? \{#migration-tools\}

Managed Postgres поддерживает несколько подходов к миграции:

- **pg_dump и pg_restore**: Для небольших баз данных или одноразовых миграций. См. руководство [pg_dump and pg_restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore).
- **Логическая репликация**: Для крупных баз данных, для которых важно минимизировать время простоя. См. руководство [Logical replication](/cloud/managed-postgres/migrations/logical-replication).
- **PeerDB**: Для репликации на основе CDC из других источников Postgres. См. руководство [PeerDB migration](/cloud/managed-postgres/migrations/peerdb).

:::note
Полностью управляемый процесс миграции будет доступен в ближайшее время.
:::