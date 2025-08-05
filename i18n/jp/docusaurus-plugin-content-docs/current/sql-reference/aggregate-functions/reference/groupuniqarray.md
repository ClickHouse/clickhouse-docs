---
description: 'Creates an array from different argument values.'
sidebar_position: 154
slug: '/sql-reference/aggregate-functions/reference/groupuniqarray'
title: 'groupUniqArray'
---




# groupUniqArray

構文: `groupUniqArray(x)` または `groupUniqArray(max_size)(x)`

異なる引数の値から配列を作成します。メモリ消費は [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md) 関数と同じです。

2 番目のバージョン（`max_size` パラメータを使用）は、結果の配列のサイズを `max_size` 要素に制限します。
例えば、 `groupUniqArray(1)(x)` は `[any(x)]` と等価です。
