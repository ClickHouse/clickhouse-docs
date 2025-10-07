---
slug: '/operations/external-authenticators/ldap'
description: 'Руководство по настройке аутентификации LDAP для ClickHouse'
title: LDAP
doc_type: reference
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAP-сервер может быть использован для аутентификации пользователей ClickHouse. Существуют два разных подхода для этого:

- Использовать LDAP в качестве внешнего аутентификатора для существующих пользователей, которые определены в `users.xml` или в локальных путях контроля доступа.
- Использовать LDAP в качестве внешнего каталога пользователей и разрешить аутентификацию локально не определённых пользователей, если они существуют на LDAP-сервере.

Для обоих этих подходов необходимо определить внутренне именованный LDAP-сервер в конфигурации ClickHouse, чтобы другие части конфигурации могли ссылаться на него.

## Определение LDAP-сервера {#ldap-server-definition}

Чтобы определить LDAP-сервер, необходимо добавить раздел `ldap_servers` в `config.xml`.

**Пример**

```xml
<clickhouse>
    <!- ... -->
    <ldap_servers>
        <!- Typical LDAP server. -->
        <my_ldap_server>
            <host>localhost</host>
            <port>636</port>
            <bind_dn>uid={user_name},ou=users,dc=example,dc=com</bind_dn>
            <verification_cooldown>300</verification_cooldown>
            <enable_tls>yes</enable_tls>
            <tls_minimum_protocol_version>tls1.2</tls_minimum_protocol_version>
            <tls_require_cert>demand</tls_require_cert>
            <tls_cert_file>/path/to/tls_cert_file</tls_cert_file>
            <tls_key_file>/path/to/tls_key_file</tls_key_file>
            <tls_ca_cert_file>/path/to/tls_ca_cert_file</tls_ca_cert_file>
            <tls_ca_cert_dir>/path/to/tls_ca_cert_dir</tls_ca_cert_dir>
            <tls_cipher_suite>ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:AES256-GCM-SHA384</tls_cipher_suite>
        </my_ldap_server>

        <!- Typical Active Directory with configured user DN detection for further role mapping. -->
        <my_ad_server>
            <host>localhost</host>
            <port>389</port>
            <bind_dn>EXAMPLE\{user_name}</bind_dn>
            <user_dn_detection>
                <base_dn>CN=Users,DC=example,DC=com</base_dn>
                <search_filter>(&amp;(objectClass=user)(sAMAccountName={user_name}))</search_filter>
            </user_dn_detection>
            <enable_tls>no</enable_tls>
        </my_ad_server>
    </ldap_servers>
</clickhouse>
```

Обратите внимание, что вы можете определить несколько LDAP-серверов внутри раздела `ldap_servers`, используя разные имена.

**Параметры**

- `host` — Имя хоста или IP LDAP-сервера, этот параметр обязателен и не может быть пустым.
- `port` — Порт LDAP-сервера, по умолчанию `636`, если `enable_tls` установлен в `true`, иначе `389`.
- `bind_dn` — Шаблон, используемый для построения DN для привязки.
  - Полученный DN будет построен путём замены всех подстрок `{user_name}` в шаблоне на фактическое имя пользователя во время каждой попытки аутентификации.
- `user_dn_detection` — Раздел с параметрами поиска LDAP для обнаружения фактического DN пользователя, к которому выполнена привязка.
  - Это в основном используется в фильтрах поиска для дальнейшего сопоставления ролей, когда сервер является Active Directory. Полученный DN пользователя будет использоваться при замене подстрок `{user_dn}` там, где это допускается. По умолчанию DN пользователя устанавливается равным DN привязки, но после выполнения поиска он будет обновлён фактическим обнаруженным значением DN пользователя.
    - `base_dn` — Шаблон, используемый для построения базового DN для поиска LDAP.
      - Полученный DN будет построен путём замены всех подстрок `{user_name}` и `{bind_dn}` в шаблоне на фактическое имя пользователя и DN привязки во время поиска LDAP.
    - `scope` — Область поиска LDAP.
      - Допустимые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).
    - `search_filter` — Шаблон, используемый для построения фильтра поиска для поиска LDAP.
      - Полученный фильтр будет построен путём замены всех подстрок `{user_name}`, `{bind_dn}` и `{base_dn}` в шаблоне на фактическое имя пользователя, DN привязки и базовый DN во время поиска LDAP.
      - Обратите внимание, что специальные символы должны быть правильно экранированы в XML.
- `verification_cooldown` — Период времени в секундах после успешной попытки привязки, в течение которого пользователь будет считаться успешно аутентифицированным для всех последовательных запросов без обращения к LDAP-серверу.
  - Укажите `0` (по умолчанию), чтобы отключить кэширование и принудительно обращаться к LDAP-серверу для каждого запроса на аутентификацию.
- `enable_tls` — Флаг, указывающий на использование защищенного соединения с LDAP-сервером.
  - Укажите `no` для протокола в открытом тексте `ldap://` (не рекомендуется).
  - Укажите `yes` для протокола LDAP через SSL/TLS `ldaps://` (рекомендуется, по умолчанию).
  - Укажите `starttls` для устаревшего протокола StartTLS (протокол в открытом тексте `ldap://`, обновлённый до TLS).
- `tls_minimum_protocol_version` — Минимальная версия протокола SSL/TLS.
  - Допустимые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).
- `tls_require_cert` — Поведение проверки сертификата экземпляра SSL/TLS.
  - Допустимые значения: `never`, `allow`, `try`, `demand` (по умолчанию).
- `tls_cert_file` — Путь к файлу сертификата.
- `tls_key_file` — Путь к файлу ключа сертификата.
- `tls_ca_cert_file` — Путь к файлу сертификата CA.
- `tls_ca_cert_dir` — Путь к директории, содержащей сертификаты CA.
- `tls_cipher_suite` — Разрешённый набор шифров (в нотации OpenSSL).

## Внешний аутентификатор LDAP {#ldap-external-authenticator}

Удалённый LDAP-сервер может быть использован в качестве метода проверки паролей для локально определённых пользователей (пользователей, определённых в `users.xml` или в локальных путях контроля доступа). Для этого укажите ранее определённое имя LDAP-сервера вместо `password` или подобных разделов в определении пользователя.

При каждой попытке входа ClickHouse пытается "привязаться" к указанному DN, определённому параметром `bind_dn` в [определении LDAP-сервера](#ldap-server-definition), используя предоставленные учетные данные, и, если это успешно, пользователь считается аутентифицированным. Это часто называется методом "простой привязки".

**Пример**

```xml
<clickhouse>
    <!- ... -->
    <users>
        <!- ... -->
        <my_user>
            <!- ... -->
            <ldap>
                <server>my_ldap_server</server>
            </ldap>
        </my_user>
    </users>
</clickhouse>
```

Обратите внимание, что пользователь `my_user` ссылается на `my_ldap_server`. Этот LDAP-сервер должен быть настроен в основном файле `config.xml`, как описано ранее.

Когда включен SQL-управляемый [Контроль доступа и управление учетными записями](/operations/access-rights#access-control-usage), пользователи, аутентифицированные с помощью LDAP-серверов, также могут быть созданы с использованием оператора [CREATE USER](/sql-reference/statements/create/user).

Запрос:

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```

## Внешний каталог пользователей LDAP {#ldap-external-user-directory}

В дополнение к локально определённым пользователям удалённый LDAP-сервер может использоваться как источник определений пользователей. Для этого укажите ранее определённое имя LDAP-сервера (см. [Определение LDAP-сервера](#ldap-server-definition)) в разделе `ldap` внутри секции `users_directories` в файле `config.xml`.

При каждой попытке входа ClickHouse пытается найти определение пользователя локально и аутентифицировать его как обычно. Если пользователь не определён, ClickHouse предположит, что определение существует в внешнем LDAP-каталоге и попытается "привязаться" к указанному DN на LDAP-сервере с использованием предоставленных учётных данных. Если это удастся, пользователя будет считаться существующим и аутентифицированным. Пользователю будут назначены роли из списка, указанного в разделе `roles`. Кроме того, можно выполнить LDAP "поиск", и результаты могут быть преобразованы и рассматриваться как имена ролей, которые затем могут быть назначены пользователю, если также настроен раздел `role_mapping`. Всё это подразумевает, что SQL-управляемый [Контроль доступа и управление учетными записями](/operations/access-rights#access-control-usage) включен и роли создаются с использованием оператора [CREATE ROLE](/sql-reference/statements/create/role).

**Пример**

Идет в `config.xml`.

```xml
<clickhouse>
    <!- ... -->
    <user_directories>
        <!- Typical LDAP server. -->
        <ldap>
            <server>my_ldap_server</server>
            <roles>
                <my_local_role1 />
                <my_local_role2 />
            </roles>
            <role_mapping>
                <base_dn>ou=groups,dc=example,dc=com</base_dn>
                <scope>subtree</scope>
                <search_filter>(&amp;(objectClass=groupOfNames)(member={bind_dn}))</search_filter>
                <attribute>cn</attribute>
                <prefix>clickhouse_</prefix>
            </role_mapping>
        </ldap>

        <!- Typical Active Directory with role mapping that relies on the detected user DN. -->
        <ldap>
            <server>my_ad_server</server>
            <role_mapping>
                <base_dn>CN=Users,DC=example,DC=com</base_dn>
                <attribute>CN</attribute>
                <scope>subtree</scope>
                <search_filter>(&amp;(objectClass=group)(member={user_dn}))</search_filter>
                <prefix>clickhouse_</prefix>
            </role_mapping>
        </ldap>
    </user_directories>
</clickhouse>
```

Обратите внимание, что `my_ldap_server`, упомянутый в разделе `ldap` внутри секции `user_directories`, должен быть ранее определённым LDAP-сервером, который настроен в `config.xml` (см. [Определение LDAP-сервера](#ldap-server-definition)).

**Параметры**

- `server` — Одно из имён серверов LDAP, определённых в разделе конфигурации `ldap_servers` выше. Этот параметр обязателен и не может быть пустым.
- `roles` — Раздел со списком локально определённых ролей, которые будут назначены каждому пользователю, полученному с LDAP-сервера.
  - Если роли не указаны здесь или не назначены во время сопоставления ролей (ниже), пользователь не сможет выполнять никакие действия после аутентификации.
- `role_mapping` — Раздел с параметрами поиска LDAP и правилами сопоставления.
  - Когда пользователь проходит аутентификацию, будучи ещё привязанным к LDAP, выполняется поиск LDAP с использованием `search_filter` и имени вошедшего пользователя. Для каждой записи, найденной в ходе этого поиска, извлекается значение указанного атрибута. Для каждого значения атрибута, имеющего заданный префикс, префикс удаляется, и остальная часть значения становится именем локальной роли, определённой в ClickHouse, которую ожидается создать заранее с помощью оператора [CREATE ROLE](/sql-reference/statements/create/role).
  - Может быть определено несколько секций `role_mapping` внутри одного и того же раздела `ldap`. Все они будут применены.
    - `base_dn` — Шаблон, используемый для построения базового DN для поиска LDAP.
      - Полученный DN будет построен путём замены всех подстрок `{user_name}`, `{bind_dn}` и `{user_dn}` в шаблоне на фактическое имя пользователя, DN привязки и DN пользователя во время каждого поиска LDAP.
    - `scope` — Область поиска LDAP.
      - Допустимые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).
    - `search_filter` — Шаблон, используемый для построения фильтра поиска для поиска LDAP.
      - Полученный фильтр будет построен путём замены всех подстрок `{user_name}`, `{bind_dn}`, `{user_dn}` и `{base_dn}` в шаблоне на фактическое имя пользователя, DN привязки, DN пользователя и базовый DN во время каждого поиска LDAP.
      - Обратите внимание, что специальные символы должны быть правильно экранированы в XML.
    - `attribute` — Имя атрибута, значения которого будут возвращены при поиске LDAP. По умолчанию `cn`.
    - `prefix` — Префикс, который ожидается перед каждой строкой в исходном списке строк, возвращённых при поиске LDAP. Префикс будет удалён из оригинальных строк, и полученные строки будут рассматриваться как имена локальных ролей. По умолчанию пустой.