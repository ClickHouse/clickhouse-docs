---
slug: '/integrations/zingdata'
sidebar_label: 'Zing Data'
sidebar_position: 206
description: 'Zing Data является простой социальной бизнес-аналитикой для ClickHouse,'
title: 'Подключите Zing Data к ClickHouse'
keywords: ['clickhouse', 'Zing Data', 'connect', 'integrate', 'ui']
doc_type: guide
show_related_blogs: true
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


# Соединение Zing Data с ClickHouse

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> — это платформа для исследования и визуализации данных. Zing Data подключается к ClickHouse с помощью JS-драйвера, предоставленного ClickHouse.

## Как подключиться {#how-to-connect}
1. Соберите ваши данные для подключения.
<ConnectionDetails />

2. Скачайте или посетите Zing Data

    * Чтобы использовать Clickhouse с Zing Data на мобильных устройствах, скачайте приложение Zing Data в [Google Play Store](https://play.google.com/store/apps/details?id=com.getzingdata.android) или в [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091).

    * Чтобы использовать Clickhouse с Zing Data в вебе, посетите [веб-консоль Zing](https://console.getzingdata.com/) и создайте аккаунт.

3. Добавьте источник данных

    * Чтобы взаимодействовать с данными ClickHouse через Zing Data, вам нужно определить **_источник данных_**. В меню мобильного приложения Zing Data выберите **Источники**, затем нажмите **Добавить источник данных**.

    * Чтобы добавить источник данных в вебе, нажмите **Источники данных** в верхнем меню, затем нажмите **Новый источник данных** и выберите **Clickhouse** из выпадающего меню.

    <Image size="md" img={zing_01} alt="Интерфейс Zing Data показывает кнопку Нового источника данных и опцию ClickHouse в выпадающем меню" border />
    <br/>

4. Заполните данные подключения и нажмите **Проверить соединение**.

    <Image size="md" img={zing_02} alt="Форма конфигурации соединения ClickHouse в Zing Data с полями для сервера, порта, базы данных, имени пользователя и пароля" border />
    <br/>

5. Если соединение успешно, Zing предложит вам выбрать таблицы. Выберите необходимые таблицы и нажмите **Сохранить**. Если Zing не может подключиться к вашему источнику данных, вы увидите сообщение с просьбой проверить ваши учетные данные и попробовать снова. Если после проверки учетных данных и повторной попытки у вас по-прежнему возникают проблемы, <a id="contact_link" href="mailto:hello@getzingdata.com">свяжитесь с поддержкой Zing здесь.</a>

    <Image size="md" img={zing_03} alt="Интерфейс выбора таблиц Zing Data показывает доступные таблицы ClickHouse с флажками" border />
    <br/>

6. После добавления источника данных Clickhouse он будет доступен всем в вашей организации Zing на вкладке **Источники данных** / **Источники**.

## Создание графиков и панелей в Zing Data {#creating-charts-and-dashboards-in-zing-data}

1. После добавления источника данных Clickhouse нажмите на **Zing App** в вебе или нажмите на источник данных на мобильном устройстве, чтобы начать создавать графики.

2. Нажмите на таблицу в списке таблиц, чтобы создать график.

    <Image size="sm" img={zing_04} alt="Интерфейс Zing Data показывает список таблиц с доступными таблицами ClickHouse" border />
    <br/>

3. Используйте визуальный конструктор запросов для выбора необходимых полей, агрегаций и т.д., и нажмите **Запустить вопрос**.

    <Image size="md" img={zing_05} alt="Интерфейс визуального конструктора запросов Zing Data с выбором полей и параметрами агрегации" border />
    <br/>

4. Если вы знакомы с SQL, вы также можете написать пользовательский SQL для выполнения запросов и создания графика.

    <Image size="md" img={zing_06} alt="Режим редактора SQL в Zing Data с интерфейсом для написания SQL-запросов" border />
    <Image size="md" img={zing_07} alt="Результаты SQL-запросов в Zing Data с данными, отображаемыми в табличном формате" border />

5. Пример графика может выглядеть следующим образом. Вопрос можно сохранить, используя меню с тремя точками. Вы можете комментировать график, тегировать участников вашей команды, создавать уведомления в реальном времени, изменять тип графика и т.д.

    <Image size="md" img={zing_08} alt="Пример визуализации графика в Zing Data, показывающий данные из ClickHouse с меню опций" border />
    <br/>

6. Панели можно создавать, используя знак "+" под **Панели** на главном экране. Существующие вопросы можно перетаскивать для отображения на панели.

    <Image size="md" img={zing_09} alt="Вид панели Zing Data, показывающий несколько визуализаций, организованных в макете панели" border />
    <br/>

## Связанный контент {#related-content}

- [Документация](https://docs.getzingdata.com/docs/)
- [Быстрый старт](https://getzingdata.com/quickstart/)
- Руководство по [Созданию панелей](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)