---
'sidebar_label': 'Superset'
'sidebar_position': 198
'slug': '/integrations/superset'
'keywords':
- 'superset'
'description': 'Apache Superset является открытой платформой для исследования и визуализации
  данных.'
'title': 'Подключение Superset к ClickHouse'
'show_related_blogs': true
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import superset_01 from '@site/static/images/integrations/data-visualization/superset_01.png';
import superset_02 from '@site/static/images/integrations/data-visualization/superset_02.png';
import superset_03 from '@site/static/images/integrations/data-visualization/superset_03.png';
import superset_04 from '@site/static/images/integrations/data-visualization/superset_04.png';
import superset_05 from '@site/static/images/integrations/data-visualization/superset_05.png';
import superset_06 from '@site/static/images/integrations/data-visualization/superset_06.png';
import superset_08 from '@site/static/images/integrations/data-visualization/superset_08.png';
import superset_09 from '@site/static/images/integrations/data-visualization/superset_09.png';
import superset_10 from '@site/static/images/integrations/data-visualization/superset_10.png';
import superset_11 from '@site/static/images/integrations/data-visualization/superset_11.png';
import superset_12 from '@site/static/images/integrations/data-visualization/superset_12.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Superset к ClickHouse

<CommunityMaintainedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> — это платформа для исследования и визуализации данных с открытым исходным кодом, написанная на Python. Superset подключается к ClickHouse с использованием Python-драйвера, предоставленного ClickHouse. Давайте посмотрим, как это работает...

## Цель {#goal}

В этом руководстве вы создадите панель инструментов в Superset с данными из базы данных ClickHouse. Панель будет выглядеть следующим образом:

<Image size="md" img={superset_12} alt="Панель инструментов Superset, показывающая цены на недвижимость в Великобритании с несколькими визуализациями, включая круговые диаграммы и таблицы" border />
<br/>

:::tip Добавьте данные
Если у вас нет набора данных для работы, вы можете добавить один из примеров. В этом руководстве используется набор данных [Цены, уплаченные в Великобритании](/getting-started/example-datasets/uk-price-paid.md), так что вы можете выбрать именно его. В той же категории документации есть еще несколько наборов для ознакомления.
:::

## 1. Соберите данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Установите драйвер {#2-install-the-driver}

1. Superset использует драйвер `clickhouse-connect` для подключения к ClickHouse. Подробности о `clickhouse-connect` можно найти по адресу <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>, и его можно установить с помощью следующей команды:

```console
pip install clickhouse-connect
```

2. Запустите (или перезапустите) Superset.

## 3. Подключите Superset к ClickHouse {#3-connect-superset-to-clickhouse}

1. В Superset выберите **Данные** в верхнем меню, а затем **Базы данных** в выпадающем меню. Добавьте новую базу данных, нажав кнопку **+ База данных**:

<Image size="lg" img={superset_01} alt="Интерфейс Superset, показывающий меню База данных с выделенной кнопкой + База данных" border />
<br/>

2. На первом этапе выберите **ClickHouse Connect** в качестве типа базы данных:

<Image size="sm" img={superset_02} alt="Визард подключения базы данных Superset, показывающий выбранный вариант ClickHouse Connect" border />
<br/>

3. На втором этапе:
- Включите или отключите SSL.
- Введите информацию о подключении, которую вы собрали ранее.
- Укажите **ИМЯ ДИСПЛЕЯ**: это может быть любое имя, которое вы предпочитаете. Если вы будете подключаться к нескольким базам данных ClickHouse, сделайте имя более описательным.

<Image size="sm" img={superset_03} alt="Форма конфигурации подключения Superset, показывающая параметры подключения ClickHouse" border />
<br/>

4. Нажмите кнопки **ПОДКЛЮЧИТЬ** и затем **ЗАВЕРШИТЬ**, чтобы завершить мастер настройки, и вы должны увидеть вашу базу данных в списке баз данных.

## 4. Добавьте набор данных {#4-add-a-dataset}

1. Чтобы взаимодействовать с данными ClickHouse с помощью Superset, необходимо определить **_набор данных_**. В верхнем меню Superset выберите **Данные**, затем **Наборы данных** в выпадающем меню.

2. Нажмите кнопку для добавления набора данных. Выберите вашу новую базу данных в качестве источника данных, и вы увидите таблицы, определенные в вашей базе данных:

<Image size="sm" img={superset_04} alt="Диалог создания набора данных Superset, показывающий доступные таблицы из базы данных ClickHouse" border />
<br/>

3. Нажмите кнопку **ДОБАВИТЬ** внизу окна диалога, и ваша таблица появится в списке наборов данных. Вы готовы создать панель инструментов и проанализировать ваши данные ClickHouse!

## 5. Создание диаграмм и панели инструментов в Superset {#5--creating-charts-and-a-dashboard-in-superset}

Если вы знакомы с Superset, вы будете чувствовать себя как дома в этом следующем разделе. Если вы новичок в Superset, ну... это похоже на многие другие классные инструменты визуализации, доступные в мире — для начала не требуется много времени, но детали и нюансы осваиваются со временем, по мере работы с инструментом.

1. Вы начинаете с панели инструментов. В верхнем меню Superset выберите **Панели инструментов**. Нажмите кнопку в правом верхнем углу, чтобы добавить новую панель инструментов. Следующая панель называется **Цены на недвижимость в Великобритании**:

<Image size="md" img={superset_05} alt="Пустая панель инструментов Superset, названная Цены на недвижимость в Великобритании, готовая для добавления диаграмм" border />
<br/>

2. Чтобы создать новую диаграмму, выберите **Диаграммы** в верхнем меню и нажмите кнопку для добавления новой диаграммы. Вам будет показано много вариантов. Следующий пример показывает диаграмму **Круговая диаграмма**, использующую набор данных **uk_price_paid** из выпадающего списка **ВЫБРАТЬ НАБОР ДАННЫХ**:

<Image size="md" img={superset_06} alt="Интерфейс создания диаграммы Superset с выбранным типом визуализации Круговая диаграмма" border />
<br/>

3. Круговые диаграммы Superset нуждаются в **Размере** и **Метрике**, остальные параметры являются необязательными. Вы можете выбрать свои поля для размера и метрики, в этом примере используется поле ClickHouse `district` в качестве размера и `AVG(price)` в качестве метрики.

<Image size="md" img={superset_08} alt="Конфигурация размера, показывающая выбранное поле района для круговой диаграммы" border />
<Image size="md" img={superset_09} alt="Конфигурация метрики, показывающая агрегатную функцию AVG(price) для круговой диаграммы" border />
<br/>

5. Если вам больше нравятся кольцевые диаграммы, чем круговые, вы можете установить это и другие параметры в разделе **КОНФИГУРИРОВАТЬ**:

<Image size="sm" img={superset_10} alt="Панель настройки, показывающая опцию кольцевой диаграммы и другие параметры конфигурации круговой диаграммы" border />
<br/>

6. Нажмите кнопку **СОХРАНИТЬ**, чтобы сохранить диаграмму, затем выберите **Цены на недвижимость в Великобритании** в выпадающем списке **ДОБАВИТЬ НА ПАНЕЛЬ**; затем **СОХРАНИТЬ И ПЕРЕЙТИ К ПАНЕЛИ** сохраняет диаграмму и добавляет ее на панель инструментов:

<Image size="md" img={superset_11} alt="Диалог сохранения диаграммы с выпадающим списком выбора панели и кнопкой Сохранить и перейти к панели" border />
<br/>

7. Вот и всё. Создание панелей инструментов в Superset на основе данных ClickHouse открывает целый мир молниеносной аналитики данных!

<Image size="md" img={superset_12} alt="Завершенная панель инструментов Superset с множеством визуализаций данных цен на недвижимость в Великобритании из ClickHouse" border />
<br/>
