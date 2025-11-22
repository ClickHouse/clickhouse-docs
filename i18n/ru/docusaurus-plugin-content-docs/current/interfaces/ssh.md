---
description: 'Документация по SSH-интерфейсу ClickHouse'
keywords: ['client', 'ssh', 'putty']
sidebar_label: 'SSH-интерфейс'
sidebar_position: 60
slug: /interfaces/ssh
title: 'SSH-интерфейс'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SSH-интерфейс с псевдотерминалом (PTY)

<ExperimentalBadge/>
<CloudNotSupportedBadge/>



## Предисловие {#preface}

Сервер ClickHouse позволяет подключаться к себе напрямую по протоколу SSH. Допускается использование любого клиента.

После создания [пользователя базы данных с аутентификацией по SSH-ключу](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys):

```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

Вы можете использовать этот ключ для подключения к серверу ClickHouse. При подключении откроется псевдотерминал (PTY) с интерактивной сессией clickhouse-client.

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022
ClickHouse embedded version 25.1.1.1.

ip-10-1-13-116.us-west-2.compute.internal :) SELECT 1;

SELECT 1

Query id: cdd91b7f-215b-4537-b7df-86d19bf63f64

   ┌─1─┐
1. │ 1 │
   └───┘

1 row in set. Elapsed: 0.002 sec.
```

Также поддерживается выполнение команд через SSH (неинтерактивный режим):

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```


## Конфигурация сервера {#server-configuration}

Чтобы включить возможность SSH-сервера, необходимо раскомментировать или добавить следующую секцию в файл `config.xml`:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>path-to-the-key</host_rsa_key>
   <!--host_ecdsa_key>path-to-the-key</host_ecdsa_key-->
   <!--host_ed25519_key>path-to-the-key</host_ed25519_key-->
</ssh_server>
```

Ключ хоста является неотъемлемой частью протокола SSH. Публичная часть этого ключа хранится в файле `~/.ssh/known_hosts` на стороне клиента и обычно требуется для предотвращения атак типа «человек посередине». При первом подключении к серверу вы увидите следующее сообщение:

```shell
The authenticity of host '[localhost]:9022 ([127.0.0.1]:9022)' can't be established.
RSA key fingerprint is SHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Do.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

По сути, это означает: «Хотите ли вы запомнить публичный ключ этого хоста и продолжить подключение?».

Вы можете указать SSH-клиенту не проверять хост, передав следующую опцию:

```bash
ssh -o "StrictHostKeyChecking no" user@host
```


## Настройка встроенного клиента {#configuring-embedded-client}

Вы можете передавать параметры встроенному клиенту так же, как и обычному `clickhouse-client`, но с некоторыми ограничениями.
Поскольку используется протокол SSH, единственный способ передачи параметров на целевой хост — через переменные окружения.

Например, установить параметр `format` можно следующим образом:

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

Таким образом можно изменить любую настройку пользовательского уровня, а также передать большинство обычных параметров `clickhouse-client` (за исключением тех, которые не имеют смысла в данной конфигурации).

Важно:

Если передаются и параметр `query`, и команда SSH, последняя добавляется в список запросов для выполнения:

```bash
ubuntu ip-10-1-13-116@~$ ssh -o SetEnv="format=Pretty query=\"SELECT 2;\"" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 2 ┃
   ┡━━━┩
1. │ 2 │
   └───┘
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```
