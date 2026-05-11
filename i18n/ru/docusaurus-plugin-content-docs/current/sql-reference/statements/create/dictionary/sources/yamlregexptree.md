---
slug: /sql-reference/statements/create/dictionary/sources/yamlregexptree
title: 'Источник словаря YAMLRegExpTree'
sidebar_position: 15
sidebar_label: 'YAMLRegExpTree'
description: 'Настройка YAML-файла в качестве источника для словарей на основе дерева регулярных выражений.'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

Источник `YAMLRegExpTree` загружает дерево регулярных выражений из YAML-файла на локальной файловой системе.
Он предназначен исключительно для использования с макетом словаря [`regexp_tree`](../layouts/regexp-tree.md)
и предоставляет иерархические сопоставления регулярных выражений с атрибутами для поиска по шаблонам, например для разбора заголовка User-Agent.

:::note
Источник `YAMLRegExpTree` доступен только в ClickHouse Open Source.
Для ClickHouse Cloud экспортируйте словарь в CSV и загрузите его через [источник таблицы ClickHouse](./clickhouse.md).
Подробнее см. раздел [Using regexp&#95;tree dictionaries in ClickHouse Cloud](../layouts/regexp-tree#use-regular-expression-tree-dictionary-in-clickhouse-cloud).
:::


## Конфигурация \{#configuration\}

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
LIFETIME(0);
```

Поля параметров:

| Настройка | Описание                                                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `PATH`    | Абсолютный путь к YAML-файлу, содержащему дерево регулярных выражений. При создании через DDL файл должен находиться в каталоге `user_files`. |


## Структура YAML-файла \{#yaml-file-structure\}

YAML-файл содержит список узлов дерева регулярных выражений. Каждый узел может иметь атрибуты и дочерние узлы, образуя иерархию:

```yaml
- regexp: 'Linux/(\d+[\.\d]*).+tlinux'
  name: 'TencentOS'
  version: '\1'

- regexp: '\d+/tclwebkit(?:\d+[\.\d]*)'
  name: 'Android'
  versions:
    - regexp: '33/tclwebkit'
      version: '13'
    - regexp: '3[12]/tclwebkit'
      version: '12'
    - regexp: '30/tclwebkit'
      version: '11'
    - regexp: '29/tclwebkit'
      version: '10'
```

Каждый узел имеет следующую структуру:

* **`regexp`**: Регулярное выражение, соответствующее этому узлу.
* **attributes**: Определяемые пользователем атрибуты словаря (например, `name`, `version`). Значения атрибутов могут содержать **обратные ссылки** на группы захвата в регулярном выражении, записанные как `\1` или `$1` (числа 1–9). Эти значения заменяются соответствующей группой захвата во время выполнения запроса.
* **child nodes**: Список дочерних узлов, каждый со своими атрибутами и, при необходимости, с дополнительными потомками. Имя списка дочерних узлов произвольное (например, `versions` выше). Сопоставление строк выполняется в порядке обхода в глубину: если строка соответствует узлу, его дочерние узлы также проверяются. Атрибуты самого глубокого соответствующего узла имеют приоритет и переопределяют одноимённые атрибуты родительских узлов.


## Связанные страницы \{#related-pages\}

- [regexp_tree dictionary layout](../layouts/regexp-tree.md) — конфигурация размещения, примеры запросов и режимы сопоставления
- [dictGet](/sql-reference/functions/ext-dict-functions#dictGet), [dictGetAll](/sql-reference/functions/ext-dict-functions#dictGetAll) — функции для выполнения запросов к словарям regexp_tree