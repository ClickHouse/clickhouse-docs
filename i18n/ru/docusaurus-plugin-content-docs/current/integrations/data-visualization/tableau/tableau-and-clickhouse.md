---
sidebar_label: 'Tableau Desktop'
sidebar_position: 1
slug: /integrations/tableau
keywords: ['clickhouse', 'tableau', 'connect', 'integrate', 'ui']
description: 'Tableau может использовать базы данных и таблицы ClickHouse в качестве источника данных.'
title: 'Подключение Tableau к ClickHouse'
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


# Подключение Tableau к ClickHouse

ClickHouse предлагает официальный коннектор Tableau, который представлен на
[Tableau Exchange](https://exchange.tableau.com/products/1064).
Коннектор основан на продвинутом [JDBC драйвере](/integrations/language-clients/java/jdbc) ClickHouse.

С этим коннектором Tableau интегрирует базы данных и таблицы ClickHouse в качестве источников данных. Для активации этой функции
следуйте руководству по настройке ниже.


<TOCInline toc={toc}/>

## Требуемая настройка перед использованием {#setup-required-prior-usage}


1. Соберите ваши данные для подключения
   <ConnectionDetails />

2. Скачайте и установите  <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   Desktop</a>.
3. Следуйте инструкциям `clickhouse-tableau-connector-jdbc`, чтобы скачать совместимую версию
   <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">драйвера JDBC ClickHouse</a>.

:::note
Убедитесь, что вы скачали файл JAR **clickhouse-jdbc-x.x.x-shaded-all.jar**. В настоящее время мы рекомендуем использовать версии `0.8.X`.
:::

4. Сохраните драйвер JDBC в следующей папке (в зависимости от вашей ОС, если папка не существует, вы можете создать её):
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. Настройте источник данных ClickHouse в Tableau и начните создавать визуализации данных!

## Настройка источника данных ClickHouse в Tableau {#configure-a-clickhouse-data-source-in-tableau}

Теперь, когда у вас установлен и настроен драйвер `clickhouse-jdbc`, давайте посмотрим, как определить источник данных в Tableau, который подключается к базе данных **TPCD** в ClickHouse.

1. Запустите Tableau. (Если вы уже запустили его, перезапустите.)

2. В меню слева нажмите **Больше** в разделе **К серверу**. Найдите **ClickHouse by ClickHouse** в списке доступных коннекторов:

<Image size="md" img={tableau_connecttoserver} alt="Экран подключения Tableau, показывающий меню выбора коннекторов с выделенной опцией ClickHouse by ClickHouse" border />
<br/>

:::note
Не видите коннектор **ClickHouse by ClickHouse** в вашем списке коннекторов? Это может быть связано с устаревшей версией Tableau Desktop.
Чтобы решить эту проблему, рассмотрите возможность обновления вашего приложения Tableau Desktop или [установите коннектор вручную](#install-the-connector-manually).
:::

3. Нажмите на **ClickHouse by ClickHouse**, и появится следующее диалоговое окно:

<Image size="md" img={tableau_connector_details} alt="Диалоговое окно установки коннектора Tableau, показывающее детали коннектора JDBC ClickHouse и кнопку установки" border />
<br/>
 
4. Нажмите **Установить и перезапустить Tableau**. Перезапустите приложение.
5. После перезапуска коннектор будет называться полным именем: `ClickHouse JDBC by ClickHouse, Inc.`. При нажатии на него появится следующее диалоговое окно:

<Image size="md" img={tableau_connector_dialog} alt="Диалоговое окно подключения ClickHouse в Tableau, показывающее поля для сервера, порта, базы данных, имени пользователя и пароля" border />
<br/>

6. Введите ваши данные для подключения:

    | Настройка  | Значение                                                  |
    | ----------- |----------------------------------------------------------|
    | Сервер      | **Ваш хост ClickHouse (без префиксов или суффиксов)**   |
    | Порт   | **8443**                                                 |
    | База данных | **default**                                            |
    | Имя пользователя | **default**                                       |
    | Пароль | *\*****                                                |

:::note
При работе с ClickHouse cloud, необходимо включить флажок SSL для защищенных соединений.
:::
<br/>


:::note
Наша база данных ClickHouse называется **TPCD**, но вам нужно установить **Базу данных** на **default** в диалоговом окне выше, а затем выбрать **TPCD** для **Схемы** на следующем шаге. (Это, вероятно, связано с ошибкой в коннекторе, поэтому такое поведение может измениться, но на данный момент вам нужно использовать **default** в качестве базы данных.)
:::

7. Нажмите кнопку **Войти**, и вы должны увидеть новую книгу Tableau:

<Image size="md" img={tableau_newworkbook} alt="Новая книга Tableau, показывающая начальный экран подключения с параметрами выбора базы данных" border />
<br/>

8. Выберите **TPCD** из выпадающего списка **Схема**, и вы должны увидеть список таблиц в **TPCD**:

<Image size="md" img={tableau_tpcdschema} alt="Выбор схемы Tableau, показывающий таблицы базы данных TPCD, включая CUSTOMER, LINEITEM, NATION, ORDERS и другие" border />
<br/>

Теперь вы готовы создать некоторые визуализации в Tableau!

## Создание визуализаций в Tableau {#building-visualizations-in-tableau}

Теперь, когда вы настроили источник данных ClickHouse в Tableau, давайте визуализируем данные...

1. Перетащите таблицу **CUSTOMER** на рабочую область. Обратите внимание, что колонки появляются, но таблица данных пуста:

<Image size="md" img={tableau_workbook1} alt="Книга Tableau с перетащенной таблицей CUSTOMER на холст, показывающая заголовки колонок, но без данных" border />
<br/>

2. Нажмите кнопку **Обновить сейчас**, и 100 строк из **CUSTOMER** заполнят таблицу.


3. Перетащите таблицу **ORDERS** в рабочую область, а затем установите **Custkey** в качестве поля связи между двумя таблицами:

<Image size="md" img={tableau_workbook2} alt="Редактор связей Tableau, показывающий соединение между таблицами CUSTOMER и ORDERS с использованием поля Custkey" border />
<br/>

4. Теперь у вас есть таблицы **ORDERS** и **LINEITEM**, связанные друг с другом в качестве вашего источника данных, и вы можете использовать
   эту связь для ответа на вопросы о данных. Выберите вкладку **Лист 1** внизу книги.

<Image size="md" img={tableau_workbook3} alt="Лист Tableau, показывающий измерения и меры из таблиц ClickHouse, доступные для анализа" border />
<br/>

5. Допустим, вы хотите знать, сколько конкретных товаров было заказано каждый год. Перетащите **OrderDate** из **ORDERS** в
   раздел **Колонки** (горизонтальное поле), а затем перетащите **Quantity** из **LINEITEM** в **Строки**. Tableau сгенерирует следующий линейный график:

<Image size="sm" img={tableau_workbook4} alt="Линейный график Tableau, показывающий количество заказов по годам из данных ClickHouse" border />
<br/>

Не очень захватывающий линейный график, но этот набор данных создан скриптом и предназначен для тестирования производительности запросов, так что
вы заметите, что в смоделированных заказах данных TCPD не так много вариаций.

6. Допустим, вы хотите знать среднюю сумму заказа (в долларах) по кварталам и также по видам доставки (воздушный, почтовый, морской,
   грузовой и т. д.):

    - Нажмите на вкладку **Новый лист**, чтобы создать новый лист
    - Перетащите **OrderDate** из **ORDERS** в **Колонки** и измените его с **Год** на **Квартал**
    - Перетащите **Shipmode** из **LINEITEM** в **Строки**

Вы должны увидеть следующее:

<Image size="sm" img={tableau_workbook5} alt="Сводная таблица Tableau с кварталами в качестве колонок и способами доставки в качестве строк" border />
<br/>

7. Значения **Abc** просто заполняют пространство, пока вы не перетащите метрику в таблицу. Перетащите **Totalprice** из **ORDERS**
   в таблицу. Обратите внимание, что по умолчанию вычисление составляет **SUM** для **Totalprices**:

<Image size="md" img={tableau_workbook6} alt="Сводная таблица Tableau, показывающая сумму общей цены по кварталам и способам доставки" border />
<br/>

8. Нажмите на **SUM** и измените **Меру** на **Среднее**. Из того же выпадающего меню выберите **Формат**, измените
   **Числа** на **Валюту (Стандартная)**:

<Image size="md" img={tableau_workbook7} alt="Сводная таблица Tableau, показывающая среднюю цену заказа по кварталам и способам доставки с форматированием валюты" border />
<br/>

Отличная работа! Вы успешно подключили Tableau к ClickHouse и открыли для себя целый мир возможностей
для анализа и визуализации ваших данных ClickHouse.

## Установка коннектора вручную {#install-the-connector-manually}

Если вы используете устаревшую версию Tableau Desktop, в которой коннектор по умолчанию не включен, вы можете установить его вручную, следуя этим шагам:

1. Скачайте последний файл taco с [Tableau Exchange](https://exchange.tableau.com/products/1064)
2. Поместите файл taco в
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Перезапустите Tableau Desktop, если ваша установка прошла успешно, коннектор появится в разделе `Новый источник данных`.

## Советы по подключению и анализу {#connection-and-analysis-tips}

Для получения дополнительных рекомендаций по оптимизации интеграции Tableau и ClickHouse, 
пожалуйста, посетите [Советы по подключению](/integrations/tableau/connection-tips) и [Советы по анализу](/integrations/tableau/analysis-tips).

## Тесты {#tests}
Коннектор тестируется с помощью [TDVT framework](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) и в настоящее время поддерживает коэффициент покрытия 97%.

## Резюме {#summary}
Вы можете подключить Tableau к ClickHouse, используя универсальный драйвер ODBC/JDBC ClickHouse. Тем не менее, этот
коннектор упрощает процесс настройки подключения. Если у вас возникли проблемы с коннектором, не стесняйтесь обращаться
на <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank">GitHub</a>.
