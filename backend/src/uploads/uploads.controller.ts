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
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UploadsService } from './uploads.service';

const storage = memoryStorage();

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
  constructor(private readonly uploadsService: UploadsService) {}

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
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo');
    }
    return this.uploadsService.uploadFile(file);
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
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se enviaron archivos');
    }
    return Promise.all(
      files.map((file) => this.uploadsService.uploadFile(file)),
    );
  }
}
