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
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Подключение Tableau к ClickHouse {#connecting-tableau-to-clickhouse}

<ClickHouseSupportedBadge/>

ClickHouse предоставляет официальный коннектор Tableau, доступный на
[Tableau Exchange](https://exchange.tableau.com/products/1064).
Этот коннектор основан на современном [JDBC‑драйвере](/integrations/language-clients/java/jdbc) ClickHouse.

С помощью этого коннектора Tableau может использовать базы данных и таблицы ClickHouse в качестве источников данных. Чтобы использовать эту возможность,
выполните шаги, описанные в следующем руководстве по настройке.

<TOCInline toc={toc}/>

## Предварительная настройка перед использованием {#setup-required-prior-usage}

1. Соберите сведения о подключении
   <ConnectionDetails />

2. Скачайте и установите <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   Desktop</a>.
3. Следуйте инструкциям `clickhouse-tableau-connector-jdbc`, чтобы загрузить совместимую версию
   <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">драйвера ClickHouse JDBC</a>.

:::note
Убедитесь, что вы скачали JAR-файл [clickhouse-jdbc-X.X.X-all-dependencies.jar](https://github.com/ClickHouse/clickhouse-java/releases). Этот файл доступен, начиная с версии `0.9.2`.
:::

4. Сохраните JDBC-драйвер в следующей папке (в зависимости от вашей ОС; если папка не существует, её можно создать):
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. Настройте источник данных ClickHouse в Tableau и приступайте к созданию визуализаций данных!

## Настройка источника данных ClickHouse в Tableau {#configure-a-clickhouse-data-source-in-tableau}

Теперь, когда драйвер `clickhouse-jdbc` установлен и настроен, рассмотрим, как настроить источник
данных в Tableau для подключения к базе данных **TPCD** в ClickHouse.

1. Запустите Tableau. (Если он уже был запущен, перезапустите его.)

2. В левом меню в разделе **To a Server** нажмите **More**. Найдите **ClickHouse by ClickHouse** в списке доступных коннекторов:

<Image size="md" img={tableau_connecttoserver} alt="Экран подключения Tableau с меню выбора коннектора, где выделен вариант ClickHouse by ClickHouse" border />
<br/>

:::note
Не видите коннектор **ClickHouse by ClickHouse** в списке коннекторов? Возможно, у вас установлена устаревшая версия Tableau Desktop.
Чтобы решить проблему, обновите приложение Tableau Desktop или [установите коннектор вручную](#install-the-connector-manually).
:::

3. Нажмите **ClickHouse by ClickHouse** — откроется следующее диалоговое окно:

<Image size="md" img={tableau_connector_details} alt="Диалог установки коннектора Tableau с информацией о коннекторе ClickHouse JDBC и кнопкой установки" border />
<br/>
 
4. Нажмите **Install and Restart Tableau**. Перезапустите приложение.
5. После перезапуска коннектор будет иметь полное имя: `ClickHouse JDBC by ClickHouse, Inc.`. При нажатии на него откроется следующее диалоговое окно:

<Image size="md" img={tableau_connector_dialog} alt="Диалог подключения к ClickHouse в Tableau с полями для сервера, порта, базы данных, имени пользователя и пароля" border />
<br/>

6. Укажите параметры подключения:

    | Setting  | Value                                                  |
    | ----------- |--------------------------------------------------------|
    | Server      | **Ваш хост ClickHouse (без префиксов и суффиксов)** |
    | Port   | **8443**                                               |
    | Database | **default**                                            |
    | Username | **default**                                            |
    | Password | *\*****                                                |

:::note
При работе с ClickHouse Cloud для защищенных подключений необходимо включить флажок SSL.
:::
<br/>

:::note
Наша база данных ClickHouse называется **TPCD**, но в диалоговом окне выше в поле **Database** нужно указать **default**, а затем
на следующем шаге выбрать **TPCD** в поле **Schema**. (Вероятно, это связано с ошибкой в коннекторе, поэтому поведение
может измениться, но пока необходимо использовать **default** в качестве базы данных.)
:::

7. Нажмите кнопку **Sign In**, после чего откроется новая рабочая книга Tableau:

<Image size="md" img={tableau_newworkbook} alt="Новая рабочая книга Tableau, показывающая начальный экран подключения с параметрами выбора базы данных" border />
<br/>

8. Выберите **TPCD** в выпадающем списке **Schema**, после чего отобразится список таблиц в **TPCD**:

<Image size="md" img={tableau_tpcdschema} alt="Выбор схемы в Tableau, показывающий таблицы базы данных TPCD, включая CUSTOMER, LINEITEM, NATION, ORDERS и другие" border />
<br/>

Теперь вы готовы создавать визуализации в Tableau!

## Создание визуализаций в Tableau {#building-visualizations-in-tableau}

Теперь, когда у нас настроен источник данных ClickHouse в Tableau, давайте визуализируем данные…

1. Перетащите таблицу **CUSTOMER** на рабочую книгу. Обратите внимание, что столбцы появляются, но таблица данных пуста:

<Image size="md" img={tableau_workbook1} alt="Рабочая книга Tableau с таблицей CUSTOMER, перетянутой на холст: видны заголовки столбцов, но данные отсутствуют" border />
<br/>

2. Нажмите кнопку **Update Now**, и 100 строк из **CUSTOMER** заполнят таблицу.

3. Перетащите таблицу **ORDERS** в рабочую книгу, затем задайте **Custkey** как поле связи между двумя таблицами:

<Image size="md" img={tableau_workbook2} alt="Редактор связей Tableau, показывающий соединение между таблицами CUSTOMER и ORDERS по полю Custkey" border />
<br/>

4. Теперь таблицы **ORDERS** и **LINEITEM** связаны друг с другом и используются как ваш источник данных, поэтому вы
   можете использовать эту связь, чтобы отвечать на вопросы о данных. Выберите вкладку **Sheet 1** внизу рабочей книги.

<Image size="md" img={tableau_workbook3} alt="Лист Tableau, показывающий измерения и меры из таблиц ClickHouse, доступные для анализа" border />
<br/>

5. Предположим, вы хотите узнать, сколько конкретных товаров заказывали каждый год. Перетащите **OrderDate** из **ORDERS** в раздел
   **Columns** (горизонтальное поле), затем перетащите **Quantity** из **LINEITEM** в **Rows**. Tableau
   сгенерирует следующую линейную диаграмму:

<Image size="sm" img={tableau_workbook4} alt="Линейная диаграмма Tableau, показывающая количество заказов по годам на основе данных ClickHouse" border />
<br/>

Это не самая захватывающая линейная диаграмма, но набор данных был сгенерирован скриптом и предназначен для тестирования производительности запросов, поэтому вы заметите, что в смоделированных заказах по данным TCPD не так много разнообразия.

6. Предположим, вы хотите узнать средний размер заказа (в долларах) по кварталам, а также по способу доставки (air, mail, ship,
   truck и т. д.):

    - Нажмите вкладку **New Worksheet**, чтобы создать новый лист
    - Перетащите **OrderDate** из **ORDERS** в **Columns** и измените его с **Year** на **Quarter**
    - Перетащите **Shipmode** из **LINEITEM** в **Rows**

Вы увидите примерно следующее:

<Image size="sm" img={tableau_workbook5} alt="Табличное представление Tableau с кварталами в столбцах и способами доставки в строках" border />
<br/>

7. Значения **Abc** просто заполняют пространство до тех пор, пока вы не перетащите метрику на таблицу. Перетащите **Totalprice** из
   **ORDERS** на таблицу. Обратите внимание, что расчет по умолчанию — это **SUM** для **Totalprices**:

<Image size="md" img={tableau_workbook6} alt="Табличное представление Tableau, показывающее сумму общей стоимости по кварталам и способам доставки" border />
<br/>

8. Нажмите на **SUM** и измените **Measure** на **Average**. В том же выпадающем меню выберите **Format** и измените
   **Numbers** на **Currency (Standard)**:

<Image size="md" img={tableau_workbook7} alt="Табличное представление Tableau, показывающее среднюю стоимость заказа по кварталам и способам доставки с форматированием валюты" border />
<br/>

Отличная работа! Вы успешно подключили Tableau к ClickHouse и открыли для себя целый мир возможностей
для анализа и визуализации ваших данных в ClickHouse.

## Установка коннектора вручную {#install-the-connector-manually}

Если вы используете устаревшую версию Tableau Desktop, которая не включает коннектор по умолчанию, вы можете установить его вручную, выполнив следующие шаги:

1. Загрузите актуальный файл .taco с [Tableau Exchange](https://exchange.tableau.com/products/1064)
2. Поместите файл .taco в:
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Перезапустите Tableau Desktop. Если установка прошла успешно, коннектор появится в разделе `New Data Source`.

## Советы по подключению и анализу {#connection-and-analysis-tips}

Для получения дополнительных рекомендаций по оптимизации интеграции Tableau с ClickHouse см. разделы [Советы по подключению](/integrations/tableau/connection-tips) и [Советы по анализу](/integrations/tableau/analysis-tips).

## Тесты {#tests}
Коннектор тестируется с использованием [фреймворка TDVT](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) и в настоящее время имеет уровень покрытия тестами 97%.

## Краткое описание {#summary}
Вы можете подключить Tableau к ClickHouse, используя универсальный драйвер ODBC/JDBC для ClickHouse. Однако этот
коннектор упрощает процесс настройки подключения. Если у вас возникнут какие-либо проблемы с коннектором, сообщите о них
на <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a>.
