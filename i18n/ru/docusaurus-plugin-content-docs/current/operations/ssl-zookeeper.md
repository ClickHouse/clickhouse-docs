---
description: 'Руководство по настройке безопасной SSL/TLS связи между ClickHouse и ZooKeeper'
sidebar_label: 'Безопасная связь с Zookeeper'
sidebar_position: 45
slug: /operations/ssl-zookeeper
title: 'Необязательная безопасная связь между ClickHouse и Zookeeper'
---


# Необязательная безопасная связь между ClickHouse и Zookeeper
import SelfManaged from '@site/i18n/docusaurus-plugin-content-docs/ru/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

Вы должны указать `ssl.keyStore.location`, `ssl.keyStore.password` и `ssl.trustStore.location`, `ssl.trustStore.password` для связи с клиентом ClickHouse через SSL. Эти параметры доступны с версии Zookeeper 3.5.2.

Вы можете добавить `zookeeper.crt` в надежные сертификаты.

```bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

Раздел клиента в `config.xml` будет выглядеть так:

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

Для обеспечения шифрования трафика выполните `tcpdump` на защищенном порту:

```bash
tcpdump -i any dst port 2281 -nnXS
```

И выполните запрос в `clickhouse-client`:

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

При незащищенном соединении вы увидите в выводе `tcpdump` что-то вроде этого:

```text
..../zookeeper/quota.
```

При зашифрованном соединении вы не должны видеть это.
