---
description: 'Руководство по настройке защищённого взаимодействия по SSL/TLS между ClickHouse и ZooKeeper'
sidebar_label: 'Защищённое взаимодействие с Zookeeper'
sidebar_position: 45
slug: /operations/ssl-zookeeper
title: 'Опциональное защищённое взаимодействие между ClickHouse и Zookeeper'
doc_type: 'guide'
---

# Опциональное защищённое взаимодействие между ClickHouse и ZooKeeper {#optional-secured-communication-between-clickhouse-and-zookeeper}

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

Необходимо указать `ssl.keyStore.location`, `ssl.keyStore.password` и `ssl.trustStore.location`, `ssl.trustStore.password` для взаимодействия с клиентом ClickHouse через SSL. Эти параметры доступны, начиная с версии Zookeeper 3.5.2.

Вы можете добавить `zookeeper.crt` в список доверенных сертификатов.

```bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

Раздел `client` в файле `config.xml` будет выглядеть следующим образом:

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

Добавьте Zookeeper в конфигурацию ClickHouse, указав кластер и макросы:

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

Запустите `clickhouse-server`. В логах вы увидите:

```text
<Trace> ZooKeeper: initialized, hosts: secure://localhost:2281
```

Префикс `secure://` указывает на то, что соединение защищено с помощью SSL.

Чтобы убедиться, что трафик шифруется, запустите `tcpdump` на защищённом порту:

```bash
tcpdump -i any dst port 2281 -nnXS
```

И выполните запрос в `clickhouse-client`:

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

При незашифрованном соединении в выводе команды `tcpdump` вы увидите что-то вроде этого:

```text
..../zookeeper/quota.
```

При защищённом соединении этого быть не должно.
