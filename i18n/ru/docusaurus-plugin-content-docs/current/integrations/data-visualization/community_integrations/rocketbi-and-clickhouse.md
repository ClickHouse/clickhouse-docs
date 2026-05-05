---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI — это платформа самообслуживания для бизнес-аналитики, которая помогает быстро анализировать данные, создавать drag-n-drop-визуализации и совместно работать с коллегами прямо в браузере.'
title: 'ЦЕЛЬ: создайте свою первую панель мониторинга'
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

# Цель: создать свою первую панель мониторинга с Rocket.BI \{#goal-build-your-first-dashboard-with-rocketbi\}

<CommunityMaintainedBadge />

В этом руководстве вы установите Rocket.BI и создадите простую панель мониторинга.
Ниже показана эта панель мониторинга:

<Image size="md" img={rocketbi_01} alt="Панель мониторинга Rocket BI, показывающая метрики продаж с графиками и KPI" border />

<br />

Вы можете [открыть панель мониторинга по этой ссылке.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## Установка \{#install\}

Запустите RocketBI с помощью наших готовых Docker-образов.

Скачайте `docker-compose.yml` и файл конфигурации:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```

Отредактируйте файл `.clickhouse.env` и добавьте информацию о сервере ClickHouse.

Запустите RocketBI командой: `docker-compose up -d .`

Откройте браузер, перейдите по адресу `localhost:5050` и войдите, используя следующие учетные данные: `hello@gmail.com/123456`

Инструкции по сборке из исходного кода и расширенной настройке см. здесь: [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## Давайте создадим панель мониторинга \{#lets-build-the-dashboard\}

На вкладке Dashboard вы найдете свои отчеты и сможете начать визуализацию, нажав **+New**

Вы можете создавать **неограниченное количество панелей мониторинга** и добавлять **неограниченное количество диаграмм** на панель мониторинга.

<Image size="md" img={rocketbi_02} alt="Анимация, показывающая процесс создания новой диаграммы в Rocket BI" border />

<br />

Смотрите подробное руководство на YouTube: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### Создайте элементы управления для диаграммы \{#build-the-chart-controls\}

#### Создайте элемент управления метриками \{#create-a-metrics-control\}

На вкладке Tab выберите поля метрик, которые хотите использовать. Убедитесь, что параметр агрегации задан правильно.

<Image size="md" img={rocketbi_03} alt="Панель настройки элемента управления метриками Rocket BI с выбранными полями и параметрами агрегации" border />

<br />

Переименуйте фильтры и сохраните элемент управления на панели мониторинга

<Image size="md" img={rocketbi_04} alt="Элемент управления метриками с переименованными фильтрами, готовое к сохранению на панели мониторинга" border />

#### Создайте элемент управления типа «Дата» \{#create-a-date-type-control\}

Выберите поле даты в качестве основного столбца даты:

<Image size="md" img={rocketbi_05} alt="Интерфейс выбора поля даты в Rocket BI с доступными столбцами даты" border />

<br />

Добавьте дублирующиеся варианты с разными диапазонами. Например: Year, Monthly, Daily date или Day of Week.

<Image size="md" img={rocketbi_06} alt="Настройка диапазона дат с различными вариантами периодов времени, такими как год, месяц и день" border />

<br />

Переименуйте фильтры и сохраните элемент управления на панели мониторинга

<Image size="md" img={rocketbi_07} alt="Элемент управления диапазоном дат с переименованными фильтрами, готовый к сохранению на панели мониторинга" border />

### Теперь давайте создадим диаграммы \{#now-let-build-the-charts\}

#### Круговая диаграмма: метрики продаж по регионам \{#pie-chart-sales-metrics-by-regions\}

Выберите Adding new chart, затем — Select Pie Chart

<Image size="md" img={rocketbi_08} alt="Панель выбора типа диаграммы с выделенной опцией круговой диаграммы" border />

<br />

Сначала перетащите столбец &quot;Region&quot; из Dataset в поле Legend

<Image size="md" img={rocketbi_09} alt="Интерфейс перетаскивания, показывающий, как столбец Region добавляется в поле легенды" border />

<br />

Затем переключитесь на вкладку Chart Control

<Image size="md" img={rocketbi_10} alt="Интерфейс вкладки управления диаграммой, показывающий параметры настройки визуализации" border />

<br />

Перетащите элемент Metrics Control в поле Value

<Image size="md" img={rocketbi_11} alt="Элемент Metrics Control добавляется в поле значений круговой диаграммы" border />

<br />

(вы также можете использовать Metrics Control для сортировки)

Перейдите в Chart Setting для дальнейшей настройки

<Image size="md" img={rocketbi_12} alt="Панель настроек диаграммы, показывающая параметры дополнительной настройки круговой диаграммы" border />

<br />

Например, измените Data label на Percentage

<Image size="md" img={rocketbi_13} alt="Настройки подписи данных изменяются для отображения процентов на круговой диаграмме" border />

<br />

Сохраните диаграмму и добавьте её на панель мониторинга

<Image size="md" img={rocketbi_14} alt="Вид панели мониторинга с недавно добавленной круговой диаграммой и другими элементами управления" border />

#### Используйте элемент управления датой на диаграмме временных рядов \{#use-date-control-in-a-time-series-chart\}

Используйте столбчатую диаграмму с накоплением

<Image size="md" img={rocketbi_15} alt="Интерфейс создания столбчатой диаграммы с накоплением с данными временных рядов" border />

<br />

В Chart Control задайте Metrics Control для оси Y, а Date Range — для оси X

<Image size="md" img={rocketbi_16} alt="Настройка Chart Control с metrics на оси Y и диапазоном дат на оси X" border />

<br />

Добавьте столбец Region в Breakdown

<Image size="md" img={rocketbi_17} alt="Столбец Region добавляется как измерение разбивки в столбчатую диаграмму с накоплением" border />

<br />

Добавьте Number Chart в качестве KPI и завершите оформление панели мониторинга

<Image size="md" img={rocketbi_18} alt="Готовая панель мониторинга с числовыми KPI-диаграммами, круговой диаграммой и визуализацией временных рядов" border />

<br />

Теперь вы успешно создали свою первую панель мониторинга в Rocket.BI