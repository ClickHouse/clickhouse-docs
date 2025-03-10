---
sidebar_label: Tableau Desktop
sidebar_position: 1
slug: /integrations/tableau
keywords: [ 'clickhouse', 'tableau', 'connect', 'integrate', 'ui' ]
description: 'Tableau может использовать базы данных и таблицы ClickHouse в качестве источника данных.'
---
import TOCInline from '@theme/TOCInline';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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

ClickHouse предлагает официальный коннектор для Tableau, представленный на 
[Tableau Exchange](https://exchange.tableau.com/products/1064).
Коннектор основан на продвинутом [JDBC драйвере](/integrations/language-clients/java/jdbc) ClickHouse.

С этим коннектором Tableau интегрирует базы данных и таблицы ClickHouse как источники данных. Чтобы включить эту функциональность,
следуйте инструкции по настройке ниже.

<TOCInline toc={toc}/>

## Настройка, необходимая перед использованием {#setup-required-prior-usage}

1. Соберите данные для подключения
   <ConnectionDetails />

2. Скачайте и установите <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   desktop</a>.
3. Следуйте инструкциям `clickhouse-tableau-connector-jdbc`, чтобы скачать совместимую версию 
   <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">JDBC драйвера ClickHouse</a>.

:::note
Убедитесь, что вы скачали JAR файл **clickhouse-jdbc-x.x.x-shaded-all.jar**. В настоящее время мы рекомендуем использовать версии `0.8.X`.
:::

4. Поместите JDBC драйвер в следующую папку (в зависимости от вашей ОС, если папка не существует, вы можете создать её):
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. Настройте источник данных ClickHouse в Tableau и начните создавать визуализации данных!

## Настройка источника данных ClickHouse в Tableau {#configure-a-clickhouse-data-source-in-tableau}

Теперь, когда у вас установлен и настроен драйвер `clickhouse-jdbc`, давайте посмотрим, как определить источник данных в Tableau, который подключается к базе данных **TPCD** в ClickHouse.

1. Запустите Tableau. (Если он уже был запущен, перезапустите его.)

2. В левом меню нажмите **Еще** в разделе **К серверу**. Найдите **ClickHouse by ClickHouse** в списке доступных коннекторов:

<img alt="ClickHouse JDBC" src={tableau_connecttoserver}/>
<br/>

:::note
Не видите коннектор **ClickHouse by ClickHouse** в списке коннекторов? Это может быть связано со старой версией Tableau Desktop.
Чтобы решить эту проблему, рассмотрите возможность обновления приложения Tableau Desktop или [установите коннектор вручную](#install-the-connector-manually).
:::

3. Нажмите на **ClickHouse by ClickHouse** и появится следующий диалог:

<img alt="ClickHouse JDBC Connector Details" src={tableau_connector_details}/>
<br/>
 
4. Нажмите **Установить и перезапустить Tableau**. Перезапустите приложение.
5. После перезапуска у коннектора будет полное название: `ClickHouse JDBC by ClickHouse, Inc.`. При его нажатии появится следующий диалог:

<img alt="ClickHouse JDBC Connector Details Details" src={tableau_connector_dialog}/>
<br/>

6. Введите данные для подключения:

    | Настройка  | Значение                                                  |
    | ----------- |--------------------------------------------------------|
    | Сервер      | **Ваш хост ClickHouse (без префиксов или суффиксов)** |
    | Порт   | **8443**                                               |
    | База данных | **default**                                            |
    | Имя пользователя | **default**                                            |
    | Пароль | *\*****                                                |

:::note
При работе с ClickHouse cloud необходимо включить галочку SSL для защищенных соединений.
:::
<br/>

:::note
Наша база данных ClickHouse называется **TPCD**, но вам нужно установить **База данных** на **default** в диалоговом окне выше, а затем выбрать **TPCD** для **Схема** в следующем шаге. (Это вероятно связано с ошибкой в коннекторе, поэтому такое поведение может измениться, но сейчас вы должны использовать **default** как базу данных.)
:::

7. Нажмите кнопку **Войти**, и вы должны увидеть новую книжку Tableau:

<img alt="New Workbook" src={tableau_newworkbook}/>
<br/>

8. Выберите **TPCD** из выпадающего списка **Схема**, и вы должны увидеть список таблиц в **TPCD**:

<img alt="Select TPCD for the Schema" src={tableau_tpcdschema}/>
<br/>

Теперь вы готовы создавать визуализации в Tableau!

## Создание визуализаций в Tableau {#building-visualizations-in-tableau}

Теперь, когда у вас настроен источник данных ClickHouse в Tableau, давайте визуализируем данные...

1. Перетащите таблицу **CUSTOMER** на рабочую книгу. Обратите внимание, что столбцы появляются, но таблица данных пустая:

<img alt="Tableau workbook" src={tableau_workbook1}/>
<br/>

2. Нажмите кнопку **Обновить сейчас**, и 100 строк из **CUSTOMER** заполнят таблицу.


3. Перетащите таблицу **ORDERS** в рабочую книгу, затем установите **Custkey** в качестве поля связи между двумя таблицами:

<img alt="Tableau workbook" src={tableau_workbook2}/>
<br/>

4. Теперь у вас есть таблицы **ORDERS** и **LINEITEM**, связанные друг с другом как ваш источник данных, поэтому вы можете использовать
   эту связь, чтобы отвечать на вопросы о данных. Выберите вкладку **Sheet 1** внизу рабочей книги.

<img alt="Tableau workbook" src={tableau_workbook3}/>
<br/>

5. Предположим, вы хотите знать, сколько конкретных предметов заказывалось каждый год. Перетащите **OrderDate** из **ORDERS** в
   раздел **Столбцы** (горизонтальное поле), затем перетащите **Quantity** из **LINEITEM** в **Строки**. Tableau сгенерирует следующий линейный график:

<img alt="Tableau workbook" src={tableau_workbook4}/>
<br/>

Не очень захватывающий линейный график, но набор данных был сгенерирован скриптом и создан для тестирования производительности запросов, поэтому
вы заметите, что в симулированных заказах данных TCPD не так много вариаций.

6. Предположим, вы хотите знать среднюю сумму заказа (в долларах) по кварталам и также по способу доставки (воздушная, почтовая, корабль,
   грузовик и т. д.):

    - Нажмите вкладку **Новый лист**, чтобы создать новый лист
    - Перетащите **OrderDate** из **ORDERS** в **Столбцы** и измените его с **Год** на **Квартал**
    - Перетащите **Shipmode** из **LINEITEM** в **Строки**

Вы должны увидеть следующее:

<img alt="Tableau workbook" src={tableau_workbook5}/>
<br/>

7. Значения **Abc** просто заполняют пространство, пока вы не перетащите метрику на таблицу. Перетащите **Totalprice** из **ORDERS** на
   таблицу. Обратите внимание, что по умолчанию расчет подразумевает **SUM** **Totalprices**:

<img alt="Tableau workbook" src={tableau_workbook6}/>
<br/>

8. Щелкните **SUM** и измените **Меру** на **Среднее**. Из того же выпадающего меню выберите **Формат**, измените
   **Числа** на **Валюта (Стандартная)**:

<img alt="Tableau workbook" src={tableau_workbook7}/>
<br/>

Отлично! Вы успешно подключили Tableau к ClickHouse и открыли для себя целый мир возможностей
для анализа и визуализации ваших данных ClickHouse.

## Установка коннектора вручную {#install-the-connector-manually}

Если вы используете устаревшую версию Tableau Desktop, в которой коннектор не включен по умолчанию, вы можете установить его вручную, следуя этим шагам:

1. Скачайте последний файл taco с [Tableau Exchange](https://exchange.tableau.com/products/1064)
2. Поместите файл taco в
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Перезапустите Tableau Desktop, если ваша настройка прошла успешно, вы увидите коннектор в разделе `Новый источник данных`.

## Советы по подключению и анализу {#connection-and-analysis-tips}

Для получения дополнительных рекомендаций по оптимизации интеграции Tableau-ClickHouse,
пожалуйста, посетите [Советы по подключению](/integrations/tableau/connection-tips) и [Советы по анализу](/integrations/tableau/analysis-tips).

## Тесты {#tests}
Коннектор тестируется с помощью [TDVT framework](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) и в настоящее время поддерживает 97% коэффициент покрытия.

## Резюме {#summary}
Вы можете подключить Tableau к ClickHouse, используя универсальный ODBC/JDBC драйвер ClickHouse. Однако этот
коннектор упрощает процесс настройки подключения. Если у вас есть какие-либо проблемы с коннектором, не стесняйтесь обращаться
на <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a>.
