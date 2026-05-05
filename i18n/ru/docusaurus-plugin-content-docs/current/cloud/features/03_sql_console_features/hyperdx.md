---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: 'Предоставляет HyperDX — пользовательский интерфейс для ClickStack, платформы обсервабилити промышленного уровня, построенной на ClickHouse и OpenTelemetry (OTel) и объединяющей логи, трейсы, метрики и данные сессий в одном высокопроизводительном масштабируемом решении.'
doc_type: 'guide'
keywords: ['hyperdx', 'обсервабилити', 'интеграция', 'функции cloud', 'мониторинг']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX — это пользовательский интерфейс для [**ClickStack**](/use-cases/observability/clickstack) — платформы обсервабилити промышленного уровня, построенной на ClickHouse и OpenTelemetry (OTel), которая объединяет логи, трейсы, метрики и данные сессий в одном высокопроизводительном решении. Разработанный для мониторинга и отладки сложных систем, ClickStack позволяет разработчикам и SRE отслеживать проблемы сквозным образом без переключения между инструментами и без ручной увязки данных по временным меткам или идентификаторам корреляции.

HyperDX — это специализированный фронтенд для исследования и визуализации данных обсервабилити с поддержкой запросов в стиле Lucene и SQL, интерактивных дашбордов, оповещений, анализа трейсов и многого другого — всё это оптимизировано для ClickHouse в качестве бэкенда.

HyperDX в ClickHouse Cloud позволяет вам получить более готовый к использованию ClickStack — без необходимости управлять инфраструктурой и настраивать отдельную аутентификацию.
HyperDX можно запустить одним щелчком и подключить к вашим данным — он полностью интегрирован в систему аутентификации ClickHouse Cloud, обеспечивая бесшовный и безопасный доступ к вашим данным обсервабилити.

## Развертывание \{#main-concepts\}

HyperDX в ClickHouse Cloud в настоящее время находится в закрытом превью и должен быть включен на уровне организации. После включения HyperDX появится в основном левом меню навигации при выборе любого сервиса.

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg" />

Чтобы начать работу с HyperDX в ClickHouse Cloud, рекомендуем воспользоваться нашим специальным [руководством по началу работы](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud).

Дополнительные сведения о ClickStack см. в [полной документации](/use-cases/observability/clickstack).