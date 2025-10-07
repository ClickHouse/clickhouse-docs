---
slug: '/integrations/tablumio'
sidebar_label: TABLUM.IO
description: 'TABLUM.IO — это SaaS для управления данными, который поддерживает'
title: 'Подключение TABLUM.IO к ClickHouse'
doc_type: guide
---
import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение TABLUM.IO к ClickHouse

<CommunityMaintainedBadge/>

## Откройте страницу запуска TABLUM.IO {#open-the-tablumio-startup-page}

:::note
  Вы можете установить самоуправляемую версию TABLUM.IO на своем сервере Linux в Docker.
:::

## 1. Зарегистрируйтесь или войдите в сервис {#1-sign-up-or-sign-in-to-the-service}

  Сначала зарегистрируйтесь в TABLUM.IO с помощью вашего электронного адреса или воспользуйтесь быстрой авторизацией через аккаунты Google или Facebook.

<Image img={tablum_ch_0} size="md" border alt="Страница входа в TABLUM.IO" />

## 2. Добавьте соединитель ClickHouse {#2-add-a-clickhouse-connector}

Соберите данные подключения к ClickHouse, перейдите на вкладку **Соединитель** и заполните URL хоста, порт, имя пользователя, пароль, имя базы данных и имя соединителя. После заполнения этих полей нажмите на кнопку **Проверить соединение**, чтобы подтвердить данные, а затем нажмите **Сохранить соединитель для меня**, чтобы сделать его постоянным.

:::tip
Убедитесь, что вы указали правильный **HTTP** порт и переключили режим **SSL** в соответствии с данными вашего подключения.
:::

:::tip
Обычно порт составляет 8443 при использовании TLS или 8123 при его отсутствии.
:::

<Image img={tablum_ch_1} size="lg" border alt="Добавление соединителя ClickHouse в TABLUM.IO" />

## 3. Выберите соединитель {#3-select-the-connector}

Перейдите на вкладку **Набор данных**. Выберите только что созданный соединитель ClickHouse из выпадающего списка. В правой панели появится список доступных таблиц и схем.

<Image img={tablum_ch_2} size="lg" border alt="Выбор соединителя ClickHouse в TABLUM.IO" />

## 4. Введите SQL-запрос и выполните его {#4-input-a-sql-query-and-run-it}

Введите запрос в SQL Консоли и нажмите **Выполнить запрос**. Результаты будут отображены в виде таблицы.

:::tip
Щелкните правой кнопкой мыши на названии колонки, чтобы открыть выпадающее меню с сортировкой, фильтрацией и другими действиями.
:::

<Image img={tablum_ch_3} size="lg" border alt="Выполнение SQL-запроса в TABLUM.IO" />

:::note
С помощью TABLUM.IO вы можете
* создавать и использовать несколько соединителей ClickHouse в вашем аккаунте TABLUM.IO,
* выполнять запросы к любым загруженным данным независимо от источника данных,
* делиться результатами в виде новой базы данных ClickHouse.
:::

## Узнать больше {#learn-more}

Найдите дополнительную информацию о TABLUM.IO на https://tablum.io.