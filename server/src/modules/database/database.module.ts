import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('database.host');
        const port = configService.get<number>('database.port');
        const username = configService.get<string>('database.username');
        const password = configService.get<string>('database.password');
        const database = configService.get<string>('database.name');

        console.log('Database Host:', host);
        console.log('Database Port:', port);
        console.log('Database Username:', username);
        console.log('Database Password:', password);
        console.log('Database Name:', database);

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true, // Вимкніть у виробничому середовищі
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
