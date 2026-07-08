---
slug: /cloud/managed-postgres/monitoring/overview
sidebar_label: 'Обзор'
title: 'Мониторинг Managed Postgres'
description: 'Обзор вариантов мониторинга и обсервабилити для ClickHouse Managed Postgres'
keywords: ['managed postgres', 'мониторинг', 'обсервабилити', 'метрики', 'панель мониторинга', 'prometheus', 'query insights', 'pg_stat_ch']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.monitoring-overview-beta" />

Вы можете отслеживать сервисы Managed Postgres следующими
способами:

| Раздел                                                                     | Описание                                                                                                            | Требуется настройка              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| [Дашборд](/cloud/managed-postgres/monitoring/dashboard)                    | Встроенные графики в облачной консоли для мониторинга использования ресурсов и активности БД                        | Не требуется                     |
| [Query Insights](/cloud/managed-postgres/monitoring/query-insights)        | Телеметрия по операторам: каждый шаблон запроса ранжируется по влиянию и сопровождается диагностическими счётчиками | Не требуется                     |
| [Конечная точка Prometheus](/cloud/managed-postgres/monitoring/prometheus) | Сбор метрик в Prometheus, Grafana, Datadog или любой коллектор с поддержкой OpenMetrics                             | API-ключ + конфигурация сборщика |
| [Справочник по метрикам](/cloud/managed-postgres/monitoring/metrics)       | Полный список метрик, доступных через конечную точку Prometheus, с типами, метками и описанием                      | Н/Д                              |

## Быстрый старт \{#quick-start\}

Откройте облачную консоль и перейдите на вкладку **Monitoring** любого
экземпляра Managed Postgres, чтобы увидеть графики в реальном времени для CPU, памяти, IOPS,
подключений, транзакций, коэффициента попаданий в кэш и взаимных блокировок. Дополнительная
настройка не требуется.

Для телеметрии по отдельным запросам — процентилей задержки, чтений из кэша и с диска,
временных выгрузок на диск, использования параллельных воркеров и объема WAL — откройте вкладку
[Query Insights](/cloud/managed-postgres/monitoring/query-insights)
на том же экземпляре. Чтобы передавать метрики уровня хоста в собственный
стек обсервабилити, используйте
[конечную точку Prometheus](/cloud/managed-postgres/monitoring/prometheus).