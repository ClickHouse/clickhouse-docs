---
'slug': '/faq/integration/oracle-odbc'
'title': '如果我在通过 ODBC 使用 Oracle 时遇到编码问题怎么办？'
'toc_hidden': true
'toc_priority': 20
'description': '本页提供关于在通过 ODBC 使用 Oracle 时，如果遇到编码问题应该怎么做的指导。'
'doc_type': 'guide'
---


# 如果我在通过 ODBC 使用 Oracle 时遇到编码问题怎么办？ {#oracle-odbc-encodings}

如果您通过 Oracle ODBC 驱动程序将 Oracle 作为 ClickHouse 外部字典的来源，则需要在 `/etc/default/clickhouse` 中为 `NLS_LANG` 环境变量设置正确的值。有关更多信息，请参见 [Oracle NLS_LANG 常见问题](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html)。

**示例**

```sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
