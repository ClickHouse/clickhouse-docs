---
description: 'Документация по команде SET'
sidebar_label: 'SET'
sidebar_position: 50
slug: /sql-reference/statements/set
title: 'Команда SET'
---


# Команда SET

```sql
SET param = value
```

Присваивает `value` параметру `param` [настройки](/operations/settings/overview) для текущей сессии. Вы не можете изменять [настройки сервера](../../operations/server-configuration-parameters/settings.md) таким образом.

Вы также можете установить все значения из указанного профиля настроек в одном запросе.

```sql
SET profile = 'имя-профиля-из-файла-настроек'
```

Для получения дополнительной информации смотрите [Настройки](../../operations/settings/settings.md).
