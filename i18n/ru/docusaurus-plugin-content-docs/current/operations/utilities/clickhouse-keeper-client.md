---
description: 'Документация по клиентской утилите ClickHouse Keeper'
sidebar_label: 'clickhouse-keeper-client'
slug: /operations/utilities/clickhouse-keeper-client
title: 'Утилита clickhouse-keeper-client'
doc_type: 'reference'
---



# Утилита clickhouse-keeper-client {#clickhouse-keeper-client-utility}

Клиентское приложение для взаимодействия с clickhouse-keeper по его родному протоколу.



## Ключи {#clickhouse-keeper-client}

-   `-q QUERY`, `--query=QUERY` — Запрос для выполнения. Если этот параметр не передан, `clickhouse-keeper-client` запустится в интерактивном режиме.
-   `-h HOST`, `--host=HOST` — Хост сервера. Значение по умолчанию: `localhost`.
-   `-p N`, `--port=N` — Порт сервера. Значение по умолчанию: 9181.
-   `-c FILE_PATH`, `--config-file=FILE_PATH` — Установить путь к конфигурационному файлу для получения строки подключения. Значение по умолчанию: `config.xml`.
-   `--connection-timeout=TIMEOUT` — Установить время ожидания подключения в секундах. Значение по умолчанию: 10s.
-   `--session-timeout=TIMEOUT` — Установить время ожидания сеанса в секундах. Значение по умолчанию: 10s.
-   `--operation-timeout=TIMEOUT` — Установить время ожидания операции в секундах. Значение по умолчанию: 10s.
-   `--history-file=FILE_PATH` — Установить путь к файлу истории. Значение по умолчанию: `~/.keeper-client-history`.
-   `--log-level=LEVEL` — Установить уровень логирования. Значение по умолчанию: `information`.
-   `--no-confirmation` — Если указан, не будет требоваться подтверждение для ряда команд. Значение по умолчанию: `false` для интерактивного режима и `true` для запроса.
-   `--help` — Показать справочное сообщение.



## Пример {#clickhouse-keeper-client-example}

```bash
./clickhouse-keeper-client -h localhost -p 9181 --connection-timeout 30 --session-timeout 30 --operation-timeout 30
Подключено к ZooKeeper по адресу [::1]:9181 с идентификатором сеанса 137
/ :) ls
keeper foo bar
/ :) cd 'keeper'
/keeper :) ls
api_version
/keeper :) cd 'api_version'
/keeper/api_version :) ls

/keeper/api_version :) cd 'xyz'
Путь /keeper/api_version/xyz не существует
/keeper/api_version :) cd ../../
/ :) ls
keeper foo bar
/ :) get 'keeper/api_version'
2
```


## Команды {#clickhouse-keeper-client-commands}

-   `ls '[path]'` -- Выводит список узлов для указанного пути (по умолчанию: cwd)
-   `cd '[path]'` -- Изменяет рабочий путь (по умолчанию `.`)
-   `cp '<src>' '<dest>'`  -- Копирует узел `src` в путь `dest`
-   `cpr '<src>' '<dest>'`  -- Копирует поддерево узла `src` в путь `dest`
-   `mv '<src>' '<dest>'`  -- Перемещает узел `src` в путь `dest`
-   `mvr '<src>' '<dest>'`  -- Перемещает поддерево узла `src` в путь `dest`
-   `exists '<path>'` -- Возвращает `1`, если узел существует, и `0` в противном случае
-   `set '<path>' <value> [version]` -- Обновляет значение узла. Обновляет только, если версия совпадает (по умолчанию: -1)
-   `create '<path>' <value> [mode]` -- Создаёт новый узел с указанным значением
-   `touch '<path>'` -- Создаёт новый узел с пустой строкой в качестве значения. Не вызывает исключение, если узел уже существует
-   `get '<path>'` -- Возвращает значение узла
-   `rm '<path>' [version]` -- Удаляет узел только, если версия совпадает (по умолчанию: -1)
-   `rmr '<path>' [limit]` -- Рекурсивно удаляет путь, если размер поддерева меньше лимита. Требуется подтверждение (лимит по умолчанию = 100)
-   `flwc <command>` -- Выполняет четырёхбуквенную команду
-   `help` -- Выводит это сообщение
-   `get_direct_children_number '[path]'` -- Возвращает количество непосредственных дочерних узлов для указанного пути
-   `get_all_children_number '[path]'` -- Возвращает общее количество дочерних узлов для указанного пути
-   `get_stat '[path]'` -- Возвращает статистику узла (по умолчанию `.`)
-   `find_super_nodes <threshold> '[path]'` -- Находит узлы с числом дочерних узлов, превышающим заданный порог, для указанного пути (по умолчанию `.`)
-   `delete_stale_backups` -- Удаляет узлы ClickHouse, используемые для резервных копий, которые сейчас неактивны
-   `find_big_family [path] [n]` -- Возвращает первые `n` узлов с наибольшим числом дочерних узлов в поддереве (путь по умолчанию = `.` и n = 10)
-   `sync '<path>'` -- Синхронизирует узел между процессами и лидером
-   `reconfig <add|remove|set> "<arg>" [version]` -- Изменяет конфигурацию кластера Keeper. См. /docs/en/guides/sre/keeper/clickhouse-keeper#reconfiguration
