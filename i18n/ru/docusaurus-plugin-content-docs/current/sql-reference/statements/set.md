---
description: 'Документация по оператору SET'
sidebar_label: 'SET'
sidebar_position: 50
slug: /sql-reference/statements/set
title: 'Оператор SET'
doc_type: 'reference'
---

# Оператор SET

```sql
SET param = value
```

Присваивает значение `value` параметру `param` в [настройках](/operations/settings/overview) для текущей сессии. Вы не можете изменять [настройки сервера](../../operations/server-configuration-parameters/settings.md) таким способом.

Вы также можете установить все значения из указанного профиля настроек в одном запросе.

```sql
SET profile = 'имя-профиля-из-файла-настроек'
```

Для булевых параметров, установленных в значение `true`, можно использовать сокращённый синтаксис, опуская указание значения. Если задано только имя параметра, он автоматически устанавливается в `1` (`true`).

```sql
-- Эти команды эквивалентны:
SET force_index_by_date = 1
SET force_index_by_date
```

Дополнительные сведения см. в разделе [Настройки](../../operations/settings/settings.md).
