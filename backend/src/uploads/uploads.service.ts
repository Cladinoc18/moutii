import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { promises as fs } from 'fs';
import { extname, join } from 'path';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  readonly isCloudinaryConfigured: boolean;

  constructor() {
    this.isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_URL ||
        (process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET),
    );

    if (this.isCloudinaryConfigured) {
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          secure: true,
        });
      }
      this.logger.log('✔ Cloudinary configurado correctamente para almacenamiento de imágenes');
    } else {
      this.logger.warn(
        '⚠ Cloudinary no está configurado (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET). ' +
          'Usando almacenamiento local en /uploads (volátil en producción / Render).',
      );
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    if (this.isCloudinaryConfigured) {
      return this.uploadToCloudinary(file);
    }
    return this.saveToDisk(file);
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'mouti',
          resource_type: 'auto',
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            this.logger.error(`Error al subir a Cloudinary: ${error?.message}`);
            return reject(error || new Error('Fallo al subir imagen a Cloudinary'));
          }
          resolve({
            url: result.secure_url,
            filename: result.public_id,
            size: result.bytes,
          });
        },
      );
      stream.end(file.buffer);
    });
  }

  // ponytail: Fallback local para desarrollo sin cuenta Cloudinary configurada.
  // En producción (Render) el disco es efímero; se debe configurar Cloudinary.
  private async saveToDisk(file: Express.Multer.File): Promise<UploadResult> {
    const uploadDir = join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname).toLowerCase();
    const filename = `mouti-${uniqueSuffix}${ext}`;
    await fs.writeFile(join(uploadDir, filename), file.buffer);
    return {
      url: `/uploads/${filename}`,
      filename,
      size: file.buffer?.length ?? file.size,
    };
  }
}

