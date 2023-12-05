---
sidebar_position: 1
title: How to check users assigned to roles and viceversa?
date: 2023-09-07
---

### Question

How to check users assigned to roles and viceversa?


### Answer

```sql
-- LOGGED IN AS default (admin privileges)

clickhouse-cloud :) SELECT user()

SELECT user()

Query id: 9bc02d8b-ab05-4a63-b2dd-3e0093f36d31

┌─currentUser()─┐
│ default       │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.



-- create user 'foo'

clickhouse-cloud :) CREATE USER foo IDENTIFIED WITH sha256_password BY 'secretPassword123!'

CREATE USER foo IDENTIFIED WITH sha256_hash BY '4338B66A5F04244574CB9C872829F1FD8F696C658EC7A4BD22FEFBBCF331B665' SALT 'C2911CA1E4787227BBD0EBEF43066EF2EC4C54172C1AB3616E88050F2EC13475'

Query id: 9711f5fc-2b5c-43f0-a760-0c67764919a2

Ok.

0 rows in set. Elapsed: 0.102 sec.



-- create user 'bar'

clickhouse-cloud :) CREATE USER bar IDENTIFIED WITH sha256_password BY 'secretPassword123!'

CREATE USER bar IDENTIFIED WITH sha256_hash BY '14A1401822566260191F51BAE85C4740E650E1F9D02DEFFF086CD6A6A8B3164F' SALT '276AE4A32353D579894C83C230775568E501CCD696531EEF0006761D3BEE3F75'

Query id: 11a78bf5-f5e1-4f1d-bfe8-cf2aa0a1b15d

Ok.

0 rows in set. Elapsed: 0.103 sec.



-- create role 'role_a'

clickhouse-cloud :) CREATE ROLE role_a;

CREATE ROLE role_a

Query id: 13ccc007-fa5a-4110-9a05-48e284cea45f

Ok.

0 rows in set. Elapsed: 0.104 sec.



-- create role 'role_b'

clickhouse-cloud :) CREATE ROLE role_b;

CREATE ROLE role_b

Query id: 43f84376-76fa-4cd2-b8e2-2dcfbe41ec1b

Ok.

0 rows in set. Elapsed: 0.103 sec.



-- grant 'role_a' to users 'foo' and 'bar'


clickhouse-cloud :) GRANT role_a to foo,bar

GRANT role_a TO foo, bar

Query id: 4fe91624-efb3-4091-b680-b6905ab445b4

Ok.

0 rows in set. Elapsed: 0.107 sec.



-- grant 'role_b' to user 'bar'

clickhouse-cloud :) GRANT role_b TO bar

GRANT role_b TO bar

Query id: 7ea38b28-2719-4dd6-8abd-0241f7b34d5c

Ok.

0 rows in set. Elapsed: 0.102 sec.



-- What users have assigned 'role_a'?

clickhouse-cloud :) SELECT * FROM system.role_grants WHERE granted_role_name='role_a';

SELECT *
FROM system.role_grants
WHERE granted_role_name = 'role_a'

Query id: bf088776-f450-4150-b2e8-197b400573c1

┌─user_name─┬─role_name─┬─granted_role_name─┬─granted_role_is_default─┬─with_admin_option─┐
│ bar       │ ᴺᵁᴸᴸ      │ role_a            │                       1 │                 0 │
│ foo       │ ᴺᵁᴸᴸ      │ role_a            │                       1 │                 0 │
└───────────┴───────────┴───────────────────┴─────────────────────────┴───────────────────┘

2 rows in set. Elapsed: 0.001 sec.



-- What roles are assigned to users 'foo' and 'bar'?

clickhouse-cloud :) SELECT * FROM system.role_grants WHERE user_name IN ('foo','bar');

SELECT *
FROM system.role_grants
WHERE user_name IN ('foo', 'bar')

Query id: b81dbe1c-42f0-43bd-b237-1a6b1d81ae3d

┌─user_name─┬─role_name─┬─granted_role_name─┬─granted_role_is_default─┬─with_admin_option─┐
│ bar       │ ᴺᵁᴸᴸ      │ role_b            │                       1 │                 0 │
│ bar       │ ᴺᵁᴸᴸ      │ role_a            │                       1 │                 0 │
│ foo       │ ᴺᵁᴸᴸ      │ role_a            │                       1 │                 0 │
└───────────┴───────────┴───────────────────┴─────────────────────────┴───────────────────┘

3 rows in set. Elapsed: 0.001 sec.



-- logged in as user 'foo'

clickhouse-cloud :) SELECT user()

SELECT user()

Query id: eee6eaaa-11bc-42c1-9258-fa3079ee6f80

┌─currentUser()─┐
│ foo           │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.

clickhouse-cloud :) SHOW CURRENT ROLES

SHOW CURRENT ROLES

Query id: aa6a1ac1-3502-4960-bb34-f7d9f0d7986e

┌─role_name─┬─with_admin_option─┬─is_default─┐
│ role_a    │                 0 │          1 │
└───────────┴───────────────────┴────────────┘

1 row in set. Elapsed: 0.002 sec.



-- logged in as user 'bar'

clickhouse-cloud :) SELECT user()

SELECT user()

Query id: fa9ba47f-efcf-4491-9b4e-2f1130dfa84b

┌─currentUser()─┐
│ bar           │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.

clickhouse-cloud :) SHOW CURRENT ROLES

SHOW CURRENT ROLES

Query id: fb3f2941-a8ce-481d-8fad-b775bfc5b532

┌─role_name─┬─with_admin_option─┬─is_default─┐
│ role_a    │                 0 │          1 │
│ role_b    │                 0 │          1 │
└───────────┴───────────────────┴────────────┘

2 rows in set. Elapsed: 0.001 sec.
```

