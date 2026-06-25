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

    const buffer     = Buffer.from(fileData, 'base64');
    const uniqueName = Date.now() + '-' + fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    console.log('Uploading:', uniqueName, 'size:', buffer.length, 'type:', fileType);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(uniqueName, buffer, {
        contentType: fileType || 'application/octet-stream',
        upsert: false
      });

    console.log('Upload data:', JSON.stringify(uploadData));
    console.log('Upload error:', JSON.stringify(uploadError));

    if (uploadError) {
      return res.status(500).json({ 
        error: uploadError.message, 
        details: uploadError,
        bucket: 'resumes',
        file: uniqueName
      });
    }

    // Use signed URL instead of public URL since bucket is private
    const { data: signedData, error: signedError } = await supabase.storage
      .from('resumes')
      .createSignedUrl(uniqueName, 60 * 60 * 24 * 365); // 1 year expiry

    console.log('Signed URL:', signedData?.signedUrl);
    console.log('Signed error:', JSON.stringify(signedError));

    return res.status(200).json({ 
      url: signedData?.signedUrl || uploadData?.path,
      fileName: uniqueName 
    });

  } catch (error) {
    console.error('Upload catch error:', error);
    return res.status(500).json({ error: error.message });
  }
}
