---
sidebar_label: 'DbVisualizer'
slug: /integrations/dbvisualizer
description: 'DbVisualizer — это инструмент для работы с базами данных с расширенной поддержкой ClickHouse.'
title: 'Подключение DbVisualizer к ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение DbVisualizer к ClickHouse

<CommunityMaintainedBadge/>

## Запуск или загрузка DbVisualizer {#start-or-download-dbvisualizer}

DbVisualizer доступен на https://www.dbvis.com/download/

## 1. Соберите свои данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Встроенное управление драйверами JDBC {#2-built-in-jdbc-driver-management}

В DbVisualizer включены самые актуальные драйверы JDBC для ClickHouse. Встроенное управление драйверами JDBC обеспечивает доступ к последним версиям, а также к историческим версиям драйверов.

<Image img={dbvisualizer_driver_manager} size="lg" border alt="Интерфейс менеджера драйверов DbVisualizer, показывающий конфигурацию драйвера JDBC ClickHouse" />

## 3. Подключение к ClickHouse {#3-connect-to-clickhouse}

Чтобы подключить базу данных с помощью DbVisualizer, сначала необходимо создать и настроить подключение к базе данных.

1. Создайте новое подключение через **База данных->Создать подключение к базе данных** и выберите драйвер для вашей базы данных из всплывающего меню.

2. Откроется вкладка **Объектный вид** для нового подключения.

3. Введите имя для подключения в поле **Имя** и, при желании, введите описание подключения в поле **Заметки**.

4. Оставьте **Тип базы данных** на **Автоопределение**.

5. Если выбранный драйвер в **Тип драйвера** отмечен зеленой галочкой, значит, он готов к использованию. Если он не отмечен зеленой галочкой, вам, возможно, придется настроить драйвер в **Менеджере драйверов**.

6. Введите информацию о сервере базы данных в оставшиеся поля.

7. Убедитесь, что можно установить сетевое соединение с указанным адресом и портом, нажав кнопку **Пинговать сервер**.

8. Если результат от Ping Server показывает, что сервер доступен, нажмите **Подключиться**, чтобы подключиться к серверу базы данных.

:::tip
Смотрите [Устранение проблем с подключением](https://confluence.dbvis.com/display/UG231/Fixing+Connection+Issues) для получения некоторых советов, если у вас возникли проблемы с подключением к базе данных.

## Узнайте больше {#learn-more}

Чтобы найти дополнительную информацию о DbVisualizer, посетите [документацию DbVisualizer](https://confluence.dbvis.com/display/UG231/Users+Guide).
