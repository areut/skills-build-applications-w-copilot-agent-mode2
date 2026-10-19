import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export default function Leaderboard() {
  const [items, setItems] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getJson<{ leaderboard: Record<string, unknown>[] }>('/api/leaderboard')
      .then((result) => {
        if (active) {
          setItems(result.leaderboard ?? []);
          setLoading(false);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'An unexpected error occurred');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return <CapabilityCard title="Leaderboard" description="Compare team point totals." items={items} error={error} loading={loading} emptyMessage="No leaderboard scores yet." />;
}
