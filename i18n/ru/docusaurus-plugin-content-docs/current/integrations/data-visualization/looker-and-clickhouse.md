---
sidebar_label: 'Looker'
slug: /integrations/looker
keywords: ['clickhouse', 'looker', 'подключение', 'интеграция', 'интерфейс']
description: 'Looker — это корпоративная платформа для BI, аналитических приложений и встраиваемой аналитики, которая помогает в режиме реального времени исследовать данные и делиться полученными инсайтами.'
title: 'Looker'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Looker

<PartnerBadge/>

Looker может подключаться к ClickHouse Cloud или локальному развертыванию с использованием официального источника данных ClickHouse.



## 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. Создание источника данных ClickHouse {#2-create-a-clickhouse-data-source}

Перейдите в раздел Admin -> Database -> Connections и нажмите кнопку «Add Connection» в правом верхнем углу.

<Image
  size='md'
  img={looker_01}
  alt="Добавление нового подключения в интерфейсе управления базами данных Looker"
  border
/>
<br />

Укажите имя для источника данных и выберите `ClickHouse` из выпадающего списка диалектов. Введите учетные данные в форму.

<Image
  size='md'
  img={looker_02}
  alt='Указание учетных данных ClickHouse в форме подключения Looker'
  border
/>
<br />

Если вы используете ClickHouse Cloud или ваше развертывание требует SSL, убедитесь, что SSL включен в дополнительных настройках.

<Image
  size='md'
  img={looker_03}
  alt='Включение SSL для подключения ClickHouse в настройках Looker'
  border
/>
<br />

Сначала протестируйте подключение, а затем, после успешного завершения теста, подключитесь к новому источнику данных ClickHouse.

<Image
  size='md'
  img={looker_04}
  alt='Тестирование и подключение к источнику данных ClickHouse'
  border
/>
<br />

Теперь вы сможете подключить источник данных ClickHouse к проекту Looker.


## 3. Известные ограничения {#3-known-limitations}

1. Следующие типы данных по умолчанию обрабатываются как строки:
   - Array — сериализация работает некорректно из-за ограничений драйвера JDBC
   - Decimal\* — можно изменить на числовой тип в модели
   - LowCardinality(...) — можно изменить на соответствующий тип в модели
   - Enum8, Enum16
   - UUID
   - Tuple
   - Map
   - JSON
   - Nested
   - FixedString
   - Геотипы
     - MultiPolygon
     - Polygon
     - Point
     - Ring
2. [Функция симметричных агрегатов](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates) не поддерживается
3. [Полное внешнее соединение](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer) еще не реализовано в драйвере
