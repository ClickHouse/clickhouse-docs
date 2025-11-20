---
slug: /faq/integration/oracle-odbc
title: 'ODBC 経由で Oracle を使用する際に文字エンコーディングの問題が発生した場合はどうすればよいですか？'
toc_hidden: true
toc_priority: 20
description: 'このページでは、ODBC 経由で Oracle を使用する際に文字エンコーディングの問題が発生した場合の対処方法を説明します'
doc_type: 'guide'
keywords: ['oracle', 'odbc', 'encoding', 'integration', 'external dictionary']
---



# ODBC経由でOracleを使用する際にエンコーディングの問題が発生した場合はどうすればよいですか？ {#oracle-odbc-encodings}

Oracle ODBCドライバー経由でOracleをClickHouse外部ディクショナリのソースとして使用する場合、`/etc/default/clickhouse`内の`NLS_LANG`環境変数に適切な値を設定する必要があります。詳細については、[Oracle NLS_LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html)を参照してください。

**例**

```sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
