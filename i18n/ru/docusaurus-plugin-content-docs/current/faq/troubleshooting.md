---
title: 'Устранение неисправностей'
slug: /faq/troubleshooting
description: 'Как устранить распространённые сообщения об ошибках ClickHouse Cloud.'
---

## Устранение неисправностей ClickHouse Cloud {#clickhouse-cloud-troubleshooting}

### Невозможно получить доступ к сервису ClickHouse Cloud {#unable-to-access-a-clickhouse-cloud-service}

Если вы видите сообщение об ошибке, подобное одному из следующих, ваш список контроля доступа по IP может запрещать доступ:

```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```
или
```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```
или
```response
Code: 210. DB::NetException: SSL connection unexpectedly closed (e46453teek.us-east-2.aws.clickhouse-staging.com:9440). (NETWORK_ERROR)
```

Проверьте [IP Access List](/cloud/security/setting-ip-filters). Если вы пытаетесь подключиться снаружи разрешённого списка, ваше подключение завершится неудачей.
