import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { StoreConfigModule } from '../store-config/store-config.module';
import { SeedService } from './seed.service';

@Module({
  imports: [UsersModule, ProductsModule, StoreConfigModule],
  providers: [SeedService],
})
export class SeedModule {}
