---
sidebar_label: 'Дашборды'
slug: /cloud/manage/dashboards
title: 'Дашборды'
description: 'Функция дашбордов в SQL Console позволяет собирать и совместно использовать визуализации из сохранённых запросов.'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'dashboards', 'data visualization', 'SQL console dashboards', 'cloud analytics']
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import dashboards_2 from '@site/static/images/cloud/dashboards/2_dashboards.png';
import dashboards_3 from '@site/static/images/cloud/dashboards/3_dashboards.png';
import dashboards_4 from '@site/static/images/cloud/dashboards/4_dashboards.png';
import dashboards_5 from '@site/static/images/cloud/dashboards/5_dashboards.png';
import dashboards_6 from '@site/static/images/cloud/dashboards/6_dashboards.png';
import dashboards_7 from '@site/static/images/cloud/dashboards/7_dashboards.png';
import dashboards_8 from '@site/static/images/cloud/dashboards/8_dashboards.png';
import dashboards_9 from '@site/static/images/cloud/dashboards/9_dashboards.png';
import dashboards_10 from '@site/static/images/cloud/dashboards/10_dashboards.png';
import dashboards_11 from '@site/static/images/cloud/dashboards/11_dashboards.png';


# Дашборды

Функция дашбордов в SQL Console позволяет собирать и предоставлять визуализации на основе сохранённых запросов. Начните с сохранения и визуализации запросов, добавления их визуализаций в дашборд и превращения дашборда в интерактивный с помощью параметров запроса.



## Основные концепции {#core-concepts}

### Совместное использование запросов {#query-sharing}

Чтобы предоставить коллегам доступ к дашборду, необходимо также предоставить доступ к базовому сохранённому запросу. Для просмотра визуализации пользователям требуется как минимум доступ на чтение к базовому сохранённому запросу.

### Интерактивность {#interactivity}

Используйте [параметры запросов](/sql-reference/syntax#defining-and-using-query-parameters), чтобы сделать дашборд интерактивным. Например, можно добавить параметр запроса в условие `WHERE` для реализации фильтрации.

Вы можете управлять вводом параметров запроса через боковую панель глобальных фильтров (**Global** filters), выбрав тип «filter» в настройках визуализации. Также можно управлять вводом параметров запроса, связав его с другим объектом на дашборде (например, с таблицей). См. раздел «[настройка фильтра](/cloud/manage/dashboards#configure-a-filter)» в кратком руководстве ниже.


## Быстрый старт {#quick-start}

Создадим дашборд для мониторинга сервиса ClickHouse с использованием системной таблицы [query_log](/operations/system-tables/query_log).


## Быстрый старт {#quick-start-1}

### Создание сохранённого запроса {#create-a-saved-query}

Если у вас уже есть сохранённые запросы для визуализации, можете пропустить этот шаг.

Откройте новую вкладку запроса. Напишем запрос для подсчёта объёма запросов по дням в сервисе с использованием системных таблиц ClickHouse:

<Image img={dashboards_2} size='md' alt='Создание сохранённого запроса' border />

Результаты запроса можно просмотреть в табличном формате или начать создавать визуализации в режиме диаграммы. На следующем шаге сохраним запрос под именем `queries over time`:

<Image img={dashboards_3} size='md' alt='Сохранение запроса' border />

Дополнительную документацию по сохранённым запросам можно найти в разделе [Сохранение запроса](/cloud/get-started/sql-console#saving-a-query).

Создадим и сохраним ещё один запрос `query count by query kind` для подсчёта количества запросов по типу. Вот визуализация данных в виде столбчатой диаграммы в SQL-консоли.

<Image
  img={dashboards_4}
  size='md'
  alt="Визуализация результатов запроса в виде столбчатой диаграммы"
  border
/>

Теперь, когда у нас есть два запроса, создадим дашборд для их визуализации и объединения.

### Создание дашборда {#create-a-dashboard}

Перейдите на панель Dashboards и нажмите «New Dashboard». После того как вы зададите имя, ваш первый дашборд будет успешно создан!

<Image img={dashboards_5} size='md' alt='Создание нового дашборда' border />

### Добавление визуализации {#add-a-visualization}

У нас есть два сохранённых запроса: `queries over time` и `query count by query kind`. Визуализируем первый в виде линейной диаграммы. Задайте заголовок и подзаголовок для визуализации и выберите запрос. Затем выберите тип диаграммы «Line» и назначьте оси x и y.

<Image img={dashboards_6} size='md' alt='Добавление визуализации' border />

Здесь также можно внести дополнительные стилистические изменения, такие как форматирование чисел, расположение легенды и подписи осей.

Далее визуализируем второй запрос в виде таблицы и разместим её под линейной диаграммой.

<Image
  img={dashboards_7}
  size='md'
  alt='Визуализация результатов запроса в виде таблицы'
  border
/>

Вы создали свой первый дашборд, визуализировав два сохранённых запроса!

### Настройка фильтра {#configure-a-filter}

Сделаем этот дашборд интерактивным, добавив фильтр по типу запроса, чтобы отображать только тренды, связанные с INSERT-запросами. Для этого используем [параметры запроса](/sql-reference/syntax#defining-and-using-query-parameters).

Нажмите на три точки рядом с линейной диаграммой, затем на кнопку с карандашом рядом с запросом, чтобы открыть встроенный редактор запросов. Здесь можно редактировать базовый сохранённый запрос непосредственно из дашборда.

<Image img={dashboards_8} size='md' alt='Редактирование базового запроса' border />

Теперь при нажатии жёлтой кнопки выполнения запроса вы увидите тот же запрос, но отфильтрованный только по INSERT-запросам. Нажмите кнопку сохранения, чтобы обновить запрос. Когда вы вернётесь к настройкам диаграммы, сможете фильтровать линейную диаграмму.

Теперь с помощью Global Filters на верхней панели можно переключать фильтр, изменяя входные данные.

<Image img={dashboards_9} size='md' alt='Настройка глобальных фильтров' border />

Предположим, вы хотите связать фильтр линейной диаграммы с таблицей. Для этого вернитесь к настройкам визуализации, измените источник значения параметра запроса query_kind на таблицу и выберите столбец query_kind в качестве поля для связывания.

<Image img={dashboards_10} size='md' alt='Изменение параметра запроса' border />

Теперь можно управлять фильтром линейной диаграммы непосредственно из таблицы запросов по типу, делая дашборд интерактивным.

<Image
  img={dashboards_11}
  size='md'
  alt='Управление фильтром на линейной диаграмме'
  border
/>
