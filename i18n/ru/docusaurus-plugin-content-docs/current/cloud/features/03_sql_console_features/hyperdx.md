---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: 'HyperDX — пользовательский интерфейс ClickStack, промышленной платформы обсервабилити уровня продакшн, построенной на ClickHouse и OpenTelemetry (OTel) и объединяющей логи, трейсы, метрики и сессии в одном высокопроизводительном масштабируемом решении.'
doc_type: 'guide'
keywords: ['hyperdx', 'observability', 'integration', 'cloud features', 'monitoring']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX — это пользовательский интерфейс для [**ClickStack**](/use-cases/observability/clickstack) — промышленной платформы наблюдаемости (observability) уровня продакшн, построенной на ClickHouse и OpenTelemetry (OTel), объединяющей логи, трейсы, метрики и сессии в одном высокопроизводительном решении. Разработанный для мониторинга и отладки сложных систем, ClickStack позволяет разработчикам и SRE-специалистам выполнять сквозной анализ проблем без переключения между инструментами и без ручной увязки данных по временным меткам или идентификаторам корреляции.

HyperDX — это специализированный фронтенд для исследования и визуализации данных наблюдаемости, поддерживающий как Lucene-подобный синтаксис запросов, так и SQL-запросы, интерактивные дашборды, оповещения, исследование трейсов и многое другое — все это оптимизировано для ClickHouse в роли бэкенда.

HyperDX в ClickHouse Cloud позволяет пользователям получить более готовое, «под ключ» решение ClickStack — без необходимости управлять инфраструктурой и настраивать отдельную аутентификацию. HyperDX запускается одним кликом и подключается к вашим данным, будучи полностью интегрированным с системой аутентификации ClickHouse Cloud для бесшовного и безопасного доступа к данным вашей наблюдаемости.


## Развертывание {#main-concepts}

HyperDX в ClickHouse Cloud в настоящее время находится на этапе закрытого предварительного просмотра и должен быть включен на уровне организации. После включения вы найдете HyperDX в основной левой панели навигации при выборе любого сервиса.

<Image img={hyperdx_cloud} alt="HyperDX в ClickHouse Cloud" size="lg"/>

Чтобы начать работу с HyperDX в ClickHouse Cloud, мы рекомендуем воспользоваться нашим отдельным [руководством по началу работы](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud).

Для получения дополнительной информации о ClickStack см. [полную документацию](/use-cases/observability/clickstack). 