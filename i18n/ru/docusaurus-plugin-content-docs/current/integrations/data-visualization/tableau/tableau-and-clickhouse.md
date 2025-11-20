---
sidebar_label: 'Tableau Desktop'
sidebar_position: 1
slug: /integrations/tableau
keywords: ['clickhouse', 'tableau', 'connect', 'integrate', 'ui']
description: 'Tableau может использовать базы данных и таблицы ClickHouse в качестве источника данных.'
title: 'Подключение Tableau к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc'
---

import TOCInline from '@theme/TOCInline';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import tableau_connecttoserver from '@site/static/images/integrations/data-visualization/tableau_connecttoserver.png';
import tableau_connector_details from '@site/static/images/integrations/data-visualization/tableau_connector_details.png';
import tableau_connector_dialog from '@site/static/images/integrations/data-visualization/tableau_connector_dialog.png';
import tableau_newworkbook from '@site/static/images/integrations/data-visualization/tableau_newworkbook.png';
import tableau_tpcdschema from '@site/static/images/integrations/data-visualization/tableau_tpcdschema.png';
import tableau_workbook1 from '@site/static/images/integrations/data-visualization/tableau_workbook1.png';
import tableau_workbook2 from '@site/static/images/integrations/data-visualization/tableau_workbook2.png';
import tableau_workbook3 from '@site/static/images/integrations/data-visualization/tableau_workbook3.png';
import tableau_workbook4 from '@site/static/images/integrations/data-visualization/tableau_workbook4.png';
import tableau_workbook5 from '@site/static/images/integrations/data-visualization/tableau_workbook5.png';
import tableau_workbook6 from '@site/static/images/integrations/data-visualization/tableau_workbook6.png';
import tableau_workbook7 from '@site/static/images/integrations/data-visualization/tableau_workbook7.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Подключение Tableau к ClickHouse

<ClickHouseSupportedBadge/>

ClickHouse предоставляет официальный коннектор Tableau, доступный на
[Tableau Exchange](https://exchange.tableau.com/products/1064).
Коннектор основан на расширенном [JDBC-драйвере](/integrations/language-clients/java/jdbc) ClickHouse.

С помощью этого коннектора Tableau использует базы данных и таблицы ClickHouse в качестве источников данных. Чтобы включить эту функциональность,
следуйте приведённому ниже руководству по настройке.

<TOCInline toc={toc}/>



## Настройка перед использованием {#setup-required-prior-usage}

1. Соберите данные для подключения

   <ConnectionDetails />

2. Загрузите и установите <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   desktop</a>.
3. Следуйте инструкциям `clickhouse-tableau-connector-jdbc` для загрузки совместимой версии
   <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">JDBC-драйвера ClickHouse</a>.

:::note
Убедитесь, что вы загружаете JAR-файл [clickhouse-jdbc-X.X.X-all-dependencies.jar](https://github.com/ClickHouse/clickhouse-java/releases). Этот артефакт доступен начиная с версии `0.9.2`.
:::

4. Сохраните JDBC-драйвер в следующей папке (в зависимости от вашей ОС; если папка не существует, создайте её):
   - macOS: `~/Library/Tableau/Drivers`
   - Windows: `C:\Program Files\Tableau\Drivers`
5. Настройте источник данных ClickHouse в Tableau и начните создавать визуализации данных!


## Настройка источника данных ClickHouse в Tableau {#configure-a-clickhouse-data-source-in-tableau}

Теперь, когда драйвер `clickhouse-jdbc` установлен и настроен, давайте рассмотрим, как определить источник данных в Tableau для подключения к базе данных **TPCD** в ClickHouse.

1. Запустите Tableau. (Если приложение уже запущено, перезапустите его.)

2. В меню слева нажмите **More** в разделе **To a Server**. Найдите **ClickHouse by ClickHouse** в списке доступных коннекторов:

<Image
  size='md'
  img={tableau_connecttoserver}
  alt='Экран подключения Tableau с меню выбора коннектора и выделенной опцией ClickHouse by ClickHouse'
  border
/>
<br />

:::note
Не видите коннектор **ClickHouse by ClickHouse** в списке? Возможно, это связано с устаревшей версией Tableau Desktop.
Чтобы решить эту проблему, обновите приложение Tableau Desktop или [установите коннектор вручную](#install-the-connector-manually).
:::

3. Нажмите на **ClickHouse by ClickHouse**, и откроется следующее диалоговое окно:

<Image
  size='md'
  img={tableau_connector_details}
  alt='Диалоговое окно установки коннектора Tableau с информацией о коннекторе ClickHouse JDBC и кнопкой установки'
  border
/>
<br />
4. Нажмите **Install and Restart Tableau**. Перезапустите приложение. 5. После
перезапуска коннектор будет иметь полное название: `ClickHouse JDBC by
ClickHouse, Inc.`. При нажатии на него откроется следующее диалоговое окно:

<Image
  size='md'
  img={tableau_connector_dialog}
  alt='Диалоговое окно подключения ClickHouse в Tableau с полями для сервера, порта, базы данных, имени пользователя и пароля'
  border
/>
<br />

6. Введите параметры подключения:

   | Параметр | Значение                                              |
   | -------- | ----------------------------------------------------- |
   | Server   | **Ваш хост ClickHouse (без префиксов и суффиксов)**   |
   | Port     | **8443**                                              |
   | Database | **default**                                           |
   | Username | **default**                                           |
   | Password | \*\*\*\*\*\*                                          |

:::note
При работе с ClickHouse Cloud необходимо установить флажок SSL для защищенных соединений.
:::

<br />

:::note
Наша база данных ClickHouse называется **TPCD**, но в диалоговом окне выше необходимо указать **default** в поле **Database**, а затем
выбрать **TPCD** в поле **Schema** на следующем шаге. (Вероятно, это связано с ошибкой в коннекторе, поэтому такое поведение
может измениться, но на данный момент необходимо использовать **default** в качестве базы данных.)
:::

7. Нажмите кнопку **Sign In**, и вы увидите новую рабочую книгу Tableau:

<Image
  size='md'
  img={tableau_newworkbook}
  alt='Новая рабочая книга Tableau с начальным экраном подключения и опциями выбора базы данных'
  border
/>
<br />

8. Выберите **TPCD** из выпадающего списка **Schema**, и вы увидите список таблиц в **TPCD**:

<Image
  size='md'
  img={tableau_tpcdschema}
  alt='Выбор схемы в Tableau с таблицами базы данных TPCD, включая CUSTOMER, LINEITEM, NATION, ORDERS и другие'
  border
/>
<br />

Теперь вы готовы создавать визуализации в Tableau!


## Создание визуализаций в Tableau {#building-visualizations-in-tableau}

Теперь, когда источник данных ClickHouse настроен в Tableau, давайте визуализируем данные...

1. Перетащите таблицу **CUSTOMER** в рабочую книгу. Обратите внимание, что столбцы отображаются, но таблица данных пуста:

<Image
  size='md'
  img={tableau_workbook1}
  alt='Рабочая книга Tableau с таблицей CUSTOMER, перетащенной на холст, показывающая заголовки столбцов без данных'
  border
/>
<br />

2. Нажмите кнопку **Update Now** (Обновить сейчас), и таблица заполнится 100 строками из **CUSTOMER**.

3. Перетащите таблицу **ORDERS** в рабочую книгу, затем установите **Custkey** в качестве поля связи между двумя таблицами:

<Image
  size='md'
  img={tableau_workbook2}
  alt='Редактор связей Tableau, показывающий соединение между таблицами CUSTOMER и ORDERS через поле Custkey'
  border
/>
<br />

4. Теперь у вас есть связанные таблицы **ORDERS** и **LINEITEM** в качестве источника данных, поэтому вы можете использовать
   эту связь для получения ответов на вопросы о данных. Выберите вкладку **Sheet 1** (Лист 1) в нижней части рабочей книги.

<Image
  size='md'
  img={tableau_workbook3}
  alt='Рабочий лист Tableau, показывающий измерения и показатели из таблиц ClickHouse, доступные для анализа'
  border
/>
<br />

5. Предположим, вы хотите узнать, сколько конкретных товаров было заказано в каждом году. Перетащите **OrderDate** из таблицы **ORDERS** в
   раздел **Columns** (Столбцы) (горизонтальное поле), затем перетащите **Quantity** из таблицы **LINEITEM** в раздел **Rows** (Строки). Tableau
   сгенерирует следующий линейный график:

<Image
  size='sm'
  img={tableau_workbook4}
  alt='Линейный график Tableau, показывающий количество заказанных товаров по годам из данных ClickHouse'
  border
/>
<br />

Не самый впечатляющий линейный график, но набор данных был сгенерирован скриптом и создан для тестирования производительности запросов, поэтому
вы заметите, что в смоделированных заказах данных TPCH не так много вариаций.

6. Предположим, вы хотите узнать среднюю сумму заказа (в долларах) по кварталам, а также по способу доставки (воздушный, почтовый, морской,
   грузовой и т. д.):
   - Нажмите на вкладку **New Worksheet** (Новый рабочий лист), чтобы создать новый лист
   - Перетащите **OrderDate** из таблицы **ORDERS** в раздел **Columns** (Столбцы) и измените его с **Year** (Год) на **Quarter** (Квартал)
   - Перетащите **Shipmode** из таблицы **LINEITEM** в раздел **Rows** (Строки)

Вы должны увидеть следующее:

<Image
  size='sm'
  img={tableau_workbook5}
  alt='Перекрестное представление Tableau с кварталами в качестве столбцов и способами доставки в качестве строк'
  border
/>
<br />

7. Значения **Abc** просто заполняют пространство, пока вы не перетащите метрику в таблицу. Перетащите **Totalprice** из таблицы \*
   \*ORDERS** в таблицу. Обратите внимание, что расчет по умолчанию — это **SUM** (СУММА) значений **Totalprices\*\*:

<Image
  size='md'
  img={tableau_workbook6}
  alt='Перекрестная таблица Tableau, показывающая сумму общей стоимости по кварталам и способам доставки'
  border
/>
<br />

8. Нажмите на **SUM** (СУММА) и измените **Measure** (Показатель) на **Average** (Среднее). В том же выпадающем меню выберите **Format** (Формат) и измените
   **Numbers** (Числа) на **Currency (Standard)** (Валюта (Стандартная)):

<Image
  size='md'
  img={tableau_workbook7}
  alt='Перекрестная таблица Tableau, показывающая среднюю стоимость заказа по кварталам и способам доставки с форматированием валюты'
  border
/>
<br />

Отлично! Вы успешно подключили Tableau к ClickHouse и открыли целый мир возможностей
для анализа и визуализации данных ClickHouse.


## Установка коннектора вручную {#install-the-connector-manually}

Если вы используете устаревшую версию Tableau Desktop, в которой коннектор не включён по умолчанию, его можно установить вручную, выполнив следующие действия:

1. Скачайте последний файл taco с [Tableau Exchange](https://exchange.tableau.com/products/1064)
2. Поместите файл taco в следующую директорию:
   - macOS: `~/Documents/My Tableau Repository/Connectors`
   - Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Перезапустите Tableau Desktop. Если установка прошла успешно, коннектор появится в разделе `New Data Source`.


## Советы по подключению и анализу {#connection-and-analysis-tips}

Дополнительные рекомендации по оптимизации интеграции Tableau и ClickHouse
см. в разделах [Советы по подключению](/integrations/tableau/connection-tips) и [Советы по анализу](/integrations/tableau/analysis-tips).


## Тестирование {#tests}

Коннектор тестируется с использованием [фреймворка TDVT](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) и в настоящее время обеспечивает покрытие тестами на уровне 97%.


## Summary {#summary}

Вы можете подключить Tableau к ClickHouse с помощью универсального драйвера ClickHouse ODBC/JDBC. Однако этот
коннектор упрощает процесс настройки подключения. При возникновении проблем с коннектором обращайтесь
на <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a>.
