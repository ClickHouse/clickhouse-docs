---
slug: '/operations/ssl-zookeeper'
sidebar_label: 'Безопасная связь с Zookeeper'
sidebar_position: 45
description: 'Руководство по настройке безопасного SSL/TLS соединения между ClickHouse'
title: 'Необязательная безопасная связь между ClickHouse и Zookeeper'
doc_type: guide
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';


# Опциональная защищенная связь между ClickHouse и Zookeeper
<SelfManaged />

Вы должны указать `ssl.keyStore.location`, `ssl.keyStore.password` и `ssl.trustStore.location`, `ssl.trustStore.password` для связи с клиентом ClickHouse по SSL. Эти параметры доступны начиная с версии Zookeeper 3.5.2.

Вы можете добавить `zookeeper.crt` в доверенные сертификаты.

```bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

Секция клиента в `config.xml` будет выглядеть следующим образом:

```xml
<client>
    <certificateFile>/etc/clickhouse-server/client.crt</certificateFile>
    <privateKeyFile>/etc/clickhouse-server/client.key</privateKeyFile>
    <loadDefaultCAFile>true</loadDefaultCAFile>
    <cacheSessions>true</cacheSessions>
    <disableProtocols>sslv2,sslv3</disableProtocols>
    <preferServerCiphers>true</preferServerCiphers>
    <invalidCertificateHandler>
        <name>RejectCertificateHandler</name>
    </invalidCertificateHandler>
</client>
```

Добавьте Zookeeper в конфигурацию ClickHouse с некоторым кластером и макросами:

```xml
<clickhouse>
    <zookeeper>
        <node>
            <host>localhost</host>
            <port>2281</port>
            <secure>1</secure>
        </node>
    </zookeeper>
</clickhouse>
```

Запустите `clickhouse-server`. В логах вы должны увидеть:

```text
<Trace> ZooKeeper: initialized, hosts: secure://localhost:2281
```

Префикс `secure://` указывает на то, что соединение защищено с помощью SSL.

Для уверенности в том, что трафик зашифрован, запустите `tcpdump` на защищенном порту:

```bash
tcpdump -i any dst port 2281 -nnXS
```

И выполните запрос в `clickhouse-client`:

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

При незашифрованном соединении вы увидите в выводе `tcpdump` что-то вроде этого:

```text
..../zookeeper/quota.
```

При зашифрованном соединении вы не должны видеть этого.