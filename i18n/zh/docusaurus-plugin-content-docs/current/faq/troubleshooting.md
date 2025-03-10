---
title: '故障排除'
slug: /faq/troubleshooting
description: '如何排除常见的 ClickHouse Cloud 错误消息。'
---

## ClickHouse Cloud 故障排除 {#clickhouse-cloud-troubleshooting}

### 无法访问 ClickHouse Cloud 服务 {#unable-to-access-a-clickhouse-cloud-service}

如果您看到如下错误消息，您的 IP 访问列表可能正在拒绝访问：

```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```
或
```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```
或
```response
Code: 210. DB::NetException: SSL connection unexpectedly closed (e46453teek.us-east-2.aws.clickhouse-staging.com:9440). (NETWORK_ERROR)
```

请检查 [IP 访问列表](/cloud/security/setting-ip-filters)，如果您尝试从不在允许列表中的位置连接，那么您的连接将会失败。
