---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: /integrations/tableau-online
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau Online упрощает использование данных, позволяя людям быстрее и увереннее принимать решения из любого места.'
---

import MySQLCloudSetup from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
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

## Подключение Tableau Online к ClickHouse (локальная установка без SSL) {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

Войдите в свой сайт Tableau Cloud и добавьте новый опубликованный источник данных.

<img src={tableau_online_01} class="image" alt="Создание нового опубликованного источника данных" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Выберите "MySQL" из списка доступных коннекторов.

<img src={tableau_online_02} class="image" alt="Выбор коннектора MySQL" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Укажите данные для подключения, собранные во время настройки ClickHouse.

<img src={tableau_online_03} class="image" alt="Указание данных для подключения" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Tableau Online будет анализировать базу данных и предоставить список доступных таблиц. Перетащите нужную таблицу на холст справа. Кроме того, вы можете нажать "Обновить сейчас", чтобы просмотреть данные, а также уточнить типы или названия полей.

<img src={tableau_online_04} class="image" alt="Выбор таблиц для использования" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

После этого остается только нажать "Опубликовать как" в правом верхнем углу, и вы сможете использовать созданный набор данных в Tableau Online как обычно.

Примечание: если вы хотите использовать Tableau Online в сочетании с Tableau Desktop и делиться наборами данных ClickHouse между ними, убедитесь, что вы также используете Tableau Desktop с обычным коннектором MySQL, следуя руководству по настройке, которое отображается [здесь](https://www.tableau.com/support/drivers), если вы выберете MySQL из выпадающего списка источников данных. Если у вас есть Mac с M1, проверьте [эту ветку для устранения неполадок](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) для обходного пути установки драйвера.

## Подключение Tableau Online к ClickHouse (Cloud или локальная установка с SSL) {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

Поскольку невозможно предоставить сертификаты SSL через мастер настройки подключения MySQL Tableau Online, 
единственным способом является использование Tableau Desktop для настройки подключения, а затем экспорт его в Tableau Online. Тем не менее, этот процесс довольно прост.

Запустите Tableau Desktop на компьютере под управлением Windows или Mac и выберите "Подключиться" -> "К серверу" -> "MySQL".
Скорее всего, вам потребуется сначала установить драйвер MySQL на вашем компьютере. 
Вы можете сделать это, следуя руководству по настройке, которое отображается [здесь](https://www.tableau.com/support/drivers), если вы выберете MySQL из выпадающего списка источников данных. 
Если у вас есть Mac с M1, проверьте [эту ветку для устранения неполадок](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) для обходного пути установки драйвера.

<img src={tableau_desktop_01} class="image" alt="Создание нового источника данных" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

:::note
В пользовательском интерфейсе настройки подключения MySQL убедитесь, что опция "SSL" включена. 
SSL-сертификат ClickHouse Cloud подписан [Let's Encrypt](https://letsencrypt.org/certificates/). 
Вы можете скачать этот корневой сертификат [здесь](https://letsencrypt.org/certs/isrgrootx1.pem).
:::

Укажите учетные данные пользователя MySQL вашей экземпляра ClickHouse Cloud и путь к загруженному корневому сертификату.

<img src={tableau_desktop_02} class="image" alt="Указание учетных данных" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Выберите необходимые таблицы, как обычно (аналогично Tableau Online), 
и выберите "Сервер" -> "Опубликовать источник данных" -> Tableau Cloud.

<img src={tableau_desktop_03} class="image" alt="Опубликовать источник данных" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

ВАЖНО: вы должны выбрать "Встроенный пароль" в параметрах "Аутентификация".

<img src={tableau_desktop_04} class="image" alt="Настройки публикации источника данных - встроение ваших учетных данных" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Кроме того, выберите "Обновить рабочую книгу, чтобы использовать опубликованный источник данных".

<img src={tableau_desktop_05} class="image" alt="Настройки публикации источника данных - обновление рабочей книги для онлайн-использования" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Наконец, нажмите "Опубликовать", и ваш источник данных с встроенными учетными данными будет открытием автоматически в Tableau Online.


## Известные ограничения (ClickHouse 23.11) {#known-limitations-clickhouse-2311}

Все известные ограничения были устранены в ClickHouse `23.11`. Если вы столкнетесь с другими несовместимостями, пожалуйста, не стесняйтесь [связаться с нами](https://clickhouse.com/company/contact) или создать [новую проблему](https://github.com/ClickHouse/ClickHouse/issues).
