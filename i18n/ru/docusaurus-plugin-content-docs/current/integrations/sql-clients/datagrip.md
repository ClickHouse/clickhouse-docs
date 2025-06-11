---
sidebar_label: 'DataGrip'
slug: /integrations/datagrip
description: 'DataGrip — это IDE для баз данных, которая поддерживает ClickHouse из коробки.'
title: 'Подключение DataGrip к ClickHouse'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ru/current/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение DataGrip к ClickHouse

<CommunityMaintainedBadge/>

## Запустите или загрузите DataGrip {#start-or-download-datagrip}

DataGrip доступен по адресу https://www.jetbrains.com/datagrip/

## 1. Соберите сведения о подключении {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Загрузите драйвер ClickHouse {#2-load-the-clickhouse-driver}

1. Запустите DataGrip, и на вкладке **Источники данных** в диалоговом окне **Источники данных и драйверы** нажмите на значок **+**

<Image img={datagrip_5} size="lg" border alt="Вкладка Источники данных DataGrip с выделенным значком +" />

  Выберите **ClickHouse**

  :::tip
  По мере установления соединений порядок изменяется, ClickHouse может еще не находиться на верхней позиции в вашем списке.
  :::

<Image img={datagrip_6} size="sm" border alt="DataGrip выбирает ClickHouse из списка источников данных" />

- Переключитесь на вкладку **Драйверы** и загрузите драйвер ClickHouse

  DataGrip не поставляется с драйверами, чтобы минимизировать размер загрузки. На вкладке **Драйверы** 
  выберите **ClickHouse** из списка **Полная поддержка** и разверните знак **+**. Выберите **Последний стабильный** драйвер из опции **Предоставленный драйвер**:

<Image img={datagrip_1} size="lg" border alt="Вкладка Драйверы DataGrip, показывающая установку драйвера ClickHouse" />

## 3. Подключитесь к ClickHouse {#3-connect-to-clickhouse}

- Укажите сведения о вашем подключении к базе данных и нажмите **Проверить подключение**:

  На первом этапе вы собрали сведения о подключении, заполните URL хоста, порт, имя пользователя, пароль и имя базы данных, затем проверьте подключение.

  :::tip
  Ввод **HOST** в диалоговом окне DataGrip на самом деле является URL, смотрите изображение ниже.

  Для получения дополнительной информации о настройках JDBC URL, пожалуйста, обратитесь к репозиторию [ClickHouse JDBC driver](https://github.com/ClickHouse/clickhouse-java).
  :::

<Image img={datagrip_7} size="md" border alt="Форма сведений о подключении DataGrip с настройками ClickHouse" />

## Узнать больше {#learn-more}

Для получения более подробной информации о DataGrip посетите документацию DataGrip.
