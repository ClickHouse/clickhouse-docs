---
slug: /faq/integration/oracle-odbc
title: 'ODBC 経由で Oracle を使用する際に文字エンコーディングの問題が発生した場合はどうすればよいですか？'
toc_hidden: true
toc_priority: 20
description: 'このページでは、ODBC 経由で Oracle を使用する際に文字エンコーディングに関する問題が発生した場合の対処方法について説明します'
doc_type: 'guide'
keywords: ['oracle', 'odbc', 'encoding', 'integration', 'external dictionary']
---



# ODBC 経由で Oracle を使用する際に文字コードの問題が発生した場合はどうすればよいですか？

Oracle ODBC ドライバを介して ClickHouse の外部ディクショナリのソースとして Oracle を使用する場合は、`/etc/default/clickhouse` 内の `NLS_LANG` 環境変数に正しい値を設定する必要があります。詳細については、[Oracle NLS&#95;LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html) を参照してください。

**例**

```sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
