---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IO – это SaaS для управления данными, который поддерживает ClickHouse из коробки.'
title: 'Подключение TABLUM.IO к ClickHouse'
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение TABLUM.IO к ClickHouse

<CommunityMaintainedBadge/>

## Откройте страницу старта TABLUM.IO {#open-the-tablumio-startup-page}

Облачная версия TABLUM.IO доступна по адресу [https://go.tablum.io/](https://go.tablum.io/)

:::note
  Вы можете установить самоуправляемую версию TABLUM.IO на своем сервере Linux в docker.
:::


## 1. Зарегистрируйтесь или войдите в сервис {#1-sign-up-or-sign-in-to-the-service}

Сначала зарегистрируйтесь в TABLUM.IO, используя вашу электронную почту, или используйте быстрый вход через аккаунты Google или Facebook.

<Image img={tablum_ch_0} size="md" border alt="Страница входа в TABLUM.IO" />

## 2. Добавьте соединитель ClickHouse {#2-add-a-clickhouse-connector}

Соберите данные для подключения к ClickHouse, перейдите на вкладку **Connector** и заполните URL хоста, порт, имя пользователя, пароль, имя базы данных и имя соединителя. После заполнения этих полей нажмите кнопку **Test connection**, чтобы проверить данные, а затем нажмите **Save connector for me**, чтобы сделать его постоянным.

:::tip
Убедитесь, что вы указали правильный **HTTP** порт и переключили режим **SSL** в соответствии с вашими данными подключения.
:::

:::tip
Как правило, порт составляет 8443 при использовании TLS или 8123 при его отсутствии.
:::

<Image img={tablum_ch_1} size="lg" border alt="Добавление соединителя ClickHouse в TABLUM.IO" />

## 3. Выберите соединитель {#3-select-the-connector}

Перейдите на вкладку **Dataset**. Выберите недавно созданный соединитель ClickHouse в выпадающем списке. В правой панели вы увидите список доступных таблиц и схем.

<Image img={tablum_ch_2} size="lg" border alt="Выбор соединителя ClickHouse в TABLUM.IO" />

## 4. Введите SQL-запрос и выполните его {#4-input-a-sql-query-and-run-it}

Введите запрос в SQL консоли и нажмите **Run Query**. Результаты будут отображены в виде электронной таблицы.

:::tip
Щелкните правой кнопкой мыши на названии столбца, чтобы открыть выпадающее меню с действиями сортировки, фильтрации и других операций.
:::

<Image img={tablum_ch_3} size="lg" border alt="Выполнение SQL-запроса в TABLUM.IO" />

:::note
С помощью TABLUM.IO вы можете
* создать и использовать несколько соединителей ClickHouse в вашей учетной записи TABLUM.IO,
* выполнять запросы на любых загруженных данных, независимо от источника данных,
* делиться результатами в качестве новой базы данных ClickHouse.
:::

## Узнайте больше {#learn-more}

Дополнительную информацию о TABLUM.IO можно найти на https://tablum.io.
