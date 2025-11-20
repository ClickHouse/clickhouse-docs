---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IO — это SaaS-сервис для управления данными с поддержкой ClickHouse «из коробки».'
title: 'Подключение TABLUM.IO к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
keywords: ['tablum', 'sql client', 'database tool', 'query tool', 'desktop app']
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение TABLUM.IO к ClickHouse

<CommunityMaintainedBadge/>



## Откройте стартовую страницу TABLUM.IO {#open-the-tablumio-startup-page}

:::note
Вы можете установить самостоятельно размещаемую версию TABLUM.IO на своём Linux-сервере в Docker.
:::


## 1. Регистрация или вход в сервис {#1-sign-up-or-sign-in-to-the-service}

Для начала зарегистрируйтесь в TABLUM.IO, используя адрес электронной почты, или войдите через аккаунт Google или Facebook.

<Image img={tablum_ch_0} size='md' border alt='Страница входа в TABLUM.IO' />


## 2. Добавление коннектора ClickHouse {#2-add-a-clickhouse-connector}

Подготовьте данные для подключения к ClickHouse, перейдите на вкладку **Connector** и укажите URL хоста, порт, имя пользователя, пароль, имя базы данных и имя коннектора. После заполнения этих полей нажмите кнопку **Test connection** для проверки подключения, затем нажмите **Save connector for me**, чтобы сохранить коннектор.

:::tip
Убедитесь, что указан правильный порт **HTTP** и режим **SSL** настроен в соответствии с параметрами подключения.
:::

:::tip
Обычно используется порт 8443 при работе с TLS или 8123 без TLS.
:::

<Image
  img={tablum_ch_1}
  size='lg'
  border
  alt='Добавление коннектора ClickHouse в TABLUM.IO'
/>


## 3. Выберите коннектор {#3-select-the-connector}

Перейдите на вкладку **Dataset**. Выберите созданный ранее коннектор ClickHouse из выпадающего списка. В правой панели отобразится список доступных таблиц и схем.

<Image
  img={tablum_ch_2}
  size='lg'
  border
  alt='Выбор коннектора ClickHouse в TABLUM.IO'
/>


## 4. Введите SQL-запрос и выполните его {#4-input-a-sql-query-and-run-it}

Введите запрос в SQL Console и нажмите **Run Query**. Результаты будут отображены в виде электронной таблицы.

:::tip
Щёлкните правой кнопкой мыши по имени столбца, чтобы открыть выпадающее меню с сортировкой, фильтрацией и другими действиями.
:::

<Image
  img={tablum_ch_3}
  size='lg'
  border
  alt='Выполнение SQL-запроса в TABLUM.IO'
/>

:::note
С помощью TABLUM.IO вы можете:

- создавать и использовать несколько коннекторов ClickHouse в вашей учётной записи TABLUM.IO;
- выполнять запросы к любым загруженным данным независимо от источника данных;
- делиться результатами в виде новой базы данных ClickHouse.
:::


## Дополнительная информация {#learn-more}

Больше информации о TABLUM.IO можно найти на https://tablum.io.
