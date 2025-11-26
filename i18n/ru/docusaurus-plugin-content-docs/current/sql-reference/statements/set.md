---
description: 'Документация по оператору SET'
sidebar_label: 'SET'
sidebar_position: 50
slug: /sql-reference/statements/set
title: 'Оператор SET'
doc_type: 'reference'
---

# Инструкция SET

```sql
SET param = value
```

Присваивает `value` параметру [setting](/operations/settings/overview) для текущей сессии. Нельзя изменять [server settings](../../operations/server-configuration-parameters/settings.md) таким образом.

Также можно установить все значения из указанного профиля настроек одним запросом.

```sql
SET profile = 'имя-профиля-из-файла-настроек'
```

Для булевых настроек, установленных в значение true, можно использовать сокращённый синтаксис, опуская указание значения. Если указано только имя настройки, ей автоматически присваивается значение `1` (true).

```sql
-- Эти команды эквивалентны:
SET force_index_by_date = 1
SET force_index_by_date
```

Дополнительные сведения см. в разделе [Настройки](../../operations/settings/settings.md).
