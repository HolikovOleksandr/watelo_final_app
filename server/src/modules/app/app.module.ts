import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import configuration from '../../config/configuration';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { BotService } from '../bot/bot.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    DatabaseModule,
    UserModule,
    AuthModule,
    ProductModule,
  ],
  providers: [BotService, ConfigService],
})
export class AppModule {}
