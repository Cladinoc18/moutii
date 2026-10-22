import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { StoreConfigService } from './store-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StoreConfig } from './schemas/store-config.schema';

@Controller('store-config')
export class StoreConfigController {
  constructor(private readonly storeConfigService: StoreConfigService) {}

  @Get()
  async getConfig() {
    return this.storeConfigService.getConfig();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put()
  async updateConfig(@Body() updateData: Partial<StoreConfig>) {
    return this.storeConfigService.updateConfig(updateData);
  }
}
