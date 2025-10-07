---
slug: '/integrations/datagrip'
sidebar_label: DataGrip
description: 'DataGrip является IDE для баз данных, которая поддерживает ClickHouse'
title: 'Подключение DataGrip к ClickHouse'
doc_type: guide
---
import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение DataGrip к ClickHouse

<CommunityMaintainedBadge/>

## 1. Запустите или загрузите DataGrip {#start-or-download-datagrip}

DataGrip доступен по адресу https://www.jetbrains.com/datagrip/

## 2. Соберите свои параметры подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 3. Загрузите драйвер ClickHouse {#2-load-the-clickhouse-driver}

1. Запустите DataGrip, и на вкладке **Data Sources** в диалоговом окне **Data Sources and Drivers** нажмите на значок **+**

<Image img={datagrip_5} size="lg" border alt="Вкладка Data Sources в DataGrip с выделенным значком +" />

  Выберите **ClickHouse**

  :::tip
  Порядок в списке изменяется по мере установления соединений, ClickHouse может быть не на первом месте в вашем списке.
  :::

<Image img={datagrip_6} size="sm" border alt="Выбор ClickHouse из списка источников данных в DataGrip" />

- Переключитесь на вкладку **Drivers** и загрузите драйвер ClickHouse

  DataGrip не включает драйверы, чтобы минимизировать размер загрузки. На вкладке **Drivers**
  выберите **ClickHouse** из списка **Complete Support** и разверните знак **+**. Выберите драйвер **Latest stable** из опции **Provided Driver**:

<Image img={datagrip_1} size="lg" border alt="Вкладка Drivers в DataGrip, показывающая установку драйвера ClickHouse" />

## 4. Подключитесь к ClickHouse {#3-connect-to-clickhouse}

- Укажите свои параметры подключения к базе данных и нажмите **Test Connection**:

  На первом шаге вы собрали данные подключения, заполните URL хоста, порт, имя пользователя, пароль и имя базы данных, затем протестируйте соединение.

  :::tip
  Пункт **HOST** в диалоговом окне DataGrip на самом деле является URL, смотрите изображение ниже.

  Для получения дополнительной информации о настройках JDBC URL, пожалуйста, обратитесь к [репозиторию драйвера ClickHouse JDBC](https://github.com/ClickHouse/clickhouse-java).
  :::

<Image img={datagrip_7} size="md" border alt="Форма параметров подключения в DataGrip с настройками ClickHouse" />

## Узнайте больше {#learn-more}

Чтобы найти больше информации о DataGrip, посетите документацию DataGrip.