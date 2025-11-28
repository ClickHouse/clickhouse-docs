---
description: '異なる引数値から配列を作成します。'
sidebar_position: 154
slug: /sql-reference/aggregate-functions/reference/groupuniqarray
title: 'groupUniqArray'
doc_type: 'reference'
---

# groupUniqArray

構文: `groupUniqArray(x)` または `groupUniqArray(max_size)(x)`

異なる引数の値から配列を作成します。メモリ消費量は [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md) 関数と同じです。

2つ目の形式（`max_size` パラメータを指定するもの）は、結果配列のサイズを `max_size` 要素に制限します。
例えば、`groupUniqArray(1)(x)` は `[any(x)]` と同等です。