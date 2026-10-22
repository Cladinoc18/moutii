import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

const storage = diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname).toLowerCase();
    callback(null, `mouti-${uniqueSuffix}${ext}`);
  },
});

type MulterFilterCallback = (error: Error | null, acceptFile: boolean) => void;

const imageFilter = (
  req: unknown,
  file: Express.Multer.File,
  callback: MulterFilterCallback,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif|svg\+xml)$/)) {
    callback(
      new BadRequestException(
        'Solo se permiten imágenes (jpg, jpeg, png, webp, svg)',
      ),
      false,
    );
    return;
  }
  callback(null, true);
};

@Controller('uploads')
export class UploadsController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: imageFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadSingle(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo');
    }
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage,
      fileFilter: imageFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se enviaron archivos');
    }
    return files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
    }));
  }
}
