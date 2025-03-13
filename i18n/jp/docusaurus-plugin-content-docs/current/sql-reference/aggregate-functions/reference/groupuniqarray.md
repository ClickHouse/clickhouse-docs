---
slug: /sql-reference/aggregate-functions/reference/groupuniqarray
sidebar_position: 154
title: "groupUniqArray"
description: "異なる引数の値から配列を作成します。"
---


# groupUniqArray

構文: `groupUniqArray(x)` または `groupUniqArray(max_size)(x)`

異なる引数の値から配列を作成します。メモリ消費は [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md) 関数と同じです。

2番目のバージョン（`max_size` パラメーター付き）は、結果となる配列のサイズを `max_size` 要素に制限します。例えば、 `groupUniqArray(1)(x)` は `[any(x)]` と同等です。
