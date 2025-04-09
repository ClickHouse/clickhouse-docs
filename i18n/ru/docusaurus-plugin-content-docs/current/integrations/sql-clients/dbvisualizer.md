---
sidebar_label: 'DbVisualizer'
slug: /integrations/dbvisualizer
description: 'DbVisualizer — это инструмент базы данных с расширенной поддержкой ClickHouse.'
title: 'Подключение DbVisualizer к ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение DbVisualizer к ClickHouse

<CommunityMaintainedBadge/>

## Начало работы или загрузка DbVisualizer {#start-or-download-dbvisualizer}

DbVisualizer доступен по адресу https://www.dbvis.com/download/

## 1. Соберите свои данные подключения {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Управление встроенными драйверами JDBC {#2-built-in-jdbc-driver-management}

DbVisualizer включает самые актуальные драйверы JDBC для ClickHouse. В нем встроено полное управление драйверами JDBC, которое указывает на последние версии, а также исторические версии драйверов.

<Image img={dbvisualizer_driver_manager} size="lg" border alt="Интерфейс менеджера драйверов DbVisualizer, показывающий конфигурацию JDBC-драйвера ClickHouse" />

## 3. Подключение к ClickHouse {#3-connect-to-clickhouse}

Чтобы подключить базу данных к DbVisualizer, вам необходимо сначала создать и настроить соединение с базой данных.

1. Создайте новое соединение через **База данных->Создать соединение с базой данных** и выберите драйвер для вашей базы данных из выпадающего меню.

2. Откроется вкладка **Представление объектов** для нового соединения.

3. Введите имя для соединения в поле **Имя** и при желании введите описание соединения в поле **Заметки**.

4. Оставьте **Тип базы данных** как **Автоопределение**.

5. Если выбранный драйвер в **Типе драйвера** отмечен зеленой галочкой, то он готов к использованию. Если он не отмечен зеленой галочкой, возможно, вам потребуется настроить драйвер в **Менеджере драйверов**.

6. Введите информацию о сервере базы данных в оставшиеся поля.

7. Убедитесь, что сетевое соединение может быть установлено с указанным адресом и портом, нажав кнопку **Ping Server**.

8. Если результат Ping Server показывает, что сервер доступен, нажмите **Подключиться**, чтобы подключиться к серверу базы данных.

:::tip
См. [Решение проблем с подключением](https://confluence.dbvis.com/display/UG231/Fixing+Connection+Issues) для получения советов, если у вас возникли проблемы с подключением к базе данных.

## Узнать больше {#learn-more}

Для получения дополнительной информации о DbVisualizer посетите [документацию DbVisualizer](https://confluence.dbvis.com/display/UG231/Users+Guide).
