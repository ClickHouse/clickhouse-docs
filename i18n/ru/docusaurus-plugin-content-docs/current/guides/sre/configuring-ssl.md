---
slug: /guides/sre/configuring-ssl
sidebar_label: 'Настройка SSL-TLS'
sidebar_position: 20
title: 'Настройка SSL-TLS'
description: 'В этом руководстве описаны простые и минимальные настройки для настройки ClickHouse на использование сертификатов OpenSSL для проверки соединений.'
keywords: ['конфигурация SSL', 'настройка TLS', 'сертификаты OpenSSL', 'защищённые соединения', 'руководство для SRE']
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';

# Настройка SSL-TLS {#configuring-ssl-tls}

<SelfManaged />

В этом руководстве приведены простые и минимальные настройки для использования ClickHouse с сертификатами OpenSSL для проверки подключений. В рамках этой демонстрации создаются самоподписанный сертификат и ключ центра сертификации (CA), а также сертификаты узлов для установления подключений с соответствующими параметрами.

:::note
Реализация TLS сложна, и существует множество вариантов, которые необходимо учитывать для обеспечения полностью безопасного и надежного развертывания. Это базовый учебник с примерами базовой конфигурации SSL/TLS. Проконсультируйтесь с вашей командой PKI/безопасности для выпуска корректных сертификатов для вашей организации.

Ознакомьтесь с этим [базовым учебником по использованию сертификатов](https://ubuntu.com/server/docs/security-certificates) в качестве вводного обзора.
:::

## 1. Создание развертывания ClickHouse {#1-create-a-clickhouse-deployment}

Это руководство подготовлено для Ubuntu 20.04 и ClickHouse, установленного на следующих хостах из DEB-пакета (через apt). Домен — `marsnet.local`:

|Хост |IP-адрес|
|--------|-------------|
|`chnode1` |192.168.1.221|
|`chnode2` |192.168.1.222|
|`chnode3` |192.168.1.223|

:::note
Дополнительные сведения об установке ClickHouse см. в разделе [Быстрый старт](/getting-started/install/install.mdx).
:::

## 2. Создание SSL-сертификатов {#2-create-ssl-certificates}
:::note
Самоподписанные сертификаты предназначены исключительно для демонстрационных целей и не должны использоваться в продуктивной среде. В рабочей среде запросы на сертификаты следует создавать для последующей подписи их вашей организацией и проверки с использованием цепочки CA, которая будет настроена в конфигурации. Тем не менее, эти шаги можно использовать для настройки и тестирования, а затем заменить временные сертификаты на реальные, которые будут использоваться.
:::

1. Создайте ключ, который будет использоваться для нового CA:
    ```bash
    openssl genrsa -out marsnet_ca.key 2048
    ```

2. Создайте новый самоподписанный сертификат CA. Следующая команда создаст сертификат, который будет использоваться для подписи других сертификатов с помощью ключа CA:
    ```bash
    openssl req -x509 -subj "/CN=marsnet.local CA" -nodes -key marsnet_ca.key -days 1095 -out marsnet_ca.crt
    ```

    :::note
    Сохраните резервную копию ключа и сертификата CA в защищённом месте вне кластера. После генерации узловых сертификатов ключ должен быть удалён с узлов кластера.
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

5. Используя CSR и CA, создайте новые пары сертификат/ключ:
    ```bash
    openssl x509 -req -in chnode1.csr -out chnode1.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode2.csr -out chnode2.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode3.csr -out chnode3.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    ```

6. Проверьте значения полей subject и issuer в сертификате:
    ```bash
    openssl x509 -in chnode1.crt -text -noout
    ```

7. Убедитесь, что новые сертификаты успешно проходят проверку относительно сертификата CA:
    ```bash
    openssl verify -CAfile marsnet_ca.crt chnode1.crt
    chnode1.crt: OK
    ```

## 3. Создайте и настройте каталог для хранения сертификатов и ключей. {#3-create-and-configure-a-directory-to-store-certificates-and-keys}

:::note
Это необходимо выполнить на каждом узле. Используйте соответствующие сертификаты и ключи на каждом хосте.
:::

1. Создайте каталог в расположении, доступном для ClickHouse на каждом узле. Мы рекомендуем каталог конфигурации по умолчанию (например, `/etc/clickhouse-server`):
    ```bash
    mkdir /etc/clickhouse-server/certs
    ```

2. Скопируйте сертификат центра сертификации (CA), сертификат узла и ключ узла в новый каталог `certs`.

3. Измените владельца и права доступа, чтобы ClickHouse мог читать сертификаты:
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

## 4. Настройка среды с базовыми кластерами с использованием ClickHouse Keeper {#4-configure-the-environment-with-basic-clusters-using-clickhouse-keeper}

Для этой среды развертывания на каждом узле используются следующие настройки ClickHouse Keeper. У каждого сервера будет свой собственный `<server_id>`. (Например, `<server_id>1</server_id>` для узла `chnode1` и так далее.)

:::note
Рекомендуемый порт для ClickHouse Keeper — `9281`. Однако порт является настраиваемым и может быть изменён, если он уже используется другим приложением в среде.

Полное описание всех опций доступно по адресу https://clickhouse.com/docs/operations/clickhouse-keeper/
:::

1. Добавьте следующее внутрь тега `<clickhouse>` в файле `config.xml` сервера ClickHouse

    :::note
    Для продуктивных сред рекомендуется использовать отдельный конфигурационный файл `.xml` в каталоге `config.d`.
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

2. Раскомментируйте и обновите настройки keeper на всех узлах и установите флаг `<secure>` в значение 1:
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

3. Обновите и добавьте следующие настройки кластера на `chnode1` и `chnode2`. `chnode3` будет использоваться для кворума ClickHouse Keeper.

    :::note
    В этой конфигурации настраивается только один пример кластера. Тестовые кластеры-примеры должны быть удалены, закомментированы или, если уже существует кластер, используемый для тестирования, его порт должен быть обновлён и должна быть добавлена опция `<secure>`. Параметры `<user>` и `<password>` должны быть заданы, если пользователю `default` был изначально назначен пароль при установке или в файле `users.xml`.
    :::

    Следующая конфигурация создаёт кластер с одним шардом и двумя репликами на двух серверах (по одной на каждом узле).
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

4. Определите значения макросов для создания тестовой таблицы ReplicatedMergeTree. На `chnode1`:
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

## 5. Настройка SSL/TLS‑интерфейсов на узлах ClickHouse {#5-configure-ssl-tls-interfaces-on-clickhouse-nodes}
Приведённые ниже настройки задаются в `config.xml` сервера ClickHouse.

1.  Задайте отображаемое имя для развертывания (необязательно):
    ```xml
    <display_name>clickhouse</display_name>
    ```

2. Настройте ClickHouse на прослушивание внешних портов:
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. Настройте порт `https` и отключите порт `http` на каждом узле:
    ```xml
    <https_port>8443</https_port>
    <!--<http_port>8123</http_port>-->
    ```

4. Настройте защищённый ClickHouse Native TCP‑порт и отключите небезопасный порт по умолчанию на каждом узле:
    ```xml
    <tcp_port_secure>9440</tcp_port_secure>
    <!--<tcp_port>9000</tcp_port>-->
    ```

5. Настройте порт `interserver https` и отключите небезопасный порт по умолчанию на каждом узле:
    ```xml
    <interserver_https_port>9010</interserver_https_port>
    <!--<interserver_http_port>9009</interserver_http_port>-->
    ```

6. Настройте OpenSSL с сертификатами и путями

    :::note
    Имя файла и путь должны быть изменены в соответствии с узлом, который вы настраиваете.
    Например, обновите запись `<certificateFile>` до `chnode2.crt` при настройке на хосте `chnode2`.
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

    Дополнительную информацию см. по адресу https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-openssl

7. Настройте gRPC для SSL на каждом узле:
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

    Дополнительную информацию см. по адресу https://clickhouse.com/docs/interfaces/grpc/

8. Настройте клиент ClickHouse как минимум на одном из узлов для использования SSL при подключениях, в его собственном файле `config.xml` (по умолчанию в `/etc/clickhouse-client/`):
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

## 6. Тестирование {#6-testing}
1. Запустите все узлы по одному:
    ```bash
    service clickhouse-server start
    ```

2. Убедитесь, что защищённые порты подняты и прослушиваются; на каждом узле вывод должен быть похож на следующий пример:
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

    |ClickHouse Port |Описание|
    |--------|-------------|
    |8443 | HTTPS-интерфейс|
    |9010 | межсерверский HTTPS-порт|
    |9281 | защищённый порт ClickHouse Keeper|
    |9440 | защищённый протокол Native TCP|
    |9444 | порт Raft для ClickHouse Keeper |

3. Проверьте работоспособность ClickHouse Keeper  
Обычные команды [4 letter word (4lW)](/guides/sre/keeper/index.md#four-letter-word-commands) не будут работать с помощью `echo` без TLS. Ниже показано, как использовать эти команды с `openssl`.
   - Запустите интерактивный сеанс с `openssl`

```bash
  openssl s_client -connect chnode1.marsnet.local:9281
```

```response
СОЕДИНЕНО(00000003)
depth=0 CN = chnode1
verify error:num=20:не удаётся получить локальный сертификат центра сертификации
verify return:1
depth=0 CN = chnode1
verify error:num=21:не удаётся проверить первый сертификат
verify return:1
---
Цепочка сертификатов
 0 s:CN = chnode1
   i:CN = marsnet.local CA
---
Сертификат сервера
-----BEGIN CERTIFICATE-----
MIICtDCCAZwCFD321grxU3G5pf6hjitf2u7vkusYMA0GCSqGSIb3DQEBCwUAMBsx
...
```

* Отправьте команды 4LW в сеансе openssl

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

4. Запустите клиент ClickHouse, используя флаг `--secure` и SSL-порт:
   ```bash
   root@chnode1:/etc/clickhouse-server# clickhouse-client --user default --password ClickHouse123! --port 9440 --secure --host chnode1.marsnet.local
   ClickHouse client version 22.3.3.44 (official build).
   Connecting to chnode1.marsnet.local:9440 as user default.
   Connected to ClickHouse server version 22.3.3 revision 54455.

   clickhouse :)
   ```

5. Войдите в Play UI, используя интерфейс `https` по адресу `https://chnode1.marsnet.local:8443/play`.

   <Image img={configuringSsl01} alt="Настройка SSL" size="md" border />

   :::note
   Браузер отобразит недоверенный сертификат, так как доступ осуществляется с рабочей станции, а сертификаты отсутствуют в хранилищах корневых центров сертификации на клиентской машине.
   При использовании сертификатов, выданных публичным центром сертификации или корпоративным CA, сертификат будет отображаться как доверенный.
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

8. Проверьте репликацию, просмотрев строки на узле `chnode2`:
    ```sql
    SELECT * FROM repl_table
    ```

    ```response
    ┌─id─┬────column1─┬─column2─┐
    │  1 │ 2022-04-01 │ abc     │
    │  2 │ 2022-04-02 │ def     │
    └────┴────────────┴─────────┘
    ```

## Итоги {#summary}

В этой статье основное внимание уделялось настройке среды ClickHouse с использованием SSL/TLS. В производственных средах параметры будут отличаться в зависимости от требований — например, уровни проверки сертификатов, протоколы, шифры и т. д. Теперь у вас должно быть чёткое представление о шагах, необходимых для настройки и реализации защищённых подключений.
