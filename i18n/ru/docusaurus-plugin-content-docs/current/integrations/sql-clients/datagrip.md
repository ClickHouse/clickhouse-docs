---
sidebar_label: 'DataGrip'
slug: /integrations/datagrip
description: 'DataGrip — это IDE для работы с базами данных, которая поддерживает ClickHouse «из коробки».'
title: 'Подключение DataGrip к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
  - website: 'https://www.jetbrains.com/datagrip/'
keywords: ['DataGrip', 'database IDE', 'JetBrains', 'SQL client', 'integrated development environment']
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение DataGrip к ClickHouse

<CommunityMaintainedBadge/>



## Запуск или скачивание DataGrip {#start-or-download-datagrip}

DataGrip доступен по адресу https://www.jetbrains.com/datagrip/


## 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. Загрузка драйвера ClickHouse {#2-load-the-clickhouse-driver}

1. Запустите DataGrip и на вкладке **Data Sources** в диалоговом окне **Data Sources and Drivers** нажмите на значок **+**

<Image
  img={datagrip_5}
  size='lg'
  border
  alt='Вкладка Data Sources в DataGrip с выделенным значком +'
/>

Выберите **ClickHouse**

:::tip
По мере создания подключений порядок меняется, поэтому ClickHouse может еще не находиться в начале списка.
:::

<Image
  img={datagrip_6}
  size='sm'
  border
  alt='Выбор ClickHouse из списка источников данных в DataGrip'
/>

- Переключитесь на вкладку **Drivers** и загрузите драйвер ClickHouse

  DataGrip не поставляется с драйверами, чтобы минимизировать размер загрузки. На вкладке **Drivers**
  выберите **ClickHouse** из списка **Complete Support** и разверните знак **+**. Выберите драйвер **Latest stable** из опции **Provided Driver**:

<Image
  img={datagrip_1}
  size='lg'
  border
  alt='Вкладка Drivers в DataGrip с установкой драйвера ClickHouse'
/>


## 3. Подключение к ClickHouse {#3-connect-to-clickhouse}

- Укажите параметры подключения к базе данных и нажмите **Test Connection**.
  На первом шаге вы собрали данные для подключения — заполните URL хоста, порт, имя пользователя, пароль и имя базы данных, после чего протестируйте подключение.

:::tip
В поле **Host** указывайте только имя хоста (например, `your-host.clickhouse.cloud`) без префикса протокола типа `https://`.

Для подключений к ClickHouse Cloud необходимо добавить `?ssl=true` в поле **URL** ниже поля хоста. Полный JDBC URL должен выглядеть следующим образом:

`jdbc:clickhouse://your-host.clickhouse.cloud:8443/default?ssl=true`

ClickHouse Cloud требует SSL-шифрования для всех подключений. Без параметра `?ssl=true` вы будете получать ошибки «Connection reset» даже при корректных учётных данных.

Подробнее о настройках JDBC URL см. в репозитории [драйвера ClickHouse JDBC](https://github.com/ClickHouse/clickhouse-java).
:::

<Image
  img={datagrip_7}
  border
  alt='Форма параметров подключения DataGrip с настройками ClickHouse'
/>


## Дополнительная информация {#learn-more}

Дополнительную информацию о DataGrip можно найти в документации DataGrip.
