---
'sidebar_label': 'Tableau Desktop'
'sidebar_position': 1
'slug': '/integrations/tableau'
'keywords':
- 'clickhouse'
- 'tableau'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Tableau может использовать базы данных и таблицы ClickHouse в качестве
  источника данных.'
'title': 'Подключение Tableau к ClickHouse'
'doc_type': 'guide'
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

ClickHouse предлагает официальный соединитель Tableau, представленный на
[Tableau Exchange](https://exchange.tableau.com/products/1064).
Соединитель основан на усовершенствованном [JDBC драйвере](/integrations/language-clients/java/jdbc) ClickHouse.

С помощью этого соединителя Tableau интегрирует базы данных и таблицы ClickHouse в качестве источников данных. Чтобы включить эту функциональность,
следуйте приведенному ниже руководству по настройке.

<TOCInline toc={toc}/>

## Обязательная настройка перед использованием {#setup-required-prior-usage}

1. Соберите ваши данные для подключения
   <ConnectionDetails />

2. Скачайте и установите <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   desktop</a>.
3. Следуйте инструкциям `clickhouse-tableau-connector-jdbc`, чтобы скачать совместимую версию
   <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">JDBC драйвера ClickHouse</a>.

:::note
Убедитесь, что вы скачали JAR файл [clickhouse-jdbc-X.X.X-all-dependencies.jar](https://github.com/ClickHouse/clickhouse-java/releases). Этот артефакт доступен с версии `0.9.2`.
:::

4. Сохраните JDBC драйвер в следующей папке (в зависимости от вашей ОС, если папка не существует, вы можете создать её):
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. Настройте источник данных ClickHouse в Tableau и начните создавать визуализации данных!

## Настройка источника данных ClickHouse в Tableau {#configure-a-clickhouse-data-source-in-tableau}

Теперь, когда у вас установлен и настроен драйвер `clickhouse-jdbc`, давайте посмотрим, как определить источник данных в Tableau, который подключается к базе данных **TPCD** в ClickHouse.

1. Запустите Tableau. (Если он уже был запущен, то перезапустите его.)

2. В меню слева нажмите на **Больше** в разделе **К серверу**. Найдите **ClickHouse by ClickHouse** в списке доступных соединителей:

<Image size="md" img={tableau_connecttoserver} alt="Экран подключения Tableau, показывающий меню выбора соединителя с выделенной опцией ClickHouse by ClickHouse" border />
<br/>

:::note
Не видите соединитель **ClickHouse by ClickHouse** в списке соединителей? Это может быть связано с устаревшей версией Tableau Desktop.
Чтобы исправить это, рассмотрите возможность обновления вашего приложения Tableau Desktop или [установите соединитель вручную](#install-the-connector-manually).
:::

3. Нажмите на **ClickHouse by ClickHouse**, и появится следующий диалог:

<Image size="md" img={tableau_connector_details} alt="Диалог установки соединителя Tableau, показывающий детали соединителя ClickHouse JDBC и кнопку установки" border />
<br/>

4. Нажмите **Установить и перезапустить Tableau**. Перезапустите приложение.
5. После перезапуска у соединителя будет полное название: `ClickHouse JDBC by ClickHouse, Inc.`. При нажатии на него появится следующий диалог:

<Image size="md" img={tableau_connector_dialog} alt="Диалог подключения ClickHouse в Tableau, показывающий поля для сервера, порта, базы данных, имени пользователя и пароля" border />
<br/>

6. Введите свои данные для подключения:

    | Настройка  | Значение                                                  |
    | ----------- |----------------------------------------------------------|
    | Сервер      | **Ваш ClickHouse хост (без префиксов или суффиксов)**   |
    | Порт        | **8443**                                                 |
    | База данных | **default**                                            |
    | Имя пользователя | **default**                                            |
    | Пароль      | *\*****                                                |

:::note
При работе с ClickHouse cloud необходимо включить флажок SSL для защищенных соединений.
:::
<br/>

:::note
Наша база данных ClickHouse называется **TPCD**, но вам нужно установить **База данных** на **default** в диалоге выше, затем
выбрать **TPCD** для **Схемы** на следующем этапе. (Это, вероятно, связано с ошибкой в соединителе, поэтому это поведение
может измениться, но пока вы должны использовать **default** в качестве базы данных.)
:::

7. Нажмите кнопку **Войти**, и вы должны увидеть новую книгу Tableau:

<Image size="md" img={tableau_newworkbook} alt="Новая книга Tableau, показывающая начальный экран подключения с вариантами выбора базы данных" border />
<br/>

8. Выберите **TPCD** из выпадающего списка **Схема**, и вы должны увидеть список таблиц в **TPCD**:

<Image size="md" img={tableau_tpcdschema} alt="Выбор схемы Tableau, показывающий таблицы базы данных TPCD, включая CUSTOMER, LINEITEM, NATION, ORDERS и другие" border />
<br/>

Теперь вы готовы создать некоторые визуализации в Tableau!

## Создание визуализаций в Tableau {#building-visualizations-in-tableau}

Теперь, когда у нас настроен источник данных ClickHouse в Tableau, давайте визуализировать данные...

1. Перетащите таблицу **CUSTOMER** на рабочую книгу. Обратите внимание, что столбцы появляются, но таблица данных пустая:

<Image size="md" img={tableau_workbook1} alt="Рабочая книга Tableau с перетянутой таблицей CUSTOMER на холст, показывающей заголовки столбцов, но без данных" border />
<br/>

2. Нажмите кнопку **Обновить сейчас**, и 100 строк из **CUSTOMER** заполнят таблицу.

3. Перетащите таблицу **ORDERS** в рабочую книгу, затем установите **Custkey** как поле связи между двумя таблицами:

<Image size="md" img={tableau_workbook2} alt="Редактор связей Tableau, показывающий связь между таблицами CUSTOMER и ORDERS, используя поле Custkey" border />
<br/>

4. Теперь у вас есть таблицы **ORDERS** и **LINEITEM**, связанные друг с другом как ваш источник данных, поэтому вы можете использовать
   эту связь, чтобы отвечать на вопросы о данных. Выберите вкладку **Лист 1** внизу рабочей книги.

<Image size="md" img={tableau_workbook3} alt="Лист Tableau, показывающий размеры и меры из таблиц ClickHouse, доступные для анализа" border />
<br/>

5. Предположим, вы хотите знать, сколько конкретных товаров было заказано каждый год. Перетащите **OrderDate** из **ORDERS** в
   раздел **Столбцы** (горизонтальное поле), затем перетащите **Quantity** из **LINEITEM** в **Строки**. Tableau сгенерирует следующий линейный график:

<Image size="sm" img={tableau_workbook4} alt="Линейный график Tableau, показывающий количество заказов по годам из данных ClickHouse" border />
<br/>

Не очень захватывающий линейный график, но набор данных был сгенерирован скриптом и создан для тестирования производительности запросов, так что
вы заметите, что в симулированных заказах данных TCPD не так много вариаций.

6. Предположим, вы хотите узнать среднюю сумму заказа (в долларах) по кварталу и также по способу доставки (воздух, почта, доставка,
   грузовик и т. д.):

    - Нажмите на вкладку **Новый лист**, чтобы создать новый лист
    - Перетащите **OrderDate** из **ORDERS** в **Столбцы** и измените его с **Год** на **Квартал**
    - Перетащите **Shipmode** из **LINEITEM** в **Строки**

Вы должны увидеть следующее:

<Image size="sm" img={tableau_workbook5} alt="Представление таблицы Tableau с кварталами в качестве столбцов и способами отправки в качестве строк" border />
<br/>

7. Значения **Abc** просто заполняют пространство, пока вы не перетащите метрику на таблицу. Перетащите **Totalprice** из 
   **ORDERS** на таблицу. Обратите внимание, что расчет по умолчанию — это **SUM** для **Totalprices**:

<Image size="md" img={tableau_workbook6} alt="Таблица Tableau, показывающая сумму общей цены по кварталу и способу отправки" border />
<br/>

8. Нажмите на **SUM** и измените **Мероприятие** на **Среднее**. Из того же выпадающего меню выберите **Формат** и измените
   **Числа** на **Валюта (Стандарт)**:

<Image size="md" img={tableau_workbook7} alt="Таблица Tableau, показывающая среднюю цену заказа по кварталу и способу отправки с форматированием валюты" border />
<br/>

Отлично! Вы успешно подключили Tableau к ClickHouse, и открыли целый мир возможностей
для анализа и визуализации ваших данных ClickHouse.

## Установка соединителя вручную {#install-the-connector-manually}

Если вы используете устаревшую версию Tableau Desktop, которая не включает соединитель по умолчанию, вы можете установить его вручную, следуя этим шагам:

1. Скачайте последний файл taco с [Tableau Exchange](https://exchange.tableau.com/products/1064)
2. Поместите файл taco в
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Перезапустите Tableau Desktop, если ваша настройка прошла успешно, вы увидите соединитель в разделе `Новый источник данных`.

## Советы по подключению и анализу {#connection-and-analysis-tips}

Для получения дополнительной информации о оптимизации интеграции Tableau-ClickHouse
пожалуйста, посетите [Советы по подключению](/integrations/tableau/connection-tips) и [Советы по анализу](/integrations/tableau/analysis-tips).

## Тесты {#tests}
Соединитель тестируется с помощью [TDVT framework](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) и в настоящее время поддерживает 97% коэффициента покрытия.

## Резюме {#summary}
Вы можете подключить Tableau к ClickHouse, используя универсальный ODBC/JDBC драйвер ClickHouse. Однако этот
соединитель упрощает процесс настройки подключения. Если у вас есть какие-либо проблемы с соединителем, не стесняйтесь обращаться
на <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a>.
