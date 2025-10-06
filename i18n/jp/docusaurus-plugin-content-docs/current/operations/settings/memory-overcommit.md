---
'description': 'クエリのためにより柔軟なメモリ制限を設定できるようにするための実験的な技術。'
'slug': '/operations/settings/memory-overcommit'
'title': 'メモリオーバーコミット'
'doc_type': 'reference'
---


# メモリオーバーコミット

メモリオーバーコミットは、クエリに対してより柔軟なメモリ制限を設定することを目的とした実験的な手法です。

この手法の考え方は、クエリが使用できるメモリの保証された量を表す設定を導入することです。
メモリオーバーコミットが有効で、メモリ制限に達すると、ClickHouseは最もオーバーコミットされたクエリを選択し、このクエリを停止してメモリを解放しようとします。

メモリ制限に達すると、任意のクエリは新しいメモリを割り当てる試みの際にしばらく待機します。
タイムアウトが経過した場合、メモリが解放されればクエリは実行を続けます。
そうでなければ、例外が発生し、クエリは終了します。

停止または終了させるクエリの選択は、達成されたメモリ制限に応じて、グローバルまたはユーザーオーバーコミットトラッカーによって行われます。
オーバーコミットトラッカーが停止するクエリを選択できない場合、MEMORY_LIMIT_EXCEEDED例外が発生します。

## ユーザーオーバーコミットトラッカー {#user-overcommit-tracker}

ユーザーオーバーコミットトラッカーは、ユーザーのクエリリストの中で最も大きなオーバーコミット比率を持つクエリを見つけます。
クエリのオーバーコミット比率は、割り当てられたバイト数を `memory_overcommit_ratio_denominator_for_user` 設定の値で割ったものとして計算されます。

クエリの `memory_overcommit_ratio_denominator_for_user` がゼロに等しい場合、オーバーコミットトラッカーはこのクエリを選択しません。

待機タイムアウトは `memory_usage_overcommit_max_wait_microseconds` 設定によって設定されます。

**例**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```

## グローバルオーバーコミットトラッカー {#global-overcommit-tracker}

グローバルオーバーコミットトラッカーは、すべてのクエリのリストの中で最も大きなオーバーコミット比率を持つクエリを見つけます。
この場合、オーバーコミット比率は、割り当てられたバイト数を `memory_overcommit_ratio_denominator` 設定の値で割ったものとして計算されます。

クエリの `memory_overcommit_ratio_denominator` がゼロに等しい場合、オーバーコミットトラッカーはこのクエリを選択しません。

待機タイムアウトは、構成ファイルの `memory_usage_overcommit_max_wait_microseconds` パラメータによって設定されます。
