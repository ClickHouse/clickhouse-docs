---
sidebar_position: 1
sidebar_label: 'Beta Features and Experimental'
title: 'Beta and Experimental Features'
description: 'ClickHouse has beta and experimental features. This documentation page discusses definition.'
slug: /beta-and-experimental-features
---

Because ClickHouse is open-source, it receives many contributions not only from ClickHouse employees but also from the community. These contributions are often developed at different speeds; certain features may require a lengthy prototyping phase or more time for sufficient community feedback and iteration to be considered generally available (GA).

Due to the uncertainty of when features are classified as generally available, we delineate features into two categories: **Beta** and **Experimental**.

**Beta** features are officially supported by the ClickHouse team. **Experimental** features are early prototypes driven by either the ClickHouse team or the community and are not officially supported.

The sections below explicitly describe the properties of **Beta** and **Experimental** features:

## Beta Features \{#beta-features}

- Under active development to make them generally available (GA)
- Main known issues can be tracked on GitHub
- Functionality may change in the future
- Possibly enabled in ClickHouse Cloud
- The ClickHouse team supports beta features

The following features are considered Beta in ClickHouse Cloud and are available for use in ClickHouse Cloud Services, even though they may be currently under a ClickHouse SETTING named ```allow_experimental_*```:

Note: please be sure to be using a current version of the ClickHouse [compatibility](/operations/settings/settings#compatibility) setting to be using a recently introduced feature.

## Experimental Features \{#experimental-features}

- May never become GA
- May be removed
- Can introduce breaking changes
- Functionality may change in the feature
- Need to be deliberately enabled
- The ClickHouse team **does not support** experimental features
- May lack important functionality and documentation
- Cannot be enabled in the cloud

Please note: no additional experimental features are allowed to be enabled in ClickHouse Cloud other than those listed above as Beta.


## Experimental settings \{#experimental-settings}

| Name | Default |
|------|--------|
| [allow_experimental_kafka_offsets_storage_in_keeper](/operations/settings/settings#allow_experimental_kafka_offsets_storage_in_keeper) | `0` |
| [allow_experimental_correlated_subqueries](/operations/settings/settings#allow_experimental_correlated_subqueries) | `0` |
| [allow_experimental_materialized_postgresql_table](/operations/settings/settings#allow_experimental_materialized_postgresql_table) | `0` |
| [allow_experimental_funnel_functions](/operations/settings/settings#allow_experimental_funnel_functions) | `0` |
| [allow_experimental_nlp_functions](/operations/settings/settings#allow_experimental_nlp_functions) | `0` |
| [allow_experimental_hash_functions](/operations/settings/settings#allow_experimental_hash_functions) | `0` |
| [allow_experimental_object_type](/operations/settings/settings#allow_experimental_object_type) | `0` |
| [allow_experimental_time_series_table](/operations/settings/settings#allow_experimental_time_series_table) | `0` |
| [allow_experimental_vector_similarity_index](/operations/settings/settings#allow_experimental_vector_similarity_index) | `0` |
| [allow_experimental_codecs](/operations/settings/settings#allow_experimental_codecs) | `0` |
| [max_limit_for_ann_queries](/operations/settings/settings#max_limit_for_ann_queries) | `1000000` |
| [hnsw_candidate_list_size_for_search](/operations/settings/settings#hnsw_candidate_list_size_for_search) | `256` |
| [throw_on_unsupported_query_inside_transaction](/operations/settings/settings#throw_on_unsupported_query_inside_transaction) | `1` |
| [wait_changes_become_visible_after_commit_mode](/operations/settings/settings#wait_changes_become_visible_after_commit_mode) | `wait_unknown` |
| [implicit_transaction](/operations/settings/settings#implicit_transaction) | `0` |
| [grace_hash_join_initial_buckets](/operations/settings/settings#grace_hash_join_initial_buckets) | `1` |
| [grace_hash_join_max_buckets](/operations/settings/settings#grace_hash_join_max_buckets) | `1024` |
| [join_to_sort_minimum_perkey_rows](/operations/settings/settings#join_to_sort_minimum_perkey_rows) | `40` |
| [join_to_sort_maximum_table_rows](/operations/settings/settings#join_to_sort_maximum_table_rows) | `10000` |
| [allow_experimental_join_right_table_sorting](/operations/settings/settings#allow_experimental_join_right_table_sorting) | `0` |
| [allow_statistics_optimize](/operations/settings/settings#allow_statistics_optimize) | `0` |
| [allow_experimental_statistics](/operations/settings/settings#allow_experimental_statistics) | `0` |
| [allow_experimental_inverted_index](/operations/settings/settings#allow_experimental_inverted_index) | `0` |
| [allow_experimental_full_text_index](/operations/settings/settings#allow_experimental_full_text_index) | `0` |
| [allow_experimental_join_condition](/operations/settings/settings#allow_experimental_join_condition) | `0` |
| [allow_experimental_live_view](/operations/settings/settings#allow_experimental_live_view) | `0` |
| [live_view_heartbeat_interval](/operations/settings/settings#live_view_heartbeat_interval) | `15` |
| [max_live_view_insert_blocks_before_refresh](/operations/settings/settings#max_live_view_insert_blocks_before_refresh) | `64` |
| [allow_experimental_window_view](/operations/settings/settings#allow_experimental_window_view) | `0` |
| [window_view_clean_interval](/operations/settings/settings#window_view_clean_interval) | `60` |
| [window_view_heartbeat_interval](/operations/settings/settings#window_view_heartbeat_interval) | `15` |
| [wait_for_window_view_fire_signal_timeout](/operations/settings/settings#wait_for_window_view_fire_signal_timeout) | `10` |
| [stop_refreshable_materialized_views_on_startup](/operations/settings/settings#stop_refreshable_materialized_views_on_startup) | `0` |
| [allow_experimental_database_materialized_postgresql](/operations/settings/settings#allow_experimental_database_materialized_postgresql) | `0` |
| [allow_experimental_query_deduplication](/operations/settings/settings#allow_experimental_query_deduplication) | `0` |
| [allow_experimental_database_iceberg](/operations/settings/settings#allow_experimental_database_iceberg) | `0` |
| [allow_experimental_database_unity_catalog](/operations/settings/settings#allow_experimental_database_unity_catalog) | `0` |
| [allow_experimental_database_glue_catalog](/operations/settings/settings#allow_experimental_database_glue_catalog) | `0` |
| [allow_experimental_kusto_dialect](/operations/settings/settings#allow_experimental_kusto_dialect) | `0` |
| [allow_experimental_prql_dialect](/operations/settings/settings#allow_experimental_prql_dialect) | `0` |
| [enable_adaptive_memory_spill_scheduler](/operations/settings/settings#enable_adaptive_memory_spill_scheduler) | `0` |
| [allow_experimental_delta_kernel_rs](/operations/settings/settings#allow_experimental_delta_kernel_rs) | `0` |
| [make_distributed_plan](/operations/settings/settings#make_distributed_plan) | `0` |
| [execute_distributed_plan_locally](/operations/settings/settings#execute_distributed_plan_locally) | `0` |
| [default_shuffle_join_bucket_count](/operations/settings/settings#default_shuffle_join_bucket_count) | `8` |
| [default_reader_bucket_count](/operations/settings/settings#default_reader_bucket_count) | `8` |
| [optimize_exchanges](/operations/settings/settings#optimize_exchanges) | `0` |
| [force_exchange_kind](/operations/settings/settings#force_exchange_kind) | `` |
| [allow_experimental_ts_to_grid_aggregate_function](/operations/settings/settings#allow_experimental_ts_to_grid_aggregate_function) | `0` |
| [allow_experimental_replacing_merge_with_cleanup](/operations/settings/merge-tree-settings#allow_experimental_replacing_merge_with_cleanup) | `0` |
| [allow_experimental_reverse_key](/operations/settings/merge-tree-settings#allow_experimental_reverse_key) | `0` |
| [enable_replacing_merge_with_cleanup_for_min_age_to_force_merge](/operations/settings/merge-tree-settings#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge) | `0` |
| [force_read_through_cache_for_merges](/operations/settings/merge-tree-settings#force_read_through_cache_for_merges) | `0` |
| [merge_selector_algorithm](/operations/settings/merge-tree-settings#merge_selector_algorithm) | `Simple` |
| [notify_newest_block_number](/operations/settings/merge-tree-settings#notify_newest_block_number) | `0` |
| [part_moves_between_shards_delay_seconds](/operations/settings/merge-tree-settings#part_moves_between_shards_delay_seconds) | `30` |
| [part_moves_between_shards_enable](/operations/settings/merge-tree-settings#part_moves_between_shards_enable) | `0` |
| [remote_fs_zero_copy_path_compatible_mode](/operations/settings/merge-tree-settings#remote_fs_zero_copy_path_compatible_mode) | `0` |
| [remote_fs_zero_copy_zookeeper_path](/operations/settings/merge-tree-settings#remote_fs_zero_copy_zookeeper_path) | `/clickhouse/zero_copy` |
| [remove_rolled_back_parts_immediately](/operations/settings/merge-tree-settings#remove_rolled_back_parts_immediately) | `1` |
| [shared_merge_tree_enable_keeper_parts_extra_data](/operations/settings/merge-tree-settings#shared_merge_tree_enable_keeper_parts_extra_data) | `0` |


## Beta settings \{#beta-settings}

| Name | Default |
|------|--------|
| [allow_remote_fs_zero_copy_replication](/operations/settings/merge-tree-settings#allow_remote_fs_zero_copy_replication) | `0` |
| [allow_experimental_parallel_reading_from_replicas](/operations/settings/settings#allow_experimental_parallel_reading_from_replicas) | `0` |
| [parallel_replicas_mode](/operations/settings/settings#parallel_replicas_mode) | `read_tasks` |
| [parallel_replicas_count](/operations/settings/settings#parallel_replicas_count) | `0` |
| [parallel_replica_offset](/operations/settings/settings#parallel_replica_offset) | `0` |
| [parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key) | `` |
| [parallel_replicas_custom_key_range_lower](/operations/settings/settings#parallel_replicas_custom_key_range_lower) | `0` |
| [parallel_replicas_custom_key_range_upper](/operations/settings/settings#parallel_replicas_custom_key_range_upper) | `0` |
| [cluster_for_parallel_replicas](/operations/settings/settings#cluster_for_parallel_replicas) | `` |
| [parallel_replicas_allow_in_with_subquery](/operations/settings/settings#parallel_replicas_allow_in_with_subquery) | `1` |
| [parallel_replicas_for_non_replicated_merge_tree](/operations/settings/settings#parallel_replicas_for_non_replicated_merge_tree) | `0` |
| [parallel_replicas_min_number_of_rows_per_replica](/operations/settings/settings#parallel_replicas_min_number_of_rows_per_replica) | `0` |
| [parallel_replicas_prefer_local_join](/operations/settings/settings#parallel_replicas_prefer_local_join) | `1` |
| [parallel_replicas_mark_segment_size](/operations/settings/settings#parallel_replicas_mark_segment_size) | `0` |
| [parallel_replicas_local_plan](/operations/settings/settings#parallel_replicas_local_plan) | `1` |
| [parallel_replicas_index_analysis_only_on_coordinator](/operations/settings/settings#parallel_replicas_index_analysis_only_on_coordinator) | `1` |
| [parallel_replicas_only_with_analyzer](/operations/settings/settings#parallel_replicas_only_with_analyzer) | `1` |
| [parallel_replicas_insert_select_local_pipeline](/operations/settings/settings#parallel_replicas_insert_select_local_pipeline) | `0` |
| [session_timezone](/operations/settings/settings#session_timezone) | `` |
| [low_priority_query_wait_time_ms](/operations/settings/settings#low_priority_query_wait_time_ms) | `1000` |
