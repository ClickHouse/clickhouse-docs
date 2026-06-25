---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IO — это SaaS-платформа для управления данными с нативной поддержкой ClickHouse.'
title: 'Подключение TABLUM.IO к ClickHouse'
doc_type: 'guide'
keywords: ['tablum', 'SQL-клиент', 'инструмент для работы с базами данных', 'инструмент для выполнения запросов', 'настольное приложение']
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

<CommunityMaintainedBadge />

## Откройте стартовую страницу TABLUM.IO \{#open-the-tablumio-startup-page\}

:::note
Вы можете установить локальную версию TABLUM.IO на свой Linux-сервер с помощью Docker.
:::

## 1. Зарегистрируйтесь в сервисе или войдите в него \{#1-sign-up-or-sign-in-to-the-service\}

Сначала зарегистрируйтесь в TABLUM.IO, указав адрес электронной почты, или воспользуйтесь быстрым входом через аккаунт Google или Facebook.

<Image img={tablum_ch_0} size="md" border alt="Страница входа в TABLUM.IO" />

## 2. Добавьте коннектор ClickHouse \{#2-add-a-clickhouse-connector\}

Подготовьте данные для подключения к ClickHouse, перейдите на вкладку **Connector** и укажите URL хоста, порт, имя пользователя, пароль, имя базы данных и имя коннектора. Заполнив эти поля, нажмите кнопку **Test connection**, чтобы проверить введённые данные, затем нажмите **Save connector for me**, чтобы сохранить коннектор.

:::tip
Убедитесь, что указан правильный порт **HTTP** и что режим **SSL** выбран в соответствии с параметрами подключения.
:::

:::tip
Обычно используется порт 8443 при использовании TLS и 8123 — без TLS.
:::

<Image img={tablum_ch_1} size="lg" border alt="Добавление коннектора ClickHouse в TABLUM.IO" />

## 3. Выберите коннектор \{#3-select-the-connector\}

Перейдите на вкладку **Dataset**. В раскрывающемся списке выберите недавно созданный коннектор ClickHouse. На правой панели отобразится список доступных таблиц и схем.

<Image img={tablum_ch_2} size="lg" border alt="Выбор коннектора ClickHouse в TABLUM.IO" />

## 4. Введите SQL-запрос и запустите его \{#4-input-a-sql-query-and-run-it\}

Введите запрос в SQL Console и нажмите **Run Query**. Результаты будут показаны в виде таблицы.

:::tip
Щёлкните правой кнопкой мыши по названию столбца, чтобы открыть раскрывающееся меню с сортировкой, фильтром и другими действиями.
:::

<Image img={tablum_ch_3} size="lg" border alt="Выполнение SQL-запроса в TABLUM.IO" />

:::note
С TABLUM.IO вы можете

* создавать и использовать несколько коннекторов ClickHouse в своей учётной записи TABLUM.IO,
* выполнять запросы к любым загруженным данным независимо от источника данных,
* делиться результатами в виде новой базы данных ClickHouse.
  :::

## Подробнее \{#learn-more\}

Дополнительную информацию о TABLUM.IO см. на https://tablum.io.