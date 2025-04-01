---
sidebar_label: 'Looker'
slug: /integrations/looker
keywords: ['clickhouse', 'looker', 'connect', 'integrate', 'ui']
description: 'Looker — это корпоративная платформа для бизнес-аналитики, приложений данных и встроенной аналитики, которая помогает вам исследовать и делиться инсайтами в реальном времени.'
title: 'Looker'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Looker

<CommunityMaintainedBadge/>

Looker может подключаться к ClickHouse Cloud или локальному развертыванию через официальный источник данных ClickHouse.

## 1. Соберите свои данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Создайте источник данных ClickHouse {#2-create-a-clickhouse-data-source}

Перейдите в Админ -> База данных -> Соединения и нажмите кнопку "Добавить соединение" в правом верхнем углу.

<Image size="md" img={looker_01} alt="Добавление нового соединения в интерфейсе управления базами данных Looker" border />
<br/>

Выберите имя для вашего источника данных и выберите `ClickHouse` из выпадающего списка диалектов. Введите свои учетные данные в форму.

<Image size="md" img={looker_02} alt="Указание ваших учетных данных ClickHouse в форме соединения Looker" border />
<br/>

Если вы используете ClickHouse Cloud или ваше развертывание требует SSL, убедитесь, что у вас включен SSL в дополнительных настройках.

<Image size="md" img={looker_03} alt="Включение SSL для соединения ClickHouse в настройках Looker" border />
<br/>

Сначала протестируйте ваше соединение, и, как только это будет сделано, подключитесь к вашему новому источнику данных ClickHouse.

<Image size="md" img={looker_04} alt="Тестирование и подключение к источнику данных ClickHouse" border />
<br/>

Теперь вы сможете прикрепить источник данных ClickHouse к вашему проекту Looker.

## 3. Известные ограничения {#3-known-limitations}

1. Следующие типы данных по умолчанию обрабатываются как строки:
   * Массив - сериализация не работает как ожидается из-за ограничений драйвера JDBC
   * Decimal* - может быть изменен на число в модели
   * LowCardinality(...) - может быть изменен на правильный тип в модели
   * Enum8, Enum16
   * UUID
   * Tuple
   * Map
   * JSON
   * Nested
   * FixedString
   * Гео типы
     * MultiPolygon
     * Polygon
     * Point
     * Ring
2. [Функция симметричной агрегации](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates) не поддерживается
3. [Полное внешнее соединение](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer) еще не реализовано в драйвере
