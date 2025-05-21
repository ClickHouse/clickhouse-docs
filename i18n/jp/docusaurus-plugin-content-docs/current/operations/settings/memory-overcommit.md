---
description: 'クエリに対してより柔軟なメモリ制限を設定できるようにすることを意図した実験的な技術。'
slug: /operations/settings/memory-overcommit
title: 'メモリオーバーコミット'
---


# メモリオーバーコミット

メモリオーバーコミットは、クエリに対してより柔軟なメモリ制限を設定できるようにすることを意図した実験的な技術です。

この技術の考え方は、クエリが使用できる保証されたメモリ量を表す設定を導入することです。メモリオーバーコミットが有効になり、メモリ制限に達した場合、ClickHouseは最もオーバーコミットされたクエリを選択し、このクエリをキルすることでメモリを解放しようとします。

メモリ制限に達すると、どのクエリも新しいメモリを確保しようとする試みの間に一定の時間待機します。タイムアウトが経過し、メモリが解放されれば、クエリは実行を続けます。そうでない場合は、例外がスローされ、そのクエリはキルされます。

クエリを停止またはキルする選択は、達成されたメモリ制限に応じて、グローバルまたはユーザーオーバーコミットトラッカーのいずれかによって行われます。オーバーコミットトラッカーが停止するクエリを選択できない場合は、MEMORY_LIMIT_EXCEEDED例外がスローされます。

## ユーザーオーバーコミットトラッカー {#user-overcommit-tracker}

ユーザーオーバーコミットトラッカーは、ユーザーのクエリリストの中で最も大きなオーバーコミット比率を持つクエリを見つけます。クエリのオーバーコミット比率は、割り当てられたバイト数を`memory_overcommit_ratio_denominator_for_user`設定の値で割ったもので計算されます。

クエリの`memory_overcommit_ratio_denominator_for_user`がゼロの場合、オーバーコミットトラッカーはこのクエリを選択しません。

待機タイムアウトは、`memory_usage_overcommit_max_wait_microseconds`設定によって設定されます。

**例**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```

## グローバルオーバーコミットトラッカー {#global-overcommit-tracker}

グローバルオーバーコミットトラッカーは、すべてのクエリのリストの中で最も大きなオーバーコミット比率を持つクエリを見つけます。この場合、オーバーコミット比率は、割り当てられたバイト数を`memory_overcommit_ratio_denominator`設定の値で割ったもので計算されます。

クエリの`memory_overcommit_ratio_denominator`がゼロの場合、オーバーコミットトラッカーはこのクエリを選択しません。

待機タイムアウトは、設定ファイル内の`memory_usage_overcommit_max_wait_microseconds`パラメータによって設定されます。
