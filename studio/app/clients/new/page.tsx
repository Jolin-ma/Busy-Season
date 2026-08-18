import { createClient } from '@/app/actions';
import { ClientForm } from '@/components/ClientForm';

export default function NewClientPage() {
  return (
    <main style={{ maxWidth: '46rem' }}>
      <div className="page-head">
        <div>
          <p className="eyebrow">
            <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              ← Clients
            </a>
          </p>
          <h1>Add a client</h1>
          <p>Only the business name is required — fill in the rest as you learn it.</p>
        </div>
      </div>

      <ClientForm action={createClient} submitLabel="Add client" />
    </main>
  );
}
