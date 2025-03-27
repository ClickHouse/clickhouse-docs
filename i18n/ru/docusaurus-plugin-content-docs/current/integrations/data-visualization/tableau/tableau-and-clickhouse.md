---
sidebar_label: 'Tableau Desktop'
sidebar_position: 1
slug: /integrations/tableau
keywords: ['clickhouse', 'tableau', 'connect', 'integrate', 'ui']
description: 'Tableau может использовать базы данных и таблицы ClickHouse в качестве источника данных.'
title: 'Подключение Tableau к ClickHouse'
---

import TOCInline from '@theme/TOCInline';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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


# Подключение Tableau к ClickHouse

ClickHouse предлагает официальный коннектор для Tableau, который представлен на 
[Tableau Exchange](https://exchange.tableau.com/products/1064).
Коннектор основан на продвинутом [JDBC драйвере](/integrations/language-clients/java/jdbc) ClickHouse.

С помощью этого коннектора Tableau интегрирует базы данных и таблицы ClickHouse в качестве источников данных. Чтобы включить эту функциональность,
следуйте приведенному ниже руководству по настройке.


<TOCInline toc={toc}/>

## Настройки, необходимые перед использованием {#setup-required-prior-usage}

1. Соберите ваши данные для подключения
   <ConnectionDetails />

2. Скачайте и установите <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   desktop</a>.
3. Следуйте инструкциям к `clickhouse-tableau-connector-jdbc`, чтобы скачать совместимую версию
   <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">JDBC драйвера ClickHouse</a>.

:::note
Убедитесь, что вы скачали файл JAR **clickhouse-jdbc-x.x.x-shaded-all.jar**. В настоящее время мы рекомендуем использовать версии `0.8.X`.
:::

4. Храните JDBC драйвер в следующей папке (в зависимости от вашей операционной системы, если папка не существует, вы можете создать её):
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. Настройте источник данных ClickHouse в Tableau и начинайте создавать визуализации данных!

## Настройка источника данных ClickHouse в Tableau {#configure-a-clickhouse-data-source-in-tableau}

Теперь, когда у вас установлен и настроен драйвер `clickhouse-jdbc`, давайте посмотрим, как определить источник данных в Tableau, который подключается к базе данных **TPCD** в ClickHouse.

1. Запустите Tableau. (Если вы уже запускали его, то перезапустите.)

2. В меню слева нажмите **More** в разделе **To a Server**. Найдите **ClickHouse by ClickHouse** в списке доступных коннекторов:

<Image size="md" img={tableau_connecttoserver} alt="Экран подключения Tableau, показывающий меню выбора коннектора с выделенной опцией ClickHouse by ClickHouse" border />
<br/>

:::note
Не видите коннектор **ClickHouse by ClickHouse** в списке коннекторов? Это может быть связано со старой версией Tableau Desktop.
Чтобы решить эту проблему, подумайте о том, чтобы обновить ваше приложение Tableau Desktop или [установить коннектор вручную](#install-the-connector-manually).
:::

3. Нажмите на **ClickHouse by ClickHouse**, и появится следующий диалог:

<Image size="md" img={tableau_connector_details} alt="Диалог установки коннектора Tableau, показывающий детали коннектора ClickHouse JDBC и кнопку установки" border />
<br/>
 
4. Нажмите **Install and Restart Tableau**. Перезапустите приложение.
5. После перезапуска полный название коннектора будет: `ClickHouse JDBC by ClickHouse, Inc.`. При нажатии на него появится следующий диалог:

<Image size="md" img={tableau_connector_dialog} alt="Диалог подключения ClickHouse в Tableau, показывающий поля для сервера, порта, базы данных, имени пользователя и пароля" border />
<br/>

6. Введите ваши данные для подключения:

    | Настройка  | Значение                                                  |
    | ----------- |--------------------------------------------------------|
    | Сервер      | **Ваш хост ClickHouse (без префиксов и суффиксов)** |
    | Порт   | **8443**                                               |
    | База данных | **default**                                            |
    | Имя пользователя | **default**                                    |
    | Пароль | *\*****                                                |

:::note
При работе с облаком ClickHouse необходимо включить флажок SSL для безопасных соединений.
:::
<br/>

:::note
Наша база данных ClickHouse называется **TPCD**, но вы должны установить **Database** на **default** в приведенном выше диалоге, а затем выбрать **TPCD** для **Schema** на следующем шаге. (Это, вероятно, связано с ошибкой в коннекторе, так что это поведение может измениться, но на данный момент вы должны использовать **default** в качестве базы данных.)
:::

7. Нажмите кнопку **Sign In**, и вы должны увидеть новую книгу Tableau:

<Image size="md" img={tableau_newworkbook} alt="Новая книга Tableau, показывающая экран начального подключения с вариантами выбора базы данных" border />
<br/>

8. Выберите **TPCD** из выпадающего списка **Schema**, и вы должны увидеть список таблиц в **TPCD**:

<Image size="md" img={tableau_tpcdschema} alt="Выбор схемы Tableau, показывающий таблицы базы данных TPCD, включая CUSTOMER, LINEITEM, NATION, ORDERS и другие" border />
<br/>

Теперь вы готовы строить визуализации в Tableau!

## Создание визуализаций в Tableau {#building-visualizations-in-tableau}

Теперь, когда у вас настроен источник данных ClickHouse в Tableau, давайте визуализируем данные...

1. Перетащите таблицу **CUSTOMER** на холст. Обратите внимание, что столбцы появляются, но таблица данных пустая:

<Image size="md" img={tableau_workbook1} alt="Книга Tableau с таблицей CUSTOMER, перетащенной на холст, показывающая заголовки столбцов, но без данных" border />
<br/>

2. Нажмите кнопку **Update Now**, и 100 строк из **CUSTOMER** будут заполнены в таблице.


3. Перетащите таблицу **ORDERS** в книгу, затем установите **Custkey** как поле связи между двумя таблицами:

<Image size="md" img={tableau_workbook2} alt="Редактор отношений Tableau, показывающий связь между таблицами CUSTOMER и ORDERS с использованием поля Custkey" border />
<br/>

4. Теперь у вас есть таблицы **ORDERS** и **LINEITEM**, связанные друг с другом как источник данных, так что вы можете использовать
   эту связь, чтобы ответить на вопросы о данных. Выберите вкладку **Sheet 1** внизу книги.

<Image size="md" img={tableau_workbook3} alt="Рабочий лист Tableau, показывающий размеры и меры из таблиц ClickHouse, доступные для анализа" border />
<br/>

5. Предположим, вы хотите узнать, сколько конкретных товаров было заказано каждый год. Перетащите **OrderDate** из **ORDERS** в
   секцию **Columns** (горизонтальное поле), затем перетащите **Quantity** из **LINEITEM** в **Rows**. Tableau создаст следующий линейный график:

<Image size="sm" img={tableau_workbook4} alt="Линейный график Tableau, показывающий количество заказов по годам из данных ClickHouse" border />
<br/>

Не очень захватывающий линейный график, но набор данных был сгенерирован скриптом и создан для тестирования производительности запросов, поэтому
вы заметите, что в симулированных заказах данных TCPD нет большой вариативности.

6. Предположим, вы хотите знать среднюю сумму заказа (в долларах) по кварталам и также по способу доставки (воздухом, почтой, морем,
   грузовиком и т.д.):

    - Нажмите на вкладку **New Worksheet**, чтобы создать новый лист
    - Перетащите **OrderDate** из **ORDERS** в **Columns** и измените его с **Year** на **Quarter**
    - Перетащите **Shipmode** из **LINEITEM** в **Rows**

Вы должны увидеть следующее:

<Image size="sm" img={tableau_workbook5} alt="Кросс-таблица Tableau с кварталами в качестве столбцов и способами доставки в качестве строк" border />
<br/>

7. Значения **Abc** просто заполняют пространство, пока вы не перетащите метрику на таблицу. Перетащите **Totalprice** из 
   **ORDERS** на таблицу. Обратите внимание, что по умолчанию расчет сводится к **SUM** для **Totalprices**:

<Image size="md" img={tableau_workbook6} alt="Кросс-таблица Tableau, показывающая сумму общей цены по кварталу и способу доставки" border />
<br/>

8. Нажмите на **SUM** и измените **Measure** на **Average**. Из того же выпадающего меню выберите **Format** и измените
   **Numbers** на **Currency (Standard)**:

<Image size="md" img={tableau_workbook7} alt="Кросс-таблица Tableau, показывающая среднюю цену заказа по кварталу и способу доставки с форматированием валюты" border />
<br/>

Отлично! Вы успешно подключили Tableau к ClickHouse, и вы открыли целый мир возможностей
для анализа и визуализации ваших данных ClickHouse.

## Установка коннектора вручную {#install-the-connector-manually}

В случае, если вы используете устаревшую версию Tableau Desktop, которая по умолчанию не включает коннектор, вы можете установить его вручную, следуя этим шагам:

1. Скачайте последний taco файл с [Tableau Exchange](https://exchange.tableau.com/products/1064)
2. Поместите файл taco в
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Перезапустите Tableau Desktop; если установка прошла успешно, вы увидите коннектор в разделе `New Data Source`.

## Советы по подключению и анализу {#connection-and-analysis-tips}

Для получения дополнительной информации об оптимизации вашей интеграции Tableau-ClickHouse, 
пожалуйста, посетите [Connection Tips](/integrations/tableau/connection-tips) и [Analysis Tips](/integrations/tableau/analysis-tips).

## Тесты {#tests}
Коннектор тестируется с помощью [TDVT framework](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) и в настоящее время поддерживает 97% коэффициент покрытия.

## Резюме {#summary}
Вы можете подключить Tableau к ClickHouse, используя универсальный ODBC/JDBC драйвер ClickHouse. Однако этот
коннектор упрощает процесс настройки подключения. Если у вас возникли проблемы с коннектором, не стесняйтесь обращаться
на <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank">GitHub</a>.
