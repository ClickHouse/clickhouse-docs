---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI — это self-service платформа бизнес-аналитики, которая помогает быстро анализировать данные, создавать визуализации с помощью drag-and-drop и совместно работать с коллегами прямо в веб-браузере.'
title: 'ЦЕЛЬ: СОЗДАТЬ СВОЙ ПЕРВЫЙ ДАШБОРД'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import rocketbi_01 from '@site/static/images/integrations/data-visualization/rocketbi_01.gif';
import rocketbi_02 from '@site/static/images/integrations/data-visualization/rocketbi_02.gif';
import rocketbi_03 from '@site/static/images/integrations/data-visualization/rocketbi_03.png';
import rocketbi_04 from '@site/static/images/integrations/data-visualization/rocketbi_04.png';
import rocketbi_05 from '@site/static/images/integrations/data-visualization/rocketbi_05.png';
import rocketbi_06 from '@site/static/images/integrations/data-visualization/rocketbi_06.png';
import rocketbi_07 from '@site/static/images/integrations/data-visualization/rocketbi_07.png';
import rocketbi_08 from '@site/static/images/integrations/data-visualization/rocketbi_08.png';
import rocketbi_09 from '@site/static/images/integrations/data-visualization/rocketbi_09.png';
import rocketbi_10 from '@site/static/images/integrations/data-visualization/rocketbi_10.png';
import rocketbi_11 from '@site/static/images/integrations/data-visualization/rocketbi_11.png';
import rocketbi_12 from '@site/static/images/integrations/data-visualization/rocketbi_12.png';
import rocketbi_13 from '@site/static/images/integrations/data-visualization/rocketbi_13.png';
import rocketbi_14 from '@site/static/images/integrations/data-visualization/rocketbi_14.png';
import rocketbi_15 from '@site/static/images/integrations/data-visualization/rocketbi_15.png';
import rocketbi_16 from '@site/static/images/integrations/data-visualization/rocketbi_16.png';
import rocketbi_17 from '@site/static/images/integrations/data-visualization/rocketbi_17.png';
import rocketbi_18 from '@site/static/images/integrations/data-visualization/rocketbi_18.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Цель: создать свой первый дашборд в Rocket.BI {#goal-build-your-first-dashboard-with-rocketbi}

<CommunityMaintainedBadge/>

В этом руководстве вы установите и создадите простой дашборд с помощью Rocket.BI.
Вот как он выглядит:

<Image size="md" img={rocketbi_01} alt="Дашборд Rocket BI с метриками продаж, графиками и ключевыми показателями" border />

<br/>

Вы можете открыть [этот дашборд по ссылке.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## Установка {#install}

Запустите RocketBI с помощью наших предварительно собранных образов Docker.

Скачайте файл docker-compose.yml и конфигурационный файл:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```

Отредактируйте файл `.clickhouse.env` и добавьте данные сервера ClickHouse.

Запустите RocketBI командой: `docker-compose up -d .`

Откройте браузер, перейдите по адресу `localhost:5050`, войдите с этой учетной записью: `hello@gmail.com/123456`.

Чтобы собрать из исходников или выполнить расширенную настройку, ознакомьтесь с файлом [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md).


## Давайте соберём дашборд {#lets-build-the-dashboard}

Во вкладке Dashboard вы найдёте свои отчёты, начните создавать визуализации, нажав **+New**.

Вы можете создавать **неограниченное количество дашбордов** и строить **неограниченное количество диаграмм** в одном дашборде.

<Image size="md" img={rocketbi_02} alt="Анимация, показывающая процесс создания новой диаграммы в Rocket BI" border />

<br/>

Подробный обучающий ролик в высоком разрешении смотрите на YouTube: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### Создаём элементы управления для диаграмм {#build-the-chart-controls}

#### Создайте контрол метрик {#create-a-metrics-control}

Во вкладке Tab filter выберите поля метрик, которые вы хотите использовать. Убедитесь, что корректно настроена агрегация.

<Image size="md" img={rocketbi_03} alt="Панель конфигурации контрола метрик в Rocket BI с выбранными полями и настройками агрегации" border />

<br/>

Переименуйте фильтры и сохраните Control в Dashboard.

<Image size="md" img={rocketbi_04} alt="Контрол метрик с переименованными фильтрами, готовый к сохранению в дашборд" border />

#### Создайте контрол типа дата {#create-a-date-type-control}

Выберите поле Date как основную колонку Main Date:

<Image size="md" img={rocketbi_05} alt="Интерфейс выбора поля даты в Rocket BI с доступными колонками дат" border />

<br/>

Добавьте дублирующие варианты с разными диапазонами выборки. Например, Year, Monthly, Daily date или Day of Week.

<Image size="md" img={rocketbi_06} alt="Конфигурация диапазона дат с различными вариантами периодов, такими как год, месяц и день" border />

<br/>

Переименуйте фильтры и сохраните Control в Dashboard.

<Image size="md" img={rocketbi_07} alt="Контрол диапазона дат с переименованными фильтрами, готовый к сохранению в дашборд" border />

### Теперь давайте построим диаграммы {#now-let-build-the-charts}

#### Круговая диаграмма: метрики продаж по регионам {#pie-chart-sales-metrics-by-regions}

Выберите добавление новой диаграммы, затем выберите Pie Chart.

<Image size="md" img={rocketbi_08} alt="Панель выбора типа диаграммы с выделенным вариантом круговой диаграммы" border />

<br/>

Сначала перетащите колонку «Region» из Dataset в поле Legend.

<Image size="md" img={rocketbi_09} alt="Интерфейс drag-and-drop, показывающий добавление колонки Region в поле Legend" border />

<br/>

Затем перейдите на вкладку Chart Control.

<Image size="md" img={rocketbi_10} alt="Интерфейс вкладки Chart Control с опциями конфигурации визуализации" border />

<br/>

Перетащите Metrics Control в поле Value.

<Image size="md" img={rocketbi_11} alt="Контрол метрик, добавляемый в поле Value круговой диаграммы" border />

<br/>

(вы также можете использовать Metrics Control для сортировки)

Перейдите в Chart Setting для дополнительной настройки.

<Image size="md" img={rocketbi_12} alt="Панель настроек диаграммы с опциями кастомизации круговой диаграммы" border />

<br/>

Например, измените Data label на Percentage.

<Image size="md" img={rocketbi_13} alt="Настройки подписей данных, изменяемые на отображение процентов в круговой диаграмме" border />

<br/>

Сохраните и добавьте диаграмму в Dashboard.

<Image size="md" img={rocketbi_14} alt="Вид дашборда с только что добавленной круговой диаграммой и другими контролами" border />

#### Использование дата-контрола во временной диаграмме {#use-date-control-in-a-time-series-chart}

Используем Stacked Column Chart.

<Image size="md" img={rocketbi_15} alt="Интерфейс создания составной столбчатой диаграммы с временными рядами" border />

<br/>

В Chart Control используйте Metrics Control как ось Y и Date Range как ось X.

<Image size="md" img={rocketbi_16} alt="Конфигурация Chart Control с метриками по оси Y и диапазоном дат по оси X" border />

<br/>

Добавьте колонку Region в Breakdown.

<Image size="md" img={rocketbi_17} alt="Колонка Region, добавляемая как измерение Breakdown в составной столбчатой диаграмме" border />

<br/>

Добавьте Number Chart как KPI и сделайте Dashboard более наглядным.

<Image size="md" img={rocketbi_18} alt="Готовый дашборд с KPI Number-диаграммами, круговой диаграммой и визуализацией временного ряда" border />

<br/>

Теперь вы успешно собрали свой первый дашборд в rocket.BI.