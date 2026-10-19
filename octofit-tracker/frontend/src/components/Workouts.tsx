import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  const [items, setItems] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const userEmail = encodeURIComponent('mona@example.com');

  useEffect(() => {
    let active = true;

    getJson<{ suggestions: Record<string, unknown>[] }>(`/api/workouts/suggestions/${userEmail}`)
      .then((result) => {
        if (active) {
          setItems(result.suggestions ?? []);
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
  }, [userEmail]);

  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." items={items} error={error} loading={loading} emptyMessage="No workout suggestions yet." />;
}
