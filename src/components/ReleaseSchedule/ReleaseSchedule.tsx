import React from 'react';
import styles from './ReleaseSchedule.module.css';

type ProgressStatus = 'green' | 'orange' | 'red';

interface ReleaseRow {
  version: string;
  changelog_link?: string;
  fast_date: string;
  regular_date: string;
  slow_date: string;
  fast_delay_note?: string;
  regular_delay_note?: string;
  slow_delay_note?: string;
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
  note,
  status,
}: {
  date: string;
  note?: string;
  status: ProgressStatus;
}) => {
  return (
    <div className={styles.statusCell}>
      <StatusIndicator status={status} />
      <span>{date}</span>
      {note && (
        <div className={styles.tooltipContainer}>
          <span className={styles.infoIcon}>i</span>
          <span className={styles.tooltip}>{note}</span>
        </div>
      )}
    </div>
  );
};

export default function ReleaseSchedule({ releases }: ReleaseScheduleProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Version</th>
            <th>Fast Channel (Estimated)</th>
            <th>Regular Channel (Estimated)</th>
            <th>Slow Channel (Estimated)</th>
          </tr>
        </thead>
        <tbody>
          {releases.map((release, index) => (
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
              <td>
                <DateCell
                  date={release.fast_date}
                  note={release.fast_delay_note}
                  status={release.fast_progress}
                />
              </td>
              <td>
                <DateCell
                  date={release.regular_date}
                  note={release.regular_delay_note}
                  status={release.regular_progress}
                />
              </td>
              <td>
                <DateCell
                  date={release.slow_date}
                  note={release.slow_delay_note}
                  status={release.slow_progress}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
