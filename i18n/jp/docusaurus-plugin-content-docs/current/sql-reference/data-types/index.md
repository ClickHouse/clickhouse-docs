---
slug: '/sql-reference/data-types/'
sidebar_label: 'データ型のリスト'
sidebar_position: 1
---


# ClickHouse におけるデータ型

このセクションでは、ClickHouse がサポートしているデータ型について説明します。例えば、[整数](int-uint.md)、[浮動小数点数](float.md)、および [文字列](string.md) です。

システムテーブル [system.data_type_families](/operations/system-tables/data_type_families) は、利用可能なすべてのデータ型の概要を提供します。
また、データ型が別のデータ型のエイリアスであるかどうかや、その名前が大文字と小文字を区別するか（例： `bool` と `BOOL`）も示します。
