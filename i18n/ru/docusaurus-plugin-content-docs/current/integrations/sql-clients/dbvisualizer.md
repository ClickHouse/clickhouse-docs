---
sidebar_label: DbVisualizer
slug: /integrations/dbvisualizer
description: 'DbVisualizer это инструмент для работы с базами данных с расширенной поддержкой ClickHouse.'
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';


# Подключение DbVisualizer к ClickHouse

## Запуск или загрузка DbVisualizer {#start-or-download-dbvisualizer}

DbVisualizer доступен по адресу https://www.dbvis.com/download/

## 1. Соберите ваши данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Управление встроенными JDBC драйверами {#2-built-in-jdbc-driver-management}

В DbVisualizer включены самые современные JDBC драйверы для ClickHouse. Он имеет полное управление JDBC драйверами, которое указывает на последние версии, а также исторические версии драйверов.

<img src={dbvisualizer_driver_manager} class="image" alt="DbVisualizer 01" />

## 3. Подключение к ClickHouse {#3-connect-to-clickhouse}

Для подключения к базе данных с помощью DbVisualizer, сначала необходимо создать и настроить Соединение Базы Данных. 

1. Создайте новое соединение из **Database->Create Database Connection** и выберите драйвер для вашей базы данных из всплывающего меню.

2. Откроется вкладка **Object View** для нового соединения.

3. Введите имя для соединения в поле **Name** и, при желании, введите описание соединения в поле **Notes**.

4. Оставьте **Database Type** как **Auto Detect**.

5. Если выбранный драйвер в **Driver Type** отмечен зеленой галочкой, он готов к использованию. Если он не отмечен зеленой галочкой, возможно, вам придется настроить драйвер в **Driver Manager**.

6. Введите информацию о сервере базы данных в оставшихся полях.

7. Проверьте, что сетевое соединение может быть установлено с указанным адресом и портом, нажав кнопку **Ping Server**.

8. Если результат от Ping Server показывает, что сервер доступен, нажмите **Connect**, чтобы подключиться к серверу базы данных.

:::tip
Смотрите [Устранение проблем с подключением](https://confluence.dbvis.com/display/UG231/Fixing+Connection+Issues) для получения рекомендаций, если у вас возникли проблемы с подключением к базе данных.

## Узнайте больше {#learn-more}

Для получения дополнительной информации о DbVisualizer посетите [документацию DbVisualizer](https://confluence.dbvis.com/display/UG231/Users+Guide).
