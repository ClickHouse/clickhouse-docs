---
sidebar_label: 'Zing Data'
sidebar_position: 206
slug: /integrations/zingdata
keywords: ['Zing Data']
description: 'Zing Data — это простая социальная платформа бизнес‑аналитики для ClickHouse, доступная на iOS, Android и в веб‑интерфейсе.'
title: 'Подключение Zing Data к ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import zing_01 from '@site/static/images/integrations/data-visualization/zing_01.png';
import zing_02 from '@site/static/images/integrations/data-visualization/zing_02.png';
import zing_03 from '@site/static/images/integrations/data-visualization/zing_03.png';
import zing_04 from '@site/static/images/integrations/data-visualization/zing_04.png';
import zing_05 from '@site/static/images/integrations/data-visualization/zing_05.png';
import zing_06 from '@site/static/images/integrations/data-visualization/zing_06.png';
import zing_07 from '@site/static/images/integrations/data-visualization/zing_07.png';
import zing_08 from '@site/static/images/integrations/data-visualization/zing_08.png';
import zing_09 from '@site/static/images/integrations/data-visualization/zing_09.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Zing Data к ClickHouse \{#connect-zing-data-to-clickhouse\}

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> — это платформа для исследования и визуализации данных. Zing Data подключается к ClickHouse с использованием JavaScript (JS)‑драйвера, предоставляемого ClickHouse.

## Как подключиться \{#how-to-connect\}

1. Соберите параметры подключения.

<ConnectionDetails />

2. Загрузите приложение или откройте Zing Data

    * Чтобы использовать ClickHouse с Zing Data на мобильном устройстве, загрузите приложение Zing Data в [Google Play Store](https://play.google.com/store/apps/details?id=com.getzingdata.android) или [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091).

    * Чтобы использовать ClickHouse с Zing Data в веб-интерфейсе, перейдите в [веб-консоль Zing](https://console.getzingdata.com/) и создайте учётную запись.

3. Добавьте источник данных

    * Чтобы работать с данными ClickHouse в Zing Data, необходимо определить **_источник данных_**. В мобильном приложении Zing Data в меню выберите **Sources**, затем нажмите **Add a Datasource**.

    * Чтобы добавить источник данных в веб-интерфейсе, нажмите **Data Sources** в верхнем меню, затем **New Datasource** и выберите **ClickHouse** в выпадающем меню.

    <Image size="md" img={zing_01} alt="Интерфейс Zing Data с кнопкой New Datasource и опцией ClickHouse в выпадающем меню" border />
    <br/>

4. Заполните параметры подключения и нажмите **Check Connection**.

    <Image size="md" img={zing_02} alt="Форма конфигурации подключения ClickHouse в Zing Data с полями для сервера, порта, базы данных, имени пользователя и пароля" border />
    <br/>

5. Если подключение прошло успешно, Zing перейдёт к выбору таблиц. Выберите необходимые таблицы и нажмите **Save**. Если Zing не может подключиться к вашему источнику данных, появится сообщение с просьбой проверить ваши учётные данные и повторить попытку. Если даже после проверки учётных данных и повторных попыток проблема сохраняется, <a id="contact_link" href="mailto:hello@getzingdata.com">обратитесь в службу поддержки Zing по этой ссылке.</a>

    <Image size="md" img={zing_03} alt="Интерфейс выбора таблиц Zing Data, показывающий доступные таблицы ClickHouse с флажками" border />
    <br/>

6. После того как источник данных ClickHouse будет добавлен, он станет доступен всем пользователям в вашей организации Zing во вкладке **Data Sources** / **Sources**.

## Создание графиков и дашбордов в Zing Data \{#creating-charts-and-dashboards-in-zing-data\}

1. После добавления источника данных ClickHouse нажмите **Zing App** в веб-интерфейсе или нажмите на источник данных в мобильном приложении, чтобы начать создание графиков.

2. Нажмите на таблицу в списке таблиц, чтобы создать график.

    <Image size="sm" img={zing_04} alt="Интерфейс Zing Data, отображающий список таблиц с доступными таблицами ClickHouse" border />
    <br/>

3. Используйте визуальный конструктор запросов, чтобы выбрать нужные поля, агрегации и т.д., затем нажмите **Run Question**.

    <Image size="md" img={zing_05} alt="Интерфейс визуального конструктора запросов Zing Data с выбором полей и параметров агрегации" border />
    <br/>

4. Если вы знакомы с SQL, вы также можете писать собственные SQL-запросы для выполнения запросов и создания графика.

    <Image size="md" img={zing_06} alt="Режим SQL-редактора в Zing Data с интерфейсом для написания SQL-запроса" border />
    <Image size="md" img={zing_07} alt="Результаты SQL-запроса в Zing Data с данными, отображёнными в табличном формате" border />

5. Пример графика будет выглядеть следующим образом. Запрос можно сохранить с помощью меню с тремя точками. Вы можете комментировать график, отмечать участников команды, создавать оповещения в реальном времени, изменять тип графика и т.д.

    <Image size="md" img={zing_08} alt="Пример визуализации графика в Zing Data с данными из ClickHouse и меню параметров" border />
    <br/>

6. Дашборды можно создавать с помощью значка «+» в разделе **Dashboards** на главном экране. Существующие запросы можно перетащить, чтобы отобразить их на дашборде.

    <Image size="md" img={zing_09} alt="Представление дашборда Zing Data с несколькими визуализациями, расположенными в макете дашборда" border />
    <br/>

## Связанные материалы \{#related-content\}

- [Документация](https://docs.getzingdata.com/docs/)
- [Краткое руководство](https://getzingdata.com/quickstart/)
- Руководство по [созданию дашбордов](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)