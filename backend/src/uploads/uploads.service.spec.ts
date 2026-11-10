import { UploadsService } from './uploads.service';
import * as assert from 'assert';
import { promises as fs } from 'fs';
import { join } from 'path';

describe('UploadsService', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('detects unconfigured Cloudinary and falls back to local storage', async () => {
    delete process.env.CLOUDINARY_URL;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    const service = new UploadsService();
    assert.strictEqual(service.isCloudinaryConfigured, false);

    const fakeFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test-sample.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test-image-data-binary'),
      size: 22,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    const result = await service.uploadFile(fakeFile);
    assert.ok(result.url.startsWith('/uploads/mouti-'), 'URL must start with /uploads/mouti-');
    assert.strictEqual(result.size, 22);

    // Verify file actually written to disk in local fallback
    const filePath = join(process.cwd(), result.url);
    const content = await fs.readFile(filePath);
    assert.strictEqual(content.toString(), 'test-image-data-binary');

    // Clean up test file
    await fs.unlink(filePath).catch(() => {});
  });

  it('detects configured Cloudinary credentials', () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
    process.env.CLOUDINARY_API_KEY = '123456';
    process.env.CLOUDINARY_API_SECRET = 'secret123';

    const service = new UploadsService();
    assert.strictEqual(service.isCloudinaryConfigured, true);
  });
});

