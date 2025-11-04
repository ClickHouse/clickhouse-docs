---
slug: '/integrations/rocketbi'
sidebar_label: 'Rocket BI'
sidebar_position: 131
description: 'RocketBI это платформа бизнес-аналитики самообслуживания, которая'
title: 'ЦЕЛЬ: СОЗДАТЬ ВАШ ПЕРВЫЙ ПАНЕЛЬ УПРАВЛЕНИЯ'
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
doc_type: guide
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


# Цель: создайте свою первую панель мониторинга

<CommunityMaintainedBadge/>

В этом руководстве вы установите и создадите простую панель мониторинга с использованием Rocket.BI.
Вот панель мониторинга:

<Image size="md" img={rocketbi_01} alt="Панель мониторинга Rocket BI, показывающая показатели продаж с диаграммами и KPI" border />
<br/>

Вы можете ознакомиться с [панелью мониторинга по этой ссылке.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## Установка {#install}

Запустите RocketBI с помощью наших собранных образов docker.

Получите docker-compose.yml и файл конфигурации:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
Отредактируйте .clickhouse.env, добавив информацию о сервере clickhouse.

Запустите RocketBI, выполнив команду: ``` docker-compose up -d . ```

Откройте браузер, перейдите по адресу ```localhost:5050```, войдите с использованием этой учетной записи: ```hello@gmail.com/123456```

Чтобы собрать из исходного кода или для расширенной конфигурации, вы можете ознакомиться с [README Rocket.BI](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## Давайте создадим панель мониторинга {#lets-build-the-dashboard}

На панели мониторинга вы найдете свои отчёты, начните визуализацию, нажав **+New**

Вы можете создавать **неограниченное количество панелей мониторинга** и рисовать **неограниченное количество диаграмм** на панели мониторинга.

<Image size="md" img={rocketbi_02} alt="Анимация, показывающая процесс создания новой диаграммы в Rocket BI" border />
<br/>

Смотрите высококачественный учебник на Youtube: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### Создание элементов управления диаграммами {#build-the-chart-controls}

#### Создайте элемент управления метриками {#create-a-metrics-control}
В фильтре вкладки выберите поля метрик, которые вы хотите использовать. Убедитесь, что вы проверили настройки агрегации.

<Image size="md" img={rocketbi_03} alt="Панель конфигурации элементов управления метриками Rocket BI, показывающая выбранные поля и настройки агрегации" border />
<br/>

Переименуйте фильтры и сохраните элемент управления на панели мониторинга

<Image size="md" img={rocketbi_04} alt="Элемент управления метриками с переименованными фильтрами, готовый к сохранению на панели мониторинга" border />

#### Создайте элемент управления типом даты {#create-a-date-type-control}
Выберите поле даты в качестве основной колонки даты:

<Image size="md" img={rocketbi_05} alt="Интерфейс выбора поля даты в Rocket BI, показывающий доступные колонки даты" border />
<br/>

Добавьте дубликаты с различными диапазонами поиска. Например, Год, Месячный, Дневной даты или День недели.

<Image size="md" img={rocketbi_06} alt="Конфигурация диапазона даты, показывающая различные варианты временных периодов, такие как год, месяц и день" border />
<br/>

Переименуйте фильтры и сохраните элемент управления на панели мониторинга

<Image size="md" img={rocketbi_07} alt="Элемент управления диапазоном даты с переименованными фильтрами, готовый к сохранению на панели мониторинга" border />

### Теперь создадим диаграммы {#now-let-build-the-charts}

#### Круговая диаграмма: показатели продаж по регионам {#pie-chart-sales-metrics-by-regions}
Выберите добавление новой диаграммы, затем выберите круговую диаграмму.

<Image size="md" img={rocketbi_08} alt="Панель выбора типа диаграммы с выделенным вариантом круговой диаграммы" border />
<br/>

Сначала перетащите колонку "Регион" из набора данных в поле легенды.

<Image size="md" img={rocketbi_09} alt="Интерфейс перетаскивания, показывающий добавление колонки Регион в поле легенды" border />
<br/>

Затем переключитесь на вкладку управления диаграммой.

<Image size="md" img={rocketbi_10} alt="Интерфейс вкладки управления диаграммой, показывающий параметры конфигурации визуализации" border />
<br/>

Перетащите элемент управления метриками в поле значений.

<Image size="md" img={rocketbi_11} alt="Элемент управления метриками добавляется в поле значений круговой диаграммы" border />
<br/>

(вы также можете использовать элемент управления метриками в качестве сортировки)

Перейдите в настройки диаграммы для дальнейшей настройки.

<Image size="md" img={rocketbi_12} alt="Панель настроек диаграммы, показывающая параметры настройки для круговой диаграммы" border />
<br/>

Например, измените метку данных на процент.

<Image size="md" img={rocketbi_13} alt="Настройки меток данных изменены, чтобы показывать проценты на круговой диаграмме" border />
<br/>

Сохраните и добавьте диаграмму на панель мониторинга.

<Image size="md" img={rocketbi_14} alt="Просмотр панели мониторинга с новой добавленной круговой диаграммой и другими элементами управления" border />

#### Используйте элемент управления датами в диаграмме временных рядов {#use-date-control-in-a-time-series-chart}
Давайте используем составную столбцовую диаграмму.

<Image size="md" img={rocketbi_15} alt="Интерфейс создания составной столбцовой диаграммы с данными временных рядов" border />
<br/>

В элементе управления диаграммы используйте элемент управления метриками в качестве оси Y и диапазон дат в качестве оси X.

<Image size="md" img={rocketbi_16} alt="Конфигурация управления диаграммой с метриками по оси Y и диапазоном дат по оси X" border />
<br/>

Добавьте колонку региона в разбивку.

<Image size="md" img={rocketbi_17} alt="Колонка региона добавлена в качестве измерения разбивки в составной столбцовой диаграмме" border />
<br/>

Добавьте числовую диаграмму в качестве KPI и завершите панель мониторинга.

<Image size="md" img={rocketbi_18} alt="Завершенная панель мониторинга с KPI числовыми диаграммами, круговой диаграммой и визуализацией временных рядов" border />
<br/>

Теперь вы успешно создали свою первую панель мониторинга с помощью rocket.BI.