---
description: 'ClickHouse のデータ型に関するドキュメント'
sidebar_label: 'データ型の一覧'
sidebar_position: 1
slug: /sql-reference/data-types/
title: 'ClickHouse のデータ型'
doc_type: 'reference'
---

# ClickHouse におけるデータ型

このセクションでは、ClickHouse がサポートしているデータ型、例えば [整数](int-uint.md)、[浮動小数点数](float.md)、[文字列](string.md) について説明します。

システムテーブル [system.data_type_families](/operations/system-tables/data_type_families) では、
利用可能なすべてのデータ型の概要を確認できます。
また、あるデータ型が別のデータ型のエイリアスであるかどうかや、その名前が大文字小文字を区別するかどうか（例: `bool` と `BOOL`）も示されます。