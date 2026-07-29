import React from 'react';
import styles from './ReleaseSchedule.module.css';

type ProgressStatus = 'green' | 'orange' | 'red';

interface ReleaseRow {
  version: string;
  changelog_link?: string;
  fast_start_date: string;
  fast_end_date: string;
  regular_start_date: string;
  regular_end_date: string;
  slow_start_date: string;
  slow_end_date: string;
  fast_progress: ProgressStatus;
  regular_progress: ProgressStatus;
  slow_progress: ProgressStatus;
}

interface ReleaseScheduleProps {
  releases: ReleaseRow[];
}

const StatusIndicator = ({ status }: { status: ProgressStatus }) => {
  const statusClass =
    status === 'green'
      ? styles.statusGreen
      : status === 'orange'
        ? styles.statusOrange
        : styles.statusRed;
  return <span className={`${styles.statusIndicator} ${statusClass}`} />;
};

const DateCell = ({
  date,
  status,
}: {
  date: string;
  status: ProgressStatus;
}) => {
  return (
    <div className={styles.statusCell}>
      <StatusIndicator status={status} />
      <span>{date}</span>
    </div>
  );
};

export default function ReleaseSchedule({ releases }: ReleaseScheduleProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th rowSpan={2}>Version</th>
            <th colSpan={2}>
              <a href="/docs/manage/updates#fast-release-channel-early-upgrades">
                Fast Channel
              </a>
            </th>
            <th colSpan={2}>
              <a href="/docs/manage/updates#regular-release-channel">
                Regular Channel
              </a>
            </th>
            <th colSpan={2}>
              <a href="/docs/manage/updates#slow-release-channel-deferred-upgrades">
                Slow Channel
              </a>
            </th>
          </tr>
          <tr>
            <th>Rollout Start</th>
            <th>Rollout End</th>
            <th>Rollout Start</th>
            <th>Rollout End</th>
            <th>Rollout Start</th>
            <th>Rollout End</th>
          </tr>
        </thead>
        <tbody>
          {releases.map((release, index) => {
            const isCompleted = [
              release.fast_start_date,
              release.fast_end_date,
              release.regular_start_date,
              release.regular_end_date,
              release.slow_start_date,
              release.slow_end_date,
            ].every((date) => date === 'Completed');

            return (
              <tr key={index}>
                <td>
                  {release.changelog_link ? (
                    <a href={release.changelog_link} target="_blank" rel="noopener noreferrer">
                      {release.version}
                    </a>
                  ) : (
                    release.version
                  )}
                </td>
                {isCompleted ? (
                  <td colSpan={6} className={styles.completedCell}>
                    <DateCell date="Completed" status="green" />
                  </td>
                ) : (
                  <>
                    <td>
                      <DateCell
                        date={release.fast_start_date}
                        status={release.fast_progress}
                      />
                    </td>
                    <td>
                      <DateCell
                        date={release.fast_end_date}
                        status={release.fast_progress}
                      />
                    </td>
                    <td>
                      <DateCell
                        date={release.regular_start_date}
                        status={release.regular_progress}
                      />
                    </td>
                    <td>
                      <DateCell
                        date={release.regular_end_date}
                        status={release.regular_progress}
                      />
                    </td>
                    <td>
                      <DateCell
                        date={release.slow_start_date}
                        status={release.slow_progress}
                      />
                    </td>
                    <td>
                      <DateCell
                        date={release.slow_end_date}
                        status={release.slow_progress}
                      />
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
