---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: /integrations/tableau-online
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau Online упрощает работу с данными, чтобы сделать людей более быстрыми и уверенными в своих решениях из любого места.'
title: 'Tableau Online'
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

## Подключение Tableau Online к ClickHouse (локальное без SSL) {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

Войдите на ваш сайт Tableau Cloud и добавьте новый опубликованный источник данных.

<Image size="md" img={tableau_online_01} alt="Интерфейс Tableau Online, показывающий кнопку 'New' для создания опубликованного источника данных" border />
<br/>

Выберите "MySQL" из списка доступных коннекторов.

<Image size="md" img={tableau_online_02} alt="Экран выбора коннектора Tableau Online с выделенной опцией MySQL" border />
<br/>

Укажите данные подключения, собранные во время настройки ClickHouse.

<Image size="md" img={tableau_online_03} alt="Экран конфигурации подключения MySQL в Tableau Online с полями для сервера, порта, базы данных и учетных данных" border />
<br/>

Tableau Online проведет интроспекцию базы данных и предоставит список доступных таблиц. Перетащите желаемую таблицу на холст справа. Кроме того, вы можете нажать "Update Now", чтобы предварительно просмотреть данные, а также уточнить типы или названия интроспектируемых полей.

<Image size="md" img={tableau_online_04} alt="Страница источника данных Tableau Online, показывающая таблицы базы данных слева и холст справа с функцией перетаскивания" border />
<br/>

После этого остается только нажать "Publish As" в верхнем правом углу, и вы сможете использовать вновь созданный набор данных в Tableau Online как обычно.

NB: если вы хотите использовать Tableau Online в сочетании с Tableau Desktop и делиться наборами данных ClickHouse между ними, убедитесь, что вы также используете Tableau Desktop с коннектором MySQL по умолчанию, следуя руководству по настройке, которое отображается [здесь](https://www.tableau.com/support/drivers), если вы выберете MySQL из выпадающего списка источников данных. Если у вас Mac с M1, ознакомьтесь с [этим обсуждением по устранению неполадок](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) для обходного пути установки драйвера.

## Подключение Tableau Online к ClickHouse (Cloud или локальная установка с SSL) {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

Так как невозможно предоставить SSL-сертификаты через мастер настройки подключения MySQL в Tableau Online, единственный способ — использовать Tableau Desktop для настройки подключения и затем экспортировать его в Tableau Online. Этот процесс, однако, довольно прост.

Запустите Tableau Desktop на Windows или Mac, и выберите "Connect" -> "To a Server" -> "MySQL". Скорее всего, потребуется сначала установить драйвер MySQL на вашем компьютере. Вы можете сделать это, следуя руководству по настройке, которое отображается [здесь](https://www.tableau.com/support/drivers), если вы выберете MySQL из выпадающего списка источников данных. Если у вас Mac с M1, ознакомьтесь с [этим обсуждением по устранению неполадок](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) для обходного пути установки драйвера.

<Image size="md" img={tableau_desktop_01} alt="Интерфейс Tableau Desktop, показывающий меню Подключение с выделенной опцией MySQL" border />
<br/>

:::note
В интерфейсе настройки подключения MySQL убедитесь, что опция "SSL" включена. 
SSL-сертификат ClickHouse Cloud подписан [Let's Encrypt](https://letsencrypt.org/certificates/). 
Вы можете скачать этот корневой сертификат [здесь](https://letsencrypt.org/certs/isrgrootx1.pem).
:::

Укажите учетные данные пользователя MySQL вашего облачного экземпляра ClickHouse и путь к загруженному корневому сертификату.

<Image size="sm" img={tableau_desktop_02} alt="Диалог подключения MySQL в Tableau Desktop с включенной опцией SSL и полями для сервера, имени пользователя, пароля и сертификата" border />
<br/>

Выберите желаемые таблицы как обычно (аналогично Tableau Online), и выберите "Server" -> "Publish Data Source" -> Tableau Cloud.

<Image size="md" img={tableau_desktop_03} alt="Tableau Desktop, показывающий меню Сервера с выделенной опцией Опубликовать источник данных" border />
<br/>

ВАЖНО: необходимо выбрать "Embedded password" в параметрах аутентификации.

<Image size="md" img={tableau_desktop_04} alt="Диалог публикации Tableau Desktop, показывающий параметры аутентификации с выбранной опцией Embedded password" border />
<br/>

Кроме того, выберите "Обновить рабочую книгу для использования опубликованного источника данных".

<Image size="sm" img={tableau_desktop_05} alt="Диалог публикации Tableau Desktop с отмеченной опцией 'Обновить рабочую книгу для использования опубликованного источника данных'" border />
<br/>

Наконец, нажмите "Publish", и ваш источник данных с встроенными учетными данными автоматически откроется в Tableau Online.


## Известные ограничения (ClickHouse 23.11) {#known-limitations-clickhouse-2311}

Все известные ограничения были исправлены в ClickHouse `23.11`. Если вы столкнетесь с какими-либо другими несовместимостями, пожалуйста, не стесняйтесь [связываться с нами](https://clickhouse.com/company/contact) или создать [новую проблему](https://github.com/ClickHouse/ClickHouse/issues).
