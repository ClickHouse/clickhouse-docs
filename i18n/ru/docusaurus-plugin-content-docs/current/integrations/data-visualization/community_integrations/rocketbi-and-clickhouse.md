---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI — это платформа бизнес-аналитики самообслуживания, которая помогает быстро анализировать данные, создавать визуализации с помощью механизма drag-and-drop и совместно работать с коллегами прямо в браузере.'
title: 'ЦЕЛЬ: СОЗДАТЬ ПЕРВЫЙ ДАШБОРД'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# Цель: создать первый дашборд в Rocket.BI

<CommunityMaintainedBadge/>

В этом руководстве вы установите и создадите простой дашборд при помощи Rocket.BI.
Вот этот дашборд:

<Image size="md" img={rocketbi_01} alt="Дашборд Rocket BI, показывающий метрики продаж с диаграммами и ключевыми показателями (KPI)" border />
<br/>

Вы можете просмотреть [дашборд по этой ссылке.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)



## Установка {#install}

Запустите RocketBI с помощью наших готовых образов Docker.

Загрузите файлы docker-compose.yml и конфигурации:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```

Отредактируйте файл .clickhouse.env, добавив информацию о сервере ClickHouse.

Запустите RocketBI, выполнив команду: `docker-compose up -d .`

Откройте браузер, перейдите по адресу `localhost:5050` и войдите в систему, используя учетные данные: `hello@gmail.com/123456`

Для сборки из исходного кода или расширенной настройки см. [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)


## Создание дашборда {#lets-build-the-dashboard}

В разделе Dashboard вы найдете свои отчеты. Начните визуализацию, нажав **+New**

Вы можете создавать **неограниченное количество дашбордов** и размещать **неограниченное количество графиков** на дашборде.

<Image
  size='md'
  img={rocketbi_02}
  alt='Анимация, демонстрирующая процесс создания нового графика в Rocket BI'
  border
/>
<br />

Смотрите подробное руководство на YouTube: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### Создание элементов управления графиками {#build-the-chart-controls}

#### Создание элемента управления метриками {#create-a-metrics-control}

На вкладке фильтров выберите поля метрик, которые хотите использовать. Обязательно проверьте настройки агрегации.

<Image
  size='md'
  img={rocketbi_03}
  alt='Панель конфигурации элемента управления метриками Rocket BI с выбранными полями и настройками агрегации'
  border
/>
<br />

Переименуйте фильтры и сохраните элемент управления на дашборде

<Image
  size='md'
  img={rocketbi_04}
  alt='Элемент управления метриками с переименованными фильтрами, готовый к сохранению на дашборде'
  border
/>

#### Создание элемента управления датами {#create-a-date-type-control}

Выберите поле даты в качестве основного столбца даты:

<Image
  size='md'
  img={rocketbi_05}
  alt='Интерфейс выбора поля даты в Rocket BI с доступными столбцами дат'
  border
/>
<br />

Добавьте дублирующие варианты с различными диапазонами. Например, год, месяц, день или день недели.

<Image
  size='md'
  img={rocketbi_06}
  alt='Конфигурация диапазона дат с различными вариантами временных периодов, такими как год, месяц и день'
  border
/>
<br />

Переименуйте фильтры и сохраните элемент управления на дашборде

<Image
  size='md'
  img={rocketbi_07}
  alt='Элемент управления диапазоном дат с переименованными фильтрами, готовый к сохранению на дашборде'
  border
/>

### Теперь создадим графики {#now-let-build-the-charts}

#### Круговая диаграмма: метрики продаж по регионам {#pie-chart-sales-metrics-by-regions}

Выберите добавление нового графика, затем выберите круговую диаграмму

<Image
  size='md'
  img={rocketbi_08}
  alt='Панель выбора типа графика с выделенной опцией круговой диаграммы'
  border
/>
<br />

Сначала перетащите столбец "Region" из набора данных в поле легенды

<Image
  size='md'
  img={rocketbi_09}
  alt='Интерфейс перетаскивания, показывающий добавление столбца Region в поле легенды'
  border
/>
<br />

Затем переключитесь на вкладку управления графиком

<Image
  size='md'
  img={rocketbi_10}
  alt='Интерфейс вкладки управления графиком с опциями конфигурации визуализации'
  border
/>
<br />

Перетащите элемент управления метриками в поле значений

<Image
  size='md'
  img={rocketbi_11}
  alt='Элемент управления метриками добавляется в поле значений круговой диаграммы'
  border
/>
<br />

(вы также можете использовать элемент управления метриками для сортировки)

Перейдите в настройки графика для дальнейшей настройки

<Image
  size='md'
  img={rocketbi_12}
  alt='Панель настроек графика с опциями настройки круговой диаграммы'
  border
/>
<br />

Например, измените метки данных на проценты

<Image
  size='md'
  img={rocketbi_13}
  alt='Настройки меток данных изменяются для отображения процентов на круговой диаграмме'
  border
/>
<br />

Сохраните и добавьте график на дашборд

<Image
  size='md'
  img={rocketbi_14}
  alt='Вид дашборда с только что добавленной круговой диаграммой и другими элементами управления'
  border
/>

#### Использование элемента управления датами в графике временных рядов {#use-date-control-in-a-time-series-chart}

Используем столбчатую диаграмму с накоплением

<Image
  size='md'
  img={rocketbi_15}
  alt='Интерфейс создания столбчатой диаграммы с накоплением с данными временных рядов'
  border
/>
<br />

В управлении графиком используйте элемент управления метриками для оси Y и диапазон дат для оси X

<Image
  size='md'
  img={rocketbi_16}
  alt='Конфигурация управления графиком с метриками на оси Y и диапазоном дат на оси X'
  border
/>
<br />

Добавьте столбец Region в разбивку

<Image
  size='md'
  img={rocketbi_17}
  alt='Столбец Region добавляется как измерение разбивки в столбчатой диаграмме с накоплением'
  border
/>
<br />

Добавьте числовые графики в качестве KPI и оформите дашборд

<Image
  size='md'
  img={rocketbi_18}
  alt='Полный дашборд с числовыми графиками KPI, круговой диаграммой и визуализацией временных рядов'
  border
/>
<br />

Теперь вы успешно создали свой первый дашборд с помощью rocket.BI
