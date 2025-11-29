---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IO — это SaaS-сервис для управления данными с поддержкой ClickHouse «из коробки».'
title: 'Подключение TABLUM.IO к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
keywords: ['tablum', 'SQL-клиент', 'инструмент для работы с базами данных', 'инструмент для выполнения запросов', 'настольное приложение']
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Интеграция TABLUM.IO с ClickHouse {#connecting-tablumio-to-clickhouse}

<CommunityMaintainedBadge/>



## Откройте стартовую страницу TABLUM.IO {#open-the-tablumio-startup-page}

:::note
  Вы можете установить самостоятельно размещаемую (self-hosted) версию TABLUM.IO на свой Linux-сервер с помощью Docker.
:::



## 1. Зарегистрируйтесь или войдите в сервис {#1-sign-up-or-sign-in-to-the-service}

  Сначала зарегистрируйтесь в TABLUM.IO, используя свою электронную почту, или выполните быстрый вход через учетную запись Google или Facebook.

<Image img={tablum_ch_0} size="md" border alt="Страница входа в TABLUM.IO" />



## 2. Добавление коннектора ClickHouse {#2-add-a-clickhouse-connector}

Подготовьте параметры подключения к ClickHouse, перейдите на вкладку **Connector** и заполните поля: URL хоста, порт, имя пользователя, пароль, имя базы данных и имя коннектора. После этого нажмите кнопку **Test connection**, чтобы проверить параметры подключения, а затем нажмите **Save connector for me**, чтобы сохранить коннектор.

:::tip
Убедитесь, что вы указали корректный **HTTP**-порт и настроили режим **SSL** в соответствии с параметрами вашего подключения.
:::

:::tip
Как правило, используется порт 8443 при включённом TLS или 8123 при его отсутствии.
:::

<Image img={tablum_ch_1} size="lg" border alt="Добавление коннектора ClickHouse в TABLUM.IO" />



## 3. Выберите коннектор {#3-select-the-connector}

Перейдите на вкладку **Dataset**. Выберите недавно созданный коннектор ClickHouse в выпадающем списке. В правой панели вы увидите список доступных таблиц и схем.

<Image img={tablum_ch_2} size="lg" border alt="Выбор коннектора ClickHouse в TABLUM.IO" />



## 4. Введите SQL‑запрос и выполните его {#4-input-a-sql-query-and-run-it}

Введите запрос в SQL Console и нажмите **Run Query**. Результаты отобразятся в виде таблицы.

:::tip
Щёлкните правой кнопкой мыши по имени столбца, чтобы открыть выпадающее меню с сортировкой, фильтрацией и другими действиями.
:::

<Image img={tablum_ch_3} size="lg" border alt="Выполнение SQL-запроса в TABLUM.IO" />

:::note
С TABLUM.IO вы можете
* создавать и использовать несколько коннекторов ClickHouse в рамках своего аккаунта TABLUM.IO,
* выполнять запросы к любым загруженным данным независимо от источника данных,
* делиться результатами в виде новой базы данных ClickHouse.
:::



## Узнать больше {#learn-more}

Дополнительную информацию о TABLUM.IO можно найти на сайте https://tablum.io.
