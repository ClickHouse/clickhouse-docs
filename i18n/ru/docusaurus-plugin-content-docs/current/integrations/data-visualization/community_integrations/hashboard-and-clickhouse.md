---
sidebar_label: 'Hashboard'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['ClickHouse', 'Hashboard', 'подключить', 'интегрировать', 'ui', 'аналитика']
description: 'Hashboard — мощная аналитическая платформа, которую легко интегрировать с ClickHouse для анализа данных в реальном времени.'
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

<CommunityMaintainedBadge />

[Hashboard](https://hashboard.com) — это интерактивный инструмент для исследования данных, который позволяет любому сотруднику вашей организации отслеживать метрики и получать полезные инсайты. Hashboard выполняет SQL-запросы к вашей базе данных ClickHouse в реальном времени и особенно удобен для самостоятельного, нерегламентированного исследования данных.

<Image size="md" img={hashboard_01} alt="Интерфейс обозревателя данных Hashboard с интерактивным конструктором запросов и визуализацией" border />

<br />

В этом руководстве описаны шаги по подключению Hashboard к вашему экземпляру ClickHouse. Эта информация также доступна в [документации Hashboard по интеграции с ClickHouse](https://docs.hashboard.com/docs/database-connections/clickhouse).

## Предварительные требования \{#pre-requisites\}

* База данных ClickHouse, размещённая либо в вашей инфраструктуре, либо в [ClickHouse Cloud](https://clickhouse.com/).
* Учётная запись в [Hashboard](https://hashboard.com/getAccess) и проект.

## Подключение Hashboard к ClickHouse \{#steps-to-connect-hashboard-to-clickhouse\}

### 1. Подготовьте параметры подключения \{#1-gather-your-connection-details\}

<ConnectionDetails />

### 2. Добавьте новое подключение к базе данных в Hashboard \{#2-add-a-new-database-connection-in-hashboard\}

1. Перейдите в свой [проект Hashboard](https://hashboard.com/app).
2. Откройте страницу «Настройки», нажав значок шестерёнки на боковой панели навигации.
3. Нажмите `+ New Database Connection`.
4. В модальном окне выберите &quot;ClickHouse.&quot;
5. Заполните поля **Connection Name**, **Host**, **Port**, **Username**, **Password** и **Database** информацией, собранной ранее.
6. Нажмите &quot;Test&quot;, чтобы убедиться, что подключение настроено правильно.
7. Нажмите &quot;Add&quot;

Теперь ваша база данных ClickHouse подключена к Hashboard, и вы можете перейти к созданию [Data Models](https://docs.hashboard.com/docs/data-modeling/add-data-model), [Explorations](https://docs.hashboard.com/docs/visualizing-data/explorations), [Metrics](https://docs.hashboard.com/docs/metrics) и [Dashboards](https://docs.hashboard.com/docs/dashboards). Подробнее об этих возможностях см. в соответствующей документации Hashboard.

## Узнать больше \{#learn-more\}

Более подробную информацию о расширенных возможностях и устранении неполадок см. в [документации Hashboard](https://docs.hashboard.com/).