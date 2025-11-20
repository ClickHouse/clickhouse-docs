---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: /integrations/tableau-online
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau Online раскрывает потенциал данных, помогая людям принимать решения быстрее и увереннее, где бы они ни находились.'
title: 'Tableau Online'
doc_type: 'guide'
---

import MySQLCloudSetup from '@site/docs/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/docs/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
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

Tableau Online может подключаться к ClickHouse Cloud или локально развернутому ClickHouse через интерфейс MySQL, используя официальный источник данных MySQL.



## Настройка ClickHouse Cloud {#clickhouse-cloud-setup}

<MySQLCloudSetup />


## Настройка сервера ClickHouse on-premise {#on-premise-clickhouse-server-setup}

<MySQLOnPremiseSetup />


## Подключение Tableau Online к ClickHouse (локальная установка без SSL) {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

Войдите на свой сайт Tableau Cloud и добавьте новый публикуемый источник данных.

<Image
  size='md'
  img={tableau_online_01}
  alt="Интерфейс Tableau Online с кнопкой 'New' для создания публикуемого источника данных"
  border
/>
<br />

Выберите «MySQL» из списка доступных коннекторов.

<Image
  size='md'
  img={tableau_online_02}
  alt='Экран выбора коннектора Tableau Online с выделенной опцией MySQL'
  border
/>
<br />

Укажите параметры подключения, собранные при настройке ClickHouse.

<Image
  size='md'
  img={tableau_online_03}
  alt='Экран настройки подключения MySQL в Tableau Online с полями для сервера, порта, базы данных и учетных данных'
  border
/>
<br />

Tableau Online проанализирует базу данных и предоставит список доступных таблиц. Перетащите нужную таблицу на холст справа. Кроме того, вы можете нажать «Update Now» для предварительного просмотра данных, а также настроить типы или имена обнаруженных полей.

<Image
  size='md'
  img={tableau_online_04}
  alt='Страница источника данных Tableau Online с таблицами базы данных слева и холстом справа с функцией перетаскивания'
  border
/>
<br />

После этого остается только нажать «Publish As» в правом верхнем углу, и вы сможете использовать созданный набор данных в Tableau Online как обычно.

Примечание: если вы хотите использовать Tableau Online совместно с Tableau Desktop и обмениваться наборами данных ClickHouse между ними, убедитесь, что в Tableau Desktop также используется стандартный коннектор MySQL, следуя руководству по настройке, которое отображается [здесь](https://www.tableau.com/support/drivers), если вы выбираете MySQL из выпадающего списка источников данных. Если у вас Mac с процессором M1, ознакомьтесь с [этой веткой по устранению неполадок](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) для обходного решения при установке драйвера.


## Подключение Tableau Online к ClickHouse (облачная или локальная установка с SSL) {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

Поскольку в мастере настройки MySQL-подключения Tableau Online невозможно указать SSL-сертификаты,
единственный способ — настроить подключение в Tableau Desktop, а затем опубликовать его в Tableau Online. Этот процесс достаточно прост.

Запустите Tableau Desktop на компьютере с Windows или Mac и выберите "Connect" → "To a Server" → "MySQL".
Скорее всего, сначала потребуется установить драйвер MySQL на ваш компьютер.
Это можно сделать, следуя инструкции по установке, которая отображается [здесь](https://www.tableau.com/support/drivers), если выбрать MySQL из выпадающего списка Data Source.
Если у вас Mac с процессором M1, ознакомьтесь с [этой веткой по устранению неполадок](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac), чтобы найти обходное решение для установки драйвера.

<Image
  size='md'
  img={tableau_desktop_01}
  alt='Интерфейс Tableau Desktop с меню Connect и выделенной опцией MySQL'
  border
/>
<br />

:::note
В интерфейсе настройки MySQL-подключения убедитесь, что опция "SSL" включена.
SSL-сертификат ClickHouse Cloud подписан центром сертификации [Let's Encrypt](https://letsencrypt.org/certificates/).
Корневой сертификат можно скачать [здесь](https://letsencrypt.org/certs/isrgrootx1.pem).
:::

Укажите учетные данные пользователя MySQL для вашего экземпляра ClickHouse Cloud и путь к скачанному корневому сертификату.

<Image
  size='sm'
  img={tableau_desktop_02}
  alt='Диалог MySQL-подключения в Tableau Desktop с включенной опцией SSL и полями для сервера, имени пользователя, пароля и сертификата'
  border
/>
<br />

Выберите нужные таблицы как обычно (аналогично Tableau Online)
и выберите "Server" → "Publish Data Source" → Tableau Cloud.

<Image
  size='md'
  img={tableau_desktop_03}
  alt='Tableau Desktop с меню Server и выделенной опцией Publish Data Source'
  border
/>
<br />

ВАЖНО: необходимо выбрать "Embedded password" в опциях "Authentication".

<Image
  size='md'
  img={tableau_desktop_04}
  alt='Диалог публикации в Tableau Desktop с опциями Authentication и выбранным Embedded password'
  border
/>
<br />

Дополнительно выберите "Update workbook to use the published data source".

<Image
  size='sm'
  img={tableau_desktop_05}
  alt="Диалог публикации в Tableau Desktop с отмеченной опцией 'Update workbook to use the published data source'"
  border
/>
<br />

Наконец, нажмите "Publish", и ваш источник данных со встроенными учетными данными автоматически откроется в Tableau Online.


## Известные ограничения (ClickHouse 23.11) {#known-limitations-clickhouse-2311}

Все известные ограничения были устранены в ClickHouse `23.11`. Если вы столкнётесь с другими проблемами совместимости, [свяжитесь с нами](https://clickhouse.com/company/contact) или создайте [новую задачу](https://github.com/ClickHouse/ClickHouse/issues).
