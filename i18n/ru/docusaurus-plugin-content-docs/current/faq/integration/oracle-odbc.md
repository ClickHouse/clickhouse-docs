---
slug: /faq/integration/oracle-odbc
title: Что делать, если у меня возникла проблема с кодировками при использовании Oracle через ODBC?
toc_hidden: true
toc_priority: 20
---


# Что Делать, Если У Меня Возникла Проблема с Кодировками При Использовании Oracle Через ODBC? {#oracle-odbc-encodings}

Если вы используете Oracle в качестве источника внешних словарей ClickHouse через драйвер Oracle ODBC, вам необходимо установить правильное значение для переменной окружения `NLS_LANG` в файле `/etc/default/clickhouse`. Для получения дополнительной информации см. [Распространенные вопросы по NLS_LANG Oracle](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html).

**Пример**

``` sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
