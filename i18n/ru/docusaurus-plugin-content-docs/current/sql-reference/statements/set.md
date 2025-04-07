---
description: 'Документация для оператора SET'
sidebar_label: 'SET'
sidebar_position: 50
slug: /sql-reference/statements/set
title: 'Оператор SET'
---


# Оператор SET

```sql
SET param = value
```

Присваивает `value` параметру [`setting`](/operations/settings/overview) для текущей сессии. Вы не можете изменять [серверные настройки](../../operations/server-configuration-parameters/settings.md) таким образом.

Вы также можете установить все значения из указанного профиля настроек в одном запросе.

```sql
SET profile = 'profile-name-from-the-settings-file'
```

Для получения дополнительной информации смотрите [Настройки](../../operations/settings/settings.md).
