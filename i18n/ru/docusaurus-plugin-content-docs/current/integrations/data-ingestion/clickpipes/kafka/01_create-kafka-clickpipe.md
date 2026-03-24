---
sidebar_label: 'Создайте первый Kafka ClickPipe'
description: 'Пошаговое руководство по созданию первого Kafka ClickPipe.'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: 'Создание первого Kafka ClickPipe'
doc_type: 'guide'
keywords: ['создать Kafka ClickPipe', 'kafka', 'clickpipes', 'источники данных', 'руководство по настройке']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import cp_table_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_table_settings.png';
import cp_ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/cp_ssh_tunnel.png';
import Image from '@theme/IdealImage';

# Создание первого Kafka ClickPipe \{#creating-your-first-kafka-clickpipe\}

> В этом руководстве мы пошагово покажем, как создать свой первый Kafka ClickPipe.

<VerticalStepper type="numbered" headerLevel="h2">
  ## Перейдите к источникам данных \{#1-load-sql-console\}

  Выберите кнопку `Data Sources` в меню слева и нажмите «Set up a ClickPipe».

  <Image img={cp_step0} alt="Выберите импорт" size="md" />

  ## Выберите источник данных \{#2-select-data-source\}

  Выберите источник данных Kafka из списка.

  <Image img={cp_step1} alt="Выберите тип источника данных" size="md" />

  ## Настройте источник данных \{#3-configure-data-source\}

  Заполните форму: укажите имя ClickPipe, описание (необязательно), учётные данные и другие сведения о подключении.

  <Image img={cp_step2} alt="Заполните сведения о подключении" size="md" />

  ## Настройте реестр схем (необязательно) \{#4-configure-your-schema-registry\}

  Для потоков Avro требуется корректная схема. Подробнее о настройке реестра схем см. в разделе [Schema registries](./02_schema-registries.md).

  ## Настройте обратную частную конечную точку (необязательно) \{#5-configure-reverse-private-endpoint\}

  Настройте Reverse Private Endpoint, чтобы ClickPipes могли подключаться к вашему кластеру Kafka через AWS PrivateLink.
  Подробнее см. в нашей [документации по AWS PrivateLink](../aws-privatelink.md).

  ## Настройте SSH-туннелирование (необязательно) \{#6-configure-ssh-tunneling\}

  Вы можете использовать SSH-туннелирование, если ваш брокер Kafka недоступен из интернета. Вместо прямого подключения ClickPipes устанавливает SSH-соединение с бастион-хостом (сервером в вашей сети, доступным из интернета), а затем перенаправляет через него трафик к вашему брокеру Kafka в частной сети.

  1. Включите переключатель «SSH Tunnel».
  2. Заполните сведения о SSH-подключении:
     * **SSH Host**: имя хоста или IP-адрес вашего бастион-хоста — это общедоступный сервер, который служит шлюзом в вашу частную сеть.
     * **SSH Port**: SSH-порт на бастион-хосте (по умолчанию `22`).
     * **SSH User**: имя пользователя для аутентификации на бастион-хосте.

  <Image img={cp_ssh_tunnel} alt="Настройка SSH-туннеля" size="md" />

  3. Чтобы использовать аутентификацию по ключу, нажмите «Revoke and regenerate key pair», чтобы сгенерировать новую пару ключей, и скопируйте созданный открытый ключ на SSH-сервер в `~/.ssh/authorized_keys`.
  4. Нажмите «Verify Connection», чтобы проверить соединение.

  :::note
  Убедитесь, что [IP-адреса ClickPipes](../index.md#list-of-static-ips) добавлены в список разрешённых в правилах межсетевого экрана для SSH-бастион-хоста, чтобы ClickPipes могли установить SSH-туннель.
  :::

  ## Выберите топик \{#7-select-your-topic\}

  Выберите топик, и UI отобразит пример документа из него.

  <Image img={cp_step3} alt="Укажите топик" size="md" />

  ## Настройте целевую таблицу \{#8-configure-your-destination-table\}

  На следующем шаге выберите, хотите ли вы выполнять приём данных в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя таблицы, схему и настройки. В верхней части страницы отображается предварительный просмотр изменений в примере таблицы в реальном времени.

  <Image img={cp_step4a} alt="Укажите таблицу, схему и настройки" size="md" />

  Вы также можете настроить дополнительные параметры с помощью доступных элементов управления.

  <Image img={cp_table_settings} alt="Настройте дополнительные параметры" size="md" />

  ## Настройте права доступа \{#9-configure-permissions\}

  ClickPipes создаст отдельного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя: пользовательскую роль или одну из предопределённых ролей:

  * `Full access`: полный доступ к кластеру. Это может быть полезно, если вы используете materialized view или словарь с целевой таблицей.
  * `Only destination table`: только права `INSERT` для целевой таблицы.

  <Image img={cp_step5} alt="Права доступа" size="md" />

  ## Завершите настройку \{#10-complete-setup\}

  Нажмите «Create ClickPipe», чтобы создать и запустить ClickPipe. После этого он появится в разделе Data Sources.

  <Image img={cp_overview} alt="Обзор" size="md" />
</VerticalStepper>