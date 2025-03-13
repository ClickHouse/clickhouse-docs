---
sidebar_label: Rocket BI
sidebar_position: 131
slug: /integrations/rocketbi
keywords: [clickhouse, RocketBI, connect, integrate, ui]
description: RocketBI - это платформа для аналитики данных самообслуживания, которая помогает вам быстро анализировать данные, строить визуализации с помощью перетаскивания и сотрудничать с коллегами прямо в вашем веб-браузере.
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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


# ЦЕЛЬ: СОЗДАЙТЕ СВОЙ ПЕРВЫЙ ПАНЕЛЬ УПРАВЛЕНИЯ

В этом руководстве вы установите и создадите простую панель управления, используя Rocket.BI. 
Это панель управления:

<img width="800" alt="Github RocketBI" src={rocketbi_01}/>
<br/>

Вы можете ознакомиться с [панелью управления по этой ссылке.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## УСТАНОВКА {#install}

Запустите RocketBI с нашими предустановленными образами docker.

Получите файл docker-compose.yml и конфигурационный файл:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
Отредактируйте .clickhouse.env, добавив информацию о сервере ClickHouse.

Запустите RocketBI, выполнив команду: ``` docker-compose up -d . ```

Откройте браузер, перейдите по адресу ```localhost:5050```, войдите с помощью этой учетной записи: ```hello@gmail.com/123456```

Для сборки из исходников или для более сложной конфигурации вы можете посмотреть здесь [README Rocket.BI](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## ДАВАЙТЕ СОЗДАДИМ ПАНЕЛЬ УПРАВЛЕНИЯ {#lets-build-the-dashboard}

В панели управления вы найдете свои отчеты, начните визуализацию, нажав **+Новый**

Вы можете создать **неограниченное количество панелей управления** и нарисовать **неограниченное количество графиков** на панели управления.

<img width="800" alt="RocketBI create chart" src={rocketbi_02}/>
<br/>

Смотрите подробный урок на Youtube: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### Создание элементов управления графиком {#build-the-chart-controls}

#### Создание элемента управления метриками {#create-a-metrics-control}
В фильтре вкладки выберите метрики, которые вы хотите использовать. Убедитесь, что настройка агрегации установлена правильно.

<img width="650" alt="RocketBI chart 6" src={rocketbi_03}/>
<br/>

Переименуйте фильтры и сохраните элемент управления на панели управления

<img width="400" alt="Metrics Control" src={rocketbi_04}/>

#### Создание элемента управления для типа даты {#create-a-date-type-control}
Выберите поле даты в качестве основной даты:

<img width="650" alt="RocketBI chart 4" src={rocketbi_05}/>
<br/>

Добавьте дублированные варианты с различными диапазонами поиска. Например, Год, Месяц, Дата или День недели.

<img width="650" alt="RocketBI chart 5" src={rocketbi_06}/>
<br/>

Переименуйте фильтры и сохраните элемент управления на панели управления

<img width="200" alt="Date Range Control" src={rocketbi_07}/>

### Теперь давайте создадим графики {#now-let-build-the-charts}

#### Круговая диаграмма: метрики продаж по регионам {#pie-chart-sales-metrics-by-regions}
Выберите Добавить новый график, затем выберите Круговую диаграмму

<img width="650" alt="Add Pie Chart" src={rocketbi_08}/>
<br/>

Сначала перетащите колонку "Регион" из набора данных в поле Легенда

<img width="650" alt="Drag-n-drop Column to Chart" src={rocketbi_09}/>
<br/>

Затем перейдите на вкладку Управление графиком

<img width="650" alt="Navigate to Chart Control in Visualization" src={rocketbi_10}/>
<br/>

Перетащите элемент управления метриками в поле Значение

<img width="650" alt="Use Metrics Control in Chart" src={rocketbi_11}/>
<br/>

(вы также можете использовать элемент управления метриками для сортировки)

Перейдите в Настройки графика для дальнейшей настройки

<img width="650" alt="Custom the Chart with Setting" src={rocketbi_12}/>
<br/>

Например, измените метку данных на Процент

<img width="650" alt="Chart Customization Example" src={rocketbi_13}/>
<br/>

Сохраните и добавьте график на панель управления

<img width="650" alt="Overview Dashboard with Pie Chart" src={rocketbi_14}/>

#### Используйте элемент управления даты в графике временных рядов {#use-date-control-in-a-time-series-chart}
Давайте используем сложенный столбчатый график

<img width="650" alt="Create a Time-series chart with Tab Control" src={rocketbi_15}/>
<br/>

В элементе управления графиком используйте элемент управления метриками в качестве оси Y и диапазон дат в качестве оси X

<img width="650" alt="Use Date Range as Controller" src={rocketbi_16}/>
<br/>

Добавьте колонку региона в Разделение

<img width="650" alt="Add Region into Breakdown" src={rocketbi_17}/>
<br/>

Добавьте числовой график в качестве KPI и улучшите панель управления

<img width="800" alt="Screenshot 2022-11-17 at 10 43 29" src={rocketbi_18} />
<br/>

Теперь вы успешно создали свою первую панель управления с помощью rocket.BI.
