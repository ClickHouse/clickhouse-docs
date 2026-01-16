---
sidebar_label: 'Looker'
slug: /integrations/looker
keywords: ['clickhouse', 'looker', 'подключение', 'интеграция', 'ui']
description: 'Looker — это корпоративная платформа для BI, приложений для работы с данными и встроенной аналитики, которая помогает в реальном времени изучать данные и делиться полученными инсайтами.'
title: 'Looker'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Looker \\{#looker\\}

<PartnerBadge/>

Looker может подключаться к ClickHouse Cloud или локальному развертыванию ClickHouse с помощью официального источника данных ClickHouse.

## 1. Получите параметры подключения \\{#1-gather-your-connection-details\\}
<ConnectionDetails />

## 2. Создайте источник данных ClickHouse \\{#2-create-a-clickhouse-data-source\\}

Перейдите в Admin -> Database -> Connections и нажмите кнопку «Add Connection» в правом верхнем углу.

<Image size="md" img={looker_01} alt="Добавление нового подключения в интерфейсе управления базами данных Looker" border />
<br/>

Задайте имя для источника данных и выберите `ClickHouse` в выпадающем списке диалектов. Введите свои учетные данные в форме.

<Image size="md" img={looker_02} alt="Указание учетных данных ClickHouse в форме подключения Looker" border />
<br/>

Если вы используете ClickHouse Cloud или ваше развертывание требует SSL, убедитесь, что SSL включен в дополнительных настройках.

<Image size="md" img={looker_03} alt="Включение SSL для подключения ClickHouse в настройках Looker" border />
<br/>

Сначала протестируйте подключение и, после успешной проверки, подключитесь к новому источнику данных ClickHouse.

<Image size="md" img={looker_04} alt="Тестирование и подключение к источнику данных ClickHouse" border />
<br/>

Теперь вы сможете подключить источник данных ClickHouse к проекту Looker.

## 3. Известные ограничения \\{#3-known-limitations\\}

1. Следующие типы данных по умолчанию обрабатываются как строки:
   * Array — сериализация работает некорректно из-за ограничений драйвера JDBC
   * Decimal* — в модели можно привести к числовому типу
   * LowCardinality(...) — в модели можно привести к соответствующему типу
   * Enum8, Enum16
   * UUID
   * Tuple
   * Map
   * JSON
   * Nested
   * FixedString
   * Географические типы данных
     * MultiPolygon
     * Polygon
     * Point
     * Ring
2. [Функция симметрической агрегации](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates) не поддерживается
3. [Полное внешнее соединение (full outer join)](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer) пока не реализовано в драйвере
