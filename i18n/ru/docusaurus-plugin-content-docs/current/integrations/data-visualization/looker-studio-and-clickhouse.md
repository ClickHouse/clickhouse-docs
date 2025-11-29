---
sidebar_label: 'Looker Studio'
slug: /integrations/lookerstudio
keywords: ['clickhouse', 'looker', 'studio', 'connect', 'mysql', 'integrate', 'ui']
description: 'Looker Studio, ранее Google Data Studio, — это онлайн‑инструмент для преобразования данных в настраиваемые информативные отчёты и дашборды.'
title: 'Looker Studio'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import MySQLCloudSetup from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import looker_studio_01 from '@site/static/images/integrations/data-visualization/looker_studio_01.png';
import looker_studio_02 from '@site/static/images/integrations/data-visualization/looker_studio_02.png';
import looker_studio_03 from '@site/static/images/integrations/data-visualization/looker_studio_03.png';
import looker_studio_04 from '@site/static/images/integrations/data-visualization/looker_studio_04.png';
import looker_studio_05 from '@site/static/images/integrations/data-visualization/looker_studio_05.png';
import looker_studio_06 from '@site/static/images/integrations/data-visualization/looker_studio_06.png';
import looker_studio_enable_mysql from '@site/static/images/integrations/data-visualization/looker_studio_enable_mysql.png';
import looker_studio_mysql_cloud from '@site/static/images/integrations/data-visualization/looker_studio_mysql_cloud.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Looker Studio {#looker-studio}

<PartnerBadge/>

Looker Studio может подключаться к ClickHouse через интерфейс MySQL, используя официальный источник данных Google для MySQL.



## Настройка ClickHouse Cloud {#clickhouse-cloud-setup}
<MySQLCloudSetup />



## Настройка локального сервера ClickHouse {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />



## Подключение Looker Studio к ClickHouse {#connecting-looker-studio-to-clickhouse}

Сначала войдите на сайт https://lookerstudio.google.com под своей учетной записью Google и создайте новый источник данных (Data Source):

<Image size="md" img={looker_studio_01} alt="Создание нового источника данных в интерфейсе Looker Studio" border />
<br/>

Найдите официальный коннектор MySQL от Google (называется просто **MySQL**):

<Image size="md" img={looker_studio_02} alt="Поиск коннектора MySQL в списке коннекторов Looker Studio" border />
<br/>

Укажите параметры подключения. Обратите внимание, что порт интерфейса MySQL по умолчанию — 9004,
и он может отличаться в зависимости от конфигурации вашего сервера.

<Image size="md" img={looker_studio_03} alt="Указание параметров подключения ClickHouse по интерфейсу MySQL в Looker Studio" border />
<br/>

Теперь у вас есть два варианта получения данных из ClickHouse. Можно использовать инструмент Table Browser:

<Image size="md" img={looker_studio_04} alt="Использование Table Browser для выбора таблиц ClickHouse в Looker Studio" border />
<br/>

Либо вы можете указать произвольный SQL-запрос для получения данных:

<Image size="md" img={looker_studio_05} alt="Использование пользовательского SQL-запроса для выборки данных из ClickHouse в Looker Studio" border />
<br/>

В результате вы увидите автоматически определенную структуру таблицы и при необходимости сможете скорректировать типы данных.

<Image size="md" img={looker_studio_06} alt="Просмотр автоматически определенной структуры таблицы ClickHouse в Looker Studio" border />
<br/>

Теперь вы можете приступать к анализу своих данных или созданию нового отчета!



## Использование Looker Studio с ClickHouse Cloud {#using-looker-studio-with-clickhouse-cloud}

При использовании ClickHouse Cloud сначала необходимо включить интерфейс MySQL. Это можно сделать в диалоговом окне подключения, на вкладке «MySQL».

<Image size="md" img={looker_studio_enable_mysql} alt="Включение интерфейса MySQL в настройках ClickHouse Cloud" border />
<br/>

В интерфейсе Looker Studio выберите опцию «Enable SSL». SSL-сертификат ClickHouse Cloud подписан центром [Let's Encrypt](https://letsencrypt.org/certificates/). Вы можете скачать корневой сертификат [здесь](https://letsencrypt.org/certs/isrgrootx1.pem).

<Image size="md" img={looker_studio_mysql_cloud} alt="Конфигурация подключения Looker Studio с настройками SSL ClickHouse Cloud" border />
<br/>

Остальные шаги такие же, как описано выше в предыдущем разделе.
