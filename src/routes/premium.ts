import { FastifyInstance } from 'fastify';
import { rawPrisma } from '../lib/db';
import { getPending, moderateEntry } from '../guestbookStore';

// ── helpers ───────────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function cors(reply: any) {
  Object.entries(CORS).forEach(([k, v]) => reply.header(k, v));
  return reply;
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER ALL PREMIUM ROUTES
// ─────────────────────────────────────────────────────────────────────────────

export async function premiumRoutes(app: FastifyInstance) {

  // Preflight for all /api/v1/premium routes
  app.options('/api/v1/premium/*', async (_req, reply) =>
    cors(reply).code(204).send()
  );

  // ══════════════════════════════════════════════════════════════════════════
  // 1. GUESTBOOK
  // ══════════════════════════════════════════════════════════════════════════

  // GET  /api/v1/premium/guestbook/:profileId/settings
  app.get<{ Params: { profileId: string } }>(
    '/api/v1/premium/guestbook/:profileId/settings',
    async (req, reply) => {
      const settings = await rawPrisma.guestbookSettings.upsert({
        where:  { profile_id: req.params.profileId },
        create: { profile_id: req.params.profileId },
        update: {},
      });
      return cors(reply).send(settings);
    }
  );

  // PATCH /api/v1/premium/guestbook/:profileId/settings
  // Body: { pre_approval?: boolean; enabled?: boolean }
  app.patch<{
    Params: { profileId: string };
    Body:   { pre_approval?: boolean; enabled?: boolean };
  }>(
    '/api/v1/premium/guestbook/:profileId/settings',
    async (req, reply) => {
      const { pre_approval, enabled } = req.body;
      const settings = await rawPrisma.guestbookSettings.upsert({
        where:  { profile_id: req.params.profileId },
        create: { profile_id: req.params.profileId, pre_approval: pre_approval ?? true, enabled: enabled ?? true },
        update: {
          ...(pre_approval !== undefined && { pre_approval }),
          ...(enabled      !== undefined && { enabled }),
        },
      });
      return cors(reply).send(settings);
    }
  );

  // GET  /api/v1/premium/guestbook/:profileId/pending
  // Returns all unapproved, non-flagged entries for the moderation queue.
  app.get<{ Params: { profileId: string } }>(
    '/api/v1/premium/guestbook/:profileId/pending',
    async (req, reply) => {
      try {
        const entries = await rawPrisma.guestbookEntry.findMany({
          where:   { profile_id: req.params.profileId, is_approved: false, is_flagged: false },
          orderBy: { created_at: 'asc' },
        });
        return cors(reply).send({ entries });
      } catch {
        // DB unavailable — serve from in-memory store
        return cors(reply).send({ entries: getPending(req.params.profileId) });
      }
    }
  );

  // POST /api/v1/premium/guestbook/moderate
  // Body: { entryId: string; action: 'approve' | 'reject' | 'flag' }
  app.post<{ Body: { entryId: string; action: 'approve' | 'reject' | 'flag' } }>(
    '/api/v1/premium/guestbook/moderate',
    async (req, reply) => {
      const { entryId, action } = req.body;
      if (!entryId || !['approve', 'reject', 'flag'].includes(action))
        return cors(reply).code(400).send({ error: 'entryId and action (approve|reject|flag) are required.' });

      const update =
        action === 'approve' ? { is_approved: true,  is_flagged: false } :
        action === 'flag'    ? { is_flagged:  true                      } :
                               { is_approved: false,  is_flagged: true  };

      try {
        const entry = await rawPrisma.guestbookEntry.update({
          where: { id: entryId },
          data:  update,
        });
        return cors(reply).send({ entry });
      } catch {
        // DB unavailable — moderate the in-memory entry
        moderateEntry(entryId, action);
        return cors(reply).send({ status: 'ok' });
      }
    }
  );

  // GET  /api/v1/premium/guestbook/:profileId/trusted
  app.get<{ Params: { profileId: string } }>(
    '/api/v1/premium/guestbook/:profileId/trusted',
    async (req, reply) => {
      const contributors = await rawPrisma.trustedContributor.findMany({
        where:   { profile_id: req.params.profileId },
        orderBy: { added_at: 'desc' },
      });
      return cors(reply).send({ contributors });
    }
  );

  // POST /api/v1/premium/guestbook/:profileId/trusted
  // Body: { email: string; name: string }
  app.post<{
    Params: { profileId: string };
    Body:   { email: string; name: string };
  }>(
    '/api/v1/premium/guestbook/:profileId/trusted',
    async (req, reply) => {
      const { email, name } = req.body;
      if (!email || !name)
        return cors(reply).code(400).send({ error: 'email and name are required.' });

      const contributor = await rawPrisma.trustedContributor.upsert({
        where:  { profile_id_email: { profile_id: req.params.profileId, email } },
        create: { profile_id: req.params.profileId, email, name },
        update: { name },
      });
      return cors(reply).code(201).send({ contributor });
    }
  );

  // DELETE /api/v1/premium/guestbook/:profileId/trusted/:contributorId
  app.delete<{ Params: { profileId: string; contributorId: string } }>(
    '/api/v1/premium/guestbook/:profileId/trusted/:contributorId',
    async (req, reply) => {
      await rawPrisma.trustedContributor.delete({
        where: { id: req.params.contributorId },
      });
      return cors(reply).code(204).send();
    }
  );

  // ══════════════════════════════════════════════════════════════════════════
  // 2. GEOTAGGING & CEMETERY NAVIGATION
  // ══════════════════════════════════════════════════════════════════════════

  // POST /api/v1/premium/navigation/activate
  // Token-based activation — called by the on-site activation HTML page (/activate/:shortId).
  // Accepts the short_id as the activationToken so the activation page never needs
  // to know the internal profile UUID.
  // Body: { activationToken: string; latitude: number; longitude: number; gpsAccuracy?: number }
  // Auth: stub — add session/JWT check before production.
  app.post<{
    Body: { activationToken: string; latitude: number; longitude: number; gpsAccuracy?: number };
  }>(
    '/api/v1/premium/navigation/activate',
    async (req, reply) => {
      const { activationToken, latitude, longitude, gpsAccuracy } = req.body;

      if (!activationToken || latitude === undefined || longitude === undefined)
        return cors(reply).code(400).send({ error: 'activationToken, latitude, and longitude are required.' });

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
        return cors(reply).code(400).send({ error: 'Coordinates out of valid range.' });

      const profile = await rawPrisma.profile.findFirst({
        where: { short_id: activationToken, deleted_at: null },
      });
      if (!profile)
        return cors(reply).code(404).send({ error: 'No profile found for this activation token.' });
      if (profile.plan !== 'PREMIUM')
        return cors(reply).code(403).send({ error: 'GPS activation requires a Premium plan.' });

      const now    = new Date();
      const coords = await rawPrisma.graveCoordinates.upsert({
        where:  { profile_id: profile.id },
        create: {
          profile_id:      profile.id,
          latitude,
          longitude,
          accuracy_radius: gpsAccuracy ?? null,
          pinned_at:       now,
        },
        update: {
          latitude,
          longitude,
          accuracy_radius:   gpsAccuracy ?? null,
          pinned_at:         now,
          // Re-pinning voids the existing micro-nav gate since the position changed.
          micro_nav_enabled: false,
          gate_latitude:     null,
          gate_longitude:    null,
        },
      });
      return cors(reply).code(201).send({ profileId: profile.id, coordinates: coords });
    }
  );

  // GET  /api/v1/premium/navigation/:profileId
  // Returns current coordinates record (null if not yet activated).
  app.get<{ Params: { profileId: string } }>(
    '/api/v1/premium/navigation/:profileId',
    async (req, reply) => {
      const coords = await rawPrisma.graveCoordinates.findUnique({
        where: { profile_id: req.params.profileId },
      });
      return cors(reply).send({ coordinates: coords });
    }
  );

  // POST /api/v1/premium/navigation/:profileId/activate
  // Called once (or on re-pin) from the browser Geolocation API.
  // Body: { latitude, longitude, accuracyRadius? }
  // Auth: must be the profile administrator — enforced via session middleware
  //       (stubbed here; add JWT/session check before production).
  app.post<{
    Params: { profileId: string };
    Body:   { latitude: number; longitude: number; accuracyRadius?: number };
  }>(
    '/api/v1/premium/navigation/:profileId/activate',
    async (req, reply) => {
      const { latitude, longitude, accuracyRadius } = req.body;

      if (latitude === undefined || longitude === undefined)
        return cors(reply).code(400).send({ error: 'latitude and longitude are required.' });

      // Sanity-check coordinate ranges
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
        return cors(reply).code(400).send({ error: 'Coordinates out of valid range.' });

      const now = new Date();
      const coords = await rawPrisma.graveCoordinates.upsert({
        where:  { profile_id: req.params.profileId },
        create: {
          profile_id:      req.params.profileId,
          latitude,
          longitude,
          accuracy_radius: accuracyRadius ?? null,
          pinned_at:       now,
        },
        update: {
          latitude,
          longitude,
          accuracy_radius: accuracyRadius ?? null,
          pinned_at:       now,
          // Reset micro-nav gate on re-pin since the position changed
          micro_nav_enabled: false,
          gate_latitude:     null,
          gate_longitude:    null,
        },
      });
      return cors(reply).code(201).send({ coordinates: coords });
    }
  );

  // PATCH /api/v1/premium/navigation/:profileId/settings
  // Updates only the non-coordinate settings (cemetery name, micro-nav, gate coords).
  // Coordinates themselves can only be set via /activate.
  app.patch<{
    Params: { profileId: string };
    Body: {
      cemetery_name?:    string;
      micro_nav_enabled?: boolean;
      gate_latitude?:    number;
      gate_longitude?:   number;
    };
  }>(
    '/api/v1/premium/navigation/:profileId/settings',
    async (req, reply) => {
      const existing = await rawPrisma.graveCoordinates.findUnique({
        where: { profile_id: req.params.profileId },
      });
      if (!existing)
        return cors(reply).code(404).send({ error: 'Location not activated yet. Complete scan-to-pin first.' });

      const { cemetery_name, micro_nav_enabled, gate_latitude, gate_longitude } = req.body;
      const coords = await rawPrisma.graveCoordinates.update({
        where: { profile_id: req.params.profileId },
        data: {
          ...(cemetery_name     !== undefined && { cemetery_name }),
          ...(micro_nav_enabled !== undefined && { micro_nav_enabled }),
          ...(gate_latitude     !== undefined && { gate_latitude }),
          ...(gate_longitude    !== undefined && { gate_longitude }),
        },
      });
      return cors(reply).send({ coordinates: coords });
    }
  );

  // ── Navigation Waypoints ──────────────────────────────────────────────────
  // Ordered walking instructions for the micro-navigation path.
  // Each waypoint is a human-readable step plus an optional GPS anchor,
  // used in areas where map routing loses accuracy among dense headstone rows.

  // GET  /api/v1/premium/navigation/:profileId/waypoints
  app.get<{ Params: { profileId: string } }>(
    '/api/v1/premium/navigation/:profileId/waypoints',
    async (req, reply) => {
      const waypoints = await rawPrisma.navigationWaypoint.findMany({
        where:   { profile_id: req.params.profileId },
        orderBy: { sort_order: 'asc' },
      });
      return cors(reply).send({ waypoints });
    }
  );

  // POST /api/v1/premium/navigation/:profileId/waypoints
  // Body: { instruction: string; sort_order?: number; latitude?: number; longitude?: number }
  app.post<{
    Params: { profileId: string };
    Body:   { instruction: string; sort_order?: number; latitude?: number; longitude?: number };
  }>(
    '/api/v1/premium/navigation/:profileId/waypoints',
    async (req, reply) => {
      const { instruction, sort_order, latitude, longitude } = req.body;
      if (!instruction)
        return cors(reply).code(400).send({ error: 'instruction is required.' });

      const waypoint = await rawPrisma.navigationWaypoint.create({
        data: {
          profile_id:  req.params.profileId,
          instruction,
          ...(sort_order !== undefined && { sort_order }),
          ...(latitude   !== undefined && { latitude }),
          ...(longitude  !== undefined && { longitude }),
        },
      });
      return cors(reply).code(201).send({ waypoint });
    }
  );

  // PATCH /api/v1/premium/navigation/:profileId/waypoints/:waypointId
  // Body: { instruction?: string; sort_order?: number; latitude?: number; longitude?: number }
  app.patch<{
    Params: { profileId: string; waypointId: string };
    Body:   { instruction?: string; sort_order?: number; latitude?: number; longitude?: number };
  }>(
    '/api/v1/premium/navigation/:profileId/waypoints/:waypointId',
    async (req, reply) => {
      const { instruction, sort_order, latitude, longitude } = req.body;
      const waypoint = await rawPrisma.navigationWaypoint.update({
        where: { id: req.params.waypointId },
        data: {
          ...(instruction !== undefined && { instruction }),
          ...(sort_order  !== undefined && { sort_order }),
          ...(latitude    !== undefined && { latitude }),
          ...(longitude   !== undefined && { longitude }),
        },
      });
      return cors(reply).send({ waypoint });
    }
  );

  // DELETE /api/v1/premium/navigation/:profileId/waypoints/:waypointId
  app.delete<{ Params: { profileId: string; waypointId: string } }>(
    '/api/v1/premium/navigation/:profileId/waypoints/:waypointId',
    async (req, reply) => {
      await rawPrisma.navigationWaypoint.delete({ where: { id: req.params.waypointId } });
      return cors(reply).code(204).send();
    }
  );

  // ══════════════════════════════════════════════════════════════════════════
  // 3. FAMILY TREE
  // ══════════════════════════════════════════════════════════════════════════

  // GET  /api/v1/premium/family-tree/:profileId
  app.get<{ Params: { profileId: string } }>(
    '/api/v1/premium/family-tree/:profileId',
    async (req, reply) => {
      const nodes = await rawPrisma.familyTreeNode.findMany({
        where:   { profile_id: req.params.profileId },
        orderBy: { created_at: 'asc' },
      });
      return cors(reply).send({ nodes });
    }
  );

  // POST /api/v1/premium/family-tree/:profileId
  // Body: { full_name, relation, birth_year?, death_year?, parent_node_id?, linked_profile_id? }
  app.post<{
    Params: { profileId: string };
    Body: {
      full_name:          string;
      relation:           string;
      birth_year?:        number;
      death_year?:        number;
      parent_node_id?:    string;
      linked_profile_id?: string;
    };
  }>(
    '/api/v1/premium/family-tree/:profileId',
    async (req, reply) => {
      const { full_name, relation, birth_year, death_year, parent_node_id, linked_profile_id } = req.body;
      if (!full_name || !relation)
        return cors(reply).code(400).send({ error: 'full_name and relation are required.' });

      const node = await rawPrisma.familyTreeNode.create({
        data: {
          profile_id: req.params.profileId,
          full_name,
          relation:   relation as any,
          ...(birth_year        !== undefined && { birth_year }),
          ...(death_year        !== undefined && { death_year }),
          ...(parent_node_id    !== undefined && { parent_node_id }),
          ...(linked_profile_id !== undefined && { linked_profile_id }),
        },
      });
      return cors(reply).code(201).send({ node });
    }
  );

  // PATCH /api/v1/premium/family-tree/:profileId/:nodeId
  app.patch<{
    Params: { profileId: string; nodeId: string };
    Body: {
      full_name?:         string;
      relation?:          string;
      birth_year?:        number;
      death_year?:        number;
      linked_profile_id?: string;
    };
  }>(
    '/api/v1/premium/family-tree/:profileId/:nodeId',
    async (req, reply) => {
      const { full_name, relation, birth_year, death_year, linked_profile_id } = req.body;
      const node = await rawPrisma.familyTreeNode.update({
        where: { id: req.params.nodeId },
        data: {
          ...(full_name         !== undefined && { full_name }),
          ...(relation          !== undefined && { relation: relation as any }),
          ...(birth_year        !== undefined && { birth_year }),
          ...(death_year        !== undefined && { death_year }),
          ...(linked_profile_id !== undefined && { linked_profile_id }),
        },
      });
      return cors(reply).send({ node });
    }
  );

  // DELETE /api/v1/premium/family-tree/:profileId/:nodeId
  app.delete<{ Params: { profileId: string; nodeId: string } }>(
    '/api/v1/premium/family-tree/:profileId/:nodeId',
    async (req, reply) => {
      await rawPrisma.familyTreeNode.delete({ where: { id: req.params.nodeId } });
      return cors(reply).code(204).send();
    }
  );

  // ══════════════════════════════════════════════════════════════════════════
  // 4. PRIORITY SUPPORT
  // ══════════════════════════════════════════════════════════════════════════

  // GET  /api/v1/premium/support/:profileId/tickets
  app.get<{ Params: { profileId: string } }>(
    '/api/v1/premium/support/:profileId/tickets',
    async (req, reply) => {
      const tickets = await rawPrisma.supportTicket.findMany({
        where:   { profile_id: req.params.profileId },
        orderBy: { created_at: 'desc' },
      });
      return cors(reply).send({ tickets });
    }
  );

  // POST /api/v1/premium/support/:profileId/tickets
  // Body: { user_id, subject, message }
  app.post<{
    Params: { profileId: string };
    Body:   { user_id: string; subject: string; message: string };
  }>(
    '/api/v1/premium/support/:profileId/tickets',
    async (req, reply) => {
      const { user_id, subject, message } = req.body;
      if (!user_id || !subject || !message)
        return cors(reply).code(400).send({ error: 'user_id, subject, and message are required.' });

      // 2-hour SLA deadline starts on creation
      const response_due_at = new Date(Date.now() + 2 * 60 * 60 * 1000);

      const ticket = await rawPrisma.supportTicket.create({
        data: {
          profile_id: req.params.profileId,
          user_id,
          subject,
          message,
          priority:        'PRIORITY',
          response_due_at,
        },
      });
      return cors(reply).code(201).send({ ticket });
    }
  );

  // PATCH /api/v1/premium/support/:profileId/tickets/:ticketId
  // Body: { status: TicketStatus }
  app.patch<{
    Params: { profileId: string; ticketId: string };
    Body:   { status: string };
  }>(
    '/api/v1/premium/support/:profileId/tickets/:ticketId',
    async (req, reply) => {
      const { status } = req.body;
      const now = new Date();
      const ticket = await rawPrisma.supportTicket.update({
        where: { id: req.params.ticketId },
        data:  {
          status: status as any,
          ...(status === 'IN_PROGRESS' && { first_response_at: now }),
          ...(status === 'RESOLVED'    && { resolved_at: now }),
        },
      });
      return cors(reply).send({ ticket });
    }
  );
}
