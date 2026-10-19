import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Props = {
  title: string;
  description: string;
  endpoint: string;
  dataKey: string;
  emptyMessage: string;
};

function displayValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(displayValue).join(', ');
  if (value !== null && typeof value === 'object') return JSON.stringify(value);
  return String(value ?? '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function CapabilityCard({ title, description, endpoint, dataKey, emptyMessage }: Props) {
  const [items, setItems] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<Record<string, unknown>>(endpoint)
      .then((result) => {
        const data = result[dataKey];
        if (!Array.isArray(data) || !data.every(isRecord)) throw new Error(`Invalid ${title.toLowerCase()} response`);
        if (active) setItems(data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'An unexpected error occurred');
      });

    return () => {
      active = false;
    };
  }, [dataKey, endpoint, title]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error ? (
          <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>
        ) : items === null ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : items.length === 0 ? (
          <p role="status">{emptyMessage}</p>
        ) : (
          <ul className="list-group">
            {items.map((item, index) => (
              <li className="list-group-item" key={String(item._id ?? item.id ?? index)}>
                {Object.entries(item)
                  .filter(([key]) => key !== '_id' && key !== '__v')
                  .map(([key, value]) => (
                    <span className="me-3" key={key}>
                      {key}: {displayValue(value)}
                    </span>
                  ))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
