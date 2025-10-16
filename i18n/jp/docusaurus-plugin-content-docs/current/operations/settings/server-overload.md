---
'description': 'サーバーCPUオーバーロード時の制御動作。'
'sidebar_label': 'サーバーオーバーロード'
'slug': '/operations/settings/server-overload'
'title': 'サーバーオーバーロード'
'doc_type': 'reference'
---


# サーバーの過負荷

## 概要 {#overview}

サーバーはさまざまな理由で過負荷になることがあります。現在のCPUの過負荷を判断するために、
ClickHouseサーバーは、CPU待機時間（`OSCPUWaitMicroseconds`メトリック）とビジータイム（`OSCPUVirtualTimeMicroseconds`メトリック）の比率を計算します。サーバーが特定の比率を超えて過負荷になると、負荷をこれ以上増やさないために、いくつかのクエリを破棄するか、接続リクエストをドロップすることが理にかなっています。

`os_cpu_busy_time_threshold`というサーバー設定があり、これはCPUが有効な作業を行っていると見なすための最小ビジータイムを制御します。`OSCPUVirtualTimeMicroseconds`メトリックの現在の値がこの値を下回っている場合、CPUの過負荷は0と見なされます。

## クエリの拒否 {#rejecting-queries}

クエリを拒否する動作は、クエリレベルの設定 `min_os_cpu_wait_time_ratio_to_throw` と `max_os_cpu_wait_time_ratio_to_throw` によって制御されます。これらの設定が設定されていて、`min_os_cpu_wait_time_ratio_to_throw` が `max_os_cpu_wait_time_ratio_to_throw` より小さい場合、クエリは拒否され、過負荷の比率が `min_os_cpu_wait_time_ratio_to_throw` 以上であれば、`SERVER_OVERLOADED` エラーがいくつかの確率で投げられます。この確率は、最小と最大比率の間の線形補間として決定されます。たとえば、`min_os_cpu_wait_time_ratio_to_throw = 2`、`max_os_cpu_wait_time_ratio_to_throw = 6`、`cpu_overload = 4` の場合、クエリは `0.5` の確率で拒否されます。

## 接続のドロップ {#dropping-connections}

接続のドロップは、サーバーレベルの設定 `min_os_cpu_wait_time_ratio_to_drop_connection` と `max_os_cpu_wait_time_ratio_to_drop_connection` によって制御されます。これらの設定は、サーバーの再起動なしに変更できます。これらの設定の背後にあるアイデアは、クエリを拒否する場合と類似しています。この場合の唯一の違いは、サーバーが過負荷の場合、接続試行がサーバー側から拒否されることです。

## リソース過負荷警告 {#resource-overload-warnings}

ClickHouseはまた、サーバーが過負荷のときに `system.warnings` テーブルにCPUおよびメモリの過負荷警告をログに記録します。これらの閾値はサーバーの設定を通じてカスタマイズできます。

**例**

```xml

<resource_overload_warnings>
    <cpu_overload_warn_ratio>0.9</cpu_overload_warn_ratio>
    <cpu_overload_clear_ratio>0.8</cpu_overload_clear_ratio>
    <cpu_overload_duration_seconds>600</cpu_overload_duration_seconds>
    <memory_overload_warn_ratio>0.9</memory_overload_warn_ratio>
    <memory_overload_clear_ratio>0.8</memory_overload_clear_ratio>
    <memory_overload_duration_seconds>600</memory_overload_duration_seconds>
</resource_overload_warnings>
```
