---
title: 'Устранение неполадок'
slug: /faq/troubleshooting
description: 'Как устранить распространенные сообщения об ошибках ClickHouse Cloud.'
---

## Устранение неполадок ClickHouse Cloud {#clickhouse-cloud-troubleshooting}

### Невозможно получить доступ к службе ClickHouse Cloud {#unable-to-access-a-clickhouse-cloud-service}

Если вы видите сообщение об ошибке, подобное одному из следующих, возможно, ваш список доступа по IP запрещает доступ:

```response
curl: (35) error:02FFF036:system library:func(4095):Сбой соединения
```
или
```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL при подключении к HOSTNAME.clickhouse.cloud:8443
```
или
```response
Code: 210. DB::NetException: SSL соединение неожиданно закрыто (e46453teek.us-east-2.aws.clickhouse-staging.com:9440). (NETWORK_ERROR)
```

Проверьте [Список доступа по IP](/cloud/security/setting-ip-filters), если вы пытаетесь подключиться из-за пределов разрешенного списка, ваше соединение не будет установлено.
