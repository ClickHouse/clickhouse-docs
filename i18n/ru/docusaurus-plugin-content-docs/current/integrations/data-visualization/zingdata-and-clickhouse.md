---
sidebar_label: 'Zing Data'
sidebar_position: 206
slug: /integrations/zingdata
keywords: ['clickhouse', 'Zing Data', 'connect', 'integrate', 'ui']
description: 'Zing Data - это простая социальная бизнес-аналитика для ClickHouse, созданная для iOS, Android и веба.'
title: 'Подключите Zing Data к ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# Подключите Zing Data к ClickHouse

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> - это платформа для исследования и визуализации данных. Zing Data подключается к ClickHouse с использованием JS-драйвера, предоставленного ClickHouse.

## Как подключиться {#how-to-connect}
1. Соберите ваши данные для подключения.
<ConnectionDetails />

2. Загрузите или посетите Zing Data

    * Чтобы использовать Clickhouse с Zing Data на мобильном устройстве, скачайте приложение Zing Data в [Google Play Store](https://play.google.com/store/apps/details?id=com.getzingdata.android) или в [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091).

    * Чтобы использовать Clickhouse с Zing Data в вебе, посетите [веб-консоль Zing](https://console.getzingdata.com/) и создайте аккаунт.

3. Добавьте источник данных

    * Для взаимодействия с вашими данными ClickHouse с Zing Data вам нужно определить **_datasource_**. В меню мобильного приложения Zing Data выберите **Sources**, затем нажмите на **Add a Datasource**.

    * Чтобы добавить источник данных в вебе, нажмите на **Data Sources** в верхнем меню, затем нажмите на **New Datasource** и выберите **Clickhouse** из выпадающего меню.

    <Image size="md" img={zing_01} alt="Интерфейс Zing Data, показывающий кнопку Нового Источника Данных и опцию ClickHouse в выпадающем меню" border />
    <br/>

4. Заполните данные подключения и нажмите на **Check Connection**.

    <Image size="md" img={zing_02} alt="Форма конфигурации подключения ClickHouse в Zing Data с полями для сервера, порта, базы данных, имени пользователя и пароля" border />
    <br/>

5. Если подключение успешно, Zing предложит вам выбрать таблицы. Выберите необходимые таблицы и нажмите на **Save**. Если Zing не может подключиться к вашему источнику данных, вы увидите сообщение с просьбой проверить ваши учетные данные и повторить попытку. Если даже после проверки учетных данных и повторной попытки у вас все еще возникают проблемы, <a id="contact_link" href="mailto:hello@getzingdata.com">свяжитесь с поддержкой Zing здесь.</a>

    <Image size="md" img={zing_03} alt="Интерфейс выбора таблиц Zing Data, показывающий доступные таблицы ClickHouse с флажками" border />
    <br/>

6. Как только источник данных Clickhouse добавлен, он станет доступен для всех в вашей организации Zing в разделе **Data Sources** / **Sources**.

## Создание графиков и панелей в Zing Data {#creating-charts-and-dashboards-in-zing-data}

1. После добавления вашего источника данных Clickhouse, нажмите на **Zing App** в вебе или нажмите на источник данных на мобильном устройстве, чтобы начать создание графиков.

2. Нажмите на таблицу в списке таблиц, чтобы создать график.

    <Image size="sm" img={zing_04} alt="Интерфейс Zing Data, показывающий список таблиц с доступными таблицами ClickHouse" border />
    <br/>

3. Используйте визуальный конструктор запросов для выбора желаемых полей, агрегаций и т. д., и нажмите на **Run Question**.

    <Image size="md" img={zing_05} alt="Интерфейс визуального конструктора запросов Zing Data с опциями выбора полей и агрегации" border />
    <br/>

4. Если вы знакомы с SQL, вы также можете написать пользовательский SQL для выполнения запросов и создания графика.

    <Image size="md" img={zing_06} alt="Режим редактора SQL в Zing Data, показывающий интерфейс написания SQL-запросов" border />
    <Image size="md" img={zing_07} alt="Результаты SQL-запроса в Zing Data с данными, отображаемыми в табличном формате" border />

5. Пример графика будет выглядеть следующим образом. Вопрос можно сохранить с помощью меню из трех точек. Вы можете комментировать график, отмечать своих членов команды, создавать оповещения в реальном времени, изменять тип графика и т. д.

    <Image size="md" img={zing_08} alt="Пример визуализации графика в Zing Data, показывающий данные из ClickHouse с меню опций" border />
    <br/>

6. Панели можно создать, используя значок "+" в разделе **Dashboards** на главном экране. Существующие вопросы могут быть перетащены для отображения на панели.

    <Image size="md" img={zing_09} alt="Вид панели Zing Data, показывающий несколько визуализаций, размещенных в макете панели" border />
    <br/>

## Связанный контент {#related-content}

- Блог: [Визуализация данных с ClickHouse - Zing Data](https://getzingdata.com/blog/zing-adds-support-for-clickhouse-as-a-data-source/)
- [Документация](https://docs.getzingdata.com/docs/)
- [Быстрый старт](https://getzingdata.com/quickstart/)
- Гид по [Созданию Панелей](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)
