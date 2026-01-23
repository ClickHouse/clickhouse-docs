---
slug: /cloud/managed-postgres/clickhouse-integration
sidebar_label: 'Интеграция с ClickHouse'
title: 'Интеграция с ClickHouse'
description: 'Реплицируйте данные Postgres в ClickHouse с помощью встроенных возможностей CDC (фиксации изменений данных)'
keywords: ['postgres', 'интеграция с ClickHouse', 'cdc', 'репликация', 'ClickPipes', 'синхронизация данных']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import chIntegrationIntro from '@site/static/images/managed-postgres/clickhouse-integration-intro.png';
import replicationServiceStep from '@site/static/images/managed-postgres/replication-service-step.png';
import selectTablesStep from '@site/static/images/managed-postgres/select-tables-step.png';
import integrationRunning from '@site/static/images/managed-postgres/integration-running.png';

<PrivatePreviewBadge />

Каждый экземпляр Managed Postgres поставляется со встроенными возможностями CDC для любых ваших сервисов ClickHouse. Это позволяет перенести часть или все данные из вашего экземпляра Postgres в ClickHouse и обеспечить, чтобы изменения данных в Postgres практически непрерывно и почти в режиме реального времени отражались в ClickHouse. Под капотом для этого используется [ClickPipes](/integrations/clickpipes).

Чтобы воспользоваться этой возможностью, нажмите **ClickHouse Integration** в боковой панели вашего экземпляра Postgres.

<Image img={chIntegrationIntro} alt="Целевая страница интеграции с ClickHouse, показывающая вариант интеграции в боковой панели" size="md" border />

:::note
Прежде чем продолжить, убедитесь, что ваш сервис Postgres доступен для сервиса ClickPipes. Так должно быть по умолчанию, но если вы ограничили доступ по IP, возможно, вам потребуется предоставить доступ некоторым исходным IP‑адресам из [этого](/integrations/clickpipes#list-of-static-ips) списка в зависимости от региона, где находится ваш **сервис ClickHouse**.
:::

Нажмите **Replicate data in ClickHouse**, чтобы начать настройку вашего ClickPipe.

<VerticalStepper type="numbered" headerLevel="h2">
  ## Настройка сервиса репликации \{#configure-replication-service\}

  Заполните параметры репликации:

  * **Integration name**: имя для этого ClickPipe
  * **ClickHouse service**: выберите существующий сервис ClickHouse Cloud или создайте новый
  * **Postgres database**: исходная база данных, из которой выполняется репликация
  * **Replication method**: выберите один из вариантов:
    * **Initial load + CDC**: импортировать существующие данные и поддерживать таблицы в актуальном состоянии при появлении новых изменений (рекомендуется)
    * **Initial load only**: одноразовый снимок существующих данных без последующих обновлений
    * **CDC only**: пропустить начальный снимок и фиксировать только новые изменения в дальнейшем

  <Image img={replicationServiceStep} alt="Конфигурация сервиса репликации, показывающая имя интеграции, целевой сервис и параметры метода репликации" size="md" border />

  Нажмите **Next**, чтобы продолжить.

  ## Выбор таблиц для репликации \{#select-tables\}

  Выберите целевую базу данных и укажите, какие таблицы реплицировать:

  * **Destination database**: выберите существующую базу данных ClickHouse или создайте новую
  * **Prefix default destination table names with schema name**: добавляет схему Postgres в качестве префикса, чтобы избежать конфликтов имён
  * **Preserve NULL values from source**: сохраняет значения NULL вместо преобразования их в значения по умолчанию
  * **Remove deleted rows during merges**: для таблиц [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) физически удаляет помеченные как удалённые строки во время фоновых слияний

  Разверните схемы и выберите отдельные таблицы для репликации. Вы также можете настроить имена целевых таблиц и параметры столбцов.

  <Image img={selectTablesStep} alt="Шаг выбора таблиц, показывающий выбор базы данных, параметры репликации и выбор таблиц, сгруппированных по схеме" size="md" border />

  Нажмите **Replicate data to ClickHouse**, чтобы запустить репликацию.

  ## Мониторинг вашего ClickPipe \{#monitor-clickpipe\}

  После запуска ClickPipe вы увидите его в том же меню. Начальный снимок всех данных может занять некоторое время в зависимости от размера ваших таблиц.

  <Image img={integrationRunning} alt="Список интеграций с ClickHouse, показывающий запущенный ClickPipe с его целевым сервисом и статусом" size="md" border />

  Нажмите на имя интеграции, чтобы просмотреть подробный статус, отслеживать прогресс, просматривать ошибки и управлять ClickPipe. См. раздел [Lifecycle of a Postgres ClickPipe](/integrations/clickpipes/postgres/lifecycle), чтобы понять различные состояния, в которых может находиться ваш ClickPipe.
</VerticalStepper>
