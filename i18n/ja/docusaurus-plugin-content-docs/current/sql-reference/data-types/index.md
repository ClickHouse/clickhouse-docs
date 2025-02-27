---
slug: /sql-reference/data-types/
sidebar_label: データ型の一覧
sidebar_position: 1
---

# ClickHouseのデータ型

このセクションでは、ClickHouseがサポートするデータ型について説明します。例えば、[整数](int-uint.md)、[浮動小数点数](float.md)、および[文字列](string.md)などです。

システムテーブル [system.data_type_families](../../operations/system-tables/data_type_families.md#system_tables-data_type_families) は、すべての利用可能なデータ型の概要を提供します。
これにより、データ型が他のデータ型へのエイリアスであるかどうかや、その名前が大文字と小文字を区別するかどうか（例： `bool` と `BOOL`）を示します。
