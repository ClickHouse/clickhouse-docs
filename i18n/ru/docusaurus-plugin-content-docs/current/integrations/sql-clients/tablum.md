---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IO — это SaaS для управления данными, который поддерживает ClickHouse из коробки.'
---

import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';


# Подключение TABLUM.IO к ClickHouse

## Откройте страницу запуска TABLUM.IO {#open-the-tablumio-startup-page}

Облачная версия TABLUM.IO доступна по адресу [https://go.tablum.io/](https://go.tablum.io/)

:::note
  Вы можете установить самоуправляемую версию TABLUM.IO на своем сервере Linux в docker.
:::


## 1. Зарегистрируйтесь или войдите в сервис {#1-sign-up-or-sign-in-to-the-service}

Сначала зарегистрируйтесь в TABLUM.IO, используя свою электронную почту, или выполните быструю авторизацию через учетные записи Google или Facebook.

<img src={tablum_ch_0} class="image" alt="TABLUM.IO 0" />

## 2. Добавьте соединитель ClickHouse {#2-add-a-clickhouse-connector}

Соберите данные для подключения к ClickHouse, перейдите на вкладку **Connector** и заполните поля URL хоста, порта, имени пользователя, пароля, имени базы данных и имени соединителя. После завершения заполнения этих полей нажмите кнопку **Test connection**, чтобы проверить данные, а затем нажмите **Save connector for me**, чтобы сделать его постоянным.

:::tip
Убедитесь, что вы указали правильный **HTTP** порт и переключили режим **SSL** в соответствии с деталями вашего подключения.
:::

:::tip
Обычно порт составляет 8443 при использовании TLS или 8123, если TLS не используется.
:::

<img src={tablum_ch_1} class="image" alt="TABLUM.IO 01" />

## 3. Выберите соединитель {#3-select-the-connector}

Перейдите на вкладку **Dataset**. Выберите недавно созданный соединитель ClickHouse в выпадающем списке. В правой панели вы увидите список доступных таблиц и схем.

<img src={tablum_ch_2} class="image" alt="TABLUM.IO 02" />

## 4. Введите SQL запрос и выполните его {#4-input-a-sql-query-and-run-it}

Введите запрос в SQL Console и нажмите **Run Query**. Результаты будут отображены в виде электронной таблицы.

:::tip
Щелкните правой кнопкой мыши на имени колонки, чтобы открыть выпадающее меню с сортировкой, фильтрацией и другими действиями.
:::

<img src={tablum_ch_3} class="image" alt="TABLUM.IO 03" />

:::note
С TABLUM.IO вы можете
* создавать и использовать несколько соединителей ClickHouse в своем аккаунте TABLUM.IO,
* выполнять запросы к любым загруженным данным, независимо от источника данных,
* делиться результатами как новой базой данных ClickHouse.
:::

## Узнать больше {#learn-more}

Узнайте больше о TABLUM.IO на https://tablum.io.
