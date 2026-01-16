---
sidebar_label: 'Hashboard'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['clickhouse', 'Hashboard', 'connect', 'integrate', 'ui', 'analytics']
description: 'Hashboard — это надёжная аналитическая платформа, которую можно легко интегрировать с ClickHouse для анализа данных в режиме реального времени.'
title: 'Подключение ClickHouse к Hashboard'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Подключение ClickHouse к Hashboard \\{#connecting-clickhouse-to-hashboard\\}

<CommunityMaintainedBadge/>

[Hashboard](https://hashboard.com) — это интерактивный инструмент для исследования данных, который позволяет любому сотруднику вашей организации отслеживать метрики и находить практические выводы. Hashboard выполняет SQL‑запросы к вашей базе данных ClickHouse в режиме реального времени и особенно полезен для самостоятельного ad hoc‑исследования данных.

<Image size="md" img={hashboard_01} alt="Интерфейс исследователя данных Hashboard с интерактивным конструктором запросов и визуализацией" border />

<br/>

В этом руководстве описаны шаги по подключению Hashboard к вашему экземпляру ClickHouse. Эта информация также доступна в документации Hashboard по интеграции с [ClickHouse](https://docs.hashboard.com/docs/database-connections/clickhouse).

## Предварительные требования \\{#pre-requisites\\}

- База данных ClickHouse, развернутая в вашей собственной инфраструктуре или в [ClickHouse Cloud](https://clickhouse.com/).
- [Учётная запись Hashboard](https://hashboard.com/getAccess) и проект.

## Порядок подключения Hashboard к ClickHouse \\{#steps-to-connect-hashboard-to-clickhouse\\}

### 1. Соберите сведения о подключении \\{#1-gather-your-connection-details\\}

<ConnectionDetails />

### 2. Добавьте новое подключение к базе данных в Hashboard \\{#2-add-a-new-database-connection-in-hashboard\\}

1. Перейдите в свой [проект Hashboard](https://hashboard.com/app).
2. Откройте страницу `Settings`, нажав на значок шестерёнки в боковой панели навигации.
3. Нажмите `+ New Database Connection`.
4. В модальном окне выберите `ClickHouse`.
5. Заполните поля **Connection Name**, **Host**, **Port**, **Username**, **Password** и **Database** сведениями, собранными ранее.
6. Нажмите `Test`, чтобы проверить, что подключение успешно настроено.
7. Нажмите `Add`.

Теперь ваша база данных ClickHouse будет подключена к Hashboard, и вы можете приступить к созданию [Data Models](https://docs.hashboard.com/docs/data-modeling/add-data-model), [Explorations](https://docs.hashboard.com/docs/visualizing-data/explorations), [Metrics](https://docs.hashboard.com/docs/metrics) и [Dashboards](https://docs.hashboard.com/docs/dashboards). Подробную информацию об этих возможностях см. в соответствующей документации Hashboard.

## Узнать больше \\{#learn-more\\}

Для получения информации о более продвинутых возможностях и устранении неполадок обратитесь к [документации Hashboard](https://docs.hashboard.com/).