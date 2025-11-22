---
description: 'Документация по клиентской утилите ClickHouse Keeper'
sidebar_label: 'clickhouse-keeper-client'
slug: /operations/utilities/clickhouse-keeper-client
title: 'Утилита clickhouse-keeper-client'
doc_type: 'reference'
---



# Утилита clickhouse-keeper-client

Клиентское приложение для взаимодействия с clickhouse-keeper по его собственному протоколу.



## Ключи {#clickhouse-keeper-client}

- `-q QUERY`, `--query=QUERY` — Запрос для выполнения. Если этот параметр не передан, `clickhouse-keeper-client` запустится в интерактивном режиме.
- `-h HOST`, `--host=HOST` — Хост сервера. Значение по умолчанию: `localhost`.
- `-p N`, `--port=N` — Порт сервера. Значение по умолчанию: 9181
- `-c FILE_PATH`, `--config-file=FILE_PATH` — Устанавливает путь к файлу конфигурации для получения строки подключения. Значение по умолчанию: `config.xml`.
- `--connection-timeout=TIMEOUT` — Устанавливает таймаут подключения в секундах. Значение по умолчанию: 10s.
- `--session-timeout=TIMEOUT` — Устанавливает таймаут сеанса в секундах. Значение по умолчанию: 10s.
- `--operation-timeout=TIMEOUT` — Устанавливает таймаут операции в секундах. Значение по умолчанию: 10s.
- `--history-file=FILE_PATH` — Устанавливает путь к файлу истории. Значение по умолчанию: `~/.keeper-client-history`.
- `--log-level=LEVEL` — Устанавливает уровень логирования. Значение по умолчанию: `information`.
- `--no-confirmation` — Если установлен, не требует подтверждения для некоторых команд. Значение по умолчанию: `false` для интерактивного режима и `true` для режима запроса.
- `--help` — Выводит справочное сообщение.


## Пример {#clickhouse-keeper-client-example}

```bash
./clickhouse-keeper-client -h localhost -p 9181 --connection-timeout 30 --session-timeout 30 --operation-timeout 30
Подключено к ZooKeeper по адресу [::1]:9181 с session_id 137
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

- `ls '[path]'` -- Выводит список узлов для указанного пути (по умолчанию: текущий рабочий каталог)
- `cd '[path]'` -- Изменяет рабочий путь (по умолчанию `.`)
- `cp '<src>' '<dest>'` -- Копирует узел 'src' по пути 'dest'
- `cpr '<src>' '<dest>'` -- Копирует поддерево узла 'src' по пути 'dest'
- `mv '<src>' '<dest>'` -- Перемещает узел 'src' по пути 'dest'
- `mvr '<src>' '<dest>'` -- Перемещает поддерево узла 'src' по пути 'dest'
- `exists '<path>'` -- Возвращает `1`, если узел существует, иначе `0`
- `set '<path>' <value> [version]` -- Обновляет значение узла. Обновление выполняется только при совпадении версии (по умолчанию: -1)
- `create '<path>' <value> [mode]` -- Создаёт новый узел с указанным значением
- `touch '<path>'` -- Создаёт новый узел с пустой строкой в качестве значения. Не вызывает исключение, если узел уже существует
- `get '<path>'` -- Возвращает значение узла
- `rm '<path>' [version]` -- Удаляет узел только при совпадении версии (по умолчанию: -1)
- `rmr '<path>' [limit]` -- Рекурсивно удаляет путь, если размер поддерева меньше указанного лимита. Требуется подтверждение (лимит по умолчанию = 100)
- `flwc <command>` -- Выполняет четырёхбуквенную команду
- `help` -- Выводит это сообщение
- `get_direct_children_number '[path]'` -- Возвращает количество непосредственных дочерних узлов по указанному пути
- `get_all_children_number '[path]'` -- Возвращает общее количество дочерних узлов по указанному пути
- `get_stat '[path]'` -- Возвращает статистику узла (по умолчанию `.`)
- `find_super_nodes <threshold> '[path]'` -- Находит узлы с количеством дочерних узлов, превышающим указанный порог, для заданного пути (по умолчанию `.`)
- `delete_stale_backups` -- Удаляет узлы ClickHouse, использовавшиеся для резервных копий, которые теперь неактивны
- `find_big_family [path] [n]` -- Возвращает топ n узлов с наибольшим количеством потомков в поддереве (путь по умолчанию = `.`, n = 10)
- `sync '<path>'` -- Синхронизирует узел между процессами и лидером
- `reconfig <add|remove|set> "<arg>" [version]` -- Реконфигурирует кластер Keeper. См. /docs/en/guides/sre/keeper/clickhouse-keeper#reconfiguration
