import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export default function Activities() {
  const [items, setItems] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getJson<{ activities: Record<string, unknown>[] }>('/api/activities')
      .then((result) => {
        if (active) {
          setItems(result.activities ?? []);
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

  return <CapabilityCard title="Activities" description="Track student activity minutes and points." items={items} error={error} loading={loading} emptyMessage="No activities yet." />;
}
