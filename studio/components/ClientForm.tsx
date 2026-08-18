import type { Client } from '@prisma/client';
import { CLIENT_STATUSES, PLANS } from '@/lib/domain';

/**
 * Used for both create and edit — the only difference is the action passed in
 * and the hidden id. Business name is the one required field; a prospect from a
 * cold call often has nothing else attached yet, and forcing more would just
 * mean it never gets entered.
 */
export function ClientForm({
  action,
  client,
  submitLabel,
}: {
  action: (form: FormData) => void | Promise<void>;
  client?: Client;
  submitLabel: string;
}) {
  return (
    <form action={action} className="card card-pad">
      {client && <input type="hidden" name="id" value={client.id} />}

      <div className="field">
        <label htmlFor="businessName">Business name</label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          required
          defaultValue={client?.businessName ?? ''}
          placeholder="Durham Roofing Co."
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="contactName">Contact name</label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            defaultValue={client?.contactName ?? ''}
          />
        </div>
        <div className="field">
          <label htmlFor="location">
            Location <span className="hint">(service area)</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={client?.location ?? ''}
            placeholder="Oshawa, ON"
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={client?.email ?? ''} />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" defaultValue={client?.phone ?? ''} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="plan">Package</label>
          <select id="plan" name="plan" defaultValue={client?.plan ?? ''}>
            <option value="">Not decided</option>
            {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((key) => (
              <option key={key} value={key}>
                {PLANS[key].label} — {PLANS[key].summary}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={client?.status ?? 'PROSPECT'}>
            {(Object.keys(CLIENT_STATUSES) as (keyof typeof CLIENT_STATUSES)[]).map((key) => (
              <option key={key} value={key}>
                {CLIENT_STATUSES[key].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="notes">
          Notes <span className="hint">(what they sell, what they asked for, anything odd)</span>
        </label>
        <textarea id="notes" name="notes" defaultValue={client?.notes ?? ''} />
      </div>

      <div className="btn-row">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
        <a href={client ? `/clients/${client.id}` : '/'} className="btn btn-secondary">
          Cancel
        </a>
      </div>
    </form>
  );
}
