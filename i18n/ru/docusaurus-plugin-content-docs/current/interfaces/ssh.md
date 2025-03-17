---
slug: /interfaces/ssh
sidebar_label: SSH интерфейс
sidebar_position: 60
keywords: [клиент, ssh, putty]
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SSH интерфейс с PTY

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

## Преамбула {#preface}

Сервер ClickHouse позволяет подключаться к себе напрямую с использованием протокола SSH. Любой клиент допускается.

После создания [пользователя базы данных, идентифицированного по SSH-ключу](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys):
```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

Вы можете использовать этот ключ для подключения к серверу ClickHouse. Это откроет псевдотерминал (PTY) с интерактивной сессией `clickhouse-client`.

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022
ClickHouse встроенная версия 25.1.1.1.

ip-10-1-13-116.us-west-2.compute.internal :) SELECT 1;

SELECT 1

Идентификатор запроса: cdd91b7f-215b-4537-b7df-86d19bf63f64

   ┌─1─┐
1. │ 1 │
   └───┘

1 строка в наборе. Прошло: 0.002 сек.
```

Также поддерживается выполнение команд через SSH (неинтерактивный режим):

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```


## Конфигурация сервера {#server-configuration}

Чтобы включить возможность SSH-сервера, вам нужно раскомментировать или разместить следующий раздел в вашем `config.xml`:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>path-to-the-key</host_rsa_key>
   <!--host_ecdsa_key>path-to-the-key</host_ecdsa_key-->
   <!--host_ed25519_key>path-to-the-key</host_ed25519_key-->
</ssh_server>
```

Ключ хоста является неотъемлемой частью протокола SSH. Публичная часть этого ключа хранится в файле `~/.ssh/known_hosts` на стороне клиента и обычно необходима, чтобы предотвратить атаки типа "человек посередине". При первом подключении к серверу вы увидите следующее сообщение:

```shell
Достоверность хоста '[localhost]:9022 ([127.0.0.1]:9022)' не может быть установлена.
Отпечаток RSA ключа: SHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Do.
Этот ключ не известен под другими именами
Вы уверены, что хотите продолжить подключение (yes/no/[fingerprint])?
```

Это, по сути, означает: "Хотите ли вы запомнить публичный ключ этого хоста и продолжить подключение?".

Вы можете сказать вашему SSH-клиенту не проверять хост, передав опцию:

```bash
ssh -o "StrictHostKeyChecking no" user@host
```

## Конфигурация встроенного клиента {#configuring-embedded-client}

Вы можете передавать параметры встроенному клиенту аналогично обычному `clickhouse-client`, но с некоторыми ограничениями. Поскольку это протокол SSH, единственный способ передать параметры на целевой хост - это через переменные окружения.

Например, установка `format` может быть выполнена следующим образом:

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

Вы можете изменить любую настройку уровня пользователя таким образом и дополнительно передавать большинство обычных параметров `clickhouse-client` (за исключением тех, которые не имеют смысла в этой настройке).

Важно:

В случае, если оба параметра `query` и команда SSH переданы, последняя добавляется в список запросов для выполнения:

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
