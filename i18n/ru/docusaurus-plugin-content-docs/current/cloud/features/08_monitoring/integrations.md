---
title: 'Интеграции сообщества и партнёров'
slug: /cloud/monitoring/integrations
description: 'Сторонние интеграции для мониторинга и Billing & Usage API для ClickHouse Cloud'
keywords: ['cloud', 'monitoring', 'datadog', 'grafana', 'community', 'billing', 'usage api']
sidebar_label: 'Интеграции'
sidebar_position: 6
doc_type: 'guide'
---

import CommunityMonitoring from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_community_monitoring.md';

# Интеграции от сообщества и партнёров \{#community-and-partner-integrations\}

## Прямая интеграция с Datadog \{#direct-datadog\}

Datadog предлагает плагин мониторинга ClickHouse для своего agent, который напрямую запрашивает системные таблицы. Эта интеграция обеспечивает подробный мониторинг базы данных с учетом cluster благодаря функциональности `clusterAllReplicas`.

:::warning[Не рекомендуется для ClickHouse Cloud]
Прямая интеграция с agent Datadog, которая запрашивает системные таблицы, не рекомендуется для развертываний ClickHouse Cloud из-за несовместимости с оптимизирующим затраты бездействующим режимом и эксплуатационных ограничений облачного прокси-слоя.
:::

Вместо этого используйте Datadog [Agent](https://docs.datadoghq.com/agent/?tab=Linux) и [интеграцию OpenMetrics](https://docs.datadoghq.com/integrations/openmetrics/) для сбора метрик с Prometheus endpoint в ClickHouse Cloud. Этот подход учитывает поведение service при переходе в бездействующий режим и сохраняет эксплуатационное разделение между задачами мониторинга и рабочими нагрузками промышленной эксплуатации. Рекомендации по настройке см. в [документации Datadog по интеграции Prometheus и OpenMetrics](https://docs.datadoghq.com/integrations/openmetrics/).

Подробные сведения о настройке Prometheus endpoint см. на [странице интеграции Prometheus](/integrations/prometheus#integrating-with-datadog).

<CommunityMonitoring />

## API биллинга и использования \{#billing-usage-api\}

Billing & Usage API можно использовать для программного доступа к записям о биллинге и использовании вашей организации в Cloud. Это полезно при создании пользовательских панелей мониторинга затрат или интеграции данных биллинга в существующие процессы финансовой отчётности.

Полное справочное описание API см. в [документации по API биллинга](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Billing).