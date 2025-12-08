---
sidebar_label: 'DataGrip'
slug: /integrations/datagrip
description: 'DataGrip — это IDE для баз данных с встроенной поддержкой ClickHouse.'
title: 'Подключение DataGrip к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Подключение DataGrip к ClickHouse {#connecting-datagrip-to-clickhouse}

<CommunityMaintainedBadge/>

## Запустите или загрузите DataGrip {#start-or-download-datagrip}

DataGrip доступен на сайте https://www.jetbrains.com/datagrip/

## 1. Соберите сведения о подключении {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Загрузите драйвер ClickHouse {#2-load-the-clickhouse-driver}

1. Запустите DataGrip и на вкладке **Data Sources** в диалоговом окне **Data Sources and Drivers** нажмите значок **+**

<Image img={datagrip_5} size="lg" border alt="Вкладка Data Sources в DataGrip с выделенным значком +" />

  Выберите **ClickHouse**

  :::tip
  По мере настройки подключений порядок будет меняться, и ClickHouse может пока не быть в верхней части списка.
  :::

<Image img={datagrip_6} size="sm" border alt="Выбор ClickHouse из списка источников данных в DataGrip" />

- Перейдите на вкладку **Drivers** и загрузите драйвер ClickHouse

  DataGrip не включает драйверы в поставку, чтобы минимизировать размер загрузки. На вкладке **Drivers**
  выберите **ClickHouse** в разделе **Complete Support** и раскройте значок **+**. Выберите драйвер **Latest stable** в параметре **Provided Driver**:

<Image img={datagrip_1} size="lg" border alt="Вкладка Drivers в DataGrip с установкой драйвера ClickHouse" />

## 3. Подключение к ClickHouse {#3-connect-to-clickhouse}

- Укажите параметры подключения к базе данных и нажмите **Test Connection**.  
На первом шаге вы собрали сведения для подключения — укажите адрес хоста, порт, имя пользователя, пароль и имя базы данных, затем проверьте подключение.

:::tip
В поле **Host** укажите только имя хоста (например, `your-host.clickhouse.cloud`) без какого-либо префикса протокола, такого как `https://`.

Для подключений к ClickHouse Cloud необходимо добавить `?ssl=true` в поле **URL** после хоста. Полный JDBC URL должен выглядеть так:

`jdbc:clickhouse://your-host.clickhouse.cloud:8443/default?ssl=true`

ClickHouse Cloud требует шифрования SSL для всех подключений. Без параметра `?ssl=true` вы будете получать ошибки «Connection reset» даже при корректных учетных данных.

Для получения дополнительной информации о настройках JDBC URL обратитесь к репозиторию [ClickHouse JDBC driver](https://github.com/ClickHouse/clickhouse-java).
:::

<Image img={datagrip_7} border alt="Форма параметров подключения в DataGrip с настройками ClickHouse" />

## Подробнее {#learn-more}

Дополнительную информацию о DataGrip см. в его документации.
