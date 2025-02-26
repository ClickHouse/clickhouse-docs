---
title: "メモリのオーバーコミット"
description: "クエリのためにより柔軟なメモリ制限を設定できるようにすることを目的とした実験的な技術。"
slug: /operations/settings/memory-overcommit
---

# メモリのオーバーコミット

メモリのオーバーコミットは、クエリのためにより柔軟なメモリ制限を設定できるようにすることを目的とした実験的な技術です。

この技術のアイデアは、クエリが使用できる保証されたメモリ量を表す設定を導入することです。
メモリのオーバーコミットが有効になっており、メモリ制限に達した場合、ClickHouse は最もオーバーコミットされているクエリを選択し、このクエリを終了させることでメモリを解放しようとします。

メモリ制限に達した場合、任意のクエリは新しいメモリを確保しようとする際に一定の時間待機します。
タイムアウトが過ぎてメモリが解放された場合、クエリは実行を続行します。
そうでない場合は例外がスローされ、クエリは終了します。

停止または終了するクエリの選択は、達成されたメモリ制限に応じて、グローバルまたはユーザーオーバーコミットトラッカーによって行われます。
オーバーコミットトラッカーが停止するクエリを選択できない場合、`MEMORY_LIMIT_EXCEEDED` 例外がスローされます。

## ユーザーオーバーコミットトラッカー {#user-overcommit-tracker}

ユーザーオーバーコミットトラッカーは、ユーザーのクエリリストの中から最大のオーバーコミット比率を持つクエリを見つけます。
クエリのオーバーコミット比率は、割り当てられたバイト数を `memory_overcommit_ratio_denominator_for_user` 設定の値で割ることによって計算されます。

クエリの `memory_overcommit_ratio_denominator_for_user` がゼロである場合、オーバーコミットトラッカーはこのクエリを選択しません。

待機タイムアウトは、`memory_usage_overcommit_max_wait_microseconds` 設定によって設定されます。

**例**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```

## グローバルオーバーコミットトラッカー {#global-overcommit-tracker}

グローバルオーバーコミットトラッカーは、すべてのクエリのリストの中から最大のオーバーコミット比率を持つクエリを見つけます。
この場合、オーバーコミット比率は、割り当てられたバイト数を `memory_overcommit_ratio_denominator` 設定の値で割ることによって計算されます。

クエリの `memory_overcommit_ratio_denominator` がゼロである場合、オーバーコミットトラッカーはこのクエリを選択しません。

待機タイムアウトは、構成ファイル内の `memory_usage_overcommit_max_wait_microseconds` パラメータによって設定されます。
