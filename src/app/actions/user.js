'use server';

import { createClient } from '@/utils/supabase/server';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getUserDashboardData() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Not authenticated' };
  }

  try {
    const [profileRes, riotRes] = await Promise.all([
      query('SELECT * FROM profiles WHERE id = $1 LIMIT 1', [user.id]),
      query('SELECT * FROM user_linked_accounts WHERE user_id = $1 AND provider = $2 LIMIT 1', [user.id, 'riot'])
    ]);

    return {
      user,
      profile: profileRes.rows[0] || null,
      riotAccount: riotRes.rows[0] || null
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { error: error.message };
  }
}

export async function toggleUserNotificationAction(field, value) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Not authenticated' };
  }

  // Sanitize field name to prevent SQL injection
  const allowedFields = ['email_notifications', 'push_notifications'];
  if (!allowedFields.includes(field)) {
    return { error: 'Invalid field' };
  }

  try {
    await query(
      `UPDATE profiles SET ${field} = $1 WHERE id = $2`,
      [Boolean(value), user.id]
    );
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating notification preference:', error);
    return { error: error.message };
  }
}

export async function linkRiotAccountAction(payload) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Not authenticated' };
  }

  const { gameName, tagLine, region } = payload;
  if (!gameName || !tagLine) {
    return { error: 'Game Name and Tag Line are required' };
  }

  try {
    const res = await query(
      `INSERT INTO user_linked_accounts (user_id, provider, game_name, tag_line, region)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, provider) DO UPDATE SET
         game_name = EXCLUDED.game_name,
         tag_line = EXCLUDED.tag_line,
         region = EXCLUDED.region
       RETURNING *`,
      [user.id, 'riot', gameName, tagLine, region || 'kr']
    );

    revalidatePath('/dashboard');
    return { data: res.rows[0] };
  } catch (error) {
    console.error('Error linking Riot account:', error);
    return { error: error.message };
  }
}
