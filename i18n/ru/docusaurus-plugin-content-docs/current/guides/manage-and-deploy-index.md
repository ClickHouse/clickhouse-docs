---
title: 'Обзор управления и развертывания'
description: 'Обзорная страница по управлению и развертыванию'
slug: /guides/manage-and-deploy-index
doc_type: 'landing-page'
keywords: ['deployment', 'management', 'administration', 'operations', 'guides']
---

# Управление и развертывание

В этом разделе рассматриваются следующие темы:

| Topic                                                                                                 | Description                                                                                                                       |
|-------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| [Deployment and Scaling](/deployment-guides/index)                                                 | Практические примеры развертывания, основанные на рекомендациях, предоставляемых пользователям ClickHouse подразделением ClickHouse Support and Services. |
| [Separation of Storage and Compute](/guides/separation-storage-compute)                       | Руководство, описывающее, как использовать ClickHouse и S3 для реализации архитектуры с раздельными хранилищем и вычислительными ресурсами.                |
| [Sizing and hardware recommendations'](/guides/sizing-and-hardware-recommendations)            | Руководство с общими рекомендациями по аппаратному обеспечению, вычислительным ресурсам, памяти и конфигурациям дисков для пользователей open-source-версии.      |
| [Configuring ClickHouse Keeper](/guides/sre/keeper/clickhouse-keeper)                         | Информация и примеры по настройке ClickHouse Keeper.                                                                   |
| [Network ports](/guides/sre/network-ports)                                                    | Список сетевых портов, используемых ClickHouse.                                                                                         |
| [Re-balancing Shards](/guides/sre/scaling-clusters)                                           | Рекомендации по ребалансировке шардов.                                                                                           |
| [Does ClickHouse support multi-region replication?](/faq/operations/multi-region-replication) | FAQ по многорегиональной репликации.                                                                                                  |
| [Which ClickHouse version to use in production?](/faq/operations/production)                  | FAQ по выбору версии ClickHouse для использования в продакшене.                                                                                    |
| [Cluster Discovery](/operations/cluster-discovery)                                            | Информация и примеры по функции обнаружения кластеров в ClickHouse.                                                               |
| [Monitoring](/operations/monitoring)                                                          | Информация о том, как мониторить использование аппаратных ресурсов и серверные метрики ClickHouse.                                |
| [Tracing ClickHouse with OpenTelemetry](/operations/opentelemetry)                            | Информация об использовании OpenTelemetry с ClickHouse.                                                                               |
| [Quotas](/operations/quotas)                                                                  | Информация и примеры по квотам в ClickHouse.                                                                                 |
| [Secured Communication with Zookeeper](/operations/ssl-zookeeper)                             | Руководство по настройке защищённого взаимодействия между ClickHouse и Zookeeper.                                                       |
| [Startup Scripts](/operations/startup-scripts)                                                | Пример того, как запускать стартовые скрипты при старте сервера; полезно для миграций или автоматического создания схемы.                         |
| [External Disks for Storing Data](/operations/storing-data)                                   | Информация и примеры по настройке внешнего хранилища в ClickHouse.                                                         |
| [Allocation profiling](/operations/allocation-profiling)                                      | Информация и примеры по выборочному профилированию распределения памяти с использованием jemalloc.                                                      |
| [Backup and Restore](/operations/backup)                                                      | Руководство по резервному копированию на локальный диск или во внешнее хранилище и восстановлению данных.                                                                          |
| [Caches](/operations/caches)                                                                  | Обзор различных типов кэшей в ClickHouse.                                                                               |
| [Workload scheduling](/operations/workload-scheduling)                                        | Обзор механизмов планирования рабочих нагрузок в ClickHouse.                                                                                   |
| [Self-managed Upgrade](/operations/update)                                                    | Рекомендации по выполнению самостоятельного обновления.                                                                                |
| [Troubleshooting](/guides/troubleshooting)                                                    | Различные советы по устранению неполадок.                                                                                                    |
| [Usage Recommendations](/operations/tips)                                                     | Различные рекомендации по использованию аппаратного и программного обеспечения ClickHouse.                                                                  |
| [Distributed DDL](/sql-reference/distributed-ddl)                                             | Обзор использования предложения `ON CLUSTER`.                                                                                             |