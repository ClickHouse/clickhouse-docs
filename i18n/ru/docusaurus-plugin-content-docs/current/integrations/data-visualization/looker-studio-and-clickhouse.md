---
sidebar_label: Looker Studio
slug: /integrations/lookerstudio
keywords: [clickhouse, looker, studio, connect, mysql, integrate, ui]
description: Looker Studio, ранее Google Data Studio, это онлайн-инструмент для преобразования данных в настраиваемые информативные отчеты и панели мониторинга.
---

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


# Looker Studio

Looker Studio может подключаться к ClickHouse через интерфейс MySQL, используя официальный источник данных MySQL от Google.

## Настройка ClickHouse в облаке {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## Настройка ClickHouse на месте {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Подключение Looker Studio к ClickHouse {#connecting-looker-studio-to-clickhouse}

Сначала войдите на https://lookerstudio.google.com с использованием своей учетной записи Google и создайте новый источник данных:

<img src={looker_studio_01} class="image" alt="Создание нового источника данных" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Ищите официальный соединитель MySQL, предоставленный Google (названный просто **MySQL**):

<img src={looker_studio_02} class="image" alt="Поиск соединителя MySQL" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Укажите свои данные для подключения. Обратите внимание, что порт интерфейса MySQL по умолчанию равен 9004, 
и он может отличаться в зависимости от конфигурации вашего сервера.

<img src={looker_studio_03} class="image" alt="Указание деталей подключения" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Теперь у вас есть два варианта, как получить данные из ClickHouse. Во-первых, вы можете использовать функцию Табличного Обозревателя:

<img src={looker_studio_04} class="image" alt="Использование Табличного Обозревателя" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

В качестве альтернативы, вы можете указать собственный запрос для получения ваших данных:

<img src={looker_studio_05} class="image" alt="Использование собственного запроса для получения данных" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

В конце концов, вы должны увидеть интроспектированную структуру таблицы и при необходимости скорректировать типы данных.

<img src={looker_studio_06} class="image" alt="Просмотр интроспектированной структуры таблицы" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Теперь вы можете приступить к исследованию своих данных или созданию нового отчета!

## Использование Looker Studio с ClickHouse в облаке {#using-looker-studio-with-clickhouse-cloud}

При использовании ClickHouse в облаке вам сначала нужно включить интерфейс MySQL. Сделать это можно в диалоговом окне подключения на вкладке "MySQL".

<img src={looker_studio_enable_mysql} class="image" alt="Looker Studio требует первоначального включения MySQL" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

В интерфейсе Looker Studio выберите опцию "Включить SSL". SSL-сертификат ClickHouse в облаке подписан [Let's Encrypt](https://letsencrypt.org/certificates/). Вы можете скачать этот корневой сертификат [здесь](https://letsencrypt.org/certs/isrgrootx1.pem).

<img src={looker_studio_mysql_cloud} class="image" alt="Looker Studio с конфигурацией SSL ClickHouse в облаке" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Остальные шаги такие же, как описано выше в предыдущем разделе.
