---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: 'Предоставляет HyperDX — пользовательский интерфейс для ClickStack, промышленной платформы наблюдаемости, построенной на ClickHouse и OpenTelemetry (OTel), объединяющей логи, трассировки, метрики и сеансы в одном высокопроизводительном и масштабируемом решении.'
doc_type: 'guide'
keywords: ['hyperdx', 'наблюдаемость', 'интеграция', 'функции облака', 'мониторинг']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX — это пользовательский интерфейс для [**ClickStack**](/use-cases/observability/clickstack) — продакшн-класса платформы наблюдаемости, построенной на ClickHouse и OpenTelemetry (OTel), объединяющей логи, трейсы, метрики и сессии в одном высокопроизводительном решении. Разработанный для мониторинга и отладки сложных систем, ClickStack позволяет разработчикам и SRE выполнять сквозное трассирование проблем без переключения между инструментами и без ручного сопоставления данных по временным меткам или идентификаторам корреляции (correlation ID).

HyperDX — это специализированный фронтенд для исследования и визуализации данных наблюдаемости, поддерживающий Lucene-подобные и SQL-запросы, интерактивные дашборды, оповещения, исследование трейсов и многое другое — всё оптимизировано под ClickHouse в качестве бекенда.

HyperDX в ClickHouse Cloud позволяет пользователям получить более готовый к использованию опыт ClickStack: без управления инфраструктурой и без отдельной настройки аутентификации.
HyperDX может быть запущен одним щелчком мыши и подключён к вашим данным — полностью интегрирован в систему аутентификации ClickHouse Cloud для бесшовного и безопасного доступа к вашим данным наблюдаемости.


## Развертывание {#main-concepts}

HyperDX в ClickHouse Cloud в настоящее время находится в режиме закрытого предварительного просмотра и должен быть включен на уровне организации. После включения пользователи смогут найти HyperDX в главном меню навигации слева при выборе любого сервиса.

<Image img={hyperdx_cloud} alt='ClickHouse Cloud HyperDX' size='lg' />

Для начала работы с HyperDX в ClickHouse Cloud рекомендуем ознакомиться с нашим [руководством по началу работы](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud).

Дополнительную информацию о ClickStack см. в [полной документации](/use-cases/observability/clickstack).
