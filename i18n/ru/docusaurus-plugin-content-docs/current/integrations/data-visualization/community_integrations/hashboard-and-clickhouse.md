---
sidebar_label: 'Hashboard'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['clickhouse', 'Hashboard', 'connect', 'integrate', 'ui', 'analytics']
description: 'Hashboard — это мощная аналитическая платформа, которую можно легко интегрировать с ClickHouse для анализа данных в режиме реального времени.'
title: 'Подключение ClickHouse к Hashboard'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение ClickHouse к Hashboard

<CommunityMaintainedBadge/>

[Hashboard](https://hashboard.com) — это интерактивный инструмент исследования данных, который позволяет любому сотруднику вашей организации отслеживать метрики и получать прикладные инсайты. Hashboard выполняет прямые SQL‑запросы к вашей базе данных ClickHouse и особенно полезен для сценариев самостоятельного, разового исследования данных.

<Image size="md" img={hashboard_01} alt="Интерфейс исследователя данных Hashboard с интерактивным конструктором запросов и визуализацией" border />

<br/>

В этом руководстве описаны шаги по подключению Hashboard к вашему экземпляру ClickHouse. Эти сведения также доступны в документации Hashboard по [интеграции с ClickHouse](https://docs.hashboard.com/docs/database-connections/clickhouse).



## Предварительные требования {#pre-requisites}

- База данных ClickHouse, размещённая на вашей собственной инфраструктуре или в [ClickHouse Cloud](https://clickhouse.com/).
- [Учётная запись Hashboard](https://hashboard.com/getAccess) и проект.


## Шаги по подключению Hashboard к ClickHouse {#steps-to-connect-hashboard-to-clickhouse}

### 1. Соберите параметры подключения {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Добавьте новое подключение к базе данных в Hashboard {#2-add-a-new-database-connection-in-hashboard}

1. Перейдите в ваш [проект Hashboard](https://hashboard.com/app).
2. Откройте страницу настроек, нажав на значок шестеренки на боковой панели навигации.
3. Нажмите `+ New Database Connection`.
4. В открывшемся окне выберите «ClickHouse».
5. Заполните поля **Connection Name**, **Host**, **Port**, **Username**, **Password** и **Database** информацией, собранной ранее.
6. Нажмите «Test», чтобы проверить правильность настройки подключения.
7. Нажмите «Add».

Ваша база данных ClickHouse теперь подключена к Hashboard, и вы можете приступить к созданию [моделей данных](https://docs.hashboard.com/docs/data-modeling/add-data-model), [исследований](https://docs.hashboard.com/docs/visualizing-data/explorations), [метрик](https://docs.hashboard.com/docs/metrics) и [дашбордов](https://docs.hashboard.com/docs/dashboards). Подробнее об этих возможностях см. в соответствующей документации Hashboard.


## Дополнительная информация {#learn-more}

Дополнительную информацию о расширенных возможностях и устранении неполадок см. в [документации Hashboard](https://docs.hashboard.com/).
