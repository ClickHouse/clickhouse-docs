---
sidebar_label: 'DataGrip'
slug: /integrations/datagrip
description: 'DataGrip — это IDE для баз данных, которая из коробки поддерживает ClickHouse.'
title: 'Подключение DataGrip к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'sql_client'
  - website: 'https://www.jetbrains.com/datagrip/'
keywords: ['DataGrip', 'IDE для баз данных', 'JetBrains', 'SQL-клиент', 'интегрированная среда разработки']
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';
// Компонент CommunityMaintainedBadge обозначает материалы, поддерживаемые сообществом
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение DataGrip к ClickHouse \{#connecting-datagrip-to-clickhouse\}

<CommunityMaintainedBadge/>

## Запустите DataGrip или скачайте его \{#start-or-download-datagrip\}

DataGrip доступен по адресу https://www.jetbrains.com/datagrip/

## 1. Соберите сведения о подключении \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. Загрузите драйвер ClickHouse \{#2-load-the-clickhouse-driver\}

1. Запустите DataGrip и на вкладке **Data Sources** в диалоговом окне **Data Sources and Drivers** нажмите значок **+**

<Image img={datagrip_5} size="lg" border alt="Вкладка DataGrip Data Sources с выделенным значком +" />

Выберите **ClickHouse**

:::tip
  По мере создания подключений их порядок меняется, поэтому ClickHouse может пока не находиться вверху списка.
  :::

<Image img={datagrip_6} size="sm" border alt="Выбор ClickHouse из списка источников данных в DataGrip" />

- Переключитесь на вкладку **Drivers** и загрузите драйвер ClickHouse

  DataGrip не поставляется с драйверами, чтобы минимизировать размер загрузки. На вкладке **Drivers**
  выберите **ClickHouse** в списке **Complete Support** и разверните знак **+**. Выберите драйвер **Latest stable** в пункте **Provided Driver**:

<Image img={datagrip_1} size="lg" border alt="Вкладка DataGrip Drivers с показом установки драйвера ClickHouse" />

## 3. Подключитесь к ClickHouse \{#3-connect-to-clickhouse\}

- Укажите параметры подключения к базе данных и нажмите **Test Connection**. 
На первом шаге вы собрали параметры подключения — заполните URL хоста, порт, имя пользователя, пароль и имя базы данных, затем протестируйте подключение.

:::tip
В поле **Host** указывайте только имя хоста (например, `your-host.clickhouse.cloud`) без какого-либо префикса протокола вроде `https://`.

Для подключений к ClickHouse Cloud необходимо добавить `?ssl=true` в поле **URL** под хостом. Полный JDBC URL должен выглядеть так:

`jdbc:clickhouse://your-host.clickhouse.cloud:8443/default?ssl=true`

ClickHouse Cloud требует шифрование с помощью SSL для всех подключений. Без параметра `?ssl=true` вы будете получать ошибки "Connection reset" даже при корректных учетных данных.

Для получения дополнительной информации о настройках JDBC URL обратитесь к репозиторию [ClickHouse JDBC driver](https://github.com/ClickHouse/clickhouse-java).
:::

<Image img={datagrip_7} border alt="Форма параметров подключения DataGrip с настройками ClickHouse" />

## Узнайте больше \{#learn-more\}

Дополнительную информацию о DataGrip см. в документации DataGrip.