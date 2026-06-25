import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const form = formidable({ maxFileSize: 5 * 1024 * 1024 });
    const [, files] = await form.parse(req);
    const resumeFile = files.resume?.[0];

    if (!resumeFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = fs.readFileSync(resumeFile.filepath);
    const fileName   = Date.now() + '-' + resumeFile.originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, fileBuffer, {
        contentType: resumeFile.mimetype,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    return res.status(200).json({ url: urlData.publicUrl, fileName });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
}
