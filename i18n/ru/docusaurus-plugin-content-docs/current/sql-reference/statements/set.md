---
slug: '/sql-reference/statements/set'
sidebar_label: SET
sidebar_position: 50
description: 'Документация для SET \x10\x015\x014'
title: 'Оператор SET'
doc_type: reference
---
# Оператор SET

```sql
SET param = value
```

Присваивает `value` параметру `param` [настройки](/operations/settings/overview) для текущей сессии. Вы не можете изменить [настройки сервера](../../operations/server-configuration-parameters/settings.md) таким образом.

Также можно установить все значения из указанного профиля настроек в одном запросе.

```sql
SET profile = 'profile-name-from-the-settings-file'
```

Для булевых настроек, установленных в true, можно использовать сокращенный синтаксис, опуская присвоение значения. Когда указано только имя настройки, оно автоматически устанавливается в `1` (true).

```sql
-- These are equivalent:
SET force_index_by_date = 1
SET force_index_by_date
```

Для получения дополнительной информации см. [Настройки](../../operations/settings/settings.md).