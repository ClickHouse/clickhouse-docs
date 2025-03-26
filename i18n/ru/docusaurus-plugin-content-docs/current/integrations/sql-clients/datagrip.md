---
sidebar_label: 'DataGrip'
slug: /integrations/datagrip
description: 'DataGrip — это IDE для работы с базами данных, которая поддерживает ClickHouse из коробки.'
title: 'Подключение DataGrip к ClickHouse'
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

## Запустите или загрузите DataGrip {#start-or-download-datagrip}

DataGrip доступен по адресу https://www.jetbrains.com/datagrip/

## 1. Соберите данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Загрузите драйвер ClickHouse {#2-load-the-clickhouse-driver}

1. Запустите DataGrip, и на вкладке **Источники данных** в диалоговом окне **Источники данных и драйверы** нажмите на значок **+**

<Image img={datagrip_5} size="lg" border alt="Вкладка Источники данных DataGrip с выделенным значком +" />

  Выберите **ClickHouse**

  :::tip
  При установлении подключений порядок меняется, ClickHouse может еще не быть в верхней части вашего списка.
  :::

<Image img={datagrip_6} size="sm" border alt="DataGrip выбирает ClickHouse из списка источников данных" />

- Перейдите на вкладку **Драйверы** и загрузите драйвер ClickHouse

  DataGrip поставляется без драйверов, чтобы минимизировать размер загрузки. На вкладке **Драйверы**
  выберите **ClickHouse** из списка **Полная поддержка** и раскройте знак **+**. Выберите драйвер **Последний стабильный** из опции **Предоставленный драйвер**:

<Image img={datagrip_1} size="lg" border alt="Вкладка Драйверы DataGrip показывает установку драйвера ClickHouse" />

## 3. Подключитесь к ClickHouse {#3-connect-to-clickhouse}

- Укажите данные для подключения к вашей базе данных и нажмите **Проверить подключение**:

  На первом шаге вы собрали данные для подключения, заполните URL-адрес хоста, порт, имя пользователя, пароль и имя базы данных, затем протестируйте соединение.

  :::tip
  Поле **HOST** в диалоговом окне DataGrip на самом деле является URL, смотрите изображение ниже.

  Для получения дополнительной информации о настройках JDBC URL, пожалуйста, обратитесь к репозиторию [ClickHouse JDBC driver](https://github.com/ClickHouse/clickhouse-java).
  :::

<Image img={datagrip_7} size="md" border alt="Форма данных подключения DataGrip с настройками ClickHouse" />

## Узнайте больше {#learn-more}

Чтобы найти дополнительную информацию о DataGrip, посетите документацию DataGrip.
