---
sidebar_position: 3
sidebar_label: 'Горизонтальное масштабирование'
slug: /cloud/features/autoscaling/horizontal
description: 'Ручное горизонтальное масштабирование в ClickHouse Cloud'
keywords: ['горизонтальное масштабирование', 'масштабирование', 'реплики', 'ручное масштабирование', 'пики', 'всплески нагрузки']
title: 'Горизонтальное масштабирование'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

## Ручное горизонтальное масштабирование \{#manual-horizontal-scaling\}

<ScalePlanFeatureBadge feature="Ручное горизонтальное масштабирование" />

Вы можете использовать [публичные API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch) ClickHouse Cloud, чтобы масштабировать сервис, обновив его настройки масштабирования, или изменить число реплик в Cloud Console.

Тиры **Scale** и **Enterprise** также поддерживают сервисы с одной репликой. После увеличения числа реплик сервис можно снова уменьшить до одной реплики. Обратите внимание, что сервисы с одной репликой имеют более низкую доступность и не рекомендуются для использования в продакшене.

:::note
Сервисы можно масштабировать по горизонтали максимум до 20 реплик. Если вам требуется больше реплик, обратитесь в нашу службу поддержки.
:::

### Горизонтальное масштабирование через API \{#horizontal-scaling-via-api\}

Чтобы выполнить горизонтальное масштабирование кластера, отправьте через API запрос `PATCH`, чтобы изменить количество реплик. На снимках экрана ниже показан вызов API для масштабирования кластера с `3` реплик до `6`, а также соответствующий ответ.

<Image img={scaling_patch_request} size="lg" alt="Запрос PATCH для масштабирования" border />

*Запрос `PATCH` для обновления `numReplicas`*

<Image img={scaling_patch_response} size="md" alt="Ответ на запрос PATCH для масштабирования" border />

*Ответ на запрос `PATCH`*

Если вы отправите новый запрос на масштабирование или несколько запросов подряд, пока один из них уже выполняется, служба масштабирования проигнорирует промежуточные состояния и приведет кластер к итоговому количеству реплик.

### Горизонтальное масштабирование через UI \{#horizontal-scaling-via-ui\}

Чтобы горизонтально масштабировать сервис через UI, измените число реплик сервиса на странице **Settings**.

<Image img={scaling_configure} size="md" alt="Настройки масштабирования" border />

*Настройки масштабирования сервиса в консоли ClickHouse Cloud*

После масштабирования сервиса дашборд Metrics в Cloud Console должен отображать корректное выделение ресурсов для сервиса. На снимке экрана ниже показан кластер, масштабированный до общего объема памяти `96 GiB`, то есть до `6` реплик с выделением по `16 GiB` памяти на каждую.

<Image img={scaling_memory_allocation} size="md" alt="Выделение памяти при масштабировании" border />