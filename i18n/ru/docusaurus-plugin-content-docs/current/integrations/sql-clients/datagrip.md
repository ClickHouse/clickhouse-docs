---
sidebar_label: DataGrip
slug: /integrations/datagrip
description: DataGrip — это IDE для баз данных, которая поддерживает ClickHouse из коробки.
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';


# Подключение DataGrip к ClickHouse

## Запустите или загрузите DataGrip {#start-or-download-datagrip}

DataGrip доступен по адресу https://www.jetbrains.com/datagrip/

## 1. Соберите ваши данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Загрузите драйвер ClickHouse {#2-load-the-clickhouse-driver}

1. Запустите DataGrip, и на вкладке **Источники данных** в диалоге **Источники данных и драйверы** нажмите на значок **+**

<img src={datagrip_5} class="image" alt="DataGrip 05" />

  Выберите **ClickHouse**

  :::tip
  По мере установки соединений порядок изменяется, ClickHouse может еще не быть вверху вашего списка.
  :::

<img src={datagrip_6} class="image" alt="DataGrip 06" />

- Переключитесь на вкладку **Драйверы** и загрузите драйвер ClickHouse

  DataGrip не поставляется с драйверами, чтобы минимизировать размер загрузки. На вкладке **Драйверы**
  выберите **ClickHouse** из списка **Полная поддержка**, и раскройте знак **+**. Выберите **Последний стабильный** драйвер из опции **Предоставленный драйвер**:

<img src={datagrip_1} class="image" alt="DataGrip 01" />

## 3. Подключитесь к ClickHouse {#3-connect-to-clickhouse}

- Укажите данные подключения к вашей базе данных и нажмите **Проверить соединение**:

  На первом шаге вы собрали данные для подключения, заполните URL хоста, порт, имя пользователя, пароль и имя базы данных, затем протестируйте соединение.

  :::tip
  Запись **HOST** в диалоге DataGrip на самом деле является URL, смотрите изображение ниже.

  Для получения дополнительной информации о настройках JDBC URL, пожалуйста, обратитесь к [репозиторию драйвера ClickHouse JDBC](https://github.com/ClickHouse/clickhouse-java).
  :::

<img src={datagrip_7} class="image" alt="DataGrip 07" />

## Узнайте больше {#learn-more}

Чтобы узнать больше о DataGrip, посетите документацию DataGrip.
