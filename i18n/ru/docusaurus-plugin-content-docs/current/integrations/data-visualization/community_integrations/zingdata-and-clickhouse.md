---
sidebar_label: 'Zing Data'
sidebar_position: 206
slug: /integrations/zingdata
keywords: ['Zing Data']
description: 'Zing Data — это простой социальный инструмент бизнес-аналитики для ClickHouse, доступный на iOS, Android и в вебе.'
title: 'Подключите Zing Data к ClickHouse'
show_related_blogs: true
doc_type: 'guide'
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


# Подключение Zing Data к ClickHouse {#connect-zing-data-to-clickhouse}

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> — это платформа для исследования и визуализации данных. Zing Data подключается к ClickHouse с помощью JS-драйвера, предоставляемого ClickHouse.



## Как подключиться {#how-to-connect}
1. Соберите сведения для подключения.
<ConnectionDetails />

2. Скачайте или откройте Zing Data

    * Чтобы использовать ClickHouse с Zing Data на мобильном устройстве, скачайте приложение Zing Data в [Google Play Store](https://play.google.com/store/apps/details?id=com.getzingdata.android) или [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091).

    * Чтобы использовать ClickHouse с Zing Data в веб-интерфейсе, откройте [веб-консоль Zing](https://console.getzingdata.com/) и создайте учетную запись.

3. Добавьте источник данных

    * Чтобы работать с данными ClickHouse в Zing Data, необходимо определить **_источник данных_**. В меню мобильного приложения Zing Data выберите **Sources**, затем нажмите **Add a Datasource**.

    * Чтобы добавить источник данных в веб-интерфейсе, нажмите **Data Sources** в верхнем меню, затем нажмите **New Datasource** и выберите **ClickHouse** в раскрывающемся меню.

    <Image size="md" img={zing_01} alt="Интерфейс Zing Data с кнопкой New Datasource и вариантом ClickHouse в раскрывающемся меню" border />
    <br/>

4. Заполните сведения для подключения и нажмите **Check Connection**.

    <Image size="md" img={zing_02} alt="Форма настройки подключения к ClickHouse в Zing Data с полями для сервера, порта, базы данных, имени пользователя и пароля" border />
    <br/>

5. Если подключение выполнено успешно, Zing перейдет к выбору таблиц. Выберите нужные таблицы и нажмите **Save**. Если Zing не может подключиться к вашему источнику данных, вы увидите сообщение с просьбой проверить учетные данные и повторить попытку. Если даже после проверки учетных данных и повторной попытки проблема сохраняется, <a id="contact_link" href="mailto:hello@getzingdata.com">свяжитесь со службой поддержки Zing.</a>

    <Image size="md" img={zing_03} alt="Интерфейс выбора таблиц Zing Data, показывающий доступные таблицы ClickHouse с флажками" border />
    <br/>

6. После того как источник данных ClickHouse добавлен, он будет доступен всем пользователям в вашей организации Zing на вкладке **Data Sources** / **Sources**.



## Создание графиков и дашбордов в Zing Data {#creating-charts-and-dashboards-in-zing-data}

1. После добавления источника данных ClickHouse нажмите **Zing App** в веб-интерфейсе или выберите источник данных в мобильном приложении, чтобы начать создавать графики.

2. Выберите таблицу в списке таблиц, чтобы создать график.

    <Image size="sm" img={zing_04} alt="Интерфейс Zing Data, показывающий список таблиц с доступными таблицами ClickHouse" border />
    <br/>

3. Используйте визуальный конструктор запросов, чтобы выбрать нужные поля, агрегации и т. д., и нажмите **Run Question**.

    <Image size="md" img={zing_05} alt="Интерфейс визуального конструктора запросов Zing Data с выбором полей и параметрами агрегации" border />
    <br/>

4. Если вы знакомы с SQL, вы также можете написать произвольный SQL‑запрос, выполнить его и на его основе построить график.

    <Image size="md" img={zing_06} alt="Режим SQL‑редактора в Zing Data, показывающий интерфейс для написания SQL‑запросов" border />
    <Image size="md" img={zing_07} alt="Результаты SQL‑запроса в Zing Data с данными, отображёнными в табличном формате" border />

5. Пример графика может выглядеть следующим образом. Запрос (Question) можно сохранить через меню с тремя точками. Вы можете комментировать график, отмечать участников команды, создавать оповещения в реальном времени, менять тип графика и т. д.

    <Image size="md" img={zing_08} alt="Пример визуализации графика в Zing Data, показывающий данные из ClickHouse с меню параметров" border />
    <br/>

6. Дашборды можно создавать с помощью значка «+» в разделе **Dashboards** на главном экране. Существующие запросы можно перетащить, чтобы отобразить их на дашборде.

    <Image size="md" img={zing_09} alt="Представление дашборда Zing Data, показывающее несколько визуализаций, размещённых в макете дашборда" border />
    <br/>



## Связанные материалы {#related-content}

- [Документация](https://docs.getzingdata.com/docs/)
- [Быстрый старт](https://getzingdata.com/quickstart/)
- Руководство по [созданию дашбордов](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)
