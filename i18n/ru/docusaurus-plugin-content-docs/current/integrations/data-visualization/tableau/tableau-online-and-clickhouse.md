---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: /integrations/tableau-online
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau Online помогает максимально эффективно использовать данные, чтобы люди могли быстрее и увереннее принимать решения, где бы они ни находились.'
title: 'Tableau Online'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
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

# Tableau Online {#tableau-online}

Tableau Online может подключаться к ClickHouse Cloud или локальному развертыванию ClickHouse через интерфейс MySQL, используя официальный источник данных MySQL.

## Настройка ClickHouse Cloud {#clickhouse-cloud-setup}

<MySQLCloudSetup />

## Настройка сервера ClickHouse в локальной инфраструктуре {#on-premise-clickhouse-server-setup}

<MySQLOnPremiseSetup />

## Подключение Tableau Online к ClickHouse (on-premise, без SSL) {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

Войдите в свою учетную запись Tableau Cloud и добавьте новый источник данных (Published Data Source).

<Image size="md" img={tableau_online_01} alt="Интерфейс Tableau Online с кнопкой «New» для создания опубликованного источника данных" border />

<br/>

Выберите «MySQL» из списка доступных коннекторов.

<Image size="md" img={tableau_online_02} alt="Экран выбора коннектора Tableau Online с выделенной опцией MySQL" border />

<br/>

Укажите параметры подключения, собранные при настройке ClickHouse.

<Image size="md" img={tableau_online_03} alt="Экран настройки подключения MySQL в Tableau Online с полями для сервера, порта, базы данных и учетных данных" border />

<br/>

Tableau Online проанализирует базу данных и предоставит список доступных таблиц. Перетащите нужную таблицу на рабочую область справа. Дополнительно вы можете нажать «Update Now», чтобы просмотреть данные, а также при необходимости скорректировать определенные при анализе типы полей или их имена.

<Image size="md" img={tableau_online_04} alt="Страница источника данных Tableau Online с таблицами базы данных слева и рабочей областью справа с поддержкой перетаскивания" border />

<br/>

После этого останется лишь нажать «Publish As» в правом верхнем углу, и вы сможете использовать созданный набор данных в Tableau Online как обычно.

NB: если вы хотите использовать Tableau Online в сочетании с Tableau Desktop и делиться наборами данных ClickHouse между ними, убедитесь, что вы используете Tableau Desktop с тем же стандартным коннектором MySQL, следуя руководству по настройке, которое отображается [здесь](https://www.tableau.com/support/drivers), если выбрать MySQL в выпадающем списке Data Source. Если у вас Mac на процессоре M1, ознакомьтесь с [этой темой по устранению неполадок](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) для обходного варианта установки драйвера.

## Подключение Tableau Online к ClickHouse (облачное или локальное развертывание с SSL) {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

Так как невозможно указать SSL-сертификаты через мастер настройки подключения MySQL в Tableau Online, 
единственный способ — использовать Tableau Desktop для настройки подключения, а затем опубликовать его в Tableau Online. Однако этот процесс довольно простой.

Запустите Tableau Desktop на компьютере под управлением Windows или macOS и выберите "Connect" -> "To a Server" -> "MySQL".
Скорее всего, сначала потребуется установить драйвер MySQL на ваш компьютер. 
Вы можете сделать это, следуя инструкции по установке, которая отображается [здесь](https://www.tableau.com/support/drivers), если выбрать MySQL в выпадающем списке источников данных (Data Source). 
Если у вас Mac на базе M1, посмотрите [эту тему по устранению неполадок](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) для обходного решения по установке драйвера.

<Image size="md" img={tableau_desktop_01} alt="Интерфейс Tableau Desktop с меню Connect и выделенной опцией MySQL" border />
<br/>

:::note
В интерфейсе настройки подключения MySQL убедитесь, что опция "SSL" включена. 
SSL-сертификат ClickHouse Cloud подписан центром сертификации [Let's Encrypt](https://letsencrypt.org/certificates/). 
Вы можете скачать этот корневой сертификат [здесь](https://letsencrypt.org/certs/isrgrootx1.pem).
:::

Укажите учетные данные пользователя MySQL для вашего экземпляра ClickHouse Cloud и путь к скачанному корневому сертификату.

<Image size="sm" img={tableau_desktop_02} alt="Диалог подключения MySQL в Tableau Desktop с включенной опцией SSL и полями для сервера, имени пользователя, пароля и сертификата" border />
<br/>

Выберите нужные таблицы как обычно (аналогично Tableau Online) 
и выберите "Server" -> "Publish Data Source" -> Tableau Cloud.

<Image size="md" img={tableau_desktop_03} alt="Tableau Desktop с меню Server и выделенной опцией Publish Data Source" border />
<br/>

ВАЖНО: в параметрах "Authentication" необходимо выбрать "Embedded password".

<Image size="md" img={tableau_desktop_04} alt="Диалог публикации Tableau Desktop с параметрами Authentication и выбранной опцией Embedded password" border />
<br/>

Дополнительно включите опцию "Update workbook to use the published data source".

<Image size="sm" img={tableau_desktop_05} alt="Диалог публикации Tableau Desktop с отмеченной опцией 'Update workbook to use the published data source'" border />
<br/>

Наконец, нажмите "Publish", и ваш источник данных со встроенными учетными данными будет автоматически открыт в Tableau Online.

## Известные ограничения (ClickHouse 23.11) {#known-limitations-clickhouse-2311}

Все известные ограничения были исправлены в ClickHouse `23.11`. Если вы столкнётесь с другими проблемами совместимости, [свяжитесь с нами](https://clickhouse.com/company/contact) или создайте [новый запрос](https://github.com/ClickHouse/ClickHouse/issues).