---
sidebar_label: Zing Data
sidebar_position: 206
slug: /integrations/zingdata
keywords: [clickhouse, Zing Data, connect, integrate, ui]
description: Zing Data — это простая социальная бизнес-аналитика для ClickHouse, предназначенная для iOS, Android и веба.
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import zing_01 from '@site/static/images/integrations/data-visualization/zing_01.png';
import zing_02 from '@site/static/images/integrations/data-visualization/zing_02.png';
import zing_03 from '@site/static/images/integrations/data-visualization/zing_03.png';
import zing_04 from '@site/static/images/integrations/data-visualization/zing_04.png';
import zing_05 from '@site/static/images/integrations/data-visualization/zing_05.png';
import zing_06 from '@site/static/images/integrations/data-visualization/zing_06.png';
import zing_07 from '@site/static/images/integrations/data-visualization/zing_07.png';
import zing_08 from '@site/static/images/integrations/data-visualization/zing_08.png';
import zing_09 from '@site/static/images/integrations/data-visualization/zing_09.png';


# Подключение Zing Data к ClickHouse

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> — это платформа для исследования и визуализации данных. Zing Data подключается к ClickHouse, используя JS-драйвер, предоставленный ClickHouse. 

## Как подключиться {#how-to-connect}
1. Соберите данные для подключения.
<ConnectionDetails />

2. Скачайте или посетите Zing Data

    * Чтобы использовать Clickhouse с Zing Data на мобильных устройствах, скачайте приложение Zing data в [Google Play Store](https://play.google.com/store/apps/details?id=com.getzingdata.android) или в [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091).
    
    * Чтобы использовать Clickhouse с Zing Data на вебе, посетите [веб-консоль Zing](https://console.getzingdata.com/) и создайте аккаунт.

3. Добавьте источник данных

    * Чтобы взаимодействовать с вашими данными ClickHouse через Zing Data, вам необходимо определить **_datasource_**. В меню мобильного приложения Zing Data выберите **Sources**, затем нажмите **Add a Datasource**.

    * Чтобы добавить источник данных в вебе, нажмите **Data Sources** в верхнем меню, затем нажмите **New Datasource** и выберите **Clickhouse** из выпадающего меню.
    
    <img src={zing_01} alt="Zing 01"/>
    <br/>

4. Заполните данные для подключения и нажмите **Check Connection**.

    <img src={zing_02} alt="Zing 02"/>
    <br/>

5. Если подключение прошло успешно, Zing предложит вам выбрать таблицы. Выберите необходимые таблицы и нажмите **Save**. Если Zing не может подключиться к вашему источнику данных, вы увидите сообщение с просьбой проверить учетные данные и повторить попытку. Если после проверки учетных данных и повторной попытки у вас все еще возникают проблемы, <a id="contact_link" href="mailto:hello@getzingdata.com">свяжитесь с поддержкой Zing здесь.</a>

    <img src={zing_03} alt="Zing 03"/>
    <br/>

6. После добавления источника данных Clickhouse он станет доступен для всех в вашей организации Zing, в разделе **Data Sources** / **Sources**.

## Создание графиков и панелей мониторинга в Zing Data {#creating-charts-and-dashboards-in-zing-data}

1. После добавления вашего источника данных Clickhouse, нажмите **Zing App** на вебе или нажмите на источник данных на мобильном устройстве, чтобы начать создание графиков.

2. Щелкните по таблице в списке таблиц, чтобы создать график.

    <img src={zing_04} alt="Zing 04"/>
    <br/>

3. Используйте визуальный конструктор запросов, чтобы выбрать желаемые поля, агрегации и т.д., и нажмите **Run Question**.

    <img src={zing_05} alt="Zing 05"/>
    <br/>

4. Если вы знакомы с SQL, вы также можете написать собственный SQL-запрос для выполнения запросов и создания графиков.

    <img src={zing_06} alt="Zing 06"/>
    <img src={zing_07} alt="Zing 07"/>

5. Пример графика может выглядеть следующим образом. Вопрос можно сохранить, используя меню с тремя точками. Вы можете комментировать график, отмечать своих сотрудников, создавать оповещения в реальном времени, изменять тип графика и т.д.

    <img src={zing_08} alt="Zing 08"/>
    <br/>

6. Панели мониторинга можно создать, используя значок "+" в разделе **Dashboards** на главном экране. Существующие вопросы можно перетаскивать, чтобы отобразить их на панели мониторинга.

    <img src={zing_09} alt="Zing 09"/>
    <br/>

## Связанный контент {#related-content}

- Блог: [Визуализация данных с ClickHouse - Zing Data](https://getzingdata.com/blog/zing-adds-support-for-clickhouse-as-a-data-source/)
- [Документация](https://docs.getzingdata.com/docs/)
- [Быстрый старт](https://getzingdata.com/quickstart/)
- Руководство по [Созданию панелей мониторинга](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)
