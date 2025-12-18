---
description: 'Документация по SSH-интерфейсу для ClickHouse'
keywords: ['client', 'ssh', 'putty']
sidebar_label: 'SSH-интерфейс'
sidebar_position: 60
slug: /interfaces/ssh
title: 'SSH-интерфейс'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# SSH-интерфейс с PTY {#ssh-interface-with-pty}

<ExperimentalBadge />

<CloudNotSupportedBadge />

## Предисловие {#preface}

Сервер ClickHouse позволяет подключаться к себе напрямую по протоколу SSH. Можно использовать любой клиент.

После создания [пользователя базы данных, идентифицируемого с помощью SSH‑ключа](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys):

```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

Этот ключ позволяет подключиться к серверу ClickHouse. При этом будет открыт псевдотерминал (PTY) с интерактивным сеансом clickhouse-client.

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

Также поддерживается выполнение команд по SSH в неинтерактивном режиме:

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```

## Конфигурация сервера {#server-configuration}

Чтобы включить SSH-сервер, необходимо раскомментировать или добавить следующий раздел в `config.xml`:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>path-to-the-key</host_rsa_key>
   <!--host_ecdsa_key>path-to-the-key</host_ecdsa_key-->
   <!--host_ed25519_key>path-to-the-key</host_ed25519_key-->
</ssh_server>
```

Ключ хоста является неотъемлемой частью протокола SSH. Открытая часть этого ключа хранится в файле `~/.ssh/known_hosts` на стороне клиента и обычно используется для предотвращения атак типа «man-in-the-middle». При первом подключении к серверу вы увидите сообщение, показанное ниже:

```shell
The authenticity of host '[localhost]:9022 ([127.0.0.1]:9022)' can't be established.
RSA key fingerprint is SHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Do.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

На самом деле это означает: &quot;Вы хотите запомнить открытый ключ этого хоста и продолжить подключение?&quot;.

Вы можете передать SSH‑клиенту опцию, чтобы он не проверял хост:

```bash
ssh -o "StrictHostKeyChecking no" user@host
```

## Настройка встроенного клиента {#configuring-embedded-client}

Вы можете передавать параметры встроенному клиенту аналогично тому, как это делается для обычного `clickhouse-client`, но с некоторыми ограничениями.
Поскольку используется протокол SSH, единственный способ передать параметры на целевой хост — через переменные окружения.

Например, параметр `format` можно задать следующим образом:

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

Вы можете менять любые параметры на уровне пользователя таким способом и дополнительно передавать большинство обычных опций `clickhouse-client` (за исключением тех, которые не имеют смысла в этом режиме работы).

Важно:

Если одновременно переданы опция `query` и SSH‑команда, последняя добавляется в список запросов к выполнению:

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
