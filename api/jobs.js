import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'GET') {
      // Get all jobs (including inactive) for admin
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ jobs: jobs || [] });
    }

    if (method === 'POST') {
      // Create new job
      const { title, department, location, type, experience, description, requirements, nice_to_have } = req.body;

      if (!title) return res.status(400).json({ error: 'Job title is required' });

      const { data: job, error } = await supabase
        .from('jobs')
        .insert({
          title,
          department,
          location,
          type,
          experience,
          description,
          requirements,
          nice_to_have,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ job });
    }

    if (method === 'PUT') {
      // Update job
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'Job ID is required' });

      const { data: job, error } = await supabase
        .from('jobs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ job });
    }

    if (method === 'DELETE') {
      // Soft delete — set is_active to false
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Job ID is required' });

      const { error } = await supabase
        .from('jobs')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Jobs API error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
