---
sidebar_label: 'Looker Studio'
slug: /integrations/lookerstudio
keywords: ['clickhouse', 'looker', 'studio', 'connect', 'mysql', 'integrate', 'ui']
description: 'Looker Studio, ранее известная как Google Data Studio, является онлайн инструментом для преобразования данных в настраиваемые информативные отчеты и панели мониторинга.'
title: 'Looker Studio'
---

import Image from '@theme/IdealImage';
import MySQLCloudSetup from '@site/docs/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/docs/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import looker_studio_01 from '@site/static/images/integrations/data-visualization/looker_studio_01.png';
import looker_studio_02 from '@site/static/images/integrations/data-visualization/looker_studio_02.png';
import looker_studio_03 from '@site/static/images/integrations/data-visualization/looker_studio_03.png';
import looker_studio_04 from '@site/static/images/integrations/data-visualization/looker_studio_04.png';
import looker_studio_05 from '@site/static/images/integrations/data-visualization/looker_studio_05.png';
import looker_studio_06 from '@site/static/images/integrations/data-visualization/looker_studio_06.png';
import looker_studio_enable_mysql from '@site/static/images/integrations/data-visualization/looker_studio_enable_mysql.png';
import looker_studio_mysql_cloud from '@site/static/images/integrations/data-visualization/looker_studio_mysql_cloud.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Looker Studio

<CommunityMaintainedBadge/>

Looker Studio может подключаться к ClickHouse через интерфейс MySQL, используя официальный источник данных MySQL от Google.

## Настройка ClickHouse Cloud {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## Настройка локального сервера ClickHouse {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Подключение Looker Studio к ClickHouse {#connecting-looker-studio-to-clickhouse}

Сначала войдите на https://lookerstudio.google.com, используя свою учетную запись Google, и создайте новый источник данных:

<Image size="md" img={looker_studio_01} alt="Создание нового источника данных в интерфейсе Looker Studio" border />
<br/>

Найдите официальный коннектор MySQL, предоставленный Google (названный просто **MySQL**):

<Image size="md" img={looker_studio_02} alt="Поиск коннектора MySQL в списке коннекторов Looker Studio" border />
<br/>

Укажите данные подключения. Обратите внимание, что порт интерфейса MySQL по умолчанию равен 9004, и он может отличаться в зависимости от конфигурации вашего сервера.

<Image size="md" img={looker_studio_03} alt="Указание данных подключения ClickHouse MySQL в Looker Studio" border />
<br/>

Теперь у вас есть два варианта, как получить данные из ClickHouse. Во-первых, вы можете использовать функцию Table Browser:

<Image size="md" img={looker_studio_04} alt="Использование Table Browser для выбора таблиц ClickHouse в Looker Studio" border />
<br/>

В качестве альтернативы вы можете указать пользовательский запрос для получения ваших данных:

<Image size="md" img={looker_studio_05} alt="Использование пользовательского SQL-запроса для получения данных из ClickHouse в Looker Studio" border />
<br/>

Наконец, вы должны увидеть структуру таблицы, которую вы исследовали, и при необходимости настроить типы данных.

<Image size="md" img={looker_studio_06} alt="Просмотр структуры таблицы ClickHouse в Looker Studio" border />
<br/>

Теперь вы можете продолжить исследовать ваши данные или создать новый отчет!

## Использование Looker Studio с ClickHouse Cloud {#using-looker-studio-with-clickhouse-cloud}

При использовании ClickHouse Cloud вам сначала необходимо включить интерфейс MySQL. Вы можете сделать это в диалоговом окне подключения, на вкладке "MySQL".

<Image size="md" img={looker_studio_enable_mysql} alt="Включение интерфейса MySQL в настройках ClickHouse Cloud" border />
<br/>

В интерфейсе Looker Studio выберите опцию "Включить SSL". SSL-сертификат ClickHouse Cloud подписан [Let's Encrypt](https://letsencrypt.org/certificates/). Вы можете скачать этот корневой сертификат [здесь](https://letsencrypt.org/certs/isrgrootx1.pem).

<Image size="md" img={looker_studio_mysql_cloud} alt="Конфигурация соединения Looker Studio с настройками SSL ClickHouse Cloud" border />
<br/>

Остальные шаги такие же, как указано выше в предыдущем разделе.
