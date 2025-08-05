---
title: 'トラブルシューティング'
slug: '/faq/troubleshooting'
description: '一般的な ClickHouse Cloud エラーメッセージのトラブルシューティング方法。'
---



## ClickHouse Cloud トラブルシューティング {#clickhouse-cloud-troubleshooting}

### ClickHouse Cloud サービスにアクセスできない {#unable-to-access-a-clickhouse-cloud-service}

以下のようなエラーメッセージが表示される場合、IPアクセスリストがアクセスを拒否している可能性があります：

```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```
または
```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```
または
```response
Code: 210. DB::NetException: SSL connection unexpectedly closed (e46453teek.us-east-2.aws.clickhouse-staging.com:9440). (NETWORK_ERROR)
```

[IPアクセスリスト](/cloud/security/setting-ip-filters)を確認してください。許可されたリストの外から接続を試みている場合、接続は失敗します。
