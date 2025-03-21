---
sidebar_label: Looker
slug: /integrations/looker
keywords: [clickhouse, looker, connect, integrate, ui]
description: Looker является платформой для бизнеса, предназначенной для BI, приложений для анализа данных и встроенной аналитики, которая помогает вам исследовать и делиться аналитикой в реальном времени.
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';


# Looker

Looker может подключаться к ClickHouse Cloud или локальному развертыванию через официальное источника данных ClickHouse.

## 1. Соберите ваши данные подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Создайте источник данных ClickHouse {#2-create-a-clickhouse-data-source}

Перейдите в Администратор -> База данных -> Подключения и нажмите кнопку "Добавить подключение" в правом верхнем углу.

<img src={looker_01} class="image" alt="Добавление нового подключения" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

Выберите имя для вашего источника данных и выберите `ClickHouse` из выпадающего списка диалектов. Введите ваши учетные данные в форму.

<img src={looker_02} class="image" alt="Указание ваших учетных данных" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

Если вы используете ClickHouse Cloud или ваше развертывание требует SSL, убедитесь, что SSL включен в дополнительных настройках.

<img src={looker_03} class="image" alt="Включение SSL" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

Сначала протестируйте подключение, и после успешного завершения подключитесь к вашему новому источнику данных ClickHouse.

<img src={looker_04} class="image" alt="Включение SSL" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

Теперь вы должны быть в состоянии прикрепить источник данных ClickHouse к вашему проекту Looker.

## 3. Известные ограничения {#3-known-limitations}

1. Следующие типы данных по умолчанию обрабатываются как строки:
   * Array - сериализация работает не так, как ожидалось, из-за ограничений JDBC драйвера
   * Decimal* - может быть изменен на число в модели
   * LowCardinality(...) - может быть изменен на правильный тип в модели
   * Enum8, Enum16
   * UUID
   * Tuple
   * Map
   * JSON
   * Nested
   * FixedString
   * Геометрические типы
     * MultiPolygon
     * Polygon
     * Point
     * Ring
2. [Симметричная агрегатная функция](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates) не поддерживается
3. [Полный внешний join](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer) еще не реализован в драйвере
