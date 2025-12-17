---
description: 'Системная таблица, содержащая информацию обо всех политиках маскирования в системе.'
keywords: ['системная таблица', 'masking_policies']
slug: /operations/system-tables/masking_policies
title: 'system.masking_policies'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

# system.masking&#95;policies {#systemmasking&#95;policies}

Содержит информацию обо всех политиках маскирования, определённых в системе.

Столбцы:

* `name` ([String](/sql-reference/data-types/string.md)) — Имя политики маскирования. Полный формат имени: `short_name ON database.table`.
* `short_name` ([String](/sql-reference/data-types/string.md)) — Краткое имя политики маскирования. Например, если полное имя — `mask_email ON mydb.mytable`, то краткое имя — `mask_email`.
* `database` ([String](/sql-reference/data-types/string.md)) — Имя базы данных.
* `table` ([String](/sql-reference/data-types/string.md)) — Имя таблицы.
* `id` ([UUID](/sql-reference/data-types/uuid.md)) — ID политики маскирования.
* `storage` ([String](/sql-reference/data-types/string.md)) — Имя каталога, в котором хранится политика маскирования.
* `update_assignments` ([Nullable(String)](/sql-reference/data-types/nullable.md)) — Присваивания в операторе UPDATE, которые определяют, как должны маскироваться данные. Например: `email = '***masked***', phone = '***-***-****'`.
* `where_condition` ([Nullable(String)](/sql-reference/data-types/nullable.md)) — Необязательное условие WHERE, которое определяет, когда должно применяться маскирование.
* `priority` ([Int64](/sql-reference/data-types/int-uint.md)) — Приоритет применения нескольких политик маскирования. Политики с более высоким приоритетом применяются первыми. Значение по умолчанию — 0.
* `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint.md)) — Показывает, применяется ли политика маскирования ко всем ролям и/или пользователям. 1 — если да, 0 — в противном случае.
* `apply_to_list` ([Array(String)](/sql-reference/data-types/array.md)) — Список ролей и/или пользователей, к которым применяется политика маскирования.
* `apply_to_except` ([Array(String)](/sql-reference/data-types/array.md)) — Политика маскирования применяется ко всем ролям и/или пользователям, кроме перечисленных. Заполняется только если `apply_to_all` равно 1.