---
slug: /faq/integration/oracle-odbc
title: '通过 ODBC 使用 Oracle 时遇到编码问题该怎么办？'
toc_hidden: true
toc_priority: 20
description: '本页说明在通过 ODBC 使用 Oracle 时遇到编码问题时应如何处理'
doc_type: 'guide'
keywords: ['oracle', 'odbc', '编码', '集成', '外部字典']
---

# 通过 ODBC 使用 Oracle 时如果遇到编码问题怎么办？ \{#oracle-odbc-encodings\}

如果通过 Oracle ODBC 驱动将 Oracle 用作 ClickHouse 外部字典的数据源，则需要在 `/etc/default/clickhouse` 中为 `NLS_LANG` 环境变量设置正确的值。有关更多信息，请参阅 [Oracle NLS&#95;LANG 常见问题解答](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html)。

**示例**

```sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
