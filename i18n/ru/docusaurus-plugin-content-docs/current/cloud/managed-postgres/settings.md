---
slug: /cloud/managed-postgres/settings
sidebar_label: 'Настройки'
title: 'Настройки'
description: 'Настройка параметров PostgreSQL и PgBouncer и управление настройками экземпляра Managed Postgres'
keywords: ['конфигурация postgres', 'параметры postgresql', 'pgbouncer']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import postgresParameters from '@site/static/images/managed-postgres/postgres-parameters.png';
import serviceActions from '@site/static/images/managed-postgres/service-actions.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.settings-beta" />

Вы можете изменять параметры конфигурации и управлять настройками экземпляра Managed Postgres на вкладке **Настройки** в боковой панели.

## Действия с сервисом и масштабирование \{#service-actions\}

<Image img={serviceActions} alt="Service actions and scaling" size="md" border />

Панель **Service actions** предоставляет средства управления экземпляром Managed Postgres:

* **Reset password**: обновление пароля суперпользователя (только когда экземпляр находится в состоянии `Running`)
* **Restart**: перезапуск экземпляра базы данных (только когда экземпляр находится в состоянии `Running`)
* **Delete**: удаление экземпляра

Раздел **Scaling** позволяет изменять типы экземпляров для primary и standby, чтобы увеличить или уменьшить вычислительные ресурсы и объем хранилища.
Подробнее см. на [странице масштабирования](/cloud/managed-postgres/scaling).

## Изменение параметров конфигурации \{#changing-configuration\}

<Image img={postgresParameters} alt="Конфигурация параметров Postgres" size="md" border />

Чтобы изменить параметр, нажмите кнопку **Edit parameters**. Выберите параметры, которые необходимо изменить, и задайте для них соответствующие значения. После того как вы внесёте все необходимые изменения, нажмите кнопку **Save Changes**.

Все изменения, внесённые в параметры конфигурации, обычно применяются к экземпляру в течение одной минуты. Для вступления в силу некоторых параметров требуется перезапуск базы данных. Эти изменения будут применены после следующего перезапуска, который вы можете инициировать вручную на панели инструментов **Service actions**.

Обратитесь к официальной [документации](https://www.postgresql.org/docs/current/runtime-config.html) по параметрам конфигурации. Список доступных для настройки параметров вскоре будет расширен. А пока обратитесь в [службу поддержки](https://clickhouse.com/support/program), чтобы запросить параметр, который в настоящее время не поддерживается.