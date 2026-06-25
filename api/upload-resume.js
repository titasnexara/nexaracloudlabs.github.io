import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { fileName, fileType, fileData } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64');
    const uniqueName = Date.now() + '-' + fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(uniqueName, buffer, {
        contentType: fileType || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(uniqueName);

    return res.status(200).json({ url: urlData.publicUrl, fileName: uniqueName });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
