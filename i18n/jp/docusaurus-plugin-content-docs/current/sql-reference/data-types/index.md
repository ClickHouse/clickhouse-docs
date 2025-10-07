---
'description': 'ClickHouseのデータタイプに関するDocumentation'
'sidebar_label': 'データタイプの一覧'
'sidebar_position': 1
'slug': '/sql-reference/data-types/'
'title': 'ClickHouseのデータタイプ'
'doc_type': 'reference'
---


# ClickHouseにおけるデータ型

このセクションでは、ClickHouseがサポートするデータ型について説明します。例えば、[整数](int-uint.md)、[浮動小数点数](float.md)、および[文字列](string.md)です。

システムテーブル [system.data_type_families](/operations/system-tables/data_type_families) は、利用可能なすべてのデータ型の概要を提供します。
また、データ型が他のデータ型のエイリアスであるかどうか、およびその名前が大文字小文字を区別するか（例： `bool` と `BOOL`）も示しています。
