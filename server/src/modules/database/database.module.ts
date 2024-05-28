import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const env = configService.get<string>('env');

        const host = configService.get<string>('database.host');
        const port = configService.get<number>('database.port');
        const username = configService.get<string>('database.username');
        const password = configService.get<string>('database.password');
        const database = configService.get<string>('database.name');
        const testDatabase = configService.get<string>('database.testName');

        const isDevDb = env == 'test' ? testDatabase : database;
        console.log('Db in use: ', isDevDb);

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database: isDevDb,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
