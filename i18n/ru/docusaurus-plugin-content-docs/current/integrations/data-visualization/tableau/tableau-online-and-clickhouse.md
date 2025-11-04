---
slug: '/integrations/tableau-online'
sidebar_label: 'Tableau Online'
sidebar_position: 2
description: 'Tableau Online упрощает использование данных, чтобы люди могли быстрее'
title: 'Tableau Online'
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
doc_type: guide
---
import MySQLCloudSetup from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import Image from '@theme/IdealImage';
import tableau_online_01 from '@site/static/images/integrations/data-visualization/tableau_online_01.png';
import tableau_online_02 from '@site/static/images/integrations/data-visualization/tableau_online_02.png';
import tableau_online_03 from '@site/static/images/integrations/data-visualization/tableau_online_03.png';
import tableau_online_04 from '@site/static/images/integrations/data-visualization/tableau_online_04.png';
import tableau_desktop_01 from '@site/static/images/integrations/data-visualization/tableau_desktop_01.png';
import tableau_desktop_02 from '@site/static/images/integrations/data-visualization/tableau_desktop_02.png';
import tableau_desktop_03 from '@site/static/images/integrations/data-visualization/tableau_desktop_03.png';
import tableau_desktop_04 from '@site/static/images/integrations/data-visualization/tableau_desktop_04.png';
import tableau_desktop_05 from '@site/static/images/integrations/data-visualization/tableau_desktop_05.png';


# Tableau Online

Tableau Online может подключаться к ClickHouse Cloud или локальной установке ClickHouse через интерфейс MySQL, используя официальный источник данных MySQL.

## Настройка ClickHouse Cloud {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## Настройка локального сервера ClickHouse {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Подключение Tableau Online к ClickHouse (локальный без SSL) {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

Войдите на свой сайт Tableau Cloud и добавьте новый Опубликованный источник данных.

<Image size="md" img={tableau_online_01} alt="Интерфейс Tableau Online с кнопкой 'Новый' для создания опубликованного источника данных" border />
<br/>

Выберите "MySQL" из списка доступных коннекторов.

<Image size="md" img={tableau_online_02} alt="Экран выбора коннекторов Tableau Online с выделенной опцией MySQL" border />
<br/>

Укажите данные подключения, собранные во время настройки ClickHouse.

<Image size="md" img={tableau_online_03} alt="Экран настройки подключения MySQL в Tableau Online с полями сервера, порта, базы данных и учетных данных" border />
<br/>

Tableau Online исследует базу данных и предоставляет список доступных таблиц. Перетащите нужную таблицу на холст справа. Дополнительно, вы можете нажать "Обновить сейчас", чтобы предварительно просмотреть данные, а также уточнить типы или имена исследуемых полей.

<Image size="md" img={tableau_online_04} alt="Страница источника данных Tableau Online с показанными таблицами базы данных слева и холстом справа с функциональностью перетаскивания" border />
<br/>

После этого остается только нажать "Опубликовать как" в правом верхнем углу, и вы сможете использовать вновь созданный набор данных в Tableau Online, как обычно.

Примечание: если вы хотите использовать Tableau Online в комбинации с Tableau Desktop и делиться наборами данных ClickHouse между ними, убедитесь, что вы также используете Tableau Desktop с коннектором MySQL по умолчанию, следуя руководству по настройке, которое отображается [здесь](https://www.tableau.com/support/drivers), если вы выбираете MySQL из выпадающего списка источников данных. Если у вас Mac с M1, посмотрите [эту тему по устранению неполадок](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) для обходного решения установки драйвера.

## Подключение Tableau Online к ClickHouse (облачная или локальная установка с SSL) {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

Так как невозможно предоставить SSL сертификаты через мастер настройки соединения MySQL Tableau Online, единственный способ — использовать Tableau Desktop для настройки соединения, а затем экспортировать его в Tableau Online. Этот процесс, однако, вполне прост.

Запустите Tableau Desktop на Windows или Mac, и выберите "Подключиться" -> "К серверу" -> "MySQL". Вероятно, вам потребуется сначала установить драйвер MySQL на вашем компьютере. Вы можете сделать это, следуя руководству по настройке, которое отображается [здесь](https://www.tableau.com/support/drivers), если вы выбираете MySQL из выпадающего списка источников данных. Если у вас Mac с M1, посмотрите [эту тему по устранению неполадок](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) для обходного решения установки драйвера.

<Image size="md" img={tableau_desktop_01} alt="Интерфейс Tableau Desktop с меню Подключиться и выделенной опцией MySQL" border />
<br/>

:::note
В интерфейсе настройки подключения MySQL убедитесь, что опция "SSL" включена. 
SSL сертификат ClickHouse Cloud подписан [Let's Encrypt](https://letsencrypt.org/certificates/). 
Вы можете загрузить этот корневой сертификат [здесь](https://letsencrypt.org/certs/isrgrootx1.pem).
:::

Укажите учетные данные пользователя MySQL для вашего экземпляра ClickHouse Cloud и путь к загруженному корневому сертификату.

<Image size="sm" img={tableau_desktop_02} alt="Диалог подключения MySQL в Tableau Desktop с включенной опцией SSL и полями для сервера, имени пользователя, пароля и сертификата" border />
<br/>

Выберите нужные таблицы, как обычно (т similarly к Tableau Online), 
и выберите "Сервер" -> "Опубликовать источник данных" -> Tableau Cloud.

<Image size="md" img={tableau_desktop_03} alt="Tableau Desktop показывает меню Сервер с выделенной опцией Опубликовать источник данных" border />
<br/>

ВАЖНО: вам нужно выбрать "Встроенный пароль" в опциях "Аутентификация".

<Image size="md" img={tableau_desktop_04} alt="Диалог публикации Tableau Desktop с опциями аутентификации, где выделен Встроенный пароль" border />
<br/>

Дополнительно, выберите "Обновить рабочую книгу для использования опубликованным источником данных".

<Image size="sm" img={tableau_desktop_05} alt="Диалог публикации Tableau Desktop с отмеченной опцией 'Обновить рабочую книгу для использования опубликованным источником данных'" border />
<br/>

Наконец, нажмите "Опубликовать", и ваш источник данных с встроенными учетными данными будет автоматически открыт в Tableau Online.

## Известные ограничения (ClickHouse 23.11) {#known-limitations-clickhouse-2311}

Все известные ограничения были исправлены в ClickHouse `23.11`. Если вы столкнетесь с другими несовместимостями, пожалуйста, не стесняйтесь [связываться с нами](https://clickhouse.com/company/contact) или создать [новую задачу](https://github.com/ClickHouse/ClickHouse/issues).