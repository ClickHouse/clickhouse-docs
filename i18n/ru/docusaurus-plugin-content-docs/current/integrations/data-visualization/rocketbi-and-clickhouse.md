---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI - это платформа бизнес-аналитики самообслуживания, которая помогает вам быстро анализировать данные, создавать визуализации с помощью перетаскивания и сотрудничать с коллегами прямо в вашем веб-браузере.'
title: 'ЦЕЛЬ: СОЗДАТЬ ВАШ ПЕРВЫЙ ПАНЕЛЬ УПРАВЛЕНИЯ'
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


# ЦЕЛЬ: СОЗДАТЬ ВАШ ПЕРВЫЙ ПАНЕЛЬ УПРАВЛЕНИЯ

<CommunityMaintainedBadge/>

В этом руководстве вы установите и создадите простую панель управления, используя Rocket.BI.
Вот панель управления:

<Image size="md" img={rocketbi_01} alt="Панель управления Rocket BI, показывающая метрики продаж с графиками и KPI" border />
<br/>

Вы можете ознакомиться с [панелью управления по этой ссылке.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## УСТАНОВКА {#install}

Запустите RocketBI с помощью наших заранее подготовленных изображений docker.

Получите docker-compose.yml и файл конфигурации:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
Отредактируйте .clickhouse.env, добавив информацию о сервере clickhouse.

Запустите RocketBI, выполнив команду: ``` docker-compose up -d . ```

Откройте браузер, перейдите на ```localhost:5050```, войдите с помощью этой учетной записи: ```hello@gmail.com/123456```

Чтобы создать из исходников или для расширенной конфигурации, вы можете проверить это здесь [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## ДАВАЙТЕ СОЗДАМ ПАНЕЛЬ УПРАВЛЕНИЯ {#lets-build-the-dashboard}

На панели управления вы найдете ваши отчеты, начните визуализацию, нажав **+Новая**

Вы можете создавать **неограниченные панели управления** и рисовать **неограниченные графики** на панели управления.

<Image size="md" img={rocketbi_02} alt="Анимация, показывающая процесс создания нового графика в Rocket BI" border />
<br/>

Смотрите высококачественный учебник на Youtube: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### Создание Элементов Управления Графика {#build-the-chart-controls}

#### Создайте Элемент Управления Метриками {#create-a-metrics-control}
В фильтре вкладки выберите поля метрик, которые вы хотите использовать. Убедитесь, что вы следите за настройкой агрегации.

<Image size="md" img={rocketbi_03} alt="Панель настройки элемента управления метриками Rocket BI, показывающая выбранные поля и настройки агрегации" border />
<br/>

Переименуйте фильтры и сохраните элемент управления на панели управления.

<Image size="md" img={rocketbi_04} alt="Элемент управления метриками с переименованными фильтрами, готовый к сохранению на панели управления" border />


#### Создайте Элемент Управления Типом Даты {#create-a-date-type-control}
Выберите поле Даты в качестве основной колонки даты:

<Image size="md" img={rocketbi_05} alt="Интерфейс выбора поля даты в Rocket BI, показывающий доступные колонки даты" border />
<br/>

Добавьте дублирующие варианты с разными диапазонами поиска. Например, Год, Месяц, Дата или День недели.

<Image size="md" img={rocketbi_06} alt="Настройка диапазона дат, показывающая разные варианты временных периодов, такие как год, месяц и день" border />
<br/>

Переименуйте фильтры и сохраните элемент управления на панели управления.

<Image size="md" img={rocketbi_07} alt="Элемент управления диапазоном дат с переименованными фильтрами, готовый к сохранению на панели управления" border />

### Теперь давайте создадим Графики {#now-let-build-the-charts}

#### Круговая Диаграмма: Метрики Продаж по Регионам {#pie-chart-sales-metrics-by-regions}
Выберите Добавление нового графика, затем выберите Круговую диаграмму.

<Image size="md" img={rocketbi_08} alt="Панель выбора типа графика с выделенной опцией круговой диаграммы" border />
<br/>

Сначала перетащите колонку "Регион" из набора данных в поле Легенды.

<Image size="md" img={rocketbi_09} alt="Интерфейс перетаскивания, показывающий добавление колонки Регион в поле легенды" border />
<br/>

Затем переключитесь на вкладку Элемента Управления Графиком.

<Image size="md" img={rocketbi_10} alt="Интерфейс вкладки элемента управления графиком, показывающий параметры настройки визуализации" border />
<br/>

Перетащите Элемент Управления Метриками в поле Значения.

<Image size="md" img={rocketbi_11} alt="Элемент управления метриками добавляется в поле значений круговой диаграммы" border />
<br/>

(вы также можете использовать элемент управления метриками в качестве сортировки)

Перейдите к настройкам графика для дальнейшей настройки.

<Image size="md" img={rocketbi_12} alt="Панель настроек графика, показывающая параметры настройки круговой диаграммы" border />
<br/>

Например, измените Подпись данных на Процент.

<Image size="md" img={rocketbi_13} alt="Настройки подписи данных изменены для отображения процентов на круговой диаграмме" border />
<br/>

Сохраните и добавьте график на панель управления.

<Image size="md" img={rocketbi_14} alt="Вид панели управления, показывающий недавно добавленную круговую диаграмму с другими элементами управления" border />

#### Используйте Элемент Управления Датой в Временном Графике {#use-date-control-in-a-time-series-chart}
Давайте используем Сложенную Столбчатую Диаграмму.

<Image size="md" img={rocketbi_15} alt="Интерфейс создания сложенной столбчатой диаграммы с данными временных рядов" border />
<br/>

В Элементе Управления Графиком используйте Элемент Управления Метриками в качестве оси Y и Диапазон Дат в качестве оси X.

<Image size="md" img={rocketbi_16} alt="Настройка элемента управления графиком, показывающая метрики на оси Y и диапазон дат на оси X" border />
<br/>

Добавьте колонку Регион в Разбиение.

<Image size="md" img={rocketbi_17} alt="Колонка Регион добавляется как элемент разбиения в сложенную столбчатую диаграмму" border />
<br/>

Добавьте Числовой График в качестве KPI и улучшьте панель управления.

<Image size="md" img={rocketbi_18} alt="Завершенная панель управления с графиками KPI, круговой диаграммой и визуализацией временных рядов" border />
<br/>

Теперь вы успешно создали свою первую панель управления с rocket.BI.
