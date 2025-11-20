---
sidebar_label: 'DbVisualizer'
slug: /integrations/dbvisualizer
description: 'DbVisualizer — это инструмент для работы с базами данных с расширенной поддержкой ClickHouse.'
title: 'Подключение DbVisualizer к ClickHouse'
keywords: ['DbVisualizer', 'визуализация базы данных', 'SQL-клиент', 'JDBC-драйвер', 'инструмент для работы с базами данных']
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение DbVisualizer к ClickHouse

<CommunityMaintainedBadge/>



## Запуск или скачивание DbVisualizer {#start-or-download-dbvisualizer}

DbVisualizer можно скачать по адресу https://www.dbvis.com/download/


## 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. Встроенное управление JDBC-драйверами {#2-built-in-jdbc-driver-management}

DbVisualizer включает в себя актуальные JDBC-драйверы для ClickHouse. Встроенная система управления драйверами обеспечивает доступ как к последним релизам, так и к предыдущим версиям драйверов.

<Image
  img={dbvisualizer_driver_manager}
  size='lg'
  border
  alt='Интерфейс менеджера драйверов DbVisualizer с настройками JDBC-драйвера ClickHouse'
/>


## 3. Подключение к ClickHouse {#3-connect-to-clickhouse}

Чтобы подключить базу данных к DbVisualizer, сначала необходимо создать и настроить подключение к базе данных.

1. Создайте новое подключение через меню **Database->Create Database Connection** и выберите драйвер для вашей базы данных во всплывающем меню.

2. Откроется вкладка **Object View** для нового подключения.

3. Введите имя подключения в поле **Name** и при необходимости укажите его описание в поле **Notes**.

4. Оставьте значение **Database Type** равным **Auto Detect**.

5. Если выбранный драйвер в поле **Driver Type** помечен зелёной галочкой, он готов к использованию. Если зелёной галочки нет, возможно, потребуется настроить драйвер в **Driver Manager**.

6. Укажите информацию о сервере базы данных в оставшихся полях.

7. Убедитесь, что сетевое подключение к указанным адресу и порту может быть установлено, нажав кнопку **Ping Server**.

8. Если результат **Ping Server** показывает, что сервер доступен, нажмите **Connect**, чтобы подключиться к серверу базы данных.

:::tip
См. раздел [Fixing Connection Issues](https://www.dbvis.com/docs/ug/troubleshooting/fixing-connection-issues/), чтобы узнать, как устранить проблемы с подключением к базе данных.


## Дополнительная информация {#learn-more}

Дополнительную информацию о DbVisualizer можно найти в [документации DbVisualizer](https://www.dbvis.com/docs/ug/).
