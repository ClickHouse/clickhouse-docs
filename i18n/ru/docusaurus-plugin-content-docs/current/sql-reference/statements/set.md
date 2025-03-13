---
slug: /sql-reference/statements/set
sidebar_position: 50
sidebar_label: SET
---


# Оператор SET

``` sql
SET param = value
```

Назначает `value` для `param` [настройки](/operations/settings/overview) для текущей сессии. Вы не можете изменить [настройки сервера](../../operations/server-configuration-parameters/settings.md) таким образом.

Вы также можете установить все значения из указанного профиля настроек в одном запросе.

``` sql
SET profile = 'profile-name-from-the-settings-file'
```

Для получения дополнительной информации смотрите [Настройки](../../operations/settings/settings.md).
