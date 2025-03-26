---
description: 'Документация для специальных движков таблиц'
sidebar_label: 'Специальные'
sidebar_position: 50
slug: /engines/table-engines/special/
title: 'Специальные движки таблиц'
---


# Специальные движки таблиц

Существует три основные категории движков таблиц:

- [Семейство движков MergeTree](../../../engines/table-engines/mergetree-family/index.md) для основного производственного использования.
- [Семейство движков Log](../../../engines/table-engines/log-family/index.md) для небольших временных данных.
- [Движки таблиц для интеграций](../../../engines/table-engines/integrations/index.md).

Оставшиеся движки уникальны по своему назначению и пока не сгруппированы в семьи, поэтому они помещены в эту "специальную" категорию.

<!-- Таблица содержания для этой страницы автоматически генерируется 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
из полей YAML front matter: slug, description, title.

Если вы заметили ошибку, пожалуйста, отредактируйте YML frontmatter самих страниц.
-->
| Страница | Описание |
|-----|-----|
| [Buffer Table Engine](/engines/table-engines/special/buffer) | Буферизирует данные для записи в RAM, периодически записывая их в другую таблицу. Во время операции чтения данные читаются одновременно из буфера и другой таблицы. |
| [Executable and ExecutablePool Table Engines](/engines/table-engines/special/executable) | Движки таблиц `Executable` и `ExecutablePool` позволяют вам определить таблицу, строки которой генерируются из скрипта, который вы определяете (записывая строки в **stdout**). |
| [URL Table Engine](/engines/table-engines/special/url) | Запрашивает данные с удаленного HTTP/HTTPS сервера и обратно. Этот движок похож на движок File. |
| [View Table Engine](/engines/table-engines/special/view) | Используется для реализации представлений (для получения дополнительной информации см. запрос `CREATE VIEW`). Он не хранит данные, а только хранит указанный запрос `SELECT`. При чтении из таблицы он выполняет этот запрос (и удаляет все ненужные столбцы из запроса). |
| [Distributed Table Engine](/engines/table-engines/special/distributed) | Таблицы с движком Distributed не хранят никаких данных, но позволяют распределенную обработку запросов на нескольких серверах. Чтение автоматически распараллеливается. Во время чтения используются индексы таблиц на удаленных серверах, если таковые имеются. |
| [File Table Engine](/engines/table-engines/special/file) | Движок таблицы File хранит данные в файле в одном из поддерживаемых форматов файла (`TabSeparated`, `Native` и т. д.). |
| [FileLog Engine](/engines/table-engines/special/filelog) | Этот движок позволяет обрабатывать файлы логов приложений как поток записей. |
| [Set Table Engine](/engines/table-engines/special/set) | Набор данных, который всегда находится в RAM. Он предназначен для использования на правой стороне оператора `IN`. |
| [Dictionary Table Engine](/engines/table-engines/special/dictionary) | Движок `Dictionary` отображает данные словаря как таблицу ClickHouse. |
| [GenerateRandom Table Engine](/engines/table-engines/special/generate) | Движок таблицы GenerateRandom генерирует случайные данные для заданной схемы таблицы. |
| [Memory Table Engine](/engines/table-engines/special/memory) | Движок Memory хранит данные в RAM в несжатой форме. Данные хранятся в точно таком же виде, в каком они поступают при чтении. Другими словами, чтение из этой таблицы абсолютно бесплатно. |
| [Merge Table Engine](/engines/table-engines/special/merge) | Движок `Merge` (не путать с `MergeTree`) не хранит данные сам по себе, но позволяет читать из любого количества других таблиц одновременно. |
| [External Data for Query Processing](/engines/table-engines/special/external-data) | ClickHouse позволяет отправлять серверу данные, необходимые для обработки запроса, вместе с запросом `SELECT`. Эти данные помещаются во временную таблицу и могут использоваться в запросе (например, в операторах `IN`). |
| [Join Table Engine](/engines/table-engines/special/join) | Необязательная подготовленная структура данных для использования в операциях JOIN. |
| [KeeperMap](/engines/table-engines/special/keeper-map) | Этот движок позволяет вам использовать кластер Keeper/ZooKeeper как согласованное хранилище ключ-значение с линейризуемыми записями и последовательно согласованными чтениями. |
| [Null Table Engine](/engines/table-engines/special/null) | При записи в таблицу `Null` данные игнорируются. При чтении из таблицы `Null` ответ пустой. |
