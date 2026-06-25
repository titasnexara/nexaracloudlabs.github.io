import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    // Debug: log env vars presence
    console.log('SUPABASE_URL present:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_KEY present:', !!supabaseKey);
    console.log('SUPABASE_URL value:', supabaseUrl);

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Missing environment variables' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test: list buckets first
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('Buckets:', JSON.stringify(buckets));
    console.log('Buckets error:', bucketsError);

    const { fileName, fileType, fileData } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    const buffer    = Buffer.from(fileData, 'base64');
    const uniqueName = Date.now() + '-' + fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(uniqueName, buffer, {
        contentType: fileType || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', JSON.stringify(uploadError));
      return res.status(500).json({ error: uploadError.message, details: uploadError });
    }

    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(uniqueName);

    return res.status(200).json({ url: urlData.publicUrl, fileName: uniqueName });

  } catch (error) {
    console.error('Upload catch error:', error);
    return res.status(500).json({ error: error.message });
  }
}
