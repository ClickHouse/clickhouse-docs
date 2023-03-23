---
date: 2023-03-01
---

# Ignoring incorrect settings

When a user-level setting is specified in the wrong place, the server won't start and an exception message is sent to the log. However, you can tell ClickHouse to ignore the incorrect setting using the `skip_check_for_incorrect_settings` setting:

Add the following to `config.xml`:

```xml
<skip_check_for_incorrect_settings>1</skip_check_for_incorrect_settings>
```

:::note
User-level settings should be specified in `users.xml` inside a `<profile>` section for the specific user profile, (or in `<default>` for default settings.
:::
