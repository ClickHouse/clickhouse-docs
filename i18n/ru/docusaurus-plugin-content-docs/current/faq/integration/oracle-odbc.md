---
slug: /faq/integration/oracle-odbc
title: 'Что делать, если у меня возникла проблема с кодировками при использовании Oracle через ODBC?'
toc_hidden: true
toc_priority: 20
description: 'Эта страница предоставляет рекомендации о том, что делать, если у вас возникла проблема с кодировками при использовании Oracle через ODBC'
---


# Что делать, если у меня возникла проблема с кодировками при использовании Oracle через ODBC? {#oracle-odbc-encodings}

Если вы используете Oracle в качестве источника внешних словарей ClickHouse через драйвер ODBC Oracle, вам необходимо установить правильное значение для переменной окружения `NLS_LANG` в `/etc/default/clickhouse`. Для получения дополнительной информации смотрите [Oracle NLS_LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html).

**Пример**

``` sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
