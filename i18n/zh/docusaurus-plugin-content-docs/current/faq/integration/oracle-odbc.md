---
'slug': '/faq/integration/oracle-odbc'
'title': '当我通过 ODBC 使用 Oracle 时，如果遇到编码问题该怎么办？'
'toc_hidden': true
'toc_priority': 20
'description': '本页面提供关于当您通过 ODBC 使用 Oracle 时遇到编码问题的处理指导'
---


# 使用 Oracle ODBC 时的编码问题怎么办？ {#oracle-odbc-encodings}

如果您通过 Oracle ODBC 驱动程序将 Oracle 作为 ClickHouse 外部字典的源，您需要在 `/etc/default/clickhouse` 中为 `NLS_LANG` 环境变量设置正确的值。有关更多信息，请参阅 [Oracle NLS_LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html)。

**示例**

```sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
