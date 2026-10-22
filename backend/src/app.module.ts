import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { StoreConfigModule } from './store-config/store-config.module';
import { OrdersModule } from './orders/orders.module';
import { UploadsModule } from './uploads/uploads.module';
import { CategoriesModule } from './categories/categories.module';
import { CouponsModule } from './coupons/coupons.module';
import { SeedModule } from './seeds/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost:27017/mouti',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CouponsModule,
    StoreConfigModule,
    OrdersModule,
    UploadsModule,
    SeedModule,
  ],
})
export class AppModule {}
