---
sidebar_label: 'Zing Data'
sidebar_position: 206
slug: /integrations/zingdata
keywords: ['Zing Data']
description: 'Zing Data — простое решение для социальной бизнес-аналитики на базе ClickHouse, доступное для iOS, Android и веб.'
title: 'Подключение Zing Data к ClickHouse'
show_related_blogs: true
doc_type: 'guide'
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


# Подключение Zing Data к ClickHouse

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> — это платформа для исследования и визуализации данных. Zing Data подключается к ClickHouse с помощью JS-драйвера, предоставляемого ClickHouse.



## Как подключиться {#how-to-connect}

1. Подготовьте параметры подключения.

   <ConnectionDetails />

2. Загрузите или откройте Zing Data
   - Чтобы использовать ClickHouse с Zing Data на мобильном устройстве, загрузите приложение Zing Data из [Google Play Store](https://play.google.com/store/apps/details?id=com.getzingdata.android) или [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091).

   - Чтобы использовать ClickHouse с Zing Data в веб-версии, перейдите в [веб-консоль Zing](https://console.getzingdata.com/) и создайте учётную запись.

3. Добавьте источник данных
   - Для работы с данными ClickHouse в Zing Data необходимо определить **_источник данных_**. В меню мобильного приложения Zing Data выберите **Sources**, затем нажмите **Add a Datasource**.

   - Чтобы добавить источник данных в веб-версии, нажмите **Data Sources** в верхнем меню, затем нажмите **New Datasource** и выберите **Clickhouse** из выпадающего списка

   <Image
     size='md'
     img={zing_01}
     alt='Интерфейс Zing Data с кнопкой New Datasource и опцией ClickHouse в выпадающем меню'
     border
   />
   <br />

4. Заполните параметры подключения и нажмите **Check Connection**.

   <Image
     size='md'
     img={zing_02}
     alt='Форма настройки подключения ClickHouse в Zing Data с полями для сервера, порта, базы данных, имени пользователя и пароля'
     border
   />
   <br />

5. Если подключение выполнено успешно, Zing перенаправит вас к выбору таблиц. Выберите необходимые таблицы и нажмите **Save**. Если Zing не может подключиться к источнику данных, вы увидите сообщение с просьбой проверить учётные данные и повторить попытку. Если даже после проверки учётных данных и повторной попытки проблемы сохраняются, <a id="contact_link" href="mailto:hello@getzingdata.com">обратитесь в службу поддержки Zing.</a>

   <Image
     size='md'
     img={zing_03}
     alt='Интерфейс выбора таблиц Zing Data с доступными таблицами ClickHouse и флажками'
     border
   />
   <br />

6. После добавления источника данных ClickHouse он будет доступен всем участникам вашей организации Zing на вкладке **Data Sources** / **Sources**.


## Создание графиков и дашбордов в Zing Data {#creating-charts-and-dashboards-in-zing-data}

1. После добавления источника данных ClickHouse нажмите **Zing App** в веб-интерфейсе или выберите источник данных в мобильном приложении, чтобы начать создание графиков.

2. Нажмите на таблицу в списке таблиц, чтобы создать график.

   <Image
     size='sm'
     img={zing_04}
     alt='Интерфейс Zing Data со списком доступных таблиц ClickHouse'
     border
   />
   <br />

3. Используйте визуальный конструктор запросов для выбора нужных полей, агрегаций и т. д., затем нажмите **Run Question**.

   <Image
     size='md'
     img={zing_05}
     alt='Интерфейс визуального конструктора запросов Zing Data с возможностью выбора полей и настройки агрегаций'
     border
   />
   <br />

4. Если вы знакомы с SQL, вы также можете написать собственный SQL-запрос для выполнения запросов и создания графика.

   <Image
     size='md'
     img={zing_06}
     alt='Режим SQL-редактора в Zing Data с интерфейсом для написания SQL-запросов'
     border
   />
   <Image
     size='md'
     img={zing_07}
     alt='Результаты выполнения SQL-запроса в Zing Data с данными в табличном формате'
     border
   />

5. Пример графика выглядит следующим образом. Запрос можно сохранить через меню с тремя точками. Вы можете комментировать график, отмечать членов команды, создавать оповещения в реальном времени, изменять тип графика и т. д.

   <Image
     size='md'
     img={zing_08}
     alt='Пример визуализации графика в Zing Data с данными из ClickHouse и меню опций'
     border
   />
   <br />

6. Дашборды можно создать с помощью значка «+» в разделе **Dashboards** на главном экране. Существующие запросы можно перетащить на дашборд для отображения.

   <Image
     size='md'
     img={zing_09}
     alt='Вид дашборда Zing Data с несколькими визуализациями, размещенными в макете дашборда'
     border
   />
   <br />


## Связанный контент {#related-content}

- [Документация](https://docs.getzingdata.com/docs/)
- [Быстрый старт](https://getzingdata.com/quickstart/)
- Руководство по [созданию дашбордов](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)
