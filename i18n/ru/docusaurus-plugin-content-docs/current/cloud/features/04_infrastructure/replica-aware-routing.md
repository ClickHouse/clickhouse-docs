---
title: 'Маршрутизация с учетом реплик'
slug: /manage/replica-aware-routing
description: 'Как использовать маршрутизацию с учетом реплик для повышения повторного использования кеша'
keywords: ['cloud', 'sticky endpoints', 'sticky', 'endpoints', 'sticky routing', 'routing', 'replica aware routing']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# Маршрутизация с учётом реплик

<PrivatePreviewBadge/>

Маршрутизация с учётом реплик (также известная как sticky sessions, sticky routing или session affinity) использует [ring hash load balancing в Envoy proxy](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash). Основная цель такой маршрутизации — повысить вероятность повторного использования кэша. Она не гарантирует изоляцию.

При включении маршрутизации с учётом реплик для сервиса мы разрешаем подстановочный поддомен поверх имени хоста сервиса. Для сервиса с именем хоста `abcxyz123.us-west-2.aws.clickhouse.cloud` вы можете использовать любое имя хоста, которое соответствует `*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`, чтобы обращаться к сервису:

|Примеры имён хостов|
|---|
|`aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|

Когда Envoy получает имя хоста, которое соответствует такому шаблону, он вычисляет хеш для маршрутизации на основе имени хоста и находит соответствующий сервер ClickHouse на хеш-кольце по этому хешу. При условии отсутствия изменений в сервисе (например, перезапуски серверов, масштабирование ресурсов) Envoy всегда будет выбирать один и тот же сервер ClickHouse для подключения.

Обратите внимание, что исходное имя хоста по-прежнему использует балансировку `LEAST_CONNECTION`, которая является алгоритмом маршрутизации по умолчанию.



## Ограничения маршрутизации с учетом реплик {#limitations-of-replica-aware-routing}

### Маршрутизация с учетом реплик не гарантирует изоляцию {#replica-aware-routing-does-not-guarantee-isolation}

Любое нарушение работы сервиса, например перезапуск pod-контейнера сервера (по любой причине: обновление версии, сбой, вертикальное масштабирование и т. д.), горизонтальное масштабирование сервера, приведет к нарушению работы хеш-кольца маршрутизации. В результате соединения с одним и тем же именем хоста будут направляться на другой pod-контейнер сервера.

### Маршрутизация с учетом реплик не работает «из коробки» с private link {#replica-aware-routing-does-not-work-out-of-the-box-with-private-link}

Пользователям необходимо вручную добавить DNS-запись, чтобы разрешение имен работало для нового шаблона имени хоста. При неправильном использовании это может привести к дисбалансу нагрузки на сервер.


## Настройка маршрутизации с учетом реплик {#configuring-replica-aware-routing}

Чтобы включить маршрутизацию с учетом реплик, свяжитесь с [нашей службой поддержки](https://clickhouse.com/support/program).
