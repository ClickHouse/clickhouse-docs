---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: 'HyperDX — это пользовательский интерфейс для ClickStack, промышленной платформы наблюдаемости на базе ClickHouse и OpenTelemetry (OTel), объединяющей логи, трейсы, метрики и сессии в одном высокопроизводительном и масштабируемом решении.'
doc_type: 'guide'
keywords: ['hyperdx', 'observability', 'integration', 'cloud features', 'monitoring']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX — это пользовательский интерфейс для [**ClickStack**](/use-cases/observability/clickstack) — промышленной платформы наблюдаемости, построенной на ClickHouse и OpenTelemetry (OTel), объединяющей логи, трейсы, метрики и сессии в одном высокопроизводительном решении. Разработанный для мониторинга и отладки сложных систем, ClickStack позволяет разработчикам и инженерам по надёжности (SRE) прослеживать проблемы сквозным образом, не переключаясь между инструментами и не собирая данные вручную по временным меткам или идентификаторам корреляции.

HyperDX — это специализированный фронтенд для исследования и визуализации данных наблюдаемости, поддерживающий Lucene-подобные и SQL-запросы, интерактивные панели, оповещения, анализ трейсов и многое другое — всё это оптимизировано для ClickHouse в качестве бэкенда.

HyperDX в ClickHouse Cloud позволяет пользователям получить более «из коробки» опыт работы с ClickStack: без управления инфраструктурой и без отдельной настройки аутентификации.
HyperDX можно запустить одним щелчком и подключить к вашим данным — он полностью интегрирован с системой аутентификации ClickHouse Cloud для бесшовного и безопасного доступа к данным наблюдаемости.


## Развертывание {#main-concepts}

HyperDX в ClickHouse Cloud в настоящее время находится в режиме закрытого предварительного просмотра и должен быть включен на уровне организации. После включения пользователи смогут найти HyperDX в главном меню навигации слева при выборе любого сервиса.

<Image img={hyperdx_cloud} alt='ClickHouse Cloud HyperDX' size='lg' />

Для начала работы с HyperDX в ClickHouse Cloud рекомендуем ознакомиться с нашим [руководством по началу работы](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud).

Дополнительную информацию о ClickStack см. в [полной документации](/use-cases/observability/clickstack).
