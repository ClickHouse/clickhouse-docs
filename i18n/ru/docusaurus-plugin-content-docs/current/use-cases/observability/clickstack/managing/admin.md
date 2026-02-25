---
slug: /use-cases/observability/clickstack/admin
title: 'ClickStack - Администрирование'
sidebar_label: 'Администрирование'
description: 'Как выполнять базовые задачи администрирования в ClickStack.'
doc_type: 'guide'
keywords: ['clickstack', 'admin']
---

Большинство административных задач в ClickStack выполняются напрямую в лежащей в основе базе данных ClickHouse. Пользователи, разворачивающие ClickStack, должны быть знакомы с основными понятиями ClickHouse и основами администрирования.

Административные операции, как правило, сводятся к выполнению DDL-команд. Доступные возможности зависят от того, используете ли вы Managed ClickStack или ClickStack Open Source.

## ClickStack Open Source \{#clickstack-oss\}

Для развертываний ClickStack Open Source пользователи выполняют административные задачи с помощью [ClickHouse client](/interfaces/cli). Этот клиент подключается к базе данных по нативному протоколу ClickHouse, поддерживает полный набор DDL- и административных операций, а также обеспечивает интерактивную обратную связь при выполнении запросов.

## Управляемый ClickStack \{#clickstack-managed\}

В управляемом ClickStack пользователи могут использовать и клиент ClickHouse, и [SQL Console](/cloud/get-started/sql-console). Чтобы подключиться через клиент, пользователям необходимо получить [учётные данные сервиса](/cloud/guides/sql-console/gather-connection-details).

[SQL Console](/cloud/get-started/sql-console) — это веб-интерфейс, обеспечивающий дополнительное удобство, включая автодополнение SQL, историю запросов и встроенную визуализацию результатов в виде графиков.