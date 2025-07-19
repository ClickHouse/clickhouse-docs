---
sidebar_label: 'Glossary'
description: 'This page contains a list of commonly used words and phrases regarding ClickHouse, as well as their definitions.'
title: 'Glossary'
slug: /concepts/glossary
---

# Glossary

## Atomicity {#atomicity}

Atomicity ensures that a transaction (a series of database operations) is treated as a single, indivisible unit. This means that either all operations within the transaction occur, or none do. An example of an atomic transaction is transferring money from one bank account to another. If either step of the transfer fails, the transaction fails, and the money stays in the first account. Atomicity ensures no money is lost or created.

## Cluster {#cluster}

A collection of nodes (servers) that work together to store and process data.

## CMEK {#cmek}

Customer-managed encryption keys (CMEK) allow customers to use their key-management service (KMS) key to encrypt the ClickHouse disk data key and protect their data at rest.

## Dictionary {#dictionary}

A dictionary is a mapping of key-value pairs that is useful for various types of reference lists. It is a powerful feature that allows for the efficient use of dictionaries in queries, which is often more efficient than using a `JOIN` with reference tables.

## Parts {#parts}

A physical file on a disk that stores a portion of the table's data. This is different from a partition, which is a logical division of a table's data that is created using a partition key.

## Replica {#replica}

A copy of the data stored in a ClickHouse database. You can have any number of replicas of the same data for redundancy and reliability. Replicas are used in conjunction with the ReplicatedMergeTree table engine, which enables ClickHouse to keep multiple copies of data in sync across different servers.

## Shard {#shard}

A subset of data. ClickHouse always has at least one shard for your data. If you do not split the data across multiple servers, your data will be stored in one shard. Sharding data across multiple servers can be used to divide the load if you exceed the capacity of a single server.
