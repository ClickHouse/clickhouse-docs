---
date: 2023-06-07
---

# How to configure cap_ipc_lock and cap_sys_nice capabilities in Docker

## Question

When running ClickHouse in Docker, Docker is complaining about the lack of `CAP_IPC_LOCK` and `CAP_SYS_NICE` capabilities in the system. How can I resolve it?

Here is what the no `CAP_SYS_NICE` or `CAP_SYS_NICE` capability log messages look like:

```bash
docker run -d --name clickhouse-server \
    --ulimit nofile=262144:262144 \
    --network clickhouse-net \
    -p 8123:8123 -p 9000:9000 -p 9009:9009 -p 9363:9363 \
    clickhouse/clickhouse-server:23.2
```

```response
2023.04.19 08:04:10.022720 [ 1 ] {} <Information> Application: It looks like the process has no CAP_IPC_LOCK capability, binary mlock will be disabled. It could happen due to incorrect ClickHouse package installation. You could resolve the problem manually with 'sudo setcap cap_ipc_lock=+ep /usr/bin/clickhouse'. Note that it will not work on 'nosuid' mounted filesystems.

2023.04.19 08:04:10.065860 [ 1 ] {} <Information> Application: It looks like the process has no CAP_SYS_NICE capability, the setting 'os_thread_priority' will have no effect. It could happen due to incorrect ClickHouse package installation. You could resolve the problem manually with 'sudo setcap cap_sys_nice=+ep /usr/bin/clickhouse'. Note that it will not work on 'nosuid' mounted filesystems.
```

## Answer

1. Add two `--cap-add` arguments to provide the container with the `IPC_LOCK` and `SYS_NICE` capabilities:

```bash
docker run -d --name clickhouse-server \
   --cap-add=SYS_NICE \
   --cap-add=IPC_LOCK \
   --ulimit nofile=262144:262144 \
   --network clickhouse-net \
   -p 8123:8123 -p 9000:9000 -p 9009:9009 -p 9363:9363 \
   clickhouse/clickhouse-server:23.2
```

2. Check that the capabilities are visible in the container using the following command:

```bash
apt-get update > /dev/null && apt-get install -y libcap2-bin > /dev/null && capsh --print
```

The response is similar to:

```response
debconf: delaying package configuration, since apt-utils is not installed
WARNING: libcap needs an update (cap=40 should have a name).
Current: = cap_chown,cap_dac_override,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_ipc_lock,cap_sys_chroot,cap_sys_nice,cap_mknod,cap_audit_write,cap_setfcap+ep
Bounding set =cap_chown,cap_dac_override,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_ipc_lock,cap_sys_chroot,cap_sys_nice,cap_mknod,cap_audit_write,cap_setfcap
Ambient set =
Securebits: 00/0x0/1'b0
 secure-noroot: no (unlocked)
 secure-no-suid-fixup: no (unlocked)
 secure-keep-caps: no (unlocked)
 secure-no-ambient-raise: no (unlocked)
uid=0(root) euid=0(root)
gid=0(root)
groups=0(root)
Guessed mode: UNCERTAIN (0)
```

3. Manually set both the capabilities for ClickHouse

```bash
setcap "cap_ipc_lock=+ep cap_sys_nice=+ep" /usr/bin/clickhouse
```

4. Check that the capabilities are applied.

```bash
getcap -v /usr/bin/clickhouse
```

You should see the following:

```response
/usr/bin/clickhouse = cap_ipc_lock,cap_sys_nice+ep
```

5. Restart the ClickHouse server and the log messages should not be shown.

<br/>

Check out this [article on Linux capabilities](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities) for more details.
