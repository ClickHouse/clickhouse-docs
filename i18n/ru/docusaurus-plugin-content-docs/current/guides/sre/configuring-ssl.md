---
slug: /guides/sre/configuring-ssl
sidebar_label: 'Настройка SSL-TLS'
sidebar_position: 20
title: 'Настройка SSL-TLS'
description: 'В этом руководстве приведены простые и минимально необходимые настройки ClickHouse для использования сертификатов OpenSSL при проверке соединений.'
keywords: ['настройка SSL', 'настройка TLS', 'сертификаты OpenSSL', 'защищённые соединения', 'руководство SRE']
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';


# Настройка SSL/TLS

<SelfManaged />

В этом руководстве приведены простые и минимально необходимые настройки для конфигурирования ClickHouse на использование сертификатов OpenSSL для проверки подключений. В демонстрационных целях создаются самоподписанные сертификат и ключ центра сертификации (CA), а также сертификаты узлов для установления соединений с необходимыми параметрами.

:::note
Реализация TLS сложна, и существует множество параметров, которые необходимо учитывать для обеспечения полностью безопасного и отказоустойчивого развертывания. Это базовый учебный материал с примерами простой конфигурации SSL/TLS. Обратитесь к вашей команде по PKI/безопасности для генерации корректных сертификатов для вашей организации.

Ознакомьтесь с этим [базовым учебным материалом по использованию сертификатов](https://ubuntu.com/server/docs/security-certificates) для получения вводного обзора.
:::



## 1. Создание развёртывания ClickHouse {#1-create-a-clickhouse-deployment}

Это руководство написано для Ubuntu 20.04 с ClickHouse, установленным на следующих хостах с помощью DEB-пакета (через apt). Домен: `marsnet.local`:

| Хост      | IP-адрес      |
| --------- | ------------- |
| `chnode1` | 192.168.1.221 |
| `chnode2` | 192.168.1.222 |
| `chnode3` | 192.168.1.223 |

:::note
Подробнее об установке ClickHouse см. в разделе [Быстрый старт](/getting-started/install/install.mdx).
:::


## 2. Создание SSL-сертификатов {#2-create-ssl-certificates}

:::note
Самоподписанные сертификаты предназначены только для демонстрационных целей и не должны использоваться в продуктивной среде. Запросы на сертификаты должны создаваться для подписания организацией и проверяться с использованием цепочки CA, которая будет настроена в конфигурации. Тем не менее, эти шаги можно использовать для настройки и тестирования параметров, а затем заменить их фактическими сертификатами, которые будут использоваться.
:::

1. Сгенерируйте ключ, который будет использоваться для нового центра сертификации (CA):

   ```bash
   openssl genrsa -out marsnet_ca.key 2048
   ```

2. Сгенерируйте новый самоподписанный сертификат CA. Следующая команда создаст новый сертификат, который будет использоваться для подписания других сертификатов с помощью ключа CA:

   ```bash
   openssl req -x509 -subj "/CN=marsnet.local CA" -nodes -key marsnet_ca.key -days 1095 -out marsnet_ca.crt
   ```

   :::note
   Создайте резервную копию ключа и сертификата CA в безопасном месте за пределами кластера. После генерации сертификатов узлов ключ следует удалить с узлов кластера.
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

5. Используя CSR и CA, создайте новые пары сертификатов и ключей:

   ```bash
   openssl x509 -req -in chnode1.csr -out chnode1.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
   openssl x509 -req -in chnode2.csr -out chnode2.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
   openssl x509 -req -in chnode3.csr -out chnode3.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
   ```

6. Проверьте сертификаты на предмет субъекта и издателя:

   ```bash
   openssl x509 -in chnode1.crt -text -noout
   ```

7. Убедитесь, что новые сертификаты успешно проверяются по сертификату CA:
   ```bash
   openssl verify -CAfile marsnet_ca.crt chnode1.crt
   chnode1.crt: OK
   ```


## 3. Создание и настройка каталога для хранения сертификатов и ключей {#3-create-and-configure-a-directory-to-store-certificates-and-keys}

:::note
Эти действия необходимо выполнить на каждом узле. Используйте соответствующие сертификаты и ключи для каждого хоста.
:::

1. Создайте папку в каталоге, доступном для ClickHouse, на каждом узле. Рекомендуется использовать каталог конфигурации по умолчанию (например, `/etc/clickhouse-server`):

   ```bash
   mkdir /etc/clickhouse-server/certs
   ```

2. Скопируйте сертификат CA, сертификат узла и ключ, соответствующие каждому узлу, в новый каталог certs.

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


## 4. Настройка окружения с базовыми кластерами с использованием ClickHouse Keeper {#4-configure-the-environment-with-basic-clusters-using-clickhouse-keeper}

Для данного окружения развертывания на каждом узле используются следующие настройки ClickHouse Keeper. Каждый сервер будет иметь свой собственный `<server_id>`. (Например, `<server_id>1</server_id>` для узла `chnode1` и так далее.)

:::note
Рекомендуемый порт для ClickHouse Keeper — `9281`. Однако порт можно изменить, если он уже используется другим приложением в окружении.

Полное описание всех параметров доступно по адресу https://clickhouse.com/docs/operations/clickhouse-keeper/
:::

1. Добавьте следующее внутри тега `<clickhouse>` в файле `config.xml` сервера ClickHouse

   :::note
   Для производственных окружений рекомендуется использовать отдельный файл конфигурации `.xml` в директории `config.d`.
   Дополнительная информация доступна по адресу https://clickhouse.com/docs/operations/configuration-files/
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

2. Раскомментируйте и обновите настройки keeper на всех узлах, установив флаг `<secure>` в значение 1:

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
   В данной конфигурации настроен только один пример кластера. Тестовые примеры кластеров должны быть либо удалены, либо закомментированы. Если тестируется существующий кластер, необходимо обновить порт и добавить параметр `<secure>`. Параметры `<user>` и `<password>` должны быть установлены, если пользователь `default` был изначально настроен с паролем при установке или в файле `users.xml`.
   :::

   Следующая конфигурация создает кластер с одним шардом и двумя репликами на двух серверах (по одной на каждом узле).

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


4. Определите значения макросов, чтобы создать таблицу ReplicatedMergeTree для тестирования. На `chnode1`:
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



## 5. Настройка интерфейсов SSL/TLS на узлах ClickHouse {#5-configure-ssl-tls-interfaces-on-clickhouse-nodes}

Приведенные ниже параметры настраиваются в файле `config.xml` сервера ClickHouse

1.  Задайте отображаемое имя для развертывания (необязательно):

    ```xml
    <display_name>clickhouse</display_name>
    ```

2.  Настройте ClickHouse на прослушивание внешних портов:

    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3.  Настройте порт `https` и отключите порт `http` на каждом узле:

    ```xml
    <https_port>8443</https_port>
    <!--<http_port>8123</http_port>-->
    ```

4.  Настройте защищенный TCP-порт ClickHouse Native и отключите стандартный незащищенный порт на каждом узле:

    ```xml
    <tcp_port_secure>9440</tcp_port_secure>
    <!--<tcp_port>9000</tcp_port>-->
    ```

5.  Настройте порт `interserver https` и отключите стандартный незащищенный порт на каждом узле:

    ```xml
    <interserver_https_port>9010</interserver_https_port>
    <!--<interserver_http_port>9009</interserver_http_port>-->
    ```

6.  Настройте OpenSSL, указав сертификаты и пути к ним

    :::note
    Каждое имя файла и путь должны соответствовать узлу, на котором выполняется настройка.
    Например, измените запись `<certificateFile>` на `chnode2.crt` при настройке на хосте `chnode2`.
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

    Дополнительная информация: https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-openssl

7.  Настройте gRPC для работы с SSL на каждом узле:

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

    Дополнительная информация: https://clickhouse.com/docs/interfaces/grpc/

8.  Настройте клиент ClickHouse как минимум на одном из узлов для использования SSL при подключениях в его собственном файле `config.xml` (по умолчанию расположен в `/etc/clickhouse-client/`):
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


6. Отключите порты эмуляции MySQL и PostgreSQL, заданные по умолчанию:
    ```xml
    <!--mysql_port>9004</mysql_port-->
    <!--postgresql_port>9005</postgresql_port-->
    ```



## 6. Тестирование {#6-testing}

1. Запустите все узлы по одному:

   ```bash
   service clickhouse-server start
   ```

2. Убедитесь, что защищенные порты запущены и находятся в режиме прослушивания. Результат должен быть похож на этот пример на каждом узле:

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

   | Порт ClickHouse | Описание                                  |
   | --------------- | ----------------------------------------- |
   | 8443            | интерфейс https                           |
   | 9010            | межсерверный порт https                   |
   | 9281            | защищенный порт ClickHouse Keeper         |
   | 9440            | защищенный нативный протокол TCP          |
   | 9444            | порт Raft ClickHouse Keeper               |

3. Проверьте работоспособность ClickHouse Keeper
   Стандартные команды [из четырех букв (4lW)](/guides/sre/keeper/index.md#four-letter-word-commands) не будут работать при использовании `echo` без TLS. Вот как использовать эти команды с `openssl`.
   - Запустите интерактивный сеанс с `openssl`


```bash
  openssl s_client -connect chnode1.marsnet.local:9281
```

```response
CONNECTED(00000003)
depth=0 CN = chnode1
ошибка проверки:num=20:не удалось получить сертификат локального издателя
результат проверки:1
depth=0 CN = chnode1
ошибка проверки:num=21:не удалось проверить первый сертификат
результат проверки:1
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

* Отправьте команды 4LW в сеансе OpenSSL

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

4. Запустите клиент ClickHouse с флагом `--secure` и SSL‑портом:
   ```bash
   root@chnode1:/etc/clickhouse-server# clickhouse-client --user default --password ClickHouse123! --port 9440 --secure --host chnode1.marsnet.local
   ClickHouse client version 22.3.3.44 (official build).
   Connecting to chnode1.marsnet.local:9440 as user default.
   Connected to ClickHouse server version 22.3.3 revision 54455.

   clickhouse :)
   ```

5. Войдите в интерфейс Play, используя `https` по адресу `https://chnode1.marsnet.local:8443/play`.

   <Image img={configuringSsl01} alt="Настройка SSL" size="md" border />

   :::note
   браузер отобразит недоверенный сертификат, поскольку доступ осуществляется с рабочей станции, а сертификаты отсутствуют в хранилищах корневых центров сертификации на клиентской машине.
   При использовании сертификатов, выданных публичным удостоверяющим центром или корпоративным ЦС, сертификат будет отображаться как доверенный.
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

7. Добавьте несколько строк на `chnode1`:
   ```sql
   INSERT INTO repl_table
   (id, column1, column2)
   VALUES
   (1,'2022-04-01','abc'),
   (2,'2022-04-02','def');
   ```


8. Проверьте репликацию, просмотрев строки таблицы на `chnode2`:
    ```sql
    SELECT * FROM repl_table
    ```

    ```response
    ┌─id─┬────column1─┬─column2─┐
    │  1 │ 2022-04-01 │ abc     │
    │  2 │ 2022-04-02 │ def     │
    └────┴────────────┴─────────┘
    ```



## Резюме {#summary}

В данной статье рассматривалась настройка окружения ClickHouse с использованием SSL/TLS. Параметры будут различаться в зависимости от требований производственных сред, например: уровни проверки сертификатов, протоколы, шифры и т. д. Теперь вы должны иметь чёткое представление о шагах, необходимых для настройки и реализации защищённых соединений.
