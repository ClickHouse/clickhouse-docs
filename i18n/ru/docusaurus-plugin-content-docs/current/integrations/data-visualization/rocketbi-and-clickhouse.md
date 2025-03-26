---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI — это платформа бизнес-аналитики самообслуживания, которая помогает вам быстро анализировать данные, создавать визуализации с помощью перетаскивания и сотрудничать с коллегами прямо в вашем веб-браузере.'
title: 'ЦЕЛЬ: СОЗДАТЬ ВАШ ПЕРВЫЙ ПАНЕЛЬ'
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


# ЦЕЛЬ: СОЗДАТЬ ВАШ ПЕРВЫЙ ПАНЕЛЬ

<CommunityMaintainedBadge/>

В этом руководстве вы установите и создадите простую панель с помощью Rocket.BI.
Вот панель:

<Image size="md" img={rocketbi_01} alt="Панель Rocket BI, показывающая метрики продаж с графиками и KPI" border />
<br/>

Вы можете ознакомиться с [панелью по этой ссылке.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## УСТАНОВКА {#install}

Запустите RocketBI с нашими уже подготовленными образами docker.

Получите docker-compose.yml и файл конфигурации:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
Отредактируйте .clickhouse.env, добавив информацию о сервере clickhouse.

Запустите RocketBI, выполнив команду: ``` docker-compose up -d . ```

Откройте браузер, перейдите на ```localhost:5050```, войдите с помощью этой учетной записи: ```hello@gmail.com/123456```

Чтобы собрать из исходников или настроить расширенные параметры, вы можете ознакомиться с [README Rocket.BI](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## ДАВАЙТЕ СОЗДАДИМ ПАНЕЛЬ {#lets-build-the-dashboard}

На панели вы найдете свои отчеты, начните визуализацию, нажав **+Новый**

Вы можете создавать **неограниченные панели** и рисовать **неограниченные графики** на панели.

<Image size="md" img={rocketbi_02} alt="Анимация, показывающая процесс создания нового графика в Rocket BI" border />
<br/>

Посмотрите подробное руководство на Youtube: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### Создание элементов управления графиками {#build-the-chart-controls}

#### Создание элемента управления метриками {#create-a-metrics-control}
В фильтре вкладки выберите метрики, которые хотите использовать. Убедитесь, что выбраны настройки агрегации.

<Image size="md" img={rocketbi_03} alt="Настройка элемента управления метриками Rocket BI, показывающая выбранные поля и параметры агрегации" border />
<br/>

Переименуйте фильтры и сохраните элемент управления на панели

<Image size="md" img={rocketbi_04} alt="Элемент управления метриками с переименованными фильтрами, готовый к сохранению на панель" border />


#### Создание элемента управления типом даты {#create-a-date-type-control}
Выберите поле даты в качестве основной даты:

<Image size="md" img={rocketbi_05} alt="Интерфейс выбора поля даты в Rocket BI, показывающий доступные столбцы даты" border />
<br/>

Добавьте дублирующие варианты с различными диапазонами поиска. Например, Год, Месячный, Дневной или День недели.

<Image size="md" img={rocketbi_06} alt="Настройка диапазона даты, показывающая различные варианты временных периодов, такие как год, месяц и день" border />
<br/>

Переименуйте фильтры и сохраните элемент управления на панели

<Image size="md" img={rocketbi_07} alt="Элемент управления диапазоном даты с переименованными фильтрами, готовый к сохранению на панель" border />

### Теперь давайте создадим графики {#now-let-build-the-charts}

#### Круговая диаграмма: метрики продаж по регионам {#pie-chart-sales-metrics-by-regions}
Выберите добавление нового графика, затем выберите круговую диаграмму

<Image size="md" img={rocketbi_08} alt="Панель выбора типа графика с выделенной опцией круговой диаграммы" border />
<br/>

Сначала перетащите столбец "Регион" из набора данных в поле легенды

<Image size="md" img={rocketbi_09} alt="Интерфейс перетаскивания, показывающий добавление столбца Регион в поле легенды" border />
<br/>

Затем измените на вкладку управления графиком

<Image size="md" img={rocketbi_10} alt="Интерфейс вкладки управления графиком, показывающий параметры конфигурации визуализации" border />
<br/>

Перетащите элемент управления метриками в поле значений

<Image size="md" img={rocketbi_11} alt="Элемент управления метриками, добавленный в поле значений круговой диаграммы" border />
<br/>

(вы также можете использовать элемент управления метриками в качестве сортировки)

Перейдите в настройки графика для дальнейшей настройки

<Image size="md" img={rocketbi_12} alt="Панель настроек графика, показывающая параметры настройки для круговой диаграммы" border />
<br/>

Например, измените метку данных на процент

<Image size="md" img={rocketbi_13} alt="Настройки метки данных, измененные для отображения процентов на круговой диаграмме" border />
<br/>

Сохраните и добавьте график на панель

<Image size="md" img={rocketbi_14} alt="Представление панели, показывающее только что добавленную круговую диаграмму с другими элементами управления" border />

#### Использование элемента управления датой в графике временных рядов {#use-date-control-in-a-time-series-chart}
Давайте используем сложенный столбчатый график

<Image size="md" img={rocketbi_15} alt="Интерфейс создания сложенного столбчатого графика с данными временных рядов" border />
<br/>

В управлении графиком используйте элемент управления метриками в качестве оси Y и диапазон дат в качестве оси X

<Image size="md" img={rocketbi_16} alt="Конфигурация управления графиком, показывающая метрики на оси Y и диапазон дат на оси X" border />
<br/>

Добавьте столбец региона в разбивку

<Image size="md" img={rocketbi_17} alt="Столбец региона, добавленный в качестве разбивочного измерения в сложенный столбчатый график" border />
<br/>

Добавьте числовой график в качестве KPI и улучшите панель

<Image size="md" img={rocketbi_18} alt="Завершенная панель с графиками KPI, круговой диаграммой и визуализацией временных рядов" border />
<br/>

Теперь вы успешно создали свою первую панель с помощью rocket.BI
