---
slug: /sql-reference/data-types/
sidebar_label: データ型の一覧
sidebar_position: 1
---


# ClickHouseのデータ型

このセクションでは、ClickHouseがサポートするデータ型について説明します。例としては[整数](int-uint.md)、[浮動小数点数](float.md)、および[文字列](string.md)があります。

システムテーブル[system.data_type_families](../../operations/system-tables/data_type_families.md#system_tables-data_type_families)は、
利用可能なすべてのデータ型の概要を提供します。
また、データ型が他のデータ型のエイリアスであるかどうかや、その名前が大文字と小文字を区別することを示します（例： `bool` と `BOOL` ）。
