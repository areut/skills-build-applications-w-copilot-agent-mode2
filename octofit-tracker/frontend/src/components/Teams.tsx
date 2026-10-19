import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export default function Teams() {
  const [items, setItems] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getJson<{ teams: Record<string, unknown>[] }>('/api/teams')
      .then((result) => {
        if (active) {
          setItems(result.teams ?? []);
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

  return <CapabilityCard title="Teams" description="Manage teams and members." items={items} error={error} loading={loading} emptyMessage="No teams yet." />;
}
