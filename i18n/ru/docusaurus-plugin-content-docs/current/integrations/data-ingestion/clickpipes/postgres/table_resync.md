---
title: 'Повторная синхронизация конкретных таблиц'
description: 'Повторная синхронизация конкретных таблиц в Postgres ClickPipe'
slug: /integrations/clickpipes/postgres/table_resync
sidebar_label: 'Синхронизация таблицы'
---


# Повторная синхронизация конкретных таблиц {#resync-tables}

Существуют сценарии, когда было бы полезно повторно синхронизировать конкретные таблицы в пайпе. Некоторые примеры случаев использования могут включать значительные изменения схемы в Postgres или, возможно, переработку данных в ClickHouse.

Хотя повторная синхронизация отдельных таблиц одним нажатием кнопки все еще находится в процессе разработки, в этом руководстве мы поделимся шагами, как вы можете достичь этого сегодня в Postgres ClickPipe.

### 1. Удалите таблицу из пайпа {#removing-table}

Этот шаг можно выполнить, следуя [руководству по удалению таблиц](./removing_tables).

### 2. Обрежьте или удалите таблицу в ClickHouse {#truncate-drop-table}

Этот шаг необходим, чтобы избежать дублирования данных, когда мы добавим эту таблицу снова на следующем этапе. Вы можете сделать это, перейдя на вкладку **SQL Console** в ClickHouse Cloud и выполнив запрос. Обратите внимание, что поскольку PeerDB по умолчанию создает таблицы ReplacingMergeTree, если ваша таблица достаточно мала, и временные дубликаты не являются проблемой, этот шаг можно пропустить.

### 3. Добавьте таблицу в ClickPipe снова {#add-table-again}

Этот шаг можно выполнить, следуя [руководству по добавлению таблицы](./add_table).
