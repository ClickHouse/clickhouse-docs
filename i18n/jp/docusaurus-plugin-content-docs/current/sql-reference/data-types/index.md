---
description: 'ClickHouse のデータ型に関するドキュメント'
sidebar_label: 'データ型一覧'
sidebar_position: 1
slug: /sql-reference/data-types/
title: 'ClickHouse のデータ型'
doc_type: 'reference'
---

# ClickHouse におけるデータ型 {#data-types-in-clickhouse}

このセクションでは、ClickHouse でサポートされているデータ型について説明します。たとえば、[整数](int-uint.md)、[浮動小数点数](float.md)、[文字列](string.md) などです。

システムテーブル [system.data&#95;type&#95;families](/operations/system-tables/data_type_families) では、利用可能なすべてのデータ型の概要を確認できます。
また、あるデータ型が別のデータ型のエイリアスかどうか、名前が大文字と小文字を区別するかどうか（例: `bool` と `BOOL`）も示します。