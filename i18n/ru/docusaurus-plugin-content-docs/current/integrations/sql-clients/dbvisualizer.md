---
sidebar_label: 'DbVisualizer'
slug: /integrations/dbvisualizer
description: 'DbVisualizer — это инструмент для работы с базами данных с расширенной поддержкой ClickHouse.'
title: 'Подключение DbVisualizer к ClickHouse'
keywords: ['DbVisualizer', 'визуализация баз данных', 'SQL-клиент', 'JDBC-драйвер', 'инструмент для работы с базами данных']
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Подключение DbVisualizer к ClickHouse \\{#connecting-dbvisualizer-to-clickhouse\\}

<CommunityMaintainedBadge/>

## Запустите или скачайте DbVisualizer \\{#start-or-download-dbvisualizer\\}

DbVisualizer можно скачать с сайта https://www.dbvis.com/download/

## 1. Соберите параметры подключения \\{#1-gather-your-connection-details\\}

<ConnectionDetails />

## 2. Встроенное управление JDBC-драйверами \\{#2-built-in-jdbc-driver-management\\}

DbVisualizer включает в себя самые актуальные JDBC-драйверы для ClickHouse. В нем реализовано полнофункциональное встроенное управление JDBC-драйверами, обеспечивающее доступ как к последним релизам, так и к предыдущим версиям драйверов.

<Image img={dbvisualizer_driver_manager} size="lg" border alt="Интерфейс управления драйверами DbVisualizer с конфигурацией JDBC-драйвера ClickHouse" />

## 3. Подключение к ClickHouse \\{#3-connect-to-clickhouse\\}

Чтобы подключиться к базе данных с помощью DbVisualizer, сначала необходимо создать и настроить подключение к базе данных.

1. Создайте новое подключение через **Database->Create Database Connection** и выберите драйвер для вашей базы данных во всплывающем меню.

2. Откроется вкладка **Object View** для нового подключения.

3. Введите имя подключения в поле **Name** и при необходимости укажите его описание в поле **Notes**.

4. Оставьте значение поля **Database Type** равным **Auto Detect**.

5. Если выбранный драйвер в **Driver Type** отмечен зеленой галочкой, он готов к использованию. Если он не отмечен зеленой галочкой, возможно, потребуется настроить драйвер в **Driver Manager**.

6. Укажите информацию о сервере базы данных в оставшихся полях.

7. Убедитесь, что можно установить сетевое соединение с указанными адресом и портом, нажав кнопку **Ping Server**.

8. Если результат **Ping Server** показывает, что сервер доступен, нажмите **Connect**, чтобы подключиться к серверу базы данных.

:::tip
См. раздел [Fixing Connection Issues](https://www.dbvis.com/docs/ug/troubleshooting/fixing-connection-issues/) с рекомендациями по устранению проблем при подключении к базе данных.

## Подробнее \\{#learn-more\\}

Дополнительные сведения о DbVisualizer см. в [документации DbVisualizer](https://www.dbvis.com/docs/ug/).