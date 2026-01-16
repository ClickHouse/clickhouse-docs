---
slug: /guides/sre/tls/configuring-tls
sidebar_label: 'Настройка TLS'
sidebar_position: 20
title: 'Настройка TLS'
description: 'В этом руководстве приведены простые и минимально необходимые настройки, чтобы настроить ClickHouse на использование сертификатов OpenSSL для проверки соединений.'
keywords: ['конфигурация SSL', 'настройка TLS', 'сертификаты OpenSSL', 'защищённые соединения', 'руководство для SRE']
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';


# Настройка TLS \{#configuring-tls\}

<SelfManaged />

В этом руководстве приводятся простые и минимальные настройки для конфигурирования ClickHouse на использование сертификатов OpenSSL при проверке соединений. В рамках этого примера создаются самоподписанные сертификат и ключ центра сертификации (CA), а также сертификаты узлов для установления соединений с соответствующими настройками.

:::note
Реализация TLS — сложная задача, и существует множество вариантов, которые необходимо учитывать для обеспечения полностью безопасного и надежного развертывания. Это базовое руководство с простыми примерами конфигурации TLS. Обратитесь к вашей команде по PKI/безопасности, чтобы сгенерировать корректные сертификаты для вашей организации.

Ознакомьтесь с этим [базовым руководством по использованию сертификатов](https://ubuntu.com/server/docs/security-certificates) для вводного обзора.
:::

## 1. Создание развертывания ClickHouse \\{#1-create-a-clickhouse-deployment\\}

Это руководство подготовлено на Ubuntu 20.04 с ClickHouse, установленным на следующих хостах из DEB-пакета (через apt). Домен — `marsnet.local`:

|Хост |IP-адрес|
|--------|-------------|
|`chnode1` |192.168.1.221|
|`chnode2` |192.168.1.222|
|`chnode3` |192.168.1.223|

:::note
См. раздел [Quick Start](/getting-started/install/install.mdx) для более подробной информации по установке ClickHouse.
:::

## 2. Создайте TLS-сертификаты \\{#2-create-tls-certificates\\}

:::note
Самоподписанные сертификаты предназначены только для демонстрационных целей и не должны использоваться в рабочей (production) среде. Запросы на сертификаты должны создаваться для подписи вашей организацией и проверяться с использованием цепочки сертификатов CA, которая будет настроена в конфигурации. Тем не менее, эти шаги можно использовать для настройки и тестирования, а затем заменить временные сертификаты на реальные, которые будут использоваться в дальнейшем.
:::

1. Сгенерируйте ключ, который будет использоваться для нового CA:
    ```bash
    openssl genrsa -out marsnet_ca.key 2048
    ```

2. Сгенерируйте новый самоподписанный сертификат CA. Следующая команда создаст новый сертификат, который будет использоваться для подписи других сертификатов с помощью ключа CA:
    ```bash
    openssl req -x509 -subj "/CN=marsnet.local CA" -nodes -key marsnet_ca.key -days 1095 -out marsnet_ca.crt
    ```

    :::note
    Создайте резервную копию ключа и сертификата CA в безопасном месте вне кластера. После генерации узловых сертификатов ключ должен быть удалён с узлов кластера.
    :::

3. Проверьте содержимое нового сертификата CA:
    ```bash
    openssl x509 -in marsnet_ca.crt -text
    ```

4. Создайте запрос на сертификат (CSR) и сгенерируйте ключ для каждого узла:
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1" -addext "subjectAltName = DNS:chnode1.marsnet.local,IP:192.168.1.221" -keyout chnode1.key -out chnode1.csr
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode2" -addext "subjectAltName = DNS:chnode2.marsnet.local,IP:192.168.1.222" -keyout chnode2.key -out chnode2.csr
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode3" -addext "subjectAltName = DNS:chnode3.marsnet.local,IP:192.168.1.223" -keyout chnode3.key -out chnode3.csr
    ```

5. Используя CSR и CA, создайте новые пары «сертификат–ключ»:
    ```bash
    openssl x509 -req -in chnode1.csr -out chnode1.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode2.csr -out chnode2.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode3.csr -out chnode3.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    ```

6. Проверьте субъект и издателя в сертификате:
    ```bash
    openssl x509 -in chnode1.crt -text -noout
    ```

7. Убедитесь, что новые сертификаты успешно проверяются относительно сертификата CA:
    ```bash
    openssl verify -CAfile marsnet_ca.crt chnode1.crt
    chnode1.crt: OK
    ```

## 3. Создайте и настройте каталог для хранения сертификатов и ключей. \\{#3-create-and-configure-a-directory-to-store-certificates-and-keys\\}

:::note
Это нужно сделать на каждом узле. Используйте соответствующие сертификаты и ключи на каждом хосте.
:::

1. Создайте каталог в директории, доступной для ClickHouse на каждом узле. Мы рекомендуем каталог конфигурации по умолчанию (например, `/etc/clickhouse-server`):
    ```bash
    mkdir /etc/clickhouse-server/certs
    ```

2. Скопируйте сертификат CA, сертификат узла и ключ, соответствующие каждому узлу, в новый каталог `certs`.

3. Обновите владельца и права доступа, чтобы ClickHouse мог читать сертификаты:
    ```bash
    chown clickhouse:clickhouse -R /etc/clickhouse-server/certs
    chmod 600 /etc/clickhouse-server/certs/*
    chmod 755 /etc/clickhouse-server/certs
    ll /etc/clickhouse-server/certs
    ```

    ```response
    total 20
    drw-r--r-- 2 clickhouse clickhouse 4096 Apr 12 20:23 ./
    drwx------ 5 clickhouse clickhouse 4096 Apr 12 20:23 ../
    -rw------- 1 clickhouse clickhouse  997 Apr 12 20:22 chnode1.crt
    -rw------- 1 clickhouse clickhouse 1708 Apr 12 20:22 chnode1.key
    -rw------- 1 clickhouse clickhouse 1131 Apr 12 20:23 marsnet_ca.crt
    ```

## 4. Настройка окружения с базовыми кластерами с использованием ClickHouse Keeper \\{#4-configure-the-environment-with-basic-clusters-using-clickhouse-keeper\\}

Для этой среды развертывания в каждом узле используются следующие параметры ClickHouse Keeper. У каждого сервера будет собственный `<server_id>`. (Например, `<server_id>1</server_id>` для узла `chnode1` и так далее.)

:::note
Рекомендуемый порт для ClickHouse Keeper — `9281`. Однако при необходимости его можно изменить, если этот порт уже используется другим приложением в окружении.

Для подробного описания всех параметров посетите https://clickhouse.com/docs/operations/clickhouse-keeper/
:::

1. Добавьте следующий блок внутрь тега `<clickhouse>` в файле `config.xml` сервера ClickHouse.

    :::note
    Для продуктивных сред рекомендуется использовать отдельный конфигурационный файл `.xml` в директории `config.d`.
    Для получения дополнительной информации посетите https://clickhouse.com/docs/operations/configuration-files/
    :::

    ```xml
    <keeper_server>
        <tcp_port_secure>9281</tcp_port_secure>
        <server_id>1</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>trace</raft_logs_level>
        </coordination_settings>

        <raft_configuration>
            <secure>true</secure>
            <server>
                <id>1</id>
                <hostname>chnode1.marsnet.local</hostname>
                <port>9444</port>
            </server>
            <server>
                <id>2</id>
                <hostname>chnode2.marsnet.local</hostname>
                <port>9444</port>
            </server>
            <server>
                <id>3</id>
                <hostname>chnode3.marsnet.local</hostname>
                <port>9444</port>
            </server>
        </raft_configuration>
    </keeper_server>
    ```

2. Раскомментируйте и обновите настройки Keeper на всех узлах и установите флаг `<secure>` в значение 1:
    ```xml
    <zookeeper>
        <node>
            <host>chnode1.marsnet.local</host>
            <port>9281</port>
            <secure>1</secure>
        </node>
        <node>
            <host>chnode2.marsnet.local</host>
            <port>9281</port>
            <secure>1</secure>
        </node>
        <node>
            <host>chnode3.marsnet.local</host>
            <port>9281</port>
            <secure>1</secure>
        </node>
    </zookeeper>
    ```

3. Обновите и добавьте следующие настройки кластера для `chnode1` и `chnode2`. `chnode3` будет использоваться для кворума ClickHouse Keeper.

    :::note
    В этой конфигурации настроен только один пример кластера. Тестовые примерные кластеры должны быть либо удалены, либо закомментированы, либо, если уже существует кластер, который тестируется, его порт должен быть обновлён и должна быть добавлена опция `<secure>`. Параметры `<user` и `<password>` должны быть заданы, если пользователь `default` изначально был настроен с паролем при установке или в файле `users.xml`.
    :::

    Следующая конфигурация создаёт кластер с одним сегментом и двумя репликами на двух серверах (по одной на каждом узле).
    ```xml
    <remote_servers>
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
                <replica>
                    <host>chnode2.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
    ```

4. Определите значения макросов, чтобы можно было создать таблицу ReplicatedMergeTree для тестирования. На `chnode1`:
    ```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
    ```

    На `chnode2`:
    ```xml
    <macros>
        <shard>1</shard>
        <replica>replica_2</replica>
    </macros>
    ```

## 5. Настройка TLS-интерфейсов на узлах ClickHouse \\{#5-configure-tls-interfaces-on-clickhouse-nodes\\}

Параметры ниже настраиваются в `config.xml` сервера ClickHouse.

1.  Задайте отображаемое имя для развертывания (необязательно):
    ```xml
    <display_name>clickhouse</display_name>
    ```

2. Разрешите ClickHouse прослушивать внешние интерфейсы:
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. Настройте порт `https` и отключите порт `http` на каждом узле:
    ```xml
    <https_port>8443</https_port>
    <!--<http_port>8123</http_port>-->
    ```

4. Настройте защищенный ClickHouse Native TCP-порт и отключите незащищенный порт по умолчанию на каждом узле:
    ```xml
    <tcp_port_secure>9440</tcp_port_secure>
    <!--<tcp_port>9000</tcp_port>-->
    ```

5. Настройте порт `interserver https` и отключите незащищенный порт по умолчанию на каждом узле:
    ```xml
    <interserver_https_port>9010</interserver_https_port>
    <!--<interserver_http_port>9009</interserver_http_port>-->
    ```

6. Настройте OpenSSL с сертификатами и путями

    :::note
    Каждое имя файла и путь должны быть обновлены в соответствии с узлом, на котором выполняется настройка.
    Например, обновите запись `<certificateFile>` на `chnode2.crt` при настройке на хосте `chnode2`.
    :::

    ```xml
    <openSSL>
        <server>
            <certificateFile>/etc/clickhouse-server/certs/chnode1.crt</certificateFile>
            <privateKeyFile>/etc/clickhouse-server/certs/chnode1.key</privateKeyFile>
            <verificationMode>relaxed</verificationMode>
            <caConfig>/etc/clickhouse-server/certs/marsnet_ca.crt</caConfig>
            <cacheSessions>true</cacheSessions>
            <disableProtocols>sslv2,sslv3</disableProtocols>
            <preferServerCiphers>true</preferServerCiphers>
        </server>
        <client>
            <loadDefaultCAFile>false</loadDefaultCAFile>
            <caConfig>/etc/clickhouse-server/certs/marsnet_ca.crt</caConfig>
            <cacheSessions>true</cacheSessions>
            <disableProtocols>sslv2,sslv3</disableProtocols>
            <preferServerCiphers>true</preferServerCiphers>
            <verificationMode>relaxed</verificationMode>
            <invalidCertificateHandler>
                <name>RejectCertificateHandler</name>
            </invalidCertificateHandler>
        </client>
    </openSSL>
    ```

    Для получения дополнительной информации см. https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-openssl

7. Настройте TLS для gRPC на каждом узле:
    ```xml
    <grpc>
        <enable_ssl>1</enable_ssl>
        <ssl_cert_file>/etc/clickhouse-server/certs/chnode1.crt</ssl_cert_file>
        <ssl_key_file>/etc/clickhouse-server/certs/chnode1.key</ssl_key_file>
        <ssl_require_client_auth>true</ssl_require_client_auth>
        <ssl_ca_cert_file>/etc/clickhouse-server/certs/marsnet_ca.crt</ssl_ca_cert_file>
        <transport_compression_type>none</transport_compression_type>
        <transport_compression_level>0</transport_compression_level>
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>
        <verbose_logs>false</verbose_logs>
    </grpc>
    ```

    Для получения дополнительной информации см. https://clickhouse.com/docs/interfaces/grpc/

8. Настройте клиент ClickHouse как минимум на одном из узлов для использования TLS при подключении в его собственном файле `config.xml` (по умолчанию в `/etc/clickhouse-client/`):
    ```xml
    <openSSL>
        <client>
            <loadDefaultCAFile>false</loadDefaultCAFile>
            <caConfig>/etc/clickhouse-server/certs/marsnet_ca.crt</caConfig>
            <cacheSessions>true</cacheSessions>
            <disableProtocols>sslv2,sslv3</disableProtocols>
            <preferServerCiphers>true</preferServerCiphers>
            <invalidCertificateHandler>
                <name>RejectCertificateHandler</name>
            </invalidCertificateHandler>
        </client>
    </openSSL>
    ```

6. Отключите стандартные порты эмуляции для MySQL и PostgreSQL:
    ```xml
    <!--mysql_port>9004</mysql_port-->
    <!--postgresql_port>9005</postgresql_port-->
    ```

## 6. Тестирование \{#6-testing\}

1. Запустите все узлы по очереди:
   ```bash
   service clickhouse-server start
   ```

2. Убедитесь, что защищённые порты запущены и прослушиваются; на каждом узле вывод должен выглядеть примерно так:

   ```bash
   root@chnode1:/etc/clickhouse-server# netstat -ano | grep tcp
   ```

   ```response
   tcp        0      0 0.0.0.0:9010            0.0.0.0:*               LISTEN      off (0.00/0/0)
   tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      off (0.00/0/0)
   tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      off (0.00/0/0)
   tcp        0      0 0.0.0.0:8443            0.0.0.0:*               LISTEN      off (0.00/0/0)
   tcp        0      0 0.0.0.0:9440            0.0.0.0:*               LISTEN      off (0.00/0/0)
   tcp        0      0 0.0.0.0:9281            0.0.0.0:*               LISTEN      off (0.00/0/0)
   tcp        0      0 192.168.1.221:33046     192.168.1.222:9444      ESTABLISHED off (0.00/0/0)
   tcp        0      0 192.168.1.221:42730     192.168.1.223:9444      ESTABLISHED off (0.00/0/0)
   tcp        0      0 192.168.1.221:51952     192.168.1.222:9281      ESTABLISHED off (0.00/0/0)
   tcp        0      0 192.168.1.221:22        192.168.1.210:49801     ESTABLISHED keepalive (6618.05/0/0)
   tcp        0     64 192.168.1.221:22        192.168.1.210:59195     ESTABLISHED on (0.24/0/0)
   tcp6       0      0 :::22                   :::*                    LISTEN      off (0.00/0/0)
   tcp6       0      0 :::9444                 :::*                    LISTEN      off (0.00/0/0)
   tcp6       0      0 192.168.1.221:9444      192.168.1.222:59046     ESTABLISHED off (0.00/0/0)
   tcp6       0      0 192.168.1.221:9444      192.168.1.223:41976     ESTABLISHED off (0.00/0/0)
   ```

   | Порт ClickHouse | Описание                          |
   | --------------- | --------------------------------- |
   | 8443            | https-интерфейс                   |
   | 9010            | межсерверный https-порт           |
   | 9281            | защищённый порт ClickHouse Keeper |
   | 9440            | защищённый протокол Native TCP    |
   | 9444            | Raft-порт ClickHouse Keeper       |

3. Проверьте работоспособность ClickHouse Keeper
   Типичные команды [4 letter word (4lW)](/guides/sre/keeper/index.md#four-letter-word-commands) не будут работать при использовании `echo` без TLS; ниже показано, как использовать эти команды с `openssl`.
   * Запустите интерактивный сеанс с `openssl`

```bash
  openssl s_client -connect chnode1.marsnet.local:9281
```


```response
  CONNECTED(00000003)
  depth=0 CN = chnode1
  verify error:num=20:unable to get local issuer certificate
  verify return:1
  depth=0 CN = chnode1
  verify error:num=21:unable to verify the first certificate
  verify return:1
  ---
  Certificate chain
   0 s:CN = chnode1
     i:CN = marsnet.local CA
  ---
  Server certificate
  -----BEGIN CERTIFICATE-----
  MIICtDCCAZwCFD321grxU3G5pf6hjitf2u7vkusYMA0GCSqGSIb3DQEBCwUAMBsx
  ...
```

* Отправьте 4LW-команды в сеансе OpenSSL

  ```bash
  mntr
  ```

  ```response
  ---
  Post-Handshake New Session Ticket arrived:
  SSL-Session:
      Protocol  : TLSv1.3
  ...
  read R BLOCK
  zk_version      v22.7.3.5-stable-e140b8b5f3a5b660b6b576747063fd040f583cf3
  zk_avg_latency  0
  # highlight-next-line
  zk_max_latency  4087
  zk_min_latency  0
  zk_packets_received     4565774
  zk_packets_sent 4565773
  zk_num_alive_connections        2
  zk_outstanding_requests 0
  # highlight-next-line
  zk_server_state leader
  zk_znode_count  1087
  zk_watch_count  26
  zk_ephemerals_count     12
  zk_approximate_data_size        426062
  zk_key_arena_size       258048
  zk_latest_snapshot_size 0
  zk_open_file_descriptor_count   187
  zk_max_file_descriptor_count    18446744073709551615
  # highlight-next-line
  zk_followers    2
  zk_synced_followers     1
  closed
  ```


4. Запустите клиент ClickHouse с флагом `--secure` и через TLS-порт:
    ```bash
    root@chnode1:/etc/clickhouse-server# clickhouse-client --user default --password ClickHouse123! --port 9440 --secure --host chnode1.marsnet.local
    ClickHouse client version 22.3.3.44 (official build).
    Connecting to chnode1.marsnet.local:9440 as user default.
    Connected to ClickHouse server version 22.3.3 revision 54455.

    clickhouse :)
    ```

5. Войдите в Play UI через интерфейс `https` по адресу `https://chnode1.marsnet.local:8443/play`.

    <Image img={configuringSsl01} alt="Настройка TLS" size="md" border />

    :::note
    браузер покажет недоверенный сертификат, поскольку доступ осуществляется с рабочей станции, а сертификаты отсутствуют в хранилищах корневых центров сертификации на клиентской машине.
    При использовании сертификатов, выданных публичным или корпоративным центром сертификации, сертификат будет отображаться как доверенный.
    :::

6. Создайте реплицируемую таблицу:
    ```sql
    clickhouse :) CREATE TABLE repl_table ON CLUSTER cluster_1S_2R
                (
                    id UInt64,
                    column1 Date,
                    column2 String
                )
                ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/default/repl_table', '{replica}' )
                ORDER BY (id);
    ```

    ```response
    ┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
    │ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
    │ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
    └───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
    ```

7. Добавьте пару строк на `chnode1`:
    ```sql
    INSERT INTO repl_table
    (id, column1, column2)
    VALUES
    (1,'2022-04-01','abc'),
    (2,'2022-04-02','def');
    ```

8. Проверьте репликацию, просмотрев строки на `chnode2`:
    ```sql
    SELECT * FROM repl_table
    ```

    ```response
    ┌─id─┬────column1─┬─column2─┐
    │  1 │ 2022-04-01 │ abc     │
    │  2 │ 2022-04-02 │ def     │
    └────┴────────────┴─────────┘
    ```

## Итоги \\{#summary\\}

В этой статье основное внимание было уделено настройке среды ClickHouse с использованием TLS. Параметры будут отличаться в зависимости от требований в продуктивных средах, например уровни проверки сертификатов, протоколы, шифры и т. д. Теперь у вас должно быть хорошее понимание последовательности шагов по настройке и использованию защищённых соединений.