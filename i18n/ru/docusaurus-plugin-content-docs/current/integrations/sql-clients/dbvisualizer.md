---
slug: '/integrations/dbvisualizer'
sidebar_label: DbVisualizer
description: 'DbVisualizer — это инструмент для работы с базами данных с расширенной'
title: 'Подключение DbVisualizer к ClickHouse'
doc_type: guide
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение DbVisualizer к ClickHouse

<CommunityMaintainedBadge/>

## Начните или загрузите DbVisualizer {#start-or-download-dbvisualizer}

DbVisualizer доступен по адресу https://www.dbvis.com/download/

## 1. Соберите свои данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Управление встроенными JDBC-драйверами {#2-built-in-jdbc-driver-management}

В DbVisualizer уже включены самые актуальные JDBC-драйвера для ClickHouse. В нем имеется полностью встроенное управление JDBC-драйверами, которое указывает на последние релизы, а также исторические версии драйверов.

<Image img={dbvisualizer_driver_manager} size="lg" border alt="Интерфейс управления драйверами DbVisualizer, показывающий конфигурацию JDBC-драйвера ClickHouse" />

## 3. Подключение к ClickHouse {#3-connect-to-clickhouse}

Чтобы подключить базу данных с помощью DbVisualizer, вам сначала необходимо создать и настроить Подключение к базе данных.

1. Создайте новое подключение из **Database->Create Database Connection** и выберите драйвер для вашей базы данных из всплывающего меню.

2. Откроется вкладка **Object View** для нового подключения.

3. Введите имя для подключения в поле **Name**, и при необходимости введите описание подключения в поле **Notes**.

4. Оставьте **Database Type** как **Auto Detect**.

5. Если выбранный драйвер в **Driver Type** отмечен зеленой галочкой, то он готов к использованию. Если он не отмечен зеленой галочкой, вам может понадобиться настроить драйвер в **Driver Manager**.

6. Введите информацию о сервере базы данных в оставшиеся поля.

7. Убедитесь, что можно установить сетевое соединение с указанным адресом и портом, нажав кнопку **Ping Server**.

8. Если результат Ping Server показывает, что сервер доступен, нажмите **Connect**, чтобы подключиться к серверу базы данных.

:::tip
Смотрите [Исправление проблем с подключением](https://www.dbvis.com/docs/ug/troubleshooting/fixing-connection-issues/) для получения советов, если у вас возникли проблемы с подключением к базе данных.

## Узнайте больше {#learn-more}

Для получения дополнительной информации о DbVisualizer посетите [документацию DbVisualizer](https://www.dbvis.com/docs/ug/).