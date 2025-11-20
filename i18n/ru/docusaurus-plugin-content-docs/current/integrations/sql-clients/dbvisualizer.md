---
sidebar_label: 'DbVisualizer'
slug: /integrations/dbvisualizer
description: 'DbVisualizer — это инструмент для работы с базами данных с расширенной поддержкой ClickHouse.'
title: 'Подключение DbVisualizer к ClickHouse'
keywords: ['DbVisualizer', 'визуализация баз данных', 'SQL-клиент', 'JDBC-драйвер', 'инструмент для работы с базами данных']
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

DbVisualizer включает самые актуальные JDBC-драйверы для ClickHouse. В него встроено полноценное управление JDBC-драйверами, которое обеспечивает доступ как к последним релизам, так и к предыдущим версиям драйверов.

<Image
  img={dbvisualizer_driver_manager}
  size='lg'
  border
  alt='Интерфейс менеджера драйверов DbVisualizer с конфигурацией JDBC-драйвера ClickHouse'
/>


## 3. Подключение к ClickHouse {#3-connect-to-clickhouse}

Для подключения базы данных через DbVisualizer необходимо сначала создать и настроить соединение с базой данных.

1. Создайте новое соединение через **Database->Create Database Connection** и выберите драйвер для вашей базы данных из всплывающего меню.

2. Откроется вкладка **Object View** для нового соединения.

3. Введите имя соединения в поле **Name** и при необходимости добавьте описание в поле **Notes**.

4. Оставьте для параметра **Database Type** значение **Auto Detect**.

5. Если выбранный драйвер в поле **Driver Type** отмечен зелёной галочкой, он готов к использованию. Если галочка отсутствует, возможно, потребуется настроить драйвер в **Driver Manager**.

6. Введите информацию о сервере базы данных в остальных полях.

7. Проверьте возможность установки сетевого соединения с указанным адресом и портом, нажав кнопку **Ping Server**.

8. Если результат проверки Ping Server показывает, что сервер доступен, нажмите **Connect** для подключения к серверу базы данных.

:::tip
См. раздел [Fixing Connection Issues](https://www.dbvis.com/docs/ug/troubleshooting/fixing-connection-issues/) для получения рекомендаций при возникновении проблем с подключением к базе данных.


## Узнать больше {#learn-more}

Дополнительную информацию о DbVisualizer можно найти в [документации DbVisualizer](https://www.dbvis.com/docs/ug/).
