---
slug: /use-cases/observability/clickstack/service-maps
title: 'Карты сервисов'
sidebar_label: 'Карты сервисов'
pagination_prev: null
pagination_next: null
description: 'Визуализируйте зависимости между сервисами и поток запросов в ClickStack с помощью карт сервисов.'
doc_type: 'guide'
keywords: ['ClickStack', 'карты сервисов', 'топология', 'трейсы', 'зависимости', 'распределённый трейсинг', 'обсервабилити', 'граф запросов']
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import service_map_overview from '@site/static/images/clickstack/service-maps/service-map-overview.png';
import service_map_demo from '@site/static/images/clickstack/service-maps/service-map-demo.mp4';
import source_selector from '@site/static/images/clickstack/service-maps/source-selector.png';
import sampling from '@site/static/images/clickstack/service-maps/sampling.png';
import date_selector from '@site/static/images/clickstack/service-maps/date-selector.png';

<BetaBadge />

Карты сервисов показывают, как взаимодействуют ваши сервисы. ClickStack строит граф, сопоставляя клиентские спаны (исходящие запросы) с серверными спанами (входящие запросы) в рамках одного трейса и восстанавливая путь запроса между сервисами.

Нажмите **Service Map** в левой панели навигации, чтобы открыть полный граф. Сервисы появятся, как только вы начнёте [приём трейсов](/use-cases/observability/clickstack/ingesting-data) через OpenTelemetry.

<Image img={service_map_overview} alt="Карта сервисов с узлами сервисов и потоком запросов между ними" size="lg" />

## Просмотр карты сервисов \{#exploring-the-service-map\}

Каждый узел представляет сервис, определяемый атрибутом ресурса `service.name`. Рёбра (пунктирные линии) соединяют сервисы, если клиентский спан в одном сервисе соответствует серверному спану в другом. Размер узла отражает относительный объём трафика, а красные узлы обозначают сервисы с ошибками в выбранном временном диапазоне.

Панель инструментов над картой позволяет фильтровать данные и настраивать отображение.

**Выбор источника** — отфильтруйте карту по конкретному источнику трейсов (например, &quot;ClickPy Traces&quot;).

<Image img={source_selector} alt="Выбор источника, выделенный на панели инструментов карты сервисов" size="lg" />

**Ползунок выборки** — настройте уровень выборки, чтобы сбалансировать производительность и точность. Более низкие значения быстрее загружаются на кластерах с большим объёмом данных.

<Image img={sampling} alt="Ползунок выборки, выделенный на панели инструментов карты сервисов" size="lg" />

**Выбор диапазона дат** — задайте временное окно для данных трейсов, используемых для построения карты.

<Image img={date_selector} alt="Выбор диапазона дат, выделенный на панели инструментов карты сервисов" size="lg" />

Используйте кнопки **+/-** в левом нижнем углу карты или прокрутку колеса мыши, чтобы увеличивать и уменьшать масштаб.

## Карты сервисов на уровне трейса \{#trace-level-service-maps\}

Когда вы просматриваете отдельный трейс, карта сервисов с фокусом на нём показывает, как конкретный запрос проходил между сервисами. Это позволяет увидеть топологию отдельного запроса, не выходя из waterfall трейса.

<video src={service_map_demo} autoPlay loop muted playsInline width="100%" />